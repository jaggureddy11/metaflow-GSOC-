# Metaflow IDE (VS Code Extension)

**The ultimate IDE experience for Metaflow developers: visual DAGs, artifact browsing, and high-performance execution.**

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![GSoC 2026](https://img.shields.io/badge/GSoC-2026-brightgreen.svg)](https://docs.metaflow.org/)

---

## 🚀 Overview

The Metaflow VS Code Extension turns VS Code into a first-class IDE for data scientists. This project addresses the "Metaflow VS Code Extension" GSoC 2026 project idea by providing vertical integration between the Metaflow Python library and the developer's favorite editor.

### **✨ Current Features**
-   **Artifact Explorer**: Browse flows, runs, steps, and artifacts as a living hierarchy directly in your sidebar.
-   **Live Metadata Integration**: Uses a high-performance Python bridge to query local `.metaflow` metadata dynamically.
-   **Iconography**: Visual cues for execution status (Success/Failure) and object types (Runs, Steps, Fields).
-   **Developer-First UX**: Quick refresh and intuitive navigation.

---

## 🛠️ Architecture

This extension is built with **Separation of Concerns** at its core:

1.  **TypeScript UI Layer**: High-performance VS Code `TreeDataProvider` for a native IDE feel.
2.  **Metaflow Service Class**: An async service layer managing the lifecycle of backend queries.
3.  **Python Bridge CLI**: A dedicated Python utility that interfaces with the Metaflow library, enabling the extension to leverage Metaflow's powerful metadata APIs without the overhead of a separate server.

---

## 🏗️ Getting Started

### **Prerequisites**
-   VS Code v1.90.0+
-   Python 3.10+
-   `metaflow` installed in your environment

### **Installation & Development**
1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/jaggureddy11/metaflow-GSOC-.git
    cd metaflow-vscode-extension
    ```
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Run with Debugging**:
    -   Open the project in VS Code.
    -   Press `F5` (Launch Extension).
    -   A new window will open with the Metaflow explorer enabled.

---

## 🗺️ Roadmap
-   [ ] **Visual DAG Renderer**: Interactive flow visualization using SVG/Canvas.
-   [ ] **Artifact Preview**: One-click preview of artifacts (DataFrames, Plots, etc.).
-   [ ] **One-Click Debug**: Launch local runs with step-specific debugging.
-   [ ] **Cloud Integration**: Browse runs directly from AWS/Azure/GCP metadata services.

---

## 🤝 Contributing
This project is part of my **GSoC 2026 proposal**. Contributions, issues, and ideas are welcome!

**Author**: Shashank Reddy (GSoC 2026 Applicant)
**Repo**: [metaflow-GSOC-](https://github.com/jaggureddy11/metaflow-GSOC-)
