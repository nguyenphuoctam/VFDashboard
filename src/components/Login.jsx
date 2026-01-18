import { useState } from "react";
import { api } from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [region, setRegion] = useState("vn"); // Default to Vietnam
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [regionDropdownOpen, setRegionDropdownOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.authenticate(email, password, region);

      // Successful login
      window.location.href = "/";
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: "url('/vf9-interior.png')" }}
    >
      {/* Overlay for Blur and Darkening */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md space-y-6">
        {/* Light Theme Login Card - Dashboard Style */}
        <div className="relative rounded-3xl bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 backdrop-blur-sm">
          {/* Error Toast - Absolute Position: Above Card */}
          {error && (
            <div className="absolute bottom-full left-0 w-full flex justify-center mb-5 animate-bounce-in">
              <div
                className="flex items-center w-full max-w-xs p-3 space-x-3 text-gray-500 bg-white rounded-2xl shadow-xl border border-red-100"
                role="alert"
              >
                <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-red-500 bg-red-50 rounded-xl">
                  <svg
                    className="w-5 h-5"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z" />
                  </svg>
                  <span className="sr-only">Error icon</span>
                </div>
                <div
                  className="ms-3 text-sm font-bold text-gray-900 truncate"
                  title={error}
                >
                  {error}
                </div>
                <button
                  type="button"
                  onClick={() => setError("")}
                  className="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8"
                  aria-label="Close"
                >
                  <span className="sr-only">Close</span>
                  <svg
                    className="w-3 h-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
          <div className="flex justify-center mb-6">
            {/* VinFast Logo */}
            <img
              src="/vinfast-logo.png"
              alt="VinFast"
              className="h-10 object-contain"
            />
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <input
                  type="email"
                  required
                  className="relative block w-full rounded-xl border-gray-200 bg-gray-50 py-3.5 px-4 text-gray-900 focus:z-10 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 font-medium placeholder:text-gray-400 text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <input
                  type="password"
                  required
                  className="relative block w-full rounded-xl border-gray-200 bg-gray-50 py-3.5 px-4 text-gray-900 focus:z-10 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 font-medium placeholder:text-gray-400 text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <div className="text-sm flex items-center bg-gray-50 px-3 py-1.5 rounded-lg">
                <label
                  htmlFor="region"
                  className="font-bold text-gray-500 text-xs uppercase tracking-wider mr-2"
                >
                  Region
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setRegionDropdownOpen(!regionDropdownOpen)}
                    className="flex items-center gap-2 bg-transparent text-gray-900 text-sm font-bold focus:outline-none"
                  >
                    {region === "vn"
                      ? "Vietnam"
                      : region === "us"
                        ? "United States"
                        : "Europe"}
                    <svg
                      className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${regionDropdownOpen ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Custom Dropdown Menu */}
                  {regionDropdownOpen && (
                    <>
                      {/* Backdrop to close */}
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setRegionDropdownOpen(false)}
                      ></div>

                      {/* Menu */}
                      <div className="absolute top-full left-0 mt-2 w-40 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 p-1.5 z-20 animate-in fade-in zoom-in-95 duration-200 origin-top-left">
                        {[
                          { val: "vn", label: "Vietnam" },
                          { val: "us", label: "United States" },
                          { val: "eu", label: "Europe" },
                        ].map((opt) => (
                          <button
                            key={opt.val}
                            type="button"
                            onClick={() => {
                              setRegion(opt.val);
                              setRegionDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                              region === opt.val
                                ? "bg-blue-50 text-blue-600"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full justify-center rounded-xl bg-blue-600 py-3.5 px-4 text-sm font-black text-white uppercase tracking-wider hover:bg-blue-700 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-blue-200/50 shadow-md"
              >
                {loading ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  "Sign In"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer: Centered Text */}
        <div className="relative flex items-center justify-between px-6 py-4 bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">
            Made with <span className="text-red-500 text-sm">❤️</span> in
            Vietnam
          </p>
          <div className="">
            <img
              src="/vf9-club-logo-v2.png"
              alt="VF9 Club"
              className="h-6 object-contain opacity-80 grayscale hover:grayscale-0 transition-all duration-300"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
