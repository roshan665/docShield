from backend.app.core.config import Settings


def test_settings_initialization():
    settings = Settings(
        PROJECT_NAME="DocShield Test",
        SUPABASE_URL="https://test.supabase.co",
        SUPABASE_ANON_KEY="test-anon-key",
        ALLOWED_ORIGINS="http://localhost:5173,http://localhost:3000"
    )
    assert settings.PROJECT_NAME == "DocShield Test"
    assert settings.is_supabase_configured is True
    assert "http://localhost:5173" in settings.cors_origins
    assert "http://localhost:3000" in settings.cors_origins


def test_settings_empty_supabase():
    settings = Settings(SUPABASE_URL="", SUPABASE_ANON_KEY="")
    assert settings.is_supabase_configured is False
