from typing import Optional
from supabase import create_client, Client, ClientOptions
from backend.app.core.config import settings
from backend.app.utils.errors import InternalServerException, AppException


def get_supabase_client() -> Client:
    """
    Returns a standard Supabase client using public URL and publishable anon key.
    Safe for public operations and identity token verification.
    """
    if not settings.is_supabase_configured:
        raise AppException(
            status_code=500,
            code="CONFIG_ERROR",
            message="Supabase is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY in environment."
        )
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)


def get_authenticated_supabase_client(token: str) -> Client:
    """
    Returns a Supabase client that forwards the user's Bearer JWT.
    This guarantees that PostgreSQL Row-Level Security (RLS) policies
    are enforced based on the caller's auth.uid().
    """
    if not settings.is_supabase_configured:
        raise AppException(
            status_code=500,
            code="CONFIG_ERROR",
            message="Supabase is not configured."
        )
    options = ClientOptions(
        headers={"Authorization": f"Bearer {token}"},
        persist_session=False,
        auto_refresh_token=False
    )
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY, options=options)


def get_admin_supabase_client() -> Optional[Client]:
    """
    Returns an administrative Supabase client using the service-role key.
    STRICTLY SERVER-SIDE: Never expose this client or its credentials to the frontend.
    Only used for automated background tasks, raw byte integrity checks, or system logging.
    """
    if not settings.SUPABASE_SERVICE_ROLE_KEY:
        return None
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
