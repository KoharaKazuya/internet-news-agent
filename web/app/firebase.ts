import { initializeApp } from "firebase/app";
import {
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  type User,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { atom, getDefaultStore, useAtomValue } from "jotai";

const app = initializeApp({
  apiKey: "AIzaSyBEMgTxtOVJoaZNPPpalfGayGcZuWj0BBE",
  authDomain: "internet-news-agent.firebaseapp.com",
  projectId: "internet-news-agent",
  storageBucket: "internet-news-agent.appspot.com",
  messagingSenderId: "191515218082",
  appId: "1:191515218082:web:af7c8ca90a57f340c387fb",
  measurementId: "G-MY4QE232ZT",
});

export const firestore = getFirestore(app);

const auth = getAuth(app);
const googleAuth = new GoogleAuthProvider();

const userAtom = atom<User | null | undefined>(undefined);
const store = getDefaultStore();

let authResolved: () => void;
const authPromise = new Promise<void>((r) => (authResolved = r));
onAuthStateChanged(auth, (user) => {
  store.set(userAtom, user);
  authResolved();
});

export function useCurrentUser() {
  const user = useAtomValue(userAtom);
  if (user === undefined) throw authPromise;
  return user;
}

export async function signIn() {
  await signInWithPopup(auth, googleAuth);
}
