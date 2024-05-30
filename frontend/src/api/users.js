import {
  Timestamp,
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import useFirestore from "@/composables/useFirestore";

const firebaseFirestore = useFirestore();
const usersCol = collection(firebaseFirestore, "users");

export const getAllUsers = async (companyId) => {
  const usersQuery = query(usersCol, where("companies", "array-contains", companyId), where("isDeleted", "==", false));
  const usersQuerySnapshot = await getDocs(usersQuery);
  const users = usersQuerySnapshot.docs.map((doc) => ({
    ...doc.data(),
  }));
  return users;
};

export const getUserById = async (id) => {
  const userDoc = doc(usersCol, id);
  const user = await getDoc(userDoc);
  return user.data();
};

export const createUser = async (user) => {
  const password = user.password;
  delete user.password;
  delete user.password2;

  const firebaseAuthUser = {
    email: user.email,
    password: password,
  };

  console.log(firebaseAuthUser);

  const { id } = await addDoc(usersCol, {
    ...user,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    isDeleted: false,
  });

  const docRef = doc(usersCol, id);
  await setDoc(docRef, { id: id }, { merge: true });

  return id;
};

export const updateUser = async (user, id) => {
  const userDoc = doc(usersCol, id);
  await setDoc(
    userDoc,
    {
      ...user,
      updatedAt: Timestamp.now(),
    },
    { merge: true }
  );
}

export const deleteUser = async (id) => {
  const userDoc = doc(usersCol, id);
  await setDoc(
    userDoc,
    {
      isDeleted: true,
      updatedAt: Timestamp.now(),
    },
    { merge: true }
  );
}
