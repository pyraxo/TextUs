__all__ = [
    "admin_router",
    "auth_router",
    "conversations_router",
    "customers_router",
    "scenarios_router",
    "schemes_router",
    "trainees_router",
    "users_router",
    "ws_router",
]

from .admin import router as admin_router
from .auth import router as auth_router
from .conversations import router as conversations_router
from .customers import router as customers_router
from .scenarios import router as scenarios_router
from .schemes import router as schemes_router
from .trainees import router as trainees_router
from .users import router as users_router
from .ws import router as ws_router
