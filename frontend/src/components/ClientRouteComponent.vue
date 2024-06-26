<template>
  <v-dialog max-width="500" :disabled="!loan">
    <template v-slot:activator="{ props: activatorProps }">
      <v-card
        v-bind="activatorProps"
        :subtitle="clientDocumentId"
        :title="clientName"
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
                :disabled="+feeToPay <= 0 || +feeToPay > +loan.remaining"
                @click="addFee"
                icon="mdi-currency-usd"
              ></v-btn>
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
</template>
<script setup>
import { getClientById } from '@/api/clients';
import { getLoanByClientAndRoute, addLoanFee, updateLoan, getLoanFees, getFeeById } from '@/api/loans';
import { addUserBalance } from '@/api/users';
import { currentCompany } from '@/composables/useCurrentCompany';
import { formatedCurrency } from '@/utils/currency';
import { formatedDate } from '@/utils/date';
import { ref } from 'vue';
import { computed, onMounted, defineProps, defineEmits } from 'vue';

const props = defineProps(["client", "route", "debtCollectorId"]);
const emits = defineEmits(["getBalances"]);

const clientId = computed(() => props.client);
const routeId = computed(() => props.route);
const debtCollectorId = computed(() => props.debtCollectorId);

const client = ref(null);
const loan = ref(null);
const feeToPay = ref(0);
const showFeesValue = ref(false);
const fees = ref([]);

const clientName = computed(() => client.value?.name);
const clientDocumentId = computed(() => client.value?.documentId);
const clientAddress = computed(() => client.value?.address);
const clientPhone = computed(() => client.value?.phone);
const clientJob = computed(() => client.value?.job);

const paidToday = computed(() => formatedCurrency(0));
const loanFee = computed(() => formatedCurrency(loan.value?.feeValue));
const loanAmount = computed(() => formatedCurrency(loan.value?.amount));
const loanDate = computed(() => formatedDate(loan.value?.createdAt));
const loanCardNumber = computed(() => loan.value?.cardNumber);
const loanCharged = computed(() => formatedCurrency(loan.value?.charged));
const loanRemaining = computed(() => formatedCurrency(loan.value?.remaining));

const showFees = () => {
  showFeesValue.value = !showFeesValue.value;
  getFees();
}

const getFees = async () => {
  if (fees.value.length) return;
  fees.value = await getLoanFees({ companyId: currentCompany.value.id, loanId: loan.value.id });
}

const addFee = async () => {
  const { id: feeId } = await addLoanFee({ companyId: currentCompany.value.id, loanId: loan.value.id, value: feeToPay.value });
  loan.value.charged = Number(loan.value.charged) + Number(feeToPay.value);
  loan.value.remaining = Number(loan.value.remaining) - Number(feeToPay.value);

  const fee = await getFeeById({ companyId: currentCompany.value.id, loanId: loan.value.id, feeId: feeId});
  fees.value.push(fee);

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

  emits('getBalances');
}

onMounted(async () => {
  client.value = await getClientById({ companyId: currentCompany.value.id, id: clientId.value });
  loan.value = await getLoanByClientAndRoute({ companyId: currentCompany.value.id, clientId: clientId.value, routeId: routeId.value });
});
</script>