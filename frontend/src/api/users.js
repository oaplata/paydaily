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
import { httpsCallable } from "firebase/functions";
import useFirestore from "@/composables/useFirestore";
import useFunctions from "@/composables/useFuntions";

const firebaseFirestore = useFirestore();
const usersCol = collection(firebaseFirestore, "users");

const getUsersBalanceCol = (userId) => collection(firebaseFirestore, `users/${userId}/balances`);

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

  const createUserAuth = httpsCallable(useFunctions(), "createUser");

  const userAuth = await createUserAuth(firebaseAuthUser);

  console.log(userAuth);

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

export const addUserBalance = async ({ userId, balance }) => {
  const col = getUsersBalanceCol(userId);

  const { id } = await addDoc(col, {
    ...balance,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    isDeleted: false,
  });

  const docRef = doc(col, id);
  await setDoc(docRef, { id: id }, { merge: true });
  return { id };
};

export const deleteUserBalance = async ({ userId, id }) => {
  const col = getUsersBalanceCol(userId);
  const docRef = doc(col, id);
  await setDoc(
    docRef,
    {
      isDeleted: true,
      updatedAt: Timestamp.now(),
    },
    { merge: true }
  );
};

const getToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

export const getUserBalanceToday = async ({ userId }) => {
  const col = getUsersBalanceCol(userId);
  const querySnapshot = await getDocs(query(col,
      where("createdAt", ">=", Timestamp.fromDate(getToday())),
      where("isDeleted", "==", false)
  ));
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const getUsersByCity = async ({ companyId, city }) => {
  const usersQuery = query(usersCol, where("companies", "array-contains", companyId), where("city", "==", city), where("isDeleted", "==", false));
  const usersQuerySnapshot = await getDocs(usersQuery);
  const users = usersQuerySnapshot.docs.map((doc) => ({
    ...doc.data(),
  }));
  return users;
}


export const getUserBalance = async ({ userId, startDate, endDate }) => {
  const col = getUsersBalanceCol(userId);
  const querySnapshot = await getDocs(query(col,
    where("createdAt", ">=", Timestamp.fromDate(startDate)),
    where("createdAt", "<=", Timestamp.fromDate(endDate)),
    where("isDeleted", "==", false)
  ));
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}


