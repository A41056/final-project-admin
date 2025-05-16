import { HubConnectionBuilder, HubConnection } from "@microsoft/signalr";
import { toast } from "react-toastify";
import { useAuthStore } from "@/stores/authStore";

let connection: HubConnection | null = null;

export const startNotificationHub = async () => {
  const token = useAuthStore.getState().token;

  if (!token) return;

  connection = new HubConnectionBuilder()
    .withUrl("http://localhost:6011/hub/notifications", {
      accessTokenFactory: () => token,
      withCredentials: true,
    })
    .withAutomaticReconnect()
    .build();

  connection.on("ReceiveNotification", (message: string) => {
    toast.info(`📦 ${message}`);
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
