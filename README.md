# Franciscan Sisters Records System (FSIC)

A high-fidelity, secure, and comprehensive desktop application designed for the management of Franciscan Sisters' records, provincial administration, and community reporting.

## 🌟 Key Features

- **Sister Directory**: Comprehensive tracking of religious formation, obediences, and personal history.
- **Provincial Leadership Board**: Historical and current administration tracking with chronological grouping.
- **Community Management**: Reporting system for community houses, including mission updates and maintenance tracking.
- **Correspondence & Circulars**: Centralized management of official documents and letters.
- **Dashboard Analytics**: Real-time insights into provincial demographics and status (Finally Professed, Temporary, etc.).
- **Auto-Update System**: Integrated with GitHub for seamless system updates without manual downloads.
- **Secure Authentication**: Multi-user administrative access with encrypted credential management.

## 🛠️ Technology Stack

- **Core**: Electron + Vite
- **Frontend**: React + TypeScript
- **Styling**: Vanilla CSS (Custom Premium Design System)
- **Icons**: Lucide React
- **Database**: SQLite + Prisma ORM
- **Auto-Updater**: Electron-Updater (GitHub Hosting)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Initialize the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

### Development
Run the application in development mode:
```bash
npm run dev
```

### Production Build
Build the executable for Windows:
```bash
npm run build:win
```

## 📜 Database Management
The system uses Prisma for database management. If you modify the `schema.prisma` file, always run:
```bash
npx prisma db push
npx prisma generate
```

## 🔒 Security
- Passwords are hashed using `bcryptjs`.
- Local database file (`dev.db`) is excluded from version control to protect sensitive data.
- Preload scripts are used for secure communication between the main and renderer processes.

## 📄 License
Internal Provincial Use Only.
