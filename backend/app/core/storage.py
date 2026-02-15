from abc import ABC, abstractmethod
from pathlib import Path
from typing import BinaryIO

from app.core.config import settings


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


def get_storage() -> StorageBackend:
    if settings.use_local_storage:
        return LocalStorageBackend()
    # S3 implementation can be added later
    return LocalStorageBackend()
