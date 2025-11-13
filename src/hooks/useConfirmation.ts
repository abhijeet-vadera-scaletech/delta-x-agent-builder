import { useState, useCallback } from "react";

interface ConfirmationOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}

interface ConfirmationState extends ConfirmationOptions {
  isOpen: boolean;
  onConfirm: () => void;
  isLoading: boolean;
}

export const useConfirmation = () => {
  const [state, setState] = useState<ConfirmationState>({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    variant: "danger",
    onConfirm: () => {},
    isLoading: false,
  });

  const showConfirmation = useCallback(
    (options: ConfirmationOptions, onConfirm: () => void | Promise<void>) => {
      setState({
        ...options,
        isOpen: true,
        onConfirm: async () => {
          setState(prev => ({ ...prev, isLoading: true }));
          try {
            await onConfirm();
            setState(prev => ({ ...prev, isOpen: false, isLoading: false }));
          } catch (error) {
            setState(prev => ({ ...prev, isLoading: false }));
            throw error;
          }
        },
        isLoading: false,
      });
    },
    []
  );

  const hideConfirmation = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false, isLoading: false }));
  }, []);

  return {
    confirmationState: state,
    showConfirmation,
    hideConfirmation,
  };
};
