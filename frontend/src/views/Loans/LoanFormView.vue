<template>
  <div>
    <h1 class="mb-4">Crear un prestamo</h1>
    <v-form ref="formRef" @submit.prevent="save">
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            label="Monto"
            type="number"
            variant="outlined"
            :rules="rules.amount"
            v-model="current.amount"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            label="Numero de tarjeta"
            type="number"
            variant="outlined"
            :rules="rules.cardNumber"
            v-model="current.cardNumber"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            label="Plazo"
            type="number"
            variant="outlined"
            :rules="rules.term"
            v-model="current.term"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            label="Interes"
            type="number"
            variant="outlined"
            :rules="rules.interest"
            v-model="current.interest"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            label="Valor Cuota"
            type="number"
            variant="outlined"
            :rules="rules.feeValue"
            v-model="current.feeValue"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-autocomplete
            label="Cliente"
            variant="outlined"
            item-title="name"
            item-value="id"
            :items="clients"
            :rules="rules.client"
            v-model="current.client"            
          ></v-autocomplete>
        </v-col>
        <v-col cols="12" md="6">
          <v-select
            label="Prestamista"
            item-value="id"
            item-title="name"
            variant="outlined"
            :items="lenders"
            :rules="rules.lender"
            v-model="current.lender"
          ></v-select>
        </v-col>
        <v-col cols="12" md="6">
          <v-select
            label="Cobrador"
            item-value="id"
            item-title="name"
            variant="outlined"
            :items="collectors"
            :rules="rules.collector"
            v-model="current.collector"
          ></v-select>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" md="2" offset-md="10">
          <v-btn block color="primary" type="submit" :loading="loading">
            Guardar
          </v-btn>
        </v-col>
      </v-row>
    </v-form>
  </div>
</template>
<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { getAllClients } from "@/api/clients";
import { getAllUsers } from "@/api/users";
import { getRoutesByClientId } from "@/api/routes";
import { createLoan, getLoanById, updateLoan } from "@/api/loans";
import { currentCompany } from "@/composables/useCurrentCompany";
import router from "@/router";
import { useRoute } from 'vue-router';

const route = useRoute();

const formRef = ref();

const clients = ref([]);
const users = ref([]);
const routes = ref([]);

const loading = ref(false);

const current = ref({
  amount: 0,
  cardNumber: 0,
  term: 0,
  interest: 0,
  feeValue: 0,
  client: null,
  lender: null,
  collector: null,
});

const rules = {
  amount: [(v) => !!v || 'El monto es requerido'],
  cardNumber: [],
  term: [(v) => !!v || 'El plazo es requerido'],
  interest: [(v) => !!v || 'El interes es requerido'],
  feeValue: [(v) => !!v || 'El valor de la cuota es requerido'],
  client: [(v) => !!v || 'El cliente es requerido'],
  lender: [],
  collector: [(v) => !!v || 'El cobrador es requerido'],
};

const clientSelected = computed(() => current.value.client);

watch(clientSelected, () => {
  if (clientSelected.value) {
    getRoutesByClientId({ clientId: clientSelected.value, companyId: currentCompany.value.id }).then(data => routes.value = data);
  }
});

const collectors = computed(() => routes.value.map(route => ({
  id: route.id,
  name: users.value.find(user => user.id === route.debtCollector).name,
})));

const lenders = computed(() => users.value);

const save = async () => {
  if (loading.value) return;

  const { valid } = await formRef.value.validate();
  if (!valid) return;

  loading.value = true;

  if (route.name === 'loans-edit') {
    const amount = +current.value.amount;
    const charged = +current.value.charged;
    const remaining = +current.value.remaining;

    if (!charged) current.value.charged = 0;
    if (!remaining) current.value.remaining = amount;

    if (charged && remaining) {
      current.value.remaining = amount - charged;
    }

    await updateLoan({ companyId: currentCompany.value.id, loan: current.value, loanId: route.params.id })
  } else {
    await createLoan({ companyId: currentCompany.value.id, loan: current.value })
  }

  loading.value = false;

  router.push({ name: 'routes' });
};

onMounted(() => {
  if (route.name === 'loans-edit') {
    getLoanById({ companyId: currentCompany.value.id, loanId: route.params.id }).then(data => current.value = data)
  }
  getAllClients({ companyId: currentCompany.value.id }).then(data => clients.value = data);
  getAllUsers(currentCompany.value.id).then(data => users.value = data);
});
</script>

