<template>
  <v-app>
    <v-layout>
      <Menu />
      <v-app-bar title="Paga diario">
        <template v-slot:prepend>
          <v-btn
            class="hidden-md-and-up"
            icon="mdi-menu"
            @click="showMenu"
          ></v-btn>
        </template>
        <template v-slot:append>
          <v-menu>
            <template v-slot:activator="{ props }">
              <span
                v-bind="props"
                class="px-4"
              >
                {{ currentUser?.name }}
              </span>
            </template>
            <v-list>
              <v-list-item @click="logout">
                <v-list-item-title>Cerrar sesión</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
      </v-app-bar>
      <v-main>
        <v-container fluid>
          <router-view />
        </v-container>
      </v-main>
    </v-layout>
  </v-app>
</template>

<script setup>
import Menu from "./MenuPanel";
import useDrawer from "./UseDrawer";
import { currentUser, logout } from "@/composables/useUser";

const { setDrawer, setRail } = useDrawer();

const showMenu = () => {
  setDrawer(true);
  setRail(false);
};
</script>
