import toast from "react-hot-toast";

export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      duration: 3000,
      position: "bottom-center",
      style: {
        background: "#10b981",
        color: "#fff",
        padding: "8px 16px",
        borderRadius: "10px",
      },
      iconTheme: {
        primary: "#fff",
        secondary: "#10b981",
      },
    });
  },

  error: (message: string) => {
    toast.error(message, {
      duration: 4000,
      position: "bottom-center",
      style: {
        background: "#ef4444",
        color: "#fff",
        padding: "8px 16px",
        borderRadius: "10px",
      },
      iconTheme: {
        primary: "#fff",
        secondary: "#ef4444",
      },
    });
  },

  info: (message: string) => {
    toast(message, {
      duration: 3000,
      position: "bottom-center",
      icon: "ℹ️",
      style: {
        background: "#3b82f6",
        color: "#fff",
        padding: "8px 16px",
        borderRadius: "10px",
      },
    });
  },

  loading: (message: string) => {
    return toast.loading(message, {
      position: "bottom-center",
      style: {
        background: "#6366f1",
        color: "#fff",
        padding: "8px 16px",
        borderRadius: "10px",
      },
    });
  },

  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
      },
      {
        position: "bottom-center",
        style: {
          padding: "8px 16px",
          borderRadius: "10px",
        },
      }
    );
  },

  dismiss: (toastId?: string) => {
    toast.dismiss(toastId);
  },
};
