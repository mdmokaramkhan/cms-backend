# CMS Backend

A Node.js backend API for a content management system built with Express and MongoDB.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose)
- **Storage:** Cloudinary
- **Auth:** JWT, bcrypt
- **Other:** Cron jobs, rate limiting, cookie parsing

## Setup

```bash
# Install dependencies
npm install

# Configure environment variables (create .env file)
# Required: MONGODB_URI, JWT_SECRET, CLOUDINARY_* credentials, etc.
```

## Running

```bash
# Development (with nodemon)
npm run dev

# Production
npm start
```

Server runs on `http://localhost:5000` by default.

## API Endpoints

| Base Path   | Description        |
|------------|--------------------|
| `/auth`    | Authentication     |
| `/artifacts` | Content artifacts |
| `/likes`   | Like/unlike        |
| `/comments`| Comments           |

## Project Structure

```
├── config/      # Database, Cloudinary config
├── controllers/ # Request handlers
├── cron/        # Scheduled tasks
├── middlewares/ # Auth, upload, rate limiting
├── models/      # Mongoose schemas
├── routes/      # API route definitions
├── services/    # Business logic
└── utils/       # Helpers (OTP, etc.)
```
