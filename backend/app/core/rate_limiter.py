from datetime import datetime, timedelta
from typing import Dict

from fastapi import Request, Response, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

from app.core.config import get_settings

settings = get_settings()


class RateLimiter(BaseHTTPMiddleware):
    """Rate limiting middleware to protect against brute force attacks."""

    def __init__(
        self,
        app: ASGIApp,
        requests_per_minute: int = 5,
        auth_endpoints: tuple = ("/auth/login", "/auth/token", "/auth/register"),
    ):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.auth_endpoints = auth_endpoints
        self._requests: Dict[str, list[datetime]] = {}

    def _clean_old_requests(self, ip: str) -> None:
        """Remove requests older than 1 minute."""
        now = datetime.now()
        self._requests[ip] = [
            req_time
            for req_time in self._requests[ip]
            if now - req_time < timedelta(minutes=1)
        ]

    async def dispatch(self, request: Request, call_next):
        """Handle the rate limiting logic."""
        # Only rate limit auth endpoints
        if request.url.path not in self.auth_endpoints:
            return await call_next(request)

        # Get client IP
        ip = request.client.host if request.client else "unknown"

        # Initialize request list for new IPs
        if ip not in self._requests:
            self._requests[ip] = []

        # Clean old requests
        self._clean_old_requests(ip)

        # Check rate limit
        if len(self._requests[ip]) >= self.requests_per_minute:
            response = Response(
                content='{"detail": "Too many login attempts. Please try again later"}',
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                media_type="application/json",
            )
            # TODO: This is a nasty fix
            response.headers["Access-Control-Allow-Origin"] = settings.allow_origins[0]
            response.headers["Access-Control-Allow-Credentials"] = str(
                settings.allow_credentials
            ).lower()
            response.headers["Access-Control-Allow-Methods"] = ", ".join(
                settings.allow_methods
            )
            response.headers["Access-Control-Allow-Headers"] = ", ".join(
                settings.allow_headers
            )
            return response

        # Add current request
        self._requests[ip].append(datetime.now())

        # Process the request
        return await call_next(request)
