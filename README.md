# Package Delivery System API Documentation

## Overview
This document explains all APIs available in the complete package delivery system with authentication, user management, parcel tracking, notifications, and OTP verification.

---
## Base API : http://localhost:5000/api
# Authentication API Documentation

## Authentication Strategy
The system uses Passport.js with authentication strategies:
- **Local Strategy:** Email/password authentication with bcrypt password hashing

## Authentication APIs

### 1. User Login
- **Endpoint:** `POST /auth/login`
- **Purpose:** Authenticates user credentials and returns access/refresh tokens
- **Description:** Validates user login using email/password via passport local strategy. Checks if user exists, verifies password
  <pre>
    body
    {
    "email":"example@gmail.com",
    "password":"example"}
  </pre>
  <pre>
    {
    "success": true,
    "data": {
        "accessToken": "1NiIsInR5cCI6IkpXVCJ9.YmFiYUBnbWFpbC5jb20iLCJyb2xlIjoiU0VOREVSIiwiaWF0IjoxNzU1MzQ5ODcwLCJleHAiOjE3NTU0MzYyNzB9.iqgjQUyjsKOds4z-CgHk",
        "refreshToken": "eyJhbGInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVU0VnbWFpbC5jb20iLVSIiwiaWF0IjoxNzU1MzQ5ODcwLCJleHAiOjE3NTc5NDE4NzB9.tnk6QX-gHI7wF6A3Aw-jrU9bYA7S0D4jSZbU",
        "user": {
            "isVerified": false,
            "_id": "688d0c53b3cf",
            "name": "Example",
            "email": "example@gmail.com",
            "userStatus": "ACTIVE",
            "role": "SENDER",
            "auths": [
                {
                    "provider": "credentials",
                    "providerId": "example@gmail.com"
                }
            ],
            "createdAt": "2025-08-01T18:49:22.724Z",
            "updatedAt": "2025-08-06T19:46:24.313Z",
            "userId": "USER-be6002f1"
        }
    },
    "message": "User login successful"}
  </pre>
## ( note : the system will generate a userId automatically for future use )  

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

---

# User Management API Documentation

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

---

# Parcel Management API Documentation

## Parcel Management APIs

### 1. Create Parcel
- **Endpoint:** `POST /parcels/create`
- **Purpose:** Creates a new parcel delivery request
- **Description:** Allows senders to create parcel delivery requests with receiver information, weight, type, and delivery details. Auto-generates tracking ID and calculates fees. **Automatically notifies admins** about new parcel requests
- **Authorization:** SENDER role required
- **Validation:** Requires parcel schema validation
- **Special Feature:** Blocked users cannot create parcels

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
- **Description:** Allows senders to cancel their own parcels or admins to cancel any parcel in cancellable status. **Automatically sends notifications** to sender and admins
- **Authorization:** ADMIN or SENDER roles required
- **Status Restrictions:** Only REQUESTED, FLAG, BLOCKED, APPROVED status can be cancelled

### 6. Flag Parcel
- **Endpoint:** `PATCH /parcels/flagged/:id`
- **Purpose:** Flags a parcel for administrative review
- **Description:** Marks parcel as flagged for issues like suspicious content or delivery problems. **Automatically notifies sender** about flagged status
- **Authorization:** ADMIN or SUPER_ADMIN roles required
- **Status Restrictions:** Can flag REQUESTED, APPROVED, ASSIGNED_TO, DISPATCHED status

### 7. Block Parcel
- **Endpoint:** `PATCH /parcels/blocked/:id`
- **Purpose:** Blocks a parcel from further processing
- **Description:** Prevents parcel from proceeding in delivery pipeline due to policy violations or issues. **Automatically notifies sender** about blocked status
- **Authorization:** ADMIN or SUPER_ADMIN roles required
- **Status Restrictions:** Cannot block DELIVERED, IN_TRANSIT, SEND_OTP, PARCEL_DELIVERY_NOTIFICATION

### 8. Approve Parcel
- **Endpoint:** `PATCH /parcels/approved/:trackingID`
- **Purpose:** Approves parcel and assigns delivery agent
- **Description:** Changes status to approved and **automatically assigns specific delivery agent** to handle the parcel. Creates delivery info with assigned person details. **Automatically notifies sender** about approval
- **Authorization:** ADMIN or SUPER_ADMIN roles required
- **Body:** `{ "deliveryManId": "string" }`
- **Special Feature:** Only REQUESTED or FLAG status can be approved

### 9. Dispatch Parcel
- **Endpoint:** `PATCH /parcels/dispatch/:parcelId`
- **Purpose:** Marks parcel as dispatched from warehouse
- **Description:** Updates status to dispatched and **automatically sends email notification** to receiver with complete dispatch details including delivery person info
- **Authorization:** DELIVERY_AGENT role required
- **Status Requirements:** Must be in ASSIGNED_TO status

### 10. Set In Transit
- **Endpoint:** `PATCH /parcels/in_transit/:id`
- **Purpose:** Updates parcel status to in transit
- **Description:** Marks parcel as currently being transported by delivery agent
- **Authorization:** DELIVERY_AGENT role required
- **Status Requirements:** Must be in DISPATCHED status

### 11. Send OTP
- **Endpoint:** `PATCH /parcels/otp/send/:id`
- **Purpose:** Sends delivery confirmation OTP to receiver
- **Description:** Generates and **automatically sends OTP via email** to receiver for secure parcel delivery confirmation. Creates OTP record with 3-minute expiry
- **Authorization:** DELIVERY_AGENT role required
- **Status Requirements:** Must be in IN_TRANSIT status

### 12. Verify OTP
- **Endpoint:** `PATCH /parcels/otp/verify/:id`
- **Purpose:** Confirms parcel delivery using OTP verification
- **Description:** Validates OTP and marks parcel as delivered. **Smart receiver handling:**
  - **If receiver is registered:** Only the registered receiver can verify OTP
  - **If receiver not registered:** Delivery agent can verify OTP on behalf of receiver
- **Authorization:** DELIVERY_AGENT or RECEIVER roles required
- **Body:** `{ "otp": number }`
- **Status Requirements:** Must be in SEND_OTP status
- **Security Feature:** Invalid OTP attempts are tracked and handled

## Strict Parcel Status Flow
```
REQUESTED → APPROVED → ASSIGNED_TO → DISPATCHED → IN_TRANSIT → SEND_OTP → DELIVERED
     ↓           ↓           ↓            ↓
   FLAG      CANCELLED   CANCELLED    CANCELLED
     ↓
  BLOCKED
```

## Additional Status Options
- **CANCELLED** → Parcel cancelled by sender or admin (with notifications)
- **FLAGGED** → Marked for administrative review (with sender notification)
- **BLOCKED** → Prevented from processing (with sender notification)
- **RETURNED** → Returned to sender
- **FAILED** → Delivery failed

## Advanced Parcel Features
- **Auto Tracking ID:** Unique MD5-based tracking identifiers with TRK prefix
- **Dynamic Fee Calculation:** Automatic fee calculation based on weight and parcel type
- **Complete Status History:** Full tracking event log with timestamps and location notes
- **Smart Email Notifications:** Automated emails for dispatch with delivery person details
- **Advanced OTP Security:** 
  - 3-minute OTP expiry
  - Invalid attempt tracking
  - Role-based OTP verification (registered vs unregistered receivers)
- **Intelligent Receiver Handling:**
  - **Registered Receiver:** Full receiver privileges with OTP verification
  - **Unregistered Receiver:** Delivery agent handles OTP verification
- **Comprehensive Notification System:**
  - Admin notifications for new requests and cancellations
  - Sender notifications for approvals, flags, blocks, and cancellations
  - Receiver notifications for dispatch and delivery updates
- **Terminal Status Protection:** Prevents modification of delivered/cancelled parcels
- **Role-based Parcel Access:** Different views and permissions for each user role
- **Status Validation:** Strict status flow enforcement with proper error handling
- **Real-time Tracking:** Complete parcel journey from creation to delivery with location updates

## Notification Types
- **NEW_PARCEL_REQUEST** → Notifies admins of new parcel requests
- **PARCEL_APPROVED** → Notifies sender when parcel is approved
- **PARCEL_CANCELLED** → Notifies relevant parties when parcel is cancelled
- **PARCEL_FLAGGED** → Notifies sender when parcel is flagged
- **PARCEL_BLOCKED** → Notifies sender when parcel is blocked

## Special Business Rules
1. **User Status Check:** Blocked users cannot create parcels
2. **Receiver Registration Check:** System automatically detects if receiver email is registered
3. **Single Admin Restriction:** Only one ADMIN user allowed in the system
4. **Delivery Assignment:** Parcels must be approved before assignment to delivery agents
5. **OTP Expiry Management:** OTPs expire after 3 minutes for security
6. **Terminal Status Protection:** Delivered, cancelled, returned, and failed parcels cannot be modified
