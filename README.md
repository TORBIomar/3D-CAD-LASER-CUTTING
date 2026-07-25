# Zahiri Metal - Enterprise 3D Tube CAD & Fiber Laser Cutting Studio 🚀

[![React 18](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite%20%7C%20Three.js-blue)](https://reactjs.org/)
[![Spring Boot 3.3](https://img.shields.io/badge/Backend-Spring%20Boot%203.3.x%20%7C%20Java%2017+-green)](https://spring.io/projects/spring-boot)
[![MySQL 8](https://img.shields.io/badge/Database-MySQL-orange)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-Proprietary%20%2F%20Industrial-red)]()

> **Zahiri Metal CAD Studio** is an industrial-grade, full-stack 3D parametric CAD application designed for fiber laser tube cutting machinery (Trumpf, Bystronic, Mazak). Built with React Three Fiber, CSG Boolean geometry modeling, DIN 6935 unroll sheet calculation, and ISO-6983 G-code toolpath generation.

---

## 🛠️ Core Capabilities

### 1. 🌐 Real-Time 3D CSG Boolean Solid Engine
- **Parametric Tube Profiles**: Round (tube diameter $\varnothing$), Square (box tube), and Rectangular extrusions with customizable wall thickness.
- **Dynamic CSG Cuts**: Perform exact solid subtractions in real-time for:
  - Cylinder Holes (variable diameter $\varnothing$, Z-offset, polar rotation angle $\theta$).
  - Rectangular Slots (variable length, width, Z-offset, rotation).
  - Mitre End & Start Cuts (angled miter cuts $0^{\circ} - 60^{\circ}$).
- **Bright Metallic PBR Shader**: Metallic silver finish (`#d4d4d8`) with studio HDRI environment reflections (`<Environment preset="city" />`).

### 2. 🔀 Multi-Tube Assembly Manager
- Build multi-part tube assemblies in the same 3D workspace.
- **3D Spatial Offset Controls**: Position ($X, Y, Z$) and rotate ($RX, RY, RZ$) individual tubes to model complex frame structures.
- **Undo / Redo History Stack**: Full state undo/redo buffer with keyboard shortcuts (`Ctrl+Z` / `Ctrl+Y`).

### 3. 📐 2D Unrolled Blueprint & Telemetry
- **DIN 6935 Sheet Metal Blueprint**: Interactive 2D unrolled flat sheet SVG layout ($L \times \pi \times \text{OD}$) with cut perimeter legends.
- **Live Physical Properties**: Computes net material weight ($\text{kg}$), enclosed volume ($\text{cm}^3$), cross-sectional area ($\text{mm}^2$), and total cut cycle time ($\text{sec/part}$).

### 4. ⚙️ CNC Machine Export Formats
- **ISO-6983 / DIN 66025 G-Code Program (`.nc`)**: 4-axis G-code with rotary A-axis interpolation, laser power modulation, and dwell commands ($M03 / M05$).
- **2D CAD Vector Drawing (`.dxf`)**: Standard ASCII DXF file generator for Bystronic / Trumpf nesting software.
- **Engineering PDF Data Sheet (`.pdf`)**: Technical specification PDF sheet complete with dimension callouts, material specs, and quality control stamp.
- **File Upload & G-Code Parsing**: Upload raw `.nc`, `.gcode`, or `.json` files to automatically reconstruct the 3D tube geometry and cut features.

### 5. 🛡️ CAD Feasibility & Edge Collision Guard
- Automated edge proximity validator ($<15\text{mm}$ threshold from tube ends).
- Live red alert card flagging invalid laser toolpaths before manufacturing.

---

## 📂 Repository Architecture

```
Z3D-CAD-LASER-CUTTING/
├── frontend/                                         # React 18 + TypeScript + Vite Client
│   ├── src/
│   │   ├── components/                               # Header, Sidebars, 3D Canvas, Modals
│   │   ├── services/                                 # Axios REST Client, PDF Exporter, DXF Exporter
│   │   ├── store/                                    # Zustand State Store with Undo/Redo & Multi-Tube
│   │   └── utils/                                    # G-Code Generator, G-Code Parser, Collision Guard
│   ├── package.json
│   └── vite.config.ts
└── backend/                                          # Java 17+ Spring Boot REST API
    ├── src/main/
    │   ├── java/com/zahirimetal/cad/                 # Controllers, Entities, Repositories, Services
    │   └── resources/application.yml                 # MySQL (zahiri_cad_db) Connection
    └── pom.xml
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.x or higher
- **Java**: JDK 17 or JDK 21 (Adoptium / Corretto)
- **Database**: MySQL 8.x (or XAMPP MySQL) running on port `3306`

---

### 1. Database Setup (MySQL / XAMPP)
1. Start **Apache** and **MySQL** in XAMPP.
2. Open phpMyAdmin at `http://localhost/phpmyadmin`.
3. Create a new database named:
   ```sql
   CREATE DATABASE zahiri_cad_db;
   ```

---

### 2. Backend Setup (Spring Boot)
```bash
cd backend

# Set JAVA_HOME to JDK 17 or JDK 21 (if needed on Windows PowerShell)
$env:JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-21.0.9.10-hotspot"

# Run Spring Boot REST API (Port 8080)
mvn spring-boot:run
```

---

### 3. Frontend Setup (React + Vite)
```bash
cd frontend

# Install Node dependencies
npm install

# Start Vite Development Server (Port 5173)
npm run dev
```

Open your browser and navigate to **`http://localhost:5173/`**.

---

## 📄 License & Contact
- **Author**: TORBI Omar
- **Repository**: [https://github.com/TORBIomar/3D-CAD-LASER-CUTTING](https://github.com/TORBIomar/3D-CAD-LASER-CUTTING)
- Proprietary Industrial Software for Zahiri Metal Fiber Laser Machinery.
