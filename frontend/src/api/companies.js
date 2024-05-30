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
const companiesCol = collection(firebaseFirestore, "companies");

export const getAllCompanies = async () => {
  const companiesQuery = query(companiesCol, where("isDeleted", "==", false));
  const companiesQuerySnapshot = await getDocs(companiesQuery);
  const companies = companiesQuerySnapshot.docs.map((doc) => ({
    ...doc.data(),
  }));
  return companies;
};

export const getCompanyById = async (id) => {
  const companyDoc = doc(companiesCol, id);
  const company = await getDoc(companyDoc);
  return company.data();
};

export const createCompany = async (company) => {
  const { id } = await addDoc(companiesCol, {
    ...company,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    isDeleted: false,
  });

  const docRef = doc(companiesCol, id);
  await setDoc(docRef, { id: id }, { merge: true });

  return id;
};

export const updateCompany = async (company, id) => {
  const companyDoc = doc(companiesCol, id);
  await setDoc(
    companyDoc,
    {
      ...company,
      updatedAt: Timestamp.now(),
    },
    { merge: true }
  );
}

export const deleteCompany = async (id) => {
  const companyDoc = doc(companiesCol, id);
  await setDoc(
    companyDoc,
    {
      isDeleted: true,
      updatedAt: Timestamp.now(),
    },
    { merge: true }
  );
}
