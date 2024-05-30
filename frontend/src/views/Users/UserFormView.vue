<template>
  <div>
    <h1 class="mb-4">{{ tittleView }}</h1>
    <v-form ref="userForm" @submit.prevent="saveUser">
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            label="Nombre"
            variant="outlined"
            v-model="currentUser.name"
            :rules="userRules.name"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            label="Correo Electrónico"
            variant="outlined"
            v-model="currentUser.email"
            :rules="userRules.email"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            label="Contraseña"
            variant="outlined"
            type="password"
            v-model="currentUser.password"
            :rules="userRules.password"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            label="Confirmar Contraseña"
            variant="outlined"
            type="password"
            v-model="currentUser.password2"
            :rules="userRules.password2"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-select
            label="Estado"
            item-value="value"
            item-title="name"
            variant="outlined"
            :items="states"
            v-model="currentUser.state"
            :rules="userRules.state"
          ></v-select>
        </v-col>
        <v-col cols="12" md="6">
          <v-select
            label="Rol"
            item-value="value"
            item-title="name"
            variant="outlined"
            :items="roles"
            v-model="currentUser.rol"
            :rules="userRules.rol"
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
import { onMounted, ref } from "vue";
import { computed } from "vue";
import { useRoute } from "vue-router";
import { getUserById, updateUser, createUser } from "@/api/users";
import router from "@/router";
import { UserState, UserRol } from "@/types/User";

const userForm = ref();

const currentUser = ref({
  state: UserState.ACTIVE,
  name: "",
});

const userRules = ref({
  name: [(v) => !!v || "El nombre es requerido"],
  state: [(v) => !!v || "El estado es requerido"],
  rol: [(v) => !!v || "El rol es requerido"],
  email: [
    (v) => !!v || "El email es requerido",
    (v) => /.+@.+\..+/.test(v) || "El email debe ser válido",
  ],
  password: [(v) => !!v || "La contraseña es requerida"],
  password2: [
    (v) => !!v || "La confirmación de contraseña es requerida",
    (v) => v === currentUser.value.password || "Las contraseñas no coinciden",
  ],
});

const states = [
  { name: "Activo", value: UserState.ACTIVE },
  { name: "Inactivo", value: UserState.INACTIVE },
  { name: "Bloqueado", value: UserState.BLOCKED },
];

const roles = [
  { name: "Administrador", value: UserRol.ADMIN },
  { name: "Cobrador", value: UserRol.DEBT_COLLECTOR },
  { name: "Prestamista", value: UserRol.LENDER },
];

const loading = ref(false);

const tittleView = computed(() => {
  const route = useRoute();
  return route.name === "user-create"
    ? "Crear nuevo usuario"
    : "Editar usuario";
});

const saveUser = async () => {
  if (loading.value) return;

  const { valid } = await userForm.value.validate();
  if (!valid) return;

  loading.value = true;

  if (currentUser.value.id) {
    await updateUser(currentUser.value, currentUser.value.id);
  } else {
    await createUser(currentUser.value);
  }

  router.push({ name: "users" });
};

onMounted(async () => {
  const route = useRoute();
  if (route.name === "user-edit") {
    currentUser.value = await getUserById(route.params.id);
  }
});
</script>
