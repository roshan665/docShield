import hashlib
import hmac
import re
from typing import BinaryIO, Union

# Regex for standard 64-character lowercase or uppercase SHA-256 hexadecimal string
SHA256_REGEX = re.compile(r"^[a-fA-F0-9]{64}$")


def is_valid_sha256_hash(hash_str: str) -> bool:
    """
    Validates whether a given string is a valid 64-character hexadecimal SHA-256 digest.
    """
    if not hash_str or not isinstance(hash_str, str):
        return False
    return bool(SHA256_REGEX.match(hash_str.strip()))


def calculate_sha256(data: Union[bytes, BinaryIO], chunk_size: int = 65536) -> str:
    """
    Computes an authoritative SHA-256 hexadecimal digest from raw bytes or a binary stream.
    Uses chunked streaming to prevent memory spikes on large forensic files (video/audio).
    """
    hasher = hashlib.sha256()

    if isinstance(data, (bytes, bytearray)):
        hasher.update(data)
    elif hasattr(data, "read"):
        while chunk := data.read(chunk_size):
            hasher.update(chunk)
    else:
        raise TypeError("Data must be bytes or a file-like binary stream.")

    return hasher.hexdigest().lower()


def verify_sha256(data: Union[bytes, BinaryIO], expected_hash: str) -> bool:
    """
    Recalculates SHA-256 on actual file bytes and compares with expected hash
    using constant-time hmac.compare_digest to prevent timing attacks.
    """
    if not is_valid_sha256_hash(expected_hash):
        return False

    calculated = calculate_sha256(data)
    return hmac.compare_digest(calculated, expected_hash.strip().lower())


def sanitize_filename(filename: str) -> str:
    """
    Sanitizes filename to prevent directory traversal or invalid storage keys.
    Extracts base filename, removes path separators, and replaces sequences of dots.
    """
    if not filename:
        return "evidence.bin"
    # Normalize path separators and take only basename
    base = filename.replace("\\", "/").split("/")[-1]
    clean = re.sub(r"[^a-zA-Z0-9._-]", "_", base)
    while ".." in clean:
        clean = clean.replace("..", "_")
    clean = clean.strip("._")
    return clean or "file.bin"


def generate_evidence_storage_path(
    case_id: str,
    evidence_id: str,
    version_number: int,
    filename: str
) -> str:
    """
    Generates a deterministic, case-safe storage path for an evidence version snapshot.
    Pattern: cases/{case_id}/evidence/{evidence_id}/v{version_number}/{safe_filename}
    """
    safe_case = re.sub(r"[^a-zA-Z0-9_-]", "_", str(case_id)).strip("_") or "unassigned_case"
    safe_ev = re.sub(r"[^a-zA-Z0-9_-]", "_", str(evidence_id)).strip("_") or "unassigned_ev"
    safe_file = sanitize_filename(filename)
    return f"cases/{safe_case}/evidence/{safe_ev}/v{max(1, version_number)}/{safe_file}"


def generate_document_storage_path(
    case_id: str,
    document_id: str,
    version_number: int,
    filename: str
) -> str:
    """
    Generates a deterministic, case-safe storage path for a document version snapshot.
    Pattern: cases/{case_id}/documents/{document_id}/v{version_number}/{safe_filename}
    """
    safe_case = re.sub(r"[^a-zA-Z0-9_-]", "_", str(case_id)).strip("_") or "unassigned_case"
    safe_doc = re.sub(r"[^a-zA-Z0-9_-]", "_", str(document_id)).strip("_") or "unassigned_doc"
    safe_file = sanitize_filename(filename)
    return f"cases/{safe_case}/documents/{safe_doc}/v{max(1, version_number)}/{safe_file}"
