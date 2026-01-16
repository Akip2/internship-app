"use client";

import { useEffect, useState, useCallback } from "react";
import { Bell } from "lucide-react";
import { useApi } from "@/lib/fetcher";
import { usePopup } from "@/providers/popup-provider";
import NotificationPopup from "@/components/popup/notification-popup";

export default function NotificationCenter() {
  const { get } = useApi();
  const { openPopup } = usePopup();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await get("notifications/unread/count");
      const data = await res.json();
      if (res.ok) {
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error("Erreur lors du chargement du nombre de notifications non lues");
    }
  }, [get]);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  return (
    <button
      onClick={() => openPopup(<NotificationPopup />)}
      className="relative p-2 text-gray-600"
    >
      <Bell className="w-6 h-6" />
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
}
