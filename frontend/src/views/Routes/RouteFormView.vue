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
          <v-dialog max-width="500">
            <template v-slot:activator="{ props: activatorProps }">
              <v-btn v-bind="activatorProps" block text="Agregar Cliente" color="green"></v-btn>
            </template>
            <template v-slot:default="{ isActive }">
              <v-card>
                <v-card-title>
                  Buscar y Agregar Clientes
                </v-card-title>

                <v-card-text>
                  <v-autocomplete
                    label="Clientes"
                    variant="outlined"
                    :items="displayClients"
                    v-model="selectedClient"
                    item-title="name"
                    item-value="id"
                    :rules="rules.clients"
                  ></v-autocomplete>
                </v-card-text>



                <v-card-actions>
                  <v-btn text="Cerrar" @click="isActive.value = false" color="danger"/>
                  <v-spacer></v-spacer>

                  <v-btn
                    v-if="selectedClient"
                    text="Agregar"
                    color="red"
                    @click="current.clients.push(selectedClient); selectedClient = null; isActive.value = false"
                  ></v-btn>
                </v-card-actions>
              </v-card>
            </template>
          </v-dialog>
          <!-- <v-autocomplete
            label="Clientes"
            variant="outlined"
            :items="displayClients"
            v-model="current.clients"
            item-title="name"
            item-value="id"
            multiple
          ></v-autocomplete> -->
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
              <change-client-index
                :index="index + 1"
                @changeIndex="changeClientPosition(index, $event)"
                @deleteClient="deleteClient(index)"
              ></change-client-index>
            </div>
            <div class="text-capitalize">{{ client.name }} <br> ({{ client.documentId }})</div>
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
import ChangeClientIndex from "@/components/ChangeClientIndex.vue";

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

const selectedClient = ref(null);

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

// eslint-disable-next-line no-unused-vars
const displayClients = computed(() => clients.value
  .filter((client) => city.value === client.city)
  .filter((client) => !current.value.clients.find((c) => c === client.id))
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

const changeClientPosition = (index, newIndex) => {
  const clients = JSON.parse(JSON.stringify(current.value.clients));
  const client = clients[index];
  clients.splice(index, 1);
  clients.splice(newIndex - 1, 0, client);
  current.value.clients = clients;
};

const deleteClient = (index) => {
  const clients = JSON.parse(JSON.stringify(current.value.clients));
  clients.splice(index, 1);
  current.value.clients = clients;
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
