import { useEffect, useRef } from "react";
import { api } from "../services/api";
import {
  fetchTelemetry,
  fetchUser,
  fetchVehicles,
  vehicleStore,
} from "../stores/vehicleStore";
import { fetchChargingSessions } from "../stores/chargingHistoryStore";
import {
  REFRESH_INTERVAL,
} from "../stores/refreshTimerStore";

export default function DashboardController({ vin: initialVin }) {
  const isMounted = useRef(true);
  const pollingInFlight = useRef(false);

  useEffect(() => {
    isMounted.current = true;

    const init = async () => {
      let targetVin = initialVin || vehicleStore.get().vin;

      await fetchUser();
      if (!isMounted.current) return;

      // If no VIN, fetch it
      if (!targetVin) {
        // fetchVehicles automatically calls switchVehicle -> fetchTelemetry
        targetVin = await fetchVehicles();
        if (!isMounted.current) return;
      } else {
        // If VIN was passed via props/initial state, ensure we have initial telemetry
        await fetchTelemetry(targetVin);
        if (!isMounted.current) return;
      }

      if (targetVin) {
        // Preload full charging history for dashboard stats.
        void fetchChargingSessions(targetVin);
      }

      // If still no VIN or failed to fetch, redirect to login
      if (!targetVin && isMounted.current) {
        console.warn(
          "No vehicle found or init failed. Clearing session and redirecting.",
        );
        api.clearSession();
        window.location.href = "/login";
        return;
      }
    };

    init();

    return () => {
      isMounted.current = false;
    };
  }, [initialVin]); // Only run on load or if SSR vin changes

  // Polling Effect
  useEffect(() => {
    const poll = async () => {
      const currentVin = vehicleStore.get().vin || initialVin;
      if (!currentVin || pollingInFlight.current || !isMounted.current) return;

      pollingInFlight.current = true;
      try {
        await fetchTelemetry(currentVin);
      } finally {
        pollingInFlight.current = false;
      }
    };

    // Polling Interval: 5 hours (18000000 ms)
    const interval = setInterval(() => {
      poll();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [initialVin]);

  return null; // Headless
}
