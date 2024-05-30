<template>
  <div>
    <h1 class="mb-4">{{ tittleView }}</h1>
    <v-form ref="companyForm" @submit.prevent="saveCompany">
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            label="Nombre"
            variant="outlined"
            v-model="currentCompany.name"
            :rules="businessRules.name"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-select
            label="Estado"
            item-value="value"
            item-title="name"
            variant="outlined"
            :items="states"
            v-model="currentCompany.state"
            :rules="businessRules.state"
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
import { getCompanyById, updateCompany, createCompany } from "@/api/companies";
import router from "@/router";
import { CompanyState } from "@/types/Company";

const companyForm = ref();

const currentCompany = ref({
  state: CompanyState.ACTIVE,
  name: "",
});

const businessRules = ref({
  name: [(v) => !!v || "El nombre es requerido"],
  state: [(v) => !!v || "El estado es requerido"],
});

const states = [
  { name: "Activo", value: CompanyState.ACTIVE },
  { name: "Inactivo", value: CompanyState.INACTIVE },
];

const loading = ref(false);

const tittleView = computed(() => {
  const route = useRoute();
  return route.name === "company-create"
    ? "Crear nuevo negocio"
    : "Editar negocio";
});

const saveCompany = async () => {
  if (loading.value) return;

  const { valid } = await companyForm.value.validate();
  if (!valid) return;

  loading.value = true;

  if (currentCompany.value.id) {
    await updateCompany(currentCompany.value, currentCompany.value.id);
  } else {
    await createCompany(currentCompany.value);
  }

  router.push({ name: "companies" });
};

onMounted(async () => {
  const route = useRoute();
  if (route.name === "company-edit") {
    currentCompany.value = await getCompanyById(route.params.id);
  }
});
</script>
