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

- User authentication and authorization with rate limiting
- Dashboard with performance metrics and trainer-specific views
- Practice sessions with AI-simulated customers using RAG
- Scenario management for administrators
- Performance analytics and reporting
- Customizable customer profiles and scenarios
- Real-time chat with WebSocket support
- Prompt engineering controls for administrators
- Rubrics management for structured trainee evaluation (admin/trainer)
- Structured trainer feedback on sessions

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
- The system shall allow trainers to provide structured feedback using rubrics after each session

#### 3.1.4 Scenario Management

- The system shall allow administrators to create and edit scenarios
- The system shall support assigning customer profiles to scenarios
- The system shall allow customization of system prompts for AI behavior
- The system shall support configuration of scenario parameters (pausable, temperature)
- The system shall support RAG-enhanced responses for improved accuracy
- The system shall provide a trainer interface for scenario management

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

- **User**: Represents system users with authentication details and roles (admin, trainer, trainee)
- **Scheme**: Represents broad CPF-related categories that organize scenarios (e.g., Housing, Healthcare)
  - Includes customizable icons for visual identification
  - Supports slug-based routing for better URL readability
- **Scenario**: Represents specific training situations within a scheme, with configuration settings
- **Customer**: Represents base AI customer profiles with:
  - Basic information (name, description)
  - Personality traits and temperament
  - Communication habits
  - Base profile prompt defining general behavior
  - Managed through dedicated Customers service
- **ScenarioCustomer**: Specialized adaptation of a Customer for a specific Scenario:
  - Inherits base Customer traits
  - Adds scenario-specific prompt building upon base prompt
  - Contains expected queries/concerns for this scenario
  - Configurable temperature (0 to 1) for response variability
- **ChatConversation**: Represents a practice session conversation
  - Includes complete chat history
  - Managed by LangGraph workflow
  - Supports state-based transitions
  - Checkpoint-based resumption
- **ChatMessage**: Represents individual messages in a conversation
  - Linked to conversation state
  - Supports interrupt-based handling
- **WorkflowState**: Represents the current state of a conversation workflow
  - Tracks conversation progress
  - Manages transition conditions
  - Stores checkpoint data

### 4.2 Entity Relationships

#### Hierarchical Organization

- Schemes contain multiple Scenarios
- Scenarios can have multiple ScenarioCustomers
- Each ScenarioCustomer links one Customer to one Scenario

#### Customer Adaptation

- A single Customer can be adapted into multiple ScenarioCustomers
- Each ScenarioCustomer maintains the base Customer traits while adding scenario-specific:
  - Behavioral adaptations through scenario prompts
  - Expected queries and concerns
  - Response characteristics (temperature)

#### Session Management

- ChatConversations belong to specific ScenarioCustomers
- ChatMessages belong to ChatConversations
- Users participate in ChatConversations

#### Administrative

- Users (admin/trainer) create and manage:
  - Schemes
  - Scenarios
  - Customers
  - ScenarioCustomer adaptations

### 4.3 Data Flow

1. **Scenario Creation**:

   - Admin creates a Scheme
   - Admin creates Scenarios within the Scheme
   - Admin creates or selects existing Customers
   - Admin adapts Customers to Scenarios via ScenarioCustomers

2. **Training Flow**:
   - Trainee selects a Scenario
   - System initializes LangGraph workflow with scenario state
   - Workflow manages conversation through state transitions:
     - Message generation and sending
     - User input handling via interrupts
     - Termination condition checking
     - Conversation state persistence
   - All interactions are tracked through ChatConversation and ChatMessages

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
  - Async request handling with AsyncSession support
  - OpenAPI documentation
  - WebSocket support for real-time chat
  - Rate limiting middleware
  - Comprehensive testing framework
- SQLModel for database operations
  - Type-safe database interactions
  - Automatic schema generation
  - User scenario session tracking
  - Enhanced connection handling with connection pooling
- Alembic for database migrations
  - Version-controlled schema changes
  - Automated migration scripts
- Pydantic for data validation
- JWT-based authentication with password hashing
- OpenAI integration for AI chat simulation
- RAG system for improved response accuracy
- LangGraph-based conversation management:
  - State-driven workflow engine
  - Checkpoint-based conversation resumption
  - Interrupt-based message handling
  - Directed graph for conversation flow control
  - Conditional transitions based on conversation state

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

### 6.5 Performance Optimizations

- Skeleton loading components for improved perceived performance
- Optimized database queries with AsyncSession
- Efficient WebSocket connection management
- Slug-based routing for better SEO and URL readability
- Dynamic scenario management with real-time updates
- Temperature-controlled response generation (0 to 1 range)

## 7. Future Enhancements

### 7.1 Planned Features

- Integration with real CPF knowledge base
- Advanced analytics with machine learning
- Team-based competitions and leaderboards
- Mobile application for on-the-go practice
- Integration with learning management systems
- Enhanced prompt engineering capabilities
- Advanced RAG features for context-aware responses

## 8. Appendices

### 8.1 Glossary

- **System Prompt**: Instructions given to the AI to guide its behavior
- **Temperature**: Parameter controlling randomness in AI responses
- **Profile Prompt**: Description of customer personality and background

### 8.2 References

- CPF Board guidelines and policies
- Customer service best practices
