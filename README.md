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

# User Management API Documentation

## Overview
This document explains the user management APIs available in the system for CRUD operations and user administration.

## User Management APIs

### 1. Register User
- **Endpoint:** `POST /users/register`
- **Purpose:** Creates a new user account
- **Description:** Registers a new user with name, email, and password. Automatically generates unique userId and hashes password with bcrypt
- **Authorization:** Public endpoint
- **Validation:** Requires name, email, password validation via Zod schema

### 2. Get All Users
- **Endpoint:** `GET /users/all`
- **Purpose:** Retrieves list of all users in the system
- **Description:** Returns all users without password field, accessible only to administrators
- **Authorization:** ADMIN or SUPER_ADMIN roles required

### 3. Update User Profile
- **Endpoint:** `PATCH /users/update`
- **Purpose:** Updates current user's profile information
- **Description:** Allows users to update their name, address, and phone. Restricted fields like email, role, and userStatus cannot be modified
- **Authorization:** All authenticated users (ADMIN, DELIVERY_AGENT, RECEIVER, SENDER)

### 4. Update User Role
- **Endpoint:** `PATCH /users/update/role/:id`
- **Purpose:** Updates user role and permissions
- **Description:** Allows SUPER_ADMIN to change user roles. Prevents multiple ADMIN users and restricts field modifications
- **Authorization:** SUPER_ADMIN role required

### 5. Delete User
- **Endpoint:** `DELETE /users/delete/:id`
- **Purpose:** Permanently removes user from the system
- **Description:** Deletes user account with role-based restrictions. SUPER_ADMIN can delete any user except other SUPER_ADMINs
- **Authorization:** SUPER_ADMIN or ADMIN roles required

### 6. Block User
- **Endpoint:** `POST /users/block/:userId`
- **Purpose:** Blocks user account to prevent access
- **Description:** Sets user status to BLOCKED, preventing them from accessing the system
- **Authorization:** ADMIN or SUPER_ADMIN roles required

### 7. Unblock User
- **Endpoint:** `POST /users/unblock/:userId`
- **Purpose:** Unblocks previously blocked user account
- **Description:** Changes user status from BLOCKED to ACTIVE, restoring system access
- **Authorization:** ADMIN or SUPER_ADMIN roles required

## User Features
- **Password Security:** Bcrypt hashing with configurable salt rounds
- **Unique User IDs:** Auto-generated MD5-based unique identifiers
- **Role-Based Access:** Multiple user roles (SENDER, RECEIVER, DELIVERY_AGENT, ADMIN, SUPER_ADMIN)
- **User Status Management:** Active/Blocked status tracking
- **Data Validation:** Zod schema validation for user input
- **Multi-Auth Support:** Supports credential and OAuth authentication providers

## User Roles
- **SENDER:** Can send packages
- **RECEIVER:** Can receive packages  
- **DELIVERY_AGENT:** Can handle deliveries
- **ADMIN:** Administrative privileges with user management
- **SUPER_ADMIN:** Full system access with role management
# Parcel Management API Documentation

## Overview
This document explains the parcel management APIs for package delivery system with complete tracking and status management.

## Parcel Management APIs

### 1. Create Parcel
- **Endpoint:** `POST /parcels/create`
- **Purpose:** Creates a new parcel delivery request
- **Description:** Allows senders to create parcel delivery requests with receiver information, weight, type, and delivery details. Auto-generates tracking ID and calculates fees
- **Authorization:** SENDER role required
- **Validation:** Requires parcel schema validation

### 2. Get All Parcels
- **Endpoint:** `GET /parcels/all-parcel`
- **Purpose:** Retrieves parcels based on user role and optional status filter
- **Description:** Returns parcels filtered by user role - admins see all, senders see their sent parcels, receivers see incoming parcels
- **Authorization:** ADMIN, SENDER, RECEIVER, SUPER_ADMIN roles
- **Query Parameters:** `filter` (optional) - Filter by parcel status

### 3. Get Incoming Parcels
- **Endpoint:** `GET /parcels/incoming`
- **Purpose:** Shows all parcels coming to the receiver
- **Description:** Returns parcels addressed to the authenticated receiver that are not yet delivered or cancelled
- **Authorization:** RECEIVER role required

### 4. Get Parcel History
- **Endpoint:** `GET /parcels/history`
- **Purpose:** Shows delivered parcel history for receiver
- **Description:** Returns all successfully delivered parcels for the authenticated receiver
- **Authorization:** RECEIVER role required

### 5. Cancel Parcel
- **Endpoint:** `PATCH /parcels/cancel/:id`
- **Purpose:** Cancels a parcel request or delivery
- **Description:** Allows senders to cancel their own parcels or admins to cancel any parcel in cancellable status
- **Authorization:** ADMIN or SENDER roles required

### 6. Flag Parcel
- **Endpoint:** `PATCH /parcels/flagged/:id`
- **Purpose:** Flags a parcel for administrative review
- **Description:** Marks parcel as flagged for issues like suspicious content or delivery problems
- **Authorization:** ADMIN or SUPER_ADMIN roles required

### 7. Block Parcel
- **Endpoint:** `PATCH /parcels/blocked/:id`
- **Purpose:** Blocks a parcel from further processing
- **Description:** Prevents parcel from proceeding in delivery pipeline due to policy violations or issues
- **Authorization:** ADMIN or SUPER_ADMIN roles required

### 8. Approve Parcel
- **Endpoint:** `PATCH /parcels/approved/:trackingID`
- **Purpose:** Approves parcel and assigns delivery agent
- **Description:** Changes status to approved and assigns specific delivery agent to handle the parcel
- **Authorization:** ADMIN or SUPER_ADMIN roles required
- **Body:** `{ "deliveryManId": "string" }`

### 9. Dispatch Parcel
- **Endpoint:** `PATCH /parcels/dispatch/:parcelId`
- **Purpose:** Marks parcel as dispatched from warehouse
- **Description:** Updates status to dispatched and sends email notification to receiver with dispatch details
- **Authorization:** DELIVERY_AGENT role required

### 10. Set In Transit
- **Endpoint:** `PATCH /parcels/in_transit/:id`
- **Purpose:** Updates parcel status to in transit
- **Description:** Marks parcel as currently being transported by delivery agent
- **Authorization:** DELIVERY_AGENT role required

### 11. Send OTP
- **Endpoint:** `PATCH /parcels/otp/send/:id`
- **Purpose:** Sends delivery confirmation OTP to receiver
- **Description:** Generates and sends OTP to receiver's email for secure parcel delivery confirmation
- **Authorization:** DELIVERY_AGENT role required

### 12. Verify OTP
- **Endpoint:** `PATCH /parcels/otp/verify/:id`
- **Purpose:** Confirms parcel delivery using OTP verification
- **Description:** Validates OTP and marks parcel as delivered. Can be done by receiver or delivery agent
- **Authorization:** DELIVERY_AGENT or RECEIVER roles required
- **Body:** `{ "otp": number }`

## Parcel Status Flow
1. **REQUESTED** → Initial parcel creation
2. **APPROVED** → Admin approval with delivery agent assignment
3. **ASSIGNED_TO** → Delivery agent assigned
4. **DISPATCHED** → Parcel sent from warehouse
5. **IN_TRANSIT** → Being transported
6. **SEND_OTP** → OTP sent for delivery confirmation
7. **DELIVERED** → Successfully delivered and confirmed

## Additional Status Options
- **CANCELLED** → Parcel cancelled by sender or admin
- **FLAGGED** → Marked for administrative review
- **BLOCKED** → Prevented from processing
- **RETURNED** → Returned to sender
- **FAILED** → Delivery failed

## Parcel Features
- **Auto Tracking ID:** Unique MD5-based tracking identifiers
- **Fee Calculation:** Automatic fee calculation based on weight and parcel type
- **Status History:** Complete tracking event log with timestamps
- **Email Notifications:** Automated emails for dispatch and status updates
- **OTP Security:** Secure delivery confirmation with OTP verification
- **Role-based Access:** Different permissions for senders, receivers, agents, and admins
- **Real-time Tracking:** Complete parcel journey tracking from creation to delivery
