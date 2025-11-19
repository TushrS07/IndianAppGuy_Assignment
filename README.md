# IndianAppGuy — Web App

## About

IndianAppGuy is a full-stack fitness web application demo showcasing a React frontend and a Node/Express backend. It provides user authentication, a simple API for managing workouts and plans, and a responsive UI intended for learning and experimentation.

## Features

- User signup, login (JWT-based) and session management  
- CRUD operations for workouts, plans and user profiles via a REST API  
- Responsive React client with form validation and basic state management  
- Persistent storage in Database

## Tech stack

- Frontend: React (+ Vite/Create React App)  
- Backend: Node.js, Express  
- Database: MongoDB
- Authentication: JSON Web Tokens (JWT)  
- Dev tools: npm / yarn, Git


Instructions to run.

## Prerequisites
- Git
- Node.js (>=16) and npm or yarn

## Quick start
1. Clone:
```bash
git clone <repo-url>
cd <repo-directory>
```
2. Install:
```bash
npm install
# or
yarn
```
3. Run client:
```bash
npm run dev
```
3. Run server:
```bash
npm start
```

## Environment
- Copy `.env.example` to `.env` and set required keys (e.g. PORT, DATABASE_URL, JWT_SECRET, REACT_APP_API_URL).
