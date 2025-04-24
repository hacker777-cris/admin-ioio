import React, { createContext, useContext } from 'react';
import { Toaster, toast } from 'react-hot-toast';

interface NotificationContextType {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextType>({} as NotificationContextType);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const showSuccess = (message: string) => {
    toast.success(message, {
      duration: 3000,
      style: {
        background: '#EDFCF2',
        color: '#0D9853',
        fontWeight: 500,
      },
    });
  };

  const showError = (message: string) => {
    toast.error(message, {
      duration: 4000,
      style: {
        background: '#FEF2F2',
        color: '#DC2626',
        fontWeight: 500,
      },
    });
  };

  const showInfo = (message: string) => {
    toast(message, {
      duration: 3000,
      style: {
        background: '#EFF6FF',
        color: '#2563EB',
        fontWeight: 500,
      },
    });
  };

  return (
    <NotificationContext.Provider value={{ showSuccess, showError, showInfo }}>
      <Toaster position="top-right" />
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);