"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { LoginModal } from "./login-modal";

interface UserProfile {
  user_name: string;
  email: string;
  phone?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoggedIn: boolean;
  login: (user: UserProfile) => void;
  logout: () => void;
  requireAuth: (onSuccessAction?: () => void) => boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
  requireAuth: () => false,
  openLoginModal: () => {},
  closeLoginModal: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("ecom_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {}
    }
  }, []);

  const login = (userData: UserProfile) => {
    setUser(userData);
    localStorage.setItem("ecom_token", "jwt_token_demo_ecom_2026");
    localStorage.setItem("ecom_user", JSON.stringify(userData));
    window.dispatchEvent(new Event("ecom_auth_changed"));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("ecom_token");
    localStorage.removeItem("ecom_user");
    localStorage.removeItem("ecom_wishlist_items");
    localStorage.removeItem("ecom_guest_wishlist");
    sessionStorage.removeItem("ecom_buy_now_item");
    window.dispatchEvent(new Event("ecom_auth_changed"));
    window.dispatchEvent(new Event("ecom_wishlist_updated"));
    window.dispatchEvent(new Event("ecom_wishlist_changed"));
    window.location.href = "/";
  };

  const requireAuth = (onSuccessAction?: () => void): boolean => {
    const stored = localStorage.getItem("ecom_user");
    if (stored) {
      if (onSuccessAction) onSuccessAction();
      return true;
    }
    // Not logged in -> trigger modal
    if (onSuccessAction) {
      setPendingAction(() => onSuccessAction);
    }
    setIsModalOpen(true);
    return false;
  };

  const handleLoginSuccess = () => {
    setIsModalOpen(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        login,
        logout,
        requireAuth,
        openLoginModal: () => setIsModalOpen(true),
        closeLoginModal: () => setIsModalOpen(false),
      }}
    >
      {children}

      {/* Global Authenticated Customer Login Modal */}
      <LoginModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setPendingAction(null);
        }}
        onSuccess={handleLoginSuccess}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
