# Configure logging formatters
formatters = {
    "default": {
        "()": "uvicorn.logging.DefaultFormatter",
        "fmt": "%(levelprefix)s %(message)s",
        "use_colors": True,
    },
    "access": {
        "()": "uvicorn.logging.AccessFormatter",
        "fmt": '%(levelprefix)s %(client_addr)s - "%(request_line)s" %(status_code)s',
        "use_colors": True,
    },
}

# Configure logging handlers
handlers = {
    "default": {
        "formatter": "default",
        "class": "logging.StreamHandler",
        "stream": "ext://sys.stderr",
    },
    "access": {
        "formatter": "access",
        "class": "logging.StreamHandler",
        "stream": "ext://sys.stdout",
    },
}

# Configure loggers
loggers = {
    "uvicorn": {"handlers": ["default"], "level": "WARNING"},
    "uvicorn.error": {"level": "ERROR"},
    "uvicorn.access": {"handlers": ["access"], "level": "WARNING", "propagate": False},
    "sqlalchemy.engine": {"handlers": ["default"], "level": "WARNING"},
    "sqlalchemy.pool": {"handlers": ["default"], "level": "WARNING"},
    "sqlalchemy.dialects": {"handlers": ["default"], "level": "WARNING"},
    "sqlalchemy.orm": {"handlers": ["default"], "level": "WARNING"},
    "websocket": {"handlers": ["default"], "level": "INFO"},
    # Add app-specific loggers
    "app": {"handlers": ["default"], "level": "INFO"},
}

# Configure the root logger
root = {"handlers": ["default"], "level": "INFO"}

# Configure exception formatting
exception_formatter = {
    "format": "{exception_type}: {exception_value} at line {frame_lineno} in {frame_filename}",
    "max_frames": 3,
}
