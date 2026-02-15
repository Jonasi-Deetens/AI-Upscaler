from pathlib import Path
from typing import BinaryIO

from app.config import settings


class StorageBackend:
    def __init__(self) -> None:
        self.base = Path(settings.local_storage_path)
        self.base.mkdir(parents=True, exist_ok=True)

    def _path(self, key: str) -> Path:
        return self.base / key

    def put(self, key: str, body: BinaryIO) -> None:
        path = self._path(key)
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, "wb") as f:
            f.write(body.read())

    def get_to_file(self, key: str, path: Path) -> None:
        src = self._path(key)
        if not src.exists():
            raise FileNotFoundError(f"Storage key not found: {key}")
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(src.read_bytes())


def get_storage() -> StorageBackend:
    return StorageBackend()
