import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import Cookies from "js-cookie";
import { type AdminUserLoginResponse } from "@/lib/api/AdminEndpoint";

interface AuthContextType {
  user: AdminUserLoginResponse | null;
  login: (user: AdminUserLoginResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AdminUserLoginResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = Cookies.get("PlutoEventAdminUser");
    if (storedUser) setUser(JSON.parse(storedUser));
    setLoading(false);
  }, []);

  const login = (userData: AdminUserLoginResponse) => {
    setUser(userData);
    Cookies.set("PlutoEventAdminUser", JSON.stringify(userData), {
      expires: 7,
    });
  };

  const logout = () => {
    setUser(null);
    Cookies.remove("PlutoEventAdminUser");
    Cookies.remove("token");
  };

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
