# CPF Board TextUs

A training simulator designed to help CPF Board customer service officers master concepts and improve their customer service skills through AI-powered simulated conversations.

## Overview

TextUs is a comprehensive training platform that enables customer service officers to:

- Practice handling various customer inquiries in a safe, simulated environment
- Receive real-time feedback on performance metrics (comprehension, tone, accuracy)
- Access a variety of scenarios covering different CPF-related topics
- Track progress and improvements over time

## Project Structure

- `frontend/` - Next.js web application with Tailwind CSS
- `backend/` - FastAPI Python server with SQLModel
- `docs/` - Project documentation and changelog

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 18+
- Python 3.11+
- [uv](https://astral.sh/uv) package manager

### Installation

1. Set up environment variables:

```sh
# Backend
cd backend
cp .env.example .env
# Edit .env with your configuration

# Frontend
cd ../frontend
cp .env.example .env
# Edit .env with your configuration
```

2. Start the development environment:

```sh
docker-compose up -d
```

The application will be available at:

- Frontend: <http://localhost:3000>
- Backend API: <http://localhost:8000>
- API Documentation: <http://localhost:8000/docs>

## Development

### Backend Development

See [backend/README.md](./backend/README.md) for detailed backend setup and development instructions.

### Frontend Development

See [frontend/README.md](./frontend/README.md) for detailed frontend setup and development instructions.

## Documentation

- [Product Requirements Document](./docs/prd.md)
- [Changelog](./docs/changelog.md)

## Features

- User authentication and role management
- Interactive practice sessions with AI-simulated customers
- Real-time performance metrics and feedback
- Customizable scenarios and customer profiles
- Comprehensive analytics and reporting
- Responsive web interface

## Contributing

1. Create a feature branch (`git checkout -b feature/new-feature`)
2. Commit your changes (`git commit -m 'Add new feature'`)
3. Push to the branch (`git push origin feature/new-feature`)
4. Open a Pull Request
