# CPF Board TextUs - Product Requirements Document (PRD)

## 1. Introduction

### 1.1 Purpose

The CPF Board TextUs application is a training simulator designed to help customer service officers master concepts relevant to providing accurate and efficient responses to customer inquiries about the Central Provident Fund (CPF) in Singapore.

### 1.2 Scope

This document outlines the requirements for the CPF Board TextUs application, which includes a training platform for customer service officers to practice handling various customer scenarios through simulated conversations.

### 1.3 Definitions and Acronyms

- **CPF**: Central Provident Fund, Singapore's social security system
- **CSO**: Customer Service Officer
- **AI**: Artificial Intelligence

## 2. Product Overview

### 2.1 Product Perspective

The CPF Board TextUs application is a standalone training system that simulates customer interactions to help CSOs improve their skills in handling customer inquiries. The system uses AI to simulate customer behavior based on predefined scenarios.

### 2.2 Product Features

- User authentication and authorization
- Dashboard with performance metrics
- Practice sessions with AI-simulated customers
- Scenario management for administrators
- Performance analytics and reporting
- Customizable customer profiles and scenarios

### 2.3 User Classes and Characteristics

1. **Trainees (CSOs)**: Primary users who will practice handling customer inquiries
2. **Administrators**: Users who manage scenarios, customer profiles, and monitor performance
3. **Managers**: Users who review performance metrics and reports

## 3. System Requirements

### 3.1 Functional Requirements

#### 3.1.1 User Authentication and Management

- The system shall provide secure login functionality
- The system shall support user role management (trainee, admin, manager)
- The system shall maintain user profiles and performance history

#### 3.1.2 Dashboard

- The system shall display performance metrics (comprehension, tone, accuracy)
- The system shall show recommended practice sessions based on performance
- The system shall provide quick access to start new practice sessions

#### 3.1.3 Practice Sessions

- The system shall allow users to select from available scenarios
- The system shall simulate customer interactions using AI
- The system shall support real-time chat with simulated customers
- The system shall allow pausing and resuming practice sessions (when configured)
- The system shall provide feedback on user performance after each session

#### 3.1.4 Scenario Management

- The system shall allow administrators to create and edit scenarios
- The system shall support assigning customer profiles to scenarios
- The system shall allow customization of system prompts for AI behavior
- The system shall support configuration of scenario parameters (pausable, temperature)

#### 3.1.5 Customer Profile Management

- The system shall allow creation and editing of customer profiles
- The system shall support detailed customer descriptions and profile prompts
- The system shall maintain a history of customer profile changes

#### 3.1.6 Analytics and Reporting

- The system shall track and store conversation history
- The system shall analyze user performance across multiple dimensions
- The system shall generate reports on individual and team performance

### 3.2 Non-Functional Requirements

#### 3.2.1 Performance

- The system shall support concurrent users with minimal latency
- Chat responses shall be generated within 2 seconds

#### 3.2.2 Security

- All user data shall be securely stored and encrypted
- Authentication shall use industry-standard security practices

#### 3.2.3 Usability

- The interface shall be intuitive and responsive
- The system shall be accessible on desktop and mobile devices

#### 3.2.4 Reliability

- The system shall be available 99.9% of the time
- Data backups shall be performed regularly

## 4. Data Model

### 4.1 Core Entities

- **User**: Represents system users with authentication details and roles
- **Customer**: Represents AI customer profiles with descriptions and prompts
- **Scenario**: Represents practice scenarios with configuration settings
- **CustomerScenario**: Links customers to scenarios with specific settings
- **ChatConversation**: Represents a practice session conversation
- **ChatMessage**: Represents individual messages in a conversation

### 4.2 Entity Relationships

- Users create and manage Customers and Scenarios
- Scenarios contain multiple CustomerScenarios
- CustomerScenarios link Customers to Scenarios
- ChatConversations belong to specific Scenarios
- ChatMessages belong to ChatConversations

## 5. User Interface

### 5.1 General Layout

- Modern, clean interface with responsive design
- Navigation sidebar for main sections
- Header with user information and quick actions

### 5.2 Key Screens

- Login screen
- Dashboard with performance metrics
- Practice session selection screen
- Chat interface for practice sessions
- Scenario management interface
- Customer profile management interface
- Analytics and reporting screens

## 6. Technical Architecture

### 6.1 Frontend

- Next.js React framework (v14+)
  - Server-side rendering for improved performance
  - API routes for backend communication
  - Static site generation for documentation
- Tailwind CSS for styling
  - Custom theme configuration
  - Responsive design system
  - Dark mode support
- Component-based architecture
  - Reusable UI components
  - Custom hooks for shared logic
  - State management with React Context
- TypeScript for type safety
- Jest and React Testing Library for unit tests
- Cypress for end-to-end testing

### 6.2 Backend

- FastAPI Python framework (v0.100+)
  - Async request handling
  - OpenAPI documentation
  - WebSocket support for real-time chat
- SQLModel for database operations
  - Type-safe database interactions
  - Automatic schema generation
- Alembic for database migrations
  - Version-controlled schema changes
  - Automated migration scripts
- Pydantic for data validation
- JWT-based authentication
- OpenAI integration for AI chat simulation

### 6.3 Database

- SQLite for development
  - Simple setup and iteration
  - No additional services required
- PostgreSQL for production
  - High performance and reliability
  - Full-text search capabilities
  - Connection pooling
  - Automated backups
- Redis for caching and session management
  - Rate limiting
  - WebSocket state management
  - Temporary data storage

### 6.4 Deployment

- Docker containers
  - Multi-stage builds for optimization
  - Environment-specific configurations
- Docker Compose for local development
  - Service orchestration
  - Development utilities (pgAdmin, Redis Commander)
- Cloud deployment for production
  - Kubernetes orchestration
  - Automated scaling
  - Load balancing
  - SSL/TLS encryption
  - CDN integration
- CI/CD pipeline
  - Automated testing
  - Code quality checks
  - Security scanning
  - Deployment automation

### 6.5 Monitoring and Logging

- Application monitoring
  - Performance metrics
  - Error tracking
  - User analytics
- Centralized logging
  - Structured log format
  - Log aggregation
  - Search and analysis
- Health checks
  - Service availability
  - Database connectivity
  - External API status

## 7. Future Enhancements

### 7.1 Planned Features

- Integration with real CPF knowledge base
- Advanced analytics with machine learning
- Team-based competitions and leaderboards
- Mobile application for on-the-go practice
- Integration with learning management systems

## 8. Appendices

### 8.1 Glossary

- **System Prompt**: Instructions given to the AI to guide its behavior
- **Temperature**: Parameter controlling randomness in AI responses
- **Profile Prompt**: Description of customer personality and background

### 8.2 References

- CPF Board guidelines and policies
- Customer service best practices
