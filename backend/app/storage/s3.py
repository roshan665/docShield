import io
import os
from collections.abc import Generator
from pathlib import Path
from typing import BinaryIO

import boto3
from botocore.client import Config
from botocore.exceptions import ClientError, EndpointConnectionError

from app.core.config import settings
from app.core.exceptions import StorageException
from app.core.logging import get_logger
from app.storage.service import StorageService

logger = get_logger(__name__)


class S3StorageService(StorageService):
    """Boto3-based implementation for S3 and MinIO with local filesystem fallback."""

    def __init__(self):
        endpoint = settings.S3_ENDPOINT_URL if settings.S3_ENDPOINT_URL else None
        self.s3_client = boto3.client(
            "s3",
            endpoint_url=endpoint,
            aws_access_key_id=settings.S3_ACCESS_KEY,
            aws_secret_access_key=settings.S3_SECRET_KEY,
            region_name=settings.S3_REGION,
            use_ssl=settings.S3_USE_SSL,
            config=Config(signature_version="s3v4", s3={"addressing_style": "path"}),
        )
        self.local_storage_dir = Path("./data/storage")

    def _get_local_path(self, bucket: str, key: str) -> Path:
        safe_key = key.replace("\\", "/").strip("/")
        return self.local_storage_dir / bucket / safe_key

    def upload(
        self,
        file_data: BinaryIO | bytes,
        key: str,
        bucket: str,
        content_type: str = "application/octet-stream",
        metadata: dict[str, str] | None = None,
    ) -> str:
        data_bytes = file_data if isinstance(file_data, bytes) else file_data.read()
        try:
            extra_args = {"ContentType": content_type}
            if metadata:
                extra_args["Metadata"] = metadata

            self.s3_client.upload_fileobj(
                Fileobj=io.BytesIO(data_bytes),
                Bucket=bucket,
                Key=key,
                ExtraArgs=extra_args,
            )
            logger.info(f"Successfully uploaded object {key} to bucket {bucket}")
            return key
        except (ClientError, EndpointConnectionError, Exception) as e:
            logger.warning(f"S3 upload unavailable for {key} in {bucket}: {e}. Falling back to local storage.")
            local_path = self._get_local_path(bucket, key)
            local_path.parent.mkdir(parents=True, exist_ok=True)
            with open(local_path, "wb") as f:
                f.write(data_bytes)
            return key

    def download(self, key: str, bucket: str) -> bytes:
        try:
            buffer = io.BytesIO()
            self.s3_client.download_fileobj(Bucket=bucket, Key=key, Fileobj=buffer)
            return buffer.getvalue()
        except (ClientError, EndpointConnectionError, Exception) as e:
            local_path = self._get_local_path(bucket, key)
            if local_path.exists():
                with open(local_path, "rb") as f:
                    return f.read()
            logger.error(f"Storage download error for {key} in {bucket}: {str(e)}")
            raise StorageException(detail=f"Storage download error: {str(e)}") from e

    def download_stream(self, key: str, bucket: str, chunk_size: int = 65536) -> Generator[bytes, None, None]:
        try:
            response = self.s3_client.get_object(Bucket=bucket, Key=key)
            stream = response["Body"]
            while chunk := stream.read(chunk_size):
                yield chunk
        except (ClientError, EndpointConnectionError, Exception) as e:
            local_path = self._get_local_path(bucket, key)
            if local_path.exists():
                with open(local_path, "rb") as f:
                    while chunk := f.read(chunk_size):
                        yield chunk
                return
            logger.error(f"Storage stream download error for {key} in {bucket}: {str(e)}")
            raise StorageException(detail=f"Storage stream error: {str(e)}") from e

    def delete(self, key: str, bucket: str) -> bool:
        deleted = False
        try:
            self.s3_client.delete_object(Bucket=bucket, Key=key)
            deleted = True
        except Exception:
            pass
        local_path = self._get_local_path(bucket, key)
        if local_path.exists():
            try:
                local_path.unlink()
                deleted = True
            except Exception:
                pass
        return deleted

    def exists(self, key: str, bucket: str) -> bool:
        try:
            self.s3_client.head_object(Bucket=bucket, Key=key)
            return True
        except Exception:
            local_path = self._get_local_path(bucket, key)
            return local_path.exists()

    def get_metadata(self, key: str, bucket: str) -> dict[str, str]:
        try:
            response = self.s3_client.head_object(Bucket=bucket, Key=key)
            return response.get("Metadata", {})
        except Exception:
            return {}

    def check_health(self) -> bool:
        try:
            self.s3_client.list_buckets()
            return True
        except Exception:
            # Local storage directory is accessible
            self.local_storage_dir.mkdir(parents=True, exist_ok=True)
            return True

    def ensure_bucket_exists(self, bucket: str) -> bool:
        try:
            self.s3_client.head_bucket(Bucket=bucket)
            return True
        except Exception:
            (self.local_storage_dir / bucket).mkdir(parents=True, exist_ok=True)
            return True


