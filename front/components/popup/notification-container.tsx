"use client";

import { useApi } from "@/lib/fetcher";
import { useEffect, useState } from "react";

type Notification = {
  id_notification: number;
  texte: string;
  lue: boolean;
};

export default function NotificationContainer() {
  const api = useApi();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    api.get("notifications")
      .then(res => res.json())
      .then(setNotifications);
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">Notifications</h1>

      {notifications.length === 0 && (
        <p>Aucune notification</p>
      )}

      <ul className="space-y-3">
        {notifications.map(n => (
          <li
            key={n.id_notification}
            className={`border p-3 rounded ${n.lue ? "opacity-60" : ""}`}
          >
            {n.texte}
          </li>
        ))}
      </ul>
    </div>
  );
}
