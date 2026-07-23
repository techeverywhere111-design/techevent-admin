import React from "react";
import Logo from "@/assets/PlutoEvent_Logo.png";

interface AppLoaderProps {
  fullScreen?: boolean;
}

export const AppLoader: React.FC<AppLoaderProps> = ({ fullScreen = true }) => {
  return (
    <div
      className={`flex flex-col items-center justify-center ${
        fullScreen ? "h-screen w-screen bg-gray-50 dark:bg-gray-900" : "h-full w-full py-12"
      }`}
    >
      <div className="relative flex flex-col items-center gap-4">
        <div className="absolute w-24 h-24 bg-blue-500/10 dark:bg-sky-500/10 rounded-full blur-2xl animate-pulse" />
        
        <img
          src={Logo}
          alt="PlutoSpace Loading"
          className="h-14 w-auto relative z-10 animate-pulse [animation-duration:1.5s]"
        />
        
        <span className="font-medium text-xs tracking-widest text-gray-500 dark:text-gray-400 relative z-10 uppercase animate-pulse [animation-duration:1.5s] delay-100">
          Loading...
        </span>
      </div>
    </div>
  );
};

export default AppLoader;
