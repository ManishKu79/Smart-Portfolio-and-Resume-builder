# Smart Portfolio & Resume Builder

A production-ready SaaS platform that enables professionals to build ATS-optimized resumes and modern portfolio websites with AI-powered assistance, real-time analytics, and seamless third-party integrations.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

This platform solves the problem of creating job-winning resumes and personal portfolios by combining AI-driven content generation, drag-and-drop builders, ATS scoring, and comprehensive analytics. Users can sign up, build unlimited resumes and portfolios, track engagement, and export professional PDFs.

**Target audience:** job seekers, freelancers, students, and professionals who want to stand out in competitive markets.

---

## Architecture

The application is split into two separate folders:

- **Frontend:** Next.js 14 with App Router, Tailwind CSS, Framer Motion, and React Query.
- **Backend:** Express.js REST API with MongoDB, JWT authentication, and external service integrations (OpenAI, Cloudinary, GitHub, LinkedIn).

Communication is done via HTTP requests. The frontend stores JWT tokens in localStorage and cookies. The backend exposes protected routes with middleware-based authentication.

---

## Key Features

### Authentication
- User registration & login (email/password)
- JWT tokens with refresh mechanism
- Protected routes and API endpoints
- Forgot password & reset password flow
- Email verification (optional)

### Resume Builder
- 10+ professional templates (modern, classic, creative, executive)
- Drag-and-drop reordering of sections
- Real‑time preview
- AI summary & bullet point generator
- ATS score checker with actionable suggestions
- PDF export with embedded QR code (shareable link)
- Version history and auto‑save

### Portfolio Builder
- Dynamic portfolio generator with custom slug
- Theme customizer (colors, fonts, layout)
- Live preview for instant feedback
- SEO meta tags (title, description, keywords)
- Custom domain support (CNAME setup)
- Contact form with email notifications
- Portfolio analytics (views, click‑throughs)

### AI Features (OpenAI)
- Resume summary generator (based on job title and experience)
- Project description improver
- Skill suggestions by role (e.g., "Frontend Developer")
- ATS keyword extraction from job descriptions
- Interview question generator for practice

### Dashboard & Analytics
- Overview stats: total resumes, portfolios, views, downloads
- Activity chart (line/area/bar) for last 7/30/365 days
- Recent activity feed with time‑ago timestamps
- Profile completion progress bar
- Quick action buttons (create resume, portfolio, import)
- Template usage analytics

### Integrations
- GitHub – import public repositories and contributions
- LinkedIn – OAuth login and profile import (name, headline, experience)
- Cloudinary – upload avatars and portfolio images
- OpenAI – AI content generation

---

## Technology Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| Next.js 14 (App Router) | React framework |
| Tailwind CSS | Utility-first styling |
| Framer Motion | Animations |
| React Hook Form | Form handling |
| Recharts | Charts for analytics |
| Axios | HTTP client |
| Lucide React | Icons |
| React Hot Toast | Notifications |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js + Express | API server |
| MongoDB + Mongoose | Database & ODM |
| JSON Web Tokens (JWT) | Authentication |
| bcryptjs | Password hashing |
| OpenAI SDK | AI features |
| Cloudinary SDK | Image upload |
| Nodemailer | Email sending |
| express-rate-limit | Brute force protection |
| helmet | Security headers |

### DevOps & Tools
- Git – version control
- npm / yarn – package management
- Docker – containerization (optional)
- Vercel – frontend deployment (recommended)
- MongoDB Atlas – cloud database

---

## Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- MongoDB database (local or Atlas)
- Cloudinary account (free tier works)
- OpenAI API key (optional – AI features can be disabled)

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/smart-portfolio-resume-builder.git
cd smart-portfolio-resume-builder
