import React from 'react';

// Memoized SVG Icon Components - defined once, reused everywhere
export const FilesIcon = React.memo(() => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 3h8l2 2h8c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2z" fill="#4A90E2"/>
  </svg>
));

export const NotesIcon = React.memo(() => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <rect x="3" y="3" width="18" height="18" rx="2" fill="#FFD93D"/>
    <line x1="3" y1="9" x2="21" y2="9" stroke="#333" strokeWidth="0.5"/>
    <line x1="3" y1="13" x2="21" y2="13" stroke="#333" strokeWidth="0.5"/>
    <line x1="3" y1="17" x2="21" y2="17" stroke="#333" strokeWidth="0.5"/>
  </svg>
));

export const SettingsIcon = React.memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 48 48">
    <circle cx="24" cy="24" r="4" fill="#616161"/>
    <path d="M24 2c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2s2-.9 2-2V4c0-1.1-.9-2-2-2zm0 36c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2s2-.9 2-2v-4c0-1.1-.9-2-2-2zM4 24c0-1.1-.9-2-2-2H-2c-1.1 0-2 .9-2 2s.9 2 2 2h4c1.1 0 2-.9 2-2zm36 0c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2s.9 2 2 2h4c1.1 0 2-.9 2-2z" fill="#616161"/>
  </svg>
));

export const CalcIcon = React.memo(() => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <rect x="2" y="2" width="20" height="20" rx="3" fill="#E8E8E8" stroke="#666" strokeWidth="1"/>
    <rect x="4" y="4" width="4" height="4" fill="#FF6B6B"/>
    <rect x="10" y="4" width="4" height="4" fill="#FF6B6B"/>
    <rect x="16" y="4" width="4" height="4" fill="#FF6B6B"/>
    <line x1="4" y1="10" x2="20" y2="10" stroke="#999" strokeWidth="1"/>
    <rect x="4" y="12" width="4" height="4" fill="#4A90E2"/>
    <rect x="10" y="12" width="4" height="4" fill="#4A90E2"/>
    <rect x="16" y="12" width="4" height="4" fill="#4A90E2"/>
  </svg>
));

export const TerminalIcon = React.memo(() => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <rect x="2" y="2" width="20" height="20" rx="2" fill="#1a1a1a" stroke="#00FF00" strokeWidth="1.5"/>
    <path d="M 5 10 L 10 15 L 15 10" stroke="#00FF00" strokeWidth="1.5" fill="none"/>
    <circle cx="18" cy="15" r="2" fill="#00FF00"/>
  </svg>
));

export const GamesIcon = React.memo(() => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <rect x="2" y="6" width="20" height="12" rx="2" fill="#E84C3D"/>
    <circle cx="7" cy="12" r="1.5" fill="#FFF"/>
    <circle cx="10" cy="10" r="1" fill="#FFF"/>
    <circle cx="10" cy="14" r="1" fill="#FFF"/>
    <circle cx="13" cy="12" r="1" fill="#FFF"/>
    <line x1="16" y1="10" x2="18" y2="10" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="16" y1="14" x2="18" y2="14" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round"/>
    <rect x="3" y="4" width="18" height="2" rx="1" fill="#333"/>
  </svg>
));

export const PacManIcon = React.memo(() => (
  <svg width="24" height="24" viewBox="30 50 410 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M 230 110 L 170 70 A 80 80 0 1 1 170 140 Z" fill="#FFD700" stroke="#000" strokeWidth="6"/>
    <circle cx="215" cy="75" r="8" fill="#000"/>
  </svg>
));
