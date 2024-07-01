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
const getRoutesCol = (companyId) => collection(firebaseFirestore, `companies/${companyId}/routes`)


export const getAllRoutes = async ({ companyId }) => {
  const col = getRoutesCol(companyId);

  const docQuery = query(col, where("isDeleted", "==", false));
  const querySnapshot = await getDocs(docQuery);
  const data = querySnapshot.docs.map((doc) => ({
    ...doc.data(),
  }));
  return data;
};

export const getRouteById = async ({ id, companyId }) => {
  const col = getRoutesCol(companyId);
  const docRef = doc(col, id);
  const raw = await getDoc(docRef);
  return raw.data();
};

export const createRoute = async ({ route, companyId }) => {
  const col = getRoutesCol(companyId);

  const { id } = await addDoc(col, {
    ...route,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    isDeleted: false,
  });

  const docRef = doc(col, id);
  await setDoc(docRef, { id: id }, { merge: true });

  return id;
};

export const updateRoute = async ({ route, id, companyId }) => {
  const col = getRoutesCol(companyId);

  const docRef = doc(col, id);
  await setDoc(
    docRef,
    {
      ...route,
      updatedAt: Timestamp.now(),
    },
    { merge: true }
  );
}

export const deleteRoute = async ({ id, companyId }) => {
  const col = getRoutesCol(companyId);

  const docRef = doc(col, id);
  await setDoc(
    docRef,
    {
      isDeleted: true,
      updatedAt: Timestamp.now(),
    },
    { merge: true }
  );
}

export const getRoutesByClientId = async ({ clientId, companyId }) => {
  const col = getRoutesCol(companyId);

  const docQuery = query(col, where("clients", "array-contains", clientId), where("isDeleted", "==", false));
  const querySnapshot = await getDocs(docQuery);
  
  const data = querySnapshot.docs.map((doc) => ({
    ...doc.data(),
  }));

  return data;
}
