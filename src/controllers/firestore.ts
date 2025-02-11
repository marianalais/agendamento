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
  orderBy,
  addDoc,
} from "firebase/firestore";
import { firebaseConfig } from "../init-firebase";
import { Reserved } from "../types/reserved";
import { EnumStatus } from "../types/enums";
import { setSessionStorage } from "../utils/sessionStorage";
import { Shop } from "../types/shop";
// TODO REFATORAR CHAMADAS

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const getCollection = (nameCollection: string) => {
  return collection(db, nameCollection);
};

const shopsRef = getCollection("shops");

export const addNewShop = async () => {
  try {
    const newShop: Shop = {
      name: "Herick Giaretta",
      email: "herickgiaretta@outlook.com",
      url: "herick",
      phone: "5554 9130-1887",
      instagram: "herickgiaretta",
      reservedList: [],
      solicitationList: [],
      hoursShopOpen: [],
    };
    if (!(await getShopByUrl("herick"))) {
      const docRef = await addDoc(shopsRef, newShop);
      console.log("Document written with ID: ", docRef.id);
    }
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

export const getShopsList = async () => {
  const retorno: any[] = [];

  const q = query(shopsRef, orderBy("name", "asc"));

  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    retorno.push(doc.data());
  });

  return retorno as Shop[];
};

export const getShopByEmail = async (email: string) => {
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
  const searchQuery = query(shopsRef, where("url", "==", url));

  const querySnapshot = await getDocs(searchQuery);
  let retorno;
  querySnapshot.forEach((doc) => {
    if (doc.data().name) retorno = { ...doc.data(), id: doc.id };
  });
  if (retorno) setSessionStorage("shopData", retorno);
  return retorno;
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

export const updateSolicitationReserved = async (
  shopId: string,
  reserved: Reserved,
  index: number
) => {
  try {
    const documentRef = doc(db, "shops", shopId);
    const docSnapshot = await getDoc(documentRef);
    if (docSnapshot.exists()) {
      const documentData = docSnapshot.data() as Shop;

      if (reserved.status === EnumStatus.APROVED) {
        documentData?.reservedList.push(reserved);
      }
      documentData.solicitationList.splice(index, 1);

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

export const updateHourShop = async (
  shopId: string,
  hoursShopOpen: string[]
) => {
  try {
    const documentRef = doc(db, "shops", shopId);
    const docSnapshot = await getDoc(documentRef);
    if (docSnapshot.exists()) {
      const documentData = docSnapshot.data();

      await updateDoc(documentRef, { ...documentData, hoursShopOpen });
    } else {
      console.log("Document not found");
    }
  } catch (error) {
    console.log("Error setHourShop document:", error);
  }
};
