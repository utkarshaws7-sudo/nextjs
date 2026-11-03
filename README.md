# Next.js Practice Project

A collection of hands-on React and Next.js experiments focused on building interactive UI components, managing application state, working with APIs, and implementing common frontend functionality.

## 🚀 Overview

This project is a development playground for exploring React and Next.js concepts using TypeScript.

It includes practical implementations of:
- Interactive Kanban board with drag-and-drop functionality.
- API fetching using TanStack React Query.
- Dashboard components and reusable UI structures.
- React Hooks for state and lifecycle management.
- Client-side rendering and event handling.

## ✨ Features

### 1. Kanban Board
- Task organization across different stages.
- Todo, In Progress, and Done columns.
- Drag-and-drop interaction using the JavaScript Drag and Drop API.
- React state management for task updates.

### 2. API Fetching
- Fetch data from a user-provided API URL.
- Handle asynchronous API requests.
- Manage loading and error states.
- Measure API response time.
- Use TanStack React Query for data fetching and caching.

### 3. Dashboard
- Component-based dashboard structure.
- Integration of reusable React components.
- Modular component organization.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Next.js | React framework |
| React.js | UI development |
| TypeScript | Type safety |
| TanStack React Query | API data fetching and caching |
| Tailwind CSS | Utility-first styling |
| JavaScript | Application logic |
| HTML | Structure |

## 📁 Project Structure

```text
nextjs/
│
├── Dashboard.tsx       # Dashboard component
├── Kanbanboard.tsx     # Kanban board component
├── Provider.tsx        # React Query provider
├── Users.tsx           # API fetching component
├── page.tsx            # Main page and Kanban implementation
├── index.html          # HTML entry document
│
└── README.md           # Project documentation
```

## ⚙️ Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm or yarn
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/utkarshaws7-sudo/nextjs.git
```

### 2. Navigate to the Project

```bash
cd nextjs
```

### 3. Install Dependencies

If the repository is configured as a complete Next.js application with a `package.json`, install its dependencies:

```bash
npm install
```

If the repository contains only the component files, place them inside an existing Next.js application and install the required dependencies:

```bash
npm install @tanstack/react-query
```

### 4. Run the Development Server

From the configured Next.js application directory:

```bash
npm run dev
```

Open your browser and visit:

```text
http://localhost:3000
```

## 🧠 Concepts Practiced

This project explores several important frontend development concepts:

- React Functional Components
- React Hooks (`useState`, `useEffect`, `useRef`)
- TypeScript Interfaces and Types
- API Integration using Fetch API
- Asynchronous JavaScript
- Server and Client Components
- Drag and Drop API
- State Management
- TanStack React Query
- Component Reusability

## 🎯 Project Goals

- Strengthen React and Next.js fundamentals.
- Practice building interactive frontend components.
- Understand API integration and asynchronous data handling.
- Improve TypeScript skills.
- Experiment with modern frontend development tools and libraries.

## 🚧 Future Improvements

- Implement complete drag-and-drop functionality across all Kanban columns.
- Add task creation, editing, and deletion.
- Improve API error handling and validation.
- Add responsive layouts.
- Implement persistent task storage.
- Improve loading and error UI states.

## 👨‍💻 Author

**Utkarsh Singh**

Software Development Engineer | Full Stack Developer

- GitHub: [@utkarshaws7-sudo](https://github.com/utkarshaws7-sudo)

---

⭐ If you find this repository useful, consider giving it a star!

