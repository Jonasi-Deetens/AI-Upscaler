from abc import ABC, abstractmethod
from pathlib import Path
from typing import BinaryIO

import boto3
from botocore.config import Config as BotoConfig

from app.core.config import settings


def _s3_client():
    """Single place for boto3 S3 client from settings."""
    kwargs = {
        "region_name": settings.s3_region,
        "config": BotoConfig(signature_version="s3v4"),
    }
    if settings.s3_endpoint_url:
        kwargs["endpoint_url"] = settings.s3_endpoint_url
    if settings.s3_access_key and settings.s3_secret_key:
        kwargs["aws_access_key_id"] = settings.s3_access_key
        kwargs["aws_secret_access_key"] = settings.s3_secret_key
    return boto3.client("s3", **kwargs)


class StorageBackend(ABC):
    @abstractmethod
    def put(self, key: str, body: BinaryIO, content_type: str | None = None) -> None:
        """Store object at key. key is e.g. originals/{job_id} or results/{job_id}."""
        ...

    @abstractmethod
    def get_url(self, key: str, expires_in: int = 3600) -> str:
        """Return URL to read the object (or path for local)."""
        ...

    @abstractmethod
    def delete(self, key: str) -> None:
        """Delete object at key."""
        ...

    @abstractmethod
    def get_to_file(self, key: str, path: Path) -> None:
        """Download object to local file (for worker)."""
        ...


class LocalStorageBackend(StorageBackend):
    def __init__(self, base_path: str | None = None) -> None:
        self.base = Path(base_path or settings.local_storage_path)
        self.base.mkdir(parents=True, exist_ok=True)

    def _path(self, key: str) -> Path:
        return self.base / key

    def put(self, key: str, body: BinaryIO, content_type: str | None = None) -> None:
        path = self._path(key)
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, "wb") as f:
            f.write(body.read())

    def get_url(self, key: str, expires_in: int = 3600) -> str:
        return str(self._path(key))

    def delete(self, key: str) -> None:
        path = self._path(key)
        if path.exists():
            path.unlink()

    def get_to_file(self, key: str, path: Path) -> None:
        src = self._path(key)
        if not src.exists():
            raise FileNotFoundError(f"Storage key not found: {key}")
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(src.read_bytes())


class S3StorageBackend(StorageBackend):
    """S3 (or MinIO) backend: put, get_url (presigned), delete, get_to_file."""

    def __init__(self) -> None:
        self._client = _s3_client()
        self._bucket = settings.s3_bucket

    def put(self, key: str, body: BinaryIO, content_type: str | None = None) -> None:
        extra = {"ContentType": content_type} if content_type else {}
        self._client.upload_fileobj(body, self._bucket, key, ExtraArgs=extra)

    def get_url(self, key: str, expires_in: int = 3600) -> str:
        return self._client.generate_presigned_url(
            "get_object",
            Params={"Bucket": self._bucket, "Key": key},
            ExpiresIn=expires_in,
        )

    def delete(self, key: str) -> None:
        self._client.delete_object(Bucket=self._bucket, Key=key)

    def get_to_file(self, key: str, path: Path) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        self._client.download_file(self._bucket, key, str(path))


def get_storage() -> StorageBackend:
    if settings.use_local_storage:
        return LocalStorageBackend()
    return S3StorageBackend()
