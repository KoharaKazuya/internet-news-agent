import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import crypto from "node:crypto";
import { ArticleMeta } from "./feed.js";

const app = initializeApp();
const db = getFirestore(app);

export type User = {
  prompt?: string;
  feeds?: { url: string }[];
};

export async function getUser(userId: string): Promise<User> {
  const docRef = await db.collection("users").doc(userId).get();
  const user = docRef.data();
  if (!user) throw new Error(`User not found: ${userId}`);
  return user as User;
}

export async function hasSummarizedArticle(
  userId: string,
  articleUrl: string
): Promise<boolean> {
  const docRef = db
    .collection(`users/${userId}/summarizedArticles`)
    .doc(getSummarizedArticleDocId(userId, articleUrl));
  const doc = await docRef.get();
  return doc.exists;
}

export async function saveSummarizedArticle(
  userId: string,
  meta: ArticleMeta,
  summary: string
): Promise<void> {
  // まとめを保存する
  {
    const docRef = db
      .collection(`users/${userId}/summarizedArticles`)
      .doc(getSummarizedArticleDocId(userId, meta.url));
    await docRef.set({ meta, summary });
  }

  // 未読情報を保存する
  {
    const docRef = db
      .collection(`users/${userId}/unreadArticles`)
      .doc(getSummarizedArticleDocId(userId, meta.url));
    await docRef.set({ date: meta.date });
  }
}

function getSummarizedArticleDocId(userId: string, articleUrl: string): string {
  return crypto
    .createHash("sha256")
    .update(`${userId}:${articleUrl}`)
    .digest("hex");
}

export async function saveErrorArticle(
  userId: string,
  meta: ArticleMeta,
  error: unknown
) {
  // まとめを保存する
  {
    const message = error instanceof Error ? error.message : String(error);
    const summary = `**要約に失敗しました**\n\n\`\`\`\n${message}\n\`\`\`\n`;
    const docRef = db
      .collection(`users/${userId}/summarizedArticles`)
      .doc(getSummarizedArticleDocId(userId, meta.url));
    await docRef.set({ type: "error", meta, summary });
  }

  // 未読情報を保存する
  {
    const docRef = db
      .collection(`users/${userId}/unreadArticles`)
      .doc(getSummarizedArticleDocId(userId, meta.url));
    await docRef.set({ date: meta.date });
  }
}

export async function countUnreadArticles(userId: string): Promise<number> {
  const snapshot = await db
    .collection(`users/${userId}/unreadArticles`)
    .count()
    .get();
  return snapshot.data().count;
}

export async function notifyUnreadArticleLimit(userId: string): Promise<void> {
  const docRef = db
    .collection(`users/${userId}/notifications`)
    .doc("unreadArticleLimit");
  await docRef.set({
    message:
      "記事の未読数が上限に達したため要約の生成を停止しました。漏れなく生成するにはサイト登録を減らしてください。",
    date: new Date(),
  });
}

export async function notifyBan(userId: string): Promise<void> {
  const docRef = db.collection(`users/${userId}/notifications`).doc("ban");
  await docRef.set({
    message:
      "要約 AI に対して有害なコンテンツが入力されたことが検知されました。要約の自動実行を無期限で停止します。復旧するには管理者に連絡してください。",
    date: new Date(),
  });
}

export async function saveBannedUser(userId: string): Promise<void> {
  const docRef = db.collection("bannedUsers").doc(userId);
  await docRef.set({ date: new Date() });
}

export async function isBannedUser(userId: string): Promise<boolean> {
  const docRef = db.collection("bannedUsers").doc(userId);
  const doc = await docRef.get();
  return doc.exists;
}
