import { createContext, useContext } from 'react';

interface AppLayoutContext {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Context = createContext<AppLayoutContext>({
  sidebarOpen: false,
  setSidebarOpen: () => {},
});

const { Provider: AppLayoutProvider } = Context;

export const useAppLayout = () => useContext(Context);

export { AppLayoutProvider };
