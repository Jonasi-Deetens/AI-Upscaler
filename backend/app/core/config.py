from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str = "postgresql://upscaler:upscaler_secret@localhost:5432/upscaler"
    redis_url: str = "redis://localhost:6379/0"
    celery_broker_url: str = "redis://localhost:6379/0"

    use_local_storage: bool = True
    local_storage_path: str = "./storage"
    s3_bucket: str = "upscaler"
    s3_endpoint_url: str | None = None
    s3_access_key: str | None = None
    s3_secret_key: str | None = None
    s3_region: str = "us-east-1"

    job_expiry_minutes: int = 60
    max_files_per_batch: int = 10
    max_mb_per_file: int = 50
    max_megapixels: int = 16

    admin_api_key: str | None = None


settings = Settings()
