**⚠️ Warning: This README has been generated by AI and might not be entirely accurate. ⚠️**

**Use with caution. Feel free to correct and update.**

# TiedSiren51 - Expo Mobile App

## Code Coverage

This project tracks code coverage to maintain quality. Use these commands:

- `yarn test:cov` - Run tests with coverage report
- `yarn test:cov:track` - Run tests and track coverage history locally
- `yarn test:cov:history` - View coverage history

**Current Coverage: 98.83%** 📊

### Automated PR Coverage

Every pull request automatically gets a coverage comparison comment showing:
- Coverage changes compared to the base branch
- Visual indicators (📈/📉) for improvements/regressions
- Detailed breakdown by metric (statements, functions, branches, lines)

The GitHub Action runs on every PR and updates the comment automatically.

A React Native mobile application built with Expo, featuring authentication, block sessions management, and more.

## Prerequisites

- Node.js (v18 or newer recommended)
- Yarn package manager
- Expo CLI (`yarn global add expo-cli`)
- iOS Simulator (for Mac users) and / or Android Studio (for Android development)


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
yarn android
```

## Installation

1. Clone the repository

   ```bash
   git clone git@github.com:amehmeto/TiedSiren51.git
   cd TiedSiren51
   ```

2. Install dependencies

   ```bash
   yarn install
   ```

3. Set up Prisma (if using database features)

   Run Expo prebuild:

   ```bash
   yarn prebuild
   ```

   After initializing Prisma:

   - Generate Prisma Client:
     ```bash
     npx prisma generate
     ```
   - Run migrations:
     ```bash
     npx prisma migrate dev
     ```

## Development

Start the development server:

```bash
yarn start
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
│   ├── ports/              # Ports for the hexagonal architecture
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