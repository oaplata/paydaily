import { getAuth } from "firebase/auth";
import firebaseApp from "@/firebase";

const auth = getAuth(firebaseApp);

export default function useAuth() {
  return auth;
}
