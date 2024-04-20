import { useEffect, useRef } from "react";
import { deleteNotification, getNotifications } from "~/database/notifications";
import { useCurrentUser } from "~/firebase";

export default function Notifier() {
  useNotifier();
  return null;
}

function useNotifier() {
  const user = useCurrentUser();
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    notify(user!.uid);
  });
}

async function notify(userId: string) {
  const notifications = await getNotifications(userId);
  for (const notification of notifications) {
    window.alert(notification.message);
    await deleteNotification(userId, notification.id);
  }
}
