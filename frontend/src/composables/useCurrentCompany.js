import { ref } from "vue";

export const currentCompany = ref(null);
const localStorageKey = "currentCompany";

export const setCurrentCompany = (company) => {
  currentCompany.value = company;
  if (company) localStorage.setItem(localStorageKey, JSON.stringify(company));
  else localStorage.removeItem(localStorageKey);
};

export const loadCurrentCompany = () => {
  const company = localStorage.getItem(localStorageKey);
  if (company) currentCompany.value = JSON.parse(company);
};
