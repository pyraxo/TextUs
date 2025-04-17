# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

Guidelines for maintaining this changelog:

1. Most recent changes should be at the top
2. Each version should be in the format [YYYY-MM-DD]
3. Changes within each version should be categorized as:
   - Added: New features or components
   - Enhanced: Improvements to existing features
   - Fixed: Bug fixes
   - Changed: Changes in existing functionality
   - Deprecated: Soon-to-be removed features
   - Removed: Removed features
4. Keep entries clear and concise
5. Reference relevant issue/PR numbers when applicable

## [2025-04-17]

### Added

- Introduced rubrics management for structured evaluation of trainee sessions
- Added RubricsSettings model and new database migrations
- Implemented new /rubrics/ API endpoints for retrieving and updating rubric settings
- Added trainer feedback mechanism for session reviews
- Enhanced frontend with UI for rubrics management and trainer feedback

### Enhanced

- Updated conversations endpoints and models to support trainer feedback
- Improved evaluation metrics and session review workflow

## [2025-03-31]

### Added

- Implemented Running Customer Scenarios feature:
  - Enhanced scenario start endpoint to initialize multiple concurrent conversations
  - Added automatic chat initialization for all scenario customers
  - Implemented dynamic delay mechanism based on message length and AI personality
  - Added conversation state management with patience levels
  - Added impatient follow-up mechanism for more realistic interactions

### Enhanced

- Updated TraineeService to handle multiple concurrent conversations
- Improved ChatBot workflow with state machine for conversation management
- Enhanced ConversationScheduler to manage multiple active chats
- Added comprehensive documentation for Running Customer Scenarios feature

## [2025-03-30]

### Added

- Implemented scenario customer management features
- Added Customers service and router
- Added Agents management view
- Added conversation scheduler and WebSocket connection management
- Added new chatbot workflow
- Added endpoint to GET customers for scenario_id
- Added testing framework and user service tests

### Enhanced

- Enhanced SchemeDetailPage with dynamic scenario management
- Improved data loading with Skeleton components in Welcome page
- Updated routing to use slugs instead of IDs for practice pages
- Refactored conversation and scheme handling
- Updated WebSocket router to use AsyncSession
- Moved chat history from scenario_customer to chat model
- Added scheme icon picker and updated scheme model
- Updated database connection handling
- Introduced new models

### Fixed

- Fixed header title
- Fixed temperature range to be between 0 and 1
- Fixed sticky header behavior in customer table
- Fixed UUID parsing issues

## [2025-03-27]

### Added

- Added new trainer screens and functionality
  - Trainer dashboard with quick stats and shortcuts
  - Scenario management interface
  - Trainee leaderboard and activity tracking
  - Graph analysis tools
- Added user scenario session models and relationships
- Added new customer scenario temperature configuration
- Enhanced frontend UI components and mobile responsiveness

### Fixed

- Fixed rate limit error handling
- Updated schemes individual pages with improved information display
- Improved sidebar navigation and user interface

### Enhanced

- Updated prompt engineering system
- Integrated RAG (Retrieval-Augmented Generation) to improve response accuracy
- Enhanced backend logic for conversations
- Improved database schema for conversations
- Added support for schemes -> scenario -> chats flow

## [2025-03-26]

### Added

- Added new front page design and implementation

## [2025-03-25]

### Enhanced

- Updated prompt engineering system
- Integrated RAG (Retrieval-Augmented Generation) to improve response accuracy

## [2025-03-20]

### Added

- Implemented chatter bot functionality
- Added prompt engineering control interface
- Implemented rate limiting middleware
- Added user password hashing
- Added basic evaluator system

### Fixed

- Fixed sidebar and type definitions in user-management
- Fixed chat UI issues
- Updated customer info sidebar UI
- Fixed merge conflicts

### Enhanced

- Completed conversation system with WebSocket functionality
- Refactored message handling system
- Updated data models for better efficiency

## [2025-03-19]

### Added

- Implemented user management API with frontend integration
- Added user management functionality
- Enhanced authentication system
- Added scheme management features

### Enhanced

- Refactored admin dashboard
- Refactored conversation management
- Enhanced API integration
- Added customer profile management

## [2025-03-18]

### Added

- Implemented chat and scenario models with database migrations

### Enhanced

- Improved layout and practice page design
- Updated styling and component architecture

## [2025-03-17]

### Added

- Initial evaluator system implementation
- Implemented RAG system
- Redesigned frontend based on Figma specifications

### Enhanced

- Updated project dependencies and linting configuration
- Refactored conversation components
- Updated project documentation
- Updated README

## [2025-03-16]

### Added

- Added Docker configuration and initial project documentation
- Added customer and user models
- Added environment variable configuration (.env.example)

### Changed

- Migrated database from Beanie to SQLModel

## [2025-03-05]

### Enhanced

- Updated user profile system
- Removed placeholder assets
- Modified sidebar navigation categories
- Added conversation page linking

## [2025-03-03]

### Added

- Built initial screens according to Figma wireframes
- Implemented sidebar navigation

## [2025-02-24]

### Added

- Initial frontend project setup
- Initial backend project setup

## [2025-02-20]

### Added

- Initial repository setup
