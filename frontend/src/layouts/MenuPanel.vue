<template>
  <v-navigation-drawer v-model="drawer" :rail="rail" :permanent="permanent">
    <v-list
      class="hidden-sm-and-down"
      density="compact"
      nav
      @click="setRail(false)"
    >
      <v-list-item prepend-icon="mdi-menu">
        <template v-slot:append>
          <v-btn
            variant="text"
            icon="mdi-chevron-left"
            @click.stop="setRail(true)"
          ></v-btn>
        </template>
      </v-list-item>
    </v-list>

    <v-divider></v-divider>

    <v-list density="compact" nav>
      <v-list-item
        v-if="currentUser?.rol === UserRol.SUPER_ADMIN"
        prepend-icon="mdi-domain"
        title="Negocios"
        value="Negocios"
        :to="{ name: 'companies' }"
      ></v-list-item>
      <v-list-item
        v-if="currentUser && currentCompany && [UserRol.SUPER_ADMIN, UserRol.ADMIN].includes(currentUser.rol)"
        prepend-icon="mdi-account-group"
        title="Clientes"
        value="Clientes"
        :to="{ name: 'clients' }"
      ></v-list-item>
      <!-- <v-list-item
        v-if="currentUser && currentCompany"
        prepend-icon="mdi-motorbike"
        title="Motos"
        value="Motos"
        :to="{ name: 'motorcycles' }"
      ></v-list-item> -->
      <v-list-item
        v-if="currentUser && currentCompany"
        prepend-icon="mdi-routes"
        title="Rutas"
        value="Rutas"
        :to="{ name: 'routes' }"
      ></v-list-item>
      <v-list-item
        v-if="currentUser && currentCompany && [UserRol.SUPER_ADMIN, UserRol.ADMIN].includes(currentUser.rol)"
        prepend-icon="mdi-cash-multiple"
        title="Prestamos"
        value="Prestamos"
        :to="{ name: 'loans' }"
      ></v-list-item>
      <v-list-item
        v-if="currentUser && currentCompany && [UserRol.SUPER_ADMIN, UserRol.ADMIN].includes(currentUser.rol)"
        prepend-icon="mdi-cash-multiple"
        title="Contabilidad"
        value="Contabilidad"
        :to="{ name: 'accounting' }"
      ></v-list-item>
      <!-- <v-list-item
        v-if="currentUser && [UserRol.SUPER_ADMIN, UserRol.ADMIN].includes(currentUser.rol) && currentBusiness"
        prepend-icon="mdi-account-group"
        title="Clientes"
        value="Clientes"
        :to="{ name: 'ClientsList' }"
      ></v-list-item> -->
    </v-list>
  </v-navigation-drawer>
</template>
<script setup>
import { onMounted } from "vue";
import useDrawer from "./UseDrawer";
import { UserRol } from "@/types/User"; 
import { currentUser } from "@/composables/useUser";
import { currentCompany } from "@/composables/useCurrentCompany";

const {
  drawer,
  rail,
  permanent,
  setDrawer,
  setRail,
  setPermanent,
} = useDrawer();

const onResizeWindow = () => {
  if (window.innerWidth < 960) {
    setDrawer(false);
    setRail(false);
    setPermanent(false);
  } else {
    setDrawer(true);
    setRail(true);
    setPermanent(true);
  }
};

onMounted(() => {
  onResizeWindow();
  window.addEventListener("resize", onResizeWindow);
});
</script>
