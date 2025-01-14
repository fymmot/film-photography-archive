#!/bin/bash

curl -X POST \
  http://localhost:8888/.netlify/functions/submit-comment \
  -H 'Content-Type: application/json' \
  -d '{
  "author": "Test User",
  "email": "test@example.com",
  "content": "This is a test comment!",
  "rollSlug": "2023-1-01-snowstorm-and-slussen-in-december"
}' 