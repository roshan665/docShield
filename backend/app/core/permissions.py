from enum import Enum
from typing import List


class Role(str, Enum):
    ADMIN = "admin"
    INSPECTOR = "inspector"
    LEGAL_OFFICER = "legal_officer"
    FORENSIC_OFFICER = "forensic_officer"


# Statutory rank display names according to DocShield Police System
ROLE_DISPLAY_NAMES = {
    Role.ADMIN: "System Administrator",
    Role.INSPECTOR: "Police Inspector",
    Role.LEGAL_OFFICER: "Public Prosecutor / Legal Officer",
    Role.FORENSIC_OFFICER: "Forensic Science Lab Examiner"
}


def normalize_role(role_str: str) -> Role:
    """
    Normalizes a role string to a valid DocShield Role enum.
    Raises ValueError if role is invalid.
    """
    if not role_str:
        raise ValueError("Role cannot be empty")
    cleaned = role_str.strip().lower()
    for role in Role:
        if role.value == cleaned:
            return role
    raise ValueError(f"Unknown or unauthorized role: '{role_str}'")
