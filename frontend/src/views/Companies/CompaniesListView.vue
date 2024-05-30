<!-- eslint-disable vue/valid-v-slot -->
<template>
  <div class="view">
    <h1 class="mb-2">Negocios</h1>
    <v-btn :to="{ name: 'company-create' }" color="primary" class="mb-4">Nuevo Negocio</v-btn>
    <v-card :loading="loading">
      <v-data-table :items="companies" :headers="headers">
        <template v-slot:item.state="{ value }">
          <v-chip :color="getStateColor(value)">
            {{ getStateName(value) }}
          </v-chip>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-icon
            color="primary"
            class="mr-2"
            @click="setCurrentCompanyHandler(item)"
          >
            mdi-eye-check
          </v-icon>
          <router-link
          class="mr-2"
          :to="{ name: 'company-edit', params: { id: getItemId(item) } }"
          >
            <v-icon color="orange">mdi-pencil</v-icon>
          </router-link>
          <v-dialog width="500">
            <template v-slot:activator="{ props }">
              <v-icon v-bind="props" color="red">mdi-trash-can</v-icon>
            </template>

            <template v-slot:default="{ isActive }">
              <v-card title="Eliminar negocio">
                <v-card-text>
                  <p>
                    Esta seguro que desea elminar el negocio
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
                      handlerDeleteCompany(getItemId(item));
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
import { useRouter } from "vue-router";
import { getAllCompanies, deleteCompany } from "@/api/companies";
import { CompanyState } from "@/types/Company";
import { setCurrentCompany } from "@/composables/useCurrentCompany";

const router = useRouter();

const headers = [
  { title: "Estado", key: "state", sortable: false, width: "150px" },
  {
    title: "Nombre",
    align: "start",
    sortable: false,
    key: "name",
  },
  { title: "Acciones", key: "actions", sortable: false, width: "150px" },
];

const companies = ref([]);
const loading = ref(false);

const getItemId = (item) => item.id || '___';

const getStateColor = (state) => {
  const colors = {
    [CompanyState.ACTIVE]: "green",
    [CompanyState.INACTIVE]: "red",
  };
  return colors[state];
};

const getStateName = (state) => {
  const names = {
    [CompanyState.ACTIVE]: "Activo",
    [CompanyState.INACTIVE]: "Inactivo",
  };
  return names[state];
};

const handlerDeleteCompany = async (id) => {
  if (loading.value) return;
  loading.value = true;
  await deleteCompany(id);
  companies.value = await getAllCompanies();
  loading.value = false;
};

const setCurrentCompanyHandler = (company) => {
  setCurrentCompany(company);
  router.push({ name: "users" });
};

onMounted(async () => {
  try {
    companies.value = await getAllCompanies();
  } catch (error) {
    console.log(error);
  }
});
</script>
