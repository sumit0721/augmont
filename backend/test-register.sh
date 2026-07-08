#!/bin/bash
# Test registration endpoint
curl -s -X POST http://localhost:3000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"testuser999@gmail.com","password":"test1234"}'
echo ""
