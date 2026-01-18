# VinFast Dashboard - Business & Architecture Specification

**Version:** 2.0  
**Status:** DRAFT  
**Date:** Jan 2026

---

## 1. Business Context & Goals

### 1.1 Executive Summary

This project aims to build a modern, high-performance web dashboard for VinFast vehicle owners. Current native mobile apps can be slow or limited in providing deep technical insights. This dashboard acts as a "Digital Twin" monitor, offering real-time, detailed telemetry that empowers owners to understand their vehicle's health and status instantly.

### 1.2 Key Business Objectives

- **BO-01 (Speed)**: Reduce the time-to-check critical status (Battery, Range, Charging) to **< 2 seconds**.
- **BO-02 (Depth)**: Provide "Deep Scan" metrics (SOH, cell voltage, 12V status) that are hidden or hard to access in the native app.
- **BO-03 (Accessibility)**: Enable access via any web browser (Desktop/Tablet) without requiring a mobile device.

---

## 2. Solution Architecture

### 2.1 Technology Stack

**Modernized Serverless Architecture (Jan 2026).**

#### Frontend & Core: Astro 5.0 + React

- **Role**: Unified Application Shell & API Proxy.
- **Strategy**: "Islands Architecture" (Static shell + Interactive React Islands) + Server-Side Rendering (SSR).
- **Key Libs**: TailwindCSS (Utility Styling), Nano Stores (State Management), Leaflet (Maps).

#### API Layer: Serverless Proxy (Astro API Routes)

- **Role**: Reverse Proxy for VinFast API & Auth.
- **Infrastructure**: Runs on **Cloudflare Workers** (Edge) or Vercel Serverless.
- **Responsibilities**:
  - **CORS Resolution**: Proxies requests from the browser to VinFast APIs to bypass CORS restrictions.
  - **IP Distribution**: Leverages Edge Network IP pools (Cloudflare/AWS) to prevent single-IP rate limiting from VinFast.
  - **Security**: Hides Auth0 Client interaction details (optional) and sanitized headers.

#### External Integrations (Client-side)

- **Open-Meteo**: Weather retrieval based on GPS coordinates.
- **Nominatim (OSM)**: Reverse geocoding (Lat/Long -> City/Country).

### 2.2 System Diagram

```mermaid
graph TD
    User[User Browser]

    subgraph "Edge Network (Cloudflare Pages)"
        Astro[Astro Server (SSR)]
        Proxy[Serverless Proxy /api/*]
    end

    subgraph "External Cloud Services"
        VF_Auth[VinFast Auth0]
        VF_API[VinFast Connected Car API]
        OpenMeteo[Open-Meteo API]
        Nominatim[Nominatim OSM]
    end

    User -- "HTTPS / HTML" --> Astro
    User -- "API Requests /api/*" --> Proxy

    Proxy -- "Forward Request" --> VF_Auth
    Proxy -- "Forward Request" --> VF_API

    User -- "Direct Fetch" --> OpenMeteo
    User -- "Direct Fetch" --> Nominatim
```

---

## 3. Non-Functional Requirements (NFRs)

### 3.1 Performance

- **NFR-PERF-01**: **Time to Interactive (TTI)** must be < 1.0 second on 4G networks.
- **NFR-PERF-02**: Dashboard data freshness must be within 60 seconds.

### 3.2 Security

- **NFR-SEC-01**: Tokens must be stored securely in the Client (e.g., LocalStorage) and transmitted only via HTTPS.
- **NFR-SEC-02**: All client-server communication must use HTTPS/WSS.

### 3.3 Reliability

- **NFR-REL-01**: System must gracefully handle API failures (See _Fallback Strategy_ in Functional Spec).
- **NFR-REL-02**: High availability via Edge deployment (Cloudflare).

---

## 4. Development Roadmap

1.  **Phase 1**: Initialize Project & UI Components.
2.  **Phase 2**: Port API logic to Frontend Services.
3.  **Phase 3**: Implement Serverless Proxy to solve CORS & Rate Limiting.
4.  **Phase 4**: Deployment to Cloudflare Pages.
