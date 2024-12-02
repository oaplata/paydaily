<template>
  <v-dialog max-width="500" :disabled="!loan">
    <template v-slot:activator="{ props: activatorProps }">
      <v-card
        v-bind="activatorProps"
        :subtitle="clientAddress"
        :title="clientName"
        :color="!loan ? 'grey' : feesToday.length ? 'success' : 'orange-darken-1'"
      >
        <template v-slot:append>
          {{ paidToday }} / {{ loanFee }}
        </template>
      </v-card>
    </template>

    <template v-slot:default="{ isActive }">
      <v-card>
        <v-card-text>
          <div class="d-flex align-center">
            <div>
              <h6>
                GANA SALDO A LA FECHA CON EL PREMIO MAYOR DE LA LOTERIA DE SANTANDER
              </h6>
            </div>
            <div>
              <h1>
                {{ loanCardNumber }}
              </h1>
            </div>
          </div>
        </v-card-text>

        <v-card-text>
          <v-divider></v-divider>
          <v-row>
            <v-col cols="4">
              <h6>Fecha: </h6>
              <p class="text-caption">{{ loanDate }}</p>
            </v-col>
            <v-col cols="4">
              <h6>Total: </h6>
              <p class="text-caption">{{ loanAmount }}</p>
            </v-col>
            <v-col cols="4">
              <h6>Pago: </h6>
              <p class="text-caption">{{ loanFee }}</p>
            </v-col>
          </v-row>
          <v-divider></v-divider>
          <v-row class="mt-1">
            <v-col cols="12">
              <p class="text-caption"><b>Nombre:</b> {{ clientName }}</p>
              <p class="text-caption"><b>Direccion:</b> {{ clientAddress }}</p>
              <p class="text-caption"><b>Trabajo:</b> {{ clientJob }}</p>
              <p class="text-caption"><b>Telefono:</b> {{ clientPhone }}</p>
            </v-col>
          </v-row>
          <v-divider></v-divider>
          <v-row class="mt-1">
            <v-col cols="12">
              <v-table density="compact" >
                <thead>
                  <tr>
                    <th class="text-left">
                      Total cobrado
                    </th>
                    <th class="text-left">
                      Falta por cobrar
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      {{ loanCharged }} <v-btn color="primary" icon="mdi-eye-check-outline" size="x-small" variant="text" @click="showFees"></v-btn>
                    </td>
                    <td>
                      {{ loanRemaining }}
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </v-col>
            <v-col cols="12" v-if="showFeesValue">
              <v-table density="compact" >
                <thead>
                  <tr>
                    <th class="text-left">
                      Fecha
                    </th>
                    <th class="text-left">
                      Abono
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="fee of fees" :key="fee.id">
                    <td>
                      {{ formatedDate(fee.createdAt) }}
                    </td>
                    <td>
                      {{ formatedCurrency(fee.value) }}
                      <v-dialog max-width="500" v-if="currentUser && ['admin', 'super_admin'].includes(currentUser && currentUser.rol)">
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
                                Esta seguro que desea elminar la cuota
                                <b>{{ formatedCurrency(fee.value) }}</b>?
                              </p>
                            </v-card-text>

                            <v-card-actions>
                              <v-btn text="Borrar" @click="deleteFee(fee); isActive.value = false"></v-btn>
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
          </v-row>
          <v-divider></v-divider>
          <v-row class="mt-1" align="center">
            <v-col cols="8">
              <v-text-field
                label="Cuota a pagar"
                v-model="feeToPay"
                variant="outlined"
                dense
                type="number"
              >
              </v-text-field>
            </v-col>
            <v-col cols="4">
              <v-btn
                color="primary"
                :disabled="+feeToPay <= 0 || +feeToPay > +loan.remaining || isDayClose"
                @click="addFee"
                icon="mdi-currency-usd"
              ></v-btn>
            </v-col>
          </v-row>
        </v-card-text>


        <v-card-actions>
          <v-btn v-if="currentUser && ['admin', 'super_admin'].includes(currentUser && currentUser.rol)" text="Editar" :to="{ name: 'loans-edit', params: { id: loan.id }}"/>
          <v-spacer></v-spacer>
          <v-btn text="Cerrar" @click="isActive.value = false" />
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>
<script setup>
import { getClientById } from '@/api/clients';
import {
  getLoanByClientAndRoute,
  addLoanFee,
  updateLoan,
  getLoanFees,
  getFeeById,
  deleteLoanFee,
  getLoanFeesByDate
} from '@/api/loans';
import { addUserBalance } from '@/api/users';
import { currentCompany } from '@/composables/useCurrentCompany';
import { currentUser } from '@/composables/useUser';
import { formatedCurrency } from '@/utils/currency';
import { formatedDate } from '@/utils/date';
import { watch } from 'vue';
import { ref } from 'vue';
import { computed, onMounted, defineProps, defineEmits } from 'vue';

const props = defineProps(["client", "route", "debtCollectorId"]);
const emits = defineEmits(["getBalances", "update:loan-value", "update:charge-value", "update:remaining-value"]);

const clientId = computed(() => props.client);
const routeId = computed(() => props.route);
// eslint-disable-next-line no-unused-vars
const debtCollectorId = computed(() => props.debtCollectorId);

const client = ref(null);
const loan = ref(null);
const feeToPay = ref(0);
const showFeesValue = ref(false);
const fees = ref([]);
const feesToday = ref([]);
const loadingAddFee = ref(false);

const isDayClose = ref(true);

const clientName = computed(() => client.value?.name);
// const clientDocumentId = computed(() => client.value?.documentId);
const clientAddress = computed(() => client.value?.address);
const clientPhone = computed(() => client.value?.phone);
const clientJob = computed(() => client.value?.job);

const paidToday = computed(() => formatedCurrency(feesToday.value.reduce((acc, fee) => acc + (+fee.value), 0)));
const loanFee = computed(() => formatedCurrency(loan.value?.feeValue));
const loanAmount = computed(() => formatedCurrency(loan.value?.amount));
const loanDate = computed(() => formatedDate(loan.value?.createdAt));
const loanCardNumber = computed(() => loan.value?.cardNumber);
const loanCharged = computed(() => formatedCurrency(loan.value?.charged));
const loanRemaining = computed(() => formatedCurrency(loan.value?.remaining));

watch(loanAmount, () => {
  emits('update:loan-value', +loan.value?.amount || 0);
}, { immediate: true });

watch(loanCharged, () => {
  emits('update:charge-value', +loan.value?.charged || 0);
}, { immediate: true });

watch(loanRemaining, () => {
  emits('update:remaining-value', +loan.value?.remaining || 0);
}, { immediate: true });

const showFees = () => {
  showFeesValue.value = !showFeesValue.value;
  getFees();
}

const getFees = async () => {
  if (fees.value.length) return;
  fees.value = await getLoanFees({ companyId: currentCompany.value.id, loanId: loan.value.id });
  fees.value = fees.value.sort((a, b) => new Date(b.createdAt.seconds * 1000 + b.createdAt.nanoseconds / 1000000) - new Date(a.createdAt.seconds * 1000 + a.createdAt.nanoseconds / 1000000));
}

const addFee = async () => {
  if (loadingAddFee.value) return;
  loadingAddFee.value = true;
  const { id: feeId } = await addLoanFee({ companyId: currentCompany.value.id, loanId: loan.value.id, value: feeToPay.value });
  loan.value.charged = Number(loan.value.charged) + Number(feeToPay.value);
  loan.value.remaining = Number(loan.value.remaining) - Number(feeToPay.value);

  const fee = await getFeeById({ companyId: currentCompany.value.id, loanId: loan.value.id, feeId: feeId});
  fees.value.push(fee);
  fees.value = fees.value.sort((a, b) => new Date(b.createdAt.seconds * 1000 + b.createdAt.nanoseconds / 1000000) - new Date(a.createdAt.seconds * 1000 + a.createdAt.nanoseconds / 1000000));

  await updateLoan({ companyId: currentCompany.value.id, loanId: loan.value.id, loan: {
    charged: loan.value.charged,
    remaining: loan.value.remaining,
    state: loan.value.remaining === 0 ? 'paid' : 'active'
  }});

  await addUserBalance({
    companyId: currentCompany.value.id,
    userId: debtCollectorId.value,
    balance: {
      value: +feeToPay.value,
      type: 'loanFee',
      description: `Cobro de cuota de ${clientName.value}`
    }
  });
  loadingAddFee.value = false;
  feeToPay.value = 0;
  emits('getBalances');
}

const deleteFee = async (fee) => {
  await deleteLoanFee({ companyId: currentCompany.value.id, loanId: loan.value.id, feeId: fee.id})
  loan.value.charged = Number(loan.value.charged) - Number(fee.value);
  loan.value.remaining = Number(loan.value.remaining) + Number(fee.value);
  loan.value.state = loan.value.remaining === 0 ? 'paid' : 'active';
  fees.value = fees.value.filter((f) => f.id !== fee.id);
  await updateLoan({ companyId: currentCompany.value.id, loanId: loan.value.id, loan: {
    charged: loan.value.charged,
    remaining: loan.value.remaining,
    state: loan.value.state
  }});

  await addUserBalance({
    companyId: currentCompany.value.id,
    userId: debtCollectorId.value,
    balance: {
      value: -fee.value,
      type: 'loanFee',
      description: `Eliminacion de cuota de ${clientName.value}`
    }
  });

  emits('getBalances');
};

const validateDayClose = () => {
  const today = new Date();
  const hour = today.getHours();
  isDayClose.value = hour >= 18;
}



onMounted(async () => {
  validateDayClose();
  setInterval(validateDayClose, 1000 * 60 * 2);
  client.value = await getClientById({ companyId: currentCompany.value.id, id: clientId.value });
  loan.value = await getLoanByClientAndRoute({ companyId: currentCompany.value.id, clientId: clientId.value, routeId: routeId.value });

  if (loan.value) {
    const startToday = new Date();
    startToday.setHours(0, 0, 0, 0);
  
    const endToday = new Date();
    endToday.setHours(23, 59, 59, 999);
  
    feesToday.value = await getLoanFeesByDate({
      companyId: currentCompany.value.id,
      loanId: loan.value.id,
      startDate: startToday,
      endDate: endToday,
    });
  }
});
</script>