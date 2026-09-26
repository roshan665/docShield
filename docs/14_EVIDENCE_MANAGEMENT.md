# 14. Evidence Management — DocShield (SIH 26190)

```yaml
Status: CURRENT
Version: 1.0
Scope: Inspector
```

---

## 1. Overview & Forensic Objectives

In law enforcement, evidence wins cases. Any technical weakness in physical seizure logging, digital file extraction, or custodial identification can lead to judicial exclusion under Sections 65B/63 of the Indian Evidence Act (BSA 2023).

DocShield treats evidence as a **first-class, case-centric asset**. Every seized item—whether a physical firearm, a narcotic sample, or an extracted smartphone memory dump—is systematically tagged, cataloged, cryptographically sealed, and tied directly to its parent Case record.

```
┌─────────────────────────────────────────────────────────────┐
│                         CASE RECORD                         │
│                      (CR-2026-BH-0042)                      │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
┌───────────────────────────────┐   ┌───────────────────────────────┐
│       PHYSICAL EVIDENCE       │   │       DIGITAL EVIDENCE        │
│ • Country-made Pistol         │   │ • 64GB SanDisk USB Drive      │
│ • Blood-Stained Garments      │   │ • CCTV Footage Extraction     │
│ • Physical Custody Tag        │   │ • SHA-256 Binary Hash Anchor  │
│ • Station Malkhana Vault Loc. │   │ • Forensic Image Archive      │
└───────────────┬───────────────┘   └───────────────┬───────────────┘
                │                                   │
                └─────────────────┬─────────────────┘
                                  ▼
                    ┌───────────────────────────┐
                    │     CHAIN OF CUSTODY      │
                    │   Chronological Ledger    │
                    └───────────────────────────┘
```

---

## 2. Evidence Categorization & Identification

DocShield establishes standardized evidence classifications aligned with Indian criminal investigation protocols:

| Category Code | Display Name | Examples | Physical or Digital? |
| :--- | :--- | :--- | :--- |
| `FIREARM` | Firearm / Ammunition | Country-made pistols, revolvers, spent cartridges, live rounds. | Physical |
| `BLUNT_WEAPON` | Weapon / Tool of Offense | Iron rods, wooden sticks, knives, sharp tools. | Physical |
| `ELECTRONIC_MEDIA`| Digital / Electronic Media| Hard drives, smartphones, pen drives, SIM cards, CCTV recorders. | Physical & Digital |
| `NARCOTICS` | Narcotics / Psychotropics | Seized substances, chemical pouches, contraband. | Physical |
| `BIOLOGICAL` | Biological / DNA Samples | Blood swabs, clothing, viscera samples, hair strands. | Physical |
| `DOCUMENT` | Physical Documents | Forged cheques, agreements, identity cards, ledgers. | Physical & Digital |
| `VALUABLES` | Cash / Jewelry / Currency | Seized bank notes, gold jewelry, counterfeit currency. | Physical |
| `OTHER` | Miscellaneous Seizure | Vehicles, broken glass, fiber samples. | Physical |

### 2.1 Unique Evidence Tagging System
Every evidence record generates a standardized, human-readable identifier:
```
EV-{STATION_CODE}-{YEAR}-{SEQUENCE_NUMBER}
Example: EV-BH-2026-0089
```
This ID corresponds directly to physical barcoded evidence bags used in police precincts and the official Panchnama memo.

---

## 3. Evidence Metadata Requirements

When logging an evidence item (`POST /api/v1/cases/:id/evidence`), the Inspector records:

```json
{
  "evidenceTag": "EV-BH-2026-0089",
  "caseId": "case_01J8F3",
  "itemName": "Country-made 0.315 Bore Pistol with 1 Spent Cartridge",
  "category": "FIREARM",
  "isDigital": false,
  "seizureDate": "2026-09-22T22:15:00Z",
  "seizureLocation": "Alleyway behind Sector B Market, Bhopal",
  "seizingOfficer": {
    "name": "Insp. A. Sharma",
    "badgeNumber": "INSP-BH-104"
  },
  "panchnamaWitnesses": [
    { "name": "Suresh Patil", "address": "M.P. Nagar, Bhopal", "contact": "98260XXXXX" },
    { "name": "Amit Kushwaha", "address": "Arera Colony, Bhopal", "contact": "94250XXXXX" }
  ],
  "currentLocation": "Station Malkhana Vault Room 2",
  "currentHolder": "HC R. Verma (Malkhana In-Charge)",
  "custodyStatus": "IN_CUSTODY",
  "storageCondition": "Dry Locker, Locked Metal Box #14"
}
```

---

## 4. Digital Evidence & Cryptographic Attachment

For digital evidence (e.g., extracted mobile phone backups, digital audio recordings, or surveillance video):
1. **Direct Payload Upload**: The binary file is ingested via DocShield's encrypted document stream.
2. **Synchronous Cryptographic Sealing**: The backend immediately computes the raw byte SHA-256 hash.
3. **Dual Linkage**: The evidence record is linked via `digital_payload_doc_id` to the `documents` table, inheriting full tamper detection, verification routines, and audit capabilities.

---

## 5. Evidence Operational State Machine

Every evidence item transitions through a formal, auditable state machine:

```
                  ┌──────────────────────┐
                  │      SEIZED /        │
                  │   INITIAL INTAKE     │
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
        ┌───────> │      IN CUSTODY      │ <───────┐
        │         │  (Station Malkhana)  │         │
        │         └──────────┬───────────┘         │
        │                    │                     │
        │                    ▼                     │
        │         ┌──────────────────────┐         │
        │         │      IN TRANSIT      │         │
        │         └──────────┬───────────┘         │
        │                    │                     │
        │          ┌─────────┴─────────┐           │
        │          ▼                   ▼           │
┌───────┴───────────────┐ ┌────────────────────────┴───────┐
│   AT FORENSIC LAB     │ │      PRODUCED IN COURT         │
│   (Testing / FSL)     │ │     (Judicial Deposit)         │
└───────────────────────┘ └────────────────┬───────────────┘
                                           │
                                           ▼
                                ┌─────────────────────┐
                                │  DISPOSED / RELEASED│
                                │   (Court Order)     │
                                └─────────────────────┘
```

| State Code | Operational Context | Permitted Locations |
| :--- | :--- | :--- |
| `IN_CUSTODY` | Securely deposited in the police station locker or Malkhana. | Station Vault, IO Locker |
| `IN_TRANSIT` | Dispatched with an authorized courier, constable, or IO. | En route to Lab / Court |
| `AT_FORENSIC_LAB` | Under chemical, ballistic, or digital examination at FSL. | State FSL Bhopal, CFSL |
| `PRODUCED_IN_COURT` | Presented before the Magistrate during hearing / trial. | District Court, High Court |
| `DISPOSED_RELEASED` | Returned to lawful owner or destroyed per formal court decree.| Post-trial disposition |

---

## 6. Linking Evidence to Case Workflows

Evidence items never exist in isolation; they directly drive subsequent case modules:
1. **Chain of Custody**: Every change of custody state or custodian automatically writes an immutable event into `chain_of_custody_events`.
2. **Forensic Requisitions**: When submitting an item for scientific examination, the requisition references the exact `evidenceTag`.
3. **Charge Sheet Compilation**: The final charge sheet under Sec 173 CrPC / 193 BNSS automatically compiles all seized evidence items into the statutory "Schedule of Seized Property".

---

## 7. Document Cross-References
- Product Vision: [01_PRODUCT_OVERVIEW.md](file:///d:/msi/love_you/docs/01_PRODUCT_OVERVIEW.md)
- Inspector Workflow: [03_INSPECTOR_WORKFLOW.md](file:///d:/msi/love_you/docs/03_INSPECTOR_WORKFLOW.md)
- Database Schema: [10_DATABASE_SCHEMA.md](file:///d:/msi/love_you/docs/10_DATABASE_SCHEMA.md)
- Chain of Custody Specification: [15_CHAIN_OF_CUSTODY.md](file:///d:/msi/love_you/docs/15_CHAIN_OF_CUSTODY.md)
- Forensic Reporting: [20_REPORTING.md](file:///d:/msi/love_you/docs/20_REPORTING.md)
