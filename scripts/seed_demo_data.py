"""
Comprehensive Multi-Role Demo Data Seeder for DocShield
Conforms to Bharatiya Sakshya Adhiniyam (BSA) 2023, IT Act 2000, and BNS 2023 standards.
Populates realistic data for all 5 roles:
  1. System Administrator (admin@ncrb.gov.in)
  2. Investigating Officer (officer@ncrb.gov.in)
  3. Forensic Expert (forensic@ncrb.gov.in)
  4. Legal Officer / Prosecutor (prosecutor@ncrb.gov.in & legal@ncrb.gov.in)
  5. Supervisory Officer / SP (supervisor@ncrb.gov.in)
"""

import asyncio
import hashlib
import json
import sys
import uuid
from datetime import UTC, datetime, timedelta
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

from sqlalchemy import delete, select, text
from app.core.database import AsyncSessionLocal, engine
from app.core.security import hash_password
from app.models.ai import DocumentEmbedding, DocumentMetadata, ExtractedEntity
from app.models.audit import AuditEvent
from app.models.auth import Permission, Role, RolePermission, SecurityEvent, User
from app.models.base import Base
from app.models.case import Case, CaseMember
from app.models.custody import EvidenceCustodyEvent
from app.models.document import Document, DocumentVersion
from app.models.evidence import Evidence
from app.models.export import CaseExport
from app.modules.audit.service import AuditService, GENESIS_PREVIOUS_HASH
from app.modules.evidence.custody_chain import (
    GENESIS_HASH,
    canonicalize_custody_event,
    compute_custody_event_hash,
)

# 1. System Roles definition
ROLES_DATA = [
    {
        "name": "investigator",
        "display_name": "Investigating Officer",
        "description": "Lead and investigating officers responsible for case investigation and evidence collection.",
        "is_system_role": True,
    },
    {
        "name": "forensic_expert",
        "display_name": "Forensic Expert / Analyst",
        "description": "Forensic lab personnel analyzing physical and digital evidence and generating reports.",
        "is_system_role": True,
    },
    {
        "name": "legal_officer",
        "display_name": "Legal Officer / Prosecutor",
        "description": "Public prosecutors and legal counsels preparing court filings and legal packages.",
        "is_system_role": True,
    },
    {
        "name": "supervisor",
        "display_name": "Supervisory Officer / SP",
        "description": "Superintendents of Police and division supervisors reviewing case milestones and audits.",
        "is_system_role": True,
    },
    {
        "name": "system_admin",
        "display_name": "System Administrator",
        "description": "Infrastructure, user management, and security monitoring administrators.",
        "is_system_role": True,
    },
]

# 2. Granular Permissions definition
PERMISSIONS_DATA = [
    # Cases
    ("cases", "create", "Create new legal investigation case"),
    ("cases", "read", "Read assigned case details and summary"),
    ("cases", "update", "Update case metadata and investigation status"),
    ("cases", "close", "Close or archive completed cases"),
    ("cases", "add_members", "Assign investigators and experts to a case team"),
    # Documents
    ("documents", "upload", "Upload new document files into case repository"),
    ("documents", "read", "Read and view document metadata"),
    ("documents", "download", "Download document file content"),
    ("documents", "version", "Create newer version of existing document"),
    # Evidence
    ("evidence", "register", "Register physical or digital evidence record"),
    ("evidence", "read", "View evidence metadata and integrity status"),
    ("evidence", "transfer", "Initiate custody transfer to another officer"),
    ("evidence", "receive", "Acknowledge and accept incoming evidence custody"),
    ("evidence", "verify", "Execute cryptographic SHA-256 integrity checks"),
    ("evidence", "download", "Download forensic digital evidence image/file"),
    # Custody
    ("custody", "view", "View chronological hash-chained chain of custody"),
    # Audit
    ("audit", "view_case", "View case-scoped audit log entries"),
    ("audit", "view_system", "View system-wide audit records"),
    # Search
    ("search", "traditional", "Execute structured filter search"),
    ("search", "semantic", "Execute natural language semantic vector search"),
    # AI
    ("ai", "ask", "Query AI RAG case assistant"),
    # Export
    ("export", "legal_package", "Generate court-ready document/evidence zip package"),
    # Users & Admin
    ("users", "create", "Register and provision new user accounts"),
    ("users", "read", "View user account profiles and status"),
    ("users", "update", "Update user account profile details"),
    ("users", "delete", "Deactivate or purge user accounts"),
    ("users", "status", "Activate, deactivate, or unlock user accounts"),
    ("users", "reset_password", "Perform administrative password reset"),
    ("roles", "manage", "Assign and modify system roles and permissions"),
    ("roles", "view", "Inspect system roles and permission matrices"),
    ("security", "view_events", "Inspect security alerts, brute force attempts, and tampering logs"),
    ("security", "resolve_alerts", "Mark security incident alerts as resolved"),
    ("system", "admin_panel", "Access privileged system administration interface"),
    ("system", "health", "Inspect internal infrastructure readiness diagnostics"),
]

# 3. Role-Permission Matrix Mapping
ROLE_PERMISSIONS_MAPPING = {
    "investigator": [
        ("cases", "create"), ("cases", "read"), ("cases", "update"), ("cases", "add_members"),
        ("documents", "upload"), ("documents", "read"), ("documents", "download"), ("documents", "version"),
        ("evidence", "register"), ("evidence", "read"), ("evidence", "transfer"), ("evidence", "receive"),
        ("evidence", "verify"), ("evidence", "download"),
        ("custody", "view"),
        ("audit", "view_case"),
        ("search", "traditional"), ("search", "semantic"),
        ("ai", "ask"),
    ],
    "forensic_expert": [
        ("cases", "read"),
        ("documents", "upload"), ("documents", "read"), ("documents", "download"), ("documents", "version"),
        ("evidence", "read"), ("evidence", "transfer"), ("evidence", "receive"), ("evidence", "verify"),
        ("evidence", "download"),
        ("custody", "view"),
        ("audit", "view_case"),
        ("search", "traditional"), ("search", "semantic"),
        ("ai", "ask"),
    ],
    "legal_officer": [
        ("cases", "read"),
        ("documents", "upload"), ("documents", "read"), ("documents", "download"), ("documents", "version"),
        ("evidence", "read"), ("evidence", "receive"), ("evidence", "verify"), ("evidence", "download"),
        ("custody", "view"),
        ("audit", "view_case"),
        ("search", "traditional"), ("search", "semantic"),
        ("ai", "ask"),
        ("export", "legal_package"),
    ],
    "supervisor": [
        ("cases", "create"), ("cases", "read"), ("cases", "update"), ("cases", "close"), ("cases", "add_members"),
        ("documents", "upload"), ("documents", "read"), ("documents", "download"), ("documents", "version"),
        ("evidence", "register"), ("evidence", "read"), ("evidence", "transfer"), ("evidence", "receive"),
        ("evidence", "verify"), ("evidence", "download"),
        ("custody", "view"),
        ("audit", "view_case"),
        ("search", "traditional"), ("search", "semantic"),
        ("ai", "ask"),
        ("export", "legal_package"),
        ("security", "view_events"),
    ],
    "system_admin": [
        ("users", "create"), ("users", "read"), ("users", "update"), ("users", "delete"),
        ("users", "status"), ("users", "reset_password"),
        ("roles", "manage"), ("roles", "view"),
        ("audit", "view_system"),
        ("security", "view_events"), ("security", "resolve_alerts"),
        ("system", "admin_panel"), ("system", "health"),
    ],
}


async def seed_demo_data():
    print("=================================================================")
    print("  DOCSHIELD: INITIATING MULTI-ROLE REAL DEMO DATA GENERATOR")
    print("=================================================================")

    # Ensure all tables exist in SQLite / PostgreSQL
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("[+] Verified database tables schema")

    async with AsyncSessionLocal() as session:
        # -------------------------------------------------------------
        # 1. Seed Roles
        # -------------------------------------------------------------
        role_map = {}
        for r_data in ROLES_DATA:
            res = await session.execute(select(Role).where(Role.name == r_data["name"]))
            existing = res.scalar_one_or_none()
            if not existing:
                role = Role(
                    name=r_data["name"],
                    display_name=r_data["display_name"],
                    description=r_data["description"],
                    is_system_role=r_data["is_system_role"],
                )
                session.add(role)
                await session.flush()
                role_map[r_data["name"]] = role
                print(f"  + Created Role: {r_data['name']}")
            else:
                role_map[r_data["name"]] = existing
                print(f"  - Role present: {r_data['name']}")

        # -------------------------------------------------------------
        # 2. Seed Permissions
        # -------------------------------------------------------------
        perm_map = {}
        for res_name, act_name, desc in PERMISSIONS_DATA:
            q = select(Permission).where(Permission.resource == res_name, Permission.action == act_name)
            res = await session.execute(q)
            existing = res.scalar_one_or_none()
            key = (res_name, act_name)
            if not existing:
                perm = Permission(resource=res_name, action=act_name, description=desc)
                session.add(perm)
                await session.flush()
                perm_map[key] = perm
            else:
                perm_map[key] = existing

        # Associate Permissions to Roles
        for role_name, perms in ROLE_PERMISSIONS_MAPPING.items():
            role = role_map[role_name]
            for p_key in perms:
                perm = perm_map[p_key]
                link_q = select(RolePermission).where(
                    RolePermission.role_id == role.id,
                    RolePermission.permission_id == perm.id,
                )
                link_res = await session.execute(link_q)
                if not link_res.scalar_one_or_none():
                    session.add(RolePermission(role_id=role.id, permission_id=perm.id))
        await session.flush()
        print("[+] Associated role permissions matrix")

        # -------------------------------------------------------------
        # 3. Seed Users across all 5 roles
        # -------------------------------------------------------------
        users_config = [
            {
                "email": "admin@ncrb.gov.in",
                "employee_id": "EMP-ADMIN-001",
                "full_name": "Rohan T.",
                "password": "Admin@DocShield2026!",
                "role": "system_admin",
                "department": "National Cyber Crime Records / IT Security",
                "designation": "Chief System Security Officer (CSSO)",
                "phone": "+91-11-2617-9941",
            },
            {
                "email": "officer@ncrb.gov.in",
                "employee_id": "EMP-INV-001",
                "full_name": "Inspector Rajesh Sharma",
                "password": "Investigator@2026!",
                "role": "investigator",
                "department": "Cybercrime Investigation Division",
                "designation": "Senior Investigating Officer",
                "phone": "+91-98110-20881",
            },
            {
                "email": "forensic@ncrb.gov.in",
                "employee_id": "EMP-FOR-001",
                "full_name": "Dr. Vikram Sen",
                "password": "ForensicExpert@2026!",
                "role": "forensic_expert",
                "department": "Central Forensic Science Laboratory (CFSL)",
                "designation": "Senior Scientific Officer (Digital Forensics)",
                "phone": "+91-98712-44120",
            },
            {
                "email": "prosecutor@ncrb.gov.in",
                "employee_id": "EMP-LEG-001",
                "full_name": "Advocate Priya Rao",
                "password": "Prosecutor@2026!",
                "role": "legal_officer",
                "department": "Directorate of Prosecution",
                "designation": "Public Prosecutor (Cyber & Economic Offences)",
                "phone": "+91-98201-10922",
            },
            {
                "email": "legal@ncrb.gov.in",
                "employee_id": "EMP-LEG-002",
                "full_name": "S. Nambiar",
                "password": "Legal@2026!",
                "role": "legal_officer",
                "department": "Legal Affairs & BSA Compliance",
                "designation": "BSA Compliance Reviewer",
                "phone": "+91-98334-88310",
            },
            {
                "email": "supervisor@ncrb.gov.in",
                "employee_id": "EMP-SUP-001",
                "full_name": "SP Anita Deshmukh",
                "password": "Supervisor@2026!",
                "role": "supervisor",
                "department": "Supervisory Oversight Division",
                "designation": "Superintendent of Police (Cyber Crime)",
                "phone": "+91-99880-77011",
            },
        ]

        user_map = {}
        for u in users_config:
            q = select(User).where(User.email == u["email"])
            res = await session.execute(q)
            existing_user = res.scalar_one_or_none()
            if not existing_user:
                new_user = User(
                    employee_id=u["employee_id"],
                    email=u["email"],
                    full_name=u["full_name"],
                    password_hash=hash_password(u["password"]),
                    role_id=role_map[u["role"]].id,
                    department=u["department"],
                    designation=u["designation"],
                    phone=u["phone"],
                    is_active=True,
                    is_locked=False,
                )
                session.add(new_user)
                await session.flush()
                user_map[u["email"]] = new_user
                print(f"  [+] Provisioned User: {u['full_name']} <{u['email']}> [{u['role']}]")
            else:
                existing_user.password_hash = hash_password(u["password"])
                existing_user.role_id = role_map[u["role"]].id
                existing_user.is_active = True
                existing_user.is_locked = False
                user_map[u["email"]] = existing_user
                print(f"  - Verified User: {u['full_name']} <{u['email']}> [{u['role']}]")
        await session.flush()

        admin_user = user_map["admin@ncrb.gov.in"]
        inv_user = user_map["officer@ncrb.gov.in"]
        for_user = user_map["forensic@ncrb.gov.in"]
        pros_user = user_map["prosecutor@ncrb.gov.in"]
        sup_user = user_map["supervisor@ncrb.gov.in"]

        # Track audit chain sequentially
        current_audit_hash = GENESIS_PREVIOUS_HASH

        async def add_audit(action, res_type, res_id=None, actor=None, case_id=None, details=None, dt=None):
            nonlocal current_audit_hash
            ts = dt or datetime.now(UTC)
            h = AuditService.canonical_hash(
                action=action,
                actor_id=actor.id if actor else None,
                resource_type=res_type,
                resource_id=res_id,
                case_id=case_id,
                details=details,
                result="success",
                timestamp=ts,
                previous_event_hash=current_audit_hash,
            )
            evt = AuditEvent(
                actor_id=actor.id if actor else None,
                action=action,
                resource_type=res_type,
                resource_id=res_id,
                case_id=case_id,
                details=details or {},
                result="success",
                ip_address="127.0.0.1",
                user_agent="DocShield/2.1 Enterprise Client",
                previous_event_hash=current_audit_hash,
                event_hash=h,
            )
            evt.created_at = ts
            session.add(evt)
            current_audit_hash = h
            await session.flush()
            return evt

        # Initial Admin Audit
        await add_audit(
            action="SYSTEM_INITIALIZED",
            res_type="system",
            actor=admin_user,
            details={"version": "1.0.0", "standard": "BSA 2023 / BNS 2023", "status": "nominal"},
            dt=datetime.now(UTC) - timedelta(days=30),
        )

        # -------------------------------------------------------------
        # 4. Seed Cases
        # -------------------------------------------------------------
        CASES_SPEC = [
            {
                "case_number": "NCRB-2026-CASE-00412",
                "fir_number": "FIR/2026/0412/CYBER-DELHI",
                "title": "Operation ShadowWire: Transnational Financial Phishing & Money Mule Ring",
                "description": "Investigation into sophisticated spear-phishing attack compromising RTGS payment gateways of multiple public sector banks. Digital evidence seized includes high-speed encrypted NVMe storage drives, virtual server memory dumps, and physical communication handsets.",
                "status": "under_investigation",
                "priority": "critical",
                "category": "Cyber Financial Fraud",
                "police_station": "Special Cell Cyber Police Station, Mandir Marg",
                "district": "New Delhi Central",
                "state": "Delhi",
                "created_days_ago": 14,
            },
            {
                "case_number": "NCRB-2025-CASE-00891",
                "fir_number": "FIR/2025/0891/CYBER-BLR",
                "title": "State vs. CyberCorp Intruders: Cloud IP Exfiltration & Source Theft",
                "description": "Unlawful intrusion into cloud source code repositories and proprietary neural model weights. Full forensic extraction and Section 63/65B BSA electronic evidence certificate prepared for Sessions Court trial.",
                "status": "pending_legal",
                "priority": "high",
                "category": "Corporate Espionage & IP Theft",
                "police_station": "CID Cyber Crime Police Station, Carlton House",
                "district": "Bengaluru Urban",
                "state": "Karnataka",
                "created_days_ago": 45,
            },
            {
                "case_number": "NCRB-2025-CASE-00320",
                "fir_number": "FIR/2025/0320/CRIME-CHE",
                "title": "Critical Infrastructure SCADA Network Ransomware Infiltration",
                "description": "Proactive detection of malicious persistence scripts embedded in electrical power distribution SCADA controllers. Under supervisory review by SP for joint inter-agency operation with CERT-In.",
                "status": "pending_review",
                "priority": "critical",
                "category": "Critical Information Infrastructure (CII)",
                "police_station": "State Cyber Crime Police Station, Guindy",
                "district": "Chennai",
                "state": "Tamil Nadu",
                "created_days_ago": 60,
            },
            {
                "case_number": "NCRB-2026-CASE-00189",
                "fir_number": "FIR/2026/0189/CYBER-MUM",
                "title": "Deepfake Audio Extortion & Synthetic Identity Fraud Syndicate",
                "description": "Active investigation into generative AI voice synthesis impersonating executive leadership to authorize fraudulent offshore escrow wire transfers. Fresh case registered for active investigator triage.",
                "status": "open",
                "priority": "medium",
                "category": "Artificial Intelligence Fraud",
                "police_station": "Cyber Police Station, Bandra Kurla Complex (BKC)",
                "district": "Mumbai Suburban",
                "state": "Maharashtra",
                "created_days_ago": 3,
            },
            {
                "case_number": "NCRB-2026-CASE-00505",
                "fir_number": "FIR/2026/0505/WS-DEL",
                "title": "Operation StalkerShield: Coordinated Deepfake Extortion & Doxxing Syndicate",
                "description": "NCRB Women Safety Division priority probe into generative AI deepfake impersonation, non-consensual synthetic media distribution, and extortion demands targeting female academics and professionals.",
                "status": "under_investigation",
                "priority": "critical",
                "category": "Women Safety & Cyber Harassment",
                "police_station": "Special Women Safety Cyber Cell, New Delhi",
                "district": "New Delhi",
                "state": "Delhi",
                "created_days_ago": 7,
            },
            {
                "case_number": "NCRB-2026-CASE-00621",
                "fir_number": "FIR/2026/0621/CY-HYD",
                "title": "Operation CryptoVault: Cross-Chain Decentralized Tumbler & Ransomware Escrow",
                "description": "High-value forensic ledger tracking of ransomed crypto assets routed through privacy mixers and DeFi liquidity pools. Complete trial dossier prepared under Section 63/65B BSA 2023.",
                "status": "pending_legal",
                "priority": "high",
                "category": "Cryptocurrency & Financial Fraud",
                "police_station": "Cyber Crime Police Station, Cyberabad",
                "district": "Hyderabad",
                "state": "Telangana",
                "created_days_ago": 30,
            },
            {
                "case_number": "NCRB-2026-CASE-00780",
                "fir_number": "FIR/2026/0780/TERR-IGI",
                "title": "Operation SkySafe: Software Defined Radio RF Spoofing Probe",
                "description": "Critical infrastructure probe investigating illegal transmission spoofing of civil aviation ADS-B and VHF approach radar beacons. Flagged for SP review and inter-agency coordination with DGCA.",
                "status": "pending_review",
                "priority": "critical",
                "category": "Cyber Terrorism (Sec. 66F IT Act)",
                "police_station": "Special Cell Counter-Terror Cyber Unit, Delhi",
                "district": "South West Delhi",
                "state": "Delhi",
                "created_days_ago": 18,
            },
        ]

        case_objs = {}
        for c_spec in CASES_SPEC:
            cq = select(Case).where(Case.case_number == c_spec["case_number"])
            c_res = await session.execute(cq)
            case_item = c_res.scalar_one_or_none()

            created_time = datetime.now(UTC) - timedelta(days=c_spec["created_days_ago"])

            if not case_item:
                case_item = Case(
                    case_number=c_spec["case_number"],
                    fir_number=c_spec["fir_number"],
                    title=c_spec["title"],
                    description=c_spec["description"],
                    status=c_spec["status"],
                    priority=c_spec["priority"],
                    category=c_spec["category"],
                    police_station=c_spec["police_station"],
                    district=c_spec["district"],
                    state=c_spec["state"],
                    investigating_officer_id=inv_user.id,
                    created_by=inv_user.id,
                )
                case_item.created_at = created_time
                session.add(case_item)
                await session.flush()
                print(f"  [+] Registered Case: {case_item.case_number} - {case_item.title[:45]}...")
            else:
                case_item.status = c_spec["status"]
                case_item.priority = c_spec["priority"]
                case_item.description = c_spec["description"]
                print(f"  - Case present: {case_item.case_number}")

            case_objs[c_spec["case_number"]] = case_item

            team_roster = [
                (inv_user, "lead_investigator"),
                (for_user, "forensic_analyst"),
                (pros_user, "legal_counsel"),
                (sup_user, "supervisor"),
            ]

            for user_member, role_in_case in team_roster:
                mq = select(CaseMember).where(
                    CaseMember.case_id == case_item.id,
                    CaseMember.user_id == user_member.id,
                )
                m_res = await session.execute(mq)
                if not m_res.scalar_one_or_none():
                    cm = CaseMember(
                        case_id=case_item.id,
                        user_id=user_member.id,
                        role_in_case=role_in_case,
                        added_by=inv_user.id,
                        added_at=created_time,
                        is_active=True,
                    )
                    session.add(cm)

            await add_audit(
                action="CASE_CREATED",
                res_type="case",
                res_id=case_item.id,
                actor=inv_user,
                case_id=case_item.id,
                details={"case_number": case_item.case_number, "fir": case_item.fir_number},
                dt=created_time,
            )

        await session.flush()
        print("[+] Enrolled team members across all cases")

        # -------------------------------------------------------------
        # 5. Seed Documents & Document Versions (with legal entities)
        # -------------------------------------------------------------
        c1 = case_objs["NCRB-2026-CASE-00412"]
        c2 = case_objs["NCRB-2025-CASE-00891"]
        c3 = case_objs["NCRB-2025-CASE-00320"]
        c4 = case_objs["NCRB-2026-CASE-00189"]
        c5 = case_objs["NCRB-2026-CASE-00505"]
        c6 = case_objs["NCRB-2026-CASE-00621"]
        c7 = case_objs["NCRB-2026-CASE-00780"]

        DOCUMENTS_DATA = [
            # Case 1 Documents
            {
                "case": c1,
                "title": "First Information Report (Signed Official Copy)",
                "document_type": "fir",
                "classification": "confidential",
                "filename": "FIR_0412_Signed_Cybercrime.pdf",
                "mime": "application/pdf",
                "size": 1420580,
                "hash": "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
                "summary": "Official First Information Report detailing unauthorized electronic fund transfer of Rs 4,85,00,000 from State Apex Cooperative Bank RTGS switch. Registered under Sections 66C and 66D Information Technology Act 2000 and Section 318(4) Bharatiya Nyaya Sanhita 2023.",
                "ocr_text": "GOVERNMENT OF NCT OF DELHI - POLICE DEPARTMENT\nFIRST INFORMATION REPORT (Under Section 173 BNSS)\nFIR No: 0412/2026 Date: 03-09-2026 Time: 11:30 hrs\nPolice Station: Special Cell Cyber, Mandir Marg\nComplainant: Chief Vigilance Officer, State Apex Cooperative Bank\nActs & Sections: Section 66C, 66D IT Act 2000, Section 318(4) BNS 2023\nDetails of Occurrence: Unauthorized remote script execution initiating 14 high-value RTGS transfers to overseas beneficiary escrow accounts.",
                "entities": [
                    ("law_section", "Section 66C IT Act 2000"),
                    ("law_section", "Section 66D IT Act 2000"),
                    ("law_section", "Section 318(4) Bharatiya Nyaya Sanhita (BNS) 2023"),
                    ("organization", "State Apex Cooperative Bank"),
                    ("organization", "Reserve Bank of India (RBI)"),
                    ("location", "Mandir Marg, New Delhi"),
                    ("date", "03-09-2026"),
                ],
            },
            {
                "case": c1,
                "title": "Physical & Digital Seizure Memo (Form NCRB-SM-04)",
                "document_type": "evidence_record",
                "classification": "secret",
                "filename": "Seizure_Memo_Hardware_Devices.pdf",
                "mime": "application/pdf",
                "size": 2894100,
                "hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                "summary": "Formal seizure memo executed in presence of two independent panch witnesses at premises Sector 62, Noida. Confiscation of Samsung 980 Pro NVMe SSD (Serial S5GXNF0R102934), OnePlus 12 smartphone with dual SIM cards, and encrypted hardware key.",
                "ocr_text": "PANCHNAMA / SEIZURE MEMO\nUnder Section 105 Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023\nPlace of Seizure: Plot 44, Tech Zone, Sector 62, Noida, UP\nDate & Time: 04-09-2026 at 15:45 hrs\nPanch Witness 1: Shri Ramesh Chandra, Age 42 yrs\nPanch Witness 2: Shri Alok Verma, Age 38 yrs\nItems Seized: 1. NVMe SSD 1TB Samsung 980 Pro. 2. OnePlus 12 mobile phone (IMEI 864501050123456).\nCondition: Sealed in anti-static tamper-evident tamper proof forensic evidence bags barcode #IND-DEL-99182.",
                "entities": [
                    ("person", "Inspector Rajesh Sharma"),
                    ("person", "Ramesh Chandra"),
                    ("person", "Alok Verma"),
                    ("location", "Sector 62, Noida"),
                    ("evidence_ref", "IND-DEL-99182"),
                    ("evidence_ref", "Samsung 980 Pro 1TB SSD"),
                ],
            },
            {
                "case": c1,
                "title": "Witness Examination Statement (Chief Information Security Officer)",
                "document_type": "witness_statement",
                "classification": "confidential",
                "filename": "Witness_Statement_Chief_Accounts_Officer.pdf",
                "mime": "application/pdf",
                "size": 894300,
                "hash": "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb",
                "summary": "Deposition recorded under Section 180 BNSS 2023 from Chief Information Security Officer outlining rogue VPN session established using credential stuffing at 02:14 AM IST.",
                "ocr_text": "STATEMENT OF WITNESS UNDER SECTION 180 BNSS 2023\nName: Shri Arvind Swaminathan, CISO\nStatement: On the night of 02-09-2026, the Security Operations Center flagged multiple outbound connections from host IP 10.4.12.88 bypassing secondary MFA authentication.",
                "entities": [
                    ("person", "Arvind Swaminathan"),
                    ("organization", "Security Operations Center (SOC)"),
                    ("date", "02-09-2026"),
                ],
            },
            # Case 2 Documents
            {
                "case": c2,
                "title": "Sessions Court Final Charge Sheet (Sec. 193 BNSS)",
                "document_type": "charge_sheet",
                "classification": "confidential",
                "filename": "Draft_Charge_Sheet_Sec316_BNS.pdf",
                "mime": "application/pdf",
                "size": 3410880,
                "hash": "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
                "summary": "Complete police report and charge sheet filed before the Hon'ble City Civil & Sessions Judge, Commercial Court, Bengaluru. Indictment of three individuals for corporate trade secret theft and unauthorized database export.",
                "ocr_text": "IN THE COURT OF HON'BLE PRINCIPAL CITY CIVIL & SESSIONS JUDGE, BENGALURU\nCHARGE SHEET Under Section 193 Bharatiya Nagarik Suraksha Sanhita, 2023\nState of Karnataka by Cyber Crime Police Station vs. Accused 1 to 3\nCharges Framed: Section 316(2), Section 318(4) BNS 2023, Section 43, 66, 72 IT Act 2000.",
                "entities": [
                    ("law_section", "Section 316(2) BNS 2023"),
                    ("law_section", "Section 43 & 66 Information Technology Act 2000"),
                    ("location", "City Civil & Sessions Court, Bengaluru"),
                ],
            },
            {
                "case": c2,
                "title": "CFSL Digital Forensics Examination Certificate (Sec. 63/65B BSA 2023)",
                "document_type": "forensic_report",
                "classification": "confidential",
                "filename": "CFSL_Digital_Forensics_Report_Sec65B.pdf",
                "mime": "application/pdf",
                "size": 5120000,
                "hash": "ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d",
                "summary": "Forensic examination report signed by Senior Scientific Officer certifying uncorrupted SHA-256 bitstream image acquisition, timeline reconstruction, and Section 65B Bharatiya Sakshya Adhiniyam 2023 electronic admissibility compliance.",
                "ocr_text": "CENTRAL FORENSIC SCIENCE LABORATORY - DIGITAL FORENSICS DIVISION\nFORENSIC EXAMINATION CERTIFICATE UNDER SECTION 65B BHARATIYA SAKSHYA ADHINIYAM, 2023\nI, Dr. Vikram Sen, Senior Scientific Officer, do hereby certify:\n1. That the target computer systems and cloud logs were operating properly throughout the processing period.\n2. Bitstream forensic image SHA-256 verified identically before and after analysis.\n3. Chain of custody remained strictly intact throughout laboratory custody.",
                "entities": [
                    ("person", "Dr. Vikram Sen"),
                    ("organization", "Central Forensic Science Laboratory (CFSL)"),
                    ("law_section", "Section 65B Bharatiya Sakshya Adhiniyam (BSA) 2023"),
                ],
            },
            # Case 4 Documents
            {
                "case": c4,
                "title": "FIR Transcript: AI Voice Cloning Extortion",
                "document_type": "fir",
                "classification": "confidential",
                "filename": "FIR_0189_Voice_Cloning_Extortion.pdf",
                "mime": "application/pdf",
                "size": 1120400,
                "hash": "1a2b3c4d5e6f7890123456789abcdef0123456789abcdef0123456789abcdef0",
                "summary": "Complaint registered regarding synthetic vocal spoofing mimicking CEO voice to request immediate overseas supplier escrow release.",
                "ocr_text": "CYBER CRIME POLICE STATION, BKC MUMBAI\nFIR No: 0189/2026\nSections: 66D IT Act 2000, 318(4) BNS 2023\nComplainant: Chief Financial Officer, Horizon Media Group",
                "entities": [
                    ("law_section", "Section 66D IT Act 2000"),
                    ("organization", "Horizon Media Group"),
                    ("location", "Bandra Kurla Complex, Mumbai"),
                ],
            },
            # Case 5 Documents (Women Safety Division)
            {
                "case": c5,
                "title": "NCRB Women Safety Division FIR: Operation StalkerShield",
                "document_type": "fir",
                "classification": "secret",
                "filename": "FIR_0505_Women_Safety_Deepfake.pdf",
                "mime": "application/pdf",
                "size": 1845000,
                "hash": "2b3c4d5e6f7890123456789abcdef0123456789abcdef0123456789abcdef01a",
                "summary": "Special cyber cell FIR charging coordinated digital harassment, non-consensual deepfake generation, and extortion under Section 66E, 67, 67A IT Act and Sections 78, 79 BNS 2023.",
                "ocr_text": "SPECIAL WOMEN SAFETY CYBER CELL - NEW DELHI\nFIR No: 0505/2026\nSections: Sec 66E, 67, 67A IT Act 2000, Sec 78, 79 Bharatiya Nyaya Sanhita 2023\nAllegation: Unlawful generation and distribution of synthetic non-consensual deepfake media via automated Telegram bots.",
                "entities": [
                    ("law_section", "Section 66E IT Act 2000"),
                    ("law_section", "Section 67A IT Act 2000"),
                    ("law_section", "Section 78 BNS 2023"),
                    ("organization", "NCRB Women Safety Division"),
                    ("location", "New Delhi"),
                ],
            },
            {
                "case": c5,
                "title": "CFSL Synthetic Media & Biometric Artifact Analysis Report",
                "document_type": "forensic_report",
                "classification": "confidential",
                "filename": "Forensic_AudioVideo_Deepfake_Analysis.pdf",
                "mime": "application/pdf",
                "size": 6240100,
                "hash": "3c4d5e6f7890123456789abcdef0123456789abcdef0123456789abcdef01a2b",
                "summary": "Technical forensic evaluation identifying generative adversarial network (GAN) blending boundaries, unnatural blink rates, and lighting vector mismatches. Admissible under Section 65B BSA 2023.",
                "ocr_text": "CFSL DIGITAL FORENSICS REPORT - SYNTHETIC MEDIA VERIFICATION\nModel Identified: Face-Swap GAN Architecture v4.2\nArtifact Analysis: Inconsistent facial landmark geometry and biometric vector variance confirming AI-generated forgery.",
                "entities": [
                    ("person", "Dr. Vikram Sen"),
                    ("organization", "Central Forensic Science Laboratory (CFSL)"),
                    ("law_section", "Section 65B Bharatiya Sakshya Adhiniyam 2023"),
                ],
            },
            # Case 6 Documents (Cryptocurrency)
            {
                "case": c6,
                "title": "Sessions Court Charge Sheet: Operation CryptoVault",
                "document_type": "charge_sheet",
                "classification": "confidential",
                "filename": "Charge_Sheet_CryptoLaundering_Sec318_BNS.pdf",
                "mime": "application/pdf",
                "size": 4120000,
                "hash": "4d5e6f7890123456789abcdef0123456789abcdef0123456789abcdef01a2b3c",
                "summary": "Final charge sheet detailing blockchain ledger forensic traces, peel chains, and decentralized cross-chain mixer addresses used to launder cyber fraud proceeds.",
                "ocr_text": "CITY CIVIL COURT, HYDERABAD\nState of Telangana vs. Crypto Laundering Syndicate\nSections: 318(4) BNS 2023, Sec 66 IT Act 2000\nEvidence: Certified UTXO transaction graphs and cold wallet seizures.",
                "entities": [
                    ("law_section", "Section 318(4) BNS 2023"),
                    ("location", "Hyderabad"),
                ],
            },
            # Case 7 Documents (Critical Infrastructure)
            {
                "case": c7,
                "title": "DGCA & ATC Radio Frequency Interference Incident Report",
                "document_type": "supporting_document",
                "classification": "top_secret",
                "filename": "DGCA_ATC_Radio_Frequency_Interference_Report.pdf",
                "mime": "application/pdf",
                "size": 2980000,
                "hash": "5e6f7890123456789abcdef0123456789abcdef0123456789abcdef01a2b3c4d",
                "summary": "Technical incident report capturing illegitimate spectrum emissions spoofing IGI Airport Terminal 3 approach radar beacons.",
                "ocr_text": "DIRECTORATE GENERAL OF CIVIL AVIATION - AIR SAFETY CELL\nRF Interference Log: Carrier frequency 1090 MHz spoofing aircraft ADS-B transponder replies.",
                "entities": [
                    ("organization", "Directorate General of Civil Aviation (DGCA)"),
                    ("location", "Indira Gandhi International Airport, New Delhi"),
                ],
            },
        ]

        doc_objs = {}
        for d_spec in DOCUMENTS_DATA:
            dq = select(Document).where(
                Document.case_id == d_spec["case"].id,
                Document.title == d_spec["title"],
            )
            d_res = await session.execute(dq)
            doc_item = d_res.scalar_one_or_none()

            if not doc_item:
                doc_item = Document(
                    case_id=d_spec["case"].id,
                    title=d_spec["title"],
                    description=d_spec["summary"],
                    document_type=d_spec["document_type"],
                    classification=d_spec["classification"],
                    status="processed",
                    original_filename=d_spec["filename"],
                    mime_type=d_spec["mime"],
                    file_size_bytes=d_spec["size"],
                    uploaded_by=inv_user.id,
                    ai_processed=True,
                    ai_classification=d_spec["document_type"],
                    ai_confidence=0.96,
                    ocr_text=d_spec["ocr_text"],
                    summary=d_spec["summary"],
                )
                session.add(doc_item)
                await session.flush()

                # Create DocumentVersion #1
                version = DocumentVersion(
                    document_id=doc_item.id,
                    version_number=1,
                    storage_key=f"cases/{d_spec['case'].id}/documents/{doc_item.id}/v1/{d_spec['filename']}",
                    storage_bucket="sih190-documents",
                    file_hash_sha256=d_spec["hash"],
                    file_size_bytes=d_spec["size"],
                    mime_type=d_spec["mime"],
                    original_filename=d_spec["filename"],
                    sanitized_filename=d_spec["filename"].replace(" ", "_"),
                    change_reason="Original evidence document ingested and cryptographic SHA-256 baseline computed.",
                    created_by=inv_user.id,
                    is_original=True,
                    integrity_status="verified",
                    last_verified_at=datetime.now(UTC),
                )
                session.add(version)
                await session.flush()

                doc_item.current_version_id = version.id
                await session.flush()

                # Add Extracted Entities
                for ent_type, ent_val in d_spec["entities"]:
                    session.add(
                        ExtractedEntity(
                            document_id=doc_item.id,
                            entity_type=ent_type,
                            entity_value=ent_val,
                            confidence=0.94,
                            source="ai_extracted",
                            verified=True,
                        )
                    )

                # Add Metadata Entry
                session.add(
                    DocumentMetadata(
                        document_id=doc_item.id,
                        key="BSA_COMPLIANCE_STATUS",
                        value="Certified Section 65B Electronic Admissibility",
                        source="manual",
                        confidence=1.0,
                        verified_by=pros_user.id,
                        verified_at=datetime.now(UTC),
                    )
                )

                await add_audit(
                    action="DOCUMENT_UPLOADED",
                    res_type="document",
                    res_id=doc_item.id,
                    actor=inv_user,
                    case_id=d_spec["case"].id,
                    details={"title": doc_item.title, "sha256": d_spec["hash"], "version": 1},
                )

                print(f"  [+] Ingested Document: {doc_item.title[:45]} (SHA-256 verified)")
            doc_objs[d_spec["title"]] = doc_item

        await session.flush()

        # -------------------------------------------------------------
        # 6. Seed Evidence Items & Hash-Chained Custody Ledger
        # -------------------------------------------------------------
        EVIDENCE_SPECS = [
            # Evidence 1: In analysis at CFSL
            {
                "case": c1,
                "evidence_number": "EVID-2026-00412-001",
                "title": "Seized Encrypted NVMe SSD 1TB (Samsung 980 Pro)",
                "description": "Solid State Drive seized from primary orchestrator workstation. Serial Number: S5GXNF0R102934. Formally handed over to CFSL Digital Forensics Laboratory for bitstream imaging.",
                "evidence_type": "device",
                "status": "in_analysis",
                "sensitivity": "confidential",
                "current_custodian": for_user,
                "registered_by": inv_user,
                "source": "Physical search seizure at Noida cyber cell raid",
                "file_hash": "a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0",
                "custody_steps": [
                    {
                        "type": "registered",
                        "from_user": None,
                        "to_user": inv_user,
                        "reason": "Evidence registered following physical search seizure memo #NCRB-SM-04.",
                        "location": "Malkhana Evidence Locker Room 4, Mandir Marg PS, New Delhi",
                        "days_ago": 12,
                    },
                    {
                        "type": "transfer_initiated",
                        "from_user": inv_user,
                        "to_user": for_user,
                        "reason": "Dispatched via secure courier for forensic bitstream duplication and analysis.",
                        "location": "In transit to CFSL Sector 36, Chandigarh",
                        "days_ago": 10,
                    },
                    {
                        "type": "transfer_acknowledged",
                        "from_user": inv_user,
                        "to_user": for_user,
                        "reason": "Received tamper-evident security bag with unbroken seal #IND-DEL-99182.",
                        "location": "CFSL Digital Forensics Laboratory, Room 204",
                        "days_ago": 9,
                    },
                    {
                        "type": "in_analysis",
                        "from_user": for_user,
                        "to_user": for_user,
                        "reason": "Connected to Tableau T8u Forensic USB 3.0 Bridge in hardware write-block mode.",
                        "location": "CFSL Cleanroom Forensics Workstation Alpha",
                        "days_ago": 8,
                    },
                ],
            },
            # Evidence 2: Bitstream disk image in custody of forensic expert
            {
                "case": c1,
                "evidence_number": "EVID-2026-00412-002",
                "title": "Raw Forensic Bitstream Disk Image (.E01 / .raw, 953.8 GB)",
                "description": "Cryptographically verified Expert Witness Format (E01) physical image acquired from Samsung 980 Pro SSD. Dual SHA-256 match verified before and after hashing.",
                "evidence_type": "forensic_artifact",
                "status": "in_custody",
                "sensitivity": "highly_sensitive",
                "current_custodian": for_user,
                "registered_by": for_user,
                "source": "Physical forensic acquisition at CFSL workstation Alpha",
                "file_hash": "c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef01234",
                "custody_steps": [
                    {
                        "type": "registered",
                        "from_user": None,
                        "to_user": for_user,
                        "reason": "Generated forensic bitstream image matching source disk sector-by-sector.",
                        "location": "CFSL SAN Storage Vault Node 2",
                        "days_ago": 8,
                    },
                ],
            },
            # Evidence 3: Suspect smartphone pending handover
            {
                "case": c1,
                "evidence_number": "EVID-2026-00412-003",
                "title": "Primary Suspect Smartphone (OnePlus 12 - IMEI 864501050123456)",
                "description": "Seized Android handset stored in RF shielding Faraday isolation pouch. Custody transfer initiated by Investigator to Forensics for chip-off and Cellebrite physical extraction.",
                "evidence_type": "device",
                "status": "registered",
                "sensitivity": "sensitive",
                "current_custodian": inv_user,
                "registered_by": inv_user,
                "source": "Found on person of suspect at transit arrest",
                "file_hash": "f67890123456789abcdef0123456789abcdef0123456789abcdef0123456789a",
                "transfer_pending": True,
                "pending_custodian": for_user,
                "transfer_reason": "Pending CFSL extraction of encrypted Signal and WhatsApp databases.",
                "custody_steps": [
                    {
                        "type": "registered",
                        "from_user": None,
                        "to_user": inv_user,
                        "reason": "Handset seized and immediately sealed in Faraday bag to prevent remote wipe.",
                        "location": "Evidence Safe Locker, Special Cell, New Delhi",
                        "days_ago": 5,
                    },
                ],
            },
            # Evidence 4: Legal Case 2 Evidence
            {
                "case": c2,
                "evidence_number": "EVID-2025-00891-001",
                "title": "AWS S3 Server Access Logs Cryptographic Snapshot",
                "description": "Immutable audit snapshot of AWS CloudTrail logs capturing unauthorized GET Object calls targeting production source code zip archives. Signed under Section 65B BSA 2023.",
                "evidence_type": "digital_document",
                "status": "analyzed",
                "sensitivity": "confidential",
                "current_custodian": pros_user,
                "registered_by": inv_user,
                "source": "Extracted via AWS IAM forensic audit role",
                "file_hash": "e5f67890123456789abcdef0123456789abcdef0123456789abcdef012345678",
                "custody_steps": [
                    {
                        "type": "registered",
                        "from_user": None,
                        "to_user": inv_user,
                        "reason": "Audit logs downloaded and hashed immediately on receipt from Amazon Web Services.",
                        "location": "CID Cyber Crime Vault, Bengaluru",
                        "days_ago": 40,
                    },
                    {
                        "type": "transfer_initiated",
                        "from_user": inv_user,
                        "to_user": for_user,
                        "reason": "Transfer to forensic examiner for IP origin correlation and timestamp verification.",
                        "location": "Forensics Lab, Carlton House",
                        "days_ago": 35,
                    },
                    {
                        "type": "transfer_acknowledged",
                        "from_user": inv_user,
                        "to_user": for_user,
                        "reason": "Acknowledged and logged in forensic laboratory intake ledger.",
                        "location": "Forensics Lab Workstation",
                        "days_ago": 34,
                    },
                    {
                        "type": "in_analysis",
                        "from_user": for_user,
                        "to_user": for_user,
                        "reason": "IP geolocation cross-referencing and VPN exit node correlation analysis.",
                        "location": "Forensics Lab Workstation",
                        "days_ago": 30,
                    },
                    {
                        "type": "transfer_initiated",
                        "from_user": for_user,
                        "to_user": pros_user,
                        "reason": "Handover of certified evidence to Public Prosecutor for Sessions Court submission.",
                        "location": "Directorate of Prosecution, High Court Complex",
                        "days_ago": 15,
                    },
                    {
                        "type": "transfer_acknowledged",
                        "from_user": for_user,
                        "to_user": pros_user,
                        "reason": "Prosecution received certified exhibit for filing along with Charge Sheet.",
                        "location": "Court Evidence Filing Section",
                        "days_ago": 14,
                    },
                ],
            },
            # Evidence 5: Case 3 Audio Forensic Sample
            {
                "case": c3,
                "evidence_number": "EVID-2025-00320-001",
                "title": "Intercepted VOIP WAV Recording (Synthetic Voice Sample)",
                "description": "Uncompressed 192kHz WAV master file extracted from PBX gateway server. Acoustic spectrogram forensic analysis shows spectral artifacts consistent with RVC (Retrieval-based Voice Conversion) synthetic voice synthesis.",
                "evidence_type": "audio",
                "status": "analyzed",
                "sensitivity": "confidential",
                "current_custodian": for_user,
                "registered_by": inv_user,
                "source": "PBX Gateway server SIP trunk log capture",
                "file_hash": "2a3b4c5d6e7f890123456789abcdef0123456789abcdef0123456789abcdef01",
                "custody_steps": [
                    {
                        "type": "registered",
                        "from_user": None,
                        "to_user": inv_user,
                        "reason": "WAV audio stream dumped and cryptographically sealed under Section 63 BSA 2023.",
                        "location": "Cyber Police Station, Gurugram",
                        "days_ago": 25,
                    },
                    {
                        "type": "transfer_initiated",
                        "from_user": inv_user,
                        "to_user": for_user,
                        "reason": "Sent for phoneme acoustic resonance analysis and voice biometric comparison.",
                        "location": "CFSL Digital Acoustics Wing, Chandigarh",
                        "days_ago": 23,
                    },
                    {
                        "type": "transfer_acknowledged",
                        "from_user": inv_user,
                        "to_user": for_user,
                        "reason": "Forensic acoustics examiner received audio package with matching SHA-256 seal.",
                        "location": "CFSL Audio Analysis Lab 3",
                        "days_ago": 22,
                    },
                    {
                        "type": "in_analysis",
                        "from_user": for_user,
                        "to_user": for_user,
                        "reason": "Running acoustic spectrogram and neural vocoder phase inversion detection.",
                        "location": "CFSL Audio Analysis Lab 3",
                        "days_ago": 20,
                    },
                ],
            },
            # Evidence 6: Case 4 Algo Trading Bot Docker Container
            {
                "case": c4,
                "evidence_number": "EVID-2026-00189-001",
                "title": "Algo Trading Orchestrator Container Image & Volatile Memory Dump",
                "description": "Live memory dump (LiME format) and exported OCI container image running high-frequency sentiment spoofing scripts across NSE equity derivatives markets.",
                "evidence_type": "digital_document",
                "status": "in_analysis",
                "sensitivity": "confidential",
                "current_custodian": for_user,
                "registered_by": inv_user,
                "source": "Colocation rack server seizure at BKC Data Center",
                "file_hash": "3b4c5d6e7f890123456789abcdef0123456789abcdef0123456789abcdef012a",
                "custody_steps": [
                    {
                        "type": "registered",
                        "from_user": None,
                        "to_user": inv_user,
                        "reason": "Live memory acquisition performed via LiME kernel module with write-blocked SSD.",
                        "location": "BKC Cyber Cell Evidence Room, Mumbai",
                        "days_ago": 3,
                    },
                    {
                        "type": "transfer_initiated",
                        "from_user": inv_user,
                        "to_user": for_user,
                        "reason": "Submitted to CERT-In / State Cyber Forensics for reverse-engineering autonomous agent logic.",
                        "location": "State Cyber Forensics Division, Mumbai",
                        "days_ago": 2,
                    },
                    {
                        "type": "transfer_acknowledged",
                        "from_user": inv_user,
                        "to_user": for_user,
                        "reason": "Memory dump hash verified against field seizure baseline.",
                        "location": "Forensic Analysis Sandbox Lab",
                        "days_ago": 1,
                    },
                ],
            },
            # Evidence 7: Case 5 Deepfake Harassment Laptop
            {
                "case": c5,
                "evidence_number": "EVID-2026-00505-001",
                "title": "Seized MacBook Pro M3 Max (Model A2992, SN: C02G9015MD6R)",
                "description": "Primary rendering hardware utilized for Stable Diffusion and FaceFusion face-swapping pipelines. Contains trained LoRA checkpoints and encrypted Telegram export channels.",
                "evidence_type": "device",
                "status": "in_custody",
                "sensitivity": "highly_sensitive",
                "current_custodian": for_user,
                "registered_by": inv_user,
                "source": "Search warrant execution at Dwarka residential complex",
                "file_hash": "4c5d6e7f890123456789abcdef0123456789abcdef0123456789abcdef0123ab",
                "custody_steps": [
                    {
                        "type": "registered",
                        "from_user": None,
                        "to_user": inv_user,
                        "reason": "Seized from suspect bedroom desk, battery disconnected, sealed in tamper bag #DEL-WOM-4029.",
                        "location": "Women Safety Cyber Cell Locker, New Delhi",
                        "days_ago": 7,
                    },
                    {
                        "type": "transfer_initiated",
                        "from_user": inv_user,
                        "to_user": for_user,
                        "reason": "Physical handover to Digital Forensics for APFS file system imaging and vault decryption.",
                        "location": "CFSL Digital Evidence Lab, New Delhi",
                        "days_ago": 6,
                    },
                    {
                        "type": "transfer_acknowledged",
                        "from_user": inv_user,
                        "to_user": for_user,
                        "reason": "Cryptographic seals inspected intact and logged in laboratory register.",
                        "location": "CFSL Digital Evidence Lab, New Delhi",
                        "days_ago": 5,
                    },
                ],
            },
            # Evidence 8: Case 6 Crypto Hardware Wallet
            {
                "case": c6,
                "evidence_number": "EVID-2026-00621-001",
                "title": "Ledger Nano X Hardware Crypto Wallet & BIP-39 Recovery Slate",
                "description": "Seized Coldcard / Ledger hardware security element containing master private keys controlling Ethereum, Solana, and Monero addresses linked to the multi-crore ransomware extortion scheme.",
                "evidence_type": "device",
                "status": "registered",
                "sensitivity": "confidential",
                "current_custodian": inv_user,
                "registered_by": inv_user,
                "source": "Bank safe deposit box seizure under Section 106 BNSS 2023",
                "file_hash": "5d6e7f890123456789abcdef0123456789abcdef0123456789abcdef01234abc",
                "transfer_pending": True,
                "pending_custodian": pros_user,
                "transfer_reason": "Scheduled for court deposit as prime material exhibit in Special CBI/Cyber Sessions Court.",
                "custody_steps": [
                    {
                        "type": "registered",
                        "from_user": None,
                        "to_user": inv_user,
                        "reason": "Seized under formal panchnama from locker #412 with bank manager as independent witness.",
                        "location": "Cyberabad Police Commissionerate Strongroom",
                        "days_ago": 28,
                    },
                ],
            },
            # Evidence 9: Case 7 RF Transmitter & SDR Device
            {
                "case": c7,
                "evidence_number": "EVID-2026-00780-001",
                "title": "HackRF One SDR Transceiver with TCXO & Power Amplifier (2.4 GHz)",
                "description": "Custom RF transmission hardware discovered concealed on rooftop near airport approach path. Configured with GNU Radio scripts transmitting false ADS-B telemetry to civil aircraft.",
                "evidence_type": "device",
                "status": "in_analysis",
                "sensitivity": "classified",
                "current_custodian": for_user,
                "registered_by": inv_user,
                "source": "Physical recovery from water tank rooftop, Mahipalpur",
                "file_hash": "6e7f890123456789abcdef0123456789abcdef0123456789abcdef012345abcd",
                "custody_steps": [
                    {
                        "type": "registered",
                        "from_user": None,
                        "to_user": inv_user,
                        "reason": "Recovered following RF direction finding triangulation by WPC and Special Cell.",
                        "location": "Special Cell Armory & Evidence Locker, Lodhi Colony",
                        "days_ago": 18,
                    },
                    {
                        "type": "transfer_initiated",
                        "from_user": inv_user,
                        "to_user": for_user,
                        "reason": "Dispatched under armed escort to National Cyber Forensics Lab (NCFL) for firmware extraction.",
                        "location": "NCFL High Security Testing Center, New Delhi",
                        "days_ago": 16,
                    },
                    {
                        "type": "transfer_acknowledged",
                        "from_user": inv_user,
                        "to_user": for_user,
                        "reason": "NCFL Senior Scientist confirmed physical integrity and intact evidence security tags.",
                        "location": "NCFL Hardware Reverse Engineering Lab",
                        "days_ago": 15,
                    },
                    {
                        "type": "in_analysis",
                        "from_user": for_user,
                        "to_user": for_user,
                        "reason": "EEPROM flashing, FPGA bitstream reverse engineering, and RF power output profiling.",
                        "location": "NCFL Hardware Reverse Engineering Lab",
                        "days_ago": 12,
                    },
                ],
            },
        ]

        for ev_spec in EVIDENCE_SPECS:
            eq = select(Evidence).where(Evidence.evidence_number == ev_spec["evidence_number"])
            e_res = await session.execute(eq)
            ev_item = e_res.scalar_one_or_none()

            if not ev_item:
                ev_item = Evidence(
                    case_id=ev_spec["case"].id,
                    evidence_number=ev_spec["evidence_number"],
                    title=ev_spec["title"],
                    description=ev_spec["description"],
                    evidence_type=ev_spec["evidence_type"],
                    status=ev_spec["status"],
                    sensitivity_level=ev_spec["sensitivity"],
                    original_file_hash=ev_spec["file_hash"],
                    current_file_hash=ev_spec["file_hash"],
                    integrity_status="verified",
                    current_custodian_id=ev_spec["current_custodian"].id,
                    pending_custodian_id=ev_spec["pending_custodian"].id if ev_spec.get("pending_custodian") else None,
                    transfer_pending=ev_spec.get("transfer_pending", False),
                    transfer_reason=ev_spec.get("transfer_reason"),
                    registered_by_id=ev_spec["registered_by"].id,
                    collection_date=datetime.now(UTC) - timedelta(days=12),
                    collection_location=ev_spec.get("source", "Field Seizure"),
                    source=ev_spec.get("source"),
                )
                session.add(ev_item)
                await session.flush()

                # Build verifiable cryptographic custody chain
                prev_custody_hash = GENESIS_HASH
                for step in ev_spec["custody_steps"]:
                    step_time = datetime.now(UTC) - timedelta(days=step["days_ago"])
                    c_bytes = canonicalize_custody_event(
                        evidence_id=ev_item.id,
                        event_type=step["type"],
                        from_user_id=step["from_user"].id if step["from_user"] else None,
                        to_user_id=step["to_user"].id,
                        reason=step["reason"],
                        file_hash_at_event=ev_spec["file_hash"],
                        timestamp=step_time,
                        location=step.get("location"),
                    )
                    e_hash = compute_custody_event_hash(c_bytes, prev_custody_hash)

                    custody_evt = EvidenceCustodyEvent(
                        evidence_id=ev_item.id,
                        case_id=ev_spec["case"].id,
                        event_type=step["type"],
                        from_user_id=step["from_user"].id if step["from_user"] else None,
                        to_user_id=step["to_user"].id,
                        reason=step["reason"],
                        location=step.get("location"),
                        file_hash_at_event=ev_spec["file_hash"],
                        previous_event_hash=prev_custody_hash,
                        event_hash=e_hash,
                        acknowledgement_status="acknowledged",
                        acknowledged_at=step_time,
                        event_metadata={
                            "verified_algorithm": "SHA-256",
                            "protocol": "BSA-2023-CUSTODY-V2",
                        },
                    )
                    custody_evt.created_at = step_time
                    session.add(custody_evt)
                    prev_custody_hash = e_hash

                await add_audit(
                    action="EVIDENCE_REGISTERED",
                    res_type="evidence",
                    res_id=ev_item.id,
                    actor=ev_spec["registered_by"],
                    case_id=ev_spec["case"].id,
                    details={
                        "evidence_number": ev_item.evidence_number,
                        "type": ev_item.evidence_type,
                        "custodian": ev_spec["current_custodian"].full_name,
                        "hash": ev_spec["file_hash"],
                    },
                )
                print(f"  [+] Seeded Evidence & Hash Chain: {ev_item.evidence_number} - {ev_item.title[:40]}")
            else:
                print(f"  - Evidence present: {ev_item.evidence_number}")

        await session.flush()

        # -------------------------------------------------------------
        # 7. Seed Legal Court Export Package (Legal Officer view)
        # -------------------------------------------------------------
        exp_q = select(CaseExport).where(CaseExport.case_id == c2.id)
        exp_res = await session.execute(exp_q)
        if not exp_res.scalar_one_or_none():
            export_pkg = CaseExport(
                case_id=c2.id,
                requested_by_id=pros_user.id,
                file_name=f"LEGAL_EXPORT_{c2.case_number}.zip",
                storage_path=f"exports/{c2.id}/LEGAL_EXPORT_{c2.case_number}.zip",
                file_size_bytes=8532100,
                file_hash_sha256="9b54c86bf4148b89d6e814e52643a6d45e12f8623b092a95c918bb138546de32",
                manifest_hash_sha256="48c21a37c449dbbc06428c03e223b9d0315efb6451e01f6874e0d9b4c0316492",
                integrity_status="verified",
                export_status="completed",
                verification_summary={
                    "total_documents": 2,
                    "total_evidence": 1,
                    "chain_of_custody_verified": True,
                    "bsa_section_65b_certificate_present": True,
                    "certified_by": pros_user.full_name,
                    "certification_timestamp": datetime.now(UTC).isoformat(),
                },
                manifest_data={
                    "case_number": c2.case_number,
                    "court": "Hon'ble Principal City Civil & Sessions Court, Commercial Division, Bengaluru",
                    "exhibits": [
                        {"exhibit_id": "P-1", "title": "Charge Sheet", "sha256": "4b227777d4dd1fc..."},
                        {"exhibit_id": "P-2", "title": "CFSL Digital Forensics Report", "sha256": "ef2d127de37..."},
                        {"exhibit_id": "MO-1", "title": "AWS S3 Access Logs", "sha256": "e5f67890123..."},
                    ],
                },
            )
            session.add(export_pkg)
            await add_audit(
                action="LEGAL_PACKAGE_EXPORTED",
                res_type="case_export",
                res_id=c2.id,
                actor=pros_user,
                case_id=c2.id,
                details={"package": export_pkg.file_name, "sha256": export_pkg.file_hash_sha256},
            )
            print(f"  [+] Generated Legal Court Export Package for {c2.case_number}")

        # -------------------------------------------------------------
        # 8. Seed Security Monitoring Events (System Admin & SP view)
        # -------------------------------------------------------------
        SECURITY_EVENTS = [
            {
                "event_type": "BRUTE_FORCE_ATTEMPT_BLOCKED",
                "severity": "critical",
                "category": "AUTHENTICATION",
                "actor": None,
                "case_id": None,
                "ip": "198.51.100.42",
                "resolved": False,
                "details": {
                    "reason": "Exceeded 5 consecutive failed login attempts on portal endpoint.",
                    "targeted_identity": "admin@ncrb.gov.in",
                    "origin_country": "Anonymous Proxy / Tor Relay",
                    "mitigation": "Automated IP drop rule triggered in perimeter firewall for 24 hours.",
                },
            },
            {
                "event_type": "CRYPTOGRAPHIC_INTEGRITY_TAMPER_FLAGGED",
                "severity": "high",
                "category": "INTEGRITY",
                "actor": None,
                "case_id": c1.id,
                "ip": "10.0.4.19",
                "resolved": False,
                "details": {
                    "reason": "Simulated bit-flip verification probe failed on document version test vector.",
                    "resource": "Test Evidence Container #TEST-99",
                    "expected_sha256": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
                    "evaluated_sha256": "9999456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
                    "action_taken": "Incident flagged in real-time Security Operations Center dashboard.",
                },
            },
            {
                "event_type": "UNAUTHORIZED_IDOR_CASE_PROBE_BLOCKED",
                "severity": "medium",
                "category": "AUTHORIZATION",
                "actor": inv_user,
                "case_id": c3.id,
                "ip": "10.14.2.105",
                "resolved": True,
                "details": {
                    "reason": "Continuous authentication check detected case access attempt without active roster membership.",
                    "case_number": c3.case_number,
                    "action_taken": "Zero-trust policy enforced 404 EntityNotFound response to mask case existence.",
                },
            },
            {
                "event_type": "CHAIN_OF_CUSTODY_ROUTINE_AUDIT_PASSED",
                "severity": "info",
                "category": "CUSTODY",
                "actor": admin_user,
                "case_id": c1.id,
                "ip": "127.0.0.1",
                "resolved": True,
                "details": {
                    "reason": "Automated nightly cryptographic custody chain reconciliation executed.",
                    "events_verified": 4,
                    "broken_links_found": 0,
                    "audit_status": "ALL CHAINS INTACT AND CRYPTOGRAPHICALLY VALID",
                },
            },
        ]

        for s_evt in SECURITY_EVENTS:
            sq = select(SecurityEvent).where(
                SecurityEvent.event_type == s_evt["event_type"],
                SecurityEvent.category == s_evt["category"],
            )
            s_res = await session.execute(sq)
            if not s_res.scalar_one_or_none():
                sec_obj = SecurityEvent(
                    event_type=s_evt["event_type"],
                    severity=s_evt["severity"],
                    category=s_evt["category"],
                    actor_id=s_evt["actor"].id if s_evt["actor"] else None,
                    case_id=s_evt["case_id"],
                    resource_type="system_resource",
                    ip_address=s_evt["ip"],
                    details=s_evt["details"],
                    resolved=s_evt["resolved"],
                    resolved_by=admin_user.id if s_evt["resolved"] else None,
                    resolved_at=datetime.now(UTC) if s_evt["resolved"] else None,
                )
                session.add(sec_obj)
                print(f"  [+] Logged Security Event: [{s_evt['severity'].upper()}] {s_evt['event_type']}")

        await session.commit()

    print("=================================================================")
    print("  DOCSHIELD: ALL DEMO DATA & MULTI-ROLE SCENARIOS SEEDED!")
    print("=================================================================")
    print("Available Multi-Role Accounts:")
    print("  1. System Admin    : admin@ncrb.gov.in      / Admin@DocShield2026!")
    print("  2. Investigator    : officer@ncrb.gov.in    / Investigator@2026!")
    print("  3. Forensic Expert : forensic@ncrb.gov.in   / ForensicExpert@2026!")
    print("  4. Legal Officer   : prosecutor@ncrb.gov.in / Prosecutor@2026!")
    print("  5. Supervisor (SP) : supervisor@ncrb.gov.in / Supervisor@2026!")
    print("=================================================================")


if __name__ == "__main__":
    asyncio.run(seed_demo_data())
