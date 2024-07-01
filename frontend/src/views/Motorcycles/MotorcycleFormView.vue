<template>
  <div>
    <h1 class="mb-4">{{ tittleView }}</h1>
    <v-form ref="formRef" @submit.prevent="save">
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            label="Marca"
            variant="outlined"
            v-model="current.brand"
            :rules="rules.brand"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            label="Referencia"
            variant="outlined"
            v-model="current.reference"
            :rules="rules.reference"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            label="Modelo"
            variant="outlined"
            v-model="current.model"
            :rules="rules.model"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            label="Kilometraje"
            variant="outlined"
            v-model="current.mileage"
            :rules="rules.mileage"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            label="Color"
            variant="outlined"
            v-model="current.color"
            :rules="rules.color"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            label="Placa"
            variant="outlined"
            v-model="current.plate"
            :rules="rules.plate"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            label="Valor ($)"
            variant="outlined"
            type="number"
            v-model="current.value"
            :rules="rules.value"
          />
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
import { getMotorcycleById, createMotorcycle, updateMotorcycle } from "@/api/motorcycles";
import router from "@/router";
import { MotorcycleState } from "@/types/Motorcycle";
import { currentCompany } from "@/composables/useCurrentCompany";

const formRef = ref();

const current = ref({
  state: MotorcycleState.IN_STORAGE,
});

const rules = ref({
  brand: [(v) => !!v || "La marca es requerida"],
  reference: [(v) => !!v || "La referencia es requerida"],
  model: [(v) => !!v || "El modelo es requerido"],
  mileage: [(v) => !!v || "El kilometraje es requerido"],
  color: [(v) => !!v || "El color es requerido"],
  plate: [(v) => !!v || "La placa es requerida"],
  value: [(v) => !!v || "El valor es requerido"],
  state: [(v) => !!v || "El estado es requerido"],

});

const states = [
  { name: "En almacen", value: MotorcycleState.IN_STORAGE },
  { name: "En prestamo", value: MotorcycleState.ON_LOAN },
  { name: "En taller", value: MotorcycleState.IN_WORKSHOP },
  { name: "En patios", value: MotorcycleState.IN_YARD },
];

const loading = ref(false);

const tittleView = computed(() => {
  const route = useRoute();
  return route.name === "motorcycle-create"
    ? "Crear nueva moto"
    : "Editar moto";
});

const save = async () => {
  if (loading.value) return;

  const { valid } = await formRef.value.validate();
  if (!valid) return;

  loading.value = true;

  if (current.value.id) {
    await updateMotorcycle({ motorcycle: current.value, id: current.value.id, companyId: currentCompany.value.id });
  } else {
    await createMotorcycle({ motorcycle: current.value, companyId: currentCompany.value.id });
  }

  router.push({ name: "motorcycles" });
};

onMounted(async () => {
  const route = useRoute();
  if (route.name === "motorcycle-edit") {
    current.value = await getMotorcycleById({ id: route.params.id, companyId: currentCompany.value.id });
  }
});
</script>
