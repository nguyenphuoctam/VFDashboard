import { map } from "nanostores";
import { api } from "../services/api";

// --- Types (from Charles capture of real API response) ---

export interface ChargingItem {
  cost: number;
  name: string;
  price: number; // per kWh
  from: number; // epoch ms
  to: number; // epoch ms
  unit: string; // "/Kwh"
  energy: number; // kWh
}

export interface ChargingPromotion {
  name: string;
  description: string;
  discount: number;
}

export interface ChargingSession {
  id: string;
  vehicleId: string;
  pluggedTime: number; // epoch ms
  startChargeTime: number; // epoch ms
  endChargeTime: number; // epoch ms
  unpluggedTime: number; // epoch ms
  chargingStationName: string;
  chargingStationAddress: string;
  province: string;
  district: string;
  locationId: string;
  connectorId?: string;
  evseId?: string;
  customerId: string;
  items: ChargingItem[];
  totalKWCharged: string; // e.g. "42.95"
  amount: number; // original cost (VND)
  finalAmount: number; // after discount
  discount: number;
  promotions: ChargingPromotion[];
  orderStatus: number; // 3=completed, 5=?, 7=?
  originStatus: number;
  status: string; // "COMPLETED"
  createdDate: number;
}

// Filter mode: "all" | "year" | "month"
export type FilterMode = "all" | "year" | "month";

interface MonthEntry {
  year: number;
  month: number; // 1-12
  label: string; // "T1/2025"
}

interface ChargingHistoryState {
  /** Sessions filtered by current selection */
  sessions: ChargingSession[];
  /** Total sessions loaded for current VIN (all data) */
  totalLoaded: number;
  totalRecords: number;
  isLoading: boolean;
  /** True while loading remaining pages after first batch */
  isLoadingMore: boolean;
  error: string | null;
  /** Available years from data (newest first) */
  availableYears: number[];
  /** Available months from data (newest first) */
  availableMonths: MonthEntry[];
  /** Current filter mode */
  filterMode: FilterMode;
  /** Selected year (when filterMode = "year" or "month") */
  selectedYear: number;
  /** Selected month 1-12 (when filterMode = "month") */
  selectedMonth: number;
  /** VIN currently loaded */
  loadedVin: string | null;
}

// --- Per-VIN persistent cache ---
// Key = VIN, value = { sessions, totalRecords, fetchedAt }
interface VinCache {
  sessions: ChargingSession[];
  totalRecords: number;
  fetchedAt: number;
}

const vinCacheMap = new Map<string, VinCache>();

// Cache 24h — charging history is basically immutable for past sessions
const CACHE_TTL = 24 * 60 * 60 * 1000;

export const chargingHistoryStore = map<ChargingHistoryState>({
  sessions: [],
  totalLoaded: 0,
  totalRecords: 0,
  isLoading: false,
  isLoadingMore: false,
  error: null,
  availableYears: [],
  availableMonths: [],
  filterMode: "all",
  selectedYear: 0,
  selectedMonth: 0,
  loadedVin: null,
});

// --- Internal helpers ---

function getSessionTime(s: ChargingSession): number {
  return s.startChargeTime || s.pluggedTime || s.createdDate || 0;
}

function extractYears(sessions: ChargingSession[]): number[] {
  const set = new Set<number>();
  for (const s of sessions) {
    const t = getSessionTime(s);
    if (t) set.add(new Date(t).getFullYear());
  }
  return Array.from(set).sort((a, b) => b - a);
}

function extractMonths(
  sessions: ChargingSession[],
  year: number,
): MonthEntry[] {
  const set = new Set<number>();
  for (const s of sessions) {
    const t = getSessionTime(s);
    if (!t) continue;
    const d = new Date(t);
    if (d.getFullYear() === year) set.add(d.getMonth() + 1);
  }
  return Array.from(set)
    .sort((a, b) => b - a)
    .map((m) => ({ year, month: m, label: `T${m}/${year}` }));
}

function filterSessions(
  sessions: ChargingSession[],
  mode: FilterMode,
  year: number,
  month: number,
): ChargingSession[] {
  if (mode === "all") return sessions;
  return sessions.filter((s) => {
    const t = getSessionTime(s);
    if (!t) return false;
    const d = new Date(t);
    if (d.getFullYear() !== year) return false;
    if (mode === "month" && d.getMonth() + 1 !== month) return false;
    return true;
  });
}

function applyFilter(
  allSessions: ChargingSession[],
  mode: FilterMode,
  year: number,
  month: number,
) {
  const filtered = filterSessions(allSessions, mode, year, month);
  const years = extractYears(allSessions);
  const months = year > 0 ? extractMonths(allSessions, year) : [];

  chargingHistoryStore.setKey("sessions", filtered);
  chargingHistoryStore.setKey("totalLoaded", allSessions.length);
  chargingHistoryStore.setKey("availableYears", years);
  chargingHistoryStore.setKey("availableMonths", months);
  chargingHistoryStore.setKey("filterMode", mode);
  chargingHistoryStore.setKey("selectedYear", year);
  chargingHistoryStore.setKey("selectedMonth", month);
}

/**
 * Compute a smart default filter based on first-batch data.
 * - If data spans only the current year → filter by current year
 * - If data has current-month sessions → filter by current month
 * - Otherwise → "all"
 */
function computeSmartDefault(sessions: ChargingSession[]): {
  mode: FilterMode;
  year: number;
  month: number;
} {
  if (sessions.length === 0) return { mode: "all", year: 0, month: 0 };

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // Check if we have sessions in the current year
  const hasCurrentYear = sessions.some((s) => {
    const t = getSessionTime(s);
    return t && new Date(t).getFullYear() === currentYear;
  });

  if (!hasCurrentYear) return { mode: "all", year: 0, month: 0 };

  // Check if we have sessions in the current month
  const hasCurrentMonth = sessions.some((s) => {
    const t = getSessionTime(s);
    if (!t) return false;
    const d = new Date(t);
    return d.getFullYear() === currentYear && d.getMonth() + 1 === currentMonth;
  });

  // If current month has data, auto-select current year (not month — to show more context)
  // If only current year, auto-select year
  return { mode: "year", year: currentYear, month: 0 };
}

/**
 * Extract sessions array from various API response formats:
 * - { data: [...sessions] }                    → json.data
 * - { data: { content: [...sessions] } }       → json.data.content
 * - { content: [...sessions] }                 → json.content
 * - [...sessions]                              → json itself
 */
function extractSessions(json: any): ChargingSession[] {
  if (!json) return [];
  // { data: [...] }
  if (Array.isArray(json.data)) return json.data;
  // { data: { content: [...] } }
  if (json.data?.content && Array.isArray(json.data.content))
    return json.data.content;
  // { content: [...] }
  if (Array.isArray(json.content)) return json.content;
  // Direct array
  if (Array.isArray(json)) return json;
  return [];
}

/**
 * Extract total record count from various API response formats:
 * - Spring Page: { data: { totalElements, totalPages, content } }
 * - Custom: { metadata: { totalRecords } }
 * - Nested: { data: { metadata: { totalRecords } } }
 */
function extractTotalRecords(json: any, fallback: number): number {
  // Top-level metadata
  const m = json.metadata || json.data?.metadata;
  if (m?.totalRecords) return m.totalRecords;
  if (m?.totalElements) return m.totalElements;
  // Spring Boot Page object
  if (json.data?.totalElements) return json.data.totalElements;
  if (json.totalElements) return json.totalElements;
  // Custom
  if (json.data?.totalRecords) return json.data.totalRecords;
  if (json.totalRecords) return json.totalRecords;
  return fallback;
}

function getCachedSessions(): ChargingSession[] | null {
  const vin = chargingHistoryStore.get().loadedVin;
  if (!vin) return null;
  return vinCacheMap.get(vin)?.sessions || null;
}

// --- Public API ---

/**
 * Switch filter mode: "all" shows everything, "year" filters by year, "month" by year+month.
 */
export function setFilter(mode: FilterMode, year = 0, month = 0) {
  const all = getCachedSessions();
  if (!all) return;
  applyFilter(all, mode, year, month);
}

/**
 * Convenience: set to "all"
 */
export function setFilterAll() {
  setFilter("all");
}

/**
 * Convenience: set to a specific year
 */
export function setFilterYear(year: number) {
  setFilter("year", year);
}

/**
 * Convenience: set to a specific month within the currently selected year
 */
export function setFilterMonth(year: number, month: number) {
  setFilter("month", year, month);
}

/**
 * Fetch ALL charging sessions for a specific VIN.
 * @param vinCode — explicit VIN to fetch for (from vehicleStore, not api.vin)
 * @param force — bypass cache
 *
 * - Per-VIN in-memory cache with 24h TTL
 * - Fetches page 0 first (size=100), then remaining pages in parallel
 * - Progressive: UI sees first batch immediately with smart default filter
 * - Recalculates totals after all pages are loaded
 */
export async function fetchChargingSessions(
  vinCode?: string,
  force = false,
) {
  // Explicit VIN takes priority, fallback to api.vin
  const vin = vinCode || api.vin;
  if (!vin) return;

  // Ensure api.vin is set so x-vin-code header is correct for this fetch
  const prevApiVin = api.vin;
  api.vin = vin;

  // Check if VIN changed from what the store currently shows
  const currentLoadedVin = chargingHistoryStore.get().loadedVin;
  const vinChanged = currentLoadedVin !== null && currentLoadedVin !== vin;

  // Check per-VIN cache
  const cached = vinCacheMap.get(vin);
  if (
    !force &&
    cached &&
    Date.now() - cached.fetchedAt < CACHE_TTL &&
    cached.sessions.length > 0
  ) {
    chargingHistoryStore.setKey("loadedVin", vin);
    chargingHistoryStore.setKey("totalRecords", cached.totalRecords);
    chargingHistoryStore.setKey("error", null);
    chargingHistoryStore.setKey("isLoading", false);
    chargingHistoryStore.setKey("isLoadingMore", false);

    // Always re-apply filter with cached data for this VIN
    if (vinChanged) {
      const smart = computeSmartDefault(cached.sessions);
      applyFilter(cached.sessions, smart.mode, smart.year, smart.month);
    } else {
      const st = chargingHistoryStore.get();
      applyFilter(
        cached.sessions,
        st.filterMode,
        st.selectedYear,
        st.selectedMonth,
      );
    }
    // Restore api.vin if it was different (other code may depend on it)
    api.vin = prevApiVin;
    return;
  }

  // Clear previous data when switching VINs for clean transition
  if (vinChanged) {
    chargingHistoryStore.setKey("sessions", []);
    chargingHistoryStore.setKey("totalLoaded", 0);
    chargingHistoryStore.setKey("totalRecords", 0);
    chargingHistoryStore.setKey("availableYears", []);
    chargingHistoryStore.setKey("availableMonths", []);
  }

  chargingHistoryStore.setKey("isLoading", true);
  chargingHistoryStore.setKey("isLoadingMore", false);
  chargingHistoryStore.setKey("error", null);
  chargingHistoryStore.setKey("loadedVin", vin);

  try {
    const PAGE_SIZE = 100;
    let allSessions: ChargingSession[] = [];

    // Page 0 — returns full JSON { data: ..., metadata?: ... }
    const firstJson = await api.getChargingHistory(0, PAGE_SIZE);

    // Extract sessions from various response structures
    const firstSessions: ChargingSession[] = extractSessions(firstJson);

    // Extract totalRecords from various API response formats
    const totalRecords = extractTotalRecords(firstJson, firstSessions.length);

    console.log(
      `ChargingHistory [${vin}]: page 0 → ${firstSessions.length} sessions, total=${totalRecords}`,
    );

    allSessions = [...firstSessions];
    chargingHistoryStore.setKey("totalRecords", totalRecords);

    // Smart default filter: auto-select current year for first batch
    const smart = computeSmartDefault(allSessions);
    applyFilter(allSessions, smart.mode, smart.year, smart.month);

    // Mark initial load complete — remaining pages load in background
    chargingHistoryStore.setKey("isLoading", false);

    // Remaining pages in parallel
    if (allSessions.length < totalRecords) {
      chargingHistoryStore.setKey("isLoadingMore", true);

      const totalPages = Math.ceil(totalRecords / PAGE_SIZE);
      const remaining = Array.from(
        { length: totalPages - 1 },
        (_, i) => i + 1,
      );

      const results = await Promise.allSettled(
        remaining.map((p) => api.getChargingHistory(p, PAGE_SIZE)),
      );

      for (const result of results) {
        if (result.status === "fulfilled") {
          const sessions = extractSessions(result.value);
          allSessions = [...allSessions, ...sessions];
        }
      }

      // Re-read current filter state (user may have changed it while loading)
      const currentState = chargingHistoryStore.get();
      applyFilter(
        allSessions,
        currentState.filterMode,
        currentState.selectedYear,
        currentState.selectedMonth,
      );

      chargingHistoryStore.setKey("isLoadingMore", false);
    }

    // Persist cache
    vinCacheMap.set(vin, {
      sessions: allSessions,
      totalRecords,
      fetchedAt: Date.now(),
    });
  } catch (e: any) {
    console.error("Failed to fetch charging history:", e);
    chargingHistoryStore.setKey("error", e.message || "Unknown error");
  } finally {
    chargingHistoryStore.setKey("isLoading", false);
    chargingHistoryStore.setKey("isLoadingMore", false);
  }
}
