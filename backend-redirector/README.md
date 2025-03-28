`NOTE: This document is AI-generated`

# URL Shortener - Redirector Service

A high-performance URL redirection service built with Fastify, TypeScript, MikroORM(PostgreSQL) and Redis. This service handles the actual redirection of shortened URLs to their original destinations.

## Features

- ⚡ Fast URL redirection with Redis caching
- 🔒 Password protection for shortened URLs
- 📊 URL analytics tracking - capture visit count
- 💾 Database operation with MikroORM
- 🧪 Comprehensive test suite with Jest
- 🐳 Docker support
- 🔄 Automatic URL expiration handling

## Tech Stack

- **Framework**: Fastify
- **Language**: TypeScript
- **Database**: MikroORM with PostgreSQL
- **Caching**: Redis
- **Testing**: Jest
- **Container**: Docker

## Getting Started

### Prerequisites

- Node.js 18.x or later
- Redis
- PostgreSQL(migration done with Prisma - refer backend-management/)
- npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `sample.env`:
   ```bash
   cp sample.env .env
   ```

4. Set up the database:
    ```
    Migrations done on backend-management/
    ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The service will be available at [http://localhost:3001](http://localhost:3001).

## Development

### Running Tests
Create a `.env.e2e` for connecting to test environment

```bash
# Run unit tests
npm test

# Run E2E tests
npm run test:e2e
```

### Building for Production

```bash
npm run build
```

### Docker Support

Build the Docker image:
```bash
docker build -t url-shortener-redirector .

# or use the docker compose file in project root
```

Run the container:
```bash
docker run -p 3001:3001 --env-file=.env url-shortener-redirector

# or use the docker compose file in project root
```

## API Endpoints

### GET /:shortCode
Redirects to the original URL.

**Parameters:**
- `shortCode` (path): The shortened URL code

**Response:**
- 302: Redirects to the original URL
- 404: URL not found/URL expired
- 401: Password required
- 400: Malformed request

### POST /:shortCode
Verifies password for protected URLs.

**Parameters:**
- `shortCode` (path): The shortened URL code
- `password` (body): The password to verify

**Response:**
- 200: Password verified
- 401: Invalid password
- 404: URL not found/URL expired
- 400: Malformed request

## Project Structure

```
backend-redirector/
├── src/
    ├── __e2e__                 # End-to-end tests
    ├── modules/
    │   ├── common/             # Shared utilities and types
    │   └── url/                # URL redirection handlers
    ├── plugins/                # Fastify plugins, db, redis
    ├── app.ts                  # Fastify boostraper
    ├── server.ts               # Application entry point
    ├── mikro-orm.config.ts     # dbconfig
    └── test/                   # test setup
```

## Environment Variables

- `PORT`: Server port (default: 3002)
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `NODE_ENV`: Environment (development/production/e2e)

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 