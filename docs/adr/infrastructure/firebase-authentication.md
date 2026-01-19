# Firebase Authentication

Date: 2025-11-23

## Status

Accepted

## Context

TiedSiren51 requires user authentication to:
- Sync user data across devices
- Manage user-specific blocklists and sessions
- Provide personalized app experiences
- Enable social login (Google, Apple)

Authentication requirements:
- **Email/password authentication**
- **Google Sign-In** for Android
- **Apple Sign-In** for iOS (planned)
- **Persistent sessions** across app restarts
- **Auth state management** integrated with Redux
- **Error handling** with user-friendly messages
- **Cross-platform** support (Android, iOS, Web)

Constraints:
- Must work with React Native
- Need secure token persistence
- Support multiple auth providers
- Handle network errors gracefully
- Integrate with existing hexagonal architecture

## Decision

Use **Firebase Authentication** as the authentication provider, implemented through an `AuthGateway` port adapter.

### Implementation

**1. Port Definition** (`core/_ports_/auth.gateway.ts`):

```typescript
export interface AuthGateway {
  signInWithEmail(email: string, password: string): Promise<AuthUser>
  signUpWithEmail(email: string, password: string): Promise<AuthUser>
  signInWithGoogle(): Promise<AuthUser>
  signInWithApple(): Promise<AuthUser>
  onUserLoggedIn(listener: (user: AuthUser) => void): void
  onUserLoggedOut(listener: () => void): void
  logOut(): Promise<void>
}
```

**2. Firebase Adapter** (`infra/auth-gateway/firebase.auth.gateway.ts`):

```typescript
export class FirebaseAuthGateway implements AuthGateway {
  private readonly auth: Auth

  constructor() {
    const app = initializeApp(firebaseConfig)
    this.auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    })
    this.setupAuthStateListener()
    this.configureGoogleSignIn()
  }

  async signInWithEmail(email: string, password: string): Promise<AuthUser> {
    const result = await signInWithEmailAndPassword(this.auth, email, password)
    return { id: result.user.uid, email: result.user.email ?? '' }
  }

  async signInWithGoogle(): Promise<AuthUser> {
    const userInfo = await GoogleSignin.signIn()
    const credential = GoogleAuthProvider.credential(userInfo.idToken)
    const result = await signInWithCredential(this.auth, credential)
    return {
      id: result.user.uid,
      email: result.user.email ?? '',
      username: result.user.displayName ?? undefined,
      profilePicture: result.user.photoURL ?? undefined,
    }
  }

  onUserLoggedIn(listener: (user: AuthUser) => void): void {
    this.onUserLoggedInListener = listener
  }

  async logOut(): Promise<void> {
    if (await GoogleSignin.isSignedIn()) await GoogleSignin.signOut()
    await signOut(this.auth)
  }
}
```

**3. Error Handling**:

Custom error mapping for user-friendly messages:

```typescript
private static readonly FIREBASE_ERRORS: Record<FirebaseAuthErrorCode, string> = {
  'auth/email-already-in-use': 'This email is already in use.',
  'auth/invalid-email': 'Invalid email address.',
  'auth/weak-password': 'Password must be at least 6 characters.',
  'auth/invalid-credential': 'Invalid email or password.',
}
```

**4. Auth State Synchronization**:

Firebase auth state changes automatically trigger Redux updates:

```typescript
private setupAuthStateListener(): void {
  onAuthStateChanged(this.auth, (user: User | null) => {
    if (user && this.onUserLoggedInListener) {
      this.onUserLoggedInListener({ id: user.uid, email: user.email ?? '' })
    }
    if (!user && this.onUserLoggedOutListener) {
      this.onUserLoggedOutListener()
    }
  })
}
```

**5. Google Sign-In Integration**:

Uses `@react-native-google-signin/google-signin`:

```typescript
private configureGoogleSignIn(): void {
  GoogleSignin.configure({
    webClientId: this.firebaseConfig.webClientId,
  })
}
```

**6. Session Persistence**:

Firebase Auth persists sessions using AsyncStorage:

```typescript
initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
})
```

## Consequences

### Positive

- **Managed service**: Google handles security, scaling, infrastructure
- **Multiple providers**: Email/password, Google, Apple (future) in one service
- **Secure tokens**: Firebase handles JWT creation, validation, refresh
- **Session management**: Automatic token refresh and persistence
- **Cross-platform**: Works on Android, iOS, Web
- **Free tier**: Generous limits for early-stage apps
- **Error handling**: Well-defined error codes for user-friendly messages
- **Auth state**: Real-time auth state changes via listeners
- **SDK maturity**: Battle-tested, well-documented
- **Integration**: Works seamlessly with React Native
- **Google Sign-In**: Native Google authentication flow
- **Port abstraction**: Core domain isolated from Firebase specifics

### Negative

- **Vendor lock-in**: Tightly coupled to Firebase ecosystem
- **Bundle size**: Firebase SDK adds ~200KB to bundle
- **Network dependency**: Requires internet for authentication
- **Limited customization**: Constrained by Firebase features
- **Cost at scale**: Pricing increases with user base
- **Email verification**: Requires additional setup for verification flows
- **Password reset**: Handled via Firebase-hosted UI or custom implementation
- **Third-party risk**: Dependent on Firebase service availability

### Neutral

- **Configuration overhead**: Requires Firebase project setup
- **Platform-specific config**: Different setup for Android/iOS (google-services.json, GoogleService-Info.plist)
- **Error translation**: Must map Firebase errors to user-friendly messages

## Alternatives Considered

### 1. Auth0

Third-party authentication-as-a-service.

**Rejected because**:
- Additional cost (no free tier)
- More complex SDK
- Overkill for current needs
- Adds another external dependency

### 2. AWS Cognito

Amazon's authentication service.

**Rejected because**:
- More complex setup than Firebase
- Less mature React Native SDK
- Higher learning curve
- No existing AWS infrastructure

### 3. Custom JWT Authentication

Build custom auth with Node.js backend + JWT tokens.

**Rejected because**:
- Requires building and maintaining backend
- Security burden (password hashing, token management)
- Need to implement OAuth flows manually
- More development time
- Hosting costs for backend

### 4. Supabase Auth

Open-source Firebase alternative.

**Rejected because**:
- Less mature than Firebase
- Smaller community and ecosystem
- Would require self-hosting or paid plan
- Less documentation for React Native

### 5. Clerk

Modern authentication service with good DX.

**Rejected because**:
- Paid service (no free tier)
- Newer, less proven at scale
- Overkill for current requirements

## Implementation Notes

### Configuration Files

- `infra/auth-gateway/firebaseConfig.ts` - Firebase project credentials
- `google-services.json` (Android) - Google Services config
- `GoogleService-Info.plist` (iOS) - Google Services config

### Environment Variables

Firebase config uses environment variables for security:

```typescript
export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  webClientId: process.env.EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID,
  // ...
}
```

### Dependencies

- `firebase/app` - Firebase core
- `firebase/auth` - Firebase Authentication
- `@react-native-async-storage/async-storage` - Session persistence
- `@react-native-google-signin/google-signin` - Google Sign-In

### Future Enhancements

1. **Apple Sign-In**: Currently throws "not implemented" error
2. **Email verification**: Send verification emails on signup
3. **Password reset**: Implement forgot password flow
4. **Phone authentication**: SMS-based auth
5. **Multi-factor authentication**: 2FA support

## Related ADRs

- [Hexagonal Architecture](../hexagonal-architecture.md) - Port/adapter pattern
- [Dependency Injection Pattern](../core/dependency-injection-pattern.md)

## References

- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [React Native Firebase](https://rnfirebase.io/)
- [Google Sign-In for React Native](https://github.com/react-native-google-signin/google-signin)
- Implementation: `infra/auth-gateway/firebase.auth.gateway.ts`
