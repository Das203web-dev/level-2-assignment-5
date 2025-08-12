# Authentication API Documentation

## Overview
This document explains the authentication APIs available in the system.

## Authentication Strategy
The system uses Passport.js with multiple authentication strategies:
- **Local Strategy:** Email/password authentication with bcrypt password hashing
- **Google OAuth:** Social authentication (preparation for Google login integration)

## Authentication APIs

### 1. User Login
- **Endpoint:** `POST /auth/login`
- **Purpose:** Authenticates user credentials and returns access/refresh tokens
- **Description:** Validates user login using email/password via passport local strategy. Checks if user exists, verifies password, and handles Google-authenticated users differently

### 2. User Logout
- **Endpoint:** `POST /auth/logout`
- **Purpose:** Logs out the user by clearing authentication cookies
- **Description:** Removes accessToken and refreshToken cookies from the client browser

### 3. Refresh Token
- **Endpoint:** `POST /auth/refresh-token`
- **Purpose:** Generates a new access token using the refresh token
- **Description:** Creates a new access token when the current one expires, using the stored refresh token

### 4. Reset Password
- **Endpoint:** `POST /auth/reset-password`
- **Purpose:** Allows authenticated users to change their password
- **Description:** Updates user password by verifying the old password and replacing it with a new hashed password
- **Authorization:** Requires user authentication (all roles)

## Authentication Features
- **Password Security:** Uses bcrypt for password hashing and comparison
- **Session Management:** Passport session serialization/deserialization for user persistence
- **Multi-Provider Support:** Handles both email/password and Google OAuth authentication methods
