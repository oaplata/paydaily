<template>
  <div>
    <h1 class="mb-4">{{ tittleView }}</h1>
    <v-form ref="formRef" @submit.prevent="save">
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            label="Nombre"
            variant="outlined"
            v-model="current.name"
            :rules="rules.name"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-select
            label="Ciudad"
            item-value="value"
            item-title="name"
            variant="outlined"
            :items="cities"
            v-model="current.city"
            :rules="rules.city"
          ></v-select>
        </v-col>
        <v-col cols="12" md="6">
          <v-select
            label="Cobrador"
            item-value="id"
            item-title="name"
            variant="outlined"
            :items="users"
            v-model="current.debtCollector"
            :rules="rules.debtCollector"
          ></v-select>
        </v-col>
        <v-col cols="12" md="6">
          <v-select
            label="Estado"
            item-value="value"
            item-title="name"
            variant="outlined"
            :items="states"
            v-model="current.state"
            :rules="rules.state"
          ></v-select>
        </v-col>
        <v-col cols="12">
          <v-autocomplete
            label="Clientes"
            variant="outlined"
            :items="displayClients"
            v-model="current.clients"
            item-title="name"
            item-value="id"
            multiple
          ></v-autocomplete>
        </v-col>
      </v-row>
      <v-divider class="my-4"></v-divider>
      <v-list :items="selectedClients">
        <v-list-item
          v-for="(client, index) in selectedClients"
          :key="client.id"
        >
          <div class="d-flex align-center">
            <div>
              <v-btn
                color="green-lighten-2"
                icon="mdi-arrow-up-bold"
                variant="text"
                size="x-small"
                :disabled="index === 0"
                @click="changeClientPosition(index, -1)"
              ></v-btn>
              <v-btn
                color="red-lighten-2"
                icon="mdi-arrow-down-bold"
                variant="text"
                size="x-small"
                :disabled="index === selectedClients.length - 1"
                @click="changeClientPosition(index, 1)"
              ></v-btn>
            </div>
            <div>{{ client.name }} ({{ client.documentId }})</div>
          </div>
        </v-list-item>
      </v-list>
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
import { onMounted, ref, computed, watch } from "vue";
import { useRoute } from "vue-router";
import { getRouteById, createRoute, updateRoute } from "@/api/routes";
import { getAllClients } from "@/api/clients";
import { getAllUsers } from "@/api/users";
import router from "@/router";
import { RouteState } from "@/types/Route";
import { currentCompany } from "@/composables/useCurrentCompany";

const clients = ref([]);
const users = ref([]);
const formRef = ref();

const current = ref({
  state: RouteState.ACTIVE,
  city: "",
  name: "",
  debtCollector: "",
  clients: [],
});

const rules = ref({
  name: [(v) => !!v || "El nombre es requerido"],
  city: [(v) => !!v || "La ciudad es requerida"],
  debtCollector: [(v) => !!v || "El cobrador es requerido"],
  clients: [
    (v) => !!v || "Los clientes son requeridos",
    (v) => v.length > 0 || "Debe seleccionar al menos un cliente",
  ],
});

const states = [
  { name: "Activa", value: RouteState.ACTIVE },
  { name: "Inactiva", value: RouteState.INACTIVE },
];

const cities = [
  { name: "Bucaramanga", value: "Bucaramanga" },
  { name: "Santa Marta", value: "Santa Marta" },
]

const loading = ref(false);

const tittleView = computed(() => {
  const route = useRoute();
  return route.name === "route-create"
    ? "Crear nueva ruta"
    : "Editar ruta";
});

const city = computed(() => current.value.city);
const selectedClients = computed(() => current.value.clients.map((client) => clients.value.find((c) => c.id === client)));

const displayClients = computed(() => clients.value
  .filter((client) => city.value === client.city)
  .map((client) => ({
    name: `${client.name} - (${client.documentId})`,
    id: client.id,
  })
));

watch(city, () => current.value.clients = []);

const save = async () => {
  if (loading.value) return;

  const { valid } = await formRef.value.validate();
  if (!valid) return;

  loading.value = true;

  if (current.value.id) {
    await updateRoute({ route: current.value, id: current.value.id, companyId: currentCompany.value.id });
  } else {
    await createRoute({ route: current.value, companyId: currentCompany.value.id });
  }

  router.push({ name: "routes" });
};

const changeClientPosition = (index, direction) => {
  const newIndex = index + direction;

  const temp = JSON.parse(JSON.stringify(current.value.clients));
  const tempClient = temp[index];

  temp[index] = temp[newIndex];
  temp[newIndex] = tempClient;

  current.value.clients = temp;
};

onMounted(() => {
  const route = useRoute();
  getAllClients({ companyId: currentCompany.value.id }).then((data) => clients.value = data);
  getAllUsers(currentCompany.value.id).then((data) => users.value = data);
  if (route.name === "route-edit") {
    getRouteById({ id: route.params.id, companyId: currentCompany.value.id })
      .then((data) => {
        const clients = data.clients;
        current.value = data;
        setTimeout(() => {
          current.value.clients = clients;
        }, 100);
      });
  }
});
</script>
