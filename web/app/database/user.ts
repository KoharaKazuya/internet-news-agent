import { doc, getDoc, setDoc } from "firebase/firestore";
import { firestore } from "~/firebase";

/** プロンプトを取得する */
export async function getPrompt({
  userId,
}: {
  userId: string;
}): Promise<string> {
  const docRef = doc(firestore, "users", userId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return "";
  return docSnap.data().prompt;
}

/** プロンプトを更新する */
export async function updatePrompt({
  userId,
  prompt,
}: {
  userId: string;
  prompt: string;
}): Promise<void> {
  const docRef = doc(firestore, "users", userId);
  await setDoc(docRef, { prompt }, { merge: true });
}

/** フィード一覧を取得する */
export async function getFeeds({
  userId,
}: {
  userId: string;
}): Promise<{ url: string }[]> {
  const docRef = doc(firestore, "users", userId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return [];
  return docSnap.data().feeds ?? [];
}

/** フィード一覧を更新する */
export async function updateFeeds({
  userId,
  feeds,
}: {
  userId: string;
  feeds: { url: string }[];
}): Promise<void> {
  const docRef = doc(firestore, "users", userId);
  await setDoc(docRef, { feeds }, { merge: true });
}
