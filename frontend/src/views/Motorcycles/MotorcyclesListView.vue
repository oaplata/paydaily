<!-- eslint-disable vue/valid-v-slot -->
<template>
  <div class="view">
    <h1 class="mb-2">Motos</h1>
    <v-btn :to="{ name: 'motorcycle-create' }" color="primary" class="mb-4"
      >Nueva Moto</v-btn
    >
    <v-card :loading="loading">
      <v-data-table :items="items" :headers="headers">
        <template v-slot:item.state="{ value }">
          <v-chip :color="getStateColor(value)">
            {{ getStateName(value) }}
          </v-chip>
        </template>
        <template v-slot:item.actions="{ item }">
          <router-link
            class="mr-2"
            :to="{ name: 'motorcycle-edit', params: { id: getItemId(item) } }"
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
                    Esta seguro que desea elminar la moto
                    <b>{{ item.brand }} ({{ item.plate }})</b
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
import { ref, onMounted } from "vue";
import { getAllMotorcycles, deleteMotorcycle } from "@/api/motorcycles";
import { MotorcycleState } from "@/types/Motorcycle";
import { currentCompany } from "@/composables/useCurrentCompany";

const headers = [
  { title: "Estado", key: "state", sortable: false, width: "150px" },
  {
    title: "Marca",
    align: "start",
    sortable: false,
    key: "brand",
  },
  {
    title: "Referencia",
    align: "start",
    sortable: false,
    key: "reference",
  },
  {
    title: "Modelo",
    align: "start",
    sortable: false,
    key: "model",
  },
  {
    title: "Kilometraje",
    align: "start",
    sortable: false,
    key: "mileage",
  },
  {
    title: "Color",
    align: "start",
    sortable: false,
    key: "color",
  },
  {
    title: "Placa",
    align: "start",
    sortable: false,
    key: "plate",
  },
  {
    title: "Valor ($)",
    align: "start",
    sortable: false,
    key: "value",
  },
  { title: "Acciones", key: "actions", sortable: false, width: "150px" },
];

const items = ref([]);
const loading = ref(false);

const getItemId = (item) => item.id || "___";

const getStateColor = (state) => {
  const colors = {
    [MotorcycleState.IN_STORAGE]: "orange",
    [MotorcycleState.ON_LOAN]: "green",
    [MotorcycleState.IN_WORKSHOP]: "red",
    [MotorcycleState.IN_YARD]: "black",
  };
  return colors[state];
};

const getStateName = (state) => {
  const names = {
    [MotorcycleState.IN_STORAGE]: "En bodega",
    [MotorcycleState.ON_LOAN]: "En prestamo",
    [MotorcycleState.IN_WORKSHOP]: "En taller",
    [MotorcycleState.IN_YARD]: "En patio",
  };
  return names[state];
};

const handlerDelete = async (id) => {
  if (loading.value) return;
  loading.value = true;
  await deleteMotorcycle({ id, companyId: currentCompany.value.id });
  items.value = await getAllMotorcycles({ companyId: currentCompany.value.id });
  loading.value = false;
};

onMounted(async () => {
  try {
    items.value = await getAllMotorcycles({ companyId: currentCompany.value.id });
  } catch (error) {
    console.log(error);
  }
});
</script>
