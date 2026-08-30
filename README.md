# Fidger

Fidger is a private, authenticated workspace for personal finance tracking, notes, and to-dos. It uses Next.js, NextAuth credentials authentication, and MongoDB to keep user data isolated per account.

## Features

- Secure sign-in with credentials-based authentication
- Personal finance tracker with income, expense, balance, and transaction history
- Notes workspace for quick capture and editing
- To-do list with pending and completed views
- Per-user data access across all API routes
- Lightweight PWA support with app icons and manifest

## Tech Stack

- Next.js
- React
- NextAuth
- MongoDB
- Tailwind CSS
- bcryptjs

## Getting Started

### Prerequisites

- Node.js
- npm
- A MongoDB database

### Install

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the project root with the following values:

```bash
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/
MONGODB_DB=finance-notes-app
NEXTAUTH_SECRET=your-secret-key
```

Optional:

```bash
MONGODB_DB=your-database-name
```

Notes:

- If `MONGODB_DB` is not set, the app falls back to `finance-notes-app`.
- `NEXTAUTH_SECRET` should be a long, random string.

### Run Locally

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## Available Scripts

```bash
npm run dev
npm run build
npm run start
```

## Routes

- `/` redirects to the finance dashboard
- `/finance` finance tracker
- `/notes` notes workspace
- `/todos` to-do list
- `/login` sign-in page
- `/register-a7x9` registration page

## Project Structure

```text
app/         Next.js app routes, pages, and API endpoints
components/   Shared UI components
lib/          Database and session helpers
public/       Static assets and PWA manifest
auth.js      NextAuth configuration
proxy.js     Route protection
```

## Data Model

Fidger stores user data in MongoDB and scopes transactions, notes, and to-dos to the authenticated user session. The API routes enforce ownership checks before reading or mutating records.

## Building For Production

```bash
npm run build
npm run start
```

## Notes

- The registration route is intentionally not linked in the main navigation.
- All workspace routes require authentication.

