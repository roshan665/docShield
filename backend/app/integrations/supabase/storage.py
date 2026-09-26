from typing import Optional, Dict, Any
from backend.app.integrations.supabase.client import get_supabase_client, get_admin_supabase_client
from backend.app.utils.errors import AppException, NotFoundException


class StorageIntegration:
    """
    Encapsulated abstraction layer for Supabase Storage operations.
    Keeps bucket names, signed URL generation, and file streaming centralized.
    """

    ALLOWED_BUCKETS = {
        "case-documents",
        "evidence-vault",
        "forensic-reports",
        "court-filings"
    }

    def __init__(self, client=None):
        self._client = client

    def _get_client(self):
        if self._client:
            return self._client
        # Prefer admin client if available for storage streaming, else fallback to standard client
        admin = get_admin_supabase_client()
        return admin if admin is not None else get_supabase_client()

    def _validate_bucket(self, bucket: str) -> str:
        if bucket not in self.ALLOWED_BUCKETS:
            raise AppException(
                status_code=400,
                code="INVALID_BUCKET",
                message=f"Storage bucket '{bucket}' is not permitted in DocShield security policy."
            )
        return bucket

    def create_signed_url(self, bucket: str, path: str, expires_in: int = 60) -> str:
        """
        Issues a short-lived cryptographically signed URL for authorized access to private files.
        Default expiration is 60 seconds.
        """
        self._validate_bucket(bucket)
        client = self._get_client()
        try:
            res = client.storage.from_(bucket).create_signed_url(path, expires_in)
            if isinstance(res, dict) and "signedURL" in res:
                return res["signedURL"]
            elif hasattr(res, "signed_url"):
                return res.signed_url
            elif isinstance(res, dict) and "signedUrl" in res:
                return res["signedUrl"]
            return str(res)
        except Exception as e:
            raise AppException(
                status_code=500,
                code="STORAGE_ERROR",
                message=f"Failed to generate secure signed URL: {str(e)}"
            )

    def download_file_bytes(self, bucket: str, path: str) -> bytes:
        """
        Downloads raw bytes of a private file from storage.
        Essential for server-side cryptographic SHA-256 byte hashing and verification.
        """
        self._validate_bucket(bucket)
        client = self._get_client()
        try:
            return client.storage.from_(bucket).download(path)
        except Exception as e:
            raise NotFoundException(
                message=f"File at '{path}' not found in bucket '{bucket}' or download failed: {str(e)}"
            )

    def upload_file_bytes(
        self,
        bucket: str,
        path: str,
        file_bytes: bytes,
        content_type: str = "application/pdf"
    ) -> Dict[str, Any]:
        """
        Uploads raw file bytes to a private Supabase Storage bucket.
        """
        self._validate_bucket(bucket)
        client = self._get_client()
        try:
            res = client.storage.from_(bucket).upload(
                path=path,
                file=file_bytes,
                file_options={"content-type": content_type, "cache-control": "3600", "upsert": "false"}
            )
            return {"bucket": bucket, "path": path, "response": res}
        except Exception as e:
            raise AppException(
                status_code=500,
                code="STORAGE_UPLOAD_ERROR",
                message=f"Failed to upload file to storage bucket '{bucket}': {str(e)}"
            )


    def delete_file(self, bucket: str, path: str) -> bool:
        """
        Deletes a file from storage. Used for transactional rollback/compensation
        when database operations fail after file upload.
        """
        self._validate_bucket(bucket)
        client = self._get_client()
        try:
            client.storage.from_(bucket).remove([path])
            return True
        except Exception:
            return False


storage_integration = StorageIntegration()
SupabaseStorageClient = StorageIntegration
