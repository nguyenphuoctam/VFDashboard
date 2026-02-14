import { map } from "nanostores";
import { api } from "../services/api";
import { DEFAULT_LOCATION } from "../constants/vehicle";
import { resetRefreshTimer, setRefreshing } from "./refreshTimerStore";

export interface VehicleInfo {
  vinCode: string;
  marketingName?: string;
  vehicleVariant?: string; // e.g., "PLUS"
  color?: string; // Hex or Name
  exteriorColor?: string;
  interiorColor?: string;
  yearOfProduct?: number;
  vehicleName?: string;
  customizedVehicleName?: string;
  userVehicleType?: string; // "OWNER" etc.
  vehicleImage?: string;
  profileImage?: string;
  warrantyExpirationDate?: string | null;
  warrantyMileage?: number | null;
  vehicleAliasVersion?: string;
}

export interface VehicleState {
  // Store Metadata
  vehicles: VehicleInfo[]; // List of all available vehicles
  vehicleCache: Record<string, Partial<VehicleState>>; // Cache for switched vehicles

  battery_level: number | null;
  range: number | null;
  odometer: number | null;
  charging_status: number | boolean;
  speed: number | null;
  // Location
  latitude: number;
  longitude: number;

  // Display Info
  vin: string | null;
  model: string;
  trim: string;
  user_name: string;
  user_avatar: string;
  vinfast_profile_image?: string; // Authoritative image from User-Vehicle API

  // Extended Header Info
  marketingName?: string;
  vehicleVariant?: string;
  color?: string;
  yearOfProduct?: number;
  customizedVehicleName?: string;
  userVehicleType?: string;
  vehicleImage?: string; // Link image from API
  manufacturer?: string;
  interiorColor?: string;

  // Climate
  outside_temp?: number | null;
  weather_outside_temp?: number | null;
  inside_temp?: number | null; // From Telemetry
  fan_speed?: number | null;

  // ECU
  bms_version?: string;
  gateway_version?: string;
  ecu_head_unit?: string;
  ecu_tailgate?: string;
  ecu_door_control?: string;
  ecu_seat_control?: string;

  ignition_status?: number | string | null;
  heading?: number;

  // Detailed Versions
  mhu_version?: string;
  vcu_version?: string;
  bcm_version?: string;

  // Vehicle Status
  firmware_version?: string;
  tbox_version?: string;
  thermal_warning?: string | number; // 1 = Warning, 0 = Normal
  service_alert?: string | number;
  next_service_mileage?: number | null;
  next_service_date?: string | null;
  service_appointment_id?: string | null;
  service_appointment_status?: string | null;

  // Driving Stats
  central_lock_status?: boolean; // True=Locked?
  handbrake_status?: boolean; // True=Engaged
  window_status?: string | number; // Window state

  // Warranty
  warrantyExpirationDate?: string | null;
  warrantyMileage?: number | null;

  // Doors
  door_fl?: boolean;
  door_fr?: boolean;
  door_rl?: boolean;
  door_rr?: boolean;
  trunk_status?: boolean;
  hood_status?: boolean;
  // Tires (Bar/kPa and Temp)
  tire_pressure_fl?: number | null;
  tire_pressure_fr?: number | null;
  tire_pressure_rl?: number | null;
  tire_pressure_rr?: number | null;
  tire_temp_fl?: number | null;
  tire_temp_fr?: number | null;
  tire_temp_rl?: number | null;
  tire_temp_rr?: number | null;

  // Control / Status
  gear_position?: string | null; // P, R, N, D, S
  is_locked?: boolean | null;

  // Climate Details
  climate_driver_temp?: number | null;
  climate_passenger_temp?: number | null;

  // Module C - Battery Details
  target_soc?: number | null;
  remaining_charging_time?: number | null;
  battery_health_12v?: string | null; // OK/Low
  soh_percentage?: number | null;
  battery_type?: string;
  battery_serial?: string | null;
  battery_manufacture_date?: string | null;
  // Full Telemetry Cache
  fullTelemetryData: Record<string, any[]>; // VIN -> Raw Array
  fullTelemetryAliases: Record<string, any[]>; // VIN -> Alias Array
  fullTelemetryTimestamps: Record<string, number>; // VIN -> Timestamp
  isScanning: boolean;
  debugLog?: any[]; // For storing deep scan candidates

  lastUpdated: number;
  isRefreshing?: boolean;
  isInitialized?: boolean;
  isEnriching?: boolean; // True when fetching Location/Weather externally
}

// Demo Mode / Default State
export const vehicleStore = map<VehicleState>({
  vehicles: [],
  vehicleCache: {},

  vin: null,
  model: "",
  trim: "",
  user_name: "",
  user_avatar: "",

  battery_level: null,
  range: null,
  odometer: null,
  charging_status: false,
  speed: null,
  latitude: DEFAULT_LOCATION.LATITUDE,
  longitude: DEFAULT_LOCATION.LONGITUDE,

  // Control
  gear_position: null,
  is_locked: null,

  // Climate
  climate_driver_temp: null,
  climate_passenger_temp: null,
  fan_speed: null,
  outside_temp: null,
  inside_temp: null,

  // Tires
  tire_pressure_fl: null,
  tire_temp_fl: null,
  tire_pressure_fr: null,
  tire_temp_fr: null,
  tire_pressure_rl: null,
  tire_temp_rl: null,
  tire_pressure_rr: null,
  tire_temp_rr: null,

  // Doors (Closed)
  door_fl: false,
  door_fr: false,
  door_rl: false,
  door_rr: false,
  trunk_status: false,
  hood_status: false,

  // New Status
  handbrake_status: false,
  window_status: undefined,

  // Battery Details (Module C)
  target_soc: null,
  remaining_charging_time: null,
  soh_percentage: null,
  battery_health_12v: null,
  battery_type: "--",
  battery_serial: null,
  battery_manufacture_date: null,

  // ECU
  bms_version: "--",
  gateway_version: "--",
  ecu_head_unit: "--",

  ignition_status: null,
  heading: 0,

  mhu_version: "--",
  vcu_version: "--",
  bcm_version: "--",

  central_lock_status: undefined,

  // Warranty
  warrantyExpirationDate: null,
  warrantyMileage: null,

  // Vehicle Status
  firmware_version: "--",
  tbox_version: "--",
  thermal_warning: 0,
  service_alert: 0,
  next_service_mileage: null,
  next_service_date: null,
  service_appointment_id: null,
  service_appointment_status: null,

  // Full Telemetry Cache
  fullTelemetryData: {},
  fullTelemetryAliases: {},
  fullTelemetryTimestamps: {},
  isScanning: false,
  debugLog: [],

  lastUpdated: Date.now(),
  isRefreshing: false,
  isInitialized: false,
  isEnriching: false,
});

const telemetryFetchInFlight = new Map<string, Promise<void>>();
let telemetryInFlightCount = 0;

export const updateVehicleData = (data: Partial<VehicleState>) => {
  const current = vehicleStore.get();
  // We expect 'vin' to be provided in 'data' for robust handling.
  // If not provided, we fallback to current.vin, but this is risky for background updates.
  const targetVin = data.vin || current.vin;

  if (!targetVin) return;

  // Ensure lastUpdated is present for cache consistency
  const timestamp = data.lastUpdated || Date.now();
  const dataToCache = { ...data, lastUpdated: timestamp };

  // 1. Update Cache
  const latest = vehicleStore.get();
  const currentCache = latest.vehicleCache[targetVin] || {};
  const newCacheEntry = { ...currentCache, ...dataToCache };
  const newVehicleCache = {
    ...latest.vehicleCache,
    [targetVin]: newCacheEntry,
  };

  // 2. Update Store
  if (targetVin === latest.vin) {
    // If active vehicle, update both telemetry and cache in one go
    vehicleStore.set({
      ...latest,
      ...dataToCache,
      vehicleCache: newVehicleCache,
    });
  } else {
    // If background vehicle, only update the cache
    vehicleStore.setKey("vehicleCache", newVehicleCache);
  }
};

// Initial State (Clean Slate for Resetting)
const INITIAL_TELEMETRY: Partial<VehicleState> = {
  battery_level: null,
  range: null,
  odometer: null,
  charging_status: false,
  speed: null,
  latitude: DEFAULT_LOCATION.LATITUDE,
  longitude: DEFAULT_LOCATION.LONGITUDE,

  // Control
  gear_position: null,
  is_locked: null,

  // Climate
  climate_driver_temp: null,
  climate_passenger_temp: null,
  fan_speed: null,
  outside_temp: null,
  inside_temp: null,

  // Tires
  tire_pressure_fl: null,
  tire_temp_fl: null,
  tire_pressure_fr: null,
  tire_temp_fr: null,
  tire_pressure_rl: null,
  tire_temp_rl: null,
  tire_pressure_rr: null,
  tire_temp_rr: null,

  // Doors
  door_fl: false,
  door_fr: false,
  door_rl: false,
  door_rr: false,
  trunk_status: false,
  hood_status: false,

  // New Status
  handbrake_status: false,
  window_status: undefined,

  // Battery
  target_soc: null,
  remaining_charging_time: null,
  soh_percentage: null,
  battery_health_12v: null,
  battery_type: "--",
  battery_serial: null,
  battery_manufacture_date: null,

  // Full Telemetry
  fullTelemetryData: {},
  fullTelemetryTimestamps: {},
  isScanning: false,

  // ECU & Versions
  bms_version: "--",
  gateway_version: "--",
  ecu_head_unit: "--",
  ignition_status: null,
  heading: 0,
  mhu_version: "--",
  vcu_version: "--",
  bcm_version: "--",

  central_lock_status: undefined,

  // Vehicle Status
  firmware_version: "--",
  tbox_version: "--",
  thermal_warning: 0,
  service_alert: 0,
  next_service_mileage: null,
  next_service_date: null,
  service_appointment_id: null,
  service_appointment_status: null,
};

const getVehicleBaseState = (
  vehicleInfo: any,
  current: VehicleState,
): Partial<VehicleState> => {
  return {
    vin: vehicleInfo.vinCode,
    marketingName: vehicleInfo.marketingName,
    vehicleVariant: vehicleInfo.vehicleVariant,
    color: vehicleInfo.exteriorColor || vehicleInfo.color,
    yearOfProduct: vehicleInfo.yearOfProduct,
    interiorColor: vehicleInfo.interiorColor,
    customizedVehicleName:
      vehicleInfo.customizedVehicleName || vehicleInfo.vehicleName,
    userVehicleType: vehicleInfo.userVehicleType,
    vehicleImage: vehicleInfo.vehicleImage, // from API
    vinfast_profile_image: vehicleInfo.profileImage, // Authoritative
    // Only update avatar if present
    user_avatar: vehicleInfo.profileImage || current.user_avatar,
    // Warranty
    warrantyExpirationDate: vehicleInfo.warrantyExpirationDate,
    warrantyMileage: vehicleInfo.warrantyMileage,
  };
};

export const switchVehicle = async (targetVin: string) => {
  const current = vehicleStore.get();

  // 1. Find the vehicle in the list
  const vehicleInfo = current.vehicles.find((v) => v.vinCode === targetVin);
  if (!vehicleInfo) {
    console.error("Vehicle not found during switch", targetVin);
    return;
  }

  // 2. Prepare Base State from Vehicle Info
  const baseState = getVehicleBaseState(vehicleInfo, current);

  // 3. Hydrate from Cache if available
  const cachedData = current.vehicleCache[targetVin] || {};

  // Check if cache has telemetry (indicated by lastUpdated)
  const hasTelemetry = !!cachedData.lastUpdated;

  // Merge: Current State -> Reset Telemetry -> Base State -> Cached Data
  vehicleStore.set({
    ...current,
    ...INITIAL_TELEMETRY,
    ...baseState,
    ...cachedData,
    vin: targetVin,
    isRefreshing: !hasTelemetry, // Only show loading if we don't have telemetry
  });

  // 4. Trigger Background Refresh (Only if no telemetry in cache)
  if (!hasTelemetry) {
    fetchTelemetry(targetVin);
  }
};

export const refreshVehicle = async (vin: string) => {
  if (!vin) return;
  const current = vehicleStore.get();

  // 1. Reset Cache for ALL vehicles to just Base State (removing telemetry)
  const newCache: Record<string, Partial<VehicleState>> = {};
  current.vehicles.forEach((v) => {
    const baseState = getVehicleBaseState(v, current);
    newCache[v.vinCode] = baseState;
  });

  // 2. Clear main store telemetry immediately if requested vehicle is active
  if (current.vin === vin) {
    vehicleStore.set({
      ...current,
      ...INITIAL_TELEMETRY,
      vehicleCache: newCache,
      isRefreshing: true,
    });
  } else {
    vehicleStore.setKey("vehicleCache", newCache);
  }

  // 3. Fetch fresh data for the requested vehicle
  await fetchTelemetry(vin);
};

export const fetchTelemetry = async (vin: string) => {
  if (!vin) return;

  let success = false;

  const existing = telemetryFetchInFlight.get(vin);
  if (existing) return existing;

  const fetchTask = (async () => {
    telemetryInFlightCount += 1;

    if (telemetryInFlightCount === 1) {
      // Set refreshing state only for first concurrent call.
      vehicleStore.setKey("isRefreshing", true);
      vehicleStore.setKey("isEnriching", true);
      setRefreshing(true);
    }

    try {
      const data = await api.getTelemetry(vin);
      if (data) {
        updateVehicleData({ ...data, vin });
        success = true;
      }
    } catch (e) {
      console.error("Telemetry Refresh Error", e);
    } finally {
      telemetryInFlightCount = Math.max(0, telemetryInFlightCount - 1);

      if (telemetryInFlightCount === 0) {
        vehicleStore.setKey("isRefreshing", false);
        vehicleStore.setKey("isEnriching", false);
        setRefreshing(false);

        if (success) {
          resetRefreshTimer(); // Reset the countdown timer only after successful refresh
          if (!vehicleStore.get().isInitialized) {
            vehicleStore.setKey("isInitialized", true);
          }
        }
      }
    }
  })();

  telemetryFetchInFlight.set(vin, fetchTask);
  try {
    await fetchTask;
  } finally {
    if (telemetryFetchInFlight.get(vin) === fetchTask) {
      telemetryFetchInFlight.delete(vin);
    }
  }
};

export const fetchFullTelemetry = async (vin: string, force = false) => {
  if (!vin) return;
  const current = vehicleStore.get();
  const now = Date.now();
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  const lastFetch = current.fullTelemetryTimestamps[vin] || 0;
  if (
    !force &&
    now - lastFetch < CACHE_DURATION &&
    current.fullTelemetryData[vin]
  ) {
    console.log("Using cached full telemetry for", vin);
    return;
  }

  vehicleStore.setKey("isScanning", true);

  try {
    // 1. Get Vehicle Info for Alias Version
    const vehicleInfo = current.vehicles.find((v) => v.vinCode === vin);
    const version = vehicleInfo?.vehicleAliasVersion || "1.0";
    console.log(
      `fetchFullTelemetry: vin=${vin}, version=${version}, foundInfo=${!!vehicleInfo}`,
    );

    // 2. Fetch Aliases
    let resources = await api.getAliases(vin, version);

    // Fallback if no resources found for the specific version
    if ((!resources || resources.length === 0) && version !== "1.0") {
      console.log(
        `fetchFullTelemetry: No aliases for version ${version}, trying fallback to 1.0`,
      );
      resources = await api.getAliases(vin, "1.0");
    }

    if (!resources || resources.length === 0) {
      console.error(
        "fetchFullTelemetry: No aliases (including fallback) returned from API",
        { vin },
      );
      throw new Error("No aliases found for vehicle");
    }

    console.log(`fetchFullTelemetry: Found ${resources.length} resources`);

    // --- DEEP SCAN: FIND INTERESTING ALIASES ---
    const interestingKeywords = [
      "SERVICE",
      "MAINTENANCE",
      "WARRANTY",
      "BOOKING",
      "APPOINTMENT",
      "NEXT",
      "SCHEDULE",
      "OTA",
      "UPDATE",
      "FIRMWARE",
      "VERSION",
      "ENERGY",
      "CONSUMPTION",
      "EFFICIENCY",
      "TRIP",
      "HISTORY",
      "NOTIFICATION",
      "ALERT",
      "ERROR",
      "FAULT",
      "DIAGNOSTIC",
      "RECALL",
      "CAMPAIGN",
    ];

    const candidates = resources.filter((r: any) => {
      const name = (r.resourceName || "").toUpperCase();
      const alias = (r.alias || "").toUpperCase();
      return interestingKeywords.some(
        (keyword) => name.includes(keyword) || alias.includes(keyword),
      );
    });

    // Always store candidates (even if empty, to clear old data)
    console.log(
      `Deep Scan: Found ${candidates.length} interesting aliases`,
      candidates.slice(0, 10),
    );
    vehicleStore.setKey("debugLog", candidates);
    // ------------------------------------------

    // 3. Map to Request Objects
    const requestObjects = resources
      .filter((item: any) => item.devObjID)
      .map((item: any) => ({
        objectId: item.devObjID,
        instanceId: item.devObjInstID || "0",
        resourceId: item.devRsrcID || "0",
      }));

    // 4. Fetch Raw Telemetry
    const rawData = await api.getRawTelemetry(vin, requestObjects);

    // 5. Update Store & Cache
    const newFullData = { ...current.fullTelemetryData, [vin]: rawData };
    const newFullAliases = {
      ...current.fullTelemetryAliases,
      [vin]: resources,
    };
    const newTimestamps = { ...current.fullTelemetryTimestamps, [vin]: now };

    vehicleStore.setKey("fullTelemetryData", newFullData);
    vehicleStore.setKey("fullTelemetryAliases", newFullAliases);
    vehicleStore.setKey("fullTelemetryTimestamps", newTimestamps);
  } catch (e) {
    console.error("Full Telemetry Fetch Error", e);
  } finally {
    vehicleStore.setKey("isScanning", false);
  }
};

export const fetchUser = async () => {
  try {
    const data = await api.getUserProfile();
    if (data) {
      vehicleStore.setKey("user_name", data.name || data.sub);

      // Only set avatar from Auth0 if we don't have a specific VinFast profile image
      const current = vehicleStore.get();
      if (!current.vinfast_profile_image) {
        vehicleStore.setKey("user_avatar", data.picture);
      }
    }
  } catch (e) {
    console.error("User Fetch Error", e);
  }
};

export const fetchVehicles = async (): Promise<string | null> => {
  try {
    const vehicles = await api.getVehicles();

    if (vehicles && vehicles.length > 0) {
      // Deduplicate vehicles based on vinCode
      const uniqueVehicles = Array.from(
        new Map(vehicles.map((v: any) => [v.vinCode, v])).values(),
      );

      // Store all vehicles
      vehicleStore.setKey("vehicles", uniqueVehicles);

      // Populate Cache with Initial Info for all vehicles
      const cache: Record<string, Partial<VehicleState>> = {};
      uniqueVehicles.forEach((v: any) => {
        cache[v.vinCode] = {
          vin: v.vinCode,
          marketingName: v.marketingName,
          vehicleVariant: v.vehicleVariant,
          color: v.exteriorColor || v.color,
          interiorColor: v.interiorColor,
          yearOfProduct: v.yearOfProduct,
          customizedVehicleName: v.customizedVehicleName || v.vehicleName,
          userVehicleType: v.userVehicleType,
          vehicleImage: v.vehicleImage,
          warrantyExpirationDate: v.warrantyExpirationDate,
          warrantyMileage: v.warrantyMileage,
        };
      });
      vehicleStore.setKey("vehicleCache", cache);

      // Automatically switch to the first vehicle
      const firstVin = vehicles[0].vinCode;
      await switchVehicle(firstVin);

      return firstVin;
    }
    return null;
  } catch (e) {
    console.error("Fetch Vehicles Error", e);
    return null;
  }
};
