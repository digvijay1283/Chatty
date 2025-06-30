import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  subscribeToMessages: () => {
  const { selectedUser } = get();
  if (!selectedUser) return;

  const socket = useAuthStore.getState().socket;
  if (!socket) {
    console.warn("Socket is not initialized yet.");
    return;
  }

  socket.on("newMessage", (newMessage) => {
    const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
    if (!isMessageSentFromSelectedUser) return;

    set({
      messages: [...get().messages, newMessage],
    });
  });
},

unsubscribeFromMessages: () => {
  const socket = useAuthStore.getState().socket;
  if (!socket) {
    console.warn("Socket is not initialized yet.");
    return;
  }
  socket.off("newMessage");
},

  // subscribeToMessages: () => {
  //   console.info("subscribeToMessages is disabled (no socket yet)");
  // },

  // unsubscribeFromMessages: () => {
  //   console.info("unsubscribeFromMessages is disabled (no socket yet)");
  // },


  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
