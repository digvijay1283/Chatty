import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

export const useAuthStore = create((set) => ({  // ✅ include `set` here
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get('/auth/check');
      set({ authUser: res.data }); // ✅ works now
    } catch (error) {
      console.log("Error in check auth:", error);
      set({ authUser: null }); // ✅ works now
    } finally {
      set({ isCheckingAuth: false }); // ✅ works now
    }
  },

  signup : async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post('/auth/signup', data);
      set({ authUser: res.data });
      toast.success("Account created successfully!");
    } catch (error) {
      console.log("Error in signup:", error);
      toast.error(
        error.response?.data?.message || "Something went wrong!"
      );
    } finally {
      set({ isSigningUp: false });
    }
  },

  login : async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post('/auth/login', data);
      if (res.data) {
        set({ authUser: res.data });
        toast.success("Logged in successfully!");
      } else {
        throw new Error("No data received from server");
      }
    } catch (error) {
      console.error("Error in login:", error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Server error response:", error.response.data);
        toast.error(error.response.data.message || "Invalid email or password");
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request);
        toast.error("Server not responding. Please try again later.");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error setting up request:", error.message);
        toast.error("Unable to connect to server. Please check your connection.");
      }
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout : async () => {
    try {
      await axiosInstance.post('/auth/logout');
      set({ authUser: null });
      toast.success("Logged out successfully!");
    } catch (error) {
      console.log("Error in logout:", error);
      toast.error(
        error.response?.data?.message || "Something went wrong!"
      );
    }
  }, 

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      // Add a longer timeout specifically for profile updates
      const res = await axiosInstance.put("/auth/update-profile", data, {
        timeout: 60000, // 60 seconds timeout for image upload
      });
      
      if (!res?.data) {
        throw new Error("No response data received");
      }

      set({ authUser: res.data });
      return res.data; // Return data for toast.promise
    } catch (error) {
      console.error("Error in update profile:", error);
      let errorMessage;
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = "Upload timed out. Please try again with a smaller image.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else {
        errorMessage = "Failed to update profile. Please try again.";
      }
      
      throw new Error(errorMessage); // Throw formatted error for toast.promise
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

}));


