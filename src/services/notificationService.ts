import { HubConnectionBuilder, HubConnection } from "@microsoft/signalr";
import { toast } from "react-toastify";
import { useAuthStore } from "@/stores/authStore";
import { NotificationMessage } from "@/types/notification";

let connection: HubConnection | null = null;

export const startNotificationHub = async () => {
  const token = useAuthStore.getState().token;

  if (!token) return;

  connection = new HubConnectionBuilder()
    .withUrl("http://localhost:6011/hub/notifications", {
      accessTokenFactory: () => token,
      // withCredentials: true,
    })
    .withAutomaticReconnect()
    .build();

  connection.on("ReceiveNotification", (msg: any) => {
    console.log("Raw Notification:", msg);
    console.log("Type of msg:", typeof msg);

    const parsed = typeof msg === "string" ? JSON.parse(msg) : msg;

    console.log(`ReceiveNotification: ${parsed.title} - ${parsed.message}`);
    toast.info(`📢 ${parsed.title}: ${parsed.message}`);
  });

  try {
    await connection.start();
    console.log("✅ SignalR connected");
  } catch (err) {
    console.error("❌ SignalR connection error:", err);
  }
};

export const stopNotificationHub = async () => {
  if (connection) {
    await connection.stop();
    connection = null;
    console.log("🛑 SignalR disconnected");
  }
};
