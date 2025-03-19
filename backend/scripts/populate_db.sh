#!/bin/bash

# Change to the project root directory
cd "$(dirname "$0")/.."

# Activate virtual environment if it exists
if [ -d ".venv" ]; then
    source .venv/bin/activate
fi

# Run the populate_db.py script
python scripts/populate_db.py

# Return status
if [ $? -eq 0 ]; then
    echo "Database population script executed successfully."
else
    echo "Error: Database population script failed."
    exit 1
fi 