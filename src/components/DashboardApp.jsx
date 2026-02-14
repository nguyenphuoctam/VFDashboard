import React, { useState, Suspense } from "react";
import { useStore } from "@nanostores/react";
import { vehicleStore, fetchFullTelemetry } from "../stores/vehicleStore";
import DashboardController from "./DashboardController";
import AuthGate from "./AuthGate";
import VehicleHeader from "./VehicleHeader";
import CarStatus from "./CarStatus";
import ChargingHistory from "./ChargingHistory";
import { EnvironmentCard, MapCard } from "./ControlGrid";
import DigitalTwin from "./DigitalTwin";
import SystemHealth from "./SystemHealth";
import MobileNav from "./MobileNav";

// Lazy load heavy components
const TelemetryDrawer = React.lazy(() => import("./TelemetryDrawer"));
const ChargingHistoryDrawer = React.lazy(
  () => import("./ChargingHistoryDrawer"),
);

export default function DashboardApp({ vin: initialVin }) {
  const { isInitialized, vin } = useStore(vehicleStore);
  const [activeTab, setActiveTab] = useState("vehicle");
  const [isTelemetryDrawerOpen, setIsTelemetryDrawerOpen] = useState(false);
  const [isChargingDrawerOpen, setIsChargingDrawerOpen] = useState(false);

  const handleFullScan = async () => {
    if (vin) {
      await fetchFullTelemetry(vin, true);
    }
  };

  const handleOpenTelemetry = () => {
    setIsTelemetryDrawerOpen(true);
  };

  const handleOpenCharging = () => {
    setIsChargingDrawerOpen(true);
  };

  return (
    <>
      {/* Render DashboardController once — persists across loading→initialized transition.
          This prevents the double data-fetch that caused the loading flash. */}
      <DashboardController vin={initialVin} />

      {!isInitialized || !vin ? (
        <AuthGate />
      ) : (
        <div className="fixed inset-0 w-full h-[100dvh] z-0 md:static md:h-auto md:max-w-7xl md:min-w-[1280px] md:mx-auto p-4 md:space-y-6 pb-28 md:pb-4 animate-in fade-in duration-700 flex flex-col overflow-hidden md:overflow-visible">
          <header className="flex-shrink-0 relative z-[60]">
            <VehicleHeader
              onOpenTelemetry={handleOpenTelemetry}
              onOpenCharging={handleOpenCharging}
            />
          </header>

          <main className="flex-1 flex flex-col md:grid md:grid-cols-12 gap-6 min-h-0">
            {/* LEFT COLUMN: Energy (Top) + Vehicle Status (Bottom) */}
            <div
              className={`md:col-span-3 flex flex-col gap-6 ${activeTab === "energy_env" || activeTab === "status" ? "flex-1 min-h-0" : "hidden md:flex"}`}
            >
              {/* Tab 2: Energy — scrollable on mobile (CarStatus + ChargingHistory) */}
              <div
                className={`${activeTab === "energy_env" ? "flex-1 flex flex-col min-h-0 overflow-y-auto md:overflow-visible scrollbar-none" : "hidden md:block"}`}
              >
                <div className="flex-shrink-0">
                  <CarStatus />
                </div>
                {/* Mobile only: inline charging history below energy */}
                {activeTab === "energy_env" && (
                  <div className="md:hidden mt-4 bg-white rounded-3xl p-4 shadow-sm border border-gray-100">
                    <ChargingHistory inline />
                  </div>
                )}
              </div>
              {/* Tab 3: Vehicle Status */}
              <div
                className={`${activeTab === "status" ? "flex-1 block" : "hidden md:flex md:flex-1 md:flex-col"}`}
              >
                <SystemHealth />
              </div>
            </div>

            {/* CENTER COLUMN: Digital Twin */}
            <div
              className={`md:col-span-6 relative bg-gray-800/10 rounded-3xl border border-white/5 shadow-2xl backdrop-blur-sm overflow-hidden md:block flex-1 ${activeTab === "vehicle" ? "flex flex-col" : "hidden md:block"}`}
            >
              <DigitalTwin />
            </div>

            {/* RIGHT COLUMN: Environment (Top) + Location (Bottom) */}
            <div
              className={`md:col-span-3 flex flex-col ${activeTab === "location" ? "gap-0 md:gap-6 flex-1" : "gap-6 hidden md:flex"}`}
            >
              {/* Environment - PC Only */}
              <div className="hidden md:block">
                <EnvironmentCard />
              </div>
              {/* Tab 4: Location */}
              <div
                className={`${activeTab === "location" ? "flex-1 block" : "hidden md:flex md:flex-1 md:flex-col"}`}
              >
                <MapCard />
              </div>
            </div>
          </main>

          <MobileNav
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onScan={handleOpenTelemetry}
          />

          <Suspense fallback={null}>
            {isTelemetryDrawerOpen && (
              <TelemetryDrawer
                isOpen={isTelemetryDrawerOpen}
                onClose={() => setIsTelemetryDrawerOpen(false)}
              />
            )}
            {isChargingDrawerOpen && (
              <ChargingHistoryDrawer
                isOpen={isChargingDrawerOpen}
                onClose={() => setIsChargingDrawerOpen(false)}
              />
            )}
          </Suspense>
        </div>
      )}
    </>
  );
}
