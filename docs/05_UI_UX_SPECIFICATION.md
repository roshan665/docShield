# 05. UI/UX Specification — DocShield (SIH 26190)

```yaml
Status: CURRENT
Version: 1.0
Scope: Inspector
```

---

## 1. Design Language & Visual Aesthetics

DocShield adopts a **modern, light-themed police and legal SaaS design language**. The aesthetic conveys institutional trust, forensic precision, high legibility under pressure, and zero visual clutter.

### 1.1 Core Visual Identity
- **Theme**: Crisp Light Theme (White and Light Blue surfaces with high-contrast Slate/Navy text).
- **Layout Principle**: **Strictly Horizontal Top Navigation — Absolutely NO Left Sidebar**. This maximizes horizontal real estate for expansive evidentiary tables, legal depositions, and forensic timelines.
- **Surface Elevation**: Soft white cards (`#FFFFFF`) with subtle 1px border lines (`#E2E8F0`) and gentle ambient box shadows (`0 1px 3px rgba(0, 0, 0, 0.05)`).
- **Corner Radii**: Consistent modern rounded corners (Cards: `8px`, Buttons: `6px`, Badges/Pills: `9999px`).
- **Typography**: Clean, neutral, high-legibility sans-serif (`Inter`, `system-ui`, `-apple-system`, `sans-serif`) with strict hierarchy.
- **Status Indicators**: Compact, rounded status pills with pastel backgrounds and saturated text labels.

---

## 2. Global Shell & Persistent Elements

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [DocShield Logo]  Dashboard   Cases   Documents   Evidence   Forensics   ChargeSheets   Court   CoC   AuditLogs │  [Search...]  (🔔 3)  [👤 Insp. Sharma | Bhopal Central] │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
│ Home > Cases > CR-2026-BH-0042                                                                                  │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                            MAIN APPLICATION WORKSPACE                                           │
│                                                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 2.1 Horizontal Top Navigation Bar
- **Height**: Fixed `64px` height, sticky at the top (`position: sticky; top: 0; z-index: 50`).
- **Background**: Solid `#FFFFFF` with a subtle bottom border (`1px solid #E2E8F0`).
- **Left Brand Section**:
  - Shield Icon in Deep Navy (`#0F172A`).
  - Text: **DocShield** in bold `18px`, with a small subtitle pill `SIH 26190`.
- **Center Navigation Links**:
  - Links: `Dashboard`, `Cases`, `Documents`, `Evidence`, `Forensics`, `Charge Sheets`, `Court Filings`, `Chain of Custody`, `Audit Logs`.
  - Inactive State: `#475569` text, `font-weight: 500`, hover transition to `#1E293B`.
  - Active State: High-contrast Navy pill background (`#0F172A`) with pure white text (`#FFFFFF`), or subtle light blue fill (`#EFF6FF`) with deep blue text (`#1D4ED8`).
- **Right Utility Section**:
  - **Quick Search Input**: Compact `240px` width input with magnifying glass icon (`Ctrl + K` shortcut trigger).
  - **Notification Bell**: Bell icon button with red badge counter for pending actions or integrity alerts.
  - **Inspector Profile Pill**:
    - Rounded badge containing Inspector Avatar / Initials (`AS`).
    - Title: `Insp. A. Sharma`.
    - Station Subtext: `Bhopal Central PS`.
    - Click reveals profile popover with `Logout` action.

---

## 3. Screen Specifications

### 3.1 Inspector Dashboard (`/` or `/dashboard`)
The dashboard is the operational headquarters for the investigating officer.

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Good Morning, Inspector Sharma — Bhopal Central Police Station                                                  │
│ Active Duty Shift | Tuesday, 23 September 2026                                                                   │
├───────────────┬───────────────┬───────────────┬─────────────────────────┬───────────────────────────────────────┤
│ ACTIVE CASES  │ DOCUMENTS     │ EVIDENCE      │ CHARGE SHEETS           │ INTEGRITY VERIFIED                    │
│ 14            │ 128           │ 42 Items      │ 3 Pending Filing        │ 98.4%                                 │
│ 2 High Priority│ 12 Pending Ver│ 6 In-Transit  │ Next due: 4 days        │ 126/128 Verified (2 Pending)          │
└───────────────┴───────────────┴───────────────┴─────────────────────────┴───────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┬───────────────────────────────────────────────────┐
│ RECENT / ASSIGNED CASES                       [View All ➔]  │ QUICK ACTIONS                                     │
├─────────────────────────────────────────────────────────────┤ ┌───────────────────┐ ┌─────────────────────────┐ │
│ Case No.       Section    Status      Assigned   Docs Evid  │ │ + Add New Case    │ │ 📄 Upload Document      │ │
│ CR-2026-BH-042 IPC 302    Active      Today       14    5   │ ├───────────────────┤ ├─────────────────────────┤ │
│ CR-2026-BH-039 IPC 379    Under Rev   Yesterday    6    2   │ │ 🏷️ Log Evidence   │ │ 🛡️ Run Integrity Audit │ │
│ CR-2026-BH-018 IPC 420    Charge-Sht  12 Sep 26   22    8   │ └───────────────────┘ └─────────────────────────┘ │
├─────────────────────────────────────────────────────────────┴───────────────────────────────────────────────────┤
│ RECENT INVESTIGATION ACTIVITY & AUDIT TRAIL                                                                     │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ • 10:45 AM — Document 'FSL_Ballistics_042.pdf' uploaded for Case CR-2026-BH-042 [SHA-256 Hash Generated]        │
│ • 09:30 AM — Evidence 'EV-BH-0089' transferred from Insp. Sharma to Malkhana In-Charge [Chain of Custody Logged] │
│ • Yesterday — Batch integrity verification completed: 126/128 files verified successfully                       │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Key Dashboard Components:
1. **Header Banner**: Welcoming text, date, and precinct details.
2. **Top Metrics Row (5 Cards)**:
   - **My Active Cases**: Count of ongoing assigned cases with high-priority subtext.
   - **Documents**: Count of uploaded case records with pending verification count.
   - **Evidence Items**: Seized articles count with "in-transit" count.
   - **Charge Sheets**: Active final reports with impending statutory deadline alerts.
   - **Integrity Verified %**: **Derived from actual verification records** (`verified_count / total_count * 100`). Features a subtle progress bar.
3. **Recent / Assigned Cases Table**: 5 most recently active cases with direct deep-links.
4. **Quick Action Grid**: 4 prominent buttons with icons for rapid operational intake.
5. **Recent Activity Feed**: Real-time chronological audit events.

---

### 3.2 Inspector Cases Page (`/cases`)
The dedicated cases workspace provides powerful filtering and search capabilities.

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Cases                                                                                      [ + Add New Case ]   │
│ View and manage all your assigned investigation cases.                                                          │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [ All Cases (14) ]  [ Active (9) ]  [ Under Review (3) ]  [ Charge-Sheeted (2) ]  [ Closed (0) ]                │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [ 🔍 Search by case number, section, complainant, or keyword...                      ] [ All Sections ▼] [Sort ▼]│
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ CASE NO.        SECTION / TYPE       STATUS         ASSIGNED DATE   LAST UPDATED   DOCS  EVID  ACTIONS          │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ CR-2026-BH-0042 IPC 302 (Homicide)   [ Active ]     23 Sep 2026     10 mins ago     14     5   [Open Case ➔]    │
│ CR-2026-BH-0039 IPC 379 (Theft)      [Under Review] 21 Sep 2026     2 hours ago      6     2   [Open Case ➔]    │
│ CR-2026-BH-0035 IPC 307 (Attempt)    [ Active ]     18 Sep 2026     1 day ago       18     7   [Open Case ➔]    │
│ CR-2026-BH-0018 IPC 420 (Fraud)      [Charge-Sheet] 12 Sep 2026     3 days ago      22     8   [Open Case ➔]    │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Showing 1 - 4 of 14 cases                                                              [ < Prev ] [ 1 ] [ Next > ]│
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

#### Interactive Elements:
- **Heading & Subtitle**: Clear institutional headers with primary action button `+ Add New Case` at the top right.
- **Filter Tabs**: Status pills showing counts (`All Cases`, `Active`, `Under Review`, `Charge-Sheeted`, `Closed`).
- **Search & Filter Controls**: Text search with debounced typing; dropdown filters for Legal Sections (`IPC 302`, `IPC 307`, `IPC 379`, `IPC 420`, `BNS Sections`) and Sort orders (`Last Updated`, `Assigned Date`, `Case No`).
- **Cases Table**: High-density table with clean cell padding, formatted dates, document/evidence counters, and action links.

---

### 3.3 Case Detail Workspace (`/cases/:id`)
The central command view when an Inspector opens a specific case.

#### Layout Structure:
1. **Case Header Bar**:
   - Case Title: `CR-2026-BH-0042 — State vs. Unknown (Incident at M.P. Nagar)`
   - Section Badges: `IPC 302 / BNS 103(1)` | Status: `Active` (Green pill).
   - Metadata: `Registration: 23 Sep 2026` | `Station: Bhopal Central` | `IO: Insp. A. Sharma`.
   - Actions: `+ Upload Document`, `+ Log Evidence`, `Generate Case Dossier`.
2. **Contextual Horizontal Tab Navigation**:
   - `Overview` | `FIR` | `Documents` | `Evidence` | `Forensic Reports` | `Charge Sheet` | `Court Filings` | `Chain of Custody` | `Audit Log`.
3. **Tab Content Pane**: Renders the active sub-module.

---

### 3.4 Documents Sub-View & Document Inventory
- **Table Columns**:
  - `Document Name & Type` (e.g., `Panchnama_Seizure_01.pdf` [Panchnama Memo]).
  - `Uploaded By & Timestamp` (`Insp. Sharma | 23 Sep 2026, 09:15 AM`).
  - `File Size` (`2.4 MB`).
  - `SHA-256 Hash Digest` (Truncated display: `a8f5c2...89b1` with "Copy" button).
  - `Integrity Status` (`Verified` in green pill, `Pending` in amber, `Failed` in red).
  - `Actions`: `[View]`, `[Download]`, `[Verify Now]`.

---

### 3.5 Evidence & Chain of Custody Sub-View
- **Evidence Grid/List**:
  - Displays evidence items as structured cards or tabular rows.
  - Seizure Tag ID, Category icon, Description, Seizure Date, Physical Location, Current Holder.
  - Status Pills: `In Custody`, `In Transit`, `At Forensic Lab`, `Court Deposit`.
  - Button: `Transfer Custody` (Opens transfer modal).
- **Chain of Custody Timeline Drawer**:
  - Chronological vertical timeline showing every handover.
  - From: `Insp. Sharma` -> To: `HC Verma (Malkhana In-Charge)`.
  - Purpose: `Safe Keeping in Station Vault` | Timestamp: `23 Sep 2026, 11:30 AM`.
  - Verification Stamp: `Verified with Token`.

---

### 3.6 Forensic Reports Sub-View
- Displays FSL Requisition tracker, dispatched evidence links, and uploaded expert findings.
- Color-coded conclusion summaries (e.g., `Matching Caliber Confirmed`, `DNA Profile Match: 99.98%`).

---

### 3.7 Charge Sheet & Court Filings Sub-View
- **Charge Sheet Staging**: Accused grid, filing deadline tracker (progress ring toward 60/90-day statutory limit), and final report draft preview.
- **Court Docket**: Hearing table with next appearance date, presiding magistrate, and remand details.

---

## 4. Modal Dialogs & Form Patterns

All modal dialogs use centered screen positioning, frosted glass backdrop (`rgba(15, 23, 42, 0.4)`), smooth scale-in animation, and clear header/footer actions.

### 4.1 "Add New Case" Modal
- **Fields**:
  - `Case / Crime Number` (Auto-suggested format: `CR-2026-BH-XXXX`).
  - `Legal Sections` (Multi-select searchable dropdown).
  - `Incident Date & Time` (Native datetime picker).
  - `Registration Date & Time`.
  - `Complainant / Informant Name`.
  - `Incident Location / Landmark`.
  - `Brief Investigation Summary` (Textarea).
- **Footer**: `Cancel` (Secondary button) and `Create Case` (Primary Navy button).

### 4.2 "Upload Document" Modal
- **Drag-and-Drop Dropzone**: Dashed border (`2px dashed #CBD5E1`), file type guidance (`PDF, JPEG, PNG, MP4 up to 50MB`).
- **Classification Selector**: Mandatory radio cards or dropdown for Document Type.
- **Document Title & Reference Notes**.
- **Real-Time Hash Notice**: Informational alert noting: *"Upon upload, a SHA-256 cryptographic digest will be calculated immediately."*

### 4.3 "Transfer Evidence Custody" Modal
- **Fields**:
  - `Evidence Item` (Read-only tag & name).
  - `Current Holder` (Auto-filled with current custodian).
  - `New Holder Name & Badge ID` (Input).
  - `Destination Location` (`Station Malkhana`, `State FSL Bhopal`, `District Court`).
  - `Transfer Reason` (Dropdown: `Forensic Examination`, `Court Production`, `Vault Storage`, `Other`).
  - `Transfer Notes / Dispatch Memo Ref`.

---

## 5. UI Feedback, States & Micro-Interactions

### 5.1 Status Badges (Pills)
- `Verified`: Green surface (`#ECFDF5`), Emerald text (`#047857`), Shield Check icon.
- `Pending Verification`: Amber surface (`#FFFBEB`), Amber text (`#B45309`), Clock icon.
- `Integrity Failed`: Red surface (`#FEF2F2`), Rose text (`#B91C1C`), Alert Octagon icon.
- `Active Case`: Blue surface (`#EFF6FF`), Navy text (`#1D4ED8`).
- `Under Review`: Purple surface (`#FAF5FF`), Purple text (`#7E22CE`).
- `Charge-Sheeted`: Indigo surface (`#EEF2FF`), Indigo text (`#4338CA`).
- `Closed`: Gray surface (`#F1F5F9`), Slate text (`#475569`).

### 5.2 Empty States
- When no records exist (e.g., no documents uploaded yet), render a centered card with a lightweight vector icon, friendly legal prompt (*"No documents attached to this case yet."*), and a direct action button (*"+ Upload First Document"*).

### 5.3 Loading States
- Content loading utilizes subtle animated skeletons matching the exact dimensions of card titles, table rows, and metrics to prevent Cumulative Layout Shift (CLS).

### 5.4 Error States & Toast Notifications
- **Toast Notifications**: Stacked at top-right corner (`top: 80px; right: 24px; z-index: 100`).
  - Green Toast: *"Document uploaded successfully. SHA-256 hash verified."*
  - Red Toast: *"Alert: Integrity verification failed for document Panchnama_02.pdf."*
  - Blue Toast: *"Evidence custody transfer logged to Malkhana."*

---

## 6. Responsive Behavior

- **Desktop (>= 1280px)**: Default optimal view; full horizontal top navbar; multi-column dashboard grid.
- **Laptop / Tablet Landscape (1024px - 1279px)**: Top navigation links adjust font padding; dashboard stat cards wrap into 3 + 2 layout.
- **Tablet Portrait (768px - 1023px)**: Top navbar collapses utility items into an overflow menu; horizontal case tabs become horizontally scrollable with touch friction.
- **Mobile (< 768px)**: Optimized for read-only triage; top nav collapses to a clean top hamburger sheet; tables switch to responsive card stacks.

---

## 7. Document Cross-References
- Product Overview: [01_PRODUCT_OVERVIEW.md](file:///d:/msi/love_you/docs/01_PRODUCT_OVERVIEW.md)
- Inspector Workflow: [03_INSPECTOR_WORKFLOW.md](file:///d:/msi/love_you/docs/03_INSPECTOR_WORKFLOW.md)
- Design Tokens & Components: [06_DESIGN_SYSTEM.md](file:///d:/msi/love_you/docs/06_DESIGN_SYSTEM.md)
- Integrity Logic: [13_DOCUMENT_INTEGRITY.md](file:///d:/msi/love_you/docs/13_DOCUMENT_INTEGRITY.md)
