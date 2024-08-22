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
      // clientes
      {
        path: "clients",
        name: "clients",
        component: () => import("@/views/Clients/ClientsListView.vue"),
      },
      {
        path: "clients/:id",
        name: "client-edit",
        component: () => import("@/views/Clients/ClientFormView.vue"),
      },
      {
        path: "clients/create",
        name: "client-create",
        component: () => import("@/views/Clients/ClientFormView.vue"),
      },
      {
        path: "motorcycles",
        name: "motorcycles",
        component: () => import("@/views/Motorcycles/MotorcyclesListView.vue"),
      },
      {
        path: "motorcycles/:id",
        name: "motorcycle-edit",
        component: () => import("@/views/Motorcycles/MotorcycleFormView.vue"),
      },
      {
        path: "motorcycles/create",
        name: "motorcycle-create",
        component: () => import("@/views/Motorcycles/MotorcycleFormView.vue"),
      },
      {
        path: "routes",
        name: "routes",
        component: () => import("@/views/Routes/RoutesListView.vue"),
      },
      {
        path: "routes/:id",
        name: "route-edit",
        component: () => import("@/views/Routes/RouteFormView.vue"),
      },
      {
        path: "routes/create",
        name: "route-create",
        component: () => import("@/views/Routes/RouteFormView.vue"),
      },
      {
        path: "routes/path/:id",
        name: "route-path",
        component: () => import("@/views/Routes/RoutePathView.vue"),
      },
      {
        path: "loans",
        name: "loans",
        component: () => import("@/views/Loans/LoanFormView.vue"),
      },
      {
        path: "loans/:id",
        name: "loans-edit",
        component: () => import("@/views/Loans/LoanFormView.vue"),
      },
      {
        path: "accounting",
        name: "accounting",
        component: () => import("@/views/Accounting/AccountingView.vue"),
      },
      // {
      //   path: 'load',
      //   name: 'load',
      //   component: () => import("@/views/LoadData.vue"),
      // },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
