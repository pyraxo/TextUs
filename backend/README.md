# TextUs Backend

## Installation

This repository uses [uv](https://astral.sh/uv) to manage Python versions and dependencies. Install it first before proceeding.

Copy `.env.example` to `.env` and fill in the required environmental variables.

```sh
# Add env vars
cp .env.example .env
nano .env

# Run server
uv venv
uv run fastapi dev
```
