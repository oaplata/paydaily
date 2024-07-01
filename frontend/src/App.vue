<template>
  <RouterView />
</template>

<script setup>
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { onAuthStateChanged } from "firebase/auth";
import getFirebaseAuth from "@/composables/useAuth";
import { awaitUser, currentUser } from "@/composables/useUser";
import { loadCurrentCompany, currentCompany, setCurrentCompany } from "@/composables/useCurrentCompany";
import { getAllCompanies } from "./api/companies";

const route = useRoute();
const router = useRouter();

onMounted(() => {
  const auth = getFirebaseAuth();
  onAuthStateChanged(auth, (user) => {
    if (user) awaitUser().then(() => valiateUser());
    if (user) loadCurrentCompany();
    if (user && route.name === "login") {
      router.push({ name: "home" });
    } else if (!user && route.name !== "login") {
      router.push({ name: "login" });
    }
  });
});

const valiateUser = async () => {
  if (currentUser.value.rol !== 'super_admin' && !currentCompany.value?.id) {
    const companies = await getAllCompanies();
    const userCompany = currentUser.value.companies[0];
    const company = companies.find((company) => company.id === userCompany);
    setCurrentCompany(company);
  }
};
</script>
