#!/usr/bin/env python3

import asyncio
import logging
import sys
from pathlib import Path
from typing import Awaitable, Callable, List

# Add the parent directory to Python path so we can import app
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
sys.path.append(str(PROJECT_ROOT))

from init_chroma import init_chroma
from init_customers import init_customers
from init_rubrics import init_rubrics
from init_scenarios import init_scenarios
from init_schemes import init_schemes
from init_users import init_users

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


async def run_initialization() -> None:
    """
    Run all initialization scripts in the correct order:
    1. Users
    2. Schemes
    3. Customers
    4. Scenarios
    """
    initialization_steps: List[tuple[str, Callable[[], Awaitable[None]]]] = [
        ("Chroma", init_chroma),
        ("Users", init_users),
        ("Schemes", init_schemes),
        ("Customers", init_customers),
        ("Scenarios", init_scenarios),
        ("Rubrics", init_rubrics),
    ]

    for step_name, init_func in initialization_steps:
        try:
            logger.info(f"Initializing {step_name}...")
            await init_func()
            logger.info(f"Successfully initialized {step_name}")
        except Exception as e:
            logger.error(f"Error initializing {step_name}: {str(e)}")
            raise

    logger.info("All initialization steps completed successfully!")


if __name__ == "__main__":
    try:
        asyncio.run(run_initialization())
    except Exception as e:
        logger.error(f"Initialization failed: {str(e)}")
        raise
