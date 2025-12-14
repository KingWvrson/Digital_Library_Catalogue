# 📚 Warren Library System

A modern, full-stack web application for managing a digital library with comprehensive user authentication, book cataloging, and borrowing functionality.

## 🌐 Live Demo

- **Frontend**: [View on GitHub Pages](https://kingwvrson.github.io/Digital_Library_Catalogue/frontend/index.html)
- **Backend API**: 
  - **API Root**: [https://digital-library-catalogue.onrender.com/api](https://digital-library-catalogue.onrender.com/api) - API information endpoint
  - **Backend Base**: [https://digital-library-catalogue.onrender.com](https://digital-library-catalogue.onrender.com) - Shows API documentation

> **Note**: The backend is an API server. Access `/api` for API information, or use the root URL to see available endpoints.

## ✨ Features

### 🔐 Authentication & Authorization
- Secure JWT-based authentication with 24-hour token expiration
- Role-based access control (Admin and Student roles)
- Case-insensitive email matching with automatic whitespace trimming
- Secure password hashing using bcryptjs

### 📖 Book Management
- **Admin Features**:
  - Add, update, and delete books
  - Search and filter books by title, author, or category
  - Automatic availability tracking based on borrow status
- **Book Information**:
  - Title, author, ISBN, category, and availability status
  - Unique ISBN validation
  - Real-time availability updates

### 📚 Borrowing System
- **Student Features**:
  - Borrow available books with automatic 15-day loan period
  - Return books with automatic availability updates
  - View borrowing history with advanced filtering:
    - **Show All**: Displays all borrows (returned and active)
    - **Show Recent Borrow**: Shows only active borrows
- **Date Management**:
  - Dates stored as DATE type (no time component)
  - Display format: DD/MM/YYYY

### 🎨 User Interface
- Modern, responsive design with library-themed background
- Side-by-side search panel and book list layout
- Intuitive navigation and user experience
- Keyboard shortcuts (Enter key for search)

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs for password hashing
- **Deployment**: Render.com with SSL support

### Frontend
- **Languages**: HTML5, CSS3, Vanilla JavaScript
- **Deployment**: GitHub Pages
- **Architecture**: Single Page Application (SPA) with multiple views

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher)
- **PostgreSQL** database (local or cloud-hosted)
- **npm** or **yarn** package manager
- **Git** (for cloning the repository)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/kingwvrson/Digital_Library_Catalogue.git
cd Digital_Library_Catalogue
```

### 2. Backend Setup

#### Install Dependencies

```bash
cd backend
npm install
```

#### Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
DATABASE_URL=postgresql://username:password@host:port/database_name
JWT_SECRET=your-secret-key-here-change-in-production
PORT=5000
```

> **Note**: For Render.com databases, SSL connection is automatically configured.

#### Initialize Database

Run the database schema script:

**Option 1: Using psql command line**

```bash
psql -d your_database_name -f backend/database.sql
```

**Option 2: Manually execute SQL commands**

1. Open `backend/database.sql` in a text editor
2. Copy all the SQL commands from the file
3. Connect to your PostgreSQL database using one of these methods:
   
   **Using psql interactive mode:**
   ```bash
   psql -d your_database_name
   ```
   Then paste and execute the SQL commands
   
   **Using a database GUI tool:**
   - Open pgAdmin, DBeaver, or another PostgreSQL client
   - Connect to your database
   - Open a new query window
   - Paste the SQL commands from `backend/database.sql`
   - Execute the query
   
   **Using psql with input:**
   ```bash
   psql -d your_database_name < backend/database.sql
   ```

#### Create Admin User (Optional)

```bash
node check-admin.js
```

This creates a default admin user:
- **Email**: `admin@example.com`
- **Password**: `admin123`

> **⚠️ Security Note**: Change the default admin password immediately in production environments.

#### Start the Backend Server

```bash
node server.js
```

The server will run on `http://localhost:5000` by default (or the PORT specified in `.env`).

### 3. Frontend Setup

#### Option 1: Using Live Server (VS Code Extension)

1. Install the "Live Server" extension in VS Code
2. Right-click on `frontend/index.html` and select "Open with Live Server"

#### Option 2: Using Python HTTP Server

```bash
cd frontend
python -m http.server 5500
```

Then navigate to `http://localhost:5500` in your browser.

#### Option 3: Direct File Access

Simply open `frontend/index.html` in your web browser.

#### Backend API Configuration

- **Default**: Uses the deployed Render backend (`https://digital-library-catalogue.onrender.com/api`)
- **Local Development**: 
  - Add `?useLocalApi=true` to the frontend URL, or
  - Run `localStorage.setItem('useLocalApi','true')` in the browser console
  - Ensure the frontend is running on `localhost` or `127.0.0.1`
  - Backend API will point to `http://localhost:5000/api`

## 🚀 Deployment

### Live Deployment Links

- **Frontend (GitHub Pages)**: [https://kingwvrson.github.io/Digital_Library_Catalogue/frontend/index.html](https://kingwvrson.github.io/Digital_Library_Catalogue/frontend/index.html)
- **Backend API (Render)**: 
  - **API Root**: [https://digital-library-catalogue.onrender.com/api](https://digital-library-catalogue.onrender.com/api)
  - **Backend Base**: [https://digital-library-catalogue.onrender.com](https://digital-library-catalogue.onrender.com)

### Backend Deployment (Render.com)

1. **Create a Render Account**
   - Sign up at [render.com](https://render.com)
   - Connect your GitHub account

2. **Create a New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository: `Digital_Library_Catalogue`

3. **Configure the Service**
   - **Name**: `digital-library-catalogue` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && node server.js`
   - **Root Directory**: Leave empty (or set to repository root)

4. **Set Environment Variables**
   - Go to the "Environment" tab
   - Add the following variables:
     - `DATABASE_URL`: Your PostgreSQL connection string
     - `JWT_SECRET`: A strong, random secret key
     - `PORT`: `5000` (optional, Render sets this automatically)

5. **Create PostgreSQL Database**
   - In Render dashboard, click "New +" → "PostgreSQL"
   - Create a new database
   - Copy the "Internal Database URL" or "External Database URL"
   - Use this as your `DATABASE_URL` environment variable

6. **Initialize Database**
   - Connect to your Render PostgreSQL database
   - Run the SQL commands from `backend/database.sql`

7. **Deploy**
   - Render will automatically deploy on every push to your main branch
   - Or click "Manual Deploy" → "Deploy latest commit"

### Frontend Deployment (GitHub Pages)

1. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Navigate to **Settings** → **Pages**
   - Under "Source", select your branch (usually `main` or `master`)
   - Select the folder containing your frontend (typically `/root` or `/docs`)
   - Click **Save**

2. **Configure for Frontend Folder**
   - If your frontend is in a `frontend/` folder:
     - Set the source to `/root` and the path will be `/frontend/index.html`
     - Or create a `docs/` folder and move frontend files there, then set source to `/docs`

3. **Update API Configuration**
   - Ensure your frontend JavaScript files point to the deployed backend URL:
     - `https://digital-library-catalogue.onrender.com/api`

4. **Access Your Site**
   - Your site will be available at:
     - `https://[your-username].github.io/Digital_Library_Catalogue/frontend/index.html`
   - Or if using a custom domain, configure it in GitHub Pages settings

### Deployment Notes

- **Backend**: Render automatically handles SSL/HTTPS
- **Frontend**: GitHub Pages provides free SSL certificates
- **Database**: Render PostgreSQL databases include SSL support (automatically configured)
- **CORS**: Backend is configured to accept requests from any origin (`cors({ origin: '*' })`)
- **Auto-Deploy**: Both platforms support automatic deployment on git push

## 📡 API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api` | API information and status |
| `POST` | `/api/register` | Register a new user (creates student account) |
| `POST` | `/api/login` | Login and receive JWT token |

### Protected Endpoints (Require Authentication)

#### Books

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| `GET` | `/api/books` | Get all books (supports query params: `?title=...&author=...&category=...`) | All |
| `POST` | `/api/books` | Add a new book | Admin |
| `PUT` | `/api/books/:id` | Update a book | Admin |
| `DELETE` | `/api/books/:id` | Delete a book | Admin |

#### Borrowing

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| `POST` | `/api/borrow` | Borrow a book | Student |
| `POST` | `/api/return/:borrow_id` | Return a borrowed book | Student |
| `GET` | `/api/borrows` | Get user's borrowed books | Student |

### Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📁 Project Structure

```
Digital_Library_Catalogue/
├── backend/                    # Node.js/Express Backend
│   ├── server.js              # Main Express server
│   ├── database.sql           # Database schema & queries
│   ├── check-admin.js         # Admin user setup script
│   ├── hash.js                # Password hashing utilities
│   ├── package.json           # Backend dependencies
│   ├── package-lock.json      # Dependency lock file
│   ├── .env                   # Environment variables (create this)
│   └── node_modules/          # Dependencies
│
├── frontend/                   # Frontend Application
│   ├── index.html             # Login/Register page
│   ├── admin.html             # Admin dashboard
│   ├── catalogue.html         # Book catalogue (student view)
│   ├── borrow.html            # Borrow management page
│   ├── css/
│   │   └── styles.css         # Main stylesheet
│   └── js/
│       ├── auth.js            # Authentication logic
│       ├── admin.js           # Admin functionality
│       ├── catalogue.js       # Book search & catalogue
│       └── borrow.js          # Borrow/return operations
│
├── .nojekyll                   # GitHub Pages configuration
├── _config.yml                 # Jekyll configuration
├── .gitattributes              # Git configuration
└── README.md                   # This file
```

## 🗄️ Database Schema

The database consists of three main tables:

### `users`
- User accounts with role-based access (admin/student)
- Fields: `id`, `email`, `password_hash`, `role`, `created_at`

### `books`
- Book catalog with availability status
- Fields: `id`, `title`, `author`, `isbn`, `category`, `created_at`
- **Note**: Availability is automatically calculated based on active borrows

### `borrows`
- Borrowing records with date tracking
- Fields: `id`, `user_id`, `book_id`, `borrow_date`, `due_date`, `return_date`
- Dates stored as DATE type (no time component)

For the complete schema, see `backend/database.sql`.

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `JWT_SECRET` | Secret key for JWT token signing | Yes | - |
| `PORT` | Server port number | No | `5000` |

### Important Configuration Notes

- **JWT Tokens**: Expire after 24 hours
- **Borrow Period**: 15 days from borrow date
- **Date Format**: DD/MM/YYYY for display
- **SSL**: Automatically configured for Render.com databases
- **Production**: Change `JWT_SECRET` to a strong, random value

## 🔧 Troubleshooting

### Database Connection Issues

- Verify `DATABASE_URL` in `.env` is correct
- Ensure PostgreSQL is running and accessible
- For Render.com databases, SSL is handled automatically
- Check network connectivity and firewall settings

### Authentication Issues

- Verify admin user exists: `node backend/check-admin.js`
- Check email format: `admin@example.com` (case-sensitive in database)
- Default password: `admin123` (change in production)
- Ensure JWT_SECRET is set in `.env`

### Port Conflicts

- Backend defaults to port `5000`
- Frontend expects backend on port `5000` (or configured PORT)
- Update API endpoints in frontend JS files if using a different port
- Check for other services using the same port

### Frontend API Connection

- Verify backend is running before accessing frontend
- Check browser console for CORS or connection errors
- Ensure `useLocalApi` flag is set correctly for local development
- Verify API base URL matches your backend deployment

### Backend API Access

- **Root URL** (`/`): Shows API information and available endpoints
- **API Endpoint** (`/api`): Returns API status and version
- **All routes** are under `/api` - accessing root URL is normal and shows helpful information
- If you see `{"error":"Route not found"}`, you're accessing a route that doesn't exist - check the API endpoints table above

## 🔒 Security Considerations

- **Password Security**: All passwords are hashed using bcryptjs
- **JWT Tokens**: Use strong, unique `JWT_SECRET` in production
- **Database**: Use SSL connections for production databases
- **Default Credentials**: Change default admin credentials immediately
- **Environment Variables**: Never commit `.env` files to version control

## 📝 Development Notes

- Frontend defaults to deployed API at `https://digital-library-catalogue.onrender.com/api`
- For local development, use `?useLocalApi=true` query parameter
- All API endpoints require authentication except `/api/register` and `/api/login`
- Redirect helper page at `docs/index.html` forwards to the frontend

## 📄 License

This project is for educational purposes.

## 👤 Author

Created by yours truly Warren as a student project for educational purposes.

##  Testing

- user for testing as student: arnold@acity.com
- password for testing as student: 123456



---

**Note**: This is a demonstration project. For production use, implement additional security measures, error handling, and testing.
