/**
 * DocShield — Inspector Dashboard Application Logic
 * Smart India Hackathon 2024 (SIH 26190)
 */

// ========================================================
// 1. PRIMARY CASE DATA STORE
// ========================================================
const casesDatabase = {
  "#2024-1768": {
    caseNo: "#2024-1768",
    section: "IPC 302 - Homicide",
    status: "Active",
    docsCount: 12,
    evidCount: 5,
    lastUpdated: "21 Jan 2024",
    complainant: "Rajeshwar Dayal",
    incidentDate: "20 Jan 2024, 22:30",
    station: "Bhopal Central Police Station",
    io: "Insp. Rajesh Kumar [INSP-BH-104]",
    summary: "Fatal physical altercation reported at M.P. Nagar Zone-1. Accused apprehended at site of offense with country-made firearm.",
    documents: [
      { name: "FIR_Form_154_Signed.pdf", type: "FIR", hash: "a8f5c2d3e4b5a6c7...89b1", status: "Verified", size: "2.4 MB" },
      { name: "Spot_Panchnama_Scene_01.pdf", type: "Panchnama", hash: "7b8d4e9c1f2a3b4c...6a7b", status: "Verified", size: "4.1 MB" },
      { name: "Post_Mortem_Exam_Report.pdf", type: "Medical", hash: "3c91a0f5d7e8b9c0...11f2", status: "Verified", size: "1.8 MB" },
      { name: "Deposition_EyeWitness_01.pdf", type: "Statement", hash: "9f2e3d4c5b6a7081...45a9", status: "Verified", size: "850 KB" }
    ],
    evidence: [
      { tag: "EV-BH-2024-0089", name: "Country-made 0.315 Pistol", cat: "Firearm", holder: "HC R. Verma (Malkhana In-Charge)", status: "In Station Vault" },
      { tag: "EV-BH-2024-0090", name: "Spent Brass Cartridge (0.315)", cat: "Ammunition", holder: "State FSL Bhopal", status: "At Forensic Lab" },
      { tag: "EV-BH-2024-0091", name: "Blood Swab on Sterile Gauze", cat: "Biological", holder: "State FSL Bhopal", status: "At Forensic Lab" }
    ],
    custodyTimeline: [
      { date: "21 Jan 2024, 11:30 AM", from: "Insp. Rajesh Kumar", to: "HC R. Verma (Malkhana)", reason: "Safe Custodial Vault Deposit", memo: "RC-BH-2024-410" },
      { date: "21 Jan 2024, 09:00 AM", from: "Crime Scene IO", to: "Insp. Rajesh Kumar", reason: "Initial Seizure under Panchnama", memo: "SPOT-MEMO-01" }
    ]
  },
  "#2024-1654": {
    caseNo: "#2024-1654",
    section: "IPC 376 - Assault",
    status: "Under Review",
    docsCount: 8,
    evidCount: 3,
    lastUpdated: "18 Jan 2024",
    complainant: "Confidential (Victim Statement)",
    incidentDate: "17 Jan 2024, 19:45",
    station: "Bhopal Central Police Station",
    io: "Insp. Rajesh Kumar [INSP-BH-104]",
    summary: "Investigation ongoing under statutory fast-track mandate. Medical examination completed; DNA swabs dispatched to Central Forensic Science Lab.",
    documents: [
      { name: "FIR_CrPC_154_Redacted.pdf", type: "FIR", hash: "e5d6c7b8a9f01234...9988", status: "Verified", size: "1.9 MB" },
      { name: "Medico_Legal_Certificate.pdf", type: "Medical", hash: "1a2b3c4d5e6f7a8b...1234", status: "Verified", size: "3.2 MB" },
      { name: "Deposition_Sec164_Magistrate.pdf", type: "Statement", hash: "99aa88bb77cc66dd...eeff", status: "Pending", size: "1.1 MB" }
    ],
    evidence: [
      { tag: "EV-BH-2024-0072", name: "Victim Apparel Sample", cat: "Biological", holder: "CFSL Bhopal", status: "At Forensic Lab" },
      { tag: "EV-BH-2024-0073", name: "Mobile Phone (OnePlus 9)", cat: "Electronic", holder: "Insp. Rajesh Kumar", status: "In Custody" }
    ],
    custodyTimeline: [
      { date: "18 Jan 2024, 14:00 PM", from: "Insp. Rajesh Kumar", to: "Director, CFSL Bhopal", reason: "DNA Profiling & Toxicological Screen", memo: "RC-2024-FSL-08" }
    ]
  },
  "#2024-1432": {
    caseNo: "#2024-1432",
    section: "IPC 420 - Fraud",
    status: "Active",
    docsCount: 15,
    evidCount: 6,
    lastUpdated: "16 Jan 2024",
    complainant: "State Bank of India (Zonal Branch)",
    incidentDate: "12 Jan 2024, 14:00",
    station: "Bhopal Central Police Station",
    io: "Insp. Rajesh Kumar [INSP-BH-104]",
    summary: "Multi-party fraudulent loan disbursement syndicate. Forged property deeds and unauthorized collateral guarantees seized under Section 91 CrPC.",
    documents: [
      { name: "Bank_Complaint_Audit_Log.pdf", type: "Other", hash: "554433221100aabb...ccdd", status: "Verified", size: "5.8 MB" },
      { name: "Forged_Registry_Deed_04.pdf", type: "Evidence Doc", hash: "8877665544332211...00aa", status: "Verified", size: "4.3 MB" },
      { name: "Accused_Bank_Statement_HDFC.pdf", type: "Statement", hash: "3322114455667788...9900", status: "Verified", size: "2.1 MB" }
    ],
    evidence: [
      { tag: "EV-BH-2024-0055", name: "Forged Notary Stamp & Seal", cat: "Documentary", holder: "Station Malkhana", status: "In Station Vault" },
      { tag: "EV-BH-2024-0056", name: "Dell Laptop with Fake Letterheads", cat: "Electronic", holder: "Cyber Cell Bhopal", status: "Under Digital Forensic Extraction" }
    ],
    custodyTimeline: [
      { date: "16 Jan 2024, 16:30 PM", from: "Insp. Rajesh Kumar", to: "Cyber Crime Cell In-Charge", reason: "Bit-stream disk imaging (EnCase)", memo: "CYBER-EXT-2024-41" }
    ]
  },
  "#2024-1287": {
    caseNo: "#2024-1287",
    section: "NDPS Act",
    status: "Closed",
    docsCount: 10,
    evidCount: 4,
    lastUpdated: "10 Jan 2024",
    complainant: "Narcotics Flying Squad",
    incidentDate: "05 Jan 2024, 02:15",
    station: "Bhopal Central Police Station",
    io: "Insp. Rajesh Kumar [INSP-BH-104]",
    summary: "Seizure of 4.2 kg contraband psychotropic substance. Forensic qualitative test confirmed positive. Formal charge sheet filed before Special NDPS Court.",
    documents: [
      { name: "NDPS_Seizure_Panchnama_Weighment.pdf", type: "Panchnama", hash: "7766554433221100...ffaa", status: "Verified", size: "3.5 MB" },
      { name: "Chemical_Examiner_FSL_Result.pdf", type: "Forensic", hash: "1122334455667788...aacc", status: "Verified", size: "1.4 MB" },
      { name: "Final_Report_ChargeSheet_173.pdf", type: "ChargeSheet", hash: "4455667788990011...2233", status: "Verified", size: "4.8 MB" }
    ],
    evidence: [
      { tag: "EV-BH-2024-0031", name: "Sealed Contraband Pouch (Sample A)", cat: "Narcotics", holder: "Court Malkhana Deposit", status: "Produced in Court" }
    ],
    custodyTimeline: [
      { date: "10 Jan 2024, 11:00 AM", from: "Insp. Rajesh Kumar", to: "Nazir, Special NDPS Court", reason: "Judicial Deposit for Trial Exhibit", memo: "NDPS-COURT-DEP-09" }
    ]
  },
  "#2024-1102": {
    caseNo: "#2024-1102",
    section: "IPC 304 - Culpable Homicide",
    status: "Active",
    docsCount: 11,
    evidCount: 5,
    lastUpdated: "08 Jan 2024",
    complainant: "Dr. Vinod Saxena",
    incidentDate: "07 Jan 2024, 21:00",
    station: "Bhopal Central Police Station",
    io: "Insp. Rajesh Kumar [INSP-BH-104]",
    summary: "Hit-and-run collision on Hoshangabad Road. Offending vehicle identified via smart-city CCTV surveillance feed. Driver arrested; bail opposed.",
    documents: [
      { name: "FIR_Road_Accident_Sec304.pdf", type: "FIR", hash: "9988776655443322...1122", status: "Verified", size: "1.7 MB" },
      { name: "CCTV_Traffic_Junction_04_Extraction.mp4", type: "Media", hash: "aabbccddeeff0011...2233", status: "Verified", size: "38.2 MB" },
      { name: "Vehicle_Mechanical_Inspection_RTO.pdf", type: "Other", hash: "3344556677889900...11aa", status: "Verified", size: "2.3 MB" }
    ],
    evidence: [
      { tag: "EV-BH-2024-0018", name: "Hyundai Creta (MP-04-XX-9901)", cat: "Vehicle", holder: "Station Premises Impound", status: "In Station Vault" },
      { tag: "EV-BH-2024-0019", name: "Vehicle Dashcam SD Card (32GB)", cat: "Electronic", holder: "Insp. Rajesh Kumar", status: "In Custody" }
    ],
    custodyTimeline: [
      { date: "08 Jan 2024, 10:15 AM", from: "Traffic Constable", to: "Insp. Rajesh Kumar", reason: "Impound transfer to Police Station", memo: "IMPOUND-2024-12" }
    ]
  }
};

let currentSelectedCase = "#2024-1768";
let activeCaseTab = "overview";
let currentMenuTargetCase = null;

// ========================================================
// 2. INITIALIZATION & DOM BINDINGS
// ========================================================
document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  setupDropdowns();
  setupGlobalSearch();
});

// Navigation Item Highlighting
function setupNavigation() {
  const navLinks = document.querySelectorAll(".nav-item");
  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      navLinks.forEach(l => l.classList.remove("active"));
      link.classList.add("active");
      const sectionName = link.querySelector("span")?.textContent || "Section";
      showToast(`Navigated to ${sectionName}`);
    });
  });
}

// Global Click Dismiss for Dropdowns
function setupDropdowns() {
  const notifBtn = document.getElementById("notif-btn");
  const notifDropdown = document.getElementById("notif-dropdown");
  const profileBtn = document.getElementById("profile-btn");
  const profileDropdown = document.getElementById("profile-dropdown");
  const searchBtn = document.getElementById("search-btn");
  const quickSearchBox = document.getElementById("quick-search-box");
  const rcm = document.getElementById("row-context-menu");

  notifBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    notifDropdown.classList.toggle("open");
    profileDropdown.classList.remove("open");
    quickSearchBox.classList.remove("open");
    rcm.classList.remove("open");
  });

  profileBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    profileDropdown.classList.toggle("open");
    notifDropdown.classList.remove("open");
    quickSearchBox.classList.remove("open");
    rcm.classList.remove("open");
  });

  searchBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    quickSearchBox.classList.toggle("open");
    if (quickSearchBox.classList.contains("open")) {
      document.getElementById("global-search-input")?.focus();
    }
    notifDropdown.classList.remove("open");
    profileDropdown.classList.remove("open");
    rcm.classList.remove("open");
  });

  document.addEventListener("click", () => {
    notifDropdown?.classList.remove("open");
    profileDropdown?.classList.remove("open");
    quickSearchBox?.classList.remove("open");
    rcm?.classList.remove("open");
  });

  // Prevent dropdown closing when clicking inside
  notifDropdown?.addEventListener("click", e => e.stopPropagation());
  profileDropdown?.addEventListener("click", e => e.stopPropagation());
  quickSearchBox?.addEventListener("click", e => e.stopPropagation());

  // Mark all read button
  document.getElementById("mark-all-read-btn")?.addEventListener("click", () => {
    document.querySelectorAll(".notif-item.unread").forEach(el => el.classList.remove("unread"));
    const badge = document.querySelector(".notif-badge");
    if (badge) badge.style.display = "none";
    showToast("All investigation alerts marked as read.");
  });

  // Logout button
  document.getElementById("logout-btn")?.addEventListener("click", () => {
    if (confirm("Are you sure you want to end your active Inspector session?")) {
      showToast("Inspector session terminated. Redirecting to login...");
      setTimeout(() => location.reload(), 1500);
    }
  });

  // View All buttons
  document.getElementById("view-all-cases-btn")?.addEventListener("click", (e) => {
    e.preventDefault();
    showToast("Displaying all 24 active cases assigned to Bhopal Central PS.");
  });

  document.getElementById("view-all-activity-btn")?.addEventListener("click", (e) => {
    e.preventDefault();
    showToast("Loading full chronological station activity ledger.");
  });
}

// Global Quick Search (Ctrl+K and input typing)
function setupGlobalSearch() {
  const searchInput = document.getElementById("global-search-input");
  
  // Shortcut: Ctrl + K
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      const quickSearchBox = document.getElementById("quick-search-box");
      quickSearchBox?.classList.add("open");
      searchInput?.focus();
    }
    if (e.key === "Escape") {
      document.getElementById("quick-search-box")?.classList.remove("open");
      closeAllModals();
    }
  });

  searchInput?.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase().trim();
    filterCasesTable(query);
  });
}

function filterCasesTable(query) {
  const rows = document.querySelectorAll("#cases-tbody tr");
  let visibleCount = 0;

  rows.forEach(row => {
    const text = row.innerText.toLowerCase();
    if (!query || text.includes(query)) {
      row.style.display = "";
      visibleCount++;
    } else {
      row.style.display = "none";
    }
  });

  const existingEmpty = document.getElementById("search-empty-row");
  if (visibleCount === 0) {
    if (!existingEmpty) {
      const tbody = document.getElementById("cases-tbody");
      const emptyTr = document.createElement("tr");
      emptyTr.id = "search-empty-row";
      emptyTr.innerHTML = `<td colspan="8" style="text-align: center; padding: 24px; color: #64748B;">
        No cases found matching "<strong>${escapeHtml(query)}</strong>".
      </td>`;
      tbody.appendChild(emptyTr);
    }
  } else if (existingEmpty) {
    existingEmpty.remove();
  }
}

// ========================================================
// 3. CASE DETAIL COCKPIT / MODAL
// ========================================================
function openCaseModal(caseNo) {
  const c = casesDatabase[caseNo];
  if (!c) {
    showToast(`Case ${caseNo} not found in active precinct.`);
    return;
  }
  currentSelectedCase = caseNo;

  document.getElementById("modal-case-no").textContent = c.caseNo;
  const statusPill = document.getElementById("modal-case-status");
  statusPill.textContent = c.status;
  statusPill.className = `status-pill ${c.status === 'Active' ? 'status-active' : c.status === 'Under Review' ? 'status-under-review' : 'status-closed'}`;

  document.getElementById("m-doc-count").textContent = c.docsCount;
  document.getElementById("m-evid-count").textContent = c.evidCount;

  switchCaseTab("overview");
  document.getElementById("case-modal-backdrop").classList.add("open");
}

function switchCaseTab(tabName) {
  activeCaseTab = tabName;
  document.querySelectorAll(".modal-tab").forEach(tab => {
    tab.classList.toggle("active", tab.textContent.toLowerCase().includes(tabName));
  });

  const c = casesDatabase[currentSelectedCase];
  const container = document.getElementById("modal-tab-content");

  if (tabName === "overview") {
    container.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px;">
        <div style="background: #F8FAFC; padding: 12px; border-radius: 8px; border: 1px solid #E2E8F0;">
          <div style="font-size: 11px; color: #64748B; font-weight: 600;">LEGAL OFFENSE SECTION</div>
          <div style="font-size: 14px; font-weight: 700; color: #0E1B2C; margin-top: 2px;">${c.section}</div>
        </div>
        <div style="background: #F8FAFC; padding: 12px; border-radius: 8px; border: 1px solid #E2E8F0;">
          <div style="font-size: 11px; color: #64748B; font-weight: 600;">INVESTIGATING OFFICER (IO)</div>
          <div style="font-size: 13px; font-weight: 700; color: #1E6DEB; margin-top: 2px;">${c.io}</div>
        </div>
      </div>
      <div style="margin-bottom: 14px;">
        <label style="font-size: 11.5px; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">INCIDENT SUMMARY</label>
        <p style="font-size: 13px; color: #334155; line-height: 1.5; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 6px; padding: 10px;">${c.summary}</p>
      </div>
      <div style="display: flex; gap: 20px; font-size: 12px; color: #64748B; border-top: 1px solid #F1F5F9; padding-top: 12px;">
        <span><strong>Station:</strong> ${c.station}</span>
        <span><strong>Incident Date:</strong> ${c.incidentDate}</span>
        <span><strong>Complainant:</strong> ${c.complainant}</span>
      </div>
    `;
  } else if (tabName === "documents") {
    let docsHtml = c.documents.map(doc => `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-bottom: 1px solid #F1F5F9;">
        <div>
          <div style="font-weight: 600; font-size: 13px; color: #0E1B2C;">${doc.name}</div>
          <div style="font-size: 11px; color: #64748B; margin-top: 2px;">
            Type: <strong>${doc.type}</strong> • Size: ${doc.size} • SHA-256: <code class="hash-code">${doc.hash}</code>
          </div>
        </div>
        <span class="status-pill ${doc.status === 'Verified' ? 'status-active' : 'status-under-review'}">${doc.status}</span>
      </div>
    `).join("");

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <span style="font-size: 12px; color: #64748B;">All documents secured with SHA-256 baseline hashing.</span>
        <button class="btn btn-primary" style="padding: 4px 10px; font-size: 11.5px;" onclick="openQuickUploadModal()">+ Upload Document</button>
      </div>
      <div style="border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden;">
        ${docsHtml}
      </div>
    `;
  } else if (tabName === "evidence") {
    let evidHtml = c.evidence.map(e => `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-bottom: 1px solid #F1F5F9;">
        <div>
          <span style="font-weight: 700; color: #1E6DEB; font-size: 12px;">${e.tag}</span>
          <div style="font-weight: 600; font-size: 13px; color: #0E1B2C; margin-top: 2px;">${e.name}</div>
          <div style="font-size: 11px; color: #64748B;">Current Holder: <strong>${e.holder}</strong></div>
        </div>
        <span class="status-pill status-under-review">${e.status}</span>
      </div>
    `).join("");

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <span style="font-size: 12px; color: #64748B;">Seized Property Schedule (Section 100 CrPC / 105 BNSS)</span>
        <button class="btn btn-primary" style="padding: 4px 10px; font-size: 11.5px;" onclick="openQuickEvidenceModal()">+ Log Evidence</button>
      </div>
      <div style="border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden;">
        ${evidHtml}
      </div>
    `;
  } else if (tabName === "custody") {
    let cocHtml = c.custodyTimeline.map(step => `
      <div style="position: relative; padding-left: 20px; margin-bottom: 14px; border-left: 2px solid #BFDBFE;">
        <div style="position: absolute; left: -6px; top: 0; width: 10px; height: 10px; border-radius: 50%; background: #1E6DEB;"></div>
        <div style="font-size: 11px; color: #1E6DEB; font-weight: 700;">${step.date}</div>
        <div style="font-size: 13px; font-weight: 600; color: #0E1B2C; margin-top: 2px;">${step.reason}</div>
        <div style="font-size: 11.5px; color: #64748B; margin-top: 1px;">
          Released by: <strong>${step.from}</strong> ➔ Received by: <strong>${step.to}</strong>
        </div>
        <div style="font-size: 11px; color: #94A3B8; margin-top: 2px;">Road Cert / Dispatch Memo: ${step.memo}</div>
      </div>
    `).join("");

    container.innerHTML = `
      <div style="margin-bottom: 12px; font-size: 12px; color: #64748B;">
        Unbroken Chronological Chain of Custody (Section 65B/63 Electronic Record Compliance)
      </div>
      <div style="padding-top: 6px;">
        ${cocHtml}
      </div>
    `;
  }
}

function generateDossierFromModal() {
  showToast(`Generating Certified Legal Dossier for Case ${currentSelectedCase}...`);
  setTimeout(() => {
    showToast(`✓ Case Dossier ${currentSelectedCase}_Certified_Dossier.pdf exported successfully!`);
    closeAllModals();
  }, 1000);
}

// ========================================================
// 4. ROW CONTEXT MENU (•••)
// ========================================================
function toggleCaseRowMenu(event, caseNo) {
  event.stopPropagation();
  currentMenuTargetCase = caseNo;
  const menu = document.getElementById("row-context-menu");
  
  const rect = event.target.getBoundingClientRect();
  menu.style.top = `${rect.bottom + window.scrollY + 4}px`;
  menu.style.left = `${Math.min(rect.left - 160, window.innerWidth - 230)}px`;
  menu.classList.toggle("open");
}

function handleMenuAction(action) {
  document.getElementById("row-context-menu").classList.remove("open");
  if (!currentMenuTargetCase) return;

  if (action === "open") {
    openCaseModal(currentMenuTargetCase);
  } else if (action === "upload") {
    document.getElementById("upload-case-select").value = currentMenuTargetCase;
    openQuickUploadModal();
  } else if (action === "evidence") {
    document.getElementById("evidence-case-select").value = currentMenuTargetCase;
    openQuickEvidenceModal();
  } else if (action === "dossier") {
    showToast(`Exporting official PDF case ledger for ${currentMenuTargetCase}...`);
  }
}

// ========================================================
// 5. QUICK ACTIONS & MODAL HANDLERS
// ========================================================
function closeAllModals() {
  document.querySelectorAll(".modal-backdrop").forEach(m => m.classList.remove("open"));
  document.getElementById("row-context-menu")?.classList.remove("open");
}

function openNewCaseModal() {
  closeAllModals();
  document.getElementById("new-case-modal-backdrop").classList.add("open");
}

function openQuickUploadModal() {
  closeAllModals();
  document.getElementById("upload-modal-backdrop").classList.add("open");
}

function openQuickEvidenceModal() {
  closeAllModals();
  document.getElementById("evidence-modal-backdrop").classList.add("open");
}

function openReportModal() {
  showToast("Compiling Bhopal Police precinct investigation summary...");
  setTimeout(() => {
    showToast("✓ Monthly Station Investigation Report generated!");
  }, 800);
}

function showIntegrityModal() {
  closeAllModals();
  document.getElementById("integrity-modal-backdrop").classList.add("open");
}

// Form Handlers
function handleCreateCase(e) {
  e.preventDefault();
  const caseNo = document.getElementById("form-case-no").value.trim();
  const section = document.getElementById("form-case-section").value.trim();
  const status = document.getElementById("form-case-status").value;

  if (!caseNo || !section) return;

  // Add to database
  casesDatabase[caseNo] = {
    caseNo: caseNo,
    section: section,
    status: status,
    docsCount: 1,
    evidCount: 0,
    lastUpdated: "Just now",
    complainant: "Direct Police Cognizance",
    incidentDate: "Today",
    station: "Bhopal Central Police Station",
    io: "Insp. Rajesh Kumar",
    summary: document.getElementById("form-case-summary").value || "Preliminary investigation initialized under IO purview.",
    documents: [{ name: "Initial_Registration_Memo.pdf", type: "FIR", hash: "66aa88bb77cc...0011", status: "Verified", size: "1.2 MB" }],
    evidence: [],
    custodyTimeline: [{ date: "Today", from: "Duty Officer", to: "Insp. Rajesh Kumar", reason: "Case Assignment", memo: "DIARY-01" }]
  };

  // Prepend row to table
  const tbody = document.getElementById("cases-tbody");
  const tr = document.createElement("tr");
  tr.setAttribute("data-case-id", caseNo);
  tr.innerHTML = `
    <td><span class="case-no-link" onclick="openCaseModal('${caseNo}')">${caseNo}</span></td>
    <td class="type-cell">${escapeHtml(section)}</td>
    <td><span class="status-pill ${status === 'Active' ? 'status-active' : 'status-under-review'}">${status}</span></td>
    <td>1</td>
    <td>0</td>
    <td class="date-cell">Just now</td>
    <td><button class="btn-open-case" onclick="openCaseModal('${caseNo}')">Open</button></td>
    <td class="td-menu">
      <button class="menu-dots-btn" onclick="toggleCaseRowMenu(event, '${caseNo}')" title="More actions">•••</button>
    </td>
  `;
  tbody.insertBefore(tr, tbody.firstChild);

  // Increment KPI Cases
  const casesKpi = document.getElementById("kpi-cases-val");
  casesKpi.textContent = parseInt(casesKpi.textContent) + 1;

  closeAllModals();
  showToast(`Case ${caseNo} registered successfully with SHA-256 cryptographic baseline!`);
}

function handleUploadDoc(e) {
  e.preventDefault();
  const caseNo = document.getElementById("upload-case-select").value;
  const docType = document.getElementById("upload-doc-type").value;
  const fileInput = document.getElementById("file-input");
  const fileName = fileInput.files[0]?.name || `${docType}_Verification_Scan.pdf`;

  // Simulate hash generation
  const randomHash = Array.from({length: 16}, () => Math.floor(Math.random()*16).toString(16)).join("");
  
  if (casesDatabase[caseNo]) {
    casesDatabase[caseNo].docsCount++;
    casesDatabase[caseNo].documents.push({
      name: fileName,
      type: docType,
      hash: `${randomHash}...${randomHash.slice(0, 4)}`,
      status: "Verified",
      size: "2.1 MB"
    });
  }

  // Increment KPI Docs
  const docsKpi = document.getElementById("kpi-docs-val");
  docsKpi.textContent = parseInt(docsKpi.textContent) + 1;

  // Add to Activity Feed
  prependActivity(`<strong>${fileName}</strong> uploaded in <span class="act-case-no">${caseNo}</span>`, "Just now", "blue");

  closeAllModals();
  showToast(`✓ File "${fileName}" cryptographically sealed with SHA-256!`);
}

function handleLogEvidence(e) {
  e.preventDefault();
  const caseNo = document.getElementById("evidence-case-select").value;
  const tag = document.getElementById("evidence-tag").value;
  const cat = document.getElementById("evidence-category").value;
  const loc = document.getElementById("evidence-loc").value;

  if (casesDatabase[caseNo]) {
    casesDatabase[caseNo].evidCount++;
    casesDatabase[caseNo].evidence.push({
      tag: tag,
      name: `${cat} Seizure Item`,
      cat: cat,
      holder: "Insp. Rajesh Kumar",
      status: loc
    });
  }

  // Increment KPI Evidence
  const evidKpi = document.getElementById("kpi-evidence-val");
  evidKpi.textContent = parseInt(evidKpi.textContent) + 1;

  // Add to Activity Feed
  prependActivity(`Evidence item <strong>${tag}</strong> registered in <span class="act-case-no">${caseNo}</span>`, "Just now", "green");

  closeAllModals();
  showToast(`✓ Evidence ${tag} seized and logged to chain of custody.`);
}

function fileSelected(input) {
  if (input.files && input.files[0]) {
    document.getElementById("dropzone-text").innerHTML = `Selected: <strong>${input.files[0].name}</strong> (${(input.files[0].size/1024/1024).toFixed(2)} MB)`;
  }
}

function runIntegrityReverify() {
  const btn = document.getElementById("run-reverify-btn");
  btn.disabled = true;
  btn.textContent = "⏳ Recalculating 156 SHA-256 Hashes...";

  setTimeout(() => {
    btn.disabled = false;
    btn.textContent = "🛡️ Run Full System Re-Verification";
    showToast("✓ Batch Integrity Audit Complete: 156/156 files verified intact. Zero tampering detected.");
    closeAllModals();
  }, 1200);
}

// Activity Prepend Helper
function prependActivity(htmlTitle, timeText, colorClass) {
  const list = document.getElementById("activity-list");
  const div = document.createElement("div");
  div.className = "activity-item";
  div.innerHTML = `
    <div class="act-icon-box act-${colorClass}">
      <svg viewBox="0 0 18 18" fill="currentColor"><path d="M4 2h7l4 4v10H4V2z"/></svg>
    </div>
    <div class="act-content">
      <p class="act-title">${htmlTitle}</p>
      <span class="act-time">${timeText}</span>
    </div>
  `;
  list.insertBefore(div, list.firstChild);
}

// Toast Notifications System
function showToast(message) {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `
    <svg viewBox="0 0 16 16" fill="#10B981" width="16" height="16" style="flex-shrink:0;">
      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l4.992-5.99a.75.75 0 0 0-.01-1.05z"/>
    </svg>
    <span>${message}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// Simple Sanitizer
function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
