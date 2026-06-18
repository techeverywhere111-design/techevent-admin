import { useRouteError, isRouteErrorResponse, useNavigate } from "react-router-dom";
import Logo from "@/assets/PlutoEvent_Logo.png";
import { Home, ArrowLeft, AlertOctagon } from "lucide-react";

export default function ErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();

  let title = "Error";
  let message = "An unexpected error occurred.";
  let is404 = false;

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      title = "404";
      message = "Oops! The page you're looking for has drifted away.";
      is404 = true;
    } else {
      title = `${error.status}`;
      message = error.statusText || error.data?.message || message;
    }
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="min-h-screen bg-[#0B1739] text-white flex flex-col justify-between p-6 relative overflow-hidden select-none">
      {/* Decorative stars/glowing circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-700" />
      
      {/* Top Header */}
      <header className="flex items-center justify-between max-w-7xl w-full mx-auto relative z-10">
        <div className="flex items-center gap-3">
          <img src={Logo} alt="PlutoSpace" className="h-10 w-auto" />
          <span className="font-semibold text-lg tracking-wider text-gray-200">PLUTOSPACE</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center text-center max-w-2xl mx-auto px-4 relative z-10 my-12">
        {/* Floating/Glow Effect for status code */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-sky-500/20 rounded-full blur-2xl transform scale-75" />
          <h1 className="text-9xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-sky-400 to-indigo-600 select-all relative animate-bounce [animation-duration:3s]">
            {title}
          </h1>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-white">
          {is404 ? "Lost in Pluto's Orbit?" : "System Anomaly Detected"}
        </h2>
        <p className="text-gray-400 mb-8 max-w-md text-base leading-relaxed">
          {message}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-sm">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 transition font-medium text-sm text-gray-200"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
          
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-sky-500 hover:bg-sky-600 transition font-semibold text-sm text-white shadow-lg shadow-sky-500/20 hover:shadow-sky-500/30"
          >
            <Home size={16} />
            Dashboard
          </button>
        </div>


        {!is404 && !!error && (
          <div className="mt-8 w-full max-w-lg text-left bg-gray-900/50 border border-gray-800 rounded-lg p-4 font-mono text-xs overflow-x-auto text-gray-400">
            <div className="flex items-center gap-2 text-red-400 mb-2 font-bold">
              <AlertOctagon size={14} />
              Technical details:
            </div>
            <pre className="whitespace-pre-wrap">
              {error instanceof Error ? error.stack : JSON.stringify(error, null, 2)}
            </pre>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-500 relative z-10 max-w-7xl mx-auto w-full">
        &copy; {new Date().getFullYear()} PlutoSpace Admin Portal. All rights reserved.
      </footer>
    </div>
  );
}
