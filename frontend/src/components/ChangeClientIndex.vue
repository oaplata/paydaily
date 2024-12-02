<template>
  <div class="change-client-index">
    <input type="number" :value="props.index" ref="input">
    <v-btn
      class="mx-1"
      color="primary"
      icon="mdi-check-all"
      variant="text"
      size="x-small"
      @click="changeIndex"
    ></v-btn>
    <v-dialog max-width="500">
      <template v-slot:activator="{ props: activatorProps }">
        <v-btn
          v-bind="activatorProps"
          color="red"
          icon="mdi-trash-can-outline"
          variant="text"
          size="x-small"
        ></v-btn>
      </template>

      <template v-slot:default="{ isActive }">
        <v-card>
          <v-card-text>
            Esta seguro que desea eliminar el cliente?
          </v-card-text>

          <v-card-actions>
            <v-btn text="No" @click="isActive.value = false" color="danger"/>
            <v-spacer></v-spacer>

            <v-btn
              text="Si"
              color="red"
              @click="$emit('deleteClient')"
            ></v-btn>
          </v-card-actions>
        </v-card>
      </template>
    </v-dialog>
  </div>
</template>
<script setup>
import { defineProps, defineEmits, ref } from 'vue';

const props = defineProps({
  index: Number,
});

const emit = defineEmits(['changeIndex', 'deleteClient']);

const input = ref();

const changeIndex = () => {
  const value = input.value.value;
  if (value) {
    emit('changeIndex', value);
  }
};
</script>
<style scoped>
input {
  width: 30px;
  border-bottom: solid 1px #000;

  /* Ocultar controles en navegadores basados en WebKit (Chrome, Safari, Edge) */
  -webkit-appearance: none;
  appearance: none;

  /* Ocultar controles en Firefox */
  -moz-appearance: textfield;

  /* Asegurar que el diseño sea consistente */
  outline: none;
}

input[type="number"]::-webkit-inner-spin-button, 
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield; /* Firefox */
  appearance: none; /* Otros navegadores modernos */
}

.change-client-index {
  display: flex;
  align-items: center;
  width: 100px;
}
</style>