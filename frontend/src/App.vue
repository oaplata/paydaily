<template>
  <RouterView />
</template>

<script setup>
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { onAuthStateChanged } from "firebase/auth";
import getFirebaseAuth from "@/composables/useAuth";
import { awaitUser } from "@/composables/useUser";
import { loadCurrentCompany } from "@/composables/useCurrentCompany";

const route = useRoute();
const router = useRouter();

onMounted(() => {
  const auth = getFirebaseAuth();
  onAuthStateChanged(auth, (user) => {
    if (user) awaitUser();
    if (user) loadCurrentCompany();
    if (user && route.name === "login") {
      router.push({ name: "home" });
    } else if (!user && route.name !== "login") {
      router.push({ name: "login" });
    }
  });
});
</script>
