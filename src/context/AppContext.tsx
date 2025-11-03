/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useState,
  useEffect,
  type ReactNode,
  type FC,
} from "react";

interface User {
  name: string;
  email: string;
}

interface AppContextProps {
  user: User | null;
  setUser: (user: User | null) => void;
  token: string | null;
  setToken: (token: string | null) => void;
}

export const AppContext = createContext<AppContextProps>({
  user: null,
  setUser: () => {},
  token: null,
  setToken: () => {},
});

export const AppProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("plutospace_token");
    const storedUser = localStorage.getItem("plutospace_user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser) as User);
    } else {
      const fakeToken = "mock_dev_token_123";
      const fakeUser: User = {
        name: "Dev User",
        email: "dev@plutospace.io",
      };

      localStorage.setItem("plutospace_token", fakeToken);
      localStorage.setItem("plutospace_user", JSON.stringify(fakeUser));
      setToken(fakeToken);
      setUser(fakeUser);
    }
  }, []);

  return (
    <AppContext.Provider value={{ user, setUser, token, setToken }}>
      {children}
    </AppContext.Provider>
  );
};
