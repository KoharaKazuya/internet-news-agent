import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  type DocumentData,
  type DocumentSnapshot,
} from "firebase/firestore";
import { firestore } from "~/firebase";

declare const paginationCursorMarker: unique symbol;
export type PaginationCursor = DocumentSnapshot<DocumentData, DocumentData> & {
  [paginationCursorMarker]: never;
};

/**
 * 全記事一覧を取得する (新しい順に)
 */
export async function getArticles({
  userId,
  after,
}: {
  userId: string;
  after?: PaginationCursor;
}) {
  const querySnapshot = await getDocs(
    query(
      collection(firestore, "users", userId, "summarizedArticles"),
      orderBy("meta.date", "desc"),
      limit(100),
      ...(after ? [startAfter(after)] : [])
    )
  );

  const articleIds: string[] = [];
  let lastDocSnapshot: PaginationCursor | undefined;
  querySnapshot.forEach((doc) => {
    articleIds.push(doc.id);
    lastDocSnapshot = doc as PaginationCursor;
  });

  return { articleIds, cursor: lastDocSnapshot };
}

/**
 * 未読記事の一覧を取得する
 */
export async function getUnreadArticles(userId: string): Promise<string[]> {
  const querySnapshot = await getDocs(
    query(
      collection(firestore, "users", userId, "unreadArticles"),
      orderBy("date", "asc"),
      limit(100)
    )
  );

  const articleIds: string[] = [];
  querySnapshot.forEach((doc) => {
    articleIds.push(doc.id);
  });

  return articleIds;
}

export type ArticleData = {
  type?: "error";
  meta: { website: string; url: string; title: string; thumbnail?: string };
  summary: string;
};

/**
 * 記事の詳細情報を取得する
 */
export async function getArticle(
  userId: string,
  articleId: string
): Promise<ArticleData> {
  const docRef = doc(
    firestore,
    "users",
    userId,
    "summarizedArticles",
    articleId
  );
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) throw new Error(`Document not found: ${articleId}`);
  return docSnap.data() as unknown as ArticleData;
}

/**
 * 記事の既読を登録する
 */
export async function markAsRead(
  userId: string,
  articleId: string
): Promise<void> {
  const docRef = doc(firestore, "users", userId, "unreadArticles", articleId);
  await deleteDoc(docRef);
}
