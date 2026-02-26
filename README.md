# VinFast Dashboard - VF9 Club Edition

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Node.js](https://img.shields.io/badge/Node.js-22%2B-green)
![Status](https://img.shields.io/badge/Status-Active-brightgreen)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

---

## 🔄 **Status Update** (February 2026)

> **Dashboard is fully operational with real-time MQTT telemetry!** All vehicle data streams live via MQTT over WebSocket — first data arrives ~500ms after connect.
>
> ✅ **MQTT Live Telemetry**: Real-time data via AWS IoT Core (battery, doors, tires, location, speed, charging).\
> ✅ **X-HASH + X-HASH-2**: Dual-layer API signing on all protected endpoints.\
> ✅ **Multi-Vehicle**: Instant switching between vehicles with cached telemetry.\
> ✅ **Charging History**: Full session history with smart filtering.\
> ✅ **Deep Scan**: Progressive telemetry viewer with crowdsourced KV aliases.\
> 📚 **Documentation**: [API Endpoints](./docs/api/API_ENDPOINTS.md) | [X-HASH Technical Docs](./docs/api/HASH_ANALYSIS_SUMMARY.md) | [MQTT Telemetry](./docs/api/MQTT_TELEMETRY.md)\
> 🌐 **Bilingual docs**: English at `docs/api/`, Vietnamese at `docs/api/vi/`

---

## 📖 Introduction

This project is an open-source dashboard designed specifically for VinFast EV owners. It leverages the vehicle's telemetry data to provide a "Digital Twin" experience, offering real-time insights into battery health, charging status, tire pressure, and environmental conditions.

Our goal is to create a UI that matches the premium quality of the car itself—clean, modern, and informative.

## ✨ Features

- **Digital Twin Visualizer**: Accurate representation of vehicle status including doors, locks, and tires.
- **Mobile-First Experience**: Optimized specifically for phone screens with zero scrollbars, fixed viewports, and touch-friendly layouts.
- **Real-time Telemetry via MQTT**: Live streaming of Battery SOC, Range, Speed, Charging status, and more via AWS IoT Core WebSocket.
- **Safety Monitor**: Integrated alerts for Tire Pressure (TPMS), Door Ajar, and Intrusion.
- **System Health**: Overview of ECU versions (BMS, Gateway, MHU) and FOTA updates.
- **Responsive Design**: A "Bento Grid" layout that adapts seamlessly from Desktop to Mobile.

## 🛠 Tech Stack

- **Core**: Astro 5, React, Tailwind CSS, Nanostores.
- **Backend**: Serverless Proxy (Astro SSR on Cloudflare Pages) with multi-proxy 429 failover.
- **Telemetry**: MQTT over WebSocket (AWS IoT Core) — real-time, no polling.
- **Auth**: Auth0 OAuth2 with HttpOnly cookies (auto-detects localhost for local dev).
- **Storage**: Cloudflare KV for crowdsourced telemetry aliases.

## 🏗 System Architecture

![System Architecture](docs/assets/system-architecture.svg)

## 🚀 Quick Start

You can get the whole system running in minutes.

### Prerequisites

- Node.js v22 or later
- A VinFast Connected Car Account

### Installation

1.  **Clone the repository**:

    ```bash
    git clone https://github.com/VF9-Club/VFDashboard.git
    cd VFDashboard
    ```

2.  **Start the Dashboard**:
    ```bash
    npm install
    npm run dev
    ```
    _Dashboard will open at `http://localhost:4321`_

### Deployment

To deploy the dashboard to Cloudflare Pages:

```bash
npm run deploy
```

_Note: Requires Cloudflare authentication (`npx wrangler login`)._

## ⚠ Disclaimer

**This software is not affiliated with, endorsed by, or connected to VinFast Auto or its subsidiaries.**
It is an unofficial, open-source project created by the community for educational and personal use. Use at your own risk.

## 📸 Screenshots

### Dashboard (PC / Tablet)

![Dashboard Preview](docs/assets/dashboard_preview.webp)

### Mobile & Detail View

<div style="display: flex; gap: 20px; flex-wrap: wrap;">
  <img src="public/mobile-vf3.webp" alt="Mobile Dashboard - VF3" width="300" />
  <img src="public/mobile-vf9-energy.webp" alt="Mobile Dashboard - VF9 Energy" width="300" />
</div>

## 🤝 Contributing

We welcome contributions from the community!

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 🌍 Community Forks

VinFast owners in different regions maintain their own forks tailored to local needs:

| Fork                                                                                        | Maintainer                    | Focus                                                |
| ------------------------------------------------------------------------------------------- | ----------------------------- | ---------------------------------------------------- |
| [vinfastownersorg-cyber/VFDashboard](https://github.com/vinfastownersorg-cyber/VFDashboard) | Association of VinFast Owners | North America, self-hosted (Render, Docker, Railway) |

> Want to add your fork? Open an issue or PR!

## 🙏 Acknowledgments

This project was developed based on inspiration and valuable technical documentation regarding APIs from the [**VinFast Owners**](https://vinfastowners.org/) community. We sincerely thank the team at [VinFast Owners Community](https://github.com/vinfastownersorg-cyber/vinfastowners) for their foundational contributions to this open-source ecosystem.

Selected improvements from community forks are periodically reviewed and backported into this public branch when they align with security, maintainability, and broad community usage.

We warmly welcome all VinFast owners and technology enthusiasts to collaborate and help improve the public dashboard experience.

## 💬 An Open Letter to VinFast's Development Team

Dear VinFast Engineering Team,

First of all -- **thank you** for building great electric vehicles. We love our VinFast cars, and this project exists because we are passionate owners who want to get the most out of our vehicles.

We want to share a few thoughts from the community, with the utmost respect and constructive spirit:

### On API Security Changes

We've noticed frequent changes to API authentication mechanisms (X-HASH, X-HASH-2, endpoint restructuring, etc.). We completely understand the need for security, and we respect that. However, we want to be transparent: with modern AI-assisted development tools (such as GPT-series models and AI coding agents), investigating and adapting to these changes typically takes **no more than 15-30 minutes**. The security-through-obscurity approach does not effectively prevent determined third-party access -- it only slows down the community temporarily while consuming valuable engineering resources on VinFast's side.

### On MQTT Telemetry

The current **MQTT real-time telemetry system via AWS IoT Core is stable and working well**. It is a solid foundation that the official app and third-party integrations can reliably build upon. We hope this connection protocol will remain unchanged in the near future.

### A Better Path Forward: Developer Community

Instead of an ongoing cycle of API changes and community workarounds, we believe there is a **much more exciting opportunity**: **embrace the developer community**.

Many car manufacturers (Tesla, BMW, Mercedes, Hyundai/Kia) have recognized that third-party apps and integrations **increase customer satisfaction and brand loyalty**. Owners who build custom dashboards, home automation integrations, and fleet management tools are your most engaged and loyal customers.

Here are some features the community would love to build -- features that would make VinFast vehicles even more attractive:

- **Home automation integrations** (Home Assistant, Google Home, Apple HomeKit)
- **Fleet management dashboards** for businesses with multiple VinFast vehicles
- **Advanced trip planning** with charging station routing optimized for VinFast EVs
- **Custom widgets and watch complications** for real-time vehicle status
- **Energy management** integrations with solar panels and home batteries
- **Proactive charging notifications** -- alert owners before the battery is fully charged, with Live Activities (iOS) and Live Updates (Android) on the lock screen and Dynamic Island so drivers can monitor charging status at a glance (with an option to filter DC-only, since AC charging doesn't incur idle fees)
- **Community-driven safety features** like shared road hazard reporting
- **Accessibility tools** for owners with different needs

### Why This Project Exists

VFDashboard was born out of genuine love for VinFast vehicles, combined with a desire for features that the official app does not yet provide. The official app is good and improving -- but the community can move faster on niche features that matter to power users. This is not competition; this is **free R&D and free marketing** from your most passionate customers.

### Our Proposal

We would be thrilled if VinFast considered:

1. **A public API program** (even read-only) with proper API keys and rate limits
2. **Developer documentation** for vehicle telemetry and control endpoints
3. **A developer community forum** where enthusiasts can collaborate with VinFast engineers
4. **OAuth-based third-party app authorization** so owners can safely grant access to apps they trust

This would transform the current situation from an adversarial dynamic into a **collaborative ecosystem** that benefits everyone -- VinFast, owners, and the broader EV community.

We are building in the open, with good intentions. We hope to work **with** you, not around you.

With respect and admiration,\
**The VFDashboard Community**

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

_Built with ❤️ by VF9 Club Vietnam_
