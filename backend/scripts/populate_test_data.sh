#!/bin/bash

# Exit on error
set -e

# Get the directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Change to the backend directory
cd "$DIR/.."

echo "Creating schemes..."
python3 scripts/populate_schemes.py

echo "Creating scenarios..."
python3 scripts/populate_scenarios.py

echo "Done! Test data has been populated." 