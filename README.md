# Warren Library System

A full-stack web application for managing a digital library with user authentication, book cataloging, and borrowing functionality.

## Features

- **User Authentication**: Login and registration with JWT tokens
- **Role-Based Access**: Admin and Student roles
- **Book Management**: Add, update, delete, and search books (Admin only)
- **Borrowing System**: Students can borrow and return books with filter options
- **Book Search**: Filter books by title, author, or category
- **Borrow Filters**: View all borrows or filter to show only active/recent borrows
- **Modern UI**: Beautiful, responsive design with library background
- **Side-by-Side Catalogue**: Search panel and book list displayed side-by-side

## Tech Stack

- **Backend**: Node.js, Express.js, PostgreSQL
- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Database**: PostgreSQL (supports Render.com with SSL)

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory:
   ```env
   DATABASE_URL=postgresql://username:password@host:port/database_name
   JWT_SECRET=your-secret-key-here
   PORT=5000
   ```

   **Note**: For Render.com databases, the SSL connection is automatically configured.

4. Create the database tables by running the SQL script:
   ```bash
   # Connect to your PostgreSQL database and run:
   psql -d your_database_name -f database.sql
   ```
   
   Or manually run the SQL commands from `backend/database.sql`

5. Create an admin user (optional - you can use the registration endpoint):
   ```bash
   node check-admin.js
   ```

6. Start the server:
   ```bash
   node server.js
   ```
   
   The server will run on port 5000 by default (or the PORT specified in .env)

### Frontend Setup

1. Open the `frontend` folder in your browser or use a local server
2. For development, you can use Live Server extension in VS Code
3. Or use Python's HTTP server:
   ```bash
   cd frontend
   python -m http.server 5500
   ```

4. Make sure the backend is running on port 5000 (or update `API_BASE_URL` in frontend JS files)

## API Endpoints

- `GET /api` - API information and status
- `POST /api/register` - Register a new user (creates student account)
- `POST /api/login` - Login and get JWT token
- `GET /api/books` - Get all books (with optional search filters: ?title=...&author=...&category=...)
- `POST /api/books` - Add a new book (Admin only)
- `PUT /api/books/:id` - Update a book (Admin only)
- `DELETE /api/books/:id` - Delete a book (Admin only)
- `POST /api/borrow` - Borrow a book (Student only)
- `POST /api/return/:borrow_id` - Return a borrowed book
- `GET /api/borrows` - Get user's borrowed books

## Default Admin Credentials

After setting up the database, you can create an admin user using:

```bash
cd backend
node check-admin.js
```

Default admin credentials (if created):
- **Email**: `admin@example.com`
- **Password**: `admin123`

**⚠️ Important**: Change the admin password in production!

## Project Structure

```
project/
├── backend/
│   ├── server.js          # Express server and API routes
│   ├── database.sql       # Database schema
│   ├── package.json      # Backend dependencies
│   ├── .env              # Environment variables (create this)
│   └── check-admin.js    # Script to create/check admin user
├── frontend/
│   ├── index.html        # Login/Register page
│   ├── admin.html       # Admin dashboard
│   ├── catalogue.html   # Book catalogue (students)
│   ├── borrow.html      # My borrows page
│   ├── css/
│   │   └── styles.css   # Main stylesheet
│   └── js/
│       ├── auth.js      # Authentication logic
│       ├── admin.js     # Admin functionality
│       ├── catalogue.js # Catalogue and search
│       └── borrow.js    # Borrow management
└── README.md
```

## Key Features

### Authentication
- JWT-based authentication with 24-hour token expiration
- Case-insensitive email matching
- Automatic whitespace trimming
- Secure password hashing with bcryptjs

### Book Management
- Admin can add, update, and delete books
- Books have: title, author, ISBN, category, availability status
- ISBN must be unique
- Books are automatically marked as unavailable when borrowed

### Borrowing System
- Students can borrow available books
- Borrow period: **15 days** from borrow date
- Students can view their borrowed books with filter options:
  - **Show All**: Displays all borrows (returned and active)
  - **Show Recent Borrow**: Shows only active borrows (not yet returned)
- Students can return books
- Books are automatically marked as available when returned
- Dates are displayed in DD/MM/YYYY format

### User Interface
- Modern, responsive design
- Library background image
- Side-by-side search and book list layout
- Formatted date display (DD/MM/YYYY)
- Search filtering with Enter key
- Filter buttons for borrow history

## Configuration

### Environment Variables

Create a `.env` file in the `backend` directory:

```env
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-secret-key-change-in-production
PORT=5000
```

### Database Schema

The database includes three main tables:
- **users**: User accounts with roles (admin/student)
- **books**: Book catalog with availability status (automatically calculated)
- **borrows**: Borrowing records with dates (DATE type: borrow_date, due_date, return_date)

**Note**: Book availability is automatically calculated based on active borrows (no manual toggle needed).

See `backend/database.sql` for the complete schema.

## Notes

- For Render.com databases, SSL is automatically configured
- JWT tokens expire after 24 hours
- Books are borrowed for **15 days** by default
- Dates are stored as DATE type (no time component)
- Date format: DD/MM/YYYY for display
- Make sure to change the JWT_SECRET in production
- The frontend connects to `http://localhost:5000/api` by default
- All API endpoints require authentication except `/api/register` and `/api/login`

## Troubleshooting

### Database Connection Issues
- Check your `DATABASE_URL` in `.env`
- For Render.com databases, SSL is handled automatically
- Ensure the database is accessible from your network

### Login Issues
- Verify admin user exists: `node backend/check-admin.js`
- Check email is exactly: `admin@example.com` (case-sensitive in database)
- Default password: `admin123`

### Port Conflicts
- Backend runs on port 5000 by default
- Frontend expects backend on port 5000
- Update `API_BASE_URL` in frontend JS files if using a different port

## License

This project is for educational purposes.
