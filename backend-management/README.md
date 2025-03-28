`NOTE: This document is AI-generated`
# URL Shortener - Management Service

A robust management service for the URL shortener application built with Fastify, TypeScript, and Prisma. This service handles URL creation, management, and analytics.

## Features

- 🔗 URL shortening with custom aliases
- 🔒 Password protection for URLs
- 💾 Database operation with Prisma
- 🧪 Comprehensive test suite with Jest
- 🐳 Docker support
- 🔄 URL expiration management

## Tech Stack

- **Framework**: Fastify
- **Language**: TypeScript
- **Database**: Prisma with PostgreSQL
- **Validation**: Zod
- **Testing**: Jest
- **Container**: Docker
- **Code Quality**: ESLint, Prettier

## Getting Started

### Prerequisites

- Node.js 20.x or later
- PostgreSQL
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

   Create your database then update `.env` `DATABASE_URL`

   ```bash
   npm run migrate:dev
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The service will be available at [http://localhost:3000](http://localhost:3000).

## Development

### Running Tests

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
docker build -t url-shortener-management .

# or use the docker compose file in project root
```

Run the container:
```bash
docker run -p 3000:3000 --env-file=.env url-shortener-management

# or use the docker compose file in project root
```

## API Endpoints

### POST /api/v1/urls/shorten
Creates a new shortened URL.

**Request Body:**
```json
{
  "long_url": "https://example.com",
  "custom_url": "optional-custom-alias",
  "password": "optional-password",
  "expiry": "optional-expiry-date"
}
```

**Response:**
- 200: URL created successfully
- 400: Invalid request, alias alreadt exists


## Project Structure

```
backend-management/
├── src/
│   ├── __e2e__/        # e2e tests
|   ├── dtos/           # dto schema
|   ├── lib/            # shared utilities
|   ├── middlewares/    # middlewares
|   ├──routes           # route handlers
|   ├──app.ts           # Express bootstraper
|   ├──index.ts         # application entry
├── prisma/             # Database schema and migrations
```

## Environment Variables

- `PORT`: Server port (default: 3001)
- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: Environment (development/production/e2e)

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 