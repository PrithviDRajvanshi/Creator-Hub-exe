# AI CreatorHub

AI CreatorHub is a full-stack AI-powered content management platform
designed for creators to create, manage, and enhance their content using
AI-powered tools.

## Features

- User registration and authentication
- JWT-based authentication
- Password hashing
- Role-based authorization
- Content creation and management
- Media/file uploads
- Gemini AI integration
- AI content generation
- AI-assisted rewriting and summarization
- AI function calling / tool use
- Prompt injection protection
- Input validation
- Rate limiting
- Automated unit tests
- API integration testing
- MongoDB data management

## Tech Stack

### Frontend
- React
- TypeScript
- Vite

### Backend
- Node.js
- Express
- TypeScript

### Database
- MongoDB
- Mongoose

### AI
- Google Gemini API
- `@google/genai`

### Testing
- Vitest
- Supertest
- MongoDB Memory Server

## Architecture

React Frontend
↓
Express REST API
↓
Controllers / Services
↓
MongoDB / Gemini API

## Getting Started

### Prerequisites

- Node.js
- MongoDB
- Gemini API key

### Installation

```bash
npm install
1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
