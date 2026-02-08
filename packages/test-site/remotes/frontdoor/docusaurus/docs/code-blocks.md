# Code blocks highlighting

test highlighting syntax

## JavaScript

```javascript
// React component example
import React, { useState, useEffect } from 'react';

const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch(`/api/users/${userId}`);
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [userId]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="user-profile">
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
};

export default UserProfile;
```

## TypeScript

```typescript
// API service with types
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
}

class UserService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getUser(id: number): Promise<User> {
    const response = await fetch(`${this.baseUrl}/users/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  async createUser(userData: Omit<User, 'id'>): Promise<User> {
    const response = await fetch(`${this.baseUrl}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return await response.json();
  }
}
```

## Python

```python
# FastAPI backend example
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
import asyncio

app = FastAPI()

class User(BaseModel):
    id: Optional[int] = None
    name: str
    email: str
    is_active: bool = True

users_db = []

@app.post("/users/", response_model=User)
async def create_user(user: User):
    user.id = len(users_db) + 1
    users_db.append(user)
    return user

@app.get("/users/{user_id}", response_model=User)
async def get_user(user_id: int):
    for user in users_db:
        if user.id == user_id:
            return user
    raise HTTPException(status_code=404, detail="User not found")

@app.get("/users/", response_model=List[User])
async def list_users(skip: int = 0, limit: int = 10):
    return users_db[skip : skip + limit]
```

## Go

```go
// HTTP server with middleware
package main

import (
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "time"
)

type User struct {
    ID        int       `json:"id"`
    Name      string    `json:"name"`
    Email     string    `json:"email"`
    CreatedAt time.Time `json:"created_at"`
}

func loggingMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        next.ServeHTTP(w, r)
        log.Printf("%s %s %v", r.Method, r.URL.Path, time.Since(start))
    })
}

func getUserHandler(w http.ResponseWriter, r *http.Request) {
    user := User{
        ID:        1,
        Name:      "John Doe",
        Email:     "john@example.com",
        CreatedAt: time.Now(),
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(user)
}

func main() {
    mux := http.NewServeMux()
    mux.HandleFunc("/users/", getUserHandler)

    handler := loggingMiddleware(mux)

    fmt.Println("Server starting on :8080")
    log.Fatal(http.ListenAndServe(":8080", handler))
}
```

## Rust

```rust
// Async web service with Tokio
use std::sync::Arc;
use tokio::sync::Mutex;
use warp::{Filter, Reply};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
struct User {
    id: u32,
    name: String,
    email: String,
}

type Users = Arc<Mutex<Vec<User>>>;

#[tokio::main]
async fn main() {
    let users = Users::default();

    let get_users = warp::path!("users")
        .and(warp::get())
        .and(with_users(users.clone()))
        .and_then(list_users);

    let create_user = warp::path!("users")
        .and(warp::post())
        .and(warp::body::json())
        .and(with_users(users.clone()))
        .and_then(create_user);

    let routes = get_users.or(create_user);

    warp::serve(routes)
        .run(([127, 0, 0, 1], 3030))
        .await;
}

fn with_users(users: Users) -> impl Filter<Extract = (Users,), Error = std::convert::Infallible> + Clone {
    warp::any().map(move || users.clone())
}

async fn list_users(users: Users) -> Result<impl Reply, warp::Rejection> {
    let users = users.lock().await;
    Ok(warp::reply::json(&*users))
}

async fn create_user(user: User, users: Users) -> Result<impl Reply, warp::Rejection> {
    let mut users = users.lock().await;
    users.push(user.clone());
    Ok(warp::reply::json(&user))
}
```

## Java

```java
// Spring Boot REST controller
package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@SpringBootApplication
public class DemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}

@RestController
@RequestMapping("/api/users")
class UserController {
    private List<User> users = new ArrayList<>();

    @GetMapping
    public List<User> getAllUsers() {
        return users;
    }

    @GetMapping("/{id}")
    public Optional<User> getUser(@PathVariable Long id) {
        return users.stream()
            .filter(user -> user.getId().equals(id))
            .findFirst();
    }

    @PostMapping
    public User createUser(@RequestBody User user) {
        users.add(user);
        return user;
    }

    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        users.removeIf(user -> user.getId().equals(id));
    }
}

class User {
    private Long id;
    private String name;
    private String email;

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
```

## Bash

```bash
#!/bin/bash

# Deployment script with error handling
set -euo pipefail

ENVIRONMENT="${1:-production}"
APP_NAME="my-app"
DEPLOY_DIR="/opt/${APP_NAME}"

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*"
}

error() {
    log "ERROR: $*" >&2
    exit 1
}

check_requirements() {
    command -v docker >/dev/null 2>&1 || error "Docker is required but not installed"
    command -v git >/dev/null 2>&1 || error "Git is required but not installed"
}

deploy() {
    log "Starting deployment to ${ENVIRONMENT}"

    cd "${DEPLOY_DIR}" || error "Failed to change to deploy directory"

    log "Pulling latest code..."
    git pull origin main || error "Failed to pull latest code"

    log "Building Docker image..."
    docker build -t "${APP_NAME}:latest" . || error "Failed to build image"

    log "Stopping old container..."
    docker stop "${APP_NAME}" 2>/dev/null || true
    docker rm "${APP_NAME}" 2>/dev/null || true

    log "Starting new container..."
    docker run -d \
        --name "${APP_NAME}" \
        --restart unless-stopped \
        -p 8080:8080 \
        "${APP_NAME}:latest" || error "Failed to start container"

    log "Deployment complete!"
}

check_requirements
deploy
```

## SQL

```sql
-- Database schema with indexes and constraints
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    status VARCHAR(20) DEFAULT 'draft',
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_published_at ON posts(published_at);

-- Complex query with joins and aggregation
SELECT
    u.id,
    u.name,
    u.email,
    COUNT(p.id) as post_count,
    MAX(p.published_at) as last_published,
    AVG(CASE WHEN p.status = 'published' THEN 1 ELSE 0 END) * 100 as publish_rate
FROM users u
LEFT JOIN posts p ON u.id = p.user_id
WHERE u.created_at >= NOW() - INTERVAL '30 days'
GROUP BY u.id, u.name, u.email
HAVING COUNT(p.id) > 0
ORDER BY post_count DESC
LIMIT 10;

-- Stored procedure
CREATE OR REPLACE FUNCTION publish_post(post_id INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE posts
    SET status = 'published',
        published_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = post_id AND status = 'draft';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Post % not found or already published', post_id;
    END IF;
END;
$$ LANGUAGE plpgsql;
```

## YAML

```yaml
# Docker Compose configuration
version: '3.8'

services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:password@db:5432/myapp
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    volumes:
      - ./uploads:/app/uploads
    restart: unless-stopped
    networks:
      - app-network

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: myapp
    volumes:
      - postgres-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - web
    networks:
      - app-network

volumes:
  postgres-data:
  redis-data:

networks:
  app-network:
    driver: bridge
```

## JSON

```json
{
  "name": "my-application",
  "version": "1.0.0",
  "description": "A modern web application",
  "main": "dist/index.js",
  "scripts": {
    "start": "node dist/index.js",
    "dev": "nodemon src/index.ts",
    "build": "tsc",
    "test": "jest",
    "lint": "eslint src/**/*.ts",
    "format": "prettier --write \"src/**/*.ts\""
  },
  "dependencies": {
    "express": "^4.18.2",
    "typescript": "^5.0.0",
    "dotenv": "^16.0.3",
    "pg": "^8.10.0",
    "redis": "^4.6.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/node": "^18.15.0",
    "nodemon": "^2.0.22",
    "jest": "^29.5.0",
    "eslint": "^8.38.0",
    "prettier": "^2.8.7"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

## Dockerfile

```dockerfile
# Multi-stage build for Node.js application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production image
FROM node:18-alpine

WORKDIR /app

# Copy built assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

CMD ["node", "dist/index.js"]
```

## CSS

```css
/* Modern CSS with custom properties and animations */
:root {
  --primary-color: #0076FF;
  --secondary-color: #2ecc71;
  --text-color: #333;
  --background: #f8fafc;
  --card-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  --transition-speed: 0.3s;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: var(--text-color);
  background-color: var(--background);
  line-height: 1.6;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: var(--card-shadow);
  transition: all var(--transition-speed) ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.6s ease-out forwards;
}

@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }

  .card {
    padding: 1rem;
  }
}
```
