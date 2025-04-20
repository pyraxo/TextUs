#!/usr/bin/env python3

import os
import sys
from pathlib import Path

import nltk

# Add the parent directory to Python path so we can import app
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
sys.path.append(str(PROJECT_ROOT))

from app.services.chroma_db import DB_PATH, load_fixed_csv_to_chroma


async def init_chroma():
    nltk.download("punkt_tab")
    if not os.path.exists(DB_PATH):
        # TODO: Move this to a startup script / background task
        load_fixed_csv_to_chroma()
