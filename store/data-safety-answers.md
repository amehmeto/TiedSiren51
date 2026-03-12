# Google Play Data Safety Questionnaire Answers

## Overview

This document provides answers for the Google Play Console Data Safety section.

---

## Does your app collect or share any of the required user data types?

**Yes**

---

## Data Types Collected

### 1. Email Address

- **Collected:** Yes
- **Shared with third parties:** No
- **Purpose:** Account management (authentication, password reset)
- **Required or optional:** Required (for account creation)
- **Ephemeral:** No (persisted for account lifecycle)
- **Encryption in transit:** Yes (HTTPS/TLS)
- **User can request deletion:** Yes (in-app account deletion)

### 2. User IDs

- **Collected:** Yes (Firebase UID)
- **Shared with third parties:** No
- **Purpose:** Account management, data sync across devices
- **Required or optional:** Required (auto-generated)
- **Ephemeral:** No
- **Encryption in transit:** Yes (HTTPS/TLS)
- **User can request deletion:** Yes (in-app account deletion)

### 3. Crash Logs / Diagnostics

- **Collected:** Yes (via Sentry)
- **Shared with third parties:** Yes (Sentry — as a data processor, not for their own purposes)
- **Purpose:** App stability and bug fixing (Analytics)
- **Required or optional:** Required (automatic for non-debug builds)
- **Ephemeral:** No (retained 90 days)
- **Encryption in transit:** Yes (HTTPS/TLS)
- **User can request deletion:** N/A (anonymized)

### 4. Device or Other IDs

- **Collected:** Yes (device name for sync)
- **Shared with third parties:** No
- **Purpose:** App functionality (multi-device sync)
- **Required or optional:** Optional
- **Ephemeral:** No
- **Encryption in transit:** Yes (HTTPS/TLS)
- **User can request deletion:** Yes (in-app account deletion)

---

## Data Types NOT Collected

- Location (fine or coarse)
- Phone number
- Contacts
- SMS / Call logs
- Photos / Videos
- Files / Documents
- Calendar events
- Browsing history (Accessibility Service data is processed in real-time and never stored)
- Search history
- Financial / Payment information
- Health and fitness data
- App interactions (beyond crash diagnostics)
- Installed apps list (queried locally, never transmitted)

---

## Data Sharing

**No data is shared with third parties for advertising, marketing, or profiling purposes.**

Sentry receives anonymized crash diagnostics as a data processor under our instructions. No user-identifiable information (email, UID, app data) is sent to Sentry.

---

## Data Handling Practices

### Encryption

- **In transit:** All network communication uses HTTPS/TLS
- **At rest:** Local SQLite database on device. Firebase handles server-side encryption for authentication data.

### Deletion Mechanism

Users can delete their account and all associated data from: **Settings > Delete Account**

This permanently deletes:
- Firebase Authentication record (email, UID)
- All locally stored app data (sirens, blocklists, sessions)
- All synced data across devices

### Data Retention

| Data Type | Retention Period |
|-----------|-----------------|
| Email, UID | Until account deletion |
| App data (sirens, blocklists, sessions) | Until app uninstall or account deletion |
| Crash diagnostics | 90 days (Sentry) |

---

## Security Practices

- Firebase Authentication with email/password and OAuth (Google, Apple)
- No plaintext password storage
- HTTPS/TLS for all API communication
- Local data stored in SQLite (on-device only)

---

## Accessibility Service Declaration

The app uses AccessibilityService. In the Data Safety section, note:
- The Accessibility Service processes window titles in real-time
- **No browsing history, app usage history, or personal content is collected, stored, or transmitted**
- Data from the Accessibility Service is never logged or persisted
