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
const getClientsCol = (companyId) => collection(firebaseFirestore, `companies/${companyId}/clients`)

export const getAllClients = async ({ companyId }) => {
  const clientsCol = getClientsCol(companyId);

  const clientsQuery = query(clientsCol, where("isDeleted", "==", false));
  const clientsQuerySnapshot = await getDocs(clientsQuery);
  const clients = clientsQuerySnapshot.docs.map((doc) => ({
    ...doc.data(),
  }));
  return clients;
};

export const getClientById = async ({ id, companyId }) => {
  const clientsCol = getClientsCol(companyId);
  const clientDoc = doc(clientsCol, id);
  const client = await getDoc(clientDoc);
  return client.data();
};

export const createClient = async ({ client, companyId }) => {
  const clientsCol = getClientsCol(companyId);

  const { id } = await addDoc(clientsCol, {
    ...client,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    isDeleted: false,
  });

  const docRef = doc(clientsCol, id);
  await setDoc(docRef, { id: id }, { merge: true });

  return id;
};

export const updateClient = async ({ client, id, companyId }) => {
  const clientsCol = getClientsCol(companyId);

  const clientDoc = doc(clientsCol, id);
  await setDoc(
    clientDoc,
    {
      ...client,
      updatedAt: Timestamp.now(),
    },
    { merge: true }
  );
}

export const deleteClient = async ({ id, companyId }) => {
  const clientsCol = getClientsCol(companyId);

  const clientDoc = doc(clientsCol, id);
  await setDoc(
    clientDoc,
    {
      isDeleted: true,
      updatedAt: Timestamp.now(),
    },
    { merge: true }
  );
}
