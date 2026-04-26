"use client"

import React, { createContext, useContext, useState } from 'react';

interface AdminModalContextType {
  isAdminModalOpen: boolean;
  openAdminModal: () => void;
  closeAdminModal: () => void;
}

const AdminModalContext = createContext<AdminModalContextType | undefined>(undefined);

export const useAdminModal = () => {
  const context = useContext(AdminModalContext);
  if (context === undefined) {
    throw new Error('useAdminModal must be used within an AdminModalProvider');
  }
  return context;
};

export const AdminModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  const openAdminModal = () => setIsAdminModalOpen(true);
  const closeAdminModal = () => setIsAdminModalOpen(false);

  return (
    <AdminModalContext.Provider value={{ isAdminModalOpen, openAdminModal, closeAdminModal }}>
      {children}
    </AdminModalContext.Provider>
  );
};
