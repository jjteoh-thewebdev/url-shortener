# URL Shortener

<div align="center">
    <img src="media/landing-page-1.png" />
</div>

A modern, scalable URL shortener application built with:
- Frontend app: Next.js + TailwindCSS + Playwright 
- Backend management: Express.js + Prisma(Postgres)
- Backend redirector: Fastify.js + MikroORM

**Normally you will not need to have 2 different techstacks for the backend services. I did this because I want to explore different tech stack.**

All services are built with Typescript. This project implements a microservices architecture with separate services for URL management, redirection, and frontend.



## Project Background

This is a POC for implementing URL shortener application that is designed to provide a robust and scalable solution for shortening URLs with features like password protection, custom aliases(urls), and little analytics capability. For detailed information about the project's architecture, design decisions, and technical specifications, please refer to [PROJECT.md](PROJECT.md).

## Features

- 🔗 URL shortening with custom aliases
- 🔒 Password protection for URLs
- 📊 URL analytics and statistics
- 🚀 High-performance redirection with Redis caching
- 🧪 Comprehensive test coverage
- 🐳 Docker support
- 🔄 URL expiration management

## Folder Organization

### backend-management
The management service handles URL creation and management. It provides RESTful APIs for:
- Creating shortened URLs

[View backend-management README](backend-management/README.md)

### backend-redirector
The redirection service handles the actual URL redirection with Redis caching for high performance. It provides:
- Fast URL redirection
- Password verification
- Redis caching
- Analytics tracking

[View backend-redirector README](backend-redirector/README.md)

### frontend
A modern Next.js application that provides the user interface for the URL shortener. Features include:
- Modern UI with Tailwind CSS, shadcn/ui, Lucide Icons
- Responsive design
- Password protection UI
- Playwright test framework

[View frontend README](frontend/README.md)

## Setup Database

1. Create PostgreSQL database for backend services:
   ```sql
   CREATE DATABASE url_shortener;
   ```

2. Create `.env` file in `backend-management`:
   ```bash
   # backend-management/.env
   DATABASE_URL="postgresql://user:password@localhost:5432/url_shortener
   ```

3. Run migrations:

   **Note: for ease of maitenance, only do migration in backend-management with Prisma. Do not run migrations with MikroORM in backend-redirector**
   ```bash
   # In backend-management directory
   npm run migrate:dev
   ```

## Running with Docker Compose

1. Create a `.docker.env` file in the each project root:
   ```bash
   cp sample.env .docker.env
   ```

2. Start all services:
   ```bash
   docker-compose up -d
   ```

3. Access the services:
   - Frontend: http://localhost:3000
   - Management API: http://localhost:3001
   - Redirector API: http://localhost:3002

4. Stop all services:
   ```bash
   docker-compose down
   ```

## Project Gallery

### Landing Page Design
![URL Shortening Interface](media/landing-page-1.png)

### Validation with ZOD
![Validation with ZOD](media/landing-page-2.png)

### Result Page
![Result Page](media/result-page-1.png)

### E2E Testing with Playwright
![E2E Testing with Playwright](media/playwright-report.png)


## Development

### Prerequisites
- Node.js 18.x or later
- PostgreSQL
- Redis
- Docker and Docker Compose
- npm or yarn

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/url-shortener.git
   cd url-shortener
   ```

2. Set up environment variables in `frontend`, `backend-management` and `backend-redirector`:
   ```bash
   cp sample.env .env
   ```

3. Install dependencies:
   ```bash
   # Install dependencies for all services
   npm install
   cd frontend && npm install
   cd ../backend-management && npm install
   cd ../backend-redirector && npm install
   ```

4. Start the development servers:
   ```bash
   # Start frontend
   cd frontend && npm run dev

   # Start management service
   cd backend-management && npm run dev

   # Start redirector service
   cd backend-redirector && npm run dev
   ```

## Roadmap

1. setup observability stack
2. setup everything in kubernetes



## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
