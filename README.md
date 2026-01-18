# VinFast Dashboard - VF9 Club Edition

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Node.js](https://img.shields.io/badge/Node.js-23%2B-green)
![Status](https://img.shields.io/badge/Status-Active-success)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

> **A side project by tech enthusiasts of VF9 Club Vietnam.**  
> Dedicated to exploring the digital capabilities of our vehicles and creating a premium, personalized monitoring experience.

---

## 📖 Introduction

This project is an open-source dashboard designed specifically for VinFast EV owners (VF3, VF8, VF9). It leverages the vehicle's telemetry data to provide a "Digital Twin" experience, offering real-time insights into battery health, charging status, tire pressure, and environmental conditions.

Our goal is to create a UI that matches the premium quality of the car itself—clean, modern, and informative.

## ✨ Features

- **Digital Twin Visualizer**: Accurate representation of vehicle status including doors, locks, and tires.
- **Real-time Telemetry**: Monitoring of Battery SOC, Range, Power consumption, and Charging time.
- **Safety Monitor**: Integrated alerts for Tire Pressure (TPMS), Door Ajar, and Intrusion.
- **System Health**: Overview of ECU versions (BMS, Gateway, MHU) and FOTA updates.
- **Responsive Design**: A "Bento Grid" layout that adapts seamlessly from Desktop to Mobile.

## 🛠 Tech Stack

- **Core**: React (Vite/Astro), Tailwind CSS, Nanostores.
- **API**: Serverless Proxy (Astro SSR) for CORS & Rate Limiting.
- **Integration**: Official/Reverse-Engineered VinFast API.

## 🚀 Quick Start

You can get the whole system running in minutes.

### Prerequisites

- Node.js v23 or later
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

## ⚠ Disclaimer

**This software is not affiliated with, endorsed by, or connected to VinFast Auto or its subsidiaries.**  
It is an unofficial, open-source project created by the community for educational and personal use. Use at your own risk.

## 📸 Screenshots

![Dashboard Preview](docs/assets/dashboard_preview.png)

## 📍 Configuration

Create a `.env` file in the `backend` folder to secure your credentials (optional, currently supported via API login):

```env
PORT=3000
VF_REGION=vn
```

## 🤝 Contributing

We welcome contributions from the community!

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

_Built with ❤️ by VF9 Club Vietnam_
