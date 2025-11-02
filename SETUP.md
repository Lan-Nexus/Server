# Setup Process Documentation

## Overview

The Lan-Nexus system now includes an automatic setup process that will guide you through creating the first admin user when the system is accessed for the first time.

## How it Works

### 1. Setup Detection
- When any user visits the application, the router automatically checks if any users exist in the system
- If no users are found, the user is automatically redirected to the setup page (`/setup`)
- This check happens before any authentication requirements

### 2. Setup Page
The setup page (`/setup`) provides a form to create the first admin user with:
- **Full Name**: Display name for the admin user
- **Username (Client ID)**: Unique identifier for login
- **Password**: Secure password (minimum 6 characters)
- **Password Confirmation**: Must match the password

### 3. Security Features
- **One-time Setup**: Once any user exists in the system, the setup endpoint is automatically disabled
- **Automatic Admin Role**: The first user created through setup is automatically assigned the `admin` role
- **Immediate Login**: After successful setup, the user is automatically logged in and redirected to the home page

## API Endpoints

### Setup Check
```
GET /auth/setup/check
```
Returns:
```json
{
  "needsSetup": boolean
}
```

### Setup Execution
```
POST /auth/setup
```
Request Body:
```json
{
  "name": "Admin User",
  "clientId": "admin",
  "password": "securepassword"
}
```

Response (on success):
```json
{
  "message": "Setup completed successfully",
  "token": "jwt_token_here",
  "expires": "2024-11-02T15:30:00.000Z",
  "role": "admin",
  "user": {
    "id": 1,
    "name": "Admin User",
    "clientId": "admin", 
    "role": "admin",
    "avatar": null
  }
}
```

## Router Behavior

The Vue router includes guards that:

1. **Check Setup Status**: Before any route navigation, check if setup is needed
2. **Redirect to Setup**: If setup is needed and user isn't already on `/setup`, redirect there
3. **Prevent Setup Access**: If setup is complete, prevent access to `/setup` page
4. **Normal Auth Flow**: After setup check, proceed with normal authentication flow

## Error Handling

- **Duplicate Setup**: If setup is attempted when users already exist, returns error
- **Validation Errors**: Form validation ensures all required fields are provided
- **Password Mismatch**: Frontend validation ensures password confirmation matches
- **Network Errors**: Graceful handling of network issues during setup

## Development Notes

- The setup check uses a simple database query to count users
- Avatar data is stored as JSON in the database
- The setup process bypasses normal authentication requirements
- Setup endpoints don't require JWT tokens (pre-authentication)

## Production Considerations

- Ensure the setup process is only accessible on first deployment
- Consider adding additional security measures for production environments
- Database should be properly initialized before first access
- SSL/HTTPS recommended for production setup to protect password transmission