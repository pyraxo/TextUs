#!/bin/bash

# Change to backend directory
cd "$(dirname "$0")/.." || exit

# Activate virtual environment if it exists
if [ -d ".venv" ]; then
    source .venv/bin/activate
fi

# Run the Python script
python scripts/create_admin.py

# Deactivate virtual environment if activated
if [ -n "$VIRTUAL_ENV" ]; then
    deactivate
fi 