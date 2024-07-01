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
const getMotorcyclesCol = (companyId) => collection(firebaseFirestore, `companies/${companyId}/motorcycles`)


export const getAllMotorcycles = async ({ companyId }) => {
  const col = getMotorcyclesCol(companyId);

  const docQuery = query(col, where("isDeleted", "==", false));
  const querySnapshot = await getDocs(docQuery);
  const data = querySnapshot.docs.map((doc) => ({
    ...doc.data(),
  }));
  return data;
};

export const getMotorcycleById = async ({ id, companyId }) => {
  const col = getMotorcyclesCol(companyId);
  const docRef = doc(col, id);
  const raw = await getDoc(docRef);
  return raw.data();
};

export const createMotorcycle = async ({ motorcycle, companyId }) => {
  const col = getMotorcyclesCol(companyId);

  const { id } = await addDoc(col, {
    ...motorcycle,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    isDeleted: false,
  });

  const docRef = doc(col, id);
  await setDoc(docRef, { id: id }, { merge: true });

  return id;
};

export const updateMotorcycle = async ({ motorcycle, id, companyId }) => {
  const col = getMotorcyclesCol(companyId);

  const docRef = doc(col, id);
  await setDoc(
    docRef,
    {
      ...motorcycle,
      updatedAt: Timestamp.now(),
    },
    { merge: true }
  );
}

export const deleteMotorcycle = async ({ id, companyId }) => {
  const col = getMotorcyclesCol(companyId);

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
