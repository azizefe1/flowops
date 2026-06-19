from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "FlowOps"
    app_env: str = "development"
    app_debug: bool = True

    secret_key: str = "change_this_secret_key"
    access_token_expire_minutes: int = 60
    algorithm: str = "HS256"

    database_url: str = (
        "postgresql+psycopg://flowops_user:flowops_password@localhost:5432/flowops_db"
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()