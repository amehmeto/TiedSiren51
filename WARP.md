# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

TiedSiren51 is a React Native mobile application built with Expo, featuring block sessions management, authentication, and notification services. The app helps users manage their device usage by creating "sirens" (apps, websites, keywords) and organizing them into blocklists for focused work sessions.

## Development Commands

### Core Development
- `yarn start` - Start Expo development server
- `yarn android` - Run on Android device/emulator  
- `yarn ios` - Run on iOS device/simulator
- `yarn web` - Run web version
- `yarn electron:dev` - Run Electron desktop version

### Code Quality & Testing
- `yarn lint` - Run TypeScript, ESLint, and Prettier checks
- `yarn lint:fix` - Fix linting and formatting issues
- `yarn test` - Run Vitest tests in watch mode
- `yarn test:prepush` - Run tests once (used in git hooks)
- `yarn test:cov` - Run tests with coverage report
- `yarn test:e2e` - Run Maestro end-to-end tests

### Building & Deployment
- `yarn prebuild` - Generate native code for both platforms
- `yarn prebuild:android` / `yarn prebuild:ios` - Platform-specific prebuild
- `yarn build` - Build for production (both platforms via EAS)
- `yarn build:android:apk` - Build Android APK for testing
- `yarn build:local` - Build locally (requires native toolchains)

### Database
- `npx prisma generate` - Generate Prisma client after schema changes
- `npx prisma migrate dev` - Run database migrations
- `yarn generate:schema` - Shorthand for prisma generate

## Architecture

The project follows **Hexagonal Architecture** with clear separation of concerns:

### Layer Structure
```
├── app/                    # UI Navigation (Expo Router)
│   ├── (auth)/             # Authentication flow screens  
│   ├── (tabs)/             # Main tab navigation screens
│   └── _layout.tsx         # Root layout with providers
├── ui/                     # UI Components & Design System
│   ├── design-system/      # Reusable UI components
│   ├── screens/            # Screen-specific components
│   └── hooks/              # UI-focused React hooks
├── core/                   # Business Logic (Domain Layer)
│   ├── auth/               # Authentication domain
│   ├── block-session/      # Block session management
│   ├── blocklist/          # Blocklist management  
│   ├── siren/              # Siren (apps/websites/keywords) domain
│   ├── ports/              # Interface definitions for external dependencies
│   └── _redux_/            # Redux Toolkit state management
├── infra/                  # Infrastructure (Adapters)
│   ├── auth-gateway/       # Firebase authentication
│   ├── *-repository/       # Prisma-based data repositories
│   ├── notification-service/ # Expo notifications
│   └── database-service/   # SQLite/Prisma database setup
```

### Key Architectural Patterns

**Dependency Injection**: Dependencies are injected via `createStore()` in `core/_redux_/createStore.ts`. The store receives a `Dependencies` object containing all infrastructure adapters.

**Redux + Hexagonal**: Business logic lives in Redux slices within `core/` domains, but infrastructure concerns are abstracted behind ports. Each domain has:
- Entity models (e.g., `sirens.ts`)
- Redux slice (e.g., `siren.slice.ts`) 
- Use cases for complex operations
- Selectors for state queries

**Repository Pattern**: Data access is abstracted through repository interfaces in `core/ports/` and implemented in `infra/` using Prisma.

## Database Schema

Uses SQLite with Prisma ORM. Key models:
- `BlockSession` - Timed focus sessions with associated blocklists
- `Blocklist` - Collections of sirens to block during sessions  
- `Device` - Remote devices that can join block sessions
- `Siren` - Individual items to block (apps, websites, keywords)

## Testing Strategy

- **Unit Tests**: Vitest for core business logic and use cases
- **E2E Tests**: Maestro for user journey testing
- **Coverage Tracking**: Automated coverage reporting with 98%+ target
- **Git Hooks**: Pre-commit linting, pre-push testing via Husky

## Development Guidelines

### Code Style
- No `console.log` statements in production code (use proper logging)
- No switch statements (enforced by ESLint) - use object maps or if/else
- Prettier formatting with specific rules for class member spacing
- TypeScript strict mode enabled

### Testing Requirements  
- Write tests for all use cases in `core/` domains
- Use `.spec.ts` suffix for test files
- Focus tests on business logic, not implementation details
- Maintain high test coverage (currently 98.83%)

### State Management
- Use Redux Toolkit for state management
- Keep business logic in slice reducers and use cases
- Use selectors for computed state and data queries
- Avoid direct state mutations outside of Redux

## Platform-Specific Notes

### Android Setup
Requires Android Studio, Java 17, and proper environment variables:
```bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"
```

### iOS Development
Requires Xcode and iOS Simulator for development and testing.

## Environment Configuration

The project uses multiple environment files:
- `.env` - Default environment variables
- `.env.development` - Development-specific config  
- `.env.preview` - Preview/staging config
- `.env.production` - Production config