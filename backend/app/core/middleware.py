from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

from app.core.config import get_settings

settings = get_settings()


class AuthCookieMiddleware(BaseHTTPMiddleware):
    """Middleware to extract JWT token from cookies and add to request headers."""

    def __init__(
        self,
        app: ASGIApp,
    ):
        super().__init__(app)

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Extract JWT from cookie and add to Authorization header."""

        # Get JWT token from cookie if it exists
        access_token_cookie = request.cookies.get("access_token")

        # If token exists in cookie and not in header, add it to header
        # This allows the standard OAuth2 code to work with cookies
        if access_token_cookie and "authorization" not in request.headers:
            # Always add 'Bearer ' prefix to the token from the cookie
            token = access_token_cookie

            # Clone and update headers with the token
            # FastAPI doesn't allow direct header modification
            request._headers = {
                **request._headers,
                "authorization": f"Bearer {token}",
            }

            # Update the request scope with the new headers
            # This is needed for the ASGI middleware to see the changes
            request.scope.update(
                headers=[
                    (k.lower().encode(), v.encode())
                    for k, v in request._headers.items()
                ]
            )

        # Continue processing the request
        return await call_next(request)


class HTTPSRedirectMiddleware(BaseHTTPMiddleware):
    """Middleware to ensure redirects use HTTPS in production environment."""

    def __init__(self, app: ASGIApp):
        super().__init__(app)

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)

        # Only modify redirects in production environment
        if settings.environment == "production" and response.status_code in (
            301,
            302,
            307,
            308,
        ):
            redirect_url = response.headers.get("location")
            if redirect_url and redirect_url.startswith("http://"):
                # Replace http:// with https:// in redirect URL
                https_url = "https://" + redirect_url[7:]
                response.headers["location"] = https_url

        return response
