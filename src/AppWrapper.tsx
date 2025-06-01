import React, { useEffect } from "react";
import { ConfigProvider, theme } from "antd";
import { useDarkModeStore } from "./stores/darkModeStore";

const { darkAlgorithm, defaultAlgorithm } = theme;

const AppWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const darkMode = useDarkModeStore((state) => state.darkMode);
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [darkMode]);
  
  return (
    <ConfigProvider
      theme={{
        algorithm: darkMode ? darkAlgorithm : defaultAlgorithm,
      }}
    >
      {children}
    </ConfigProvider>
  );
};

export default AppWrapper;