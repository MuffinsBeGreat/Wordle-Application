# Wordle App

A full-stack Wordle clone supporting word lengths of 3 to 7 letters. Features user authentication, role-based authorization, a word management system, and an admin dashboard for user administration.

## Project Summary

This application allows users to play Wordle at varying difficulty levels determined by word length. It includes a React frontend, a serverless backend running on Netlify Functions, and a PostgreSQL database hosted on Neon. Users can register accounts, log in, play games, and administrators can manage words and users through a dedicated interface.

### Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, shadcn/ui |
| Backend | Netlify Functions (serverless) |
| Database | Neon (serverless PostgreSQL) |
| Authentication | JWT, bcrypt |
| Navigation | Custom GooeyNav animated navbar |

## Getting Started

```bash
# Install dependencies
npm install

# Run Vite development server
npm run dev

# Run with Netlify dev (enables serverless functions locally)
npm run dev:netlify
```

The application is available at `http://localhost:5173` or `http://localhost:8888` when using Netlify dev.

## Game Modes

Five difficulty levels are available, determined by word length:

- `/wordle/3` — 3-letter words
- `/wordle/4` — 4-letter words
- `/wordle/5` — 5-letter words
- `/wordle/6` — 6-letter words
- `/wordle/7` — 7-letter words

Each game grants `word length + 1` guesses. Words are stored in the database and validated against the Dictionary API at runtime.

## Authentication

- **Register** at `/register` — create an account (password must contain uppercase, lowercase, numeric, and special characters)
- **Login** at `/` — authenticate and receive a JWT token stored in localStorage
- **Change Password** at `/change-password` — required when an administrator resets a user's password

## Admin Panel

Users with the admin role (role ID 1) have access to additional functionality on the search page:

- **Add Word** — insert new words into the database
- **Edit / Delete** — select a word from search results to modify or remove it
- **Manage Users** — view all users, change roles, reset passwords, or delete accounts

The admin interface is located at `/search`.

## Project Structure

```
wordle-app/
├── src/
│   ├── App.jsx              # Route definitions
│   ├── routes/
│   │   ├── login.jsx         # Login page
│   │   ├── register.jsx      # Registration page
│   │   ├── dashboard.jsx     # Home screen with mode selection
│   │   ├── search.jsx        # Word search and admin panel
│   │   ├── change-password.jsx  # Password change page
│   │   └── wordle-{3-7}.jsx  # Game components
│   ├── components/
│   │   ├── GooeyNav.jsx      # Animated navigation bar
│   │   ├── WordleInput.jsx   # Letter grid input component
│   │   ├── SearchBar.jsx     # Word search component
│   │   ├── ProtectedRoute.jsx  # Redirects unauthenticated users
│   │   ├── PublicRoute.jsx     # Redirects authenticated users
│   │   └── AdminRoute.jsx      # Restricts access to admin users
│   └── lib/
│       ├── api.js            # Fetch wrapper with auth headers
│       ├── useAuth.js        # Hook for retrieving user role and username
│       └── utils.js          # Utility functions
├── netlify/
│   └── functions/            # Serverless backend functions
│       ├── db.js             # Neon database connection
│       ├── login.js          # POST /api/login
│       ├── register.js       # POST /api/register
│       ├── verify.js         # GET /api/auth/verify
│       ├── validation.js     # Input validation utilities
│       ├── search.js         # GET /api/search?q=
│       ├── words-random.js   # GET /api/words/random?length=
│       ├── words-create.js   # POST /api/words
│       ├── words-update.js   # PUT/DELETE /api/words/:word
│       ├── admin-users.js    # GET /api/admin/users
│       ├── admin-users-role.js    # PUT user role
│       ├── admin-users-password.js # PUT user password
│       ├── admin-users-delete.js   # DELETE user
│       ├── change-password.js # PUT /api/change-password
│       └── _adminGuard.js    # Admin role verification middleware
├── netlify.toml              # Netlify configuration and redirects
└── .env                      # Environment variables (not committed)
```

## Database

PostgreSQL hosted on Neon. The schema was created directly on the Neon dashboard and is not defined in this repository.

### Users Table

| Column | Type | Description |
|---|---|---|
| user_id | serial | Primary key |
| username | text | Unique username |
| password_hash | text | Bcrypt password hash |
| role | integer | 1 = admin, 2 = user |
| password_changed_by_admin | boolean | Default false |
| created_at | timestamp | Default current timestamp |

### Words Table

| Column | Type | Description |
|---|---|---|
| word | text | Primary key |
| length | integer | Word length (3-7) |
| description | text | Optional description |

## Available Scripts

```bash
npm run dev           # Start Vite development server
npm run dev:netlify   # Start Netlify development server
npm run build         # Create production build
npm run preview       # Preview production build
npm run lint          # Run ESLint
```

## API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | /api/login | Authenticate user |
| POST | /api/register | Create a new account |
| GET | /api/auth/verify | Validate JWT token |
| PUT | /api/change-password | Update user password |
| GET | /api/search?q= | Search words |
| GET | /api/words/random?length= | Retrieve a random word |
| POST | /api/words | Add a new word (admin) |
| PUT | /api/words/:word | Update a word (admin) |
| DELETE | /api/words/:word | Delete a word (admin) |
| GET | /api/admin/users | List all users (admin) |
| PUT | /api/admin/users/:id/role | Change user role (admin) |
| PUT | /api/admin/users/:id/password | Reset user password (admin) |
| DELETE | /api/admin/users/:id | Delete a user (admin) |

## Notes

- Word validation uses the free Dictionary API at runtime, which requires an active internet connection.
