/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useState,
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

  return (
    <AppContext.Provider value={{ user, setUser, token, setToken }}>
      {children}
    </AppContext.Provider>
  );
};

