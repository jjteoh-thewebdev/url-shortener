`NOTE: This document is AI-generated`

# URL Shortener Frontend

A modern, responsive frontend for the URL shortener application built with Next.js, Tailwind CSS, and TypeScript.

## Features

- 🎨 Modern UI with Tailwind CSS
- 📱 Fully responsive design
- 🔒 Password protection for shortened URLs
- ⚡ Fast page loads with Next.js
- 🧪 Comprehensive test suite with Playwright

## Tech Stack

- **Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Testing**: Playwright
- **UI Components**: shadcn/ui

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn

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

4. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Development

### Running Tests

```bash
# Run Playwright tests
npm run test
```

### Building for Production

```bash
npm run build
```

### Docker Support

Build the Docker image:
```bash
docker build -t url-shortener-frontend .

# or use the docker compose file at project root
```

Run the container:
```bash
docker run -p 3000:3000 url-shortener-frontend

# or use the docker compose file at project root
```

## Project Structure

```
frontend/
├── app/              # Next.js app directory
├── components/       # Reusable UI components
├── lib/             # Utility functions and shared code
├── public/          # Static assets
└── tests/           # E2E tests
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
