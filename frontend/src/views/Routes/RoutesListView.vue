<!-- eslint-disable vue/valid-v-slot -->
<template>
  <div class="view">
    <h1 class="mb-2">Rutas</h1>
    <v-btn v-if="currentUser && ['admin', 'super_admin'].includes(currentUser && currentUser.rol)" :to="{ name: 'route-create' }" color="primary" class="mb-4">
      Nueva Ruta
    </v-btn>
    <v-card :loading="loading">
      <v-data-table :items="displayItems" :headers="headers">
        <template v-slot:item.state="{ value }">
          <v-chip :color="getStateColor(value)">
            {{ getStateName(value) }}
          </v-chip>
        </template>
        <template v-slot:item.actions="{ item }">
          <router-link
            class="mr-2"
            :to="{ name: 'route-path', params: { id: getItemId(item) } }"
          >
            <v-icon color="green">mdi-map-marker-path</v-icon>
          </router-link>
          <router-link
            class="mr-2"
            :to="{ name: 'route-edit', params: { id: getItemId(item) } }"
            v-if="currentUser && ['admin', 'super_admin'].includes(currentUser && currentUser.rol)"
          >
            <v-icon color="orange">mdi-pencil</v-icon>
          </router-link>
          <v-dialog width="500" v-if="currentUser && ['admin', 'super_admin'].includes(currentUser && currentUser.rol)">
            <template v-slot:activator="{ props }">
              <v-icon v-bind="props" color="red">mdi-trash-can</v-icon>
            </template>

            <template v-slot:default="{ isActive }">
              <v-card title="Eliminar cliente">
                <v-card-text>
                  <p>
                    Esta seguro que desea elminar la ruta
                    <b>{{ item.name }}</b
                    >?
                  </p>
                </v-card-text>

                <v-card-actions>
                  <v-spacer></v-spacer>

                  <v-btn
                    text="Cancelar"
                    variant="text"
                    color="primary"
                    @click="isActive.value = false"
                  ></v-btn>
                  <v-btn
                    variant="elevated"
                    color="primary"
                    @click="
                      handlerDelete(getItemId(item));
                      isActive.value = false;
                    "
                  >
                    Eliminar
                  </v-btn>
                </v-card-actions>
              </v-card>
            </template>
          </v-dialog>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>
<script setup>
import { ref, onMounted, computed } from "vue";
import { getAllRoutes, deleteRoute } from "@/api/routes";
import { RouteState } from "@/types/Route";
import { currentCompany } from "@/composables/useCurrentCompany";
import { currentUser } from "@/composables/useUser";

const headers = [
  { title: "Estado", key: "state", sortable: false, width: "150px" },
  {
    title: "Nombre",
    align: "start",
    sortable: false,
    key: "name",
  },
  {
    title: "Ciudad",
    align: "start",
    sortable: false,
    key: "city",
  },
  {
    title: "Cobrador",
    align: "start",
    sortable: false,
    key: "debtCollector",
  },
  {
    title: "Clientes",
    align: "start",
    sortable: false,
    key: "clientsCount",
  },
  { title: "Acciones", key: "actions", sortable: false, width: "150px" },
];

const items = ref([]);
const loading = ref(false);

const displayItems = computed(() => {
  if (currentUser.value && ['admin', 'super_admin'].includes(currentUser.value.rol)) return items.value;
  return items.value.filter((item) => item.debtCollector === currentUser.value.id);
})

const getItemId = (item) => item.id || "___";

const getStateColor = (state) => {
  const colors = {
    [RouteState.ACTIVE]: "green",
    [RouteState.INACTIVE]: "red",
  };
  return colors[state];
};

const getStateName = (state) => {
  const names = {
    [RouteState.ACTIVE]: "Activa",
    [RouteState.INACTIVE]: "Inactiva",
  };
  return names[state];
};

const handlerDelete = async (id) => {
  if (loading.value) return;
  loading.value = true;
  await deleteRoute({ id, companyId: currentCompany.value.id });
  items.value = await getAllRoutes({ companyId: currentCompany.value.id });
  loading.value = false;
};

onMounted(async () => {
  try {
    items.value = await getAllRoutes({ companyId: currentCompany.value.id });
    items.value = items.value.map((item) => ({
      ...item,
      clientsCount: item.clients.length,
    }));
  } catch (error) {
    console.log(error);
  }
});
</script>
