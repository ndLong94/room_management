# Management Backend

Spring Boot 3.x API (Java 17, Maven).

## Requirements

- **Java 17**
- **Maven 3.9+** (or use the project’s Maven wrapper if present)
- **PostgreSQL** (you already have it; database name: `room_management`)

## Configuration

### Database

The app expects a PostgreSQL database named **`room_management`**.

- **Dev** (`application-dev.yml`): defaults to `localhost:5432`, user `postgres`, password `postgres`.
- Override with environment variables:

| Variable           | Default (dev) | Description        |
|--------------------|----------------|--------------------|
| `POSTGRES_HOST`    | `localhost`    | PostgreSQL host    |
| `POSTGRES_PORT`    | `5432`         | PostgreSQL port    |
| `POSTGRES_USER`    | `postgres`     | Database user      |
| `POSTGRES_PASSWORD`| `postgres`     | Database password  |

Database name is fixed as **`room_management`** in dev. Create it if it doesn’t exist:

```sql
CREATE DATABASE room_management;
```

### Application

| Variable                 | Default | Description          |
|--------------------------|---------|----------------------|
| `SPRING_PROFILES_ACTIVE` | `dev`   | Profile: `dev`/`prod`|
| `SERVER_PORT`            | `8080`  | Server port          |

### JWT (Auth)

| Variable           | Default (dev) | Description            |
|--------------------|----------------|------------------------|
| `JWT_SECRET`       | (see below)    | HMAC key (min 32 chars)|
| `JWT_EXPIRATION_MS`| `86400000` (24h)| Token validity in ms  |

Default dev secret in `application.yml` is a placeholder; set `JWT_SECRET` in production.

**Auth endpoints:** `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` (Bearer token).  
**Swagger:** http://localhost:8080/swagger-ui.html — use **Authorize** and enter the token from login (no "Bearer " prefix in the box).

## How to start

1. Ensure PostgreSQL is running and the database exists:

   ```bash
   psql -U postgres -c "CREATE DATABASE room_management;"
   ```

2. From the **backend** directory:

   ```bash
   cd backend
   mvn spring-boot:run
   ```

   Or with Maven wrapper (if present):

   ```bash
   ./mvnw spring-boot:run
   ```

3. API base: **http://localhost:8080**  
   - Swagger UI: **http://localhost:8080/swagger-ui.html**  
   - Health (authenticated): `GET /api/health` (use Basic auth)

## Profiles

- **dev** – Default. Uses `application-dev.yml` (local DB, dev user, verbose logging).
- **prod** – Uses `application-prod.yml`. Set `POSTGRES_*` (and optionally `SERVER_PORT`) in the environment.

Example with prod profile:

```bash
export SPRING_PROFILES_ACTIVE=prod
export POSTGRES_HOST=localhost
export POSTGRES_PORT=5432
export POSTGRES_DB=room_management
export POSTGRES_USER=postgres
export POSTGRES_PASSWORD=your_password
mvn spring-boot:run
```

## Build

```bash
mvn clean package
java -jar target/management-backend-1.0.0-SNAPSHOT.jar
```

## Tests

```bash
mvn test
```

Tests use Testcontainers for PostgreSQL when needed.
