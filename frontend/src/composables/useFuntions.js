import { getFunctions } from "firebase/functions";
import firebaseApp from "@/firebase";

const functions = getFunctions(firebaseApp);

export default function useFunctions() {
  return functions;
}