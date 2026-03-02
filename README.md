# 🧧 Tet Planner - Frontend

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Zustand](https://img.shields.io/badge/Zustand-443E38?style=for-the-badge&logo=react&logoColor=white)](https://github.com/pmndrs/zustand)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**Tet Planner** is a modern, gamified web application designed to help users organize, budget, and track their preparations for the Lunar New Year (Tet). Built with a focus on modularity, performance, and a delightful user experience.

---

## ✨ Key Features

* 📅 **Smart Task Management**: Advanced task tracking with timeline views, calendar integration, and phase-based planning (Pre-Tet, Tet, Post-Tet).
* 💰 **Finance Dashboard**: Real-time budget monitoring, transaction history, and smart shopping lists.
* 🎮 **Gamified Experience**: Interactive UI elements including falling petals, traditional lanterns, and reward systems to keep users engaged.
* 🎨 **Custom Theming**: Seamless switching between multiple themes via a centralized `ThemeContext`.
* 🔒 **Secure Workflow**: Robust authentication system with protected routes and configuration guards.

---

## 🛠 Tech Stack

### **Core Framework**
- **React 18**: Utilizing Functional Components and Hooks for high-performance UI.
- **TypeScript**: Ensuring strict type safety and reducing runtime errors across the codebase.
- **Vite**: Ultra-fast build tool and development server.

### **State Management**
- **Zustand**: Lightweight, centralized state management for global application data.
- **React Context**: Used for scoped state like Themes, Auth sessions, and Toast notifications.

### **Logic & Networking**
- **Axios**: Modular API client for handling backend communication.
- **Custom Hooks**: Abstracted logic for UI interactions (`useTheme`, `useToast`, etc.).

---

## 📂 Project Structure (`/src`)

The repository is organized following a **Modular Directory Pattern**:

| Directory | Description |
| :--- | :--- |
| `components/` | Reusable UI units (Modals, Dashboard, Finance, Gamification). |
| `contexts/` | Global providers for Auth, Theme, and Notification systems. |
| `hooks/` | Custom React hooks for shared business logic. |
| `pages/` | Top-level route components (Overview, Finance, Task Management). |
| `routes/` | Navigation logic, including `ProtectedRoute` and `ConfigGuard`. |
| `services/` | API abstraction layer and interaction modules. |
| `stores/` | Global state management using **Zustand**. |
| `types/` | Centralized TypeScript interfaces and type definitions. |
| `utils/` | Utility functions for formatting (Currency, Dates, Numbers). |

---

## 🚀 Getting Started

### **Prerequisites**
- **Node.js**: v18.0.0 or higher
- **npm** or **yarn**

### **Installation**

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/nab-wecamp-tetplanner/tetplanner-fe.git](https://github.com/nab-wecamp-tetplanner/tetplanner-fe.git)
    cd tetplanner-fe
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Start Development Server**
    ```bash
    npm run dev
    ```

4.  **Build for Production**
    ```bash
    npm run build
    ```

---

## 🤝 Contributors
<table align="center">
  <tr>
   <td align="center">
      <a href="INSERT_GITHUB_LINK_1">
        <img src="https://github.com/hankhongg.png" width="120px;" alt="Contributor 1"/><br />
        <sub><b>Không Huỳnh Ngọc Hân</b></sub>
      </a><br />
      <p>Backend</p>
    </td>
    <td align="center">
      <a href="INSERT_GITHUB_LINK_1">
        <img src="https://github.com/viLam11.png" width="120px;" alt="Contributor 1"/><br />
        <sub><b>Huỳnh Bảo Ngọc</b></sub>
      </a><br />
      <p>Frontend</p>
    </td>
    <td align="center">
      <a href="INSERT_GITHUB_LINK_2">
        <img src="https://github.com/ynhind.png" width="120px;" alt="Contributor 2"/><br />
        <sub><b>Nguyễn Đức Yến Nhi</b></sub>
      </a><br />
      <p>Frontend</p>
    </td>
  </tr>
  <tr>
    <td align="center">
      <a href="INSERT_GITHUB_LINK_3">
        <img src="https://github.com/linhlk123.png" width="120px;" alt="Contributor 3"/><br />
        <sub><b>Lưu Khánh Linh</b></sub>
      </a><br />
      <p>Frontend</p>
    </td>
    <td align="center">
      <a href="INSERT_GITHUB_LINK_4">
        <img src="https://github.com/lngphgthao.png" width="120px;" alt="Contributor 4"/><br />
        <sub><b>Lê Ngọc Phương Thảo</b></sub>
      </a><br />
      <p>Frontend</p>
    </td>
  </tr>
</table>


---

## 📄 License

Distributed under the MIT License.

---
**Happy Planning & Happy Lunar New Year!** 🧧🌸