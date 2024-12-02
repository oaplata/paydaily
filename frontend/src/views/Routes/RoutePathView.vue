<template>
  <div>
    <h2>Ruta {{ routeName }}</h2>
    <v-divider></v-divider>
    <p class="my-2">Cuidad: {{ routeCity }}</p>
    <v-divider></v-divider>
    <p class="my-2">Cobrador: {{ routeDebtCollector }}</p>
    <template v-if="currentUser && ['admin', 'super_admin'].includes(currentUser && currentUser.rol)">
      <v-divider></v-divider>
      <p class="my-2">
        Prestado: {{ loanValueOnRoute }}
      </p>
      <v-divider></v-divider>
      <p class="my-2">
        Cobrado: {{ chargeValueOnRoute }}
      </p>
      <v-divider></v-divider>
      <p class="my-2">
        Pendiente: {{ remainingValueOnRoute }}
      </p>
    </template>
    <v-divider></v-divider>
    <p class="my-2">
      Saldo: {{ formattedBalance }}
      <v-dialog max-width="500">
        <template v-slot:activator="{ props: activatorProps }">
          <v-btn
            v-bind="activatorProps"
            class="ma-2"
            color="primary"
            icon="mdi-eye-check-outline"
          ></v-btn>
        </template>

        <template v-slot:default="{ isActive }">
          <v-card title="Movimientos del dia">
            <v-card-text>
              <v-row class="mt-1">
                <v-col cols="12">
                  <v-table density="compact" >
                    <thead>
                      <tr>
                        <th class="text-left">
                          Valor
                        </th>
                        <th class="text-left">
                          Descripccion
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="b of balances" :key="b.id">
                        <td>
                          {{ formatedCurrency(b.value) }}
                        </td>
                        <td>
                          {{ b.description }}
                          <v-dialog max-width="500" v-if="currentUser && ['admin', 'super_admin'].includes(currentUser && currentUser.rol) && ['Calle', 'Rifa', 'Renovacion', 'Mora', 'Prestamo', 'Gasto', 'Efectivo'].includes(b.type)">
                            <template v-slot:activator="{ props: activatorProps }">
                              <v-btn
                                v-bind="activatorProps"
                                color="red"
                                icon="mdi-minus"
                                variant="text"
                                size="x-small"
                              ></v-btn>
                            </template>

                            <template v-slot:default="{ isActive }">
                              <v-card title="Eliminar Cuota">
                                <v-card-text>
                                  <p>
                                    Esta seguro que desea elminar el movimiento
                                    <b>{{ b.description }} {{ formatedCurrency(b.value) }}</b>?
                                  </p>
                                </v-card-text>

                                <v-card-actions>
                                  <v-btn text="Borrar" @click="deleteBalance(b); isActive.value = false"></v-btn>
                                  <v-spacer></v-spacer>
                                  <v-btn
                                    text="Cerrar"
                                    @click="isActive.value = false"
                                  ></v-btn>
                                </v-card-actions>
                              </v-card>
                            </template>
                          </v-dialog>   
                        </td>
                      </tr>
                    </tbody>
                  </v-table>
                </v-col>
                <v-col cols="12" v-if="currentUser && ['admin', 'super_admin'].includes(currentUser && currentUser.rol)">
                  <v-text-field
                    label="Valor"
                    v-model="balanceTosave"
                    variant="outlined"
                    dense
                    type="number"
                  >
                  </v-text-field>
                  <v-select
                    label="Tipo"
                    variant="outlined"
                    :items="['Calle', 'Rifa', 'Renovacion', 'Mora', 'Prestamo', 'Gasto', 'Efectivo']"
                    v-model="balanceTypeToSave"
                  ></v-select>
                  <v-text-field
                    v-if="balanceTypeToSave === 'Gasto'"
                    label="Descripccion"
                    v-model="balanceDescriptionToSave"
                    variant="outlined"
                    dense
                  >
                  </v-text-field>
                  <v-btn
                    color="primary"
                    @click="saveBalance"
                    :disabled="!balanceTosave || !balanceTypeToSave || (balanceTypeToSave === 'Gasto' && !balanceDescriptionToSave)"
                  >
                    Guardar
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>

              <v-btn
                text="Cerrar"
                @click="isActive.value = false"
              ></v-btn>
            </v-card-actions>
          </v-card>
        </template>
      </v-dialog>
    </p>
    <v-divider></v-divider>
    <h3 class="my-2">Clientes: </h3>
    <v-divider></v-divider>
    <template v-if="currentUser && ['admin', 'super_admin'].includes(currentUser && currentUser.rol)">
      <v-text-field placeholder="Buscar Cliente" v-model="search"></v-text-field>
      <v-divider></v-divider>
    </template>
    <template v-for="(client, index) of clients" :key="client">
      <ClientRouteComponent
        :client="client"
        :route="routeId"
        :debtCollectorId="routeDebtCollectorId"
        :search="search"
        @update:loan-value="loanValues[index] = $event"
        @update:charge-value="chargeValues[index] = $event"
        @update:remaining-value="remainingValues[index] = $event"
        @getBalances="getBalances"
      />
      <div class="my-2"></div>
    </template>
    <!-- <p>{{ route }}</p> -->
  </div>
</template>
<script setup>
import { onMounted, ref, computed } from "vue";
import { useRoute } from "vue-router";
import { getRouteById } from "@/api/routes";
import { addUserBalance, getUserBalanceToday, getUserById, deleteUserBalance } from "@/api/users";
import { currentCompany } from "@/composables/useCurrentCompany";
import ClientRouteComponent from "@/components/ClientRouteComponent.vue";
import { formatedCurrency } from "@/utils/currency";
import { currentUser } from "@/composables/useUser";

const route = ref(null);
const balances = ref([]);

const loanValues = ref([]);
const chargeValues = ref([]);
const remainingValues = ref([]);

const balanceTosave = ref(0);
const balanceTypeToSave = ref('');
const balanceDescriptionToSave = ref('');

const search = ref('');

const routeId = computed(() => route.value?.id);
const routeName = computed(() => route.value?.name);
const routeCity = computed(() => route.value?.city);
const routeDebtCollector = computed(() => route.value?.debtCollector?.name);
const routeDebtCollectorId = computed(() => route.value?.debtCollector?.id);
const balance = computed(() => balances.value.reduce((acc, balance) => acc + balance.value, 0));
const clients = computed(() => route.value?.clients || []);
// get balance formatted to currency
const formattedBalance = computed(() => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(balance.value).replace(/COP/g, '');
})

const saveBalance = async () => {
  let factor = 1;

  if (balanceTypeToSave.value === 'Gasto' || balanceTypeToSave.value === 'Prestamo' || balanceTypeToSave.value === 'Efectivo') {
    factor = -1;
  }

  await addUserBalance({
    userId: routeDebtCollectorId.value,
    balance: {
      value: +balanceTosave.value * factor,
      type: balanceTypeToSave.value,
      description: balanceDescriptionToSave.value || balanceTypeToSave.value,
    }
  });
  getBalances()
  balanceTosave.value = 0;
  balanceTypeToSave.value = '';
  balanceDescriptionToSave.value = '';
};

const getBalances = async () => {
  balances.value = await getUserBalanceToday({ userId: route.value.debtCollector.id });
};

const loanValueOnRoute = computed(() => formatedCurrency(loanValues.value.reduce((acc, value) => acc + value, 0)));
const chargeValueOnRoute = computed(() => formatedCurrency(chargeValues.value.reduce((acc, value) => acc + value, 0)));
const remainingValueOnRoute = computed(() => formatedCurrency(remainingValues.value.reduce((acc, value) => acc + value, 0)));

const deleteBalance = async (balance) => {
  deleteUserBalance({ userId: routeDebtCollectorId.value, id: balance.id });
  getBalances();
};

onMounted(async () => {
  const id = useRoute().params.id;
  route.value = await getRouteById({ companyId: currentCompany.value.id, id });
  route.value.debtCollector = await getUserById(route.value.debtCollector);
  loanValues.value = new Array(route.value.clients.length).fill(0);
  chargeValues.value = new Array(route.value.clients.length).fill(0);
  remainingValues.value = new Array(route.value.clients.length).fill(0);
  getBalances();
  // route.value.clients = await Promise.all(route.value.clients.map((client) => getClientById({ companyId: currentCompany.value.id, id: client })));
});


</script>