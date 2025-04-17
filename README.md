# TiedSiren51 - Expo Mobile App

A React Native mobile application built with Expo, featuring authentication, block sessions management, and more.

## Prerequisites

- Node.js (v18 or newer recommended)
- Yarn package manager
- Expo CLI (`yarn global add expo-cli`)
- iOS Simulator (for Mac users) or Android Studio (for Android development)


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
   git clone <repository-url>
   cd tiedsiren51
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

### Platform-Specific Development

```bash
# iOS
yarn ios

# Android
yarn android

# Web
yarn web

# Electron
yarn electron:dev
```

## Testing

The project uses Vitest for testing. Available test commands:

```bash
# Run tests in watch mode
yarn test

# Run tests once (pre-push)
yarn test:prepush

# Run tests with coverage
yarn test:cov

# Run E2E tests with Maestro
yarn test:e2e
```

## Code Quality

```bash
# Type checking
yarn typecheck

# Lint code
yarn lint

# Fix linting issues
yarn lint:fix
```

## Building for Production

```bash
# Prebuild for all platforms
yarn prebuild

# Build for all platforms
yarn build

# Build for Android
yarn build:android
yarn build:android:local  # Local build
yarn build:android:apk    # Generate APK

# Build for iOS
yarn build:ios
yarn build:ios:simulator  # Build for iOS simulator
```

## Project Structure

```
├── app/                    # Main application code
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Tab-based screens
│   └── _layout.tsx        # Root layout configuration
├── assets/                # Static assets
├── prisma/                # Prisma schema and migrations
├── tests/                 # Test files
├── ui/                    # UI components
└── core/                  # Core business logic
```

## Key Dependencies

- **Frontend**:

  - `expo`: ^51.0.36
  - `react`: 18.2.0
  - `react-native`: 0.74.5
  - `react-native-elements`: ^3.4.3
  - `expo-router`: ~3.5.23

- **State Management**:

  - `@reduxjs/toolkit`: ^2.2.5
  - `react-redux`: ^9.1.2

- **Forms & Validation**:

  - `formik`: ^2.4.5
  - `zod`: ^3.23.8

- **Database**:

  - `pouchdb`: ^8.0.1
  - `@prisma/client`

- **Testing**:
  - `vitest`: ^1.6.0
  - `react-test-renderer`: 18.2.0

## Available Scripts

See the full list of available scripts in `package.json`. Key scripts include:

- `yarn start`: Start the Expo development server
- `yarn test`: Run tests
- `yarn lint`: Run linting checks
- `yarn build`: Build for all platforms

## Git Hooks

The project uses Husky for git hooks:

- Pre-commit: Runs linting and type checking
- Pre-push: Runs tests

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
