# Feature Documentation: Running Customer Scenarios

## 1. Overview

This document details the implementation of the "Running Customer Scenarios" feature in the CPF Board TextUs application. The goal of this feature is to simulate a realistic training environment where a Customer Service Officer (Trainee) interacts with multiple AI-driven "Scenario Customers" concurrently within a single training scenario. Each Scenario Customer represents a unique persona with specific queries or issues related to the scenario's topic.

## 2. User Flow

1. **Scenario Start:** The Trainee initiates a training scenario.
2. **Customer Loading:** The system loads all `ScenarioCustomer` profiles associated with the selected `Scenario`.
3. **Initial Contact:** Each loaded `ScenarioCustomer` proactively sends an initial message to the Trainee, starting concurrent conversations.
4. **AI Waiting & Response:**
   - Each `ScenarioCustomer` AI operates independently. After sending a message, it calculates a dynamic delay (between 3 and 300 seconds) based on its persona's `patience_level` and the length of previous messages.
   - The `ConversationScheduler` manages these delays.
5. **Trainee Interaction:** The Trainee responds to the different Scenario Customers in the chat interface.
6. **AI Processing:** When a `ScenarioCustomer`'s wait time expires, or if it becomes "impatient" (based on `patience_level`), the `ConversationScheduler` triggers the `ChatBot` to process the conversation:
   - It reads the recent chat history, including the Trainee's responses.
   - It uses its underlying LLM (potentially augmented with RAG via `read_from_rag_db()`) to understand the context.
   - It evaluates whether its specific queries (`expected_queries`) have been adequately addressed by the Trainee (`evaluate_query_progress`).
7. **Continuation or End:**
   - **Continue:** If queries remain unanswered, the AI generates a relevant response, calculates a new delay, and the conversation continues.
   - **End:** If all its specific queries are resolved and a minimum interaction threshold is met, the AI determines the chat can end for that specific `ScenarioCustomer`. The conversation state is marked as `END`.
8. **Scenario Completion:** The overall scenario might conclude when all `ScenarioCustomer` conversations within it have reached the `END` state, or based on other scenario-specific criteria.

## 3. Technical Implementation

The feature relies on the interplay between the `ConversationScheduler` and the `ChatBot` state machine.

### 3.1 Core Components

- **`ChatBot` (`backend/app/chatter/bot.py`):**
  - Manages the logic for individual AI customer conversations using a `langgraph.StateGraph`.
  - Defines and manages the `State` for each conversation.
  - Generates AI responses, calculates delays, handles impatience, and evaluates query completion.
- **`ConversationScheduler` (`backend/app/chatter/scheduler.py`):**
  - Manages all active `ChatConversation` instances across the application.
  - Runs a background loop (`_scheduler_loop`) checking periodically if any conversation's `next_response_time` has been reached.
  - Loads conversation state from and persists state to the database.
  - Triggers the `ChatBot` workflow (`_process_conversation`) for conversations ready to proceed.
  - Handles broadcasting AI messages to the frontend via WebSockets (`_broadcast_ai_message`).
- **`StateGraph` (`langgraph`):**
  - Provides the state machine framework used by `ChatBot`.

### 3.2 Workflow (`ChatBot.build_workflow`)

- **Nodes:**
  - `START`: Entry point.
  - `customer` (`ChatBot.customer_node`): The core node handling all logic: processing user input (via events), generating follow-ups, generating main responses, calculating delays, and evaluating end conditions.
- **Edges:**
  - `START` -> `customer`
  - `customer` -> `customer` (Conditional: based on `ChatStatus.CONTINUE`)
  - `customer` -> `END` (Conditional: based on `ChatStatus.WAITING` or `ChatStatus.END`)
- **Routing (`ChatBot.route_customer`):** Directs the flow based on the `status` field in the `State`. `WAITING` and `END` terminate the current graph run, signaling the `ConversationScheduler`.

### 3.3 Conversation State (`State` TypedDict in `bot.py`)

- Holds the complete context for a single AI-Trainee conversation.
- **Key Fields:**
  - `messages`: Sequence of `langchain_core.messages.BaseMessage` (System, Human, AI).
  - `scenario_customer`: The `ScenarioCustomer` model instance defining the AI's persona, prompts, and queries.
  - `conversation_id`: UUID linking to the `ChatConversation` DB record.
  - `last_message_time`, `last_user_message_time`: Timestamps for tracking interaction timing.
  - `next_response_time`: Crucial timestamp indicating when the `ConversationScheduler` should wake this conversation for the AI to potentially respond.
  - `unanswered_queries`: List of strings the AI aims to have addressed.
  - `patience_level`: Float (0.0-1.0) influencing delay calculation and impatience logic. Lower values mean more impatience.
  - `follow_up_sent`: Boolean flag for impatience logic.
  - `status`: `ChatStatus` Enum indicating the outcome of the `customer_node` execution (CONTINUE, WAITING, END).

### 3.4 Delay Mechanism

- **Calculation:** `ChatBot.calculate_delay` and `ChatBot.calculate_next_response_time` determine the wait duration. Factors include:
  - Length of the last message(s).
  - The AI's `patience_level`.
  - Random variation.
- **Scheduling:** The calculated delay determines the `next_response_time` timestamp stored in the `State`.
- **Execution:** The `ConversationScheduler` compares `time.time()` with `next_response_time` in its loop. If `time.time() >= next_response_time`, it processes the conversation.
- **Impatience:** `ChatBot.should_send_impatient_followup` checks if too much time has passed since the _Trainee's_ last message, based on `patience_level`. If true, it can trigger an AI follow-up message even before `next_response_time` is reached.

### 3.5 Query Evaluation & Ending Condition

- **Function:** `ChatBot.evaluate_query_progress` is called after an AI generates a response.
- **Process:**
  - Uses `instructor` and `gpt-4o-mini` to analyze the recent conversation history (`messages`) against the `unanswered_queries` list in the `State`.
  - The LLM determines which queries remain unanswered.
- **End Condition:** The conversation for a specific `ScenarioCustomer` transitions to `ChatStatus.END` if:
  1. The evaluation returns `all_answered: True`.
  2. The conversation has met a minimum length (`len(messages) >= MESSAGE_COUNT_THRESHOLD`).

### 3.6 RAG Integration

- While specific tool calls like `read_from_rag_db()` are not explicitly shown in the `ChatBot`'s core workflow logic provided, it's anticipated that the LLM calls (`llm.invoke`) within `customer_node` leverage the RAG system configured elsewhere to generate contextually accurate and relevant responses based on the CPF knowledge base.

### 3.7 Asynchronous Processing

- The entire workflow heavily relies on `asyncio` to manage multiple concurrent conversations efficiently, handle delays without blocking, and interact with asynchronous libraries (like `AsyncOpenAI`, `AsyncSession`).

## 4. Relevant Files

- `backend/app/chatter/bot.py`: Contains the `ChatBot` class, state definition, workflow logic, and helper functions for delays and evaluation.
- `backend/app/chatter/scheduler.py`: Contains the `ConversationScheduler` class responsible for managing active conversations, timing, persistence, and triggering the bot.
