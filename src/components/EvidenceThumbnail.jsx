import React from 'react';

export default function EvidenceThumbnail({ type, label }) {
  switch (type) {
    case 'knife':
      return (
        <div className="ev-thumbnail-container" title={label || "Weapon / Knife"}>
          <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="44" height="44" fill="#E2E8F0"/>
            {/* Knife blade angled */}
            <path d="M10 34L17 27L22 28L15 35L10 34Z" fill="#1E293B"/>
            <path d="M17 27L36 10C35 15 32 20 22 28L17 27Z" fill="#94A3B8"/>
            <path d="M19 25L34 12C33 16 30 19 23 25Z" fill="#CBD5E1"/>
            <circle cx="13" cy="31" r="1" fill="#FFFFFF"/>
          </svg>
        </div>
      );

    case 'cctv':
      return (
        <div className="ev-thumbnail-container" title={label || "CCTV Camera Footage"}>
          <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="44" height="44" fill="#0F172A"/>
            {/* Dark corridor surveillance view */}
            <rect x="6" y="8" width="32" height="28" fill="#1E293B" stroke="#334155" strokeWidth="1"/>
            <path d="M6 8L16 16V28L6 36" fill="#090D16" opacity="0.6"/>
            <path d="M38 8L28 16V28L38 36" fill="#090D16" opacity="0.6"/>
            <rect x="18" y="16" width="8" height="12" fill="#020617"/>
            {/* REC indicator & timestamp */}
            <circle cx="10" cy="12" r="1.5" fill="#EF4444"/>
            <rect x="14" y="32" width="16" height="2" fill="#10B981" opacity="0.7"/>
          </svg>
        </div>
      );

    case 'scene':
      return (
        <div className="ev-thumbnail-container" title={label || "Crime Scene Photograph"}>
          <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="44" height="44" fill="#D1D5DB"/>
            <rect x="4" y="4" width="36" height="36" fill="#F3F4F6"/>
            {/* Scene representation */}
            <rect x="7" y="7" width="30" height="30" fill="#9CA3AF"/>
            <polygon points="12,32 20,20 28,32" fill="#6B7280"/>
            <polygon points="24,32 30,24 35,32" fill="#4B5563"/>
            <circle cx="14" cy="14" r="3" fill="#E5E7EB"/>
            {/* Forensic evidence yellow marker card */}
            <rect x="22" y="24" width="8" height="9" fill="#FACC15" rx="1"/>
            <text x="24" y="31" fontSize="6" fontWeight="bold" fill="#000000">3</text>
          </svg>
        </div>
      );

    case 'audio':
      return (
        <div className="ev-thumbnail-container" title={label || "Audio Waveform Recording"}>
          <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="44" height="44" fill="#090D16"/>
            {/* Soundwave bars */}
            <g fill="#F59E0B">
              <rect x="6" y="20" width="2" height="4" rx="1"/>
              <rect x="10" y="17" width="2" height="10" rx="1"/>
              <rect x="14" y="12" width="2" height="20" rx="1"/>
              <rect x="18" y="8" width="2" height="28" rx="1"/>
              <rect x="22" y="14" width="2" height="16" rx="1"/>
              <rect x="26" y="7" width="2" height="30" rx="1"/>
              <rect x="30" y="13" width="2" height="18" rx="1"/>
              <rect x="34" y="18" width="2" height="8" rx="1"/>
            </g>
          </svg>
        </div>
      );

    case 'phone':
      return (
        <div className="ev-thumbnail-container" title={label || "Mobile Phone Device"}>
          <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="44" height="44" fill="#F1F5F9"/>
            {/* Smartphone body */}
            <rect x="13" y="6" width="18" height="32" rx="4" fill="#0F172A" stroke="#334155" strokeWidth="1"/>
            {/* Screen */}
            <rect x="15" y="9" width="14" height="24" rx="2" fill="#1E293B"/>
            {/* Speaker & camera dot */}
            <circle cx="22" cy="7.5" r="0.75" fill="#64748B"/>
            {/* Screen glance line */}
            <line x1="16" y1="12" x2="27" y2="24" stroke="#475569" strokeWidth="1" opacity="0.4"/>
            <circle cx="22" cy="35.5" r="1" fill="#475569"/>
          </svg>
        </div>
      );

    case 'cdr':
      return (
        <div className="ev-thumbnail-container" title={label || "Call Records Document"}>
          <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="44" height="44" fill="#F8FAFC"/>
            {/* Spreadsheet / CDR doc */}
            <rect x="7" y="6" width="30" height="32" rx="2" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1"/>
            <rect x="7" y="6" width="30" height="7" fill="#3B82F6" rx="2"/>
            {/* Table lines */}
            <line x1="7" y1="18" x2="37" y2="18" stroke="#E2E8F0" strokeWidth="1"/>
            <line x1="7" y1="24" x2="37" y2="24" stroke="#E2E8F0" strokeWidth="1"/>
            <line x1="7" y1="30" x2="37" y2="30" stroke="#E2E8F0" strokeWidth="1"/>
            <line x1="17" y1="13" x2="17" y2="38" stroke="#E2E8F0" strokeWidth="1"/>
            <line x1="27" y1="13" x2="27" y2="38" stroke="#E2E8F0" strokeWidth="1"/>
            <text x="10" y="11" fontSize="4.5" fill="#FFFFFF" fontWeight="bold">CDR</text>
          </svg>
        </div>
      );

    case 'cash':
      return (
        <div className="ev-thumbnail-container" title={label || "Recovered Cash Currency"}>
          <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="44" height="44" fill="#E2E8F0"/>
            {/* Bundles of currency */}
            <g transform="translate(6, 10)">
              <rect x="2" y="8" width="28" height="14" rx="2" fill="#047857" stroke="#065F46" strokeWidth="0.75"/>
              <rect x="1" y="4" width="28" height="14" rx="2" fill="#059669" stroke="#047857" strokeWidth="0.75"/>
              <rect x="0" y="0" width="28" height="14" rx="2" fill="#10B981" stroke="#059669" strokeWidth="0.75"/>
              {/* Currency ribbon strap */}
              <rect x="10" y="0" width="8" height="14" fill="#D97706" opacity="0.8"/>
              <circle cx="14" cy="7" r="3" fill="#A7F3D0"/>
            </g>
          </svg>
        </div>
      );

    case 'laptop':
      return (
        <div className="ev-thumbnail-container" title={label || "Seized Laptop Computer"}>
          <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="44" height="44" fill="#F1F5F9"/>
            {/* Open laptop */}
            {/* Screen */}
            <rect x="10" y="8" width="24" height="17" rx="2" fill="#0F172A" stroke="#334155" strokeWidth="1"/>
            <rect x="12" y="10" width="20" height="13" rx="1" fill="#2563EB"/>
            {/* Keyboard base */}
            <polygon points="6,29 38,29 35,25 9,25" fill="#334155"/>
            <rect x="8" y="28.5" width="28" height="2" rx="1" fill="#1E293B"/>
            <rect x="18" y="27" width="8" height="1.5" rx="0.5" fill="#64748B"/>
          </svg>
        </div>
      );

    default:
      return (
        <div className="ev-thumbnail-container" title={label || "Physical Item"}>
          <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="44" height="44" fill="#F1F5F9"/>
            <rect x="10" y="10" width="24" height="24" rx="3" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1"/>
            <path d="M15 16H29M15 22H29M15 28H23" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
      );
  }
}
