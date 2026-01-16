"use client";

import { useEffect, useState, useCallback } from "react";
import { Check } from "lucide-react";
import { useApi } from "@/lib/fetcher";
import { usePopup } from "@/providers/popup-provider";
import { Button } from "../ui/button";

interface Notification {
  id_notification: number;
  texte: string;
  lue: boolean;
}

export default function NotificationPopup() {
  const { get, put } = useApi();
  const { closePopup } = usePopup();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await get("notifications");
      const data = await res.json();
      if (res.ok) {
        setNotifications(data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des notifications");
    }
  }, [get]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (notificationId: number) => {
    setLoading(true);
    try {
      const res = await put(`notifications/${notificationId}/read`, {});
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id_notification === notificationId ? { ...notif, lue: true } : notif
          )
        );
      }
    } catch (error) {
      console.error("Erreur lors du marquage comme lue");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    setLoading(true);
    try {
      const res = await put("notifications/read-all", {});
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((notif) => ({ ...notif, lue: true }))
        );
      }
    } catch (error) {
      console.error("Erreur lors du marquage de toutes comme lues");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>Aucune notification</p>
          </div>
        ) : (
          <div className="space-y-2 p-2">
            {notifications.map((notification) => (
              <div
                key={notification.id_notification}
                className={`p-3 rounded border ${
                  notification.lue
                    ? "bg-white border-gray-300"
                    : "bg-yellow-50 border-yellow-400"
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">
                      {notification.texte}
                    </p>
                  </div>
                  {!notification.lue && (
                    <button
                      onClick={() =>
                        handleMarkAsRead(notification.id_notification)
                      }
                      disabled={loading}
                      className="flex-shrink-0 p-1 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                      title="Marquer comme lue"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {notifications.some((n) => !n.lue) && (
        <div className="mt-4 flex gap-2">
          <Button
            onClick={handleMarkAllAsRead}
            disabled={loading}
            className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
          >
            Tout marquer comme lue
          </Button>
        </div>
      )}
    </div>
  );
}
