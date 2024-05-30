import { createWebHistory, createRouter } from "vue-router";
import { getAuth } from "firebase/auth";
import firebaseApp from "@/firebase";

const auth = getAuth(firebaseApp);
const routes = [
  {
    path: "/",
    name: "auth-layout",
    component: () => import("@/layouts/AuthLayout.vue"),
    beforeEnter: async (to, from, next) => {
      await auth.authStateReady();
      if (auth.currentUser) {
        next({ name: "home" });
      } else {
        next();
      }
    },
    children: [
      {
        path: "",
        name: "login",
        component: () => import("@/views/LoginView.vue"),
      },
    ],
  },
  {
    path: "/panel",
    name: "panel-layout",
    component: () => import("@/layouts/PanelLayout.vue"),
    beforeEnter: async (to, from, next) => {
      await auth.authStateReady();
      if (!auth.currentUser) {
        next({ name: "login" });
      } else {
        next();
      }
    },
    children: [
      {
        path: "",
        name: "home",
        component: () => import("@/views/HomeView.vue"),
      },
      {
        path: "companies",
        name: "companies",
        component: () => import("@/views/Companies/CompaniesListView.vue"),
      },
      {
        path: "companies/:id",
        name: "company-edit",
        component: () => import("@/views/Companies/CompanyFormView.vue"),
      },
      {
        path: "companies/create",
        name: "company-create",
        component: () => import("@/views/Companies/CompanyFormView.vue"),
      },
      {
        path: "users",
        name: "users",
        component: () => import("@/views/Users/UsersListView.vue"),
      },
      {
        path: "users/:id",
        name: "user-edit",
        component: () => import("@/views/Users/UserFormView.vue"),
      },
      {
        path: "users/create",
        name: "user-create",
        component: () => import("@/views/Users/UserFormView.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
