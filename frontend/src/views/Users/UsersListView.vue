<!-- eslint-disable vue/valid-v-slot -->
<template>
  <div class="view">
    <h1 class="mb-2">Usuarios</h1>
    <v-btn :to="{ name: 'company-create' }" color="primary" class="mb-4">Nuevo Usuario</v-btn>
    <v-card :loading="loading">
      <v-data-table :items="users" :headers="headers">
        <template v-slot:item.state="{ value }">
          <v-chip :color="getStateColor(value)">
            {{ getStateName(value) }}
          </v-chip>
        </template>
        <template v-slot:item.rol="{ value }">
          {{ getRolName(value) }}
        </template>
        <template v-slot:item.actions="{ item }">
          <router-link
            class="mr-2"
            :to="{ name: 'user-edit', params: { id: getItemId(item) } }"
          >
            <v-icon color="orange">mdi-pencil</v-icon>
          </router-link>
          <v-dialog width="500">
            <template v-slot:activator="{ props }">
              <v-icon v-bind="props" color="red">mdi-trash-can</v-icon>
            </template>

            <template v-slot:default="{ isActive }">
              <v-card title="Eliminar usuario">
                <v-card-text>
                  <p>
                    Esta seguro que desea elminar el usuario
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
                      handlerDeleteUser(getItemId(item));
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
import { getAllUsers, deleteUser } from "@/api/users";
import { UserState, UserRol } from "@/types/User";
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
    title: "Rol",
    align: "start",
    sortable: false,
    key: "rol",
  },
  {
    title: "Correo Electrónico",
    align: "start",
    sortable: false,
    key: "email",
  },
  { title: "Acciones", key: "actions", sortable: false, width: "150px" },
];

const users = ref([]);
const loading = ref(false);

const getItemId = (item) => item.id || '___';

const getStateColor = (state) => {
  const colors = {
    [UserState.ACTIVE]: "green",
    [UserState.INACTIVE]: "red",
    [UserState.BLOCKED]: "black"
  };
  return colors[state];
};

const getRolName = (rol) => {
  const names = {
    [UserRol.ADMIN]: "Administrador",
    [UserRol.SUPER_ADMIN]: "Super Administrador",
    [UserRol.DEBT_COLLECTOR]: "Cobrador",
    [UserRol.LENDER]: "Prestamista",
  };
  return names[rol];
};

const getStateName = (state) => {
  const names = {
    [UserState.ACTIVE]: "Activo",
    [UserState.INACTIVE]: "Inactivo",
    [UserState.BLOCKED]: "Bloqueado"
  };
  return names[state];
};

const handlerDeleteUser = async (id) => {
  if (loading.value) return;
  loading.value = true;
  await deleteUser(id);
  users.value = await getAllUsers(currentCompany.value.id);
  loading.value = false;
};

onMounted(async () => {
  try {
    users.value = await getAllUsers(currentCompany.value.id);
  } catch (error) {
    console.log(error);
  }
});
</script>
