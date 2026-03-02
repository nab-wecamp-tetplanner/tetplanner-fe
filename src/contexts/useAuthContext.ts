import { useContext } from "react";
// Dùng import type để fix lỗi ts(1484) verbatimModuleSyntax
import { AuthContext } from "./AuthContext";
import type { AuthContextType } from "./AuthContext";

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
