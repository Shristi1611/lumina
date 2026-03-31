# 💅 Lumina

> A glamorous book-reading web app with Pomodoro focus sessions, personal bookshelves, and reading stats — because smart is the new pink.

![Legally Blonde vibes: hot pink, gold, cream aesthetic]

---

## ✨ Features

- **📚 Book Discovery** — Search millions of books via Open Library API (free, no key required) and Google Books API
- **🔖 Personal Bookshelf** — Track books as Want to Read, Currently Reading, or Finished
- **📈 Reading Progress** — Track current page and see progress bars per book
- **🍅 Pomodoro Timer** — Focus sessions with customizable durations, sound notifications, auto-break, and session tracking
- **📝 Book Notes** — Add colored sticky notes to any book on your shelf
- **📊 Reading Dashboard** — Stats, goals, reading history, and top books
- **🔐 Authentication** — JWT-based register/login
- **✨ Legally Blonde aesthetic** — Hot pink, gold, cream, serif fonts, glamorous

---

## 🛠️ Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React 18, React Router v6         |
| Backend   | Node.js, Express.js               |
| Database  | MongoDB + Mongoose                |
| Auth      | JWT (jsonwebtoken) + bcryptjs     |
| Books API | Open Library (free) + Google Books|
| Styling   | Pure CSS with CSS variables       |

---

## 🚀 Quick Start (Local Dev)

### Prerequisites
- Node.js 18+
- MongoDB running locally on port 27017

### 1. Clone & Install
```bash
git clone <your-repo>
cd blondereads
npm run install-all
```

### 2. Configure environment
```bash
cd backend
cp .env.example .env
# Edit .env — change JWT_SECRET!
```

### 3. Start everything
```bash
# From root
npm run dev
# → Backend:  http://localhost:5000
# → Frontend: http://localhost:3000
```

---

## 🐳 Docker Setup (Recommended for Production)

```bash
docker-compose up -d
# → App: http://localhost:3000
# → API: http://localhost:5000
```

---

## 📁 Project Structure

```
blondereads/
├── backend/
│   ├── models/
│   │   ├── User.js          # User schema + auth
│   │   ├── ShelfItem.js     # Bookshelf entries
│   │   ├── Pomodoro.js      # Sessions + settings
│   │   └── Note.js          # Book notes
│   ├── routes/
│   │   ├── auth.js          # /api/auth
│   │   ├── books.js         # /api/books (Open Library proxy)
│   │   ├── shelf.js         # /api/shelf
│   │   ├── pomodoro.js      # /api/pomodoro
│   │   └── notes.js         # /api/notes
│   ├── middleware/auth.js   # JWT protect middleware
│   └── server.js            # Express entry point
│
└── frontend/
    └── src/
        ├── components/
        │   ├── Layout.js    # Navbar + footer
        │   └── BookCard.js  # Reusable book card
        ├── context/
        │   ├── AuthContext.js
        │   └── ShelfContext.js
        ├── hooks/
        │   └── usePomodoro.js  # Timer logic + sound
        ├── pages/
        │   ├── Home.js         # Landing + trending
        │   ├── Discover.js     # Search + browse
        │   ├── BookDetail.js   # Book info + notes + progress
        │   ├── Shelf.js        # Personal bookshelf
        │   ├── PomodoroPage.js # Timer + session tracking
        │   ├── Dashboard.js    # Stats + goals
        │   ├── Login.js        # Auth pages
        │   └── Register.js
        ├── utils/api.js    # Axios instance + API calls
        └── index.css       # Global styles (Legally Blonde ✨)
```

---

## 🔑 API Endpoints

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| PUT | /api/auth/profile | Update profile |

### Books (Open Library proxy)
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/books/search?q=&page= | Search books |
| GET | /api/books/trending | Weekly trending |
| GET | /api/books/:id | Book details |
| GET | /api/books/subject/:subject | Browse by genre |

### Shelf (🔐 Protected)
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/shelf | Get user's shelf |
| POST | /api/shelf | Add book |
| PUT | /api/shelf/:id | Update status/page/rating |
| DELETE | /api/shelf/:id | Remove book |
| GET | /api/shelf/stats/overview | Shelf statistics |

### Pomodoro (🔐 Protected)
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/pomodoro/settings | Get timer settings |
| PUT | /api/pomodoro/settings | Save settings |
| POST | /api/pomodoro/session | Log a session |
| GET | /api/pomodoro/stats | Session stats |
| GET | /api/pomodoro/history | Session history |

### Notes (🔐 Protected)
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/notes/:bookId | Get notes for book |
| POST | /api/notes | Create note |
| PUT | /api/notes/:id | Update note |
| DELETE | /api/notes/:id | Delete note |

---

## 🎨 Design System

- **Primary**: `#ff2d78` (hot pink)
- **Accent**: `#c9a227` (gold)
- **Background**: `#fdf8f0` (cream)
- **Display Font**: Playfair Display (serif, italic)
- **Body Font**: DM Sans
- **Accent Font**: Cormorant Garamond

---

## 💅 Because smart is the new pink.
