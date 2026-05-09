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
    const storedUser = Cookies.get("PLUTO_EVENT_ADMIN_USER");
    if (storedUser) setUser(JSON.parse(storedUser));
    setLoading(false);
  }, []);

  const login = (userData: AdminUserLoginResponse) => {
    setUser(userData);
    Cookies.set("PLUTO_EVENT_ADMIN_USER", JSON.stringify(userData), {
      expires: 7,
      secure: window.location.protocol === "https:",
      sameSite: "Strict",
    });
  };

  const logout = () => {
    setUser(null);
    Cookies.remove("PLUTO_EVENT_ADMIN_USER");
    Cookies.remove("PLUTO_EVENT_ADMIN_TOKEN");
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
