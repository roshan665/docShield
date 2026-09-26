# 06. Design System — DocShield (SIH 26190)

```yaml
Status: CURRENT
Version: 1.0
Scope: Inspector
```

---

## 1. System Philosophy

The DocShield Design System is engineered specifically for institutional law enforcement applications. It balances modern digital SaaS aesthetics with the solemn, rigorous demands of evidence management. The visual framework is **lightweight, distraction-free, and high-contrast**.

---

## 2. Design Tokens

### 2.1 Color Palette

```
Surface Neutral:      #F8FAFC  (Canvas Background)
Card Surface:         #FFFFFF  (Pure White Container)
Borders & Dividers:   #E2E8F0  (Subtle Slate Border)

Brand Primary (Navy): #0F172A  (Deep Navy - Headers, Active States)
Brand Secondary:      #1E3A8A  (Royal Blue - Brand Accents, Primary Buttons)
Accent Blue:          #2563EB  (Interactive Links, Focus Rings)
Light Blue Tint:      #EFF6FF  (Selected Row, Active Tab Tint)

Text Primary:         #0F172A  (Headings, Critical Data)
Text Secondary:       #475569  (Labels, Metadata, Table Headers)
Text Muted:           #94A3B8  (Placeholder, Helper Text)

Status Emerald:       #059669  (Verified / Active)
Status Amber:         #D97706  (Pending / In-Transit)
Status Rose:          #DC2626  (Integrity Failed / Alert)
Status Purple:        #7C3AED  (Forensics / Charge-Sheeted)
```

#### Detailed Token Mapping:
| Token Name | Hex Code | Semantic Role |
| :--- | :--- | :--- |
| `color-bg-canvas` | `#F8FAFC` | Main application background |
| `color-bg-card` | `#FFFFFF` | Cards, tables, modal surfaces |
| `color-bg-subtle` | `#F1F5F9` | Secondary backgrounds, input fills |
| `color-border-subtle` | `#E2E8F0` | Default card and table borders |
| `color-border-hover` | `#CBD5E1` | Interactive borders on hover |
| `color-brand-navy` | `#0F172A` | Top nav logo, primary text, high-emphasis buttons |
| `color-brand-blue` | `#1E3A8A` | Accent brand identity, focus outlines |
| `color-brand-accent` | `#2563EB` | Interactive links, CTA buttons |
| `color-text-main` | `#0F172A` | Primary typography |
| `color-text-body` | `#334155` | Body copy, table cells |
| `color-text-muted` | `#64748B` | Secondary notes, timestamps |
| `color-success-bg` | `#ECFDF5` | Verified / Completed background |
| `color-success-text` | `#065F46` | Verified / Completed text |
| `color-warning-bg` | `#FFFBEB` | Pending / In-Transit background |
| `color-warning-text` | `#92400E` | Pending / In-Transit text |
| `color-danger-bg` | `#FEF2F2` | Failed / Critical alert background |
| `color-danger-text` | `#991B1B` | Failed / Critical alert text |

---

### 2.2 Typography

- **Font Family**: Modern clean sans-serif stack:
  ```css
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  ```
- **Monospace Stack** (for SHA-256 hashes, timestamps, case IDs):
  ```css
  font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
  ```

| Style Role | Font Size | Font Weight | Line Height | Letter Spacing |
| :--- | :--- | :--- | :--- | :--- |
| **Heading 1 (H1)** | `24px` (`1.5rem`) | `700` (Bold) | `32px` | `-0.02em` |
| **Heading 2 (H2)** | `20px` (`1.25rem`)| `600` (SemiBold) | `28px` | `-0.01em` |
| **Heading 3 (H3)** | `16px` (`1.0rem`) | `600` (SemiBold) | `24px` | `0` |
| **Body Standard** | `14px` (`0.875rem`)| `400` (Regular) | `20px` | `0` |
| **Body Medium** | `14px` (`0.875rem`)| `500` (Medium) | `20px` | `0` |
| **Caption / Meta** | `12px` (`0.75rem`) | `500` (Medium) | `16px` | `+0.01em` |
| **Hash / Code** | `13px` (`0.8125rem`)| `400` (Mono) | `18px` | `+0.02em` |

---

### 2.3 Spacing Scale
DocShield utilizes an 8-point harmonic spacing grid:

| Token | Dimension | Common Use |
| :--- | :--- | :--- |
| `space-1` | `4px` | Inline icon spacing, compact badge padding |
| `space-2` | `8px` | Button inline padding, gap between related chips |
| `space-3` | `12px` | Input vertical padding, list item gaps |
| `space-4` | `16px` | Card internal padding, table cell padding |
| `space-6` | `24px` | Card headers, section dividers, modal padding |
| `space-8` | `32px` | Page container padding, major section gaps |
| `space-12`| `48px` | Major page vertical spacing |

---

### 2.4 Border Radius & Shadows

#### Border Radius
- `radius-sm`: `4px` (Tags, small pills, tooltips)
- `radius-md`: `6px` (Buttons, inputs, dropdown menus)
- `radius-lg`: `8px` (Standard cards, modals, table containers)
- `radius-full`: `9999px` (Status badges, avatar pills, search bars)

#### Shadows (Subtle & Elevation-Driven)
- `shadow-subtle`: `0 1px 2px 0 rgba(0, 0, 0, 0.05)` (Default card elevation)
- `shadow-card`: `0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.08)` (Hover card state)
- `shadow-modal`: `0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.1)` (Modals & popovers)

---

## 3. UI Component Tokens

### 3.1 Buttons
- **Primary Action (Brand)**:
  - Background: `#0F172A` (Navy), Text: `#FFFFFF`.
  - Hover: `#1E293B`, Active: `#020617`.
  - Padding: `8px 16px`, Font: `14px 600`, Radius: `6px`.
- **Secondary (Outline)**:
  - Background: `#FFFFFF`, Border: `1px solid #CBD5E1`, Text: `#334155`.
  - Hover: Background `#F8FAFC`, Border `#94A3B8`.
- **Danger (Destructive)**:
  - Background: `#DC2626`, Text: `#FFFFFF`.
  - Hover: `#B91C1C`.
- **Ghost (Inline / Utility)**:
  - Background: Transparent, Text: `#475569`.
  - Hover: `#F1F5F9`.

### 3.2 Form Inputs & Controls
- **Text Inputs**:
  - Height: `38px`, Background: `#FFFFFF`, Border: `1px solid #CBD5E1`.
  - Padding: `8px 12px`, Font: `14px`.
  - Focus Ring: `border-color: #2563EB; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15)`.
- **Select Dropdowns**:
  - Custom styled chevron, uniform border and focus behavior.
- **Search Bar**:
  - Pill radius (`9999px`), embedded magnifying glass prefix, subtle keyboard shortcut badge (`Ctrl + K`).

### 3.3 Tables
- **Container**: Border `1px solid #E2E8F0`, Radius `8px`, Overflow hidden.
- **Header (`<thead>`)**:
  - Background: `#F8FAFC`, Text: `#475569`, Font: `12px 600 Uppercase`, Letter Spacing: `0.05em`.
  - Height: `44px`, Padding: `12px 16px`.
- **Row (`<tr>`)**:
  - Border bottom: `1px solid #F1F5F9`.
  - Height: `52px`, Padding: `14px 16px`.
  - Hover: `#F8FAFC` smooth background transition.

### 3.4 Status Badges (Pills)
Compact indicators for immediate status recognition:
```css
/* Base Badge */
display: inline-flex;
align-items: center;
gap: 6px;
padding: 2px 10px;
border-radius: 9999px;
font-size: 12px;
font-weight: 600;
line-height: 16px;
```
- **Verified**: `background: #ECFDF5; color: #047857;`
- **Pending**: `background: #FFFBEB; color: #B45309;`
- **Failed**: `background: #FEF2F2; color: #B91C1C;`
- **In-Transit**: `background: #EFF6FF; color: #1D4ED8;`

### 3.5 Modals & Dialogs
- **Backdrop**: `rgba(15, 23, 42, 0.4)` with backdrop-filter: `blur(4px)`.
- **Dialog Body**: Max-width `560px` (standard) or `800px` (complex), Background `#FFFFFF`, Radius `10px`, Padding `24px`.
- **Header**: Title in `18px 600`, close button `X` in top-right corner.
- **Footer**: Right-aligned buttons (`Cancel` and `Confirm`).

---

## 4. Icons & Visual Assets
- **Icon Set**: Feather Icons / Lucide Icons (Clean 1.5px to 2px stroke, modern monochrome styling).
- Core Glyphs:
  - `ShieldCheck` (Verification & Integrity)
  - `FileText` (Documents & Statements)
  - `Package` (Physical & Digital Evidence)
  - `GitCommit` (Chain of Custody)
  - `Activity` (Audit Logs & Telemetry)
  - `Scale` (Court Filings & Legal Section)
  - `Microscope` (Forensic Lab Reports)

---

## 5. Document Cross-References
- Product Vision: [01_PRODUCT_OVERVIEW.md](file:///d:/msi/love_you/docs/01_PRODUCT_OVERVIEW.md)
- UI/UX Application Blueprint: [05_UI_UX_SPECIFICATION.md](file:///d:/msi/love_you/docs/05_UI_UX_SPECIFICATION.md)
- Frontend Architecture: [07_SYSTEM_ARCHITECTURE.md](file:///d:/msi/love_you/docs/07_SYSTEM_ARCHITECTURE.md)
