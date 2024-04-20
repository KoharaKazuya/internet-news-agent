import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const app = initializeApp();
const db = getFirestore(app);

export async function getAllUsers() {
  const snapshot = await db.collection("users").get();
  return snapshot.docs.map((doc) => ({ id: doc.id }));
}
