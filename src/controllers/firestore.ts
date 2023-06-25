import { initializeApp } from "firebase/app";
import {
  getDocs,
  getFirestore,
  query,
  updateDoc,
  where,
  collection,
  doc,
  getDoc,
} from "firebase/firestore";
import { firebaseConfig } from "../init-firebase";
import { Reserved } from "../types/reserved";
import { EnumStatus } from "../types/enums";
import { setSessionStorage } from "../utils/sessionStorage";
// TODO REFATORAR CHAMADAS

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const getShopsList = async () => {
  const retorno: any[] = [];
  const shopsRef = collection(db, "shops");
  const q = query(shopsRef);

  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    retorno.push(doc.data());
  });

  return retorno;
};

export const getShopByEmail = async (email: string) => {
  const shopsRef = collection(db, "shops");
  const searchQuery = query(shopsRef, where("email", "==", email));

  const querySnapshot = await getDocs(searchQuery);
  let retorno;

  querySnapshot.forEach((doc) => {
    if (doc.data()) retorno = { ...doc.data(), id: doc.id };
  });
  if (retorno) setSessionStorage("shopData", retorno);
  return retorno;
};

export const getShopByUrl = async (url: string | undefined) => {
  const shopsRef = collection(db, "shops");
  const searchQuery = query(shopsRef, where("url", "==", url));

  const querySnapshot = await getDocs(searchQuery);
  let retorno;
  querySnapshot.forEach((doc) => {
    if (doc.data().name) retorno = { ...doc.data(), id: doc.id };
  });
  if (retorno) setSessionStorage("shopData", retorno);
  return retorno;
};

export const getSolicitationList = async (shopId: string) => {
  const documentRef = doc(db, "shops", shopId);
  const docSnapshot = await getDoc(documentRef);
  if (docSnapshot.exists()) {
    const documentData = docSnapshot.data();
    return documentData.solicitationList;
  }
};

export const sendSolicitationReserved = async (
  shopId: string,
  reserved: Reserved
) => {
  try {
    const documentRef = doc(db, "shops", shopId);
    const docSnapshot = await getDoc(documentRef);
    if (docSnapshot.exists()) {
      const documentData = docSnapshot.data();

      documentData.solicitationList.push(reserved);

      await updateDoc(documentRef, {
        solicitationList: documentData?.solicitationList,
      });
    } else {
      console.log("Document not found");
    }
  } catch (error) {
    console.log("Error getting document:", error);
  }
};

export const updateSolicitationReserve = async (
  shopId: string,
  reserved: Reserved,
  index: number
) => {
  try {
    const documentRef = doc(db, "shops", shopId);
    const docSnapshot = await getDoc(documentRef);
    if (docSnapshot.exists()) {
      const documentData = docSnapshot.data();

      documentData.solicitationList[index] = reserved;

      if (reserved.status === EnumStatus.APROVED) {
        documentData?.reservedList.push(reserved);
      }
      await updateDoc(documentRef, {
        solicitationList: documentData.solicitationList,
        reservedList: documentData.reservedList,
      });
    } else {
      console.log("Document not found");
    }
  } catch (error) {
    console.log("Error getting document:", error);
  }
};
