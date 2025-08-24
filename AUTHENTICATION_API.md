# Eventfy Authentication API Documentation

## Overview
The Eventfy authentication system provides JWT-based authentication with user roles (participant, organizer, both) and comprehensive profile management.

## Base URL
```
http://localhost:8000/api/auth/
```

## Authentication Endpoints

### 1. User Registration
**POST** `/api/auth/register/`

Register a new user account.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123",
  "password_confirm": "securepassword123",
  "first_name": "John",
  "last_name": "Doe",
  "role": "organizer"  // "participant", "organizer", or "both"
}
```

**Response (201 Created):**
```json
{
  "message": "Utilisateur créé avec succès",
  "user": {
    "id": 1,
    "username": "johndoe",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "profile": {
      "role": "organizer",
      "phone": "",
      "bio": "",
      "avatar": null,
      "created_at": "2023-12-01T10:00:00Z"
    }
  }
}
```

### 2. User Login
**POST** `/api/auth/login/`

Authenticate user and receive JWT tokens.

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "securepassword123"
}
```

**Response (200 OK):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### 3. Token Refresh
**POST** `/api/auth/refresh/`

Refresh access token using refresh token.

**Request Body:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Response (200 OK):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### 4. Token Verification
**POST** `/api/auth/verify/`

Verify if a token is valid.

**Request Body:**
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Response (200 OK):** Empty response if valid, 401 if invalid.

## Profile Management Endpoints

### 5. Get User Profile
**GET** `/api/auth/profile/`

Get current user's profile information.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "id": 1,
  "username": "johndoe",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "profile": {
    "role": "organizer",
    "phone": "+33123456789",
    "bio": "Event organizer passionate about tech conferences",
    "avatar": "/media/profiles/avatars/avatar.jpg",
    "created_at": "2023-12-01T10:00:00Z"
  }
}
```

### 6. Update User Profile
**PUT/PATCH** `/api/auth/profile/update/`

Update user profile information.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "first_name": "John Updated",
  "last_name": "Doe Updated",
  "email": "john.updated@example.com",
  "role": "both",
  "phone": "+33987654321",
  "bio": "Updated bio description"
}
```

**Response (200 OK):**
```json
{
  "message": "Profil mis à jour avec succès",
  "user": {
    "id": 1,
    "username": "johndoe",
    "first_name": "John Updated",
    "last_name": "Doe Updated",
    "email": "john.updated@example.com",
    "profile": {
      "role": "both",
      "phone": "+33987654321",
      "bio": "Updated bio description",
      "avatar": "/media/profiles/avatars/avatar.jpg",
      "created_at": "2023-12-01T10:00:00Z"
    }
  }
}
```

### 7. Get User Events
**GET** `/api/auth/my-events/`

Get events associated with the current user (organized or registered).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "organized_events": [
    {
      "id": 1,
      "title": "Tech Conference 2024",
      "description": "Annual technology conference",
      "start_date": "2024-01-15T09:00:00Z",
      "status": "published",
      "is_private": false,
      // ... other event fields
    }
  ],
  "registered_events": [
    {
      "id": 2,
      "title": "Workshop React",
      "description": "Learn React fundamentals",
      "start_date": "2024-01-20T14:00:00Z",
      "status": "published",
      // ... other event fields
    }
  ],
  "stats": {
    "total_events": 1,
    "published_events": 1,
    "draft_events": 0,
    "total_registrations": 25
  }
}
```

## User Roles

### Participant
- Can browse and register for public events
- Can view their registered events
- Cannot create events

### Organizer
- Can create, edit, and manage events
- Can view event statistics and registrations
- Can register for other events

### Both
- Has all permissions of both participant and organizer

## Error Responses

### 400 Bad Request
```json
{
  "field_name": ["Error message for this field"]
}
```

### 401 Unauthorized
```json
{
  "detail": "Given token not valid for any token type",
  "code": "token_not_valid",
  "messages": [
    {
      "token_class": "AccessToken",
      "token_type": "access",
      "message": "Token is invalid or expired"
    }
  ]
}
```

### 404 Not Found
```json
{
  "detail": "Not found."
}
```

## Authentication Flow

1. **Register** a new user account with `/api/auth/register/`
2. **Login** with credentials to get JWT tokens via `/api/auth/login/`
3. **Include** the access token in the Authorization header for protected endpoints
4. **Refresh** the access token when it expires using `/api/auth/refresh/`
5. **Update** profile information as needed via `/api/auth/profile/update/`

## Security Notes

- Access tokens expire after 60 minutes
- Refresh tokens expire after 7 days and rotate on use
- All profile management endpoints require authentication
- Passwords must be at least 8 characters long
- Email addresses must be unique across the system

## Testing

Use the provided `test_auth_endpoints.py` script to test all authentication endpoints:

```bash
python test_auth_endpoints.py
```

Make sure the Django server is running on `http://localhost:8000` before running tests.
