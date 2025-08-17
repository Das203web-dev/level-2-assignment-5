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
## ( note : the system will generate a userId automatically for future use and status is 200 for this response)  

### 2. User Logout
- **Endpoint:** `POST /auth/logout`
- **Purpose:** Logs out the user by clearing authentication cookies
- **Description:** Removes accessToken and refreshToken cookies from the client browser
- <pre>
  response 
  {
    "success": true,
    "data": null,
    "message": "User logout successfully"}
</pre>

## ( note : The status is 200 )

### 3. Refresh Token
- **Endpoint:** `POST /auth/refresh-token`
- **Purpose:** Generates a new access token using the refresh token
- **Description:** Creates a new access token when the current one expires, using the stored refresh token
  <pre>
    response 
    {
    "success": true,
    "data": {
        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVU0VSLWJlNjAwOGI2MDJmMSIsImVtYWlsIjoiYmFiYUBnbWFpbC5jb20iLCJyb2xlIjoiU0VOREVSIiwiaWF0IjoxNzU1MzczMjA4LCJleHAiOjE3NTU0NTk2MDh9.804whH7k6-SUoTEqatKnG3zKBO-GhW8NltBL5f2OMoY"
    },
    "message": "Access token updated"}
  </pre>
## ( note : status is 200 )

### 4. Reset Password
- **Endpoint:** `POST /auth/reset-password`
- **Purpose:** Allows authenticated users to change their password
- **Description:** Updates user password by verifying the old password and replacing it with a new hashed password
- **Authorization:** Requires user authentication (all roles)
  <pre>
    body
    {
    "oldPassword":"example",
    "newPassword":"newExample"}
  </pre>
  <pre>
    {
    "success": true,
    "data": true,
    "message": "Password reset successfully"}
  </pre>
  
## ( note : status is 200 )

## Authentication Features
- **Password Security:** Uses bcrypt for password hashing and comparison
- **Session Management:** Passport session serialization/deserialization for user persistence
- **Multi-Provider Support:** Handles email/password authentication methods

---

# User Management API Documentation

## User Management APIs

### 1. Register User
- **Endpoint:** `POST /users/register`
- **Purpose:** Creates a new user account
- **Description:** Registers a new user with name, email, and password. Automatically generates unique userId and hashes password with bcrypt and another thing user has to select their role also while registering ( e.g : As a RECEIVER,SENDER,DELIVERY_AGENT )
- **Authorization:** Public endpoint
- **Validation:** Requires name, email, password validation via Zod schema
  <pre>
    body
    {
    "name":"example",
    "email" :"example@gmail.com",
    "password":"example",
    "role":"RECEIVER"}
  <pre>
    response
    {
    "success": true,
    "data": {
        "name": "example",
        "email": "example@gmail.com",
        "userStatus": "ACTIVE",
        "isVerified": false,
        "role": "RECEIVER",
        "auths": [
            {
                "provider": "credentials",
                "providerId": "example@gmail.com"
            }
        ],
        "createdAt": "2025-08-16T19:48:51.334Z",
        "updatedAt": "2025-08-16T19:48:51.334Z",
        "userId": "USER-bd1817582540"
    },
    "message": "User created successfully"}
  </pre>
  <pre>
    Error body
    {
    "status": false,
    "message": "Email is already exist",
    "errorSource": [],
    "err": "Email is already exist",
    "stack": "Error: Email is already exist\n    at F:\\LEVEL-2-DEV-COURSE\\level 2 assignment 5\\src\\app\\modules\\user\\user.service.ts:20:15\n    at Generator.next (<anonymous>)\n    at fulfilled (F:\\LEVEL-2-DEV-COURSE\\level 2 assignment 5\\src\\app\\modules\\user\\user.service.ts:5:58)\n    at processTicksAndRejections (node:internal/process/task_queues:105:5)"}
  </pre>
  <pre>
    zod error body 
    {
    "status": false,
    "message": "Zod error",
    "errorSource": [
        {
            "path": "role",
            "message": "Role is required"
        }
    ],
    "err": "[\n  {\n    \"expected\": \"string\",\n    \"code\": \"invalid_type\",\n    \"path\": [\n      \"role\"\n    ],\n    \"message\": \"Role is required\"\n  }\n]"
  </pre>

  ## ( note : status is 200 and the response is coming without the password field for better security )

### 2. Get All Users
- **Endpoint:** `GET /user/all`
- **Purpose:** Retrieves list of all users in the system
- **Description:** Returns all users without password field, accessible only to administrators
- **Authorization:** ADMIN or SUPER_ADMIN roles required
  <pre>
    {
    "success": true,
    "data": [
        {
            "isVerified": false,
            "_id": "6892bd946f9b03a9e6fbc64d",
            "name": "Bhoot",
            "email": "bhoot@gmail.com",
            "userStatus": "ACTIVE",
            "role": "SENDER",
            "auths": [
                {
                    "provider": "credentials",
                    "providerId": "bhoot@gmail.com"
                }
            ],
            "createdAt": "2025-08-06T02:27:32.879Z",
            "updatedAt": "2025-08-06T02:27:32.879Z",
            "userId": "USER-55df2174e599"
        },
        {
            "_id": "68a0e0a3467c6c090bc058be",
            "name": "Example",
            "email": "example@gmail.com",
            "userStatus": "ACTIVE",
            "isVerified": false,
            "role": "ADMIN",
            "auths": [
                {
                    "provider": "credentials",
                    "providerId": "shuvajitdas@gmail.com"
                }
            ],
            "createdAt": "2025-08-16T19:48:51.334Z",
            "updatedAt": "2025-08-16T19:48:51.334Z",
            "userId": "USER-bd1817582540"
        }
    ],
    "message": "All user retrieved successfully"}
  </pre>
  <pre>
    error body if anyone wants to access without permission from the administrative
    {
    "status": false,
    "message": "Permission not granted",
    "errorSource": [],
    "err": "Permission not granted",
    "stack": "Error: Permission not granted\n    at F:\\LEVEL-2-DEV-COURSE\\level 2 assignment 5\\src\\app\\middlewares\\checkUser.ts:23:19\n    at Generator.next (<anonymous>)\n    at fulfilled (F:\\LEVEL-2-DEV-COURSE\\level 2 assignment 5\\src\\app\\middlewares\\checkUser.ts:5:58)\n    at processTicksAndRejections (node:internal/process/task_queues:105:5)"}
  </pre>
  
## ( note : This is for admin role access EMAIL : example@gmail.com , PASSWORD : example )

### 3. Update User Profile
- **Endpoint:** `PATCH /user/update`
- **Purpose:** Updates current user's profile information
- **Description:** Allows users to update their name, address, and phone. Restricted fields like email, role, and userStatus cannot be modified
- **Authorization:** All authenticated users (ADMIN, DELIVERY_AGENT, RECEIVER, SENDER)
  <pre>
    body
    {
    "name":"Example"}
  </pre>
  <pre>
    {
    "success": true,
    "data": {
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
        "updatedAt": "2025-08-16T22:44:59.133Z",
        "userId": "USER-be6008b602f1",
        "isVerified": false
    },
    "message": "User updated successfully"}
  </pre>

### 4. Update User Role
- **Endpoint:** `PATCH /user/update/role/:id`
- **Purpose:** Updates user role and permissions
- **Description:** Allows SUPER_ADMIN to change user roles. Prevents multiple ADMIN users and restricts field modifications
- **Authorization:** SUPER_ADMIN role required
  <pre>
    {
    "status": false,
    "message": "Permission not granted",
    "errorSource": [],
    "err": "Permission not granted",
    "stack": "Error: Permission not granted\n    at F:\\LEVEL-2-DEV-COURSE\\level 2 assignment 5\\src\\app\\middlewares\\checkUser.ts:23:19\n    at Generator.next (<anonymous>)\n    at fulfilled (F:\\LEVEL-2-DEV-COURSE\\level 2 assignment 5\\src\\app\\middlewares\\checkUser.ts:5:58)\n    at processTicksAndRejections (node:internal/process/task_queues:105:5)"}
  </pre>
  <pre>
    if ADMIN is already exist then this error 
    {
    "status": false,
    "message": "There is already a ADMIn",
    "errorSource": [],
    "err": "There is already a ADMIn",
    "stack": "Error: There is already a ADMIn\n    at F:\\LEVEL-2-DEV-COURSE\\level 2 assignment 5\\src\\app\\modules\\user\\user.service.ts:77:19\n    at Generator.next (<anonymous>)\n    at fulfilled (F:\\LEVEL-2-DEV-COURSE\\level 2 assignment 5\\src\\app\\modules\\user\\user.service.ts:5:58)\n    at processTicksAndRejections (node:internal/process/task_queues:105:5)"}
  </pre>
<pre>
  response 
  {
    "success": true,
    "data": {
        "isVerified": false,
        "name": "Maa",
        "email": "ma@gmail.com",
        "userStatus": "ACTIVE",
        "role": "ADMIN",
        "auths": [
            {
                "provider": "credentials",
                "providerId": "ma@gmail.com"
            }
        ],
        "createdAt": "2025-08-01T18:24:58.529Z",
        "updatedAt": "2025-08-16T23:07:27.287Z",
        "userId": "USER-eaa69f5f2dff"
    },
    "message": "User updated successfully"}
</pre>
### 5. Delete User
- **Endpoint:** `DELETE /user/delete/:id`
- **Purpose:** Permanently removes user from the system
- **Description:** Deletes user account with role-based restrictions. SUPER_ADMIN can delete any user except other SUPER_ADMINs and ADMIN also can delete other users except SUPER_ADMIN
- **Authorization:** SUPER_ADMIN or ADMIN roles required
  <Pre>
    response 
    {
    "success": true,
    "data": null,
    "message": "User deleted successfully"}
  </Pre>
  <pre>
    If ADMIN try to delete SUPER_ADMIN then error body is
    {
    "status": false,
    "message": "You are not permitted to delete a SUPER_ADMIN",
    "errorSource": [],
    "err": "You are not permitted to delete a SUPER_ADMIN",
    "stack": "Error: You are not permitted to delete a SUPER_ADMIN\n    at F:\\LEVEL-2-DEV-COURSE\\level 2 assignment 5\\src\\app\\modules\\user\\user.service.ts:92:19\n    at Generator.next (<anonymous>)\n    at fulfilled (F:\\LEVEL-2-DEV-COURSE\\level 2 assignment 5\\src\\app\\modules\\user\\user.service.ts:5:58)\n    at processTicksAndRejections (node:internal/process/task_queues:105:5)"}
  </pre>

### 6. Block User
- **Endpoint:** `POST /user/block/:userId`
- **Purpose:** Blocks user account to prevent access
- **Description:** Sets user status to BLOCKED, preventing them from accessing the system
- **Authorization:** ADMIN or SUPER_ADMIN roles required
  <pre>
    if the user Role is not ADMIN or SUPER_ADMIN
    {
    "status": false,
    "message": "Permission not granted",
    "errorSource": [],
    "err": "Permission not granted",
    "stack": "Error: Permission not granted\n    at F:\\LEVEL-2-DEV-COURSE\\level 2 assignment 5\\src\\app\\middlewares\\checkUser.ts:23:19\n    at Generator.next (<anonymous>)\n    at fulfilled (F:\\LEVEL-2-DEV-COURSE\\level 2 assignment 5\\src\\app\\middlewares\\checkUser.ts:5:58)\n    at processTicksAndRejections (node:internal/process/task_queues:105:5)"}
  </pre>
  <pre>
    If the user not found
    {
    "status": false,
    "message": "User not found",
    "errorSource": [],
    "err": "User not found",
    "stack": "Error: User not found\n    at F:\\LEVEL-2-DEV-COURSE\\level 2 assignment 5\\src\\app\\modules\\user\\user.service.ts:105:15\n    at Generator.next (<anonymous>)\n    at fulfilled (F:\\LEVEL-2-DEV-COURSE\\level 2 assignment 5\\src\\app\\modules\\user\\user.service.ts:5:58)\n    at processTicksAndRejections (node:internal/process/task_queues:105:5)"}
  </pre>
  <pre>
    response
    {
    "success": true,
    "data": {
        "name": "Shuvo",
        "email": "shuvajitdas838@gmail.com",
        "userStatus": "BLOCKED",
        "isVerified": false,
        "role": "RECEIVER",
        "auths": [
            {
                "provider": "credentials",
                "providerId": "shuvajitdas838@gmail.com"
            }
        ],
        "createdAt": "2025-08-08T10:28:59.819Z",
        "updatedAt": "2025-08-16T23:54:32.577Z",
        "userId": "USER-0ec87a562fea"
    },
    "message": "User is blocked"
}
  </pre>

### 7. Unblock User
- **Endpoint:** `POST /user/unblock/:userId`
- **Purpose:** Unblocks previously blocked user account
- **Description:** Changes user status from BLOCKED to ACTIVE, restoring system access
- **Authorization:** ADMIN or SUPER_ADMIN roles required
  <pre>
    if user is not ADMIN or SUPER_ADMIN then this error message will come
    {
    "status": false,
    "message": "Permission not granted",
    "errorSource": [],
    "err": "Permission not granted",
    "stack": "Error: Permission not granted\n    at F:\\LEVEL-2-DEV-COURSE\\level 2 assignment 5\\src\\app\\middlewares\\checkUser.ts:23:19\n    at Generator.next (<anonymous>)\n    at fulfilled (F:\\LEVEL-2-DEV-COURSE\\level 2 assignment 5\\src\\app\\middlewares\\checkUser.ts:5:58)\n    at processTicksAndRejections (node:internal/process/task_queues:105:5)"}
  </pre>
  <pre>
    response
    {
    "success": true,
    "data": {
        "name": "Shuvo",
        "email": "shuvajitdas838@gmail.com",
        "userStatus": "ACTIVE",
        "isVerified": false,
        "role": "RECEIVER",
        "auths": [
            {
                "provider": "credentials",
                "providerId": "shuvajitdas838@gmail.com"
            }
        ],
        "createdAt": "2025-08-08T10:28:59.819Z",
        "updatedAt": "2025-08-17T00:25:34.334Z",
        "userId": "USER-0ec87a562fea"
    },
    "message": "User is unblocked"}
  </pre>

## User Features
- **Password Security:** Bcrypt hashing with configurable salt rounds
- **Unique User IDs:** Auto-generated MD5-based unique identifiers
- **Role-Based Access:** Multiple user roles (SENDER, RECEIVER, DELIVERY_AGENT, ADMIN, SUPER_ADMIN)
- **User Status Management:** Active/Blocked status tracking
- **Data Validation:** Zod schema validation for user input
- **Auth Support:** Supports credential authentication

## User Roles
- **SENDER:** Can send parcels
- **RECEIVER:** Can receive parcels  
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
- **Special Feature:** Blocked users cannot create parcels and another is i have implemented a system which will try to find out that the receiver is our registered user or not. If registered then that receiver id will be set into the parcels receiver info and if not registered then no userId will be added ( note : i have created this system thinking that the senders can send parcels to anyone who is our registered user and also unregistered users. There is a coupon system also and the fee will be calculated based on the parcel weight ) 
  <pre>
    this is the fee for different type of parcels
    const feeObjects: Record<ParcelType, { base: number; freeWeight: number; ratePerKg: number; }> = {
    [ParcelType.DOCUMENT]: { base: 50, freeWeight: 2, ratePerKg: 50 },
    [ParcelType.BOX]: { base: 80, freeWeight: 4, ratePerKg: 50 },
    [ParcelType.FRAGILE]: { base: 100, freeWeight: 2, ratePerKg: 100 },
    [ParcelType.LARGE]: { base: 150, freeWeight: 10, ratePerKg: 150 }};
  </pre>
  <pre>
    body
    {
  "parcelName": "New parcel33333",
  "senderAddress": "123/B, Gulshan Avenue, Dhaka",
  "location": "Dhaka Warehouse",
  "receiverInfo": {
    "receiverName": "pakhi Hasan",
    "receiverPhone": "017XXXXXXXX",
    "receiverEmail": "shuvajitdas838@gmail.com",
    "address": "House 11, Road 5, Banani, Dhaka"
  },
  "parcelType": "FRAGILE",
  "weight": 30,
  "deliveryDate": "2025-08-10T10:00:00.000Z",
  "coupon":"SUMMER2026"}
    ## ( note : If you did not provide any coupon then the normal fee will be applied )
  </pre>
  <pre>
    if coupon is reached its max limit
    {
    "status": false,
    "message": "The coupon SUMMER2026 reached its max limit",
    "errorSource": [],
    "err": "The coupon SUMMER2026 reached its max limit",
    "stack": "Error: The coupon SUMMER2026 reached its max limit\n    at model.<anonymous> (F:\\LEVEL-2-DEV-COURSE\\level 2 assignment 5\\src\\app\\modules\\parcel\\parcel.model.ts:226:33)\n    at Generator.next (<anonymous>)\n    at fulfilled (F:\\LEVEL-2-DEV-COURSE\\level 2 assignment 5\\src\\app\\modules\\parcel\\parcel.model.ts:38:58)\n    at processTicksAndRejections (node:internal/process/task_queues:105:5)"}
  </pre>
  <pre>
    If user is trying to submit the Coupon even after giving the upper message then this error message will be appeared
    {
    "status": false,
    "message": "The coupon SUMMER2026 is expired",
    "errorSource": [],
    "err": "The coupon SUMMER2026 is expired",
    "stack": "Error: The coupon SUMMER2026 is expired\n    at model.<anonymous> (F:\\LEVEL-2-DEV-COURSE\\level 2 assignment 5\\src\\app\\modules\\parcel\\parcel.model.ts:219:33)\n    at Generator.next (<anonymous>)\n    at fulfilled (F:\\LEVEL-2-DEV-COURSE\\level 2 assignment 5\\src\\app\\modules\\parcel\\parcel.model.ts:38:58)\n    at processTicksAndRejections (node:internal/process/task_queues:105:5)"
}
  </pre>
<pre>
  If RECEIVER is trying to create a parcel then this error message will be returned
  {
    "status": false,
    "message": "Permission not granted",
    "errorSource": [],
    "err": "Permission not granted",
    "stack": "Error: Permission not granted\n    at F:\\LEVEL-2-DEV-COURSE\\level 2 assignment 5\\src\\app\\middlewares\\checkUser.ts:20:19\n    at Generator.next (<anonymous>)\n    at fulfilled (F:\\LEVEL-2-DEV-COURSE\\level 2 assignment 5\\src\\app\\middlewares\\checkUser.ts:5:58)\n    at processTicksAndRejections (node:internal/process/task_queues:105:5)"}
</pre>
```json
{
  "success": true,
  "data": {
    "parcelName": "New parcel33333",
    "senderId": "USER-be6008b602f1",
    "senderAddress": "123/B, Gulshan Avenue, Dhaka",
    "location": "Dhaka Warehouse",
    "receiverInfo": {
      "address": "House 11, Road 5, Banani, Dhaka",
      "receiverId": "USER-0ec87a562fea",
      "receiverName": "example",
      "receiverPhone": "017XXXXXXXX",
      "receiverEmail": "example@gmail.com"
    },
    "parcelType": "FRAGILE",
    "weight": 30,
    "deliveryDate": "2025-08-10T10:00:00.000Z",
    "parcelStatus": "REQUESTED",
    "isPaid": false,
    "coupon": "SUMMER2026",
    "trackingEvent": [
      {
        "location": "Dhaka Warehouse",
        "status": {
          "parcelStatus": "REQUESTED",
          "date": "2025-08-17T02:29:56.013Z"
        },
        "note": "This parcel is REQUESTED on 8/17/2025, 8:29:56 AM"
      }
    ],
    "createdAt": "2025-08-17T02:29:56.013Z",
    "updatedAt": "2025-08-17T02:29:56.013Z",
    "fee": 2465,
    "trackingId": "TRK-E46D91602A7F6115"
  },
  "message": "Parcel created successfully"
}

### 2. Get All Parcels
- **Endpoint:** `GET /parcel/all-parcel`
- **Purpose:** Retrieves parcels based on user role and optional status filter
- **Description:** Returns parcels filtered by user role - admins see all, senders see their sent parcels, receivers see incoming parcels
- **Authorization:** ADMIN, SENDER, RECEIVER, SUPER_ADMIN roles
- **Query Parameters:** `filter` (optional) - Filter by parcel status
  <pre>
    Response
    {
    "success": true,
    "data": [
        {
    "success": true,
    "data": {
        "parcelName": "New parcel without coupon",
        "senderId": "USER-be6008b602f1",
        "senderAddress": "123/B, Gulshan Avenue, Dhaka",
        "location": "Dhaka Warehouse",
        "receiverInfo": {
            "address": "House 11, Road 5, Banani, Dhaka",
            "receiverId": "USER-0ec87a562fea",
            "receiverName": "pakhi Hasan",
            "receiverPhone": "017XXXXXXXX",
            "receiverEmail": "shuvajitdas838@gmail.com"
        },
        "parcelType": "FRAGILE",
        "weight": 30,
        "deliveryDate": "2025-08-10T10:00:00.000Z",
        "parcelStatus": "REQUESTED",
        "isPaid": false,
        "trackingEvent": [
            {
                "location": "Dhaka Warehouse",
                "status": {
                    "parcelStatus": "REQUESTED",
                    "date": "2025-08-17T02:37:30.043Z"
                },
                "note": "This parcel is REQUESTED on 8/17/2025, 8:37:30 AM"
            }
        ],
        "createdAt": "2025-08-17T02:37:30.043Z",
        "updatedAt": "2025-08-17T02:37:30.043Z",
        "fee": 2900, // this fee is calculated without any COUPON
        "trackingId": "TRK-74EF263949014E45"
    },
    "message": "Parcel created successfully"
},
        {
            "_id": "68a13a04e606763d001f53b1",
            "parcelName": "New parcel22",
            "senderId": "USER-be6008b602f1",
            "senderAddress": "123/B, Gulshan Avenue, Dhaka",
            "location": "Dhaka Warehouse",
            "receiverInfo": {
                "address": "House 11, Road 5, Banani, Dhaka",
                "receiverId": "USER-0ec87a562fea",
                "receiverName": "pakhi Hasan",
                "receiverPhone": "017XXXXXXXX",
                "receiverEmail": "shuvajitdas838@gmail.com"
            },
            "parcelType": "FRAGILE",
            "weight": 30,
            "deliveryDate": "2025-08-10T10:00:00.000Z",
            "parcelStatus": "REQUESTED",
            "isPaid": false,
            "coupon": "SUMMER2026",
            "trackingEvent": [
                {
                    "status": {
                        "parcelStatus": "REQUESTED",
                        "date": "2025-08-17T02:10:12.426Z"
                    },
                    "location": "Dhaka Warehouse",
                    "note": "This parcel is REQUESTED on 8/17/2025, 8:10:12 AM"
                }
            ],
            "createdAt": "2025-08-17T02:10:12.426Z",
            "updatedAt": "2025-08-17T02:10:12.426Z",
            "fee": 2465, // this parcel fee is calculated using coupon
            "trackingId": "TRK-7F51DF8C823604EF"
        }
    ],
    "message": "Parcel retrieved successfully"
}
  </pre>

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
