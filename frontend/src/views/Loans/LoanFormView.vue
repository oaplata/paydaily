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
import { addUserBalance, getAllUsers } from "@/api/users";
import { getRoutesByClientId } from "@/api/routes";
import { createLoan } from "@/api/loans";
import { currentCompany } from "@/composables/useCurrentCompany";
import router from "@/router";

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
  cardNumber: [(v) => !!v || 'El numero de tarjeta es requerido'],
  term: [(v) => !!v || 'El plazo es requerido'],
  interest: [(v) => !!v || 'El interes es requerido'],
  feeValue: [(v) => !!v || 'El valor de la cuota es requerido'],
  client: [(v) => !!v || 'El cliente es requerido'],
  lender: [(v) => !!v || 'El prestamista es requerido'],
  collector: [(v) => !!v || 'El cobrador es requerido'],
};

const clientSelected = computed(() => current.value.client);
const clientSelectedObject = computed(() => clients.value.find(client => client.id === clientSelected.value));

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

  await createLoan({ companyId: currentCompany.value.id, loan: current.value })
  loading.value = false;

  await addUserBalance({
    userId: current.value.lender,
    balance: {
      value: +current.value.amount * -1,
      type: 'loan',
      description: `Prestamo a ${clientSelectedObject.value.name}`
    }
  });

  router.push({ name: 'routes' });
};

onMounted(() => {
  getAllClients({ companyId: currentCompany.value.id }).then(data => clients.value = data);
  getAllUsers(currentCompany.value.id).then(data => users.value = data);
});

</script>

