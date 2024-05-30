import { ref } from "vue";
import { doc, getDoc } from "firebase/firestore";
import useFirebaseAuth from "./useAuth";
import useFirestore from "./useFirestore";

export const currentUser = ref();

const getUserByUid = async (uid) => {
  const db = useFirestore();
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  return userSnap.data();
}

export const awaitUser = async () => {
  if (currentUser.value) return currentUser.value;
  const firebaseAuth = useFirebaseAuth();

  const userAuth = firebaseAuth.currentUser;
  if (!userAuth) throw new Error("User not logged in");

  const user = await getUserByUid(userAuth.uid);
  if (!user) throw new Error("User not found");

  currentUser.value = user;
  return currentUser.value;
};

export const setUser = (user) => {
  currentUser.value = user;
};

export const logout = () => {
  currentUser.value = undefined;
  const firebaseAuth = useFirebaseAuth();
  firebaseAuth.signOut();
  localStorage.clear();
  window.location.reload();
};
