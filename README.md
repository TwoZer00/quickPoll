# ⚡ QuickPoll

Create and share real-time polls that auto-close after 30 minutes. No sign-up required — anonymous by default.

<!-- ![QuickPoll Screenshot](screenshot.png) -->

## Features

- 🗳️ Create polls with multiple options
- ⏱️ Polls auto-close after 30 minutes and results go public
- 📊 Live results with bar and pie chart views
- 🔗 Share polls via link
- 🔒 Anonymous authentication — no personal data required
- 📱 Responsive Material UI design

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | [React 18](https://react.dev/) (JavaScript) |
| Build Tool | [Vite](https://vitejs.dev/) |
| Backend | [Firebase](https://firebase.google.com/) — Firestore, Analytics, Anonymous Auth |
| UI | [Material UI 5](https://mui.com/material-ui/) |
| Routing | [React Router DOM](https://reactrouter.com/en/main) |
| Charts | [Recharts](https://recharts.org/) |
| Animations | [React Spring](https://www.react-spring.dev/) |
| Images | [Cloudinary](https://cloudinary.com/) |
| Dates | [dayjs](https://day.js.org/) |
| Hosting | [Netlify](https://www.netlify.com/) |

## Getting Started

Requires **Node.js >= 22**.

```bash
git clone https://github.com/TwoZer00/quickPoll.git
cd quickPoll
npm install
npm run dev
```

Create a `.env` file with your Firebase config:

```env
VITE_API_KEY=<your-api-key>
VITE_AUTH_DOMAIN=<your-auth-domain>
VITE_PROJECT_ID=<your-project-id>
VITE_STORAGE_BUCKET=<your-storage-bucket>
VITE_MESSAGING_SENDER_ID=<your-sender-id>
VITE_APP_ID=<your-app-id>
VITE_MEASUREMENT_ID=<your-measurement-id>
VITE_CLOUDINARY_CLOUD_NAME=<your-cloud-name>
VITE_CLOUDINARY_UPLOAD_PRESET=<your-upload-preset>
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Project Structure

```
src/
├── components/     # Reusable UI components (charts, poll, menu)
├── const/          # Constants
├── error/          # Error handling
├── firebase/       # Firebase config and services
├── hook/           # Custom React hooks
├── pages/          # Route pages (Home, CreatePoll, Poll)
├── utils/          # Utility functions
└── main.jsx        # App entry point
```

## Roadmap

- [x] Create polls with auto-close timer
- [x] Real-time results (bar & pie charts)
- [x] Share polls
- [ ] User accounts & poll history

## License

© [TwoZer00](https://twozer00.dev)
