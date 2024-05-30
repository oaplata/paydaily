import { getFirestore } from "firebase/firestore";
import firebaseApp from "@/firebase";

const db = getFirestore(firebaseApp);

export default function useFirestore() {
  return db;
}