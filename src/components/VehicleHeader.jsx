import React from "react";
import { useStore } from "@nanostores/react";
import {
  vehicleStore,
  fetchTelemetry,
  fetchFullTelemetry,
} from "../stores/vehicleStore";
import { api } from "../services/api";
import AboutModal from "./AboutModal";

// Weather Icon (Dynamic WMO Codes)
const WeatherIcon = ({ temp, code }) => {
  // WMO Weather Codes:
  // 0: Clear sky
  // 1-3: Partly cloudy
  // 45,48: Fog
  // 51-67: Drizzle/Rain
  // 71-77: Snow
  // 80-82: Showers
  // 95-99: Thunderstorm

  let icon = (
    <svg
      className="w-5 h-5 text-blue-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      ></path>
    </svg>
  ); // Default Sun

  if (code !== undefined && code !== null) {
    if (code >= 1 && code <= 3) {
      // Cloud
      icon = (
        <svg
          className="w-5 h-5 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
          />
        </svg>
      );
    } else if (code >= 45 && code <= 48) {
      // Fog (Cloud + horizontal lines)
      icon = (
        <svg
          className="w-5 h-5 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z M10 20h4 M8 18h8"
          />
        </svg>
      );
    } else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
      // Rain (Cloud + Drops)
      icon = (
        <svg
          className="w-5 h-5 text-blue-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M20 16.2A4.5 4.5 0 0017.5 8h-1.8A7 7 0 104 14.9 M16 22v-2 M12 22v-2 M8 22v-2"
          />
        </svg>
      );
    } else if (code >= 71 && code <= 77) {
      // Snow (Snowflake)
      icon = (
        <svg
          className="w-5 h-5 text-cyan-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 3v18M3 12h18M7.5 7.5l9 9M16.5 7.5l-9 9"
          />
        </svg>
      );
    } else if (code >= 95) {
      // Thunder
      icon = (
        <svg
          className="w-5 h-5 text-amber-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      );
    }
  }

  return (
    <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
      {icon}
      <span className="text-sm font-bold text-blue-700">
        {temp !== null && temp !== undefined ? `${temp}°C` : "N/A"}
      </span>
    </div>
  );
};

export default function VehicleHeader({ onOpenTelemetry }) {
  const vehicle = useStore(vehicleStore);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [showAbout, setShowAbout] = React.useState(false);

  const handleRefresh = () => {
    fetchTelemetry(vehicle.vin);
  };

  const handleLogout = async () => {
    try {
      // Best effort server logout
      await fetch(`${import.meta.env.PUBLIC_API_URL || ""}/api/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (e) {
      console.error("Logout failed", e);
    }

    // Critical: Clear local session before redirecting
    // This prevents Login page from auto-redirecting back to Dashboard
    if (api && typeof api.clearSession === "function") {
      api.clearSession();
    }

    window.location.href = "/login";
  };

  // Format Last Updated (Client-Side Only to avoid hydration mismatch)
  const [lastUpdatedTime, setLastUpdatedTime] = React.useState("--:--");

  React.useEffect(() => {
    if (vehicle.lastUpdated) {
      setLastUpdatedTime(
        new Date(vehicle.lastUpdated).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    } else {
      setLastUpdatedTime("N/A");
    }
  }, [vehicle.lastUpdated]);

  return (
    <div className="flex items-center justify-between py-2 mb-2">
      {/* Left: Branding & Model */}
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-full overflow-hidden shadow-md border border-gray-100/50 shrink-0">
          <img
            src="/logo.png"
            alt="VF9 Club"
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight leading-none flex items-center gap-2">
            <span className="hidden md:inline">VinFast </span>
            {!vehicle.vin ? (
              <div className="h-6 w-24 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <span className="hidden md:inline">
                {vehicle.marketingName || vehicle.model || (
                  <span className="animate-pulse bg-gray-200 text-transparent rounded px-2">
                    VF9
                  </span>
                )}
              </span>
            )}
          </h1>
          {!vehicle.vin ? (
            /* Skeleton Loader for Subtitle */
            <div className="flex items-center gap-2 w-full mt-1">
              <div className="h-3 w-32 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-3 w-16 bg-gray-200 animate-pulse rounded"></div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row md:items-center items-start gap-1 md:gap-2 mt-1">
              {/* VIN Badge - Simplified for mobile */}
              <span
                className="text-[10px] md:text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded text-transform uppercase"
                title={vehicle.vin}
              >
                <span className="md:hidden font-bold text-gray-700">
                  VinFast {vehicle.marketingName || vehicle.model || "VF9"}{" "}
                  •{" "}
                </span>
                {vehicle.vin || "..."}
              </span>

              {/* Vehicle Details (Variant, Battery, Year, Color) */}
              <div className="flex items-center gap-1.5 md:gap-2 flex-wrap text-[10px] md:text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded md:bg-transparent md:px-0 md:py-0">
                <span className="hidden md:block h-1 w-1 rounded-full bg-gray-300"></span>
                <span>{vehicle.vehicleVariant}</span>

                {vehicle.battery_type && (
                  <>
                    <span className="hidden md:block h-1 w-1 rounded-full bg-gray-300"></span>
                    <span className="md:hidden text-gray-300">•</span>
                    <span className="uppercase">{vehicle.battery_type}</span>
                  </>
                )}

                <span className="hidden md:block h-1 w-1 rounded-full bg-gray-300"></span>
                <span className="md:hidden text-gray-300">•</span>
                <span>{vehicle.yearOfProduct}</span>

                <span className="hidden md:block h-1 w-1 rounded-full bg-gray-300"></span>
                <span className="md:hidden text-gray-300">•</span>
                <span>{vehicle.color}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Actions & Context */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex">
          <WeatherIcon
            temp={vehicle.weather_outside_temp}
            code={vehicle.weather_code}
          />
        </div>

        {/* Last Updated & Refresh Group */}
        <button
          onClick={handleRefresh}
          disabled={vehicle.isRefreshing}
          title="Refresh Data"
          className="flex items-center gap-2 bg-white px-2 pr-3 h-9 rounded-full border border-gray-200 shadow-sm ml-1 hover:border-indigo-200 hover:text-indigo-600 transition-all active:scale-95 text-gray-500 cursor-pointer"
        >
          {/* Refresh Icon */}
          <div className="p-1.5 rounded-full">
            <svg
              className={`w-4 h-4 ${vehicle.isRefreshing ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              ></path>
            </svg>
          </div>

          {/* Time Display (Right) */}
          <div className="hidden md:flex flex-col items-start leading-none">
            <span className="text-[8px] opacity-70 uppercase font-bold tracking-wider mb-0.5">
              Updated
            </span>
            <span className="text-xs font-mono font-bold tabular-nums leading-none">
              {lastUpdatedTime}
            </span>
          </div>
        </button>

        {/* Full Telemetry Button */}
        <button
          onClick={onOpenTelemetry}
          title="Full Telemetry Scan"
          className="hidden md:flex items-center gap-2 px-3 h-9 bg-white text-gray-600 hover:text-indigo-600 hover:border-indigo-200 border border-gray-200 rounded-full transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
            />
          </svg>
          <span className="text-xs font-bold">Deep Scan</span>
        </button>

        <div className="h-6 w-px bg-gray-200 mx-1"></div>

        {/* User Profile / Logout */}
        <div className="flex items-center gap-3 pl-1">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-gray-900 leading-none">
              {vehicle.user_name}
            </p>
            <p className="text-xs text-gray-400 mt-0.5 font-medium tracking-wide">
              {vehicle.userVehicleType
                ? vehicle.userVehicleType
                    .replace("ROLE_", "")
                    .toLowerCase()
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())
                : ""}
            </p>
          </div>
          {/* Avatar Dropdown */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="group flex items-center justify-center h-10 w-10 cursor-pointer focus:outline-none"
              title="Menu"
            >
              <img
                src={
                  vehicle.user_avatar
                    ? vehicle.user_avatar
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(vehicle.user_name || "VinFast User")}&background=0D8ABC&color=fff`
                }
                alt="User"
                className="h-10 w-10 rounded-full border-2 border-white shadow-sm group-hover:ring-2 group-hover:ring-offset-2 group-hover:ring-blue-500 transition-all"
              />
            </button>

            {menuOpen && (
              <>
                {/* Backdrop to close */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMenuOpen(false)}
                ></div>

                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                  <div className="px-4 py-2 border-b border-gray-50 mb-1">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Account
                    </p>
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {vehicle.user_name}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setShowAbout(true);
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    About
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
    </div>
  );
}
