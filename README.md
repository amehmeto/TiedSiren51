# TiedSiren51

A React Native app blocker that helps users stay focused. Create "sirens" (apps, websites, or keywords to block), organize them into blocklists, and run timed block sessions to limit distractions.

## Tech Stack

- **React Native / Expo** - Cross-platform mobile framework
- **TypeScript** - Type-safe JavaScript
- **Redux Toolkit** - State management
- **Firebase Auth** - User authentication
- **Prisma** - Database ORM

### Custom Expo Modules

Four in-house native modules power the Android blocking functionality:

| Module | Purpose |
|--------|---------|
| [@amehmeto/expo-foreground-service](https://github.com/amehmeto/expo-foreground-service) | Persistent background service with notification |
| [@amehmeto/tied-siren-blocking-overlay](https://github.com/amehmeto/tied-siren-blocking-overlay) | Native blocking overlay and schedule enforcement |
| [@amehmeto/expo-accessibility-service](https://github.com/amehmeto/expo-accessibility-service) | Foreground app detection via Android Accessibility |
| [@amehmeto/expo-list-installed-apps](https://github.com/amehmeto/expo-list-installed-apps) | Enumerate installed apps on device |

## Features

- **Sirens** - Define what to block: specific apps, websites, or keywords
- **Blocklists** - Group sirens into reusable collections
- **Block Sessions** - Run timed focus sessions that enforce your blocklists
- **Device Sync** - Keep your configuration synchronized across devices
- **Firebase Auth** - Secure user authentication

## Documentation

- [CLAUDE.md](./CLAUDE.md) - Developer guide with patterns, commands, and anti-patterns
- [Architecture Decision Records](./docs/adr/README.md) - Index of all architectural decisions

## Prerequisites

- Node.js (v18 or newer recommended)
- npm (comes with Node.js)
- Android Studio (for Android development)


## Android Development Setup for macOS

Setting up the Android development environment on macOS requires a few specific steps:

### 1. Install Java Development Kit (OpenJDK 17)

Android development requires a compatible Java version. OpenJDK 17 is recommended:

```bash
# Install OpenJDK 17 using Homebrew
brew install openjdk@17

# Verify installation
java -version   # Should show Java 17
javac -version  # Should show JavaC 17
```

### 2. Configure Java Environment

The Homebrew-installed OpenJDK is "keg-only" and needs to be linked to your system:

```bash
# Add Java to your PATH in your shell configuration file (.zshrc or .bash_profile)
echo 'export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"' >> ~/.zshrc

# Apply changes
source ~/.zshrc
```

Alternatively, you may create a symlink (requires sudo access):

```bash
sudo ln -sfn /opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-17.jdk
```

### 3. Set up Android SDK

Ensure Android Studio is installed. Then set up environment variables:

```bash
# Add Android SDK environment variables to your shell configuration
echo 'export ANDROID_HOME="$HOME/Library/Android/sdk"' >> ~/.zshrc
echo 'export PATH="$ANDROID_HOME/platform-tools:$PATH"' >> ~/.zshrc

# Apply changes
source ~/.zshrc

# Verify by checking the environment variable
echo $ANDROID_HOME  # Should show your Android SDK path
```

### 4. Verify Setup

After setup, you should be able to run Android commands:

```bash
# Verify adb (Android Debug Bridge) is accessible
adb --version

# Run the Android app
npm run android
```

## Installation

1. Clone the repository

   ```bash
   git clone git@github.com:amehmeto/TiedSiren51.git
   cd TiedSiren51
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Generate native projects (Android/iOS)

   ```bash
   npm run prebuild
   ```

   This creates the `android/` and `ios/` folders with all native configuration from `app.config.js`.

4. Set up secrets (using eas)

   Make sure you have `eas-cli` installed. Otherwise, install it:
   ```bash
   npm install -g eas-cli
   ```

   Log in to your Expo account (if not already logged in):
   ```bash
   eas whoami        # Check if already logged in
   eas login         # Log in if needed
   ```

   Then pull secrets from eas:
   ```bash
   eas env:pull --environment development
   ```

   This will create a `.env.local` file with development env variables.

5. Set up Prisma (if using database features)

   The project already has a Prisma schema configured (`schema.prisma`).

   The Prisma Client is automatically generated during `npm install` (via postinstall hook).

   To apply database migrations:
   ```bash
   npx prisma migrate dev
   ```

## Development

Start the development server:

```bash
npm start
```

## Project Structure

This project follows Hexagonal Architecture with the following layers:

```
├── app/                    # UI layer - Expo Router file-based routing
│   ├── (auth)/             # Authentication screens
│   ├── (tabs)/             # Tab-based screens
│   └── _layout.tsx         # Root layout configuration
├── ui/                     # UI layer - Design system and components
│   ├── design-system/      # UI components and styling
│   ├── screens/            # Screen components
│   ├── hooks/              # UI-related hooks
│   └── navigation/         # Navigation utilities
├── core/                   # Business logic layer
│   ├── auth/               # Authentication domain
│   ├── block-session/      # Block session domain
│   ├── blocklist/          # Blocklist domain
│   ├── siren/              # Siren domain
│   ├── _ports_/            # Ports for the hexagonal architecture
│   └── _redux_/            # Redux Toolkit state management
├── infra/                  # Infrastructure layer
│   ├── auth-gateway/       # Authentication services
│   ├── block-session-repository/ # Block session data access
│   ├── blocklist-repository/     # Blocklist data access
│   ├── sirens-repository/        # Sirens data access
│   ├── notification-service/     # Notification infrastructure
│   ├── database-service/         # Database services
│   └── date-provider/            # Date utilities
```

The application follows Hexagonal Architecture principles:
- **UI Layer**: Presentation components in `app/` (Expo Router) and `ui/` (design system and components)
- **Core Layer**: Business logic and domain models, consciously coupled with Redux Toolkit. Dependencies are injected via createStore
- **Infra Layer**: External services and implementations of core ports (repositories, data providers, auth gateway, notification services)

## Git Hooks

The project uses Husky for git hooks:

- Pre-commit: Runs linting and type checking
- Pre-push: Runs tests

## Contributing

1. Create your feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add some amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## License

This project is private and not licensed.
You are not allowed to copy or distribute it without written permission from the copyright holder.
