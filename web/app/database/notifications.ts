import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { firestore } from "~/firebase";

/**
 * 通知の一覧を取得する
 */
export async function getNotifications(userId: string) {
  const querySnapshot = await getDocs(
    query(
      collection(firestore, "users", userId, "notifications"),
      orderBy("date", "asc")
    )
  );

  const notifications: Array<{ id: string; message: string }> = [];
  querySnapshot.forEach((doc) => {
    notifications.push({ id: doc.id, message: doc.data().message });
  });

  return notifications;
}

/**
 * 通知を削除する
 */
export async function deleteNotification(
  userId: string,
  notificationId: string
) {
  const docRef = doc(
    firestore,
    "users",
    userId,
    "notifications",
    notificationId
  );
  await deleteDoc(docRef);
}
