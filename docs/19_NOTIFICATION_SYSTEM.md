# 19. Notification System — DocShield (SIH 26190)

```yaml
Status: CURRENT
Version: 1.0
Scope: Inspector
```

---

## 1. Overview & Operational Need

Police investigations are time-critical operations. Statutory deadlines for charge sheets (60 or 90 days under CrPC Section 167 / BNSS Section 187), urgent evidence transfers, and unexpected cryptographic integrity alerts require immediate, clear officer notification.

The DocShield Notification System delivers **targeted, case-linked, priority-driven alerts** to the Police Inspector through an in-app notification center and real-time banner updates.

---

## 2. Notification Triggers & Categories

DocShield triggers notifications across 7 operational events:

| Category Code | Trigger Event | Priority | Notification Message Template |
| :--- | :--- | :--- | :--- |
| `INTEGRITY_ALERT` | SHA-256 mismatch detected during document verification. | **CRITICAL** | `CRITICAL: Integrity failure detected in document '{doc_title}' for Case {case_no}. Immediate inspection required.` |
| `DEADLINE_ALERT` | Statutory 60/90-day charge sheet deadline approaching. | **HIGH** | `DEADLINE WARNING: {days_left} days remaining to file Final Charge Sheet for Case {case_no}.` |
| `CUSTODY_UPDATE` | Evidence custody transfer initiated or completed. | **NORMAL** | `Evidence {evidence_tag} transferred from {sender} to {receiver} ({reason}).` |
| `FORENSIC_RESULT`| FSL report attached to active case. | **NORMAL** | `Forensic report for Evidence {evidence_tag} received from State FSL Bhopal.` |
| `CASE_ASSIGNMENT`| New case assigned to the Inspector. | **NORMAL** | `New investigation assigned: Case {case_no} ({section}).` |
| `VERIFY_COMPLETE`| Batch document verification run finishes. | **LOW** | `Batch integrity check complete: {verified_count}/{total_count} documents verified successfully.` |
| `COURT_HEARING` | Upcoming court appearance reminder (48h prior). | **NORMAL** | `Court Hearing scheduled for Case {case_no} before {court_name} on {hearing_date}.` |

---

## 3. Data Schema & Notification Model

All notifications are persisted in the `notifications` table:

```json
{
  "id": "notif_01J8F3BB1",
  "recipientId": "usr_9918",
  "caseId": "case_01J8F3",
  "category": "INTEGRITY_ALERT",
  "priority": "CRITICAL",
  "title": "Document Tamper Warning",
  "message": "SHA-256 hash mismatch detected in Panchnama_02.pdf for Case CR-2026-BH-0042.",
  "isRead": false,
  "actionUrl": "/cases/case_01J8F3?tab=documents",
  "createdAt": "2026-09-23T07:15:00Z"
}
```

---

## 4. UI & Delivery Mechanisms

### 4.1 Persistent Navigation Bell Indicator
- Located in the horizontal top navigation bar.
- Displays an active numeric badge counter indicating total unread alerts (e.g., `(🔔 3)`).
- Critical alerts pulse with a subtle crimson badge.

### 4.2 In-App Notification Center Popover
Clicking the bell icon reveals a clean, lightweight drawer:
```
┌─────────────────────────────────────────────────────────────┐
│ Notifications                                 [Mark All Read]│
├─────────────────────────────────────────────────────────────┤
│ 🔴 CRITICAL: Hash mismatch detected in Panchnama_02.pdf      │
│    Case CR-2026-BH-0042 • 10 mins ago          [Inspect ➔]  │
├─────────────────────────────────────────────────────────────┤
│ 🟡 DEADLINE: 4 days remaining to file Charge Sheet          │
│    Case CR-2026-BH-0039 • 2 hours ago          [Open Case ➔]│
├─────────────────────────────────────────────────────────────┤
│ 🔵 CUSTODY: EV-BH-0089 deposited in Station Malkhana        │
│    Released by Insp. Sharma • 4 hours ago      [View CoC ➔] │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 Real-Time Screen Banners (Toasts)
- Temporary 5-second toast banners appear at the top-right of the viewport for newly received alerts during active sessions.
- Critical integrity failures persist until explicitly dismissed by the Inspector.

---

## 5. Notification Lifecycle & Retention

1. **Creation**: Triggered synchronously by domain service events (e.g., inside `verifyDocument` or scheduled deadline cron).
2. **Read Status Mutation**:
   - `PATCH /api/v1/notifications/:id/read` marks a single item read.
   - `POST /api/v1/notifications/mark-all-read` clears unread counters for the Inspector.
3. **Retention**: Notifications persist for 90 days, after which read notifications are cleaned up while high-priority integrity alerts remain archived for the lifespan of the case.

---

## 6. Document Cross-References
- Inspector Workflow: [03_INSPECTOR_WORKFLOW.md](file:///d:/msi/love_you/docs/03_INSPECTOR_WORKFLOW.md)
- UI/UX Specifications: [05_UI_UX_SPECIFICATION.md](file:///d:/msi/love_you/docs/05_UI_UX_SPECIFICATION.md)
- API Specification: [09_API_SPECIFICATION.md](file:///d:/msi/love_you/docs/09_API_SPECIFICATION.md)
- Cryptographic Integrity: [13_DOCUMENT_INTEGRITY.md](file:///d:/msi/love_you/docs/13_DOCUMENT_INTEGRITY.md)
