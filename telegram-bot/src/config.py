from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    # Telegram
    bot_token: str
    webhook_url: str = ""
    webhook_secret: str = ""

    # OpenAI
    openai_api_key: str

    # App
    log_level: str = "INFO"
    environment: str = "development"

    # Supabase
    supabase_url: str = ""
    supabase_service_key: str = ""

    # Classification tuning
    buffer_timeout_seconds: int = 300  # 5 minutes
    ai_timeout_seconds: int = 10
    min_confidence_for_ticket: int = 3  # 1-5 scale

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()  # type: ignore[call-arg]
