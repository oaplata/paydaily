<template>
  <v-card max-width="400" class="mx-auto" :elevation="0">
    <v-card-text class="text-h5 py-2">
      <v-form ref="form" v-model="valid" lazy-validation>
        <v-text-field
          v-model="email"
          :rules="emailRules"
          label="Correo"
          required
          variant="outlined"
        ></v-text-field>
        <v-text-field
          v-model="password"
          :rules="passwordRules"
          label="Contraseña"
          type="password"
          required
          variant="outlined"
        ></v-text-field>
        <v-btn block :disabled="!valid" :loading="loading" @click="validate" color="primary">Iniciar sesión</v-btn>
      </v-form>
    </v-card-text>
  </v-card>
</template>
<script setup>
import { ref } from "vue";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import firebaseApp from "@/firebase";

const auth = getAuth(firebaseApp);

const emailRules = [
  (v) => !!v || "Correo es requerido",
  (v) => /.+@.+\..+/.test(v) || "Correo debe ser válido",
];

const passwordRules = [
  (v) => !!v || "Contraseña es requerida",
];

const email = ref("");
const password = ref("");
const valid = ref(false);
const loading = ref(false);

const validate = async () => {
  if (loading.value) return;

  loading.value = true;

  try {
    await signInWithEmailAndPassword(auth, email.value, password.value)
  } catch (error) {
    console.error(error);
  }

  loading.value = false;
};

</script>
