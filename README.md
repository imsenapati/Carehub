# CareHub

A healthcare management dashboard built with Next.js for managing patients, appointments, and provider schedules.

## Features

- **Dashboard** — Overview of today's appointments, active patients, notifications, and critical alerts
- **Patient Management** — Search, filter, and view detailed patient profiles with vitals, notes, and appointment history
- **Scheduling** — View and manage provider appointment schedules
- **Notifications** — Real-time notification system for appointments, patient alerts, and messages

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **State Management:** TanStack React Query
- **Validation:** Zod
- **Testing:** Vitest + React Testing Library + Playwright (E2E)

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/imsenapati/Carehub.git
cd Carehub
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Testing

```bash
# Unit tests
npm test

# Unit tests (single run)
npm run test:run

# E2E tests
npm run test:e2e
```

### Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/
│   ├── api/              # API routes (appointments, patients, providers, notifications)
│   ├── patients/         # Patient list and detail pages
│   ├── schedule/         # Scheduling page
│   ├── layout.tsx        # Root layout with sidebar
│   └── page.tsx          # Dashboard
├── components/
│   ├── notifications/    # Notification bell component
│   └── ui/               # Reusable UI components (Badge, Modal, Toast, Skeleton, etc.)
├── hooks/                # Custom React hooks (usePatients, useAppointments, etc.)
├── lib/                  # Utilities and query client
├── mocks/                # Mock data for development
├── types/                # TypeScript type definitions
└── __tests__/            # Unit and integration tests
```
