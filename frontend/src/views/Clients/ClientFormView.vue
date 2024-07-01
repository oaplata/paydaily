<template>
  <div>
    <h1 class="mb-4">{{ tittleView }}</h1>
    <v-form ref="clientForm" @submit.prevent="saveClient">
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            label="Nombre"
            variant="outlined"
            v-model="currentClient.name"
            :rules="clientRules.name"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            label="Cedula"
            variant="outlined"
            v-model="currentClient.documentId"
            :rules="clientRules.documentId"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            label="Dirección"
            variant="outlined"
            v-model="currentClient.address"
            :rules="clientRules.address"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            label="Teléfono"
            variant="outlined"
            v-model="currentClient.phone"
            :rules="clientRules.phone"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            label="Trabajo"
            variant="outlined"
            v-model="currentClient.job"
            :rules="clientRules.job"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-select
            label="Ciudad"
            item-value="value"
            item-title="name"
            variant="outlined"
            :items="cities"
            v-model="currentClient.city"
            :rules="clientRules.city"
          ></v-select>
        </v-col>
        <v-col cols="12" md="6">
          <v-select
            label="Estado"
            item-value="value"
            item-title="name"
            variant="outlined"
            :items="states"
            v-model="currentClient.state"
            :rules="clientRules.state"
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
import { getClientById, createClient, updateClient } from "@/api/clients";
import router from "@/router";
import { ClientState } from "@/types/Client";
import { currentCompany } from "@/composables/useCurrentCompany";

const clientForm = ref();

const currentClient = ref({
  state: ClientState.ACTIVE,
  name: "",
});

const clientRules = ref({
  name: [(v) => !!v || "El nombre es requerido"],
  documentId: [(v) => !!v || "La cedula es requerida"],
  address: [(v) => !!v || "La dirección es requerida"],
  phone: [(v) => !!v || "El teléfono es requerido"],
  job: [(v) => !!v || "El trabajo es requerido"],
  city: [(v) => !!v || "La ciudad es requerida"],
  state: [(v) => !!v || "El estado es requerido"],
});

const states = [
  { name: "Activo", value: ClientState.ACTIVE },
  { name: "Inactivo", value: ClientState.INACTIVE },
  { name: "Bloqueado", value: ClientState.BLOCKED },
];

const cities = [
  { name: "Bucaramanga", value: "Bucaramanga" },
  { name: "Santa Marta", value: "Santa Marta" },
]

const loading = ref(false);

const tittleView = computed(() => {
  const route = useRoute();
  return route.name === "client-create"
    ? "Crear nuevo cliente"
    : "Editar cliente";
});

const saveClient = async () => {
  if (loading.value) return;

  const { valid } = await clientForm.value.validate();
  if (!valid) return;

  loading.value = true;

  if (currentClient.value.id) {
    await updateClient({ client: currentClient.value, id: currentClient.value.id, companyId: currentCompany.value.id });
  } else {
    await createClient({ client: currentClient.value, companyId: currentCompany.value.id });
  }

  router.push({ name: "clients" });
};

onMounted(async () => {
  const route = useRoute();
  if (route.name === "client-edit") {
    currentClient.value = await getClientById({ id: route.params.id, companyId: currentCompany.value.id });
  }
});
</script>
