import React from "react";
import Logo from "@/assets/PlutoEvent_Logo.png";

const Login: React.FC = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Panel */}
      <div
        className="relative w-1/2 flex flex-col justify-center items-center text-white bg-[#0B1739]"
        style={{
          clipPath: "polygon(70% 100%, 0% 100%, 0 0, 85% 0 )",
        }}
      >
        <div className="text-center space-y-2">
          <div className="flex items-center space-x-2">
            <img src={Logo} alt="Logo" className="h-24 w-auto" />
          </div>
          <p className="text-gray-300 italic text-sm tracking-wide">
            Manage. Monitor. Control.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex w-1/2 justify-center items-center bg-white">
        <div className="w-full max-w-sm px-6">
          <h2 className="text-2xl font-semibold text-center mb-2">
            Admin Sign in
          </h2>
          <p className="text-center text-gray-500 mb-6 text-sm">
            Sign in to keep everything running smoothly.
          </p>

          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-sky-500 hover:bg-sky-600 text-white py-2 rounded-md transition"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
