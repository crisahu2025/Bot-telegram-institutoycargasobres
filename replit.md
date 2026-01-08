# Church Bot Admin Dashboard

## Overview

A full-stack web application serving as an admin dashboard for a church Telegram bot system. The platform manages church ministries, leaders, prayer requests, envelope loads (tithe/offering tracking), new visitor registration, and institute enrollments/payments. The Telegram bot ("Boni") handles member interactions while this web dashboard provides administrative oversight.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight alternative to React Router)
- **State Management**: TanStack React Query for server state
- **UI Components**: Shadcn/ui built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite with hot module replacement

The frontend follows a page-based architecture with shared components. Custom hooks in `client/src/hooks/use-dashboard.ts` abstract all API calls, providing clean separation between UI and data fetching logic.

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Bot Integration**: node-telegram-bot-api for Telegram bot functionality
- **Validation**: Zod schemas shared between client and server

The server uses a storage abstraction pattern (`server/storage.ts`) implementing an `IStorage` interface, allowing the database implementation to be swapped if needed. Routes are defined declaratively in `shared/routes.ts` with Zod validation schemas.

### Database Design
PostgreSQL database with tables for:
- `bot_users` - Telegram user sessions and state machine tracking
- `ministries` - Church ministry groups
- `leaders` - Ministry leaders with ministry associations
- `prayer_requests` - Member prayer submissions
- `envelope_loads` - Tithe/offering tracking with ministry/leader metadata
- `new_people` - Visitor/convert registration
- `institute_enrollments` - Biblical institute student enrollments
- `institute_payments` - Monthly payment tracking for institute

### API Structure
RESTful API with endpoints following the pattern `/api/{resource}`. The `shared/routes.ts` file defines a typed API contract with input/output schemas, enabling type-safe API calls from the frontend.

### Telegram Bot Integration
The bot (`server/bot.ts`) implements a state machine pattern for multi-step conversations. User state is persisted in the `bot_users` table, allowing conversations to resume across sessions. The bot handles:
- Prayer request submissions
- Envelope/tithe loading with photo uploads
- Institute enrollment and payment tracking
- New visitor registration

## External Dependencies

### Database
- **PostgreSQL**: Primary data store accessed via `DATABASE_URL` environment variable
- **Drizzle Kit**: Database migrations stored in `/migrations`

### Third-Party Services
- **Telegram Bot API**: Bot token configured via `TELEGRAM_TOKEN` environment variable
- **Google Fonts**: DM Sans and Outfit font families for typography

### Key NPM Packages
- `node-telegram-bot-api` - Telegram bot SDK
- `drizzle-orm` + `drizzle-zod` - Type-safe ORM with Zod integration
- `@tanstack/react-query` - Server state management
- `@radix-ui/*` - Accessible UI primitives
- `date-fns` - Date formatting utilities
- `zod` - Runtime type validation