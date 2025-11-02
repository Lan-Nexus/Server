# Test the Setup Endpoints

## Test Setup Check
```bash
curl -X GET http://localhost:3000/auth/setup/check
```

Expected response when no users exist:
```json
{
  "needsSetup": true
}
```

Expected response when users exist:
```json
{
  "needsSetup": false
}
```

## Test Setup Creation
```bash
curl -X POST http://localhost:3000/auth/setup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "clientId": "admin",
    "password": "adminpassword"
  }'
```

Expected response on success:
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

Expected response when setup already complete:
```json
{
  "error": "Setup has already been completed. Users already exist in the system."
}
```