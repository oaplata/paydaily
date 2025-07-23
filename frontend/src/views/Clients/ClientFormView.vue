<template>
  <div>
    <h1 class="mb-4">{{ tittleView }}</h1>
    <v-form ref="clientForm" @submit.prevent="saveClient">
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            label="Nombre"
            variant="outlined"
            v-model="currentClient.name"
            :rules="clientRules.name"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            label="Cedula"
            variant="outlined"
            v-model="currentClient.documentId"
            :rules="clientRules.documentId"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            label="Dirección"
            variant="outlined"
            v-model="currentClient.address"
            :rules="clientRules.address"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            label="Teléfono"
            variant="outlined"
            v-model="currentClient.phone"
            :rules="clientRules.phone"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            label="Trabajo"
            variant="outlined"
            v-model="currentClient.job"
            :rules="clientRules.job"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-select
            label="Ciudad"
            item-value="value"
            item-title="name"
            variant="outlined"
            :items="cities"
            v-model="currentClient.city"
            :rules="clientRules.city"
          ></v-select>
        </v-col>
        <v-col cols="12" md="6">
          <v-select
            label="Estado"
            item-value="value"
            item-title="name"
            variant="outlined"
            :items="states"
            v-model="currentClient.state"
            :rules="clientRules.state"
          ></v-select>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" md="2" offset-md="8">
          <v-dialog max-width="600">
            <template v-slot:activator="{ props: activatorProps }">
              <v-btn block color="primary" type="button" :loading="loading" v-bind="activatorProps">
                Ver Creditos
              </v-btn>
            </template>

            <template v-slot:default="{ isActive }">
              <v-card :title="'Historial de creditos'">
                <v-card-text>
                  <v-card v-for="loan of clientLoans" :key="loan.id" class="mt-2">
                    <v-card-title>
                      <v-row>
                        <v-col cols="8">
                          <span>$ {{ formatedCurrencyFn(loan.amount) }}</span>
                        </v-col>
                        <v-col cols="4" class="text-right">
                          <v-chip :color="getLoanStatusColor(loan.state)">
                            {{ getLoanStatusText(loan.state) }}
                          </v-chip>
                        </v-col>
                      </v-row>
                    </v-card-title>
                    <v-card-text>
                      <span>{{ formatedDate(loan.createdAt) }}</span>
                    </v-card-text>
                    <v-card-text>
                      <v-row>
                        <v-col>
                          <b>Cobrado: </b> <br>
                          <span>${{ formatedCurrencyFn(loan.charged) }}</span>
                        </v-col>
                        <v-col>
                          <b>Saldo: </b> <br>
                          <span>${{ formatedCurrencyFn(loan.remaining) }}</span>
                        </v-col>
                        <v-col>
                          <b>Ruta: </b> <br>
                          <span>{{ users.find(u => u.id === loan.collector) && users.find(u => u.id === loan.collector).name }}</span>
                        </v-col>
                      </v-row>
                    </v-card-text>
                    <v-card-actions v-if="loan.state === 'active'">
                      <v-btn text :to="{ name: 'loans-edit', params: { id: loan.id }}">Editar</v-btn>
                      <v-spacer></v-spacer>
                      <v-btn text @click="cancellLoanFn(loan.id)">Cancelar</v-btn>
                    </v-card-actions>
                    <v-card-actions v-if="loan.state === 'cancelled'">
                      <v-spacer></v-spacer>
                      <v-btn text @click="activeLoanFn(loan.id)">Activar</v-btn>
                    </v-card-actions>
                  </v-card>
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
          
        </v-col>
        <v-col cols="12" md="2">
          <v-btn block color="primary" type="submit" :loading="loading">
            Guardar
          </v-btn>
        </v-col>
      </v-row>
    </v-form>
  </div>
</template>
<script setup>
import { onMounted, ref } from "vue";
import { computed } from "vue";
import { useRoute } from "vue-router";
import { getClientById, createClient, updateClient } from "@/api/clients";
import router from "@/router";
import { ClientState } from "@/types/Client";
import { currentCompany } from "@/composables/useCurrentCompany";
import { activeLoan, cancellLoan, getLoansByClient } from "@/api/loans";
import { formatedCurrency } from "@/utils/currency";
import { formatedDate } from "@/utils/date";
import { getAllRoutes } from "@/api/routes";

const clientForm = ref();

const currentClient = ref({
  state: ClientState.ACTIVE,
  name: "",
});

const clientLoans = ref([]);
const users = ref([]);

const getLoanStatusText = (status) => {
  switch (status) {
    case "active":
      return "Activo";
    case "paid":
      return "Pagado";
    case "cancelled":
      return "Cancelado";
    default:
      return "Desconocido";
  }
};

const getLoanStatusColor = (status) => {
  switch (status) {
    case "active":
      return "info";
    case "paid":
      return "success";
    case "cancelled":
      return "error";
    default:
      return "grey";
  }
};

const clientRules = ref({
  name: [(v) => !!v || "El nombre es requerido"],
  documentId: [(v) => !!v || "La cedula es requerida"],
  address: [(v) => !!v || "La dirección es requerida"],
  phone: [(v) => !!v || "El teléfono es requerido"],
  job: [(v) => !!v || "El trabajo es requerido"],
  city: [(v) => !!v || "La ciudad es requerida"],
  state: [(v) => !!v || "El estado es requerido"],
});

const states = [
  { name: "Activo", value: ClientState.ACTIVE },
  { name: "Inactivo", value: ClientState.INACTIVE },
  { name: "Bloqueado", value: ClientState.BLOCKED },
];

const cities = [
  { name: "Bucaramanga", value: "Bucaramanga" },
  { name: "Santa Marta", value: "Santa Marta" },
]

const loading = ref(false);

const tittleView = computed(() => {
  const route = useRoute();
  return route.name === "client-create"
    ? "Crear nuevo cliente"
    : "Editar cliente";
});

const saveClient = async () => {
  if (loading.value) return;

  const { valid } = await clientForm.value.validate();
  if (!valid) return;

  loading.value = true;

  if (currentClient.value.id) {
    await updateClient({ client: currentClient.value, id: currentClient.value.id, companyId: currentCompany.value.id });
  } else {
    await createClient({ client: currentClient.value, companyId: currentCompany.value.id });
  }

  router.push({ name: "clients" });
};

const cancellLoanFn = async (id) => {
  await cancellLoan({ loanId: id, companyId: currentCompany.value.id });
  clientLoans.value = await getLoansByClient({ clientId: currentClient.value.id, companyId: currentCompany.value.id });
};

const activeLoanFn = async (id) => {
  await activeLoan({ loanId: id, companyId: currentCompany.value.id });
  clientLoans.value = await getLoansByClient({ clientId: currentClient.value.id, companyId: currentCompany.value.id });
};

const formatedCurrencyFn = (value) => {
  return formatedCurrency(value);
};

onMounted(async () => {
  const route = useRoute();
  if (route.name === "client-edit") {
    currentClient.value = await getClientById({ id: route.params.id, companyId: currentCompany.value.id });
    clientLoans.value = await getLoansByClient({ clientId: currentClient.value.id, companyId: currentCompany.value.id });
    users.value = await getAllRoutes({ companyId: currentCompany.value.id });
  }
});
</script>
