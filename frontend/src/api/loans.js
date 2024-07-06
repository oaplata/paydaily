import {
  Timestamp,
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import useFirestore from "@/composables/useFirestore";


const firebaseFirestore = useFirestore();
const getLoansCol = (companyId) => collection(firebaseFirestore, `companies/${companyId}/loans`);
const getLoanFeesCol = (companyId, loanId) => collection(firebaseFirestore, `companies/${companyId}/loans/${loanId}/fees`);

export const createLoan = async ({ loan, companyId }) => {
  const col = getLoansCol(companyId);

  const { id } = await addDoc(col, {
    ...loan,
    state: 'active',
    charged: 0,
    remaining: loan.amount,
    createdAt: loan.createdAt ? Timestamp.fromDate(loan.createdAt) : Timestamp.now(),
    updatedAt: Timestamp.now(),
    isDeleted: false,
  });

  const docRef = doc(col, id);
  await setDoc(docRef, { id: id }, { merge: true });

  return id;
};

export const updateLoan = async ({ loanId, loan, companyId }) => {
  const col = getLoansCol(companyId);
  const docRef = doc(col, loanId);

  await setDoc(docRef, {
    ...loan,
    updatedAt: Timestamp.now(),
  }, { merge: true });
};

export const getLoanByClientAndRoute = async ({ clientId, routeId, companyId }) => {
  const col = getLoansCol(companyId);
  const querySnapshot = await getDocs(query(col, 
      where("client", "==", clientId),
      where("collector", "==", routeId),
      where("state", "==", "active")
  ));

  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))[0];
};

export const addLoanFee = async ({ loanId, value, companyId, createdAt }) => {
  const col = getLoanFeesCol(companyId, loanId);

  const fee = {
    value,
    createdAt: createdAt ? Timestamp.fromDate(createdAt) : Timestamp.now(),
    updatedAt: Timestamp.now(),
    isDeleted: false,
  };

  const { id } = await addDoc(col, fee);

  const docRef = doc(col, id);
  await setDoc(docRef, { id: id }, { merge: true });
  return { id };
}

export const deleteLoanFee = async ({ loanId, feeId, companyId }) => {
  const col = getLoanFeesCol(companyId, loanId);
  const docRef = doc(col, feeId);
  await deleteDoc(docRef);
}

export const getFeeById = async ({ loanId, feeId, companyId }) => {
  const col = getLoanFeesCol(companyId, loanId);

  const docRef = doc(col, feeId);
  const docSnap = await getDoc(docRef);

  return docSnap.data();
};

export const getLoanFees = async ({ loanId, companyId }) => {
  const col = getLoanFeesCol(companyId, loanId);
  const querySnapshot = await getDocs(col);

  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export const getLoanFeesByDate = async ({ loanId, companyId, startDate, endDate }) => {
  const col = getLoanFeesCol(companyId, loanId);
  const querySnapshot = await getDocs(query(col, 
    where("createdAt", ">=", Timestamp.fromDate(startDate)),
    where("createdAt", "<=", Timestamp.fromDate(endDate)),
  ));

  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};
