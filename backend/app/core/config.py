from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "MyBusiness CRM API"
    api_v1_prefix: str = "/api/v1"
    database_url: str = "postgresql+psycopg://crm_user:change_me@localhost:5432/mybusiness_crm"
    sql_echo: bool = False

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
