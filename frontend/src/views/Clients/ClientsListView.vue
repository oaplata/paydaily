<!-- eslint-disable vue/valid-v-slot -->
<template>
  <div class="view">
    <h1 class="mb-2">Clientes</h1>
    <v-btn :to="{ name: 'client-create' }" color="primary" class="mb-4"
      >Nuevo Cliente</v-btn
    >
    <v-card :loading="loading">
      <v-data-table :items="clients" :headers="headers">
        <template v-slot:item.state="{ value }">
          <v-chip :color="getStateColor(value)">
            {{ getStateName(value) }}
          </v-chip>
        </template>
        <template v-slot:item.actions="{ item }">
          <router-link
            class="mr-2"
            :to="{ name: 'client-edit', params: { id: getItemId(item) } }"
          >
            <v-icon color="orange">mdi-pencil</v-icon>
          </router-link>
          <v-dialog width="500">
            <template v-slot:activator="{ props }">
              <v-icon v-bind="props" color="red">mdi-trash-can</v-icon>
            </template>

            <template v-slot:default="{ isActive }">
              <v-card title="Eliminar cliente">
                <v-card-text>
                  <p>
                    Esta seguro que desea elminar el cliente
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
                      handlerDeleteClient(getItemId(item));
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
import { ref, onMounted } from "vue";
import { getAllClients, deleteClient } from "@/api/clients";
import { ClientState } from "@/types/Client";
import { currentCompany } from "@/composables/useCurrentCompany";

const headers = [
  { title: "Estado", key: "state", sortable: false, width: "150px" },
  {
    title: "Nombre",
    align: "start",
    sortable: false,
    key: "name",
  },
  {
    title: "Cedula",
    align: "start",
    sortable: false,
    key: "documentId",
  },
  {
    title: "Dirección",
    align: "start",
    sortable: false,
    key: "address",
  },
  {
    title: "Teléfono",
    align: "start",
    sortable: false,
    key: "phone",
  },
  {
    title: "Trabajo",
    align: "start",
    sortable: false,
    key: "job",
  },
  {
    title: "Ciudad",
    align: "start",
    sortable: false,
    key: "city",
  },
  { title: "Acciones", key: "actions", sortable: false, width: "150px" },
];

const clients = ref([]);
const loading = ref(false);

const getItemId = (item) => item.id || "___";

const getStateColor = (state) => {
  const colors = {
    [ClientState.ACTIVE]: "green",
    [ClientState.INACTIVE]: "red",
    [ClientState.BLOCKED]: "black",
  };
  return colors[state];
};

const getStateName = (state) => {
  const names = {
    [ClientState.ACTIVE]: "Activo",
    [ClientState.INACTIVE]: "Inactivo",
    [ClientState.BLOCKED]: "Bloqueado",
  };
  return names[state];
};

const handlerDeleteClient = async (id) => {
  if (loading.value) return;
  loading.value = true;
  await deleteClient({ id, companyId: currentCompany.value.id });
  clients.value = await getAllClients({ companyId: currentCompany.value.id });
  loading.value = false;
};

onMounted(async () => {
  try {
    clients.value = await getAllClients({ companyId: currentCompany.value.id });
  } catch (error) {
    console.log(error);
  }
});
</script>
