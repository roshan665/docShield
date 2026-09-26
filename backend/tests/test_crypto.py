import io
from backend.app.core.crypto import (
    calculate_sha256,
    verify_sha256,
    is_valid_sha256_hash,
    generate_evidence_storage_path,
    generate_document_storage_path,
    sanitize_filename
)


def test_sha256_known_empty_vector():
    """Known test vector: SHA-256 of empty bytes must equal standard digest."""
    empty_bytes = b""
    expected = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    assert calculate_sha256(empty_bytes) == expected


def test_sha256_streaming_calculation():
    """Streaming binary calculation must match in-memory bytes digest."""
    content = b"DocShield Forensic Evidence Byte Stream Sample 2024"
    stream = io.BytesIO(content)
    assert calculate_sha256(stream) == calculate_sha256(content)


def test_sha256_verification_match():
    """Matching byte content must verify as True."""
    content = b"Case Exhibit #2024-1768 Bullet Shell Casing"
    computed = calculate_sha256(content)
    assert verify_sha256(content, computed) is True


def test_sha256_tamper_detection():
    """Single bit modification in file bytes must immediately fail verification."""
    original = b"Authentic Panchnama Memo Exhibit 1"
    tampered = b"Authentic Panchnama Memo Exhibit 2"  # Tampered bit
    original_hash = calculate_sha256(original)

    assert verify_sha256(tampered, original_hash) is False


def test_is_valid_sha256_hash():
    """Test standard 64-character hexadecimal format validation."""
    valid_hash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    assert is_valid_sha256_hash(valid_hash) is True
    assert is_valid_sha256_hash(valid_hash.upper()) is True

    # Invalid cases
    assert is_valid_sha256_hash("") is False
    assert is_valid_sha256_hash("e3b0c44") is False  # Too short
    assert is_valid_sha256_hash(valid_hash + "a") is False  # Too long
    assert is_valid_sha256_hash("zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz") is False  # Non-hex
    assert is_valid_sha256_hash(None) is False


def test_deterministic_evidence_storage_path():
    """Storage paths must be safe, deterministic, and conform to the versioning specification."""
    path = generate_evidence_storage_path(
        case_id="case-101",
        evidence_id="ev-99",
        version_number=2,
        filename="cctv footage.mp4"
    )
    assert path == "cases/case-101/evidence/ev-99/v2/cctv_footage.mp4"


def test_sanitize_filename():
    """Dangerous path traversal characters must be sanitized."""
    bad_filename = "../../etc/passwd.jpg"
    clean = sanitize_filename(bad_filename)
    assert ".." not in clean
    assert "/" not in clean
    assert "\\" not in clean
