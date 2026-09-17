# ⚡ QuickPoll

Create and share real-time polls that auto-close after 30 minutes. No sign-up required — anonymous by default.

![QuickPoll Screenshot](screenshots/screenshot.png)

## Features

- 🗳️ Create polls with multiple options and optional images
- ⏱️ Polls auto-close after 30 minutes and results go public
- 📊 Live results with bar and pie chart views
- 🔗 Share polls via link, X or WhatsApp
- 🔒 Anonymous authentication — no personal data required
- 📱 Responsive Material UI design with dark mode
- 📥 Export results as CSV
- 🌐 English & Spanish support
- 📲 Installable PWA — opens directly to create a poll

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | [React 18](https://react.dev/) (JavaScript) |
| Build Tool | [Vite](https://vitejs.dev/) |
| Backend | [Supabase](https://supabase.com/) — Postgres, Realtime, Anonymous Auth |
| UI | [Material UI 5](https://mui.com/material-ui/) |
| Routing | [React Router DOM](https://reactrouter.com/en/main) |
| Charts | [Recharts](https://recharts.org/) |
| Animations | [React Spring](https://www.react-spring.dev/) |
| Images | [Cloudinary](https://cloudinary.com/) |
| Dates | [dayjs](https://day.js.org/) |
| i18n | [i18next](https://www.i18next.com/) + [react-i18next](https://react.i18next.com/) |
| Hosting | [Netlify](https://www.netlify.com/) |

## Getting Started

Requires **Node.js >= 22**.

```bash
git clone https://github.com/TwoZer00/quickPoll.git
cd quickPoll
npm install
npm run dev
```

Create a `.env` file with your config:

```env
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
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
├── supabase/       # Supabase client, schema and services
├── hook/           # Custom React hooks
├── i18n/           # Internationalization (en, es)
├── pages/          # Route pages (Home, CreatePoll, Poll, Privacy, Terms)
├── utils/          # Utility functions
└── main.jsx        # App entry point
```

## Roadmap

- [x] Create polls with auto-close timer
- [x] Real-time results (bar & pie charts)
- [x] Share polls
- [x] Dark mode
- [x] Export results as CSV
- [x] Social sharing (X, WhatsApp)
- [x] PWA support (installable, opens to create)
- [x] Internationalization (English & Spanish)
- [x] Privacy Policy & Terms of Service pages
- [ ] User accounts & poll history
- [ ] Organizations — private polls for teams (OAuth via Google/Microsoft, optional SAML SSO per domain)

## License

© [TwoZer00](https://twozer00.dev)
