import React, { useState, useEffect, useRef, useCallback } from "react";
import { createTheme, ThemeProvider, alpha, styled } from "@mui/material/styles";
import {
  Box, Button, Typography, Paper, CircularProgress, LinearProgress,
  Chip, TextField, IconButton, Tabs, Tab, Divider, Stack, Grid,
  InputAdornment, Tooltip, Select, MenuItem, FormControl, Slider,
  Snackbar, Alert, Menu
} from "@mui/material";
import {
  FileText, Upload, ArrowLeft, CheckCircle2, Sparkles,
  Download, FileDown, ChevronRight, Zap, ShieldCheck, Clock,
  Search, Plus, Trash2, Edit2, Check, X, RotateCcw,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Activity, Layers, Eye, ChevronDown, ChevronUp, Link
} from "lucide-react";

const API_BASE = "https://resume-builder-d63q.onrender.com";

const theme = createTheme({
  palette: {
    primary:    { main: "#2563eb", light: "#3b82f6", dark: "#1d4ed8", contrastText: "#fff" },
    success:    { main: "#16a34a", light: "#22c55e", contrastText: "#fff" },
    error:      { main: "#dc2626", light: "#ef4444", contrastText: "#fff" },
    warning:    { main: "#d97706", light: "#f59e0b" },
    background: { default: "#f5f6fa", paper: "#ffffff" },
    text:       { primary: "#111827", secondary: "#6b7280", disabled: "#9ca3af" },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    h1: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, letterSpacing: "-0.04em" },
    h2: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, letterSpacing: "-0.03em" },
    h3: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700 },
    h4: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700 },
    h5: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 },
    h6: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton:    { styleOverrides: { root: { textTransform: "none", fontWeight: 600, fontFamily: "'Inter', sans-serif" } } },
    MuiPaper:     { styleOverrides: { root: { backgroundImage: "none" } } },
    MuiChip:      { styleOverrides: { root: { fontFamily: "'Inter', sans-serif", fontWeight: 600 } } },
    MuiTextField: { styleOverrides: { root: { fontFamily: "'Inter', sans-serif" } } },
    MuiTab:       { styleOverrides: { root: { textTransform: "none", fontFamily: "'Inter', sans-serif", fontWeight: 500, minHeight: 40 } } },
  },
});

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
*{box-sizing:border-box;transition:background-color .35s ease,border-color .35s ease,color .25s ease}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
@keyframes ripple{to{transform:scale(4);opacity:0}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes shimmer{0%{background-position:0% 0%}100%{background-position:200% 0%}}
@keyframes panelSlide{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}
@keyframes sparkle{0%{transform:scale(0) rotate(0);opacity:1}100%{transform:scale(0) rotate(180deg);opacity:0}}
@keyframes slideDown{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
@keyframes expandIn{from{opacity:0;max-height:0}to{opacity:1;max-height:800px}}
@keyframes hlPulse{0%,100%{opacity:0.75;box-shadow:0 0 0 2px rgba(37,99,235,0.5)}50%{opacity:1;box-shadow:0 0 0 4px rgba(37,99,235,0.25),0 0 16px rgba(37,99,235,0.3)}}
@keyframes hlFadeIn{from{opacity:0;transform:scaleX(0.95)}to{opacity:1;transform:scaleX(1)}}
@keyframes pageBadgeIn{from{opacity:0;transform:translateY(6px) scale(0.9)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes fly-right{from{transform:translateX(-80px)}to{transform:translateX(calc(100vw + 100px))}}
@keyframes fly-left{from{transform:translateX(calc(100vw + 80px)) scaleX(-1)}to{transform:translateX(-80px) scaleX(-1)}}
@keyframes twinkle-star{0%,100%{opacity:.15}50%{opacity:.9}}
@keyframes beam-blink{0%,70%,100%{opacity:1}76%{opacity:.25}82%{opacity:.75}87%{opacity:.4}93%{opacity:.85}}
@keyframes lamp-glow{0%,70%,100%{opacity:1;box-shadow:0 0 22px 8px rgba(255,218,80,.35)}76%{opacity:.3;box-shadow:0 0 6px 2px rgba(255,218,80,.1)}87%{opacity:.5;box-shadow:0 0 12px 4px rgba(255,218,80,.2)}}
@keyframes night-fade-up{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes shoot-star{0%{transform:translate(0,0) scale(1);opacity:.9}100%{transform:translate(180px,90px) scale(0);opacity:0}}
@keyframes screen-pulse{0%,70%,100%{opacity:.85}76%{opacity:.15}87%{opacity:.55}}
@keyframes badge-dot-night{0%,100%{box-shadow:0 0 8px rgba(93,255,144,.6)}50%{box-shadow:0 0 18px rgba(93,255,144,1)}}
.night-editor .field-input-card{border-color:rgba(80,120,255,.22)!important;background:rgba(18,30,85,.65)!important}
.night-editor .field-input-card:hover{border-color:rgba(120,160,255,.5)!important;background:rgba(25,40,100,.75)!important;box-shadow:0 2px 14px rgba(61,107,255,.15)!important}
.night-editor .field-input-card.has-value{border-color:rgba(80,120,255,.28)!important;background:rgba(15,28,80,.7)!important}
.night-editor .field-input-card.modified{border-color:#4a7aff!important;background:rgba(20,40,130,.6)!important}
.night-editor .field-input-card.editing-open{border-color:#7ca1ff!important;background:rgba(10,20,65,.98)!important;box-shadow:0 0 0 3px rgba(124,161,255,.12)!important}
.night-editor .field-card{background:rgba(15,28,80,.7)!important;border-color:rgba(80,120,255,.22)!important}
.night-editor .field-card:hover{border-color:rgba(120,160,255,.45)!important}
.night-editor .sec-accordion{background:rgba(15,28,80,.7)!important;border-color:rgba(80,120,255,.22)!important}
.night-editor .sec-accordion.open{border-color:rgba(120,160,255,.45)!important}
.night-editor ::-webkit-scrollbar-track{background:rgba(8,15,45,.9)}
.night-editor ::-webkit-scrollbar-thumb{background:rgba(80,110,220,.45);border-radius:99px}
.night-editor .field-input-card [class*="MuiTypography"]{color:#c8d8ff!important}
.night-editor .sec-accordion-hdr{background:rgba(15,28,80,.7)!important}
.night-editor .sec-accordion-body{background:rgba(10,20,60,.6)!important;border-top-color:rgba(80,110,220,.2)!important}
::-webkit-scrollbar{width:4px}
::-webkit-scrollbar-track{background:#f1f3f5}
::-webkit-scrollbar-thumb{background:#d1d5db;border-radius:99px}
::-webkit-scrollbar-thumb:hover{background:#9ca3af}
.ripple-container{position:relative;overflow:hidden}
.ripple-effect{position:absolute;border-radius:50%;background:rgba(37,99,235,.1);animation:ripple .5s linear;pointer-events:none}
.glow-input:focus{box-shadow:0 0 0 3px rgba(37,99,235,0.15)!important;border-color:#2563eb!important;outline:none}
.panel-overlay{position:fixed;inset:0;background:rgba(0,0,0,.35);backdrop-filter:blur(4px);z-index:200;animation:fadeIn .2s ease}
.side-panel{position:fixed;top:0;right:0;height:100vh;width:520px;max-width:95vw;background:#fff;border-left:1px solid #e2e4ea;z-index:201;display:flex;flex-direction:column;animation:panelSlide .28s cubic-bezier(.34,1.4,.64,1);box-shadow:-8px 0 40px rgba(0,0,0,.1)}
.field-card{border-radius:10px;border:1px solid #e5e7eb;background:#fff;transition:all .14s;margin-bottom:5px;overflow:hidden}
.field-card:hover{border-color:#c8cbd6;box-shadow:0 2px 12px rgba(0,0,0,.07)}
.field-card.editing{border-color:#2563eb55;box-shadow:0 0 0 3px rgba(37,99,235,0.1),0 4px 20px rgba(37,99,235,.07)}
.bcv-section{border:1px solid #e5e7eb;border-radius:12px;margin-bottom:8px;overflow:hidden;transition:border-color .14s,box-shadow .14s;background:#fff}
.bcv-section:hover{border-color:#c8cbd6}
.bcv-section.open{border-color:#93c5fd;box-shadow:0 2px 16px rgba(37,99,235,0.07)}
.bcv-sec-hdr{display:flex;align-items:center;gap:10px;padding:13px 14px;cursor:pointer;background:#fff;transition:background .12s;user-select:none}
.bcv-sec-hdr:hover{background:#f9fafb}
.bcv-sec-body{background:#fafbfc;border-top:1px solid #f0f1f5;padding:12px}
.bcv-progress-bg{height:4px;border-radius:99px;background:#e5e7eb;overflow:hidden}
.bcv-progress-fill{height:100%;border-radius:99px;background:linear-gradient(90deg,#2563eb,#60a5fa);transition:width .5s cubic-bezier(.34,1.56,.64,1)}
.score-ring{transition:stroke-dashoffset .8s cubic-bezier(.34,1.56,.64,1)}
.tb-btn{display:inline-flex;align-items:center;justify-content:center;height:32px;padding:0 12px;gap:5px;border-radius:7px;border:1px solid #e5e7eb;background:#fff;color:#374151;cursor:pointer;font-size:12px;font-weight:500;transition:all .12s;user-select:none;flex-shrink:0;font-family:'Inter',sans-serif;white-space:nowrap}
.tb-btn:hover{background:#f9fafb;border-color:#c8cbd6;color:#111827}
.tb-btn.active{background:rgba(37,99,235,0.08);border-color:rgba(37,99,235,0.3);color:#2563eb}
.fmt-btn{display:inline-flex;align-items:center;justify-content:center;height:28px;min-width:28px;padding:0 6px;border:none;border-radius:6px;background:transparent;color:#6b7280;cursor:pointer;font-size:12px;transition:all .1s;user-select:none;flex-shrink:0;font-family:'Inter',sans-serif}
.fmt-btn:hover{background:#f3f4f6;color:#111827}
.fmt-btn.on{background:rgba(37,99,235,0.1);color:#2563eb;border:1px solid rgba(37,99,235,0.2)}
.fmt-sel{height:28px;padding:0 8px;border:1px solid #e5e7eb;border-radius:6px;background:#fff;color:#374151;font-size:11.5px;font-family:'Inter',sans-serif;cursor:pointer;outline:none;transition:border-color .1s}
.fmt-sel:focus{border-color:#2563eb}
.bcv-tab{display:flex;align-items:center;gap:5px;padding:9px 14px;font-size:11.5px;font-weight:500;font-family:'Inter',sans-serif;border:none;background:transparent;cursor:pointer;border-bottom:2px solid transparent;color:#6b7280;transition:all .14s;white-space:nowrap}
.bcv-tab:hover{color:#374151;background:#f9fafb}
.bcv-tab.active{color:#2563eb;border-bottom-color:#2563eb;font-weight:600}
.field-input-card{border-radius:12px;border:1.5px solid #e8eaef;background:#f8f9fb;transition:all .18s;margin-bottom:0;overflow:hidden;cursor:pointer;position:relative}
.field-input-card:hover{border-color:#c5cad6;background:#f3f5f9;box-shadow:0 2px 10px rgba(0,0,0,.06)}
.field-input-card.has-value{border-color:#e2e6ec;background:#f5f7fa}
.field-input-card.modified{border-color:#93c5fd;background:#f0f6ff}
.field-input-card.inserted{border-color:#86efac;background:#f0fdf4}
.field-input-card.editing-open{border-color:#2563eb;background:#fff;box-shadow:0 0 0 3px rgba(37,99,235,0.1),0 4px 20px rgba(37,99,235,.08)}
.sec-accordion{border-radius:14px;border:1.5px solid #e8eaef;background:#fff;margin-bottom:10px;overflow:hidden;transition:all .18s}
.sec-accordion:hover{border-color:#d0d5e0}
.sec-accordion.open{border-color:#dbe4f5;box-shadow:0 2px 16px rgba(37,99,235,0.06)}
.sec-accordion-hdr{display:flex;align-items:center;gap:10px;padding:14px 16px;cursor:pointer;user-select:none;transition:background .12s}
.sec-accordion-hdr:hover{background:#fafbff}
.sec-accordion-body{padding:12px 14px 14px;border-top:1.5px solid #f0f2f7}
.field-readonly,.field-readonly *{cursor:not-allowed!important}
.field-readonly:hover{border-color:#e8eaef!important;box-shadow:none!important;background:#f8f9fb!important}
`;

/* ── atoms ── */
const Ico = {
  Dl:    () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Ed:    () => <Edit2 size={13} />,
  Ok:    () => <Check size={13} />,
  X:     () => <X size={13} />,
  Rst:   () => <RotateCcw size={14} />,
  Srch:  () => <Search size={14} />,
  Plus:  () => <Plus size={11} />,
  Trash: () => <Trash2 size={12} />,
  Layers:() => <Layers size={14} />,
  Zap:   () => <Zap size={13} />,
  Grip:  () => <svg width="6" height="20" viewBox="0 0 6 20" fill="currentColor"><circle cx="1.5" cy="2" r="1.2"/><circle cx="4.5" cy="2" r="1.2"/><circle cx="1.5" cy="7" r="1.2"/><circle cx="4.5" cy="7" r="1.2"/><circle cx="1.5" cy="12" r="1.2"/><circle cx="4.5" cy="12" r="1.2"/><circle cx="1.5" cy="17" r="1.2"/><circle cx="4.5" cy="17" r="1.2"/></svg>,
  JD:    () => <FileText size={14} />,
  Match: () => <Activity size={14} />,
  AlL:   () => <AlignLeft size={11} />,
  AlC:   () => <AlignCenter size={11} />,
  AlR:   () => <AlignRight size={11} />,
  AlJ:   () => <AlignJustify size={11} />,
};

const SpinnerEl = ({ size = 14, color = "#2563eb" }) => (
  <span style={{ width: size, height: size, border: `2px solid ${color}30`, borderTop: `2px solid ${color}`, borderRadius: "50%", animation: "spin .7s linear infinite", display: "inline-block", flexShrink: 0 }} />
);

const PillEl = ({ children, bg = "#f3f4f6", color = "#374151", border = "#e5e7eb", style: sx }) => (
  <span style={{ fontSize: 10, padding: "3px 9px", borderRadius: 99, background: bg, color, border: `1px solid ${border}`, fontWeight: 600, letterSpacing: ".03em", fontFamily: "'Inter',sans-serif", ...sx }}>{children}</span>
);

function RippleBtn({ children, variant = "default", disabled, onClick, style: sx, className = "", ...rest }) {
  const ref = useRef(null);
  const fire = (e) => {
    if (disabled) return;
    const btn = ref.current; if (!btn) return;
    const rect = btn.getBoundingClientRect(); const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2; const y = e.clientY - rect.top - size / 2;
    const rip = document.createElement("span"); rip.className = "ripple-effect";
    rip.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px`;
    btn.appendChild(rip); setTimeout(() => rip.remove(), 600);
    if (onClick) onClick(e);
  };
  const base = { padding: "6px 13px", borderRadius: 7, border: "none", cursor: disabled ? "not-allowed" : "pointer", fontSize: 11.5, fontWeight: 600, fontFamily: "'Inter',sans-serif", display: "flex", alignItems: "center", gap: 5, transition: "all .15s", opacity: disabled ? .45 : 1 };
  const variants = {
    default: { background: "#f9fafb", color: "#374151", border: "1px solid #e5e7eb" },
    accent:  { background: "#2563eb", color: "#fff", boxShadow: "0 2px 8px rgba(37,99,235,0.25)" },
    green:   { background: "#16a34a", color: "#fff" },
    ghost:   { background: "transparent", color: "#374151", border: "1px solid #e5e7eb" },
    teal:    { background: "#0891b2", color: "#fff" },
  };
  return <button ref={ref} onClick={fire} disabled={disabled} className={`ripple-container ${className}`} style={{ ...base, ...variants[variant], ...sx }} {...rest}>{children}</button>;
}

function Toast({ message, type = "info", onDone }) {
  const [exiting, setExiting] = useState(false);
  const [progress, setProgress] = useState(100);
  useEffect(() => {
    const dur = 2600; const start = performance.now();
    const tick = (now) => { const p = Math.max(0, 100 - ((now - start) / dur) * 100); setProgress(p); if (p > 0) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
    const t1 = setTimeout(() => setExiting(true), dur); const t2 = setTimeout(() => onDone?.(), dur + 380);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);
  const C = { info: { bg: "#eff6ff", border: "#bfdbfe", color: "#1d4ed8", bar: "#2563eb", icon: "ℹ" }, success: { bg: "#f0fdf4", border: "#bbf7d0", color: "#15803d", bar: "#16a34a", icon: "✓" }, error: { bg: "#fef2f2", border: "#fecaca", color: "#dc2626", bar: "#ef4444", icon: "✗" } }[type] || { bg: "#eff6ff", border: "#bfdbfe", color: "#1d4ed8", bar: "#2563eb", icon: "ℹ" };
  return (
    <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, borderRadius: 12, background: C.bg, border: `1px solid ${C.border}`, boxShadow: "0 8px 30px rgba(0,0,0,.12)", animation: exiting ? "none" : "fadeIn .3s ease", overflow: "hidden", minWidth: 230, opacity: exiting ? 0 : 1, transition: "opacity .3s" }}>
      <div style={{ padding: "12px 18px", display: "flex", alignItems: "center", gap: 9, color: C.color, fontSize: 12.5, fontWeight: 600, fontFamily: "'Inter',sans-serif" }}>
        <span style={{ fontSize: 14, lineHeight: 1 }}>{C.icon}</span>{message}
      </div>
      <div style={{ height: 2, background: `${C.bar}30` }}><div style={{ height: "100%", width: `${progress}%`, background: C.bar, transition: "width .1s linear" }} /></div>
    </div>
  );
}

function useSparkle() {
  return useCallback((x, y, color = "#3b82f6") => {
    const c = document.createElement("div"); c.style.cssText = `position:fixed;left:${x}px;top:${y}px;pointer-events:none;z-index:9999`;
    document.body.appendChild(c);
    for (let i = 0; i < 8; i++) {
      const s = document.createElement("div"); const a = (i / 8) * Math.PI * 2; const d = 20 + Math.random() * 30;
      s.style.cssText = `position:absolute;width:${4 + Math.random() * 4}px;height:${4 + Math.random() * 4}px;border-radius:50%;background:${color};animation:sparkle .6s ease ${i * .04}s forwards;left:${Math.cos(a) * d}px;top:${Math.sin(a) * d}px`; c.appendChild(s);
    }
    setTimeout(() => c.remove(), 800);
  }, []);
}

function ScoreRing({ score, size = 80, strokeWidth = 6 }) {
  const r = size / 2 - strokeWidth; const circ = 2 * Math.PI * r; const offset = circ - (score / 100) * circ;
  const color = "#16a34a";
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={strokeWidth} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" className="score-ring" />
      <text x={size / 2} y={size / 2 + 1} textAnchor="middle" dominantBaseline="middle"
        style={{ transform: `rotate(90deg)`, transformOrigin: `${size / 2}px ${size / 2}px`, fill: color, fontSize: size * .22, fontWeight: 800, fontFamily: "'Inter',sans-serif" }}>
        {score}%
      </text>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   LANDING STEPS
══════════════════════════════════════════════════════════════════════ */
function LandingNav({ onLogoClick, isDark, onToggleDark }) {
  return (
    <Box component="nav" sx={{
      px: { xs: 2, sm: 3 }, py: { xs: 1.5, sm: 2 },
      borderBottom: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.07)",
      bgcolor: isDark ? "rgba(6,12,40,0.72)" : "rgba(255,255,255,0.88)",
      backdropFilter: "blur(16px)", position: "sticky", top: 0, zIndex: 50,
      transition: "background .4s, border-color .4s",
    }}>
      <Box sx={{ maxWidth: 1200, mx: "auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer", "&:hover .logo-icon": { transform: "rotate(12deg)" } }} onClick={onLogoClick}>
          <Box className="logo-icon" sx={{ width: { xs: 32, sm: 40 }, height: { xs: 32, sm: 40 }, background: "linear-gradient(135deg,#3d6bff,#7ca1ff)", borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 18px rgba(61,107,255,0.45)", transition: "transform 0.3s ease" }}>
            <Sparkles size={20} color="#fff" />
          </Box>
          <Typography sx={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: { xs: 16, sm: 20 }, color: isDark ? "#e8eeff" : "#111827", letterSpacing: "-0.02em", transition: "color .4s" }}>ResumeAI</Typography>
        </Box>
        {/* Moon / Sun toggle */}
        <Box onClick={onToggleDark} title={isDark ? "Switch to light mode" : "Switch to night mode"}
          sx={{ width: 40, height: 40, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .3s", position: "relative", overflow: "hidden",
            bgcolor: isDark ? "rgba(255,230,80,.12)" : "rgba(255,185,0,.12)",
            border: isDark ? "1.5px solid rgba(255,220,80,.3)" : "1.5px solid rgba(255,185,0,.35)",
            "&:hover": { transform: "scale(1.12)", bgcolor: isDark ? "rgba(255,230,80,.2)" : "rgba(255,185,0,.2)" } }}>
          {isDark ? (
            /* Moon SVG */
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="#ffe070" stroke="#ffd040" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            /* Sun SVG */
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="5" fill="#f59e0b" stroke="#d97706" strokeWidth="1.5"/>
              <line x1="12" y1="2" x2="12" y2="5" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>
              <line x1="12" y1="19" x2="12" y2="22" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>
              <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>
              <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>
              <line x1="2" y1="12" x2="5" y2="12" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>
              <line x1="19" y1="12" x2="22" y2="12" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>
              <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>
              <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          )}
        </Box>
      </Box>
    </Box>
  );
}

function NightScene() {
  const sceneRef = React.useRef(null);
  React.useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    // Stars
    for (let i = 0; i < 130; i++) {
      const s = document.createElement("div");
      const sz = Math.random() * 2 + 0.4;
      const dur = 2 + Math.random() * 5;
      const del = Math.random() * 7;
      s.style.cssText = `position:absolute;border-radius:50%;background:#fff;width:${sz}px;height:${sz}px;left:${Math.random()*100}%;top:${Math.random()*80}%;opacity:${0.1+Math.random()*0.4};animation:twinkle-star ${dur}s ${del}s ease-in-out infinite;pointer-events:none`;
      scene.appendChild(s);
    }
    // Birds
    const birdPaths = [
      "M0,5 C4,1 8,1 12,5 C16,1 20,1 24,5",
      "M0,4 C3,0 7,0 10,4 C13,0 17,0 20,4",
      "M0,3 C2,0 5,0 8,3 C11,0 14,0 16,3",
    ];
    const birds = [
      {top:"11%",dur:24,del:0,sz:1,dir:1},{top:"17%",dur:32,del:7,sz:.7,dir:-1},
      {top:"7%",dur:27,del:13,sz:.9,dir:1},{top:"21%",dur:36,del:2,sz:.6,dir:-1},
      {top:"5%",dur:21,del:19,sz:1.1,dir:1},{top:"14%",dur:29,del:25,sz:.65,dir:1},
      {top:"9%",dur:33,del:10,sz:.8,dir:-1},{top:"19%",dur:25,del:28,sz:.55,dir:1},
    ];
    birds.forEach(({top,dur,del,sz,dir}) => {
      const b = document.createElement("div");
      const p = birdPaths[Math.floor(Math.random()*birdPaths.length)];
      b.innerHTML = `<svg width="${24*sz}" height="${10*sz}" viewBox="0 0 24 10" fill="none"><path d="${p}" stroke="rgba(170,195,255,0.65)" stroke-width="1.4" stroke-linecap="round" fill="none"/></svg>`;
      b.style.cssText = `position:absolute;top:${top};pointer-events:none;z-index:3;opacity:.7;animation:${dir===1?"fly-right":"fly-left"} ${dur}s ${del}s linear infinite`;
      scene.appendChild(b);
    });
    // Shooting stars
    let timer;
    const shoot = () => {
      const s = document.createElement("div");
      s.style.cssText = `position:absolute;top:${4+Math.random()*28}%;left:${10+Math.random()*45}%;width:2px;height:2px;border-radius:50%;background:#fff;pointer-events:none;z-index:4;animation:shoot-star ${0.7+Math.random()*0.5}s ease-out forwards`;
      scene.appendChild(s);
      setTimeout(()=>s.remove(), 1400);
      timer = setTimeout(shoot, 5000 + Math.random()*9000);
    };
    timer = setTimeout(shoot, 2500);
    return () => { clearTimeout(timer); };
  }, []);
  return (
    <Box ref={sceneRef} sx={{ position:"fixed", inset:0, zIndex:0, overflow:"hidden", pointerEvents:"none",
      background:"radial-gradient(ellipse 90% 65% at 50% 0%, #0d1f5c 0%, #060c28 60%)" }}>
      {/* Lamp glow source at top-center */}
      <Box sx={{ position:"absolute", top:"-10px", left:"50%", transform:"translateX(-50%)",
        width:32, height:32, borderRadius:"50%",
        background:"radial-gradient(circle,#ffe07a 0%,#ffd040 45%,transparent 70%)",
        animation:"lamp-glow 4s ease-in-out infinite", zIndex:6 }} />
      {/* Wide beam */}
      <Box sx={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)",
        width:0, height:0,
        borderLeft:"260px solid transparent", borderRight:"260px solid transparent",
        borderTop:"820px solid rgba(255,215,75,.038)",
        filter:"blur(22px)", zIndex:1, animation:"beam-blink 4s ease-in-out infinite" }} />
      {/* Tight inner beam */}
      <Box sx={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)",
        width:0, height:0,
        borderLeft:"100px solid transparent", borderRight:"100px solid transparent",
        borderTop:"550px solid rgba(255,228,110,.05)",
        filter:"blur(10px)", zIndex:2, animation:"beam-blink 4s ease-in-out infinite" }} />
      {/* Moon */}
      <Box sx={{ position:"absolute", top:28, right:"11%", width:36, height:36,
        borderRadius:"50%", background:"#f0e880",
        boxShadow:"0 0 18px rgba(240,232,128,.38)", zIndex:3 }}>
        <Box sx={{ position:"absolute", top:4, right:-3, width:28, height:28,
          borderRadius:"50%", background:"#060c28" }} />
      </Box>
      {/* Laptop at beam bottom */}
      <Box sx={{ position:"absolute", bottom:36, left:"50%", transform:"translateX(-50%)", zIndex:5, opacity:.8 }}>
        <Box sx={{ width:108, height:68, background:"#0b1d5a", border:"2.5px solid #1b3180",
          borderRadius:"5px 5px 0 0", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", position:"relative" }}>
          <Box sx={{ position:"absolute", inset:0, background:"linear-gradient(150deg,rgba(255,218,75,.14) 0%,transparent 55%)", animation:"screen-pulse 4s ease-in-out infinite" }} />
          <Stack spacing={0.75} sx={{ width:"78%", opacity:.45 }}>
            {[1,.7,.55].map((w,i)=><Box key={i} sx={{ height:"2.5px", bgcolor:"#5577ff", borderRadius:2, width:`${w*100}%` }} />)}
          </Stack>
        </Box>
        <Box sx={{ width:126, height:5, background:"#101e4a", borderRadius:"0 0 3px 3px" }} />
        <Box sx={{ width:140, height:2.5, background:"#0c1638", borderRadius:2, mt:"1px", mx:"auto" }} />
      </Box>
    </Box>
  );
}

function HeroStep({ onNext, isDark = true }) {
  return (
    <Box sx={{ position:"relative", minHeight:"calc(100vh - 60px)", display:"flex", alignItems:"center" }}>
      <Box sx={{ maxWidth:1200, mx:"auto", px:{xs:2,sm:3,lg:4}, py:{xs:6,sm:8,lg:10}, width:"100%",
        display:"flex", flexDirection:{xs:"column",lg:"row"}, alignItems:"center", gap:{xs:6,lg:10},
        animation:"night-fade-up .7s ease", position:"relative", zIndex:5 }}>

        {/* LEFT text */}
        <Box sx={{ flex:1, textAlign:{xs:"center",lg:"left"} }}>
          {/* Badge */}
          <Box sx={{ display:"inline-flex", alignItems:"center", gap:1, bgcolor:"rgba(255,255,255,0.07)",
            border:"1px solid rgba(255,255,255,0.12)", borderRadius:99, px:1.75, py:0.75, mb:3.5 }}>
            <Box sx={{ width:7, height:7, borderRadius:"50%", bgcolor:"#5dff90",
              animation:"badge-dot-night 2s infinite", boxShadow:"0 0 8px rgba(93,255,144,.6)" }} />
            <Typography sx={{ fontFamily:"'Inter',sans-serif", fontSize:12, fontWeight:600,
              color: isDark ? "rgba(255,255,255,.65)" : "#15803d", letterSpacing:".02em" }}>48,834 resumes crafted today</Typography>
          </Box>

          <Typography sx={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:800,
            fontSize:{xs:"2.4rem",sm:"3.2rem",lg:"4.2rem"}, lineHeight:1.06,
            color: isDark ? "#f0efeb" : "#0f172a", letterSpacing:"-.03em", mb:2.5, transition:"color .4s" }}>
            Your resume,<br/>built for the<br/>
            <Box component="span" sx={{ color: isDark ? "#7ca1ff" : "#2563eb" }}>night shift</Box>
          </Typography>

          <Typography sx={{ fontFamily:"'Inter',sans-serif", fontSize:{xs:15,sm:17},
            color: isDark ? "rgba(190,205,255,.52)" : "#64748b", maxWidth:440, mx:{xs:"auto",lg:0},
            mb:4, lineHeight:1.7 }}>
            The first step to a better job? A better CV. Only 2% of CVs win — and yours will be one of them.
          </Typography>

          <Stack direction={{xs:"column",sm:"row"}} spacing={2}
            justifyContent={{xs:"center",lg:"flex-start"}} alignItems="center" sx={{ mb:5 }}>
            <Button variant="contained" size="large"
              endIcon={<ChevronRight size={18} style={{transition:"transform .2s"}} />}
              onClick={onNext}
              sx={{ px:4, py:1.5, fontSize:16, borderRadius:50,
                background:"#3d6bff",
                boxShadow:"0 4px 24px rgba(61,107,255,.5), 0 0 0 1px rgba(100,150,255,.3)",
                "&:hover":{ background:"#5580ff", boxShadow:"0 6px 32px rgba(61,107,255,.65)", "& svg":{transform:"translateX(4px)"} },
                width:{xs:"100%",sm:"auto"} }}>
              Create Resume
            </Button>
            <Stack direction="row" spacing={2} alignItems="center">
              <Stack direction="row" spacing={0.5} alignItems="center">
                <ShieldCheck size={14} color="#5dff90" />
                <Typography sx={{fontSize:13,color:"rgba(180,200,255,.5)",fontWeight:500}}>ATS Friendly</Typography>
              </Stack>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Clock size={14} color="#7ca1ff" />
                <Typography sx={{fontSize:13,color:"rgba(180,200,255,.5)",fontWeight:500}}>5 Min Setup</Typography>
              </Stack>
            </Stack>
          </Stack>

          <Stack direction="row" spacing={{xs:5,sm:10}} justifyContent={{xs:"center",lg:"flex-start"}}
            sx={{ pt:4, borderTop:"1px solid rgba(255,255,255,0.08)" }}>
            {[{val:"48%",desc:"more likely to get hired"},{val:"12%",desc:"better pay with next job"}].map(s=>(
              <Box key={s.val}>
                <Typography sx={{ fontSize:{xs:22,sm:28}, fontWeight:800, color: isDark ? "#e8eeff" : "#111827",
                  fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{s.val}</Typography>
                <Typography sx={{ fontSize:12, color: isDark ? "rgba(170,190,255,.45)" : "#6b7280" }}>{s.desc}</Typography>
              </Box>
            ))}
          </Stack>
        </Box>

        {/* RIGHT card */}
        <Box sx={{ flex:1, maxWidth:{xs:420,lg:"none"}, width:"100%", position:"relative" }}>
          {/* Floating check badge */}
          <Box sx={{ display:{xs:"none",sm:"flex"}, position:"absolute", top:-18, right:-14,
            width:72, height:72, bgcolor:"rgba(13,32,80,.8)", borderRadius:3,
            border:"1px solid rgba(100,140,255,.25)", transform:"rotate(12deg)", zIndex:2,
            alignItems:"center", justifyContent:"center",
            boxShadow:"0 8px 32px rgba(0,0,0,.4)" }}>
            <Box sx={{ width:"72%", height:"72%", bgcolor:"rgba(93,255,144,.1)", borderRadius:2,
              display:"flex", alignItems:"center", justifyContent:"center" }}>
              <CheckCircle2 size={26} color="#5dff90" />
            </Box>
          </Box>
          <Box sx={{ borderRadius:3, p:{xs:2.5,sm:3.5},
            background: isDark ? "rgba(13,25,72,.65)" : "#fff",
            border: isDark ? "1px solid rgba(100,130,255,.18)" : "1px solid #e2e8f0",
            boxShadow:"0 0 64px rgba(61,107,255,.12), inset 0 1px 0 rgba(255,255,255,.06)" }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb:3 }}>
              <Box sx={{ width:{xs:48,sm:58}, height:{xs:48,sm:58}, borderRadius:3, overflow:"hidden",
                border:"2px solid rgba(100,150,255,.3)", flexShrink:0,
                background:"linear-gradient(135deg,#1e3a80,#2d5cbf)",
                display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Typography sx={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:800, fontSize:20, color:"rgba(255,255,255,.9)" }}>SW</Typography>
              </Box>
              <Box>
                <Typography sx={{ fontWeight:700, fontSize:{xs:15,sm:18}, color: isDark ? "#dde8ff" : "#111827" }}>Samantha Williams</Typography>
                <Typography sx={{ fontSize:13, color: isDark ? "rgba(150,175,255,.5)" : "#6b7280" }}>Senior Data Analyst</Typography>
              </Box>
            </Stack>
            <Stack spacing={1.25} sx={{ mb:3 }}>
              {[1,.78,.88].map((w,i)=>(
                <Box key={i} sx={{ height:{xs:9,sm:11}, bgcolor: isDark ? "rgba(100,130,255,.12)" : "#f1f5f9",
                  borderRadius:99, width:`${w*100}%` }} />
              ))}
            </Stack>
            <Box sx={{ pt:2.5, borderTop:"1px solid rgba(255,255,255,.07)" }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb:1.5 }}>
                <Zap size={13} color="#7ca1ff" fill="#7ca1ff" />
                <Typography sx={{ fontSize:10, fontWeight:700, color:"#7ca1ff",
                  letterSpacing:".09em", textTransform:"uppercase" }}>AI Enhancement Active</Typography>
              </Stack>
              <Box sx={{ bgcolor: isDark ? "rgba(61,107,255,.1)" : "#eff6ff", p:{xs:1.5,sm:2}, borderRadius:2.5,
                border: isDark ? "1px solid rgba(61,107,255,.2)" : "1px solid #bfdbfe" }}>
                <Typography sx={{ fontSize:{xs:12,sm:13}, color: isDark ? "rgba(160,185,255,.6)" : "#4b5563", lineHeight:1.6, fontStyle:"italic" }}>
                  "Optimized your experience section by highlighting 3 key technical achievements that match top-tier job descriptions."
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}



/* ══════════════════════════════════════════════════════════════════════
   FEATURES SECTION  — shown on the hero/landing page
══════════════════════════════════════════════════════════════════════ */
function FeaturesSection({ isDark }) {
  const features = [
    {
      icon: "◎",
      color: "#3b82f6",
      bg: "rgba(59,130,246,0.10)",
      title: "Live PDF Preview",
      desc: "Every edit reflects instantly in the PDF preview. Click any line in the preview to jump directly to that field.",
    },
    {
      icon: "✦",
      color: "#7c3aed",
      bg: "rgba(124,58,237,0.10)",
      title: "AI Rewrite & Coach",
      desc: "6 rewrite modes (Polish, Elaborate, Quantify…) + an AI chat coach that knows your full resume context.",
    },
    {
      icon: "⚡",
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.10)",
      title: "IRS — Intellectual Resume Search",
      desc: "Goes beyond keyword matching. AI deeply analyzes each JD's roles & responsibilities against your resume, scores every JD individually, then averages them into one final match score.",
    },
    {
      icon: "⧉",
      color: "#06b6d4",
      bg: "rgba(6,182,212,0.10)",
      title: "3-Variant Compare",
      desc: "Create up to 3 independent variants of your resume and compare them side-by-side — perfect for targeting different roles.",
    },
    {
      icon: "↓",
      color: "#16a34a",
      bg: "rgba(22,163,74,0.10)",
      title: "Download DOCX or PDF",
      desc: "Export your edited resume as a perfectly formatted Word document or PDF, preserving all original formatting.",
    },
    {
      icon: "🔗",
      color: "#e11d48",
      bg: "rgba(225,29,72,0.10)",
      title: "Hyperlink & URL Editor",
      desc: "Edit LinkedIn, GitHub and any inline URLs directly — display name and target URL separately, no reformatting needed.",
    },
  ];

  const steps = [
    { num: "01", title: "Upload", desc: "Drop your existing .pdf or .docx resume. We preserve every font, spacing and layout detail." },
    { num: "02", title: "Edit", desc: "Click any field in the live preview or use the section editor. Apply rich formatting, AI rewrites, or add lines." },
    { num: "03", title: "Download", desc: "Export as DOCX or PDF. Your edits are injected surgically — no template, no reformatting." },
  ];

  const cardBg = isDark ? "rgba(13,25,72,.65)" : "#fff";
  const cardBdr = isDark ? "rgba(100,130,255,.15)" : "#e8edf5";
  const headCol = isDark ? "#e0eaff" : "#0f172a";
  const subCol  = isDark ? "rgba(180,205,255,.55)" : "#64748b";

  return (
    <Box sx={{ position:"relative", zIndex:5, pb:{ xs:8, lg:14 } }}>

      {/* ── HOW IT WORKS ── */}
      <Box sx={{ maxWidth:1200, mx:"auto", px:{ xs:2, sm:3, lg:4 }, pt:{ xs:8, lg:12 }, pb:{ xs:6, lg:8 } }}>
        <Box sx={{ textAlign:"center", mb:{ xs:5, lg:7 } }}>
          <Box sx={{ display:"inline-flex", alignItems:"center", gap:1, mb:2, px:1.75, py:0.75,
            borderRadius:99, bgcolor:isDark?"rgba(61,107,255,.12)":"#eff6ff",
            border:isDark?"1px solid rgba(61,107,255,.28)":"1px solid #bfdbfe" }}>
            <Box sx={{ width:6, height:6, borderRadius:"50%", bgcolor:"#3b82f6", boxShadow:"0 0 8px #3b82f6" }}/>
            <Typography sx={{ fontSize:12, fontWeight:700, color:isDark?"#7ca1ff":"#2563eb", letterSpacing:".04em", textTransform:"uppercase" }}>How it works</Typography>
          </Box>
          <Typography sx={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:800,
            fontSize:{ xs:"1.8rem", sm:"2.4rem" }, letterSpacing:"-.03em",
            color:headCol, mb:1.5 }}>
            From upload to download in 3 steps
          </Typography>
          <Typography sx={{ fontSize:{ xs:14, sm:16 }, color:subCol, maxWidth:500, mx:"auto", lineHeight:1.7 }}>
            No templates. No reformatting. Your resume — surgically improved.
          </Typography>
        </Box>

        {/* Steps row */}
        <Box sx={{ display:"grid", gridTemplateColumns:{ xs:"1fr", md:"repeat(3,1fr)" }, gap:{ xs:3, md:2 }, position:"relative" }}>
          {/* Connector line on md+ */}
          <Box sx={{ display:{ xs:"none", md:"block" }, position:"absolute", top:28, left:"16.5%", right:"16.5%", height:2,
            background:isDark?"linear-gradient(90deg,#3b82f6,#7c3aed)":"linear-gradient(90deg,#bfdbfe,#ddd6fe)",
            borderRadius:99, zIndex:0 }} />

          {steps.map((s, i) => (
            <Box key={i} sx={{ position:"relative", zIndex:1, display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", px:{ xs:2, md:3 } }}>
              <Box sx={{ width:56, height:56, borderRadius:"50%", mb:3, display:"flex", alignItems:"center", justifyContent:"center",
                background:isDark?"linear-gradient(135deg,#3d6bff,#7c3aed)":"linear-gradient(135deg,#2563eb,#7c3aed)",
                boxShadow:isDark?"0 0 0 6px rgba(61,107,255,.15),0 8px 24px rgba(61,107,255,.35)":"0 0 0 6px #eff6ff,0 4px 16px rgba(37,99,235,.22)" }}>
                <Typography sx={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:800, fontSize:18, color:"#fff" }}>{s.num}</Typography>
              </Box>
              <Typography sx={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:800, fontSize:{ xs:17, md:19 }, color:headCol, mb:1 }}>{s.title}</Typography>
              <Typography sx={{ fontSize:13.5, color:subCol, lineHeight:1.7, maxWidth:280 }}>{s.desc}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ── FEATURES GRID ── */}
      <Box sx={{ maxWidth:1200, mx:"auto", px:{ xs:2, sm:3, lg:4 }, pt:2 }}>
        <Box sx={{ textAlign:"center", mb:{ xs:5, lg:7 } }}>
          <Box sx={{ display:"inline-flex", alignItems:"center", gap:1, mb:2, px:1.75, py:0.75,
            borderRadius:99, bgcolor:isDark?"rgba(124,58,237,.12)":"#f5f3ff",
            border:isDark?"1px solid rgba(167,139,250,.28)":"1px solid #ddd6fe" }}>
            <Box sx={{ width:6, height:6, borderRadius:"50%", bgcolor:"#7c3aed", boxShadow:"0 0 8px #7c3aed" }}/>
            <Typography sx={{ fontSize:12, fontWeight:700, color:isDark?"#a78bfa":"#7c3aed", letterSpacing:".04em", textTransform:"uppercase" }}>Features</Typography>
          </Box>
          <Typography sx={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:800,
            fontSize:{ xs:"1.8rem", sm:"2.4rem" }, letterSpacing:"-.03em", color:headCol, mb:1.5 }}>
            Everything your resume needs
          </Typography>
          <Typography sx={{ fontSize:{ xs:14, sm:16 }, color:subCol, maxWidth:480, mx:"auto", lineHeight:1.7 }}>
            Built for job hunters who already have a great resume — and want to make it perfect.
          </Typography>
        </Box>

        <Box sx={{ display:"grid", gridTemplateColumns:{ xs:"1fr", sm:"repeat(2,1fr)", lg:"repeat(3,1fr)" }, gap:{ xs:2, md:2.5 } }}>
          {features.map((f, i) => (
            <Box key={i} sx={{
              p:{ xs:2.5, md:3 }, borderRadius:3,
              bgcolor:cardBg,
              border:`1px solid ${cardBdr}`,
              transition:"all .2s",
              boxShadow:isDark?"0 2px 16px rgba(0,0,0,.25)":"0 2px 12px rgba(0,0,0,.05)",
              "&:hover":{ borderColor:f.color+"55", transform:"translateY(-3px)", boxShadow:isDark?`0 8px 32px rgba(0,0,0,.4)`:
                `0 8px 28px rgba(0,0,0,.10)` }
            }}>
              <Box sx={{ width:44, height:44, borderRadius:2.5, bgcolor:f.bg, display:"flex", alignItems:"center", justifyContent:"center", mb:2.25, flexShrink:0 }}>
                <Typography sx={{ fontSize:18, color:f.color, fontWeight:700, lineHeight:1 }}>{f.icon}</Typography>
              </Box>
              <Typography sx={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:700, fontSize:15.5, color:headCol, mb:1 }}>{f.title}</Typography>
              <Typography sx={{ fontSize:13.5, color:subCol, lineHeight:1.75 }}>{f.desc}</Typography>
            </Box>
          ))}
        </Box>

        {/* ── BOTTOM CTA ── */}
        <Box sx={{ mt:{ xs:8, lg:10 }, textAlign:"center" }}>
          <Box sx={{
            display:"inline-flex", flexDirection:"column", alignItems:"center", gap:2.5,
            px:{ xs:3, sm:6 }, py:{ xs:4, sm:5 }, borderRadius:4,
            background:isDark?"linear-gradient(135deg,rgba(61,107,255,.18),rgba(124,58,237,.18))":"linear-gradient(135deg,#eff6ff,#f5f3ff)",
            border:isDark?"1px solid rgba(124,161,255,.22)":"1px solid #ddd6fe",
            maxWidth:480, mx:"auto"
          }}>
            <Typography sx={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:800, fontSize:{ xs:18, sm:22 }, color:headCol, lineHeight:1.3 }}>
              Ready to edit your resume?
            </Typography>
            <Typography sx={{ fontSize:14, color:subCol, lineHeight:1.6, maxWidth:360 }}>
              Upload your existing PDF or DOCX and start editing in seconds — no account required.
            </Typography>
            <Box sx={{ display:"flex", alignItems:"center", gap:1.5, flexWrap:"wrap", justifyContent:"center" }}>
              {["IRS Powered","AI-Powered","Free to start"].map(tag => (
                <Box key={tag} sx={{ display:"flex", alignItems:"center", gap:0.75, px:1.25, py:0.5, borderRadius:99, bgcolor:isDark?"rgba(255,255,255,.07)":"rgba(37,99,235,.07)", border:isDark?"1px solid rgba(255,255,255,.12)":"1px solid rgba(37,99,235,.2)" }}>
                  <Box sx={{ width:5, height:5, borderRadius:"50%", bgcolor:isDark?"#5dff90":"#16a34a" }}/>
                  <Typography sx={{ fontSize:11.5, fontWeight:600, color:isDark?"rgba(200,220,255,.8)":"#2563eb" }}>{tag}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function ChoiceStep({ onUpload, onBack, isDark }) {
  const features = [
    { icon: "◎", color: "#3b82f6", title: "Live PDF Preview",            desc: "Click any line in the preview to jump directly to that field and start editing." },
    { icon: "✦", color: "#7c3aed", title: "AI Rewrite & Coach",          desc: "6 rewrite modes (Polish, Quantify, Condense…) + a context-aware AI coach." },
    { icon: "⚡", color: "#f59e0b", title: "IRS — Intellectual Resume Search", desc: "Deep per-JD analysis of roles & responsibilities — each JD scored individually, averaged into one final score." },
    { icon: "⧉", color: "#06b6d4", title: "3-Variant Compare",           desc: "Create 3 independent variants and compare them side-by-side to pick the best." },
    { icon: "↓", color: "#16a34a", title: "DOCX & PDF Export",           desc: "Surgical edits injected directly — preserves every font, spacing and layout." },
    { icon: "🔗", color: "#e11d48", title: "Hyperlink & URL Editor",      desc: "Edit LinkedIn, GitHub and any inline URL — display name and target separately." },
  ];

  const headCol  = isDark ? "#e0eaff" : "#0f172a";
  const subCol   = isDark ? "rgba(180,205,255,.52)" : "#64748b";
  const panelBg  = isDark ? "rgba(8,14,50,.82)"     : "rgba(255,255,255,0.94)";
  const panelBdr = isDark ? "rgba(80,110,255,.14)"  : "rgba(0,0,0,.07)";

  return (
    <Box sx={{ minHeight:"calc(100vh - 72px)", display:"flex", alignItems:"stretch",
      position:"relative", zIndex:5,
      animation: isDark ? "night-fade-up .5s ease" : "fadeUp .5s ease" }}>

      {/* ══ LEFT PANEL — Features ══ */}
      <Box sx={{ flex:"1 1 55%", px:{ xs:3, sm:5, lg:8 }, py:{ xs:5, sm:7 },
        display:"flex", flexDirection:"column", justifyContent:"center",
        borderRight:isDark?"1px solid rgba(80,110,255,.1)":"1px solid #e8edf5" }}>

        {/* Badge */}
        <Box sx={{ display:"inline-flex", alignItems:"center", gap:1, mb:2.5, px:1.5, py:0.6,
          borderRadius:99, width:"fit-content",
          bgcolor:isDark?"rgba(61,107,255,.12)":"#eff6ff",
          border:isDark?"1px solid rgba(61,107,255,.25)":"1px solid #bfdbfe" }}>
          <Box sx={{ width:6, height:6, borderRadius:"50%", bgcolor:"#3b82f6", boxShadow:"0 0 8px #3b82f6" }}/>
          <Typography sx={{ fontSize:11.5, fontWeight:700, color:isDark?"#7ca1ff":"#2563eb", letterSpacing:".04em", textTransform:"uppercase" }}>
            What you get
          </Typography>
        </Box>

        <Typography sx={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:800,
          fontSize:{ xs:"1.7rem", sm:"2.2rem", lg:"2.6rem" }, letterSpacing:"-.03em",
          color:headCol, mb:1, lineHeight:1.12 }}>
          Everything your<br/>resume needs
        </Typography>
        <Typography sx={{ fontSize:{ xs:14, sm:15.5 }, color:subCol, mb:4.5, lineHeight:1.7, maxWidth:480 }}>
          Upload once, edit everything — AI-powered, formatting preserved, no templates.
        </Typography>

        {/* 2-column feature grid */}
        <Box sx={{ display:"grid", gridTemplateColumns:{ xs:"1fr", sm:"1fr 1fr" }, gap:{ xs:1.5, sm:2 } }}>
          {features.map((f, i) => (
            <Box key={i} sx={{ display:"flex", alignItems:"flex-start", gap:1.5,
              p:"14px 16px", borderRadius:3,
              bgcolor:isDark?"rgba(13,25,72,.55)":"#f8fafc",
              border:isDark?"1px solid rgba(80,110,255,.12)":"1px solid #edf0f7",
              transition:"all .18s",
              "&:hover":{ borderColor:f.color+"66",
                bgcolor:isDark?"rgba(20,38,95,.7)":"#fff",
                boxShadow:isDark?`0 6px 24px rgba(0,0,0,.3)`:`0 6px 20px rgba(0,0,0,.07)`,
                transform:"translateY(-2px)" } }}>
              <Box sx={{ width:36, height:36, borderRadius:2.5, flexShrink:0,
                bgcolor:`${f.color}18`,
                display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Typography sx={{ fontSize:16, color:f.color, fontWeight:700, lineHeight:1 }}>{f.icon}</Typography>
              </Box>
              <Box sx={{ minWidth:0 }}>
                <Typography sx={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:700,
                  fontSize:13, color:headCol, mb:0.4, lineHeight:1.3 }}>{f.title}</Typography>
                <Typography sx={{ fontSize:11.5, color:subCol, lineHeight:1.6 }}>{f.desc}</Typography>
              </Box>
            </Box>
          ))}
        </Box>

        <Button startIcon={<ArrowLeft size={14} />} onClick={onBack}
          sx={{ mt:4, color:isDark?"rgba(150,175,255,.45)":"text.disabled",
            fontWeight:500, fontSize:13, alignSelf:"flex-start", pl:0 }}>
          Go Back
        </Button>
      </Box>

      {/* ══ RIGHT PANEL — Upload ══ */}
      <Box sx={{ flex:"1 1 45%", maxWidth:{ lg:520 }, display:"flex", flexDirection:"column",
        justifyContent:"center", px:{ xs:3, sm:5, lg:8 }, py:{ xs:5, sm:7 },
        bgcolor:isDark?"rgba(6,10,38,.6)":"#f8fafc" }}>

        <Typography sx={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:800,
          fontSize:{ xs:"1.6rem", sm:"2rem", lg:"2.3rem" }, letterSpacing:"-.03em",
          color:headCol, mb:1, lineHeight:1.15 }}>
          Start editing<br/>your resume
        </Typography>
        <Typography sx={{ fontSize:{ xs:14, sm:15 }, color:subCol, mb:3.5, lineHeight:1.7 }}>
          Upload your existing file — we preserve every detail and extract all fields for editing.
        </Typography>

        {/* Upload card */}
        <Paper elevation={0} onClick={onUpload} sx={{
          p:{ xs:3, sm:4 }, mb:3,
          border:"2px solid",
          borderColor:isDark?"rgba(61,107,255,.22)":"#e2e8f0",
          borderRadius:4, cursor:"pointer",
          bgcolor:isDark?"rgba(13,25,72,.7)":"#fff",
          transition:"all .22s",
          "&:hover":{ borderColor:isDark?"#7ca1ff":"#2563eb",
            boxShadow:isDark?"0 12px 48px rgba(61,107,255,.25)":"0 12px 40px rgba(37,99,235,.12)",
            transform:"translateY(-4px)" } }}>

          <Box sx={{ display:"flex", alignItems:"center", gap:2, mb:2.5 }}>
            <Box sx={{ width:54, height:54, borderRadius:3,
              bgcolor:isDark?"rgba(61,107,255,.18)":"#eff6ff",
              display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
              boxShadow:isDark?"0 0 0 6px rgba(61,107,255,.08)":"0 0 0 6px #e0eaff" }}>
              <Upload size={24} color="#2563eb" />
            </Box>
            <Box>
              <Typography sx={{ fontWeight:800, fontSize:{ xs:16, sm:18 }, color:isDark?"#dde8ff":"#0f172a" }}>
                I already have a resume
              </Typography>
              <Typography sx={{ fontSize:12.5, color:subCol }}>PDF or DOCX — drag & drop or browse</Typography>
            </Box>
          </Box>

          <Typography sx={{ fontSize:13.5, color:subCol, lineHeight:1.7, mb:2.5 }}>
            We preserve every font, spacing, and layout detail. Our AI extracts all fields so you can edit section by section.
          </Typography>

          <Box sx={{ display:"flex", flexWrap:"wrap", gap:1 }}>
            {[
              { label:"PDF", color:"#ef4444" },
              { label:"DOCX", color:"#2563eb" },
              { label:"Formatting preserved", color:"#16a34a" },
              { label:"IRS Powered", color:"#7c3aed" },
            ].map(tag => (
              <Box key={tag.label} sx={{ px:1.5, py:0.4, borderRadius:99, fontSize:11, fontWeight:700,
                bgcolor:`${tag.color}12`, border:`1px solid ${tag.color}33`, color:tag.color }}>{tag.label}</Box>
            ))}
          </Box>
        </Paper>

        {/* Trust list */}
        <Box sx={{ display:"flex", flexDirection:"column", gap:1.5,
          p:"16px 18px", borderRadius:3,
          bgcolor:isDark?"rgba(13,25,72,.45)":"#f1f5f9",
          border:isDark?"1px solid rgba(80,110,255,.1)":"1px solid #e2e8f0" }}>
          {[
            { icon:"🔒", text:"Your file is session-only — never stored permanently" },
            { icon:"⚡", text:"Processed in seconds using Adobe PDF Services + AI field extraction" },
            { icon:"✓",  text:"Every edit reflects instantly in the live PDF preview on the right" },
          ].map((b,i) => (
            <Box key={i} sx={{ display:"flex", alignItems:"flex-start", gap:1.5 }}>
              <Typography sx={{ fontSize:14, flexShrink:0, lineHeight:1.4 }}>{b.icon}</Typography>
              <Typography sx={{ fontSize:12.5, color:subCol, lineHeight:1.6 }}>{b.text}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

function UploadStep({ onBack, onFile, uploading, isDark }) {
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const headCol = isDark ? "#e0eaff" : "#0f172a";
  const subCol  = isDark ? "rgba(180,205,255,.55)" : "#64748b";

  return (
    <Box sx={{ minHeight:"calc(100vh - 72px)", display:"flex", alignItems:"stretch",
      position:"relative", zIndex:5,
      animation: isDark ? "night-fade-up .5s ease" : "fadeUp .5s ease" }}>

      {/* ══ LEFT — Info panel ══ */}
      <Box sx={{ flex:"1 1 45%", px:{ xs:3, sm:5, lg:8 }, py:{ xs:5, sm:7 },
        display:"flex", flexDirection:"column", justifyContent:"center",
        borderRight:isDark?"1px solid rgba(80,110,255,.1)":"1px solid #e8edf5" }}>

        <Button startIcon={<ArrowLeft size={15} />} onClick={onBack}
          sx={{ mb:4, color:isDark?"#7ca1ff":"#2563eb", fontWeight:700,
            alignSelf:"flex-start", pl:0, fontSize:13,
            "&:hover":{ bgcolor:"transparent", opacity:.75 } }}>
          Go Back
        </Button>

        {/* Badge */}
        <Box sx={{ display:"inline-flex", alignItems:"center", gap:1, mb:2.5, px:1.5, py:0.6,
          borderRadius:99, width:"fit-content",
          bgcolor:isDark?"rgba(61,107,255,.12)":"#eff6ff",
          border:isDark?"1px solid rgba(61,107,255,.25)":"1px solid #bfdbfe" }}>
          <Box sx={{ width:6, height:6, borderRadius:"50%", bgcolor:"#3b82f6",
            animation:"pulse 1.5s infinite", boxShadow:"0 0 8px #3b82f6" }}/>
          <Typography sx={{ fontSize:11.5, fontWeight:700, color:isDark?"#7ca1ff":"#2563eb",
            letterSpacing:".04em", textTransform:"uppercase" }}>Step 2 of 3 — Upload</Typography>
        </Box>

        <Typography sx={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:800,
          fontSize:{ xs:"1.7rem", sm:"2.2rem", lg:"2.6rem" }, letterSpacing:"-.03em",
          color:headCol, mb:1.25, lineHeight:1.12 }}>
          Upload your<br/>existing resume
        </Typography>
        <Typography sx={{ fontSize:{ xs:14, sm:15.5 }, color:subCol, mb:4, lineHeight:1.75, maxWidth:400 }}>
          We support PDF and DOCX. Every font, spacing and layout detail is preserved — no reformatting, no templates.
        </Typography>

        {/* What happens next */}
        <Box sx={{ display:"flex", flexDirection:"column", gap:0 }}>
          <Typography sx={{ fontSize:12, fontWeight:700, color:isDark?"#7ca1ff":"#2563eb",
            textTransform:"uppercase", letterSpacing:".06em", mb:1.75 }}>What happens next</Typography>
          {[
            { step:"01", title:"AI Field Extraction",  desc:"We detect every section, field and formatting detail in your resume." },
            { step:"02", title:"3 Variants Created",    desc:"An Original (read-only) + 2 editable variants are auto-generated." },
            { step:"03", title:"Edit & Download",       desc:"Edit section by section, compare variants, then export as DOCX or PDF." },
          ].map((s, i) => (
            <Box key={i} sx={{ display:"flex", gap:2, pb: i < 2 ? 2.5 : 0,
              position:"relative",
              "&::before": i < 2 ? {
                content:'""', position:"absolute", left:15, top:36, bottom:0,
                width:"1.5px", bgcolor:isDark?"rgba(61,107,255,.2)":"#e2e8f0"
              } : {} }}>
              <Box sx={{ width:30, height:30, borderRadius:"50%", flexShrink:0,
                bgcolor:isDark?"rgba(61,107,255,.18)":"#eff6ff",
                border:isDark?"1.5px solid rgba(61,107,255,.3)":"1.5px solid #bfdbfe",
                display:"flex", alignItems:"center", justifyContent:"center", zIndex:1 }}>
                <Typography sx={{ fontSize:10.5, fontWeight:800, color:isDark?"#7ca1ff":"#2563eb" }}>{s.step}</Typography>
              </Box>
              <Box sx={{ pb:0.5 }}>
                <Typography sx={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:700,
                  fontSize:13.5, color:headCol, mb:0.25 }}>{s.title}</Typography>
                <Typography sx={{ fontSize:12.5, color:subCol, lineHeight:1.6 }}>{s.desc}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ══ RIGHT — Drop zone ══ */}
      <Box sx={{ flex:"1 1 55%", display:"flex", flexDirection:"column",
        justifyContent:"center", alignItems:"center",
        px:{ xs:3, sm:5, lg:8 }, py:{ xs:5, sm:7 },
        bgcolor:isDark?"rgba(6,10,38,.55)":"#f8fafc" }}>

        <input ref={fileRef} type="file" accept=".pdf,.docx"
          style={{ display:"none" }} onChange={e => onFile(e.target.files?.[0])} />

        {/* Drop zone */}
        <Box
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); onFile(e.dataTransfer?.files?.[0]); }}
          onClick={() => !uploading && fileRef.current?.click()}
          sx={{ width:"100%", maxWidth:480,
            border:"2px dashed",
            borderColor:dragOver?(isDark?"#7ca1ff":"#2563eb"):(isDark?"rgba(80,110,255,.28)":"#cbd5e1"),
            borderRadius:4, p:{ xs:4, sm:6 }, textAlign:"center",
            cursor:uploading?"not-allowed":"pointer",
            bgcolor:dragOver?(isDark?"rgba(61,107,255,.09)":"rgba(37,99,235,.04)"):(isDark?"rgba(13,25,72,.5)":"#fff"),
            transform:dragOver?"scale(1.02)":"scale(1)",
            boxShadow:dragOver?(isDark?"0 0 0 6px rgba(61,107,255,.12)":"0 0 0 6px rgba(37,99,235,.08)"):"none",
            transition:"all .22s" }}>

          {uploading ? (
            <Stack spacing={2.5} alignItems="center">
              <Box sx={{ width:64, height:64, borderRadius:"50%",
                bgcolor:isDark?"rgba(61,107,255,.15)":"#eff6ff",
                display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow:isDark?"0 0 0 8px rgba(61,107,255,.08)":"0 0 0 8px #e0eaff" }}>
                <CircularProgress size={28} sx={{ color:"#2563eb" }}/>
              </Box>
              <Box>
                <Typography sx={{ fontWeight:800, fontSize:17, color:headCol, mb:0.5 }}>Processing your resume…</Typography>
                <Typography sx={{ fontSize:13, color:subCol }}>AI is extracting all fields and sections</Typography>
              </Box>
            </Stack>
          ) : (
            <Stack spacing={3} alignItems="center">
              {/* Animated upload icon */}
              <Box sx={{ width:72, height:72, borderRadius:3,
                bgcolor:dragOver?(isDark?"rgba(61,107,255,.2)":"rgba(37,99,235,.08)"):(isDark?"rgba(61,107,255,.1)":"#eff6ff"),
                border:dragOver?"2px solid #2563eb":"2px solid transparent",
                display:"flex", alignItems:"center", justifyContent:"center",
                animation:"float 3s ease-in-out infinite",
                transition:"all .2s" }}>
                <Upload size={32} color={dragOver?"#2563eb":isDark?"#7ca1ff":"#3b82f6"} strokeWidth={1.5}/>
              </Box>

              <Box>
                <Typography sx={{ fontWeight:800, fontSize:{ xs:17, sm:20 }, color:headCol, mb:0.75 }}>
                  {dragOver ? "Drop it here!" : "Drag & drop your resume"}
                </Typography>
                <Typography sx={{ fontSize:13.5, color:subCol }}>
                  PDF or DOCX — up to 10MB
                </Typography>
              </Box>

              <Box sx={{ display:"flex", alignItems:"center", gap:2, width:"100%" }}>
                <Box sx={{ flex:1, height:"1px", bgcolor:isDark?"rgba(80,110,255,.15)":"#e2e8f0" }}/>
                <Typography sx={{ fontSize:12, color:isDark?"rgba(160,185,255,.35)":"#94a3b8", fontWeight:500 }}>or</Typography>
                <Box sx={{ flex:1, height:"1px", bgcolor:isDark?"rgba(80,110,255,.15)":"#e2e8f0" }}/>
              </Box>

              <Button variant="contained" size="large"
                sx={{ px:5, py:1.4, borderRadius:99, fontSize:14.5, fontWeight:700,
                  background:"linear-gradient(135deg,#2563eb,#3b82f6)",
                  boxShadow:"0 6px 24px rgba(37,99,235,.35)",
                  "&:hover":{ boxShadow:"0 8px 32px rgba(37,99,235,.5)", filter:"brightness(1.08)" } }}>
                Browse Files
              </Button>

              {/* Format chips */}
              <Box sx={{ display:"flex", gap:1.25, flexWrap:"wrap", justifyContent:"center" }}>
                {[
                  { label:".PDF",  color:"#ef4444" },
                  { label:".DOCX", color:"#2563eb" },
                ].map(f => (
                  <Box key={f.label} sx={{ display:"flex", alignItems:"center", gap:0.75,
                    px:1.5, py:0.5, borderRadius:99, fontSize:12, fontWeight:700,
                    bgcolor:`${f.color}10`, border:`1.5px solid ${f.color}30`, color:f.color }}>
                    <FileText size={12}/>{f.label}
                  </Box>
                ))}
              </Box>
            </Stack>
          )}
        </Box>

        {/* Security note */}
        <Box sx={{ display:"flex", alignItems:"center", gap:1.25, mt:3,
          px:2, py:1.25, borderRadius:2,
          bgcolor:isDark?"rgba(22,163,74,.08)":"rgba(22,163,74,.06)",
          border:isDark?"1px solid rgba(22,163,74,.2)":"1px solid rgba(22,163,74,.18)" }}>
          <Typography sx={{ fontSize:14 }}>🔒</Typography>
          <Typography sx={{ fontSize:12, color:isDark?"rgba(134,239,172,.8)":"#15803d", lineHeight:1.5 }}>
            Your file is processed in your session only — never stored permanently on our servers.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
function ProcessingStep({ progress, isDark }) {
  const r = 45; const circ = 2 * Math.PI * r;
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", px: 2, textAlign: "center", gap: { xs: 4, sm: 6 }, animation: isDark ? "night-fade-up .4s ease" : "fadeIn .4s ease" }}>
      <Box sx={{ position: "relative", width: { xs: 96, sm: 128 }, height: { xs: 96, sm: 128 } }}>
        <svg style={{ width: "100%", height: "100%" }} viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="none" stroke={isDark ? "rgba(100,130,255,.2)" : "#f1f5f9"} strokeWidth="6" />
          <circle cx="50" cy="50" r={r} fill="none" stroke="#2563eb" strokeWidth="6" strokeDasharray={circ} strokeDashoffset={circ - (circ * progress) / 100} strokeLinecap="round" style={{ transformOrigin: "center", transform: "rotate(-90deg)", transition: "stroke-dashoffset .1s linear" }} />
        </svg>
        <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Typography sx={{ color: "primary.main", fontWeight: 800, fontSize: { xs: 18, sm: 22 } }}>{progress}%</Typography>
        </Box>
      </Box>
      <Box>
        <Typography variant="h2" sx={{ fontSize: { xs: "2rem", sm: "2.8rem" }, mb: 2, color: isDark ? "#e0e8ff" : "text.primary" }}>Processing.</Typography>
        <Typography sx={{ fontSize: { xs: 13, sm: 16 }, color: isDark ? "rgba(160,185,255,.55)" : "text.secondary", maxWidth: 420, mx: "auto", lineHeight: 1.7 }}>Please wait while our AI processes the information from your resume and selects the right fields</Typography>
      </Box>
    </Box>
  );
}

function SuccessStep({ fileName, onEdit, isDark }) {
  return (
    <Box sx={{ maxWidth: 560, mx: "auto", px: 2, py: { xs: 6, sm: 10 }, textAlign: "center", animation: isDark ? "night-fade-up .5s ease" : "fadeUp .5s ease" }}>
            <Box sx={{ width: { xs: 72, sm: 88 }, height: { xs: 72, sm: 88 }, bgcolor: "#f0fdf4", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 4 }}><CheckCircle2 size={44} color="#16a34a" /></Box>
      <Typography variant="h2" sx={{ fontSize: { xs: "1.8rem", sm: "2.4rem" }, mb: 2, color: isDark ? "#e0e8ff" : "text.primary" }}>Upload Successful!</Typography>
      <Typography sx={{ fontSize: { xs: 14, sm: 16 }, color: isDark ? "rgba(160,185,255,.55)" : "text.secondary", lineHeight: 1.7, mb: 5 }}>Your resume has been analyzed. We've extracted your experience, skills, and education to build your AI-optimized CV.</Typography>
      <Paper elevation={0} sx={{ p: { xs: 2, sm: 2.5 }, border: "1.5px solid", borderColor: isDark ? "rgba(100,130,255,.2)" : "divider", borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "space-between", mb: 4, cursor: "pointer", transition: "all .2s", bgcolor: isDark ? "rgba(13,25,72,.7)" : "background.paper", "&:hover": { borderColor: isDark ? "rgba(100,150,255,.55)" : "primary.main" } }} onClick={onEdit}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box sx={{ width: { xs: 40, sm: 48 }, height: { xs: 40, sm: 48 }, bgcolor: isDark ? "rgba(61,107,255,.15)" : "#eff6ff", borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><FileDown size={22} color={isDark ? "#7ca1ff" : "#2563eb"} /></Box>
          <Box sx={{ textAlign: "left" }}><Typography sx={{ fontWeight: 700, color: isDark ? "#a8c4ff" : "text.primary", fontSize: { xs: 13, sm: 14 } }}>{fileName || "resume_optimized.docx"}</Typography><Typography sx={{ fontSize: 12, color: isDark ? "rgba(160,190,255,.75)" : "text.disabled" }}>Ready for editing</Typography></Box>
        </Stack>
        <Box sx={{ p: 1, bgcolor: isDark ? "rgba(100,130,255,.18)" : "#f9fafb", border: isDark ? "1px solid rgba(100,130,255,.25)" : "none", borderRadius: "50%", display: "flex" }}><ChevronRight size={18} color={isDark ? "#7ca1ff" : "#374151"} /></Box>
      </Paper>
      <Button variant="outlined" size="large" startIcon={<Edit2 size={18} />} onClick={onEdit}
        sx={{ px: 4, py: 1.5, borderRadius: 3, fontSize: 15, width: "100%", borderWidth: 1.5, "&:hover": { borderWidth: 1.5, bgcolor: isDark ? "rgba(61,107,255,.1)" : alpha("#2563eb", 0.04) }, borderColor: isDark ? "rgba(100,130,255,.4)" : undefined, color: isDark ? "#7ca1ff" : undefined, boxShadow: isDark ? "0 0 20px rgba(61,107,255,.15)" : "none" }}>
        Open in Editor
      </Button>
    </Box>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   INLINE EDITOR
══════════════════════════════════════════════════════════════════════ */
const FONTS = ["Calibri", "Arial", "Times New Roman", "Georgia", "Verdana", "Trebuchet MS", "Garamond", "Cambria", "Tahoma"];
const SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 28, 32, 36];

const _fontMemory = { fontFamily: "", fontSize: "", updated: null };
const saveFontMemory = (ff, fs) => { if (ff) _fontMemory.fontFamily = ff; if (fs) _fontMemory.fontSize = fs; _fontMemory.updated = new Date().toLocaleTimeString(); };
const loadFontMemory = () => ({ ..._fontMemory });

function InlineEditor({ field, sc, saving, onApply, onCancel, onDelete, initialSegments = null, autoFocus = false, onUndo = null, onNextSection = null, onAddBlankLine = null }) {
  const ref      = useRef(null);
  const colorRef = useRef(null);
  const rangeRef = useRef(null);
  const [fmt, setFmt] = useState({ bold: false, italic: false, underline: false, strike: false });
  const [align, setAlign] = useState("left");
  const [lastFont, setLastFont] = useState(() => loadFontMemory().fontFamily || "");
  const [lastSize, setLastSize] = useState(() => loadFontMemory().fontSize ? loadFontMemory().fontSize.replace("pt", "") : "");
  const [lineSpacing, setLineSpacing] = useState("");
  // AI Rewrite state
  const [aiPanel, setAiPanel] = useState(false);       // show mode buttons
  const [aiLoading, setAiLoading] = useState(false);   // spinner
  const [aiSuggestion, setAiSuggestion] = useState(null); // {text, mode}

  useEffect(() => {
    if (!ref.current) return;
    const esc = t => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    if (initialSegments && initialSegments.length > 0) {
      const html = initialSegments.map(s => {
        if (s.text === "\t") return `<span data-tab="1" style="display:inline-block;min-width:3em;white-space:pre">\t</span>`;
        let inner = esc(s.text);
        if (s.color)      inner = `<span style="color:${s.color}">${inner}</span>`;
        if (s.fontFamily) inner = `<font face="${esc(s.fontFamily)}">${inner}</font>`;
        if (s.fontSize)   inner = `<span data-pt="${s.fontSize}" style="font-size:${s.fontSize}">${inner}</span>`;
        if (s.strike)     inner = `<s>${inner}</s>`;
        if (s.underline)  inner = `<u>${inner}</u>`;
        if (s.italic)     inner = `<i>${inner}</i>`;
        if (s.bold)       inner = `<b>${inner}</b>`;
        return inner;
      }).join("");
      const hadFocus = document.activeElement === ref.current;
      ref.current.innerHTML = html;
      const sel = window.getSelection(), r = document.createRange();
      r.selectNodeContents(ref.current); r.collapse(false);
      sel.removeAllRanges(); sel.addRange(r);
      rangeRef.current = r.cloneRange();
      if (hadFocus || initialSegments) ref.current.focus();
    } else if (!initialSegments) {
      ref.current.innerHTML = field.isBold ? `<b>${esc(field.text)}</b>` : esc(field.text);
      const sel = window.getSelection(), r = document.createRange();
      r.selectNodeContents(ref.current); r.collapse(false);
      sel.removeAllRanges(); sel.addRange(r);
      ref.current.focus();
    }
    if (autoFocus) {
      setTimeout(() => {
        if (!ref.current) return;
        ref.current.focus();
        const sel = window.getSelection(), r = document.createRange();
        r.selectNodeContents(ref.current); r.collapse(false);
        sel.removeAllRanges(); sel.addRange(r);
      }, 80);
    }
  }, [initialSegments]);

  const saveRange = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && ref.current?.contains(sel.anchorNode)) rangeRef.current = sel.getRangeAt(0).cloneRange();
  };
  const syncFmt = () => {
    saveRange();
    setFmt({ bold: document.queryCommandState("bold"), italic: document.queryCommandState("italic"), underline: document.queryCommandState("underline"), strike: document.queryCommandState("strikeThrough") });
  };
  const execCmd = (cmd, val = null) => {
    ref.current?.focus();
    const sel = window.getSelection();
    if (rangeRef.current) { sel.removeAllRanges(); sel.addRange(rangeRef.current); }
    document.execCommand(cmd, false, val);
    const newFmt = { bold: document.queryCommandState("bold"), italic: document.queryCommandState("italic"), underline: document.queryCommandState("underline"), strike: document.queryCommandState("strikeThrough") };
    setFmt(newFmt);
    const formatCmds = ["bold", "italic", "underline", "strikeThrough"];
    if (formatCmds.includes(cmd) && !val) {
      const sel2 = window.getSelection();
      const isCollapsed = sel2 && sel2.rangeCount > 0 && sel2.getRangeAt(0).collapsed;
      const stillOn = document.queryCommandState(cmd);
      if (!stillOn && isCollapsed) {
        const markId = "__fmt_escape_" + Date.now();
        document.execCommand("insertHTML", false, `<span id="${markId}" style="font-weight:normal;font-style:normal;text-decoration:none">&#8203;</span>`);
        const mark = document.getElementById(markId);
        if (mark) {
          const r = document.createRange(); r.setStart(mark.firstChild || mark, mark.firstChild ? 1 : 0); r.collapse(true);
          sel2.removeAllRanges(); sel2.addRange(r);
          const txt = document.createTextNode(mark.textContent || ""); mark.replaceWith(txt);
          const r2 = document.createRange(); r2.setStart(txt, txt.length); r2.collapse(true);
          sel2.removeAllRanges(); sel2.addRange(r2);
        }
      }
    }
    const sel3 = window.getSelection();
    if (sel3 && sel3.rangeCount > 0) rangeRef.current = sel3.getRangeAt(0).cloneRange();
  };
  const tbClick = (e, cmd, val = null) => { e.preventDefault(); execCmd(cmd, val); };
  const onDropDown = e => { e.stopPropagation(); saveRange(); };
  const ensureSelection = () => {
    const sel = window.getSelection();
    const hasSelection = sel && sel.rangeCount > 0 && !sel.getRangeAt(0).collapsed;
    if (!hasSelection) {
      if (rangeRef.current && !rangeRef.current.collapsed) { sel.removeAllRanges(); sel.addRange(rangeRef.current); }
      else { const r = document.createRange(); r.selectNodeContents(ref.current); sel.removeAllRanges(); sel.addRange(r); }
    }
  };
  const applyFont = val => {
    if (!val) return;
    ref.current?.focus();
    const sel = window.getSelection();
    if (rangeRef.current) { sel.removeAllRanges(); sel.addRange(rangeRef.current); }
    ensureSelection();
    // Use span with inline style so font family is reliably stored in getSegments()
    const range2 = sel.getRangeAt(0);
    if (range2 && !range2.collapsed) {
      const frag2 = range2.extractContents();
      const span2 = document.createElement("span");
      span2.style.fontFamily = val;
      span2.appendChild(frag2);
      range2.insertNode(span2);
      const nr2 = document.createRange();
      nr2.setStartAfter(span2); nr2.collapse(true);
      sel.removeAllRanges(); sel.addRange(nr2);
      rangeRef.current = nr2.cloneRange();
    } else {
      document.execCommand("fontName", false, val);
      if (sel.rangeCount > 0) rangeRef.current = sel.getRangeAt(0).cloneRange();
    }
    saveFontMemory(val, null); setLastFont(val);
  };
  const applySize = val => {
    if (!val) return;
    ref.current?.focus();
    const sel = window.getSelection();
    if (rangeRef.current) { sel.removeAllRanges(); sel.addRange(rangeRef.current); }
    ensureSelection();

    // execCommand("fontSize") only supports 7 legacy bucket sizes — it cannot
    // set arbitrary pt values. Instead we wrap the selection in a <span> with
    // an explicit data-pt attribute + inline font-size style so getSegments()
    // picks up the exact pt value and the backend stores it correctly.
    const ptVal = parseInt(val, 10);
    if (!ptVal) return;
    const ptStr = ptVal + "pt";

    // Convert pt → approximate px for visual rendering (1pt ≈ 1.333px at 96dpi)
    const px = Math.round(ptVal * 1.333);

    // Use insertHTML to wrap selected text in a styled span
    // First snapshot the selected text so we can rebuild it
    const range = sel.getRangeAt(0);
    if (!range.collapsed) {
      // Clone contents, wrap in span
      const frag = range.extractContents();
      const span = document.createElement("span");
      span.setAttribute("data-pt", ptStr);
      span.style.fontSize = ptStr;
      span.appendChild(frag);
      range.insertNode(span);
      // Move caret to end of inserted span
      const newRange = document.createRange();
      newRange.setStartAfter(span);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);
      rangeRef.current = newRange.cloneRange();
    } else {
      // No selection — set a future-typing marker using legacy execCommand as fallback
      const PT_SCALE = { "8": 1, "9": 1, "10": 2, "11": 2, "12": 3, "14": 4, "16": 4, "18": 5, "20": 5, "22": 6, "24": 6, "28": 7, "32": 7, "36": 7 };
      document.execCommand("fontSize", false, PT_SCALE[val] || 3);
      if (sel.rangeCount > 0) rangeRef.current = sel.getRangeAt(0).cloneRange();
    }

    saveFontMemory(null, ptStr); setLastSize(val);
  };
  const applyColor = hex => {
    ref.current?.focus();
    const sel = window.getSelection();
    if (rangeRef.current) { sel.removeAllRanges(); sel.addRange(rangeRef.current); }
    ensureSelection(); document.execCommand("foreColor", false, hex);
    if (sel.rangeCount > 0) rangeRef.current = sel.getRangeAt(0).cloneRange();
  };
  const applyAlign = al => {
    setAlign(al);
    const map = { left: "justifyLeft", center: "justifyCenter", right: "justifyRight", justify: "justifyFull" };
    ref.current?.focus();
    const sel = window.getSelection();
    if (rangeRef.current) { sel.removeAllRanges(); sel.addRange(rangeRef.current); }
    document.execCommand(map[al]);
  };
  const _toHex = col => {
    if (!col || col === "inherit" || col === "") return "";
    const m = col.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (m) return "#" + [m[1], m[2], m[3]].map(n => parseInt(n).toString(16).padStart(2, "0")).join("").toUpperCase();
    if (/^#[0-9a-fA-F]{3,6}$/.test(col)) return col.toUpperCase();
    return "";
  };
  const SCALE_PT = { 1: 8, 2: 10, 3: 12, 4: 14, 5: 18, 6: 24, 7: 36 };
  const getSegments = () => {
    const el = ref.current; if (!el) return [{ text: field.text, bold: false }];
    const segs = [];
    const walk = (node, p, depth) => {
      if (node.nodeType === 3) { if (node.textContent) segs.push({ text: node.textContent, ...p }); return; }
      if (node.nodeType === 1 && node.dataset && node.dataset.tab) {
        segs.push({ text: "\t", bold: false, italic: false, underline: false, strike: false, color: "", fontFamily: "", fontSize: "" });
        return;
      }
      if (node.nodeType !== 1) return;
      const tag = node.tagName.toLowerCase();
      const st = (depth === 0) ? {} : (node.style || {});
      const np = { ...p };
      const fw = st.fontWeight || "";
      np.bold      = np.bold || tag === "b" || tag === "strong" || fw === "bold" || parseInt(fw) >= 700;
      np.italic    = np.italic || tag === "i" || tag === "em" || st.fontStyle === "italic";
      const td = st.textDecoration || "";
      np.underline = np.underline || tag === "u" || td.includes("underline");
      np.strike    = np.strike || tag === "s" || tag === "strike" || td.includes("line-through");
      if (tag === "font") {
        const ca = node.getAttribute("color") || "";
        if (ca && ca !== "inherit") { const h = _toHex(ca) || ca; if (h) np.color = h; }
        const sa = node.getAttribute("size") || "";
        if (sa) { const pt = SCALE_PT[parseInt(sa)]; if (pt) np.fontSize = pt + "pt"; }
        const fa = node.getAttribute("face") || "";
        if (fa) np.fontFamily = fa.split(",")[0].replace(/['"]/g, "").trim();
      }
      if (st.color && st.color !== "inherit") { const h = _toHex(st.color); if (h) np.color = h; }
      if (st.fontFamily && st.fontFamily !== "inherit") np.fontFamily = st.fontFamily.replace(/['"]/g, "").split(",")[0].trim();
      if (st.fontSize && st.fontSize !== "inherit") np.fontSize = st.fontSize;
      const dpt = node.getAttribute && node.getAttribute("data-pt");
      if (dpt) np.fontSize = dpt;
      for (const c of node.childNodes) walk(c, np, depth + 1);
    };
    walk(el, { bold: false, italic: false, underline: false, strike: false, color: "", fontFamily: "", fontSize: "" }, 0);
    const m = [];
    for (const s of segs) {
      const l = m[m.length - 1];
      if (l && l.bold === s.bold && l.italic === s.italic && l.underline === s.underline && l.strike === s.strike && l.color === s.color && l.fontFamily === s.fontFamily && l.fontSize === s.fontSize) l.text += s.text;
      else m.push({ ...s });
    }
    return m.map(s => ({ ...s, text: s.text.replace(/​/g, "") })).filter(s => s.text);
  };

  const getSelectedOrAllText = () => {
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0 && !sel.getRangeAt(0).collapsed &&
      ref.current?.contains(sel.anchorNode)) {
    return { text: sel.toString(), isSelection: true };
  }
  return { text: ref.current?.innerText || "", isSelection: false };
};

  const runAiRewrite = async (mode) => {
  const { text } = getSelectedOrAllText();
  if (!text.trim()) return;
  setAiLoading(true); setAiSuggestion(null);
  try {
    const res = await fetch("https://resume-builder-d63q.onrender.com/ai-rewrite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text.trim(), mode }),
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    setAiSuggestion({ text: data.suggestion, mode });
  } catch (err) {
    setAiSuggestion({ text: "AI request failed. Please try again.", mode: "error" });
  } finally {
    setAiLoading(false);
  }
};

  const useAiSuggestion = () => {
    if (!aiSuggestion?.text) return;
    if (ref.current) {
      ref.current.innerText = aiSuggestion.text;
      // move cursor to end
      const r = document.createRange();
      r.selectNodeContents(ref.current); r.collapse(false);
      const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
      rangeRef.current = r.cloneRange();
    }
    setAiSuggestion(null); setAiPanel(false);
  };

  const apply = () => {
    const s = getSegments();
    const paraFmt = {};
    if (align && align !== "left") paraFmt.alignment = align;
    if (lineSpacing) paraFmt.line_spacing = parseFloat(lineSpacing);
    const hasFmt = Object.keys(paraFmt).length > 0;
    if (s.some(x => x.text.trim())) onApply(s, hasFmt ? paraFmt : null);
  };
  const kd = e => {
    if ((e.ctrlKey || e.metaKey) && e.key === "b") { e.preventDefault(); execCmd("bold"); }
    if ((e.ctrlKey || e.metaKey) && e.key === "i") { e.preventDefault(); execCmd("italic"); }
    if ((e.ctrlKey || e.metaKey) && e.key === "u") { e.preventDefault(); execCmd("underline"); }
    if ((e.ctrlKey || e.metaKey) && e.key === "z") {
      // Ctrl+Z inside editor — trigger field-level undo (closes editor, restores previous save)
      if (onUndo) { e.preventDefault(); onUndo(); return; }
      // Else let browser handle native contenteditable undo
    }
    if (e.key === "Escape") onCancel();
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      apply();
      // Add a blank paragraph below — causes natural reflow (like pressing Enter in Word)
      if (onAddBlankLine) setTimeout(() => onAddBlankLine(), 100);
    }
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      apply();
      if (onNextSection) setTimeout(() => onNextSection(), 80);
    }
  };

  const Btn = ({ active, title, onMD, children, sx: bsx }) => (
    <button onMouseDown={onMD} title={title} className={`tb-btn${active ? " active" : ""}`} style={bsx}>{children}</button>
  );
  const Sep = () => <span style={{ width: 1, height: 16, background: "#e5e7eb", margin: "0 1px", flexShrink: 0, alignSelf: "center" }} />;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "nowrap", padding: "5px 8px", background: "#f5f6fa", border: "1px solid #e5e7eb", borderRadius: "6px 6px 0 0", borderBottom: "none", overflow: "hidden" }}>
        <Btn active={fmt.bold}      title="Bold (Ctrl+B)"      onMD={e => tbClick(e, "bold")}          sx={{ fontWeight: 900, flexShrink: 0 }}>B</Btn>
        <Btn active={fmt.italic}    title="Italic (Ctrl+I)"    onMD={e => tbClick(e, "italic")}        sx={{ fontStyle: "italic", flexShrink: 0 }}>I</Btn>
        <Btn active={fmt.underline} title="Underline (Ctrl+U)" onMD={e => tbClick(e, "underline")}     sx={{ textDecoration: "underline", flexShrink: 0 }}>U</Btn>
        <Btn active={fmt.strike}    title="Strikethrough"      onMD={e => tbClick(e, "strikeThrough")} sx={{ textDecoration: "line-through", flexShrink: 0 }}>S</Btn>
        <Sep />
        <button title="Text color" onMouseDown={e => { e.preventDefault(); saveRange(); setTimeout(() => colorRef.current?.click(), 0); }}
          style={{ flexShrink: 0, padding: "2px 7px", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 4, cursor: "pointer", position: "relative", fontSize: 13, fontWeight: 700, color: "#111827", userSelect: "none" }}>
          A<span style={{ position: "absolute", bottom: 3, left: 4, right: 4, height: 3, borderRadius: 1, background: "#e11d48" }} />
          <input ref={colorRef} type="color" defaultValue="#e11d48" onChange={e => applyColor(e.target.value)} style={{ position: "absolute", opacity: 0, width: 0, height: 0, pointerEvents: "none" }} />
        </button>
        <Sep />
        <select onMouseDown={onDropDown} onChange={e => applyFont(e.target.value)} style={{ flex: "1 1 60px", minWidth: 0, maxWidth: 100, padding: "3px 4px", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 4, color: "#6b7280", fontSize: 11, cursor: "pointer" }}>
          <option value="">Font…</option>
          {FONTS.map(f => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
        </select>
        <select onMouseDown={onDropDown} onChange={e => applySize(e.target.value)} style={{ flexShrink: 0, width: 44, padding: "3px 4px", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 4, color: "#6b7280", fontSize: 11, cursor: "pointer" }}>
          <option value="">pt…</option>
          {SIZES.map(s => <option key={s} value={String(s)}>{s}</option>)}
        </select>
        {(lastFont || lastSize) && (
          <span title={`Re-apply: ${[lastFont, lastSize ? lastSize + "pt" : ""].filter(Boolean).join(" · ")}`}
            onClick={() => { if (lastFont) applyFont(lastFont); if (lastSize) applySize(lastSize); }}
            style={{ flexShrink: 0, marginLeft: 2, fontSize: 9, color: "#3b82f6", background: "rgba(37,99,235,0.15)", border: "1px solid rgba(37,99,235,0.3)", borderRadius: 4, padding: "2px 5px", cursor: "pointer", whiteSpace: "nowrap", userSelect: "none" }}>
            ↺ {[lastFont, lastSize ? lastSize + "pt" : ""].filter(Boolean).join("·")}
          </span>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "nowrap", padding: "5px 8px", background: "#f9fafb", border: "1px solid #e5e7eb", borderBottom: "none" }}>
        <Btn active={align === "left"}    title="Align left"    onMD={e => { e.preventDefault(); applyAlign("left"); }}   ><Ico.AlL /></Btn>
        <Btn active={align === "center"}  title="Center"        onMD={e => { e.preventDefault(); applyAlign("center"); }} ><Ico.AlC /></Btn>
        <Btn active={align === "right"}   title="Align right"   onMD={e => { e.preventDefault(); applyAlign("right"); }}  ><Ico.AlR /></Btn>
        <Btn active={align === "justify"} title="Justify"       onMD={e => { e.preventDefault(); applyAlign("justify"); }}><Ico.AlJ /></Btn>
        <Sep />
        <select title="Line spacing" value={lineSpacing} onChange={e => setLineSpacing(e.target.value)}
          style={{ flexShrink: 0, width: 72, fontSize: 10, height: 22, border: "1px solid #e5e7eb", borderRadius: 4, background: "#f9fafb", color: "#6b7280", padding: "0 3px", cursor: "pointer" }}>
          <option value="">≡ Spacing</option>
          <option value="1">Single</option>
          <option value="1.15">1.15×</option>
          <option value="1.5">1.5×</option>
          <option value="2">Double</option>
        </select>
        <span style={{ fontSize: 9, color: "#9ca3af", marginLeft: "auto", flexShrink: 0 }}>Ctrl+B/I/U • ↵</span>
        <Sep />
        <button
          onMouseDown={e => { e.preventDefault(); saveRange(); setAiPanel(p => !p); setAiSuggestion(null); }}
          style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 6, border: "1.5px solid #7c3aed", background: aiPanel ? "#ede9fe" : "#faf8ff", color: "#7c3aed", fontSize: 11.5, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter',sans-serif", transition: "all .12s" }}
        >
          ✦ AI Rewrite
        </button>
      </div>
      {/* ── AI Rewrite Panel ── */}
      {aiPanel && (
        <div style={{ padding: "10px 12px", background: "#faf8ff", border: "1.5px solid #ede9fe", borderBottom: "none", display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#7c3aed", letterSpacing: ".05em", textTransform: "uppercase" }}>AI Rewrite</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {["Polish", "Elaborate", "Formalise", "Condense", "Quantify", "Action Verbs"].map(mode => (
              <button key={mode}
                onMouseDown={e => { e.preventDefault(); runAiRewrite(mode); }}
                disabled={aiLoading}
                style={{ padding: "5px 13px", borderRadius: 99, border: "1.5px solid #ede9fe", background: "#fff", color: "#7c3aed", fontSize: 11.5, fontWeight: 600, cursor: aiLoading ? "not-allowed" : "pointer", fontFamily: "'Inter',sans-serif", opacity: aiLoading ? 0.5 : 1, transition: "all .12s", display: "inline-flex", alignItems: "center", gap: 5 }}
              >
                {mode === "Polish" && "✨"}
                {mode === "Elaborate" && "📝"}
                {mode === "Formalise" && "💼"}
                {mode === "Condense" && "✂️"}
                {mode === "Quantify" && "📊"}
                {mode === "Action Verbs" && "⚡"}
                {mode}
              </button>
            ))}
          </div>
          {aiLoading && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#7c3aed" }}>
              <span style={{ width: 12, height: 12, border: "2px solid #ede9fe", borderTop: "2px solid #7c3aed", borderRadius: "50%", animation: "spin .7s linear infinite", display: "inline-block" }} />
              Rewriting with AI…
            </div>
          )}
          {aiSuggestion && aiSuggestion.mode !== "error" && (
            <div style={{ marginTop: 4, padding: "12px 14px", background: "#fff", border: "1.5px solid #ede9fe", borderRadius: 10, fontSize: 13, color: "#1e1b4b", lineHeight: 1.7, fontFamily: "'Inter',sans-serif" }}>
              <div style={{ fontSize: 9.5, fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 6 }}>AI Suggestion</div>
              {aiSuggestion.text}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 10 }}>
                <button onMouseDown={e => { e.preventDefault(); setAiSuggestion(null); }}
                  style={{ padding: "5px 14px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", color: "#6b7280", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter',sans-serif" }}>
                  Discard
                </button>
                <button onMouseDown={e => { e.preventDefault(); useAiSuggestion(); }}
                  style={{ padding: "5px 16px", borderRadius: 8, border: "none", background: "#7c3aed", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter',sans-serif", boxShadow: "0 2px 8px rgba(124,58,237,0.25)" }}>
                  ✓ Use This
                </button>
              </div>
            </div>
          )}
          {aiSuggestion?.mode === "error" && (
            <div style={{ fontSize: 12, color: "#dc2626", padding: "6px 10px", background: "#fef2f2", borderRadius: 6, border: "1px solid #fecaca" }}>{aiSuggestion.text}</div>
          )}
        </div>
      )}
      <div ref={ref} contentEditable suppressContentEditableWarning
        onKeyDown={kd} onKeyUp={syncFmt} onMouseUp={syncFmt} onSelect={syncFmt}
        className="glow-input"
        style={{ minHeight: 80, padding: "14px 16px", border: "1px solid #e5e7eb", borderRadius: "0 0 10px 10px", fontSize: 14, fontFamily: "'Inter',sans-serif", background: "#f5f6fa", outline: "none", lineHeight: 1.9, color: "#111827", cursor: "text", whiteSpace: "pre-wrap", wordBreak: "break-word" }}
      />
      <div style={{ display: "flex", gap: 6, marginTop: 12, justifyContent: "flex-end", paddingTop: 10, borderTop: "1px solid #e5e7eb" }}>
        <RippleBtn variant="ghost" onClick={onCancel} style={{ fontSize: 12, padding: "6px 14px", gap: 4 }}><Ico.X /> Esc</RippleBtn>
        <RippleBtn onClick={onDelete} style={{ background: "rgba(220,38,38,0.08)", color: "#ef4444", border: "1px solid rgba(220,38,38,0.3)", fontSize: 12, padding: "6px 14px", gap: 4 }}><Ico.Trash /> Delete</RippleBtn>
        <RippleBtn onClick={apply} disabled={saving} style={{ background: saving ? "#e5e7eb" : "#2563eb", color: saving ? "#6b7280" : "#fff", border: "none", fontSize: 12, padding: "6px 16px", gap: 4, fontWeight: 700, boxShadow: saving ? "none" : "0 4px 16px rgba(37,99,235,0.25)" }}>
          <Ico.Ok /> {saving ? "Saving…" : "Apply"}
        </RippleBtn>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   ADD LINE FORM
══════════════════════════════════════════════════════════════════════ */
const BULLET_OPTIONS = [
  { label: "None", value: "" }, { label: "–", value: "– " }, { label: "•", value: "• " },
  { label: "▪", value: "▪ " }, { label: "›", value: "› " }, { label: "→", value: "→ " },
];

function AddLineForm({ field, onAdd, onCancel, adding, sectionFields = [] }) {
  const sn = field.text.slice(0, 32) + (field.text.length > 32 ? "…" : "");
  const TEXT_BULLET_RE = /^(–\s|•\s|▪\s|›\s|→\s)/;
  const hasTextBullets = [field, ...sectionFields].some(f => TEXT_BULLET_RE.test(f.text || ""));
  const [bullet, setBullet] = useState(() => {
    if (!hasTextBullets) return "";
    const sources = [field, ...sectionFields];
    for (const f of sources) {
      const t = f.text || "";
      if (t.startsWith("– ")) return "– ";
      if (t.startsWith("• ")) return "• ";
      if (t.startsWith("▪ ")) return "▪ ";
      if (t.startsWith("› ")) return "› ";
      if (t.startsWith("→ ")) return "→ ";
    }
    return "";
  });
  const stub = { text: "", isBold: false };
  const handleApply = (segs) => {
    if (!bullet) { onAdd(field, { segments: segs, inherit_list_format: true }); return; }
    const first = segs[0] || {};
    const bulletSeg = { text: bullet, bold: false, italic: false, underline: false, strike: false, color: "", fontFamily: first.fontFamily || "", fontSize: first.fontSize || "" };
    onAdd(field, { segments: [bulletSeg, ...segs], inherit_list_format: false });
  };
  return (
    <Box sx={{ p: 1.25, bgcolor: "#fff", borderRadius: 2, border: "1px solid rgba(37,99,235,0.25)", mb: 0.5, boxShadow: "0 4px 20px rgba(37,99,235,0.06)", animation: "expandIn .3s ease" }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.25 }}>
        <Box sx={{ px: 1, py: 0.25, borderRadius: 99, bgcolor: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.25)", fontSize: 9, fontWeight: 700, color: "#2563eb" }}>+ NEW LINE</Box>
        <Typography sx={{ fontSize: 10.5, color: "text.disabled", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>after: {sn}</Typography>
      </Stack>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1.25, p: "7px 10px", bgcolor: "#f5f6fa", borderRadius: 1, border: "1px solid #e5e7eb", flexWrap: "wrap" }}>
        <Typography sx={{ fontSize: 10, fontWeight: 700, color: "text.secondary", flexShrink: 0 }}>Bullet:</Typography>
        {BULLET_OPTIONS.map(opt => (
          <button key={opt.label} onClick={() => setBullet(opt.value)}
            style={{ padding: "3px 10px", borderRadius: 99, border: `1px solid ${bullet === opt.value ? "#2563eb" : "#e5e7eb"}`, background: bullet === opt.value ? "rgba(37,99,235,0.08)" : "transparent", color: bullet === opt.value ? "#2563eb" : "#6b7280", fontSize: 13, cursor: "pointer", fontWeight: 600, transition: "all .12s", lineHeight: 1.2, minWidth: 32, textAlign: "center" }}>
            {opt.label}
          </button>
        ))}
      </Box>
      <InlineEditor field={stub} sc="#2563eb" saving={adding} onApply={handleApply} onCancel={onCancel} onDelete={onCancel} autoFocus={true} />
    </Box>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   FIELD ROW
══════════════════════════════════════════════════════════════════════ */
function FieldRow({ field, onSave, onAddLine, onDeleteLine, onDeleteField, saving, onReplaceImage, onEditBar, sessionId, isAddingAfter, onCancelAdd, onEditStart, onEditEnd, onLinkSave, onRelinkDone, undoStack = [], onPushUndo, onPopUndo, isDark = false, isReadOnly = false, onNextSection = null, onAddBlankLine = null }) {
  const [editing, setEditing]       = useState(false);
  const [value, setValue]           = useState(field.text);
  const [hovered, setHovered]       = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [fieldSegs, setFieldSegs]   = useState(null);
  const [segsLoading, setSegsLoading] = useState(false);
  // Keep inlineLinks in local state so the URL editor persists after a field refresh
  const [localInlineLinks, setLocalInlineLinks] = useState(field.inlineLinks || null);
  React.useEffect(() => {
    if (field.inlineLinks?.length) {
      setLocalInlineLinks(field.inlineLinks);
    }
  }, [field.inlineLinks]);
  const imgRef  = useRef(null);
  const sparkle = useSparkle();

  const sc       = field.section?.color || "#2563eb";
  const mod      = field.text !== field.originalText;
  const isInserted = field.isInserted || false;
  const hasValue   = !!(field.text && field.text.trim());

  useEffect(() => { setValue(field.text); }, [field.text]);

  const openEdit = useCallback(() => {
    if (isReadOnly) return; // Original variant — read-only
    setEditing(true);
    onEditStart?.(field);
  }, [field, onEditStart, isReadOnly]);

  const closeEdit = useCallback(() => {
    setEditing(false);
    onEditEnd?.();
  }, [onEditEnd]);

  useEffect(() => {
    if (editing) {
      setFieldSegs(null);
      if (field.paraIndex >= 0 && field.source) {
        setSegsLoading(true);
        fetch(`${API_BASE}/get-segments/${sessionId}?para=${field.paraIndex}&source=${encodeURIComponent(field.source)}`)
          .then(r => r.json()).then(d => {
            if (d.success && d.segments.length) {
              const segText = d.segments.map(s => s.text).join("");
              if ((field.text || "").length === 0 || segText.length >= (field.text || "").length * 0.9) setFieldSegs(d.segments);
            }
          }).catch(() => {}).finally(() => setSegsLoading(false));
      }
    }
  }, [editing]);

  const save   = (e) => { if (value.trim() && value !== field.text) { onSave(field, value.trim() || field.text, null); if (e) sparkle(e.clientX || 200, e.clientY || 200, sc); } closeEdit(); };
  const cancel = () => { setValue(field.text); closeEdit(); };

  if (field.isHeader) {
    if (editing) return (
      <Box sx={{ p: 1, bgcolor: `${sc}0e`, borderRadius: 2, mt: 1.5, mb: 0.5, border: `1px solid ${sc}28`, animation: "fadeUp .2s ease" }}>
        <TextField fullWidth size="small" value={value} onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") save(e.nativeEvent); if (e.key === "Escape") cancel(); }}
          inputProps={{ style: { fontSize: 10.5, fontWeight: 800, color: sc, textTransform: "uppercase", letterSpacing: "0.1em" } }}
          sx={{ mb: 1, "& .MuiOutlinedInput-root": { bgcolor: "transparent" } }} />
        <Stack direction="row" spacing={0.75} justifyContent="flex-end">
          <Button size="small" onClick={cancel} sx={{ fontSize: 10 }}>Cancel</Button>
          <Button size="small" variant="contained" onClick={save} disabled={saving} sx={{ fontSize: 10, bgcolor: sc, "&:hover": { bgcolor: sc } }}>{saving ? "…" : "Apply"}</Button>
        </Stack>
      </Box>
    );
    return (
      <Box onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        sx={{ display: "flex", alignItems: "center", gap: 1, p: "5px 8px", mt: 1.75, mb: 0.375, borderRadius: 1, cursor: "pointer", transition: "all .2s", bgcolor: hovered ? "rgba(37,99,235,0.06)" : "transparent", border: `1px solid ${hovered ? "rgba(37,99,235,0.25)" : "transparent"}` }}>
        <Box sx={{ width: 2, borderRadius: 99, bgcolor: "#2563eb", flexShrink: 0, alignSelf: "stretch", minHeight: 14 }} />
        <Typography onClick={openEdit} sx={{ fontSize: 10, fontWeight: 700, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.1em", flex: 1, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{field.text}</Typography>
        <button onClick={() => onAddLine(field)} style={{ background: "none", border: "1px solid #e5e7eb", borderRadius: 4, cursor: "pointer", padding: "2px 6px", color: "#9ca3af", opacity: hovered ? 1 : 0, transition: "opacity .2s", fontSize: 9, fontWeight: 600, display: "flex", alignItems: "center", gap: 2 }}>
          <Plus size={9} /> add
        </button>
      </Box>
    );
  }

  if (field.type === "image") return (
    <Box className="field-card" sx={{ p: 1.25, display: "flex", gap: 1, alignItems: "center" }}>
      <Box sx={{ width: 32, height: 32, borderRadius: 1, bgcolor: "#f9fafb", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 14 }}>📷</Box>
      <Typography sx={{ fontSize: 11.5, color: "text.secondary", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{field.text}</Typography>
      <input ref={imgRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => { if (e.target.files?.[0]) onReplaceImage(field, e.target.files[0]); e.target.value = ""; }} />
      <RippleBtn variant="ghost" onClick={() => imgRef.current?.click()} disabled={saving} style={{ padding: "3px 9px", fontSize: 10, color: "#3b82f6", borderColor: "rgba(37,99,235,0.25)" }}>Replace</RippleBtn>
    </Box>
  );

  if (field.type === "progress-bar") return (
    <Box className="field-card" sx={{ p: 1.25, border: `1px solid ${mod ? `${sc}35` : "#e5e7eb"}` }}>
      <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.75 }}>
        <Typography sx={{ fontSize: 11, color: "text.secondary", fontWeight: 600, flex: 1 }}>{field.barLabel}</Typography>
        <Typography sx={{ fontSize: 12, fontWeight: 800, color: sc }}>{value}</Typography>
      </Stack>
      <Stack direction="row" alignItems="center" spacing={0.75}>
        <Box sx={{ flex: 1, height: 6, bgcolor: "#e5e7eb", borderRadius: 99, overflow: "hidden" }}>
          <Box sx={{ height: "100%", width: `${parseInt(value) || 0}%`, background: `linear-gradient(90deg,${sc},${sc}cc)`, borderRadius: 99, transition: "width .4s" }} />
        </Box>
        <RippleBtn onClick={e => { onEditBar(field, parseInt(value) || 0); sparkle(e.clientX, e.clientY, sc); }} disabled={saving || value === field.text}
          style={{ padding: "3px 8px", fontSize: 10, background: value !== field.text ? sc : "#f3f4f6", color: value !== field.text ? "#fff" : "#9ca3af", border: "none" }}>{saving ? "…" : "Set"}</RippleBtn>
      </Stack>
      <input type="range" min="1" max="100" value={parseInt(value) || 0} onChange={e => setValue(e.target.value + "%")}
        style={{ width: "100%", accentColor: sc, cursor: "pointer", marginTop: 4, opacity: .7 }} />
    </Box>
  );

  // ── Dedicated URL editor for icon-link fields (LinkedIn, GitHub, etc.) ──
  if (editing && field.type === "icon-link") {
    const platform = field.linkLabel || "Link";
    const platformColor = platform.toLowerCase().includes("linkedin") ? "#0a66c2"
                        : platform.toLowerCase().includes("github")   ? "#24292e"
                        : platform.toLowerCase() === "mail"           ? "#ea4335"
                        : "#2563eb";
    const platformIcon = platform.toLowerCase().includes("linkedin") ? "in"
                       : platform.toLowerCase().includes("github")   ? "gh"
                       : platform.toLowerCase() === "mail"           ? "✉"
                       : "🔗";
    return (
      <Box className="field-card editing" data-field-id={field.id} sx={{ p: 1.75, bgcolor: "#fff", animation: "fadeUp .18s ease" }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5, pb: 1.125, borderBottom: "1px solid #e5e7eb" }}>
          <Box sx={{ width: 26, height: 26, borderRadius: 1.5, bgcolor: platformColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Typography sx={{ fontSize: 9, fontWeight: 800, color: "#fff", letterSpacing: "-.01em" }}>{platformIcon}</Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: "#374151", letterSpacing: ".01em" }}>{platform} URL</Typography>
            <Typography sx={{ fontSize: 9.5, color: "#9ca3af" }}>Paste the full URL below</Typography>
          </Box>
          <RippleBtn variant="ghost" onClick={cancel} style={{ fontSize: 11, padding: "3px 10px", color: "#9ca3af" }}>Cancel</RippleBtn>
        </Stack>

        {/* URL input */}
        <Box sx={{ position: "relative", mb: 1.25 }}>
          <Box sx={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none", display: "flex" }}>
            <Link size={13} />
          </Box>
          <input
            autoFocus
            defaultValue={field.text}
            id={`url-input-${field.id}`}
            placeholder={`https://www.${platform.toLowerCase()}.com/in/yourprofile`}
            onKeyDown={e => {
              if (e.key === "Escape") cancel();
              if (e.key === "Enter") {
                const val = e.target.value.trim();
                if (val) { onSave(field, [{ text: val, bold: false }], null, null); closeEdit(); }
              }
            }}
            style={{
              width: "100%",
              padding: "9px 12px 9px 34px",
              borderRadius: 8,
              border: "1.5px solid #ddd6fe",
              fontFamily: "'Inter',sans-serif",
              fontSize: 12.5,
              color: "#1e293b",
              outline: "none",
              boxSizing: "border-box",
              background: "#fafbfc",
              boxShadow: "0 0 0 3px rgba(124,58,237,0.07)",
            }}
          />
        </Box>

        {/* Preview + Save */}
        <Stack direction="row" spacing={0.75} justifyContent="flex-end" alignItems="center">
          <Typography sx={{ fontSize: 10, color: "#9ca3af", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {field.text && <><span style={{ color: "#c4b5fd" }}>current: </span>{field.text.slice(0, 50)}{field.text.length > 50 ? "…" : ""}</>}
          </Typography>
          <RippleBtn
            onClick={() => {
              const val = document.getElementById(`url-input-${field.id}`)?.value.trim();
              if (val) { onSave(field, [{ text: val, bold: false }], null, null); closeEdit(); }
            }}
            disabled={saving}
            style={{ background: platformColor, color: "#fff", border: "none", fontSize: 11.5, fontWeight: 700, padding: "6px 16px", borderRadius: 7, boxShadow: `0 2px 8px ${platformColor}55` }}
          >
            {saving ? "Saving…" : "Save URL"}
          </RippleBtn>
        </Stack>
      </Box>
    );
  }

  if (editing) return (
    <Box className="field-card editing" sx={{ p: 1.75, bgcolor: "#fff", animation: "fadeUp .18s ease" }}>
      <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 1.25, pb: 1.125, borderBottom: "1px solid #e5e7eb", flexWrap: "wrap" }}>
        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ flex: 1 }}>
          <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: sc, flexShrink: 0 }} />
          <Typography sx={{ fontSize: 9.5, fontWeight: 700, color: "text.primary", letterSpacing: ".06em", textTransform: "uppercase", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{field.format || "TEXT"}</Typography>
        </Stack>
        {field.isBold && <PillEl bg="#fefce8" color="#ca8a04" border="transparent" style={{ fontSize: 8, padding: "1px 6px" }}>BOLD</PillEl>}
        {isInserted && <PillEl bg="rgba(22,163,74,0.08)" color="#22c55e" border="transparent" style={{ fontSize: 8 }}>NEW</PillEl>}
        {segsLoading && <span style={{ fontSize: 9, color: "#3b82f6", display: "flex", alignItems: "center", gap: 4 }}><SpinnerEl size={8} color="#3b82f6" />Loading…</span>}
        {!segsLoading && fieldSegs && <span style={{ fontSize: 9, color: "#16a34a", fontWeight: 600 }}>✓ formatted</span>}
      </Stack>
      <InlineEditor field={field} sc={sc} saving={saving} initialSegments={fieldSegs}
        onNextSection={onNextSection}
        onAddBlankLine={onAddBlankLine}
        onUndo={undoStack.length > 0 ? async () => {
          const top = undoStack[undoStack.length - 1];
          if (!top) return;
          closeEdit();
          if (top.segs && top.segs.length > 0) { await onSave(field, top.segs, null, null); }
          else { await onSave(field, top.text, null, null); }
          if (onPopUndo) onPopUndo(field.id);
        } : null}
        onApply={(segs, paraFmt) => {
          const snapSegs = fieldSegs && fieldSegs.length > 0 ? fieldSegs : null;
          if (onPushUndo) onPushUndo(field.id, field.text, snapSegs);
          onSave(field, segs, null, paraFmt); closeEdit();
        }}
        onCancel={cancel}
        onDelete={() => { closeEdit(); setConfirmDel(true); }} />

      {/* ── Inline hyperlink URL editor (for fields with embedded links) ── */}
      {localInlineLinks && localInlineLinks.length > 0 && (
        <Box sx={{ mt: 1.5, pt: 1.25, borderTop: "1px solid #f1f5f9" }}>
          <Typography sx={{ fontSize: 9.5, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".07em", mb: 1 }}>
            URLs in this field
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
            {localInlineLinks.map((lnk, li) => {
              const isLI = lnk.label === "LinkedIn";
              const isGH = lnk.label === "GitHub";
              const isMA = lnk.label === "Mail";
              const dotColor = isLI ? "#0a66c2" : isGH ? "#24292e" : isMA ? "#ea4335" : "#6366f1";
              const nameId = `hl-name-${field.id}-${li}`;
              const urlId  = `hl-url-${field.id}-${li}`;

              const inputStyle = (color) => ({
                width: "100%", padding: "6px 10px", borderRadius: 7,
                border: `1.5px solid #e2e8f0`, fontFamily: "'Inter',sans-serif",
                fontSize: 12, color: "#374151", outline: "none",
                background: "#fafbfc", boxSizing: "border-box",
                transition: "border-color .12s, box-shadow .12s",
              });

              const saveName = async () => {
                const newName = document.getElementById(nameId)?.value.trim();
                if (!newName) return;
                // Plain-text email: replace the email address directly in the field text
                if (lnk.rId === "__plain_email__" || lnk.rId === "__noid__") {
                  const newText = field.text.replace(/[\w.+-]+@[\w-]+\.\w+/, newName);
                  onSave(field, newText, null); return;
                }
                if (!lnk.rId) return;
                try {
                  const r = await fetch(`${API_BASE}/edit-hyperlink-text`, {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ session_id: sessionId, para_index: field.paraIndex ?? -1, source: field.source ?? "body", r_id: lnk.rId, new_text: newName }),
                  });
                  const d = await r.json();
                  if (d.success) {
                    onRelinkDone?.(d.fields);
                    const uf = d.fields?.find(f => f.paraIndex === field.paraIndex && f.source === field.source && f.inlineLinks);
                    if (uf?.inlineLinks) setLocalInlineLinks(uf.inlineLinks);
                  }
                } catch(e) {}
              };

              const saveUrl = () => {
                let newUrl = document.getElementById(urlId)?.value.trim();
                if (!newUrl) return;
                // Auto-prefix mailto: if user typed a bare email for a Mail link
                if (isMA && !newUrl.startsWith("mailto:") && newUrl.includes("@")) {
                  newUrl = "mailto:" + newUrl;
                }
                // Plain-text email or no-rId hyperlink — just update field text
                if (lnk.rId === "__plain_email__" || lnk.rId === "__noid__") {
                  const emailAddr = newUrl.replace("mailto:", "");
                  const newText = field.text.replace(/[\w.+-]+@[\w-]+\.\w+/, emailAddr);
                  onSave(field, newText, null);
                } else {
                  onLinkSave?.(field, lnk.rId, newUrl);
                }
              };

              return (
                <Box key={`${lnk.rId || li}`} sx={{ p: 1.25, border: "1.5px solid #ede9fe", borderRadius: 2, bgcolor: "#fdfcff", display: "flex", flexDirection: "column", gap: 0.75 }}>
                  {/* Platform header */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.25 }}>
                    <Box sx={{ width: 20, height: 20, borderRadius: 1, bgcolor: dotColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Typography sx={{ fontSize: 8, fontWeight: 800, color: "#fff" }}>{isLI ? "in" : isGH ? "gh" : isMA ? "✉" : "🔗"}</Typography>
                    </Box>
                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#374151" }}>{lnk.label || "Link"}</Typography>
                  </Box>

                  {/* Display name row */}
                  <Box sx={{ display: "flex", gap: 0.625, alignItems: "center" }}>
                    <Typography sx={{ fontSize: 10, color: "#94a3b8", width: 38, flexShrink: 0 }}>Name</Typography>
                    <input id={nameId} defaultValue={lnk.text || ""} placeholder="Display text…"
                      style={inputStyle(dotColor)}
                      onFocus={e => { e.target.style.borderColor = dotColor; e.target.style.boxShadow = `0 0 0 2px ${dotColor}22`; }}
                      onBlur={e  => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
                      onKeyDown={e => { if (e.key === "Enter") saveName(); }}
                    />
                    <Box component="button" onClick={saveName}
                      sx={{ px: 1.25, py: 0.5, borderRadius: 1, border: "none", bgcolor: dotColor, color: "#fff", fontSize: 10, fontWeight: 700, cursor: "pointer", flexShrink: 0, fontFamily: "'Inter',sans-serif", whiteSpace: "nowrap", "&:hover": { opacity: .85 } }}>
                      Save
                    </Box>
                  </Box>

                  {/* URL row */}
                  <Box sx={{ display: "flex", gap: 0.625, alignItems: "center" }}>
                    <Typography sx={{ fontSize: 10, color: "#94a3b8", width: 38, flexShrink: 0 }}>URL</Typography>
                    <input id={urlId} defaultValue={lnk.url || ""} placeholder="https://…"
                      style={inputStyle(dotColor)}
                      onFocus={e => { e.target.style.borderColor = dotColor; e.target.style.boxShadow = `0 0 0 2px ${dotColor}22`; }}
                      onBlur={e  => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
                      onKeyDown={e => { if (e.key === "Enter") saveUrl(); }}
                    />
                    <Box component="button" onClick={saveUrl}
                      sx={{ px: 1.25, py: 0.5, borderRadius: 1, border: "none", bgcolor: dotColor, color: "#fff", fontSize: 10, fontWeight: 700, cursor: "pointer", flexShrink: 0, fontFamily: "'Inter',sans-serif", whiteSpace: "nowrap", "&:hover": { opacity: .85 } }}>
                      Save
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
          <Typography sx={{ fontSize: 9.5, color: "#b0b9c6", mt: 0.75 }}>Edit name or URL — each has its own Save button</Typography>

          {/* ── Restore broken / add new hyperlink ── */}
          <Box sx={{ mt: 1.25, pt: 1.25, borderTop: "1px dashed #f1d0b5" }}>
            <Typography sx={{ fontSize: 9.5, fontWeight: 700, color: "#f59e0b", textTransform: "uppercase", letterSpacing: ".07em", mb: 0.75 }}>
              ⚠ Restore a broken link
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.625 }}>
              <input
                id={`relink-text-${field.id}`}
                placeholder="Display text to re-link (e.g. gh chvamsi)"
                style={{ padding: "5px 9px", borderRadius: 6, border: "1.5px solid #fde68a", fontFamily: "'Inter',sans-serif", fontSize: 11.5, color: "#374151", outline: "none", background: "#fffbeb", width: "100%", boxSizing: "border-box" }}
              />
              <input
                id={`relink-url-${field.id}`}
                placeholder="URL (e.g. https://github.com/yourprofile)"
                style={{ padding: "5px 9px", borderRadius: 6, border: "1.5px solid #fde68a", fontFamily: "'Inter',sans-serif", fontSize: 11.5, color: "#374151", outline: "none", background: "#fffbeb", width: "100%", boxSizing: "border-box" }}
              />
              <Box
                component="button"
                onClick={async () => {
                  const text = document.getElementById(`relink-text-${field.id}`)?.value.trim();
                  const url  = document.getElementById(`relink-url-${field.id}`)?.value.trim();
                  if (!text || !url) return;
                  try {
                    const r = await fetch(`${API_BASE}/relink-text`, {
                      method: "POST", headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ session_id: sessionId, para_index: field.paraIndex ?? -1, source: field.source ?? "body", text, url }),
                    });
                    const d = await r.json();
                    if (d.success) {
                      // Update global fields state + preview + localInlineLinks
                      onRelinkDone?.(d.fields);
                      // Refresh localInlineLinks with the NEW rId
                      if (d.fields) {
                        const updatedField = d.fields.find(f => f.paraIndex === field.paraIndex && f.source === field.source && f.inlineLinks);
                        if (updatedField?.inlineLinks) setLocalInlineLinks(updatedField.inlineLinks);
                      }
                    } else {
                      alert("Re-link failed: " + (d.message || "unknown error"));
                    }
                  } catch(e) { alert("Re-link error: " + e.message); }
                }}
                sx={{ px: 1.5, py: 0.625, borderRadius: 1, border: "none", bgcolor: "#f59e0b", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter',sans-serif", textAlign: "center", "&:hover": { bgcolor: "#d97706" } }}
              >
                🔗 Restore Link
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );

  if (confirmDel) return (
    <Box className="field-card" sx={{ p: 1.25, bgcolor: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.25)", animation: "fadeUp .18s ease" }}>
      <Typography sx={{ fontSize: 12, color: "#ef4444", fontWeight: 700, mb: 0.625 }}>Delete this line?</Typography>
      <Typography sx={{ fontSize: 11, color: "text.secondary", mb: 1.25, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", opacity: .7 }}>{field.text}</Typography>
      <Stack direction="row" spacing={0.75} justifyContent="flex-end">
        <RippleBtn variant="ghost" onClick={() => setConfirmDel(false)} style={{ fontSize: 11, padding: "4px 12px" }}>Cancel</RippleBtn>
        <RippleBtn onClick={() => { setConfirmDel(false); isInserted ? onDeleteLine(field) : onDeleteField(field); }} disabled={saving}
          style={{ background: "#dc2626", color: "#fff", border: "none", fontSize: 11, padding: "4px 12px" }}>{saving ? "…" : "Delete"}</RippleBtn>
      </Stack>
    </Box>
  );

  const fieldLabel = field.label || (field.format && field.format !== "TEXT" ? field.format : null);
  const cardCls = [
    "field-input-card",
    hasValue   ? "has-value" : "",
    mod        ? "modified"  : "",
    isInserted ? "inserted"  : "",
    isReadOnly ? "field-readonly" : "",
  ].filter(Boolean).join(" ");

  return (
    <>
    {undoStack.length > 0 && !isReadOnly && (
      <Box sx={{ display:"flex", alignItems:"center", gap:0.75, mb:0.5, px:0.5 }}>
        <Box sx={{ width:6, height:6, borderRadius:"50%", bgcolor:"#7c3aed", flexShrink:0, boxShadow:"0 0 6px #7c3aed80" }} />
        <Typography sx={{ fontSize:10.5, color:"#7c3aed", fontWeight:600, fontFamily:"'Inter',sans-serif", flex:1 }}>Undo last edit</Typography>
        <Box component="button"
          onClick={async e => {
            e.stopPropagation();
            const top = undoStack[undoStack.length - 1];
            if (!top) return;
            if (top.segs && top.segs.length > 0) { await onSave(field, top.segs, null, null); }
            else { await onSave(field, top.text, null, null); }
            if (onPopUndo) onPopUndo(field.id);
          }}
          sx={{ display:"inline-flex", alignItems:"center", gap:0.5, px:1.25, py:0.375, borderRadius:99,
            border:"1px solid rgba(124,58,237,.35)", bgcolor:"rgba(124,58,237,.08)", color:"#7c3aed",
            cursor:"pointer", fontSize:11, fontWeight:700, fontFamily:"'Inter',sans-serif",
            "&:hover":{ bgcolor:"rgba(124,58,237,.18)" }, transition:"all .15s" }}>
          <Ico.Rst /> Undo {undoStack.length > 1 ? `(${undoStack.length})` : ""}
        </Box>
      </Box>
    )}
    <Box
      className={cardCls}
      data-field-id={field.id}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => { if (!isAddingAfter && onCancelAdd) onCancelAdd(); openEdit(); }}
      sx={{ opacity: saving ? .5 : 1, mb: 1, userSelect: "none", cursor: isReadOnly ? "not-allowed" : undefined }}
    >
      <Box sx={{ px: 2, pt: 1.375, pb: 1.5, position: "relative", minHeight: 60 }}>
        {fieldLabel && (
          <Typography sx={{
            fontSize: 10.5, fontWeight: 600, mb: 0.5, letterSpacing: ".01em",
            color: mod ? (isDark ? "#7ca1ff" : "#2563eb") : isInserted ? "#22c55e" : (isDark ? "rgba(100,140,220,.45)" : "#94a3b8"),
            display: "flex", alignItems: "center", gap: 0.5,
          }}>
            {fieldLabel}
            {isInserted && <Box component="span" sx={{ fontSize: 8, fontWeight: 700, color: "#16a34a", bgcolor: "rgba(22,163,74,0.1)", px: 0.6, py: 0.1, borderRadius: 0.5, ml: 0.25 }}>NEW</Box>}
            {mod && !isInserted && <Box component="span" sx={{ fontSize: 8, fontWeight: 700, color: "#2563eb", bgcolor: "rgba(37,99,235,0.1)", px: 0.6, py: 0.1, borderRadius: 0.5, ml: 0.25 }}>EDITED</Box>}
          </Typography>
        )}
        <Box sx={{ pr: "38px" }}>
          <Typography sx={{
            fontSize: field.isBold ? 13.5 : 13,
            fontWeight: field.isBold ? 600 : 400,
            color: hasValue ? (field.type === "icon-link" ? (isDark ? "#7ca1ff" : "#2563eb") : (isDark ? "#c8d8ff" : "#111827")) : (isDark ? "rgba(80,110,220,.35)" : "#c1c8d4"),
            lineHeight: 1.55,
            overflow: "hidden", textOverflow: "ellipsis",
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
            wordBreak: "break-word",
            fontStyle: hasValue ? "normal" : "italic",
          }}>
            {hasValue ? field.text : "Click to add…"}
          </Typography>
        </Box>
        <Box sx={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", width: 80, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
          <Box sx={{
            position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)",
            display: "flex", alignItems: "center", gap: 0.375,
            opacity: hovered && !isReadOnly ? 1 : 0,
            transition: "opacity .15s",
            pointerEvents: hovered && !isReadOnly ? "auto" : "none",
          }}>
            {!isInserted && (
              <Tooltip title="Add line below" placement="top">
                <Box component="button"
                  onMouseDown={e => { e.stopPropagation(); e.preventDefault(); onAddLine(field); }}
                  sx={{ width: 24, height: 24, borderRadius: 1, border: "1px solid #e5e7eb", bgcolor: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#9ca3af", flexShrink: 0, "&:hover": { borderColor: "#2563eb", color: "#2563eb", bgcolor: "#eff6ff" }, transition: "all .12s" }}>
                  <Plus size={11} />
                </Box>
              </Tooltip>
            )}
            <Tooltip title="Delete" placement="top">
              <Box component="button"
                onMouseDown={e => { e.stopPropagation(); e.preventDefault(); setConfirmDel(true); }}
                sx={{ width: 24, height: 24, borderRadius: 1, border: "1px solid rgba(220,38,38,0.25)", bgcolor: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#ef4444", flexShrink: 0, "&:hover": { bgcolor: "rgba(220,38,38,0.06)" }, transition: "all .12s" }}>
                <Trash2 size={11} />
              </Box>
            </Tooltip>
            <Tooltip title="Edit" placement="top">
              <Box sx={{ width: 24, height: 24, borderRadius: 1, border: "1px solid rgba(37,99,235,0.3)", bgcolor: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb", flexShrink: 0 }}>
                <Edit2 size={11} />
              </Box>
            </Tooltip>
          </Box>
          <Box sx={{
            position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)",
            width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
            bgcolor: hasValue ? "#22c55e" : "#f1f5f9",
            border: hasValue ? "none" : "1.5px dashed #cbd5e1",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: hasValue ? "0 1px 4px rgba(34,197,94,0.28)" : "none",
            opacity: hovered ? 0 : 1, transition: "opacity .15s", pointerEvents: "none",
          }}>
            {hasValue ? <Check size={12} color="#fff" strokeWidth={3} /> : <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: "#cbd5e1" }} />}
          </Box>
        </Box>
      </Box>
    </Box>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   SECTION PAGE
══════════════════════════════════════════════════════════════════════ */
const SECTION_META = {
  header:         { label: "Header",         desc: "Your name, title, and contact details at the top of your resume." },
  contact:        { label: "Contacts",       desc: "Add your up-to-date contact information so employers and recruiters can easily reach you." },
  personal:       { label: "Personal",       desc: "Tell employers a bit about yourself." },
  experience:     { label: "Experience",     desc: "List your work history, starting with your most recent position." },
  work:           { label: "Experience",     desc: "List your work history, starting with your most recent position." },
  education:      { label: "Education",      desc: "Add your educational background, degrees, and certifications." },
  skills:         { label: "Skills",         desc: "Highlight your key skills and proficiencies relevant to the role." },
  summary:        { label: "Summary",        desc: "Write a short professional summary that captures your experience and goals." },
  objective:      { label: "Objective",      desc: "State your career objective and what you bring to the table." },
  projects:       { label: "Projects",       desc: "Showcase notable projects you've worked on." },
  languages:      { label: "Languages",      desc: "List the languages you speak and your proficiency level." },
  certifications: { label: "Certifications", desc: "Add any relevant certifications or licenses you hold." },
  awards:         { label: "Awards",         desc: "Highlight any awards or recognitions you've received." },
  references:     { label: "References",     desc: "Provide professional references who can vouch for your work." },
  other:          { label: "Other",          desc: "Any additional information relevant to your application." },
};

function SectionPage({ sectionKey, fields, onSave, undoHistories = {}, onPushUndo, onPopUndo, saving, sessionId, onAddLine, onDeleteLine, onDeleteField, addingAfter, setAddingAfter, onAddLineSubmit, onAddPage, isLastSection, onEditStart, onEditEnd, onAddContent, onLinkSave, onRelinkDone, isDark = false, isReadOnly = false, onNextSection = null, hasPageBreak = false, onMoveToNextPage = null, onAddBlankLine = null }) {
  const isPageSection = sectionKey.startsWith("__page_");
  const pageNum = isPageSection ? sectionKey.replace("__page_", "").replace(/__/g, "") : null;
  const meta = isPageSection
    ? { label: `Page ${pageNum}`, desc: "Content you've added to this page — click any line to edit, or use 'Add Content' to write more." }
    : (SECTION_META[sectionKey.toLowerCase()] || SECTION_META.other);
  const nonHeaderFields = fields.filter(f => !f.isHeader);
  const filledCount = nonHeaderFields.filter(f => f.text && f.text.trim()).length;
  const totalCount  = nonHeaderFields.length;
  const pct = totalCount > 0 ? Math.round(filledCount / totalCount * 100) : 100;

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      <Box sx={{ px: 4, pt: 3.5, pb: 2.5, flexShrink: 0, bgcolor: isDark ? "rgba(6,12,42,.97)" : "transparent" }}>
        <Typography sx={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 900, fontSize: 28, letterSpacing: "-.03em", color: isDark ? "#c8d8ff" : "#0f172a", lineHeight: 1.15, mb: 0.875, transition: "color .3s" }}>
          {meta.label}
        </Typography>
        <Typography sx={{ fontSize: 14, color: isDark ? "rgba(180,205,255,.72)" : "#64748b", lineHeight: 1.6, maxWidth: 560 }}>{meta.desc}</Typography>
        {totalCount > 0 && (
          <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ flex: 1, height: 4, bgcolor: "#e2e8f0", borderRadius: 99, overflow: "hidden", maxWidth: 260 }}>
              <Box sx={{ height: "100%", width: `${pct}%`, bgcolor: pct === 100 ? "#16a34a" : "#2563eb", borderRadius: 99, transition: "width .4s ease" }} />
            </Box>
            <Typography sx={{ fontSize: 11, fontWeight: 600, color: pct === 100 ? "#16a34a" : "#2563eb" }}>
              {pct === 100 ? "✓ Complete" : `${filledCount} / ${totalCount} filled`}
            </Typography>
          </Box>
        )}

      </Box>
      <Divider sx={{ mx: 4, borderColor: isDark ? "rgba(80,110,220,.18)" : "#f1f5f9" }} />
      <Box sx={{ flex: 1, overflowY: "auto", px: 4, py: 2.5, pb: 6, bgcolor: isDark ? "rgba(8,16,55,.92)" : "transparent" }}>
        {/* Empty-page placeholder — only shown for blank page sections */}
        {isPageSection && fields.length === 0 && (
          <Box
            onClick={onAddContent}
            sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 220, gap: 2, bgcolor: "#fdfcff", border: "1.5px dashed #ddd6fe", borderRadius: 3, cursor: "pointer", transition: "all .18s", "&:hover": { bgcolor: "#f5f3ff", borderColor: "#a78bfa", borderStyle: "solid", "& .page-edit-icon": { transform: "scale(1.15)" } } }}
          >
            <Box className="page-edit-icon" sx={{ width: 52, height: 52, bgcolor: "#f5f3ff", borderRadius: 2.5, display: "flex", alignItems: "center", justifyContent: "center", transition: "transform .18s", boxShadow: "0 2px 12px rgba(124,58,237,0.12)" }}>
              <Edit2 size={22} color="#7c3aed" />
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#374151", mb: 0.5 }}>This page is empty</Typography>
              <Typography sx={{ fontSize: 12.5, color: "#9ca3af" }}>Click here to start writing on this page</Typography>
            </Box>
          </Box>
        )}
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1.5 }}>
          {fields.map(f => {
            const isWide = f.isHeader || (f.text && f.text.length > 55) || f.type === "progress-bar" || f.type === "image" || (f.format && ["SUMMARY","OBJECTIVE","BIO","DESCRIPTION","BULLET"].includes(f.format.toUpperCase()));
            return (
              <Box key={f.id} sx={{ gridColumn: isWide ? "1 / -1" : "auto" }}>
                <FieldRow
                  field={f} onSave={onSave} saving={saving} sessionId={sessionId} onLinkSave={onLinkSave} onRelinkDone={onRelinkDone} undoStack={undoHistories[f.id]||[]} onPushUndo={onPushUndo} onPopUndo={onPopUndo} isDark={isDark} isReadOnly={isReadOnly} onNextSection={onNextSection}
                  onAddBlankLine={onAddBlankLine ? () => onAddBlankLine(f) : () => onAddLine(f)}
                  onAddLine={x => setAddingAfter(addingAfter?.id === x.id ? null : x)}
                  onDeleteLine={onDeleteLine} onDeleteField={onDeleteField}
                  onReplaceImage={() => {}} onEditBar={() => {}}
                  isAddingAfter={addingAfter?.id === f.id}
                  onCancelAdd={() => setAddingAfter(null)}
                  onEditStart={onEditStart}
                  onEditEnd={onEditEnd}
                />
                {addingAfter?.id === f.id && (
                  <Box sx={{ mt: 0.5 }}>
                    <AddLineForm field={f} adding={saving}
                      sectionFields={fields}
                      onAdd={(x, d) => { onAddLineSubmit(x, d); setAddingAfter(null); }}
                      onCancel={() => setAddingAfter(null)} />
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   TOOLBAR UTILS
══════════════════════════════════════════════════════════════════════ */
function TBtn({ icon, label, hoverBg, hoverColor, hoverBorder, active, onClick, isNight = false }) {
  const [hov, setHov] = useState(false);
  const on = active || hov;
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      display:"inline-flex", alignItems:"center", gap:5, height:30, padding:"0 11px",
      borderRadius:7, border:`1px solid ${on ? hoverBorder : (isNight ? "rgba(100,130,255,.18)" : "#e5e7eb")}`,
      background: on ? (isNight ? "rgba(10,18,55,.95)" : "#fff") : (isNight ? "rgba(255,255,255,0.04)" : "transparent"),
      color: on ? hoverColor : (isNight ? "rgba(190,210,255,.82)" : "#374151"),
      cursor:"pointer", fontSize:11.5, fontWeight:600, fontFamily:"'Inter',sans-serif",
      transition:"all .18s", whiteSpace:"nowrap", flexShrink:0,
      boxShadow: on && isNight ? `0 0 14px ${hoverBg}44` : (on && !isNight ? "0 2px 8px rgba(0,0,0,.06)" : "none"),
    }}>
      <span style={{ display:"inline-flex", alignItems:"center", opacity: isNight && !on ? 0.8 : 1 }}>{icon}</span>
      {label}
    </button>
  );
}


function DownloadDropdown({ onDocx, onPdf }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  return (
    <>
      <Button variant="contained" endIcon={<ChevronDown size={12} style={{ transition: "transform .2s", transform: open ? "rotate(180deg)" : "none" }} />}
        startIcon={<Ico.Dl />} onClick={e => setAnchorEl(e.currentTarget)}
        sx={{ gap: 0.75, height: 32, px: 1.5, fontSize: 11.5, borderRadius: "7px", boxShadow: "0 2px 8px rgba(37,99,235,0.25)" }}>
        Download
      </Button>
      <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}
        PaperProps={{ sx: { mt: 0.75, borderRadius: 2, boxShadow: "0 8px 30px rgba(0,0,0,.12)", border: "1px solid #e5e7eb", minWidth: 180 } }}>
        <Box component="li" onClick={() => { onDocx(); setAnchorEl(null); }}
          sx={{ display: "flex", alignItems: "center", gap: 1.25, px: 1.75, py: 1.25, cursor: "pointer", "&:hover": { bgcolor: "#f9fafb" }, borderBottom: "1px solid #e5e7eb" }}>
          <Box sx={{ width: 30, height: 30, borderRadius: 1.75, bgcolor: "rgba(37,99,235,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#3b82f6", fontSize: 13, fontWeight: 800 }}>W</Box>
          <Box><Typography sx={{ fontSize: 12, fontWeight: 600, color: "text.primary" }}>Word Document</Typography><Typography sx={{ fontSize: 10, color: "text.disabled" }}>.docx</Typography></Box>
        </Box>
        <Box component="li" onClick={() => { onPdf(); setAnchorEl(null); }}
          sx={{ display: "flex", alignItems: "center", gap: 1.25, px: 1.75, py: 1.25, cursor: "pointer", "&:hover": { bgcolor: "#f9fafb" } }}>
          <Box sx={{ width: 30, height: 30, borderRadius: 1.75, bgcolor: "rgba(220,38,38,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444", fontSize: 13, fontWeight: 800 }}>P</Box>
          <Box><Typography sx={{ fontSize: 12, fontWeight: 600, color: "text.primary" }}>PDF File</Typography><Typography sx={{ fontSize: 10, color: "text.disabled" }}>.pdf</Typography></Box>
        </Box>
      </Menu>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   JD MANAGER PANEL
══════════════════════════════════════════════════════════════════════ */
function JDManagerPanel({ onClose, showToast }) {
  const [tab, setTab] = useState("add");
  const [role, setRole] = useState(""); const [level, setLevel] = useState("fresher"); const [company, setCompany] = useState(""); const [jdText, setJdText] = useState("");
  const [loading, setLoading] = useState(false); const [roles, setRoles] = useState([]); const [jds, setJds] = useState([]);
  const [loadingJDs, setLoadingJDs] = useState(false); const [selectedRole, setSelectedRole] = useState(""); const [selectedLevel, setSelectedLevel] = useState("fresher"); const [deletingId, setDeletingId] = useState(null);
  useEffect(() => { fetchRoles(); }, []);
  const fetchRoles = async () => { try { const r = await fetch(`${API_BASE}/ai/jd/roles`); const d = await r.json(); setRoles(d.roles || []); } catch {} };
  const fetchJDs = async (r, l) => {
    if (!r) return; setLoadingJDs(true);
    try { const res = await fetch(`${API_BASE}/ai/jd/list?role=${encodeURIComponent(r)}&level=${l}`); const d = await res.json(); setJds(d.jds || []); }
    catch { showToast("Failed to load JDs", "error"); } setLoadingJDs(false);
  };
  const addJD = async () => {
    if (!role.trim() || jdText.trim().length < 50) { showToast("Role and JD text (min 50 chars) required", "error"); return; }
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/ai/jd/add`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role: role.trim(), level, jd_text: jdText.trim(), company: company.trim() }) });
      const d = await r.json();
      if (d.success) { showToast(`JD added — ${d.skills_extracted} skills extracted ✓`, "success"); setJdText(""); setCompany(""); fetchRoles(); }
      else showToast(d.detail || d.error || "Failed", "error");
    } catch { showToast("Error adding JD", "error"); }
    setLoading(false);
  };
  const deleteJD = async (id) => {
    setDeletingId(id);
    try { const r = await fetch(`${API_BASE}/ai/jd/${id}`, { method: "DELETE" }); if (r.ok) { showToast("Deleted", "success"); fetchJDs(selectedRole, selectedLevel); fetchRoles(); } else showToast("Failed", "error"); }
    catch { showToast("Error", "error"); }
    setDeletingId(null);
  };
  const inputSx = { mb: 1.5, "& .MuiOutlinedInput-root": { bgcolor: "#f5f6fa", fontSize: 12, borderRadius: 1.5 } };
  return (
    <>
      <div className="panel-overlay" onClick={onClose} />
      <div className="side-panel">
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: "16px 20px", borderBottom: "1px solid #e5e7eb", flexShrink: 0 }}>
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Box sx={{ width: 32, height: 32, borderRadius: 2, background: "linear-gradient(135deg,#0891b2,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}><Ico.JD /></Box>
            <Box><Typography sx={{ fontSize: 14, fontWeight: 700 }}>JD Manager</Typography><Typography sx={{ fontSize: 10, color: "text.disabled" }}>Manage Job Descriptions</Typography></Box>
          </Stack>
          <RippleBtn variant="ghost" onClick={onClose} style={{ padding: "4px 8px" }}><Ico.X /></RippleBtn>
        </Stack>
        <Box sx={{ display: "flex", borderBottom: "1px solid #e5e7eb", flexShrink: 0 }}>
          {[["add", "Add JD"], ["list", "Stored JDs"]].map(([k, l]) => (
            <button key={k} onClick={() => { setTab(k); if (k === "list" && selectedRole) fetchJDs(selectedRole, selectedLevel); }}
              style={{ flex: 1, padding: "10px", border: "none", background: "transparent", cursor: "pointer", fontSize: 12, fontWeight: tab === k ? 700 : 500, color: tab === k ? "#2563eb" : "#9ca3af", borderBottom: `2px solid ${tab === k ? "#2563eb" : "transparent"}`, fontFamily: "inherit", transition: "all .2s" }}>{l}</button>
          ))}
        </Box>
        <Box sx={{ flex: 1, overflowY: "auto", p: "16px 20px" }}>
          {tab === "add" && (
            <Stack spacing={1.5}>
              <Box sx={{ p: "10px 14px", bgcolor: "rgba(8,145,178,0.08)", border: "1px solid rgba(8,145,178,0.3)", borderRadius: 2, fontSize: 11, color: "#06b6d4", lineHeight: 1.6 }}>Paste a job description — GPT extracts skills automatically.</Box>
              <Stack direction="row" spacing={1}>
                <TextField label="Role *" size="small" value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Data Scientist" sx={{ flex: 1, ...inputSx }} />
                <TextField select label="Level" size="small" value={level} onChange={e => setLevel(e.target.value)} sx={{ width: 110, ...inputSx }}>
                  <MenuItem value="fresher">Fresher</MenuItem><MenuItem value="experienced">Experienced</MenuItem>
                </TextField>
              </Stack>
              <TextField label="Company (optional)" size="small" value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Google" sx={inputSx} />
              <TextField label="Job Description *" multiline rows={10} value={jdText} onChange={e => setJdText(e.target.value)}
                placeholder="Paste the full job description here…"
                helperText={<span style={{ color: jdText.length < 50 ? "#ef4444" : "#9ca3af" }}>{jdText.length} chars</span>}
                sx={{ ...inputSx, "& textarea": { fontSize: 11.5 } }} />
              <RippleBtn variant="teal" onClick={addJD} disabled={loading} style={{ justifyContent: "center", padding: "10px" }}>
                {loading ? <><SpinnerEl size={12} color="#fff" /> Extracting with GPT…</> : <><Ico.Plus /> Add JD</>}
              </RippleBtn>
            </Stack>
          )}
          {tab === "list" && (
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1}>
                <TextField select label="Role" size="small" value={selectedRole} onChange={e => { setSelectedRole(e.target.value); if (e.target.value) fetchJDs(e.target.value, selectedLevel); else setJds([]); }}
                  sx={{ flex: 1, ...inputSx }} SelectProps={{ displayEmpty: true }}>
                  <MenuItem value=""><em>Select a role…</em></MenuItem>
                  {roles.map(r => <MenuItem key={`${r.role}-${r.level}`} value={r.role}>{r.role} ({r.level}) — {r.jd_count} JDs</MenuItem>)}
                </TextField>
                <TextField select label="Level" size="small" value={selectedLevel} onChange={e => { setSelectedLevel(e.target.value); if (selectedRole) fetchJDs(selectedRole, e.target.value); }} sx={{ width: 100, ...inputSx }}>
                  <MenuItem value="fresher">Fresher</MenuItem><MenuItem value="experienced">Experienced</MenuItem>
                </TextField>
              </Stack>
              {!selectedRole && <Typography sx={{ textAlign: "center", p: "40px 20px", color: "text.disabled", fontSize: 12 }}>Select a role to view stored JDs</Typography>}
              {selectedRole && loadingJDs && <Stack alignItems="center" sx={{ py: 4, gap: 1 }}><SpinnerEl size={20} color="#2563eb" /><Typography sx={{ fontSize: 12, color: "text.disabled" }}>Loading…</Typography></Stack>}
              {selectedRole && !loadingJDs && jds.length === 0 && <Typography sx={{ textAlign: "center", p: "40px 20px", color: "text.disabled", fontSize: 12 }}>No JDs found.</Typography>}
              {jds.map((jd, i) => (
                <Paper key={jd.id} elevation={0} sx={{ bgcolor: "#f9fafb", borderRadius: 2, border: "1px solid #e5e7eb", p: "12px 14px" }}>
                  <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 0.75 }}>
                    <Box><Typography component="span" sx={{ fontSize: 12, fontWeight: 700 }}>{jd.company || `JD #${i + 1}`}</Typography><PillEl style={{ marginLeft: 8, fontSize: 9 }}>{jd.skill_count} skills</PillEl></Box>
                    <RippleBtn onClick={() => deleteJD(jd.id)} disabled={deletingId === jd.id} style={{ padding: "3px 7px", background: "rgba(220,38,38,0.08)", color: "#ef4444", border: "1px solid rgba(220,38,38,0.3)", fontSize: 10 }}>
                      {deletingId === jd.id ? <SpinnerEl size={9} color="#ef4444" /> : <Ico.Trash />}
                    </RippleBtn>
                  </Stack>
                  <Typography sx={{ fontSize: 10.5, color: "text.disabled", mb: 1, lineHeight: 1.5 }}>{jd.jd_preview}</Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {jd.skills.slice(0, 12).map(s => <span key={s} style={{ fontSize: 9.5, padding: "2px 7px", borderRadius: 4, background: "rgba(8,145,178,0.08)", color: "#06b6d4", border: "1px solid rgba(8,145,178,0.25)" }}>{s}</span>)}
                    {jd.skills.length > 12 && <Typography component="span" sx={{ fontSize: 9.5, color: "text.disabled" }}>+{jd.skills.length - 12} more</Typography>}
                  </Box>
                  <Typography sx={{ fontSize: 9.5, color: "text.disabled", mt: 0.75 }}>Added: {jd.created_at?.slice(0, 16) || "—"}</Typography>
                </Paper>
              ))}
            </Stack>
          )}
        </Box>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   AI CHAT PANEL  — context-aware resume assistant
══════════════════════════════════════════════════════════════════════ */
const SUGGESTED_PROMPTS = [
  { icon: "⚡", text: "Make this more impactful" },
  { icon: "📝", text: "Write bullet points for this role" },
  { icon: "🎯", text: "Improve my experience section" },
  { icon: "📊", text: "Add metrics and numbers" },
  { icon: "💼", text: "Make this more professional" },
  { icon: "✂️", text: "Make this more concise" },
  { icon: "🔍", text: "Tailor this to the job description" },
  { icon: "🚀", text: "Start with stronger action verbs" },
];

function AIChatPanel({ onClose, sessionId, fields, activeSection, editingField, showToast, isDark }) {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi! I'm your AI resume coach. I can help you improve any section, write bullet points, tailor your resume to a JD, and more.\n\nWhat would you like to work on?", ts: Date.now() }
  ]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef         = useRef(null);
  const inputRef               = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 120); }, []);

  const buildContext = () => {
    const sectionFields = fields.filter(f => (f.section?.key || "other") === activeSection && f.text?.trim());
    const sectionText   = sectionFields.slice(0, 8).map(f => f.text).join("\n");
    const sectionLabel  = activeSection?.startsWith("__page_") ? "Custom Page" : (activeSection || "resume");
    return { sectionText, currentField: editingField?.text || "", sectionLabel };
  };

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;
    const userMsg = { role: "user", text: text.trim(), ts: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput(""); setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/ai-chat`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.text })),
          context: buildContext(),
        }),
      });
      const d = await r.json();
      if (d.reply) setMessages(prev => [...prev, { role: "assistant", text: d.reply, suggestion: d.suggestion || null, ts: Date.now() }]);
      else throw new Error(d.error || "No reply");
    } catch {
      setMessages(prev => [...prev, { role: "assistant", text: "Sorry, something went wrong. Please try again.", ts: Date.now() }]);
    }
    setLoading(false);
  };

  const copyText = async (t) => { await navigator.clipboard.writeText(t); showToast("Copied ✓", "success"); };

  const bg = isDark ? "#0a1237" : "#fff";
  const hdrBg = isDark ? "rgba(8,14,50,.98)" : "#fff";
  const border = isDark ? "rgba(80,110,255,.18)" : "#e2e8f0";
  const txtCol = isDark ? "#e0eaff" : "#111827";
  const mutedCol = isDark ? "rgba(160,185,255,.55)" : "#6b7280";
  const aiBg = isDark ? "rgba(255,255,255,.06)" : "#f8fafc";
  const aiBdr = isDark ? "rgba(80,110,255,.2)" : "#e2e8f0";
  const userGrad = "linear-gradient(135deg,#3d6bff,#6a92ff)";

  return (
    <>
      <div className="panel-overlay" onClick={onClose} style={{ zIndex: 210 }} />
      <div style={{ position:"fixed", top:0, right:0, height:"100vh", width:420, maxWidth:"95vw",
        background:bg, borderLeft:`1px solid ${border}`, zIndex:211,
        display:"flex", flexDirection:"column",
        animation:"panelSlide .28s cubic-bezier(.34,1.4,.64,1)",
        boxShadow:"-8px 0 40px rgba(0,0,0,.18)", fontFamily:"'Inter',sans-serif" }}>

        {/* Header */}
        <Box sx={{ p:"14px 18px", borderBottom:`1px solid ${border}`, flexShrink:0, bgcolor:hdrBg, display:"flex", alignItems:"center", gap:1.5 }}>
          <Box sx={{ width:36, height:36, borderRadius:2.5, background:"linear-gradient(135deg,#7c3aed,#a855f7)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 3px 14px rgba(124,58,237,.4)", flexShrink:0 }}>
            <Sparkles size={16} color="#fff" />
          </Box>
          <Box sx={{ flex:1 }}>
            <Typography sx={{ fontSize:14, fontWeight:800, color:txtCol, fontFamily:"'Plus Jakarta Sans',sans-serif", letterSpacing:"-.02em" }}>AI Resume Coach</Typography>
            <Box sx={{ display:"flex", alignItems:"center", gap:0.75 }}>
              <Box sx={{ width:6, height:6, borderRadius:"50%", bgcolor:"#22c55e", boxShadow:"0 0 6px #22c55e" }} />
              <Typography sx={{ fontSize:10.5, color:mutedCol }}>Knows your resume · Context-aware</Typography>
            </Box>
          </Box>
          <RippleBtn variant="ghost" onClick={onClose} style={{ padding:"4px 8px", border:"none", background:"transparent" }}><Ico.X /></RippleBtn>
        </Box>

        {/* Editing field strip */}
        {editingField && (
          <Box sx={{ px:2, py:0.875, bgcolor:isDark?"rgba(124,58,237,.1)":"#f5f3ff", borderBottom:`1px solid ${isDark?"rgba(124,58,237,.2)":"#ede9fe"}`, display:"flex", alignItems:"center", gap:1, flexShrink:0 }}>
            <Box sx={{ width:5, height:5, borderRadius:"50%", bgcolor:"#a78bfa", flexShrink:0, animation:"pulse 1.4s infinite" }} />
            <Typography sx={{ fontSize:10.5, color:isDark?"#c4b5fd":"#7c3aed", fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1 }}>
              Editing: "{editingField.text?.slice(0,55)}{editingField.text?.length > 55 ? "…" : ""}"
            </Typography>
          </Box>
        )}

        {/* Messages */}
        <Box sx={{ flex:1, overflowY:"auto", p:"14px 16px", display:"flex", flexDirection:"column", gap:1.5,
          "&::-webkit-scrollbar":{ width:4 },
          "&::-webkit-scrollbar-thumb":{ background:isDark?"rgba(80,110,220,.35)":"#e2e8f0", borderRadius:99 } }}>
          {messages.map((msg, i) => (
            <Box key={i} sx={{ display:"flex", flexDirection:"column", alignItems:msg.role==="user"?"flex-end":"flex-start" }}>
              {msg.role === "user" ? (
                <Box sx={{ maxWidth:"82%", px:2, py:1.25, borderRadius:"16px 16px 4px 16px",
                  background:userGrad, color:"#fff", fontSize:13, lineHeight:1.6, wordBreak:"break-word" }}>
                  {msg.text}
                </Box>
              ) : (
                <Box sx={{ maxWidth:"94%", display:"flex", flexDirection:"column", gap:0.75 }}>
                  <Box sx={{ display:"flex", alignItems:"flex-start", gap:1 }}>
                    <Box sx={{ width:24, height:24, borderRadius:"50%", flexShrink:0, mt:0.25, background:"linear-gradient(135deg,#7c3aed,#a855f7)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <Sparkles size={11} color="#fff" />
                    </Box>
                    <Box sx={{ flex:1, px:1.75, py:1.25, borderRadius:"4px 16px 16px 16px",
                      bgcolor:aiBg, border:`1px solid ${aiBdr}`,
                      fontSize:13, color:txtCol, lineHeight:1.7, wordBreak:"break-word", whiteSpace:"pre-wrap" }}>
                      {msg.text}
                    </Box>
                  </Box>
                  {msg.suggestion && (
                    <Box sx={{ ml:4, p:"10px 14px", borderRadius:2, bgcolor:isDark?"rgba(124,58,237,.1)":"#f5f3ff", border:`1.5px solid ${isDark?"rgba(167,139,250,.3)":"#ddd6fe"}` }}>
                      <Typography sx={{ fontSize:9.5, fontWeight:700, color:"#a78bfa", textTransform:"uppercase", letterSpacing:".06em", mb:0.75 }}>✦ Suggested Text</Typography>
                      <Typography sx={{ fontSize:12.5, color:txtCol, lineHeight:1.65, whiteSpace:"pre-wrap", mb:1 }}>{msg.suggestion}</Typography>
                      <Box component="button" onClick={() => copyText(msg.suggestion)}
                        sx={{ display:"inline-flex", alignItems:"center", gap:0.5, px:1.25, py:0.5, borderRadius:1.5,
                          border:`1px solid ${isDark?"rgba(167,139,250,.35)":"#ddd6fe"}`, bgcolor:"transparent",
                          color:isDark?"#c4b5fd":"#7c3aed", fontSize:10.5, fontWeight:600, cursor:"pointer", fontFamily:"'Inter',sans-serif",
                          "&:hover":{ bgcolor:isDark?"rgba(124,58,237,.15)":"#ede9fe" } }}>
                        Copy
                      </Box>
                    </Box>
                  )}
                  {!msg.suggestion && i > 0 && (
                    <Box component="button" onClick={() => copyText(msg.text)}
                      sx={{ ml:4, border:"none", bgcolor:"transparent", color:mutedCol, fontSize:10,
                        cursor:"pointer", fontFamily:"'Inter',sans-serif", display:"flex", alignItems:"center", gap:0.5, p:0,
                        "&:hover":{ color:isDark?"#c4b5fd":"#7c3aed" } }}>
                      Copy reply
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          ))}
          {loading && (
            <Box sx={{ display:"flex", alignItems:"center", gap:1 }}>
              <Box sx={{ width:24, height:24, borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#a855f7)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><Sparkles size={11} color="#fff" /></Box>
              <Box sx={{ px:1.75, py:1.125, borderRadius:"4px 16px 16px 16px", bgcolor:aiBg, border:`1px solid ${aiBdr}`, display:"flex", alignItems:"center", gap:0.625 }}>
                {[0,1,2].map(j => <Box key={j} sx={{ width:5, height:5, borderRadius:"50%", bgcolor:"#a78bfa", animation:`pulse 1.2s ${j*0.2}s infinite` }} />)}
              </Box>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

        {/* Quick prompts */}
        {messages.length <= 1 && (
          <Box sx={{ px:2, pb:1, flexShrink:0 }}>
            <Typography sx={{ fontSize:10, fontWeight:700, color:mutedCol, textTransform:"uppercase", letterSpacing:".06em", mb:1 }}>Quick prompts</Typography>
            <Box sx={{ display:"flex", flexWrap:"wrap", gap:0.75 }}>
              {SUGGESTED_PROMPTS.map((p, i) => (
                <Box key={i} component="button" onClick={() => sendMessage(p.text)}
                  sx={{ display:"flex", alignItems:"center", gap:0.625, px:1.25, py:0.625, borderRadius:99,
                    border:`1px solid ${isDark?"rgba(124,58,237,.3)":"#ddd6fe"}`,
                    bgcolor:isDark?"rgba(124,58,237,.08)":"#f5f3ff",
                    color:isDark?"#c4b5fd":"#7c3aed", fontSize:11.5, fontWeight:600,
                    cursor:"pointer", fontFamily:"'Inter',sans-serif", transition:"all .12s",
                    "&:hover":{ bgcolor:isDark?"rgba(124,58,237,.18)":"#ede9fe" } }}>
                  {p.icon} {p.text}
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Input */}
        <Box sx={{ p:"12px 14px", borderTop:`1px solid ${border}`, bgcolor:hdrBg, flexShrink:0 }}>
          <Box sx={{ display:"flex", gap:1, alignItems:"flex-end",
            bgcolor:isDark?"rgba(255,255,255,.05)":"#f8fafc",
            border:`1.5px solid ${isDark?"rgba(124,58,237,.3)":"#ddd6fe"}`,
            borderRadius:2.5, px:1.5, py:0.875,
            "&:focus-within":{ borderColor:"#7c3aed", boxShadow:"0 0 0 3px rgba(124,58,237,.12)" } }}>
            <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
              placeholder="Ask anything about your resume… (Enter to send)"
              rows={1}
              style={{ flex:1, resize:"none", border:"none", background:"transparent",
                fontFamily:"'Inter',sans-serif", fontSize:13, lineHeight:1.6,
                color:isDark?"#e0eaff":"#111827", outline:"none", maxHeight:120, overflowY:"auto" }} />
            <Box component="button" onClick={() => sendMessage(input)} disabled={!input.trim() || loading}
              sx={{ width:32, height:32, borderRadius:1.75, border:"none", flexShrink:0,
                background:(!input.trim()||loading)?(isDark?"rgba(255,255,255,.06)":"#e5e7eb"):"linear-gradient(135deg,#7c3aed,#a855f7)",
                color:(!input.trim()||loading)?mutedCol:"#fff",
                cursor:(!input.trim()||loading)?"not-allowed":"pointer",
                display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow:(!input.trim()||loading)?"none":"0 2px 10px rgba(124,58,237,.4)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </Box>
          </Box>
          <Typography sx={{ fontSize:10, color:mutedCol, mt:0.75, textAlign:"center" }}>Context-aware · Enter to send · Shift+Enter for newline</Typography>
        </Box>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   MATCH PANEL
══════════════════════════════════════════════════════════════════════ */
function MatchPanel({ sessionId, onClose, showToast, onGoToSection, onAddSkill }) {
  const [role, setRole] = useState(""); const [level, setLevel] = useState("fresher"); const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false); const [result, setResult] = useState(null);
  const [dlLoading, setDlLoading] = useState(false); const [expandedJD, setExpandedJD] = useState(null);
  const [addingSkill, setAddingSkill] = useState(null);
  const sparkle = useSparkle();
  useEffect(() => { fetchRoles(); }, []);
  const fetchRoles = async () => { try { const r = await fetch(`${API_BASE}/ai/jd/roles`); const d = await r.json(); setRoles(d.roles || []); } catch {} };
  const runMatch = async () => {
    if (!role.trim()) { showToast("Select a role first","error"); return; }
    setLoading(true); setResult(null);
    try {
      const r = await fetch(`${API_BASE}/ai/compare`,{ method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({session_id:sessionId,role:role.trim(),level,force_refresh:true}) });
      const d = await r.json();
      if (!r.ok||d.detail) showToast(d.detail||`Error ${r.status}`,"error"); else setResult(d);
    } catch(e){ showToast(`Failed: ${e.message}`,"error"); }
    setLoading(false);
  };
  const downloadReport = async (e) => {
    if (!result) return; setDlLoading(true);
    try {
      const r = await fetch(`${API_BASE}/ai/compare-report`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({session_id:sessionId,role:role.trim(),level})});
      if (!r.ok){showToast("PDF generation failed","error");setDlLoading(false);return;}
      const blob=await r.blob();const url=URL.createObjectURL(blob);const a=document.createElement("a");
      a.href=url;a.download=`resume_vs_${role.replace(/\s+/g,"_")}_report.pdf`;a.click();URL.revokeObjectURL(url);
      showToast("Report downloaded ✓","success");sparkle(e.clientX,e.clientY,"#22c55e");
    } catch{showToast("Download failed","error");}
    setDlLoading(false);
  };
  const handleFixSkill = async (skillName) => {
    if (!onAddSkill) return; setAddingSkill(skillName);
    try { await onAddSkill(skillName); showToast(`"${skillName}" added ✓`,"success"); }
    catch(e){ showToast(`Failed: ${e.message}`,"error"); }
    setAddingSkill(null);
  };
  const score = Number(result?.overall_score)||0;
  const iSx = {mb:1,"& .MuiOutlinedInput-root":{bgcolor:"#f5f6fa",fontSize:12,borderRadius:1.5}};
  return (
    <>
      <div className="panel-overlay" onClick={onClose}/>
      <div className="side-panel">
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{p:"16px 20px",borderBottom:"1px solid #e5e7eb",flexShrink:0}}>
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Box sx={{width:32,height:32,borderRadius:2,background:"linear-gradient(135deg,#2563eb,#3b82f6)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff"}}><Ico.Match/></Box>
            <Box><Typography sx={{fontSize:14,fontWeight:700}}>Resume Match</Typography><Typography sx={{fontSize:10,color:"text.disabled"}}>ATS Score vs Real JDs</Typography></Box>
          </Stack>
          <RippleBtn variant="ghost" onClick={onClose} style={{padding:"4px 8px"}}><Ico.X/></RippleBtn>
        </Stack>
        <Box sx={{flex:1,overflowY:"auto",p:"16px 20px"}}>
          <Stack direction="row" spacing={1} sx={{mb:1.5}}>
            <TextField select label="Role" size="small" value={role} onChange={e=>setRole(e.target.value)} sx={{flex:1,...iSx}} SelectProps={{displayEmpty:true}}>
              <MenuItem value=""><em>Select role…</em></MenuItem>
              {roles.map(r=><MenuItem key={`${r.role}-${r.level}`} value={r.role}>{r.role} — {r.jd_count} JDs</MenuItem>)}
            </TextField>
            <TextField select label="Level" size="small" value={level} onChange={e=>setLevel(e.target.value)} sx={{width:100,...iSx}}>
              <MenuItem value="fresher">Fresher</MenuItem><MenuItem value="experienced">Experienced</MenuItem>
            </TextField>
          </Stack>
          {roles.length===0 && <Box sx={{p:"10px 14px",bgcolor:"rgba(220,38,38,0.08)",border:"1px solid rgba(220,38,38,0.3)",borderRadius:2,fontSize:11,color:"#ef4444",mb:1.5}}>No JDs stored yet — add some via <strong>JD Manager</strong>.</Box>}
          {result?.error && <Box sx={{p:"10px 14px",bgcolor:"rgba(220,38,38,0.08)",border:"1px solid rgba(220,38,38,0.3)",borderRadius:2,fontSize:11,color:"#ef4444",mb:1.5}}>{result.error}</Box>}
          <RippleBtn variant="accent" onClick={runMatch} disabled={loading||!role} style={{width:"100%",justifyContent:"center",padding:"10px",marginBottom:16}}>
            {loading?<><SpinnerEl size={12} color="#fff"/> Analyzing…</>:<><Ico.Match/> Run Match</>}
          </RippleBtn>
          {result && !result.error && (
            <Stack spacing={1.75}>
              <Paper elevation={0} sx={{bgcolor:"#f9fafb",borderRadius:2,border:"1px solid #e5e7eb",p:"16px"}}>
                <Box sx={{display:"flex",gap:2,alignItems:"center"}}>
                  <ScoreRing score={Math.round(score)} size={80}/>
                  <Box sx={{flex:1}}>
                    <Typography sx={{fontSize:11,color:"text.disabled",mb:0.4}}>Average Match Score</Typography>
                    <Typography sx={{fontSize:22,fontWeight:800,color:"#16a34a",mb:0.4}}>{score}%</Typography>
                    <Stack direction="row" spacing={0.75} flexWrap="wrap">
                      <PillEl bg="rgba(22,163,74,0.08)" color="#22c55e" border="rgba(22,163,74,0.3)">Best: {result.max_score}%</PillEl>
                      <PillEl bg="rgba(220,38,38,0.08)" color="#ef4444" border="rgba(220,38,38,0.3)">Worst: {result.min_score}%</PillEl>
                      <PillEl>{result.total_jds} JDs</PillEl>
                    </Stack>
                  </Box>
                </Box>
              </Paper>
              {result.common_matched?.length>0 && (
                <Paper elevation={0} sx={{bgcolor:"#f9fafb",borderRadius:2,border:"1px solid #e5e7eb",p:"12px 14px"}}>
                  <Typography sx={{fontSize:10,fontWeight:700,color:"#16a34a",textTransform:"uppercase",letterSpacing:".06em",mb:1}}>✓ Skills You Have</Typography>
                  <Box sx={{display:"flex",flexWrap:"wrap",gap:0.5}}>
                    {result.common_matched.slice(0,15).map(s=>(
                      <span key={s.skill} style={{fontSize:10,padding:"3px 8px",borderRadius:4,background:"rgba(22,163,74,0.08)",color:"#16a34a",border:"1px solid rgba(22,163,74,0.25)"}}>
                        {s.skill} <span style={{opacity:.7}}>({s.pct}%)</span>
                      </span>
                    ))}
                  </Box>
                </Paper>
              )}
              {result.common_missing?.length>0 && (
                <Paper elevation={0} sx={{bgcolor:"#f9fafb",borderRadius:2,border:"1px solid #e5e7eb",p:"12px 14px"}}>
                  <Box sx={{display:"flex",alignItems:"center",justifyContent:"space-between",mb:1}}>
                    <Typography sx={{fontSize:10,fontWeight:700,color:"#ef4444",textTransform:"uppercase",letterSpacing:".06em"}}>✗ Skills to Add</Typography>
                    {onGoToSection && <button onClick={()=>onGoToSection("skills")} style={{fontSize:9.5,fontWeight:700,padding:"3px 9px",borderRadius:99,border:"1.5px solid #2563eb",background:"rgba(37,99,235,0.07)",color:"#2563eb",cursor:"pointer",fontFamily:"'Inter',sans-serif"}}>➕ Go to Skills</button>}
                  </Box>
                  <Stack spacing={0.6}>
                    {result.common_missing.slice(0,12).map(s=>(
                      <Box key={s.skill} sx={{display:"flex",alignItems:"center",justifyContent:"space-between",p:"5px 8px",bgcolor:"rgba(220,38,38,0.04)",border:"1px solid rgba(220,38,38,0.15)",borderRadius:1}}>
                        <Typography sx={{fontSize:10.5,color:"#ef4444",fontWeight:600}}>{s.skill} <span style={{opacity:.65,fontWeight:400}}>({s.pct}%)</span></Typography>
                        {onAddSkill && <button onClick={()=>handleFixSkill(s.skill)} disabled={addingSkill===s.skill} style={{fontSize:9,fontWeight:700,padding:"3px 9px",borderRadius:99,border:"1px solid rgba(22,163,74,0.4)",background:"rgba(22,163,74,0.08)",color:"#16a34a",cursor:addingSkill===s.skill?"not-allowed":"pointer",fontFamily:"'Inter',sans-serif",opacity:addingSkill===s.skill?0.6:1}}>{addingSkill===s.skill?"Adding…":"+ Fix This"}</button>}
                      </Box>
                    ))}
                  </Stack>
                </Paper>
              )}
              {result.jd_results?.length>0 && (
                <Paper elevation={0} sx={{bgcolor:"#f9fafb",borderRadius:2,border:"1px solid #e5e7eb",p:"12px 14px"}}>
                  <Typography sx={{fontSize:10,fontWeight:700,color:"text.disabled",textTransform:"uppercase",letterSpacing:".06em",mb:1.25}}>Per-JD Breakdown</Typography>
                  <Stack spacing={0.75}>
                    {result.jd_results.map((jd,i)=>{
                      const jc=jd.score>=70?"#16a34a":jd.score>=50?"#d97706":"#dc2626";
                      const isOpen=expandedJD===i;
                      return(
                        <Box key={i} sx={{borderRadius:1,border:"1px solid #e5e7eb",overflow:"hidden"}}>
                          <Box onClick={()=>setExpandedJD(isOpen?null:i)} sx={{p:"8px 12px",cursor:"pointer",display:"flex",alignItems:"center",gap:1,bgcolor:isOpen?"#f5f6fa":"transparent"}}>
                            <Box sx={{width:36,height:36,borderRadius:1,bgcolor:`${jc}20`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                              <Typography sx={{fontSize:13,fontWeight:800,color:jc}}>{jd.score}</Typography>
                            </Box>
                            <Box sx={{flex:1,minWidth:0}}>
                              <Typography sx={{fontSize:11.5,fontWeight:600}}>{jd.company||`JD #${i+1}`}</Typography>
                              <Typography sx={{fontSize:10,color:"text.disabled",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{jd.verdict}</Typography>
                            </Box>
                            <Typography component="span" sx={{color:"text.disabled",fontSize:10}}>{isOpen?"▲":"▼"}</Typography>
                          </Box>
                          {isOpen&&(
                            <Box sx={{p:"10px 12px",borderTop:"1px solid #e5e7eb"}}>
                              {jd.strengths&&<Typography sx={{fontSize:10.5,color:"#16a34a",mb:0.75}}>✓ {jd.strengths}</Typography>}
                              {jd.gaps&&<Typography sx={{fontSize:10.5,color:"#ef4444",mb:0.75}}>✗ {jd.gaps}</Typography>}
                              {jd.matched_skills?.length>0&&<Typography sx={{fontSize:10,color:"text.disabled",mb:0.5}}>Matched: <span style={{color:"#16a34a"}}>{jd.matched_skills.join(", ")}</span></Typography>}
                              {jd.missing_skills?.length>0&&<Typography sx={{fontSize:10,color:"text.disabled"}}>Missing: <span style={{color:"#ef4444"}}>{jd.missing_skills.slice(0,6).join(", ")}</span></Typography>}
                            </Box>
                          )}
                        </Box>
                      );
                    })}
                  </Stack>
                </Paper>
              )}
              <RippleBtn variant="green" onClick={downloadReport} disabled={dlLoading} style={{width:"100%",justifyContent:"center",padding:"10px"}}>
                {dlLoading?<><SpinnerEl size={12} color="#fff"/> Generating…</>:<><Ico.Dl/> Download PDF Report</>}
              </RippleBtn>
            </Stack>
          )}
        </Box>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   PDF VIEWER  — with text-search highlight overlay + page tracking
══════════════════════════════════════════════════════════════════════ */

async function findTextBoxes(page, viewport, needle) {
  if (!needle?.trim()) return [];
  try {
    const tc = await page.getTextContent();
    const items = tc.items.filter(i => i.str);
    if (!items.length) return [];

    const SEP = "\x00";
    let full = "";
    const itemFullStart = [];
    items.forEach((item, idx) => {
      itemFullStart.push(full.length);
      full += item.str;
      if (idx < items.length - 1) full += SEP;
    });

    const fullCharToItem = new Int32Array(full.length).fill(-1);
    items.forEach((item, idx) => {
      const s = itemFullStart[idx];
      for (let c = 0; c < item.str.length; c++) fullCharToItem[s + c] = idx;
    });

    let fullClean = "";
    const cleanToFull = [];
    for (let fi = 0; fi < full.length; fi++) {
      if (full[fi] !== SEP) { cleanToFull.push(fi); fullClean += full[fi]; }
    }

    const fullToClean = new Int32Array(full.length).fill(-1);
    cleanToFull.forEach((fi, ci) => { fullToClean[fi] = ci; });

    const itemCleanStart = new Int32Array(items.length).fill(-1);
    items.forEach((item, idx) => {
      const fi = itemFullStart[idx];
      if (fi < full.length) itemCleanStart[idx] = fullToClean[fi];
    });

    const needleTrim = needle.trim();
    let cleanPos = fullClean.indexOf(needleTrim);
    if (cleanPos === -1) cleanPos = fullClean.toLowerCase().indexOf(needleTrim.toLowerCase());
    if (cleanPos === -1 && needleTrim.length > 25) {
      cleanPos = fullClean.toLowerCase().indexOf(needleTrim.slice(0, 50).toLowerCase());
    }
    if (cleanPos === -1) return [];

    const matchEnd = cleanPos + Math.min(needleTrim.length, fullClean.length - cleanPos);

    const itemMatchRange = new Map();
    for (let ci = cleanPos; ci < matchEnd; ci++) {
      const fi = cleanToFull[ci];
      if (fi == null) continue;
      const iIdx = fullCharToItem[fi];
      if (iIdx < 0) continue;
      const offset = ci - itemCleanStart[iIdx];
      if (!itemMatchRange.has(iIdx)) {
        itemMatchRange.set(iIdx, { first: offset, last: offset });
      } else {
        itemMatchRange.get(iIdx).last = offset;
      }
    }
    if (!itemMatchRange.size) return [];

    const rawBoxes = [];
    itemMatchRange.forEach(({ first, last }, idx) => {
      const item = items[idx];
      if (!item.transform) return;
      try {
        const [vx, vy] = viewport.convertToViewportPoint(item.transform[4], item.transform[5]);
        const totalW  = Math.abs(item.width  || 0) * viewport.scale;
        const rawH    = Math.abs(item.height || item.transform[3] || 12);
        const h       = rawH * viewport.scale;
        if (totalW <= 0 || h <= 0) return;
        const totalChars = item.str.length;
        const xLeft  = vx + (first / totalChars) * totalW;
        const xRight = vx + ((last + 1) / totalChars) * totalW;
        const matchW = xRight - xLeft;
        if (matchW <= 0) return;
        const padTop  = h * 0.12;
        const padBot  = -(h * 0.12);
        const padSide = 2;
        const boxTop  = vy - h - padTop;
        const boxBot  = vy + padBot;
        const boxH    = boxBot - boxTop;
        const left   = Math.max(0,       (xLeft  - padSide) / viewport.width  * 100);
        const top    = Math.max(0,       boxTop              / viewport.height * 100);
        const width  = Math.min(100 - left, (matchW + padSide * 2) / viewport.width  * 100);
        const height = Math.min(100 - top,  boxH              / viewport.height * 100);
        if (width > 0.1 && height > 0.1) rawBoxes.push({ left, top, width, height, h, vy });
      } catch {}
    });

    if (!rawBoxes.length) return [];

    const avgH = rawBoxes.reduce((s, b) => s + b.h, 0) / rawBoxes.length;
    const LINE_THRESH = avgH * 0.30;
    rawBoxes.sort((a, b) => a.vy - b.vy || a.left - b.left);
    const lines = [];
    rawBoxes.forEach(box => {
      const last = lines[lines.length - 1];
      if (last && Math.abs(box.vy - last._vy) < LINE_THRESH) {
        const right    = Math.max(last.left + last.width, box.left + box.width);
        last.left      = Math.min(last.left, box.left);
        last.top       = Math.min(last.top,  box.top);
        last.width     = right - last.left;
        last.height    = Math.max(last.height, box.height);
        last._vy       = (last._vy + box.vy) / 2;
      } else {
        lines.push({ left: box.left, top: box.top, width: box.width, height: box.height, _vy: box.vy });
      }
    });

    return lines.map(({ left, top, width, height }) => ({ left, top, width, height }));
  } catch (e) {
    console.warn("[findTextBoxes]", e);
    return [];
  }
}


function PDFPage({ page, viewport, annotations, highlightText, scrollContainerRef, fields, onFieldClick }) {
  const canvasRef  = useRef(null);
  const renderTask = useRef(null);
  const boxRef     = useRef(null);
  const [hlBoxes,    setHlBoxes]    = useState([]);
  const [textLines,  setTextLines]  = useState([]);  // [{left,top,width,height,text}]
  const [hoveredIdx, setHoveredIdx] = useState(null);

  // ── Render canvas ─────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (renderTask.current) { renderTask.current.cancel(); renderTask.current = null; }
    canvas.width  = viewport.width;
    canvas.height = viewport.height;
    renderTask.current = page.render({ canvasContext: canvas.getContext("2d"), viewport });
    renderTask.current.promise.catch(() => {});
    return () => { if (renderTask.current) renderTask.current.cancel(); };
  }, [page, viewport]);

  // ── Extract text lines for hover overlay ──────────────────────────
  useEffect(() => {
    let active = true;
    page.getTextContent().then(tc => {
      if (!active) return;
      // Group items by y-position (within 6px tolerance) to form lines
      const groups = [];
      tc.items.forEach(item => {
        if (!item.str?.trim()) return;
        // Convert PDF coords → viewport coords
        const [vx, vy] = viewport.convertToViewportPoint(item.transform[4], item.transform[5]);
        const wPx = item.width  * Math.abs(viewport.transform[0]);
        const hPx = Math.max(item.height * Math.abs(viewport.transform[3]), 10);
        const existing = groups.find(g => Math.abs(g.vy - vy) < 7);
        if (existing) {
          existing.items.push({ vx, vy, wPx, hPx, str: item.str });
          existing.x1 = Math.min(existing.x1, vx);
          existing.x2 = Math.max(existing.x2, vx + wPx);
          existing.vy = (existing.vy + vy) / 2;
          existing.hPx = Math.max(existing.hPx, hPx);
        } else {
          groups.push({ vy, x1: vx, x2: vx + wPx, hPx, items: [{ vx, vy, wPx, hPx, str: item.str }] });
        }
      });
      const lines = groups.map(g => {
        const text = g.items.sort((a, b) => a.vx - b.vx).map(i => i.str).join(" ").trim();
        // 1px side padding, no top padding — sit flush on the text baseline
        const padX = 1;
        const padY = 0.5;
        return {
          left:   Math.max(0, (g.x1 - padX) / viewport.width  * 100),
          top:    Math.max(0, (g.vy - g.hPx * 1.05 - padY) / viewport.height * 100),
          width:  Math.min(100, (g.x2 - g.x1 + padX * 2) / viewport.width  * 100),
          height: Math.min(8,   (g.hPx * 1.1 + padY) / viewport.height * 100),
          text,
        };
      });
      setTextLines(lines);
    });
    return () => { active = false; };
  }, [page, viewport]);

  // ── Active-edit highlight (existing behaviour) ────────────────────
  useEffect(() => {
    if (!highlightText?.trim()) { setHlBoxes([]); return; }
    let active = true;
    findTextBoxes(page, viewport, highlightText).then(boxes => {
      if (!active) return;
      setHlBoxes(boxes);
      if (boxes.length > 0 && scrollContainerRef?.current && boxRef.current) {
        const container = scrollContainerRef.current;
        const pageEl    = boxRef.current;
        const hlY = pageEl.offsetTop + (boxes[0].top / 100) * pageEl.offsetHeight;
        const containerHeight = container.clientHeight;
        // Center the highlighted field in the viewport
        container.scrollTo({ top: Math.max(0, hlY - containerHeight / 2), behavior: "smooth" });
      }
    });
    return () => { active = false; };
  }, [highlightText, page, viewport]);

  // ── Match a line's text to the closest field ──────────────────────
  const matchField = useCallback((lineText) => {
    if (!fields?.length || !lineText) return null;
    const norm = t => t.toLowerCase().replace(/[^\w\s]/g, "").replace(/\s+/g, " ").trim();
    const nl = norm(lineText);
    let best = null, bestScore = 0;
    for (const f of fields) {
      if (!f.text?.trim()) continue;
      const nf = norm(f.text);
      // Score = length of longest common substring / max(lengths)
      let score = 0;
      if (nf.includes(nl)) score = nl.length / nf.length;
      else if (nl.includes(nf)) score = nf.length / nl.length;
      else {
        // word overlap
        const lw = new Set(nl.split(" ")); const fw = nf.split(" ");
        const overlap = fw.filter(w => w.length > 2 && lw.has(w)).length;
        score = overlap / Math.max(lw.size, fw.length);
      }
      if (score > bestScore && score > 0.35) { bestScore = score; best = f; }
    }
    return best;
  }, [fields]);

  const hoveredField = hoveredIdx !== null ? matchField(textLines[hoveredIdx]?.text) : null;

  // Link overlays
  const linkOverlays = annotations
    .filter(a => a.subtype === "Link" && (a.url || a.action?.url))
    .map((ann, ai) => {
      const href = ann.url || ann.action?.url || "";
      if (!href) return null;
      const [sx, , , sy, tx, ty] = viewport.transform;
      const px1 = ann.rect[0] * sx + tx; const px2 = ann.rect[2] * sx + tx;
      const py1 = ann.rect[1] * sy + ty; const py2 = ann.rect[3] * sy + ty;
      const left   = Math.min(px1, px2) / viewport.width  * 100;
      const top    = Math.min(py1, py2) / viewport.height * 100;
      const width  = Math.abs(px2 - px1) / viewport.width  * 100;
      const height = Math.abs(py2 - py1) / viewport.height * 100;
      return (
        <a key={ai} href={href} target="_blank" rel="noopener noreferrer" title={href}
          style={{ position: "absolute", left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%`, zIndex: 6, cursor: "pointer", display: "block", borderRadius: 2 }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(37,99,235,0.13)"; e.currentTarget.style.outline = "1.5px solid rgba(37,99,235,0.45)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.outline = "none"; }}
        />
      );
    }).filter(Boolean);

  const aspectPct = (viewport.height / viewport.width) * 100;

  return (
    <Box ref={boxRef} sx={{ width: "100%", bgcolor: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,.15)", borderRadius: 1, overflow: "hidden" }}>
      <div style={{ position: "relative", width: "100%", paddingBottom: `${aspectPct}%`, display: "block" }}>
        <canvas ref={canvasRef}
          onClick={() => { setHoveredIdx(null); onFieldClick?.(null); }}
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "block", cursor: "default" }} />

        {/* ── Text hover zones ── */}
        {textLines.map((line, i) => {
          const isHov = hoveredIdx === i && hoveredField;
          return (
            <div
              key={i}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              onClick={() => { if (hoveredField) onFieldClick?.(hoveredField); }}
              style={{
                position: "absolute",
                left:   `${line.left}%`,
                top:    `${line.top}%`,
                width:  `${line.width}%`,
                height: `${line.height}%`,
                zIndex: 2,
                cursor: isHov ? "pointer" : "default",
                borderRadius: 2,
                /* Clean left-accent + barely-there fill */
                background:  isHov ? "rgba(37,99,235,0.055)" : "transparent",
                boxShadow:   isHov ? "inset 2px 0 0 #2563eb" : "none",
                transition:  "background .12s, box-shadow .12s",
                // Always "auto" so onMouseEnter fires; link overlays at
                // zIndex:6 sit above these zones so link clicks still work
                pointerEvents: "auto",
              }}
            />
          );
        })}

        {/* ── Hover chip tooltip ── */}
        {hoveredField && hoveredIdx !== null && (() => {
          const line = textLines[hoveredIdx];
          const section = hoveredField.section?.label || hoveredField.section?.key || "";
          const chipLeft = Math.min(line.left, 72);
          const chipTop  = Math.max(0, line.top);
          return (
            <div style={{
              position: "absolute",
              left:      `${chipLeft}%`,
              top:       `${chipTop}%`,
              transform: "translateY(-100%) translateY(-4px)",
              pointerEvents: "none",
              zIndex: 20,
              display: "flex",
              alignItems: "center",
              gap: 5,
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 6,
              padding: "4px 9px 4px 7px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)",
              fontFamily: "'Inter',sans-serif",
              whiteSpace: "nowrap",
              animation: "hlFadeIn .14s ease",
            }}>
              {/* Pencil dot */}
              <span style={{ width: 16, height: 16, borderRadius: 5, background: "rgba(37,99,235,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                  <path d="M8.5 1.5a1.5 1.5 0 0 1 2.12 2.12L4 10.25l-2.75.5.5-2.75L8.5 1.5Z" stroke="#2563eb" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <span style={{ fontSize: 10, fontWeight: 600, color: "#374151", letterSpacing: "-.01em" }}>
                Edit
                {section && <span style={{ color: "#94a3b8", fontWeight: 400, marginLeft: 4 }}>· {section}</span>}
              </span>
              {/* small caret */}
              <span style={{ position: "absolute", bottom: -5, left: 10, width: 0, height: 0, borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: "5px solid #fff", filter: "drop-shadow(0 1px 0 #e2e8f0)" }} />
            </div>
          );
        })()}

        {linkOverlays}

        {/* ── Active-edit highlight (while field is open in editor) ── */}
        {hlBoxes.map((b, i) => (
          <div key={i} style={{
            position: "absolute",
            left:   `${b.left   - 0.3}%`, top:    `${b.top    - 0.3}%`,
            width:  `${b.width  + 0.6}%`, height: `${b.height + 0.6}%`,
            background: "rgba(37,99,235,0.08)",
            boxShadow: "inset 0 0 0 1.5px rgba(37,99,235,0.5)",
            borderRadius: 2,
            pointerEvents: "none",
            zIndex: 4,
            animation: "hlFadeIn .2s ease",
          }} />
        ))}
        {hlBoxes.length > 0 && (
          <div style={{
            position: "absolute",
            top:  `${Math.max(0, hlBoxes[0].top - 0.5)}%`,
            left: `${hlBoxes[0].left}%`,
            transform: "translateY(-100%) translateY(-3px)",
            display: "flex", alignItems: "center", gap: 4,
            background: "#2563eb",
            color: "#fff",
            fontSize: 9.5, fontWeight: 600, fontFamily: "'Inter',sans-serif",
            padding: "3px 8px 3px 6px",
            borderRadius: "5px 5px 5px 0",
            pointerEvents: "none", zIndex: 5, whiteSpace: "nowrap",
            boxShadow: "0 2px 10px rgba(37,99,235,0.35)",
            animation: "hlFadeIn .2s ease",
            letterSpacing: "-.01em",
          }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(255,255,255,0.7)", display: "inline-block" }} />
            Editing
          </div>
        )}
      </div>
    </Box>
  );
}


/* ─────────────────────────────────────────────────────────────────────
   PDFViewer  —  now accepts onPageChange(currentPage, totalPages)
   Uses IntersectionObserver on each page wrapper div to detect which
   page is most visible in the scroll container and fires the callback.
───────────────────────────────────────────────────────────────────── */
function PDFViewer({ url, version, highlightText, scrollContainerRef, onPageChange, fields, onFieldClick }) {
  const [pages, setPages]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  // One ref per page wrapper div — populated via callback refs below
  const pageWrapRefs = useRef([]);

  // ── Load PDF pages ────────────────────────────────────────────────
  useEffect(() => {
    if (!url) return;
    const loadPdfJs = () => new Promise((resolve, reject) => {
      if (window.pdfjsLib) { resolve(window.pdfjsLib); return; }
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
      script.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        resolve(window.pdfjsLib);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });

    let cancelled = false;
    setLoading(true); setError(null); setPages([]);
    // Reset page tracker immediately when a new PDF loads
    onPageChange?.(1, 0);

    loadPdfJs()
      .then(async (pdfjsLib) => {
        const pdf = await pdfjsLib.getDocument({ url, withCredentials: false }).promise;
        if (cancelled) return;
        const pagesData = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page        = await pdf.getPage(i);
          const viewport    = page.getViewport({ scale: 1.65 });
          const annotations = await page.getAnnotations();
          pagesData.push({ page, viewport, annotations });
        }
        if (!cancelled) {
          setPages(pagesData);
          setLoading(false);
          // Immediately tell parent the total; current = 1
          onPageChange?.(1, pagesData.length);
        }
      })
      .catch(e => { if (!cancelled) { setError(e.message); setLoading(false); } });

    return () => { cancelled = true; };
  }, [url, version]);

  // ── IntersectionObserver — fires when visible page changes ────────
  useEffect(() => {
    if (!pages.length || !scrollContainerRef?.current) return;

    const container = scrollContainerRef.current;
    // Track intersection ratio per page index
    const ratios = new Array(pages.length).fill(0);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const idx = Number(entry.target.dataset.pidx);
          if (!isNaN(idx)) ratios[idx] = entry.intersectionRatio;
        });
        // The page with the highest visible fraction is the "current" page
        let bestIdx = 0;
        let bestRatio = -1;
        ratios.forEach((r, i) => { if (r > bestRatio) { bestRatio = r; bestIdx = i; } });
        onPageChange?.(bestIdx + 1, pages.length);
      },
      {
        root: container,
        // Fine-grained thresholds so even small scroll movements update the badge
        threshold: [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
      }
    );

    // Attach observer to every page wrapper that has been mounted
    pageWrapRefs.current.forEach((el, i) => {
      if (el) {
        el.dataset.pidx = String(i);
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, [pages.length, scrollContainerRef]);

  // ── Render ────────────────────────────────────────────────────────
  if (loading) return (
    <Stack alignItems="center" justifyContent="center"
      sx={{ flex: 1, gap: 1.5, bgcolor: "#fff", borderRadius: 2.5, border: "1.5px dashed #dde1ea" }}>
      <SpinnerEl size={22} color="#2563eb" />
      <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Rendering preview…</Typography>
    </Stack>
  );

  if (error) return (
    <Stack alignItems="center" justifyContent="center"
      sx={{ flex: 1, gap: 1, bgcolor: "#fff", borderRadius: 2.5, border: "1.5px dashed #fecaca" }}>
      <Typography sx={{ fontSize: 12, color: "#ef4444" }}>Preview error</Typography>
      <Typography sx={{ fontSize: 10, color: "#9ca3af", px: 2, textAlign: "center" }}>{error}</Typography>
    </Stack>
  );

  if (!pages.length) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, width: "100%" }}>
      {pages.map(({ page, viewport, annotations }, idx) => (
        // Wrapper div registered with the IntersectionObserver
        <div
          key={idx}
          ref={el => { pageWrapRefs.current[idx] = el; }}
          style={{ width: "100%" }}
        >
          <PDFPage
            page={page} viewport={viewport} annotations={annotations}
            highlightText={highlightText}
            scrollContainerRef={scrollContainerRef}
            fields={fields}
            onFieldClick={onFieldClick}
          />
        </div>
      ))}
    </div>
  );
}


/* ══════════════════════════════════════════════════════════════════════
   PAGE WRITER DIALOG  — type / paste content onto a new blank page
══════════════════════════════════════════════════════════════════════ */
function PageWriterDialog({ open, onWrite, onClose, writing, pageFields, onSaveField, onDeleteField, deleting }) {
  const [text,            setText]            = React.useState("");
  const [editingId,       setEditingId]       = React.useState(null);
  const [editingText,     setEditingText]     = React.useState("");
  const [confirmDeleteId, setConfirmDeleteId] = React.useState(null);
  const textareaRef = React.useRef(null);
  const editRef     = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    setText(""); setEditingId(null); setEditingText(""); setConfirmDeleteId(null);
    const t = setTimeout(() => textareaRef.current?.focus(), 160);
    return () => clearTimeout(t);
  }, [open]);

  React.useEffect(() => {
    if (editingId && editRef.current) { editRef.current.focus(); editRef.current.select(); }
  }, [editingId]);

  React.useEffect(() => {
    if (!pageFields) return;
    if (confirmDeleteId && !pageFields.find(f => f.id === confirmDeleteId)) setConfirmDeleteId(null);
    if (editingId     && !pageFields.find(f => f.id === editingId))          setEditingId(null);
  }, [pageFields, confirmDeleteId, editingId]);

  const linesCount = text ? text.split("\n").length : 0;
  const words      = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars      = text.length;

  const handleSubmit  = () => { if (text.trim() && !writing) onWrite(text); };
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); handleSubmit(); }
    if (e.key === "Escape") { editingId ? cancelEdit() : onClose(); }
  };

  const startEdit  = (field) => { setEditingId(field.id); setEditingText(field.text); setConfirmDeleteId(null); };
  const cancelEdit = () => { setEditingId(null); setEditingText(""); };
  const saveEdit   = (field) => {
    const t = editingText.trim();
    if (!t) { setEditingId(null); setConfirmDeleteId(field.id); return; }
    if (t !== field.text) onSaveField(field, t, null);
    setEditingId(null); setEditingText("");
  };

  if (!open) return null;

  const hasExisting = pageFields && pageFields.length > 0;

  /* ── shared button style helpers ── */
  const baseBtn = (extra = {}) => ({
    border: "1px solid #e5e7eb", borderRadius: 7, background: "#f9fafb",
    color: "#374151", cursor: "pointer", fontFamily: "'Inter',sans-serif",
    fontSize: 11.5, fontWeight: 600, padding: "5px 13px",
    display: "inline-flex", alignItems: "center", gap: 5, transition: "all .12s", ...extra,
  });
  const redBtn = (extra = {}) => ({
    ...baseBtn({ border: "1px solid rgba(239,68,68,0.35)", background: "rgba(239,68,68,0.07)", color: "#ef4444" }),
    ...extra,
  });

  return (
    /* ── Side panel — NO backdrop, slides over the editor column only ── */
    <div
      style={{
        position: "fixed",
        top: 0, right: 0, bottom: 0,
        /* Match the editor column width exactly (55 vw) */
        width: "55vw",
        zIndex: 300,
        background: "#fff",
        borderLeft: "2px solid #ede9fe",
        boxShadow: "-10px 0 48px rgba(124,58,237,0.10), -2px 0 12px rgba(0,0,0,0.06)",
        display: "flex", flexDirection: "column",
        fontFamily: "'Inter',sans-serif",
        animation: "panelSlide .28s cubic-bezier(.34,1.4,.64,1)",
        overflow: "hidden",
      }}
    >

      {/* ── Header ── */}
      <div style={{ padding: "18px 22px 14px", borderBottom: "1.5px solid #f3f0ff", display: "flex", alignItems: "center", gap: 13, flexShrink: 0, background: "#fdfcff" }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#7c3aed,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 3px 12px rgba(124,58,237,0.28)" }}>
          <Edit2 size={15} color="#fff" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: 15, color: "#111827", letterSpacing: "-.02em", display: "flex", alignItems: "center", gap: 8 }}>
            Page Content
            {hasExisting && (
              <span style={{ fontSize: 11.5, fontWeight: 600, color: "#7c3aed", background: "rgba(124,58,237,0.09)", border: "1px solid rgba(124,58,237,0.22)", borderRadius: 99, padding: "1px 9px" }}>
                {pageFields.length} line{pageFields.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>
            Preview visible on the left — click ✏ to edit any letter, word or line
          </div>
        </div>
        <button
          onClick={onClose}
          title="Close (Esc)"
          style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid #e5e7eb", background: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#6b7280", flexShrink: 0, transition: "all .12s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "#f3f4f6"; e.currentTarget.style.borderColor = "#d1d5db"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#f9fafb"; e.currentTarget.style.borderColor = "#e5e7eb"; }}
        >
          <X size={13} />
        </button>
      </div>

      {/* ── Scrollable body ── */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>

        {/* Existing lines */}
        {hasExisting && (
          <div style={{ padding: "14px 22px", borderBottom: "1.5px solid #f3f0ff" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: ".07em" }}>Written Lines</span>
              <span style={{ fontSize: 10.5, color: "#9ca3af" }}>Double-click or ✏ to edit any part</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {pageFields.map((field) => {
                const isEditing  = editingId === field.id;
                const isConfirm  = confirmDeleteId === field.id;
                const isDeleting = deleting && isConfirm;

                /* ── INLINE EDIT ── */
                if (isEditing) return (
                  <div key={field.id} style={{ borderRadius: 10, border: "1.5px solid #7c3aed", background: "#fff", boxShadow: "0 0 0 3px rgba(124,58,237,0.10)", padding: "10px 12px", animation: "fadeIn .14s ease" }}>
                    <div style={{ fontSize: 10, color: "#7c3aed", fontWeight: 700, marginBottom: 7, display: "flex", alignItems: "center", gap: 5 }}>
                      <Edit2 size={10} /> Select any text and replace, or retype the entire line
                    </div>
                    <textarea
                      ref={editRef}
                      value={editingText}
                      onChange={e => setEditingText(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Escape") { e.preventDefault(); cancelEdit(); }
                        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); saveEdit(field); }
                      }}
                      rows={Math.min(7, Math.max(2, editingText.split("\n").length + 1))}
                      style={{ width: "100%", padding: "9px 11px", borderRadius: 8, border: "1.5px solid #c4b5fd", fontFamily: "'Inter',sans-serif", fontSize: 13, lineHeight: 1.7, color: "#111827", background: "#fafbfc", resize: "vertical", outline: "none", boxSizing: "border-box", boxShadow: "0 0 0 2px rgba(124,58,237,0.08)" }}
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                      <span style={{ fontSize: 10, color: "#9ca3af" }}>{editingText.length} chars · Ctrl+Enter to save · Esc to cancel</span>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={cancelEdit} style={baseBtn({ fontSize: 11, padding: "3px 11px" })}><X size={11} /> Cancel</button>
                        <button onClick={() => saveEdit(field)} disabled={deleting} style={baseBtn({ fontSize: 11, padding: "3px 13px", background: "#7c3aed", color: "#fff", border: "none", boxShadow: "0 2px 8px rgba(124,58,237,0.3)", opacity: deleting ? .5 : 1 })}>
                          <Check size={11} /> Save
                        </button>
                      </div>
                    </div>
                  </div>
                );

                /* ── DELETE CONFIRM ── */
                if (isConfirm) return (
                  <div key={field.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 9, background: "rgba(239,68,68,0.06)", border: "1.5px solid rgba(239,68,68,0.3)", animation: "fadeIn .14s ease" }}>
                    <Trash2 size={13} color="#ef4444" style={{ flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: 12.5, color: "#ef4444", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      Delete: "{field.text?.slice(0, 42)}{field.text?.length > 42 ? "…" : ""}"?
                    </span>
                    <button onClick={() => setConfirmDeleteId(null)} style={baseBtn({ fontSize: 11, padding: "3px 10px" })}>Cancel</button>
                    <button onClick={() => onDeleteField(field)} disabled={isDeleting} style={redBtn({ fontSize: 11, padding: "3px 11px", opacity: isDeleting ? .55 : 1 })}>
                      {isDeleting ? <SpinnerEl size={10} color="#ef4444" /> : <><Trash2 size={11} /> Delete</>}
                    </button>
                  </div>
                );

                /* ── NORMAL ROW ── */
                return (
                  <div
                    key={field.id}
                    onDoubleClick={() => startEdit(field)}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 9, background: "#f8f9fb", border: "1.5px solid #e8eaef", transition: "all .12s", cursor: "default" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#c4b5fd"; e.currentTarget.style.background = "#f5f3ff"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#e8eaef";  e.currentTarget.style.background = "#f8f9fb"; }}
                  >
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#c4b5fd", flexShrink: 0, width: 18, textAlign: "right", fontFamily: "monospace" }}>
                      {pageFields.indexOf(field) + 1}
                    </span>
                    <span style={{ flex: 1, fontSize: 13, color: field.text?.trim() ? "#374151" : "#c1c8d4", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontStyle: field.text?.trim() ? "normal" : "italic" }}>
                      {field.text?.trim() || "empty line"}
                    </span>
                    {/* Edit btn */}
                    <button
                      onClick={e => { e.stopPropagation(); startEdit(field); }}
                      title="Edit — change any letter, word or paragraph"
                      style={{ width: 27, height: 27, borderRadius: 7, border: "1px solid rgba(124,58,237,0.28)", background: "rgba(124,58,237,0.07)", color: "#7c3aed", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .12s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(124,58,237,0.18)"}
                      onMouseLeave={e => e.currentTarget.style.background = "rgba(124,58,237,0.07)"}
                    >
                      <Edit2 size={12} />
                    </button>
                    {/* Delete btn */}
                    <button
                      onClick={e => { e.stopPropagation(); setConfirmDeleteId(field.id); setEditingId(null); }}
                      disabled={deleting}
                      title="Delete this line"
                      style={{ width: 27, height: 27, borderRadius: 7, border: "1px solid #fecaca", background: "rgba(239,68,68,0.06)", color: "#f87171", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .12s", opacity: deleting ? .4 : 1 }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.14)"; e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.borderColor = "#f87171"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.06)"; e.currentTarget.style.color = "#f87171";  e.currentTarget.style.borderColor = "#fecaca"; }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Add more content ── */}
        <div style={{ padding: "16px 22px", flex: 1, display: "flex", flexDirection: "column" }}>
          {hasExisting && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
              <div style={{ flex: 1, height: 1, background: "#f1f5f9" }} />
              <span style={{ fontSize: 10.5, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".06em" }}>Add more content</span>
              <div style={{ flex: 1, height: 1, background: "#f1f5f9" }} />
            </div>
          )}
          {!hasExisting && (
            <div style={{ marginBottom: 12, padding: "9px 13px", background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: 8, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 15, flexShrink: 0 }}>💡</span>
              <span style={{ fontSize: 11.5, color: "#7c3aed", lineHeight: 1.55 }}>
                Paste from Word, Notion, or any text source. <b>Blank lines</b> add spacing. <b>Ctrl+Enter</b> to write.
              </span>
            </div>
          )}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={hasExisting
              ? "Type additional lines to append to this page…"
              : "Type your content here, or paste from another document…\n\nEach line becomes a separate paragraph.\nBlank lines add spacing."}
            style={{ width: "100%", flex: 1, minHeight: hasExisting ? 120 : 240, padding: "13px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontFamily: "'Inter',sans-serif", fontSize: 13.5, lineHeight: 1.8, color: "#111827", background: "#fafbfc", resize: "none", outline: "none", boxSizing: "border-box", transition: "border-color .15s, box-shadow .15s" }}
            onFocus={e => { e.target.style.borderColor = "#7c3aed"; e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.1)"; }}
            onBlur={e  => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; }}
          />
          <div style={{ display: "flex", gap: 16, padding: "7px 2px", fontSize: 11, color: "#9ca3af" }}>
            <span><b style={{ color: text ? "#6b7280" : "#9ca3af" }}>{linesCount}</b> line{linesCount !== 1 ? "s" : ""}</span>
            <span><b style={{ color: text ? "#6b7280" : "#9ca3af" }}>{words}</b> word{words !== 1 ? "s" : ""}</span>
            <span><b style={{ color: text ? "#6b7280" : "#9ca3af" }}>{chars}</b> char{chars !== 1 ? "s" : ""}</span>
            {text.trim() && <span style={{ marginLeft: "auto", color: "#a78bfa", fontWeight: 500, fontSize: 10.5 }}>Ctrl+Enter ↵</span>}
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ padding: "12px 22px 18px", borderTop: "1.5px solid #f3f0ff", display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8, flexShrink: 0, background: "#fdfcff" }}>
        <button onClick={onClose} style={baseBtn({ padding: "8px 18px", fontSize: 12.5, borderRadius: 8 })}>
          {hasExisting && !text.trim() ? "Done" : "Cancel"}
        </button>
        <button
          onClick={handleSubmit}
          disabled={!text.trim() || writing}
          style={{ padding: "9px 20px", fontSize: 12.5, fontWeight: 700, borderRadius: 8, cursor: (!text.trim() || writing) ? "not-allowed" : "pointer", background: (!text.trim() || writing) ? "#e5e7eb" : "linear-gradient(135deg,#7c3aed,#9333ea)", color: (!text.trim() || writing) ? "#9ca3af" : "#fff", border: "none", boxShadow: (!text.trim() || writing) ? "none" : "0 4px 14px rgba(124,58,237,0.32)", transition: "all .2s", display: "inline-flex", alignItems: "center", gap: 7, fontFamily: "'Inter',sans-serif" }}
        >
          {writing ? <><SpinnerEl size={12} color="#9ca3af" /> Writing…</> : <><Edit2 size={13} /> {hasExisting ? "Append to Page" : "Write to Page"}</>}
        </button>
      </div>

    </div>
  );
}


/* ══════════════════════════════════════════════════════════════════════
   STEP LABELS
══════════════════════════════════════════════════════════════════════ */
const STEP_LABELS = {
  header:"Header", contact:"Contacts", personal:"Personal", experience:"Experience",
  work:"Experience", education:"Education", skills:"Skills",
  summary:"Summary", objective:"Objective", projects:"Projects",
  languages:"Languages", certifications:"Certifications",
  awards:"Awards", references:"References", other:"Other",
};

/* ══════════════════════════════════════════════════════════════════════
   MAIN APP
══════════════════════════════════════════════════════════════════════ */
export default function App() {
  const [appView, setAppView]         = useState("landing");
  const [landingStep, setLandingStep] = useState("hero");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [landingUploading, setLandingUploading] = useState(false);
  const [fileName, setFileName]       = useState("");
  const [sessionId, setSessionId]     = useState("");
  const [saving, setSaving]           = useState(false);
  const [editCount, setEditCount]     = useState(0);
  const [pendingSection, setPendingSection] = useState(null);
  const [fields, setFields]           = useState([]);
  const [undoHistories, setUndoHistories] = useState({});
  const lastEditedFieldId = useRef(null);
  const [backendOk, setBackendOk]     = useState(null);
  const [addingAfter, setAddingAfter] = useState(null);
  const [activeSection, setActiveSection] = useState("");
  const [isPdf, setIsPdf]             = useState(false);
  const [toast, setToast]             = useState(null);
  const [previewUrl, setPreviewUrl]   = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewVer, setPreviewVer]   = useState(0);
  const [showJDManager, setShowJDManager] = useState(false);
  const [showMatchPanel, setShowMatchPanel] = useState(false);
  const [isDark, setIsDark]         = useState(false);  // day mode on by default
  const [compareMode, setCompareMode] = useState(false);
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState(null);
  const [variantPreviews, setVariantPreviews] = useState({}); // {sessionId: blobUrl}
  const [variants, setVariants]     = useState([]);   // [{id, name, sessionId}]
  const [fieldsCache, setFieldsCache] = useState({});  // {sessionId: fields[]}
  const [activeVariantId, setActiveVariantId] = useState(null);
  const [renamingId, setRenamingId] = useState(null);
  const [renameVal, setRenameVal]   = useState("");
  const [cloningVariant, setCloningVariant] = useState(false);
  const [shareLink, setShareLink]   = useState(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [sectionPageBreaks, setSectionPageBreaks] = useState({}); // {sectionKey: bool}

  // ── Page Writer dialog ─────────────────────────────────────────────
  const [showPageWriter,    setShowPageWriter]    = useState(false);
  const [pageWriterParaIdx, setPageWriterParaIdx] = useState(-1);
  const [writingPage,       setWritingPage]       = useState(false);
  const [confirmClearPage,  setConfirmClearPage]  = useState(false);
  const [confirmDeletePage, setConfirmDeletePage] = useState(false);
  // Tracks ALL page-break para indices so each page can be targeted independently
  const [allPageBreaks,  setAllPageBreaks]  = useState([]);   // sorted array of para indices
  const [pagePickerEl,   setPagePickerEl]   = useState(null); // MUI Menu anchor for page selector
  const [pendingAction,  setPendingAction]  = useState(null); // 'write' | 'clear' | 'delete'

  // ── Live highlight ─────────────────────────────────────────────────
  const [editingField, setEditingField] = useState(null);

  // ── Page indicator: current visible page + total pages ────────────
  const [previewPage,  setPreviewPage]  = useState(1);
  const [previewTotal, setPreviewTotal] = useState(0);

  const sparkle = useSparkle();

  // Refresh all page-break indices from the backend (called after every page operation
  // because write/clear ops shift subsequent page break indices).
  const refreshPageBreaks = useCallback(async (sid) => {
    try {
      const r = await fetch(`${API_BASE}/get-page-breaks/${sid}`);
      const d = await r.json();
      const breaks = (d.page_breaks || []).sort((a, b) => a - b);
      setAllPageBreaks(breaks);
      setPageWriterParaIdx(prev =>
        breaks.includes(prev) ? prev : (breaks.length > 0 ? breaks[breaks.length - 1] : -1)
      );
      return breaks;
    } catch { return []; }
  }, []);

  // Ref to the preview scroll container
  const previewScrollRef = useRef(null);

  const showToast = (msg, type = "info") => setToast({ msg, type, key: Date.now() });

  useEffect(() => {
    fetch(`${API_BASE}/health`).then(r => r.json()).then(() => setBackendOk(true)).catch(() => setBackendOk(false));
  }, []);

  // Push a deep buffer of history entries on first mount so the browser
  // back button never reaches external pages. popstate immediately refills the buffer.
  useEffect(() => {
    // Fill 30 entries — user would need 30 back-presses to exit
    for (let i = 0; i < 30; i++) {
      window.history.pushState({ resumeApp: true, i }, "");
    }
    const onPopState = () => {
      // Immediately re-push to keep the buffer full
      window.history.pushState({ resumeApp: true }, "");
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []); // only on mount — buffer persists for the whole session

  const renderPreview = useCallback(async (sid) => {
    if (!sid) return; setPreviewLoading(true);
    try {
      const r = await fetch(`${API_BASE}/preview-pdf/${sid}?t=${Date.now()}`);
      if (!r.ok) throw new Error(`Preview ${r.status}`);
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      setPreviewUrl(prev => {
        // Don't revoke cached variant preview URLs
        const cached = Object.values(variantPreviewsRef.current || {});
        if (prev && !cached.includes(prev) && prev !== url) {
          try { URL.revokeObjectURL(prev); } catch {}
        }
        return url;
      });
      setPreviewVer(v => v + 1);
      // Reset to page 1 on each new render
      setPreviewPage(1);
    } catch (e) { showToast("Preview failed — is docx2pdf / LibreOffice installed?", "error"); }
    setPreviewLoading(false);
  }, []);

  const handleFile = useCallback(async (file) => {
    if (!file) return;
    const ext = file.name.toLowerCase();
    if (!ext.endsWith(".docx") && !ext.endsWith(".pdf")) { showToast("Only .docx and .pdf supported", "error"); return; }
    setFileName(file.name); setIsPdf(ext.endsWith(".pdf"));
    setLandingUploading(true); setLandingStep("processing"); setUploadProgress(0);
    // Reset page badge
    setPreviewPage(1); setPreviewTotal(0);
    setShowPageWriter(false); setPageWriterParaIdx(-1); setAllPageBreaks([]); setConfirmClearPage(false); setConfirmDeletePage(false); setPagePickerEl(null); setPendingAction(null);
    let processingTimer = null;
    let processingP = 0;

    // Tick runs from 0→98% continuously while server processes.
    // Phase 1 (0→35): fast, mirrors real byte transfer feel.
    // Phase 2 (35→98): slow crawl while Adobe + LLM work on the server.
    const tick = () => {
      const step  = processingP < 35 ? 1.5
                  : processingP < 55 ? 0.9
                  : processingP < 72 ? 0.5
                  : processingP < 84 ? 0.22
                  : processingP < 93 ? 0.10
                  : 0.03;
      const delay = processingP < 35 ? 80
                  : processingP < 55 ? 110
                  : processingP < 72 ? 180
                  : processingP < 84 ? 300
                  : processingP < 93 ? 480
                  : 720;
      processingP = Math.min(processingP + step, 98);
      setUploadProgress(parseFloat(processingP.toFixed(1)));
      if (processingP < 98) processingTimer = setTimeout(tick, delay);
    };
    // Start immediately so bar moves from 0 right away
    processingTimer = setTimeout(tick, 60);

    try {
      const fd = new FormData(); fd.append("file", file);

      // Single XHR — the bar crawls above while bytes upload AND server processes
      const d = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${API_BASE}/upload`);
        xhr.upload.onprogress = (e) => {
          // Override the timer-based value with real byte progress in 0-35 range
          // so Phase 1 shows true transfer speed, not estimated
          if (e.lengthComputable && processingP < 35) {
            const realPct = (e.loaded / e.total) * 35;
            processingP = Math.max(processingP, realPct);
            setUploadProgress(parseFloat(processingP.toFixed(1)));
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try { resolve(JSON.parse(xhr.responseText)); }
            catch { reject(new Error("Invalid response")); }
          } else {
            try { const e = JSON.parse(xhr.responseText); reject(new Error(e.detail || `Upload failed (${xhr.status})`)); }
            catch { reject(new Error(`Upload failed (${xhr.status})`)); }
          }
        };
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.send(fd);
      });

      // Server responded — stop crawl and sweep quickly to 100
      clearTimeout(processingTimer);
      const sweepTo100 = () => {
        processingP = Math.min(processingP + 3, 100);
        setUploadProgress(Math.round(processingP));
        if (processingP < 100) processingTimer = setTimeout(sweepTo100, 28);
      };
      sweepTo100();
      // Small pause so user sees 100% before transitioning
      await new Promise(r => setTimeout(r, 320));
      setSessionId(d.session_id); setFields(d.fields); setEditCount(0);
      // Auto-create Original + 2 variants from the uploaded resume
      const origSessionId = d.session_id;
      // Clone twice for Variant 1 and Variant 2
      let v1SessionId = origSessionId, v2SessionId = origSessionId;
      try {
        const c1 = await fetch(`${API_BASE}/clone-session/${origSessionId}`, { method: "POST" });
        const d1 = await c1.json();
        if (d1.success) v1SessionId = d1.session_id;
        const c2 = await fetch(`${API_BASE}/clone-session/${origSessionId}`, { method: "POST" });
        const d2 = await c2.json();
        if (d2.success) v2SessionId = d2.session_id;
      } catch {}
      const initVariants = [
        { id: "original", name: "Original", sessionId: origSessionId, readOnly: true },
        { id: "v1", name: "Variant 1", sessionId: v1SessionId, readOnly: false },
        { id: "v2", name: "Variant 2", sessionId: v2SessionId, readOnly: false },
      ];
      setVariants(initVariants);
      setActiveVariantId("v1");
      // Load variant 1 fields by default
      if (v1SessionId !== origSessionId) {
        try {
          const fr = await fetch(`${API_BASE}/fields/${v1SessionId}`);
          const fd = await fr.json();
          if (fd.fields) {
            setFields(fd.fields);
            setFieldsCache(prev => ({
              ...prev,
              [origSessionId]: d.fields,   // original fields
              [v1SessionId]:   fd.fields,  // v1 fields
              [v2SessionId]:   fd.fields,  // v2 starts same (updated on first switch)
            }));
          }
          setSessionId(v1SessionId);
        } catch {}
      }
      // Generate original PDF preview
      try {
        const op = await fetch(`${API_BASE}/original-pdf/${origSessionId}?t=${Date.now()}`);
        if (op.ok) {
          const blob = await op.blob();
          setOriginalPreviewUrl(URL.createObjectURL(blob));
        }
      } catch {}
      // Render preview for active variant (v1)
      await renderPreview(v1SessionId !== origSessionId ? v1SessionId : origSessionId);
      setActiveSection(d.fields[0]?.section?.key || "");
      setTimeout(() => {
        setLandingStep("success"); setLandingUploading(false);
        showToast(d.converted_from_pdf ? "PDF converted to DOCX ✓" : "Uploaded ✓", "success");
      }, 400);
    } catch (e) {
      clearTimeout(processingTimer); showToast(e.message, "error");
      setLandingStep("upload"); setLandingUploading(false);
    }
  }, [renderPreview]);

  const pushUndo = useCallback((fieldId, text, segs) => {
    lastEditedFieldId.current = fieldId;
    setUndoHistories(prev => ({ ...prev, [fieldId]: [...(prev[fieldId] || []), { text, segs }] }));
  }, []);

  const popUndo = useCallback((fieldId) => {
    setUndoHistories(prev => {
      const stack = prev[fieldId] || [];
      if (!stack.length) return prev;
      return { ...prev, [fieldId]: stack.slice(0, -1) };
    });
  }, []);

  const handleFieldSave = useCallback(async (field, newTextOrSegs, formatting, paraFmt = null) => {
    setSaving(true);
    try {
      const isSegs = Array.isArray(newTextOrSegs);
      if (isSegs) {
        const segs = newTextOrSegs; const plainText = segs.map(s => s.text).join("");
        const hasFormatting = segs.some(s => s.bold || s.italic || s.underline || s.strike || s.color || s.fontFamily || s.fontSize);
        const mergedFmt = { ...(formatting || {}), ...(paraFmt || {}) };
        const hasParaFmt = Object.keys(mergedFmt).length > 0;
        if (plainText === field.text && !hasFormatting && !hasParaFmt) { setSaving(false); return; }

        // ── Fields with inline hyperlinks must use text-replacement (/edit)
        //    not /edit-segments, because edit-segments rebuilds all runs from
        //    scratch and destroys the w:hyperlink XML wrappers — breaking redirects.
        //    Text replacement patches only the w:t nodes, preserving w:hyperlink.
        if (field.hasHyperlink && !hasFormatting && !hasParaFmt) {
          const r2 = await fetch(`${API_BASE}/edit`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ session_id: sessionId, field_id: field.id, old_text: field.text, new_text: plainText, para_index: field.paraIndex ?? -1, source: field.source ?? "body", run_indices: null, link_rid: null }) });
          const d2 = await r2.json();
          if (d2.success) { setFields(d2.fields); setEditCount(c => c + 1); showToast("Edit applied ✓", "success"); await renderPreview(sessionId); }
          else showToast(d2.message || "Edit failed", "error");
          setSaving(false); return;
        }

        const r = await fetch(`${API_BASE}/edit-segments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ session_id: sessionId, field_id: field.id, para_index: field.paraIndex ?? -1, source: field.source ?? "body", segments: segs, formatting: Object.keys(mergedFmt).length ? mergedFmt : null }) });
        const d = await r.json();
        if (d.success) { setFields(d.fields); setFieldsCache(prev => ({...prev, [sessionId]: d.fields})); setEditCount(c => c + 1); showToast("Edit applied — updating preview…", "success"); await renderPreview(sessionId); }
        else showToast(d.message || "Edit failed", "error");
        setSaving(false); return;
      }
      const newText = newTextOrSegs;
      const r = await fetch(`${API_BASE}/edit`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ session_id: sessionId, field_id: field.id, old_text: field.text, new_text: newText, para_index: field.paraIndex ?? -1, source: field.source ?? "body", run_indices: field.runIndices ?? null, link_rid: field.linkRId || null, is_textbox: field.isTextbox || false, set_bold: formatting?.bold !== undefined ? formatting.bold : null, formatting: formatting || null }) });
      const d = await r.json();
      if (d.success) { setFields(d.fields); setFieldsCache(prev => ({...prev, [sessionId]: d.fields})); setEditCount(c => c + 1); showToast("Edit applied — updating preview…", "success"); await renderPreview(sessionId); }
      else showToast(d.message || "Edit failed", "error");
    } catch (e) { showToast("Edit failed: " + e.message, "error"); }
    setSaving(false);
  }, [sessionId, renderPreview]);

  const handleLinkSave = useCallback(async (field, rId, newUrl) => {
    if (!newUrl?.trim()) return;
    // __relink__ sentinel = /relink-text already saved; just refresh preview
    if (rId === "__relink__") {
      showToast("Link restored ✓", "success");
      setEditCount(c => c + 1);
      await renderPreview(sessionId);
      return;
    }
    setSaving(true);
    try {
      const r = await fetch(`${API_BASE}/edit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          field_id:   field.id,
          old_text:   newUrl,
          new_text:   newUrl,
          para_index: field.paraIndex ?? -1,
          source:     field.source ?? "body",
          link_rid:   rId,
        }),
      });
      const d = await r.json();
      if (d.success) {
        setFields(d.fields);
        setEditCount(c => c + 1);
        showToast("URL updated ✓", "success");
        await renderPreview(sessionId);
      } else showToast(d.message || "URL save failed", "error");
    } catch (e) { showToast("URL save failed", "error"); }
    setSaving(false);
  }, [sessionId, renderPreview]);

  const handleAddLine = useCallback(async (field, data) => {
    setSaving(true);
    try {
      const r = await fetch(`${API_BASE}/add-line`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ session_id: sessionId, after_para_index: field.paraIndex ?? -1, source: field.source ?? "body", segments: data.segments || [], after_field_text: field.text || null, inherit_list_format: data.inherit_list_format ?? true }) });
      const d = await r.json();
      if (d.success) { setFields(d.fields); setEditCount(c => c + 1); showToast("Line added ✓", "success"); await renderPreview(sessionId); }
      else showToast(d.message || "Add line failed", "error");
    } catch { showToast("Add line failed", "error"); }
    setSaving(false); setAddingAfter(null);
  }, [sessionId, renderPreview]);

  const handleDeleteLine = useCallback(async (field) => {
    setSaving(true);
    try {
      const r = await fetch(`${API_BASE}/delete-line`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ session_id: sessionId, para_index: field.paraIndex ?? -1 }) });
      const d = await r.json();
      if (d.success) { setFields(d.fields); setEditCount(c => c + 1); showToast("Line deleted ✓", "success"); await renderPreview(sessionId); }
      else showToast(d.message || "Delete failed", "error");
    } catch { showToast("Delete failed", "error"); }
    setSaving(false);
  }, [sessionId, renderPreview]);

  const handleDeleteField = useCallback(async (field) => {
    setSaving(true);
    try {
      const r = await fetch(`${API_BASE}/delete-field`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ session_id: sessionId, para_index: field.paraIndex ?? -1, field_text: field.text || null }) });
      const d = await r.json();
      if (d.success) { setFields(d.fields); setEditCount(c => c + 1); showToast("Deleted ✓", "success"); await renderPreview(sessionId); }
      else showToast(d.message || "Delete failed", "error");
    } catch { showToast("Delete failed", "error"); }
    setSaving(false);
  }, [sessionId, renderPreview]);

  const handleImageReplace = useCallback(async (field, file) => {
    setSaving(true);
    try {
      const fd = new FormData(); fd.append("file", file);
      const r = await fetch(`${API_BASE}/replace-image?session_id=${sessionId}&image_target=${encodeURIComponent(field.imageTarget)}`, { method: "POST", body: fd });
      const d = await r.json();
      if (d.success) { setFields(d.fields); setEditCount(c => c + 1); showToast("Image replaced ✓", "success"); await renderPreview(sessionId); }
      else showToast(d.message || "Replace failed", "error");
    } catch { showToast("Replace failed", "error"); }
    setSaving(false);
  }, [sessionId, renderPreview]);

  const handleEditBar = useCallback(async (field, pct) => {
    setSaving(true);
    try {
      const r = await fetch(`${API_BASE}/edit-bar`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ session_id: sessionId, source: field.source, para_index: field.paraIndex, new_pct: pct }) });
      const d = await r.json();
      if (d.success) { setFields(d.fields); setEditCount(c => c + 1); showToast("Updated ✓", "success"); await renderPreview(sessionId); }
      else showToast(d.message || "Failed", "error");
    } catch { showToast("Failed", "error"); }
    setSaving(false);
  }, [sessionId, renderPreview]);

  // Refs to avoid stale closures in global Ctrl+Z handler
  const undoHistoriesRef   = useRef(undoHistories);
  const variantPreviewsRef = useRef(variantPreviews);
  useEffect(() => { variantPreviewsRef.current = variantPreviews; }, [variantPreviews]);
  const fieldsRef          = useRef(fields);
  const handleFieldSaveRef = useRef(handleFieldSave);
  const popUndoRef         = useRef(popUndo);
  useEffect(() => { undoHistoriesRef.current   = undoHistories; },   [undoHistories]);
  useEffect(() => { fieldsRef.current          = fields; },          [fields]);
  useEffect(() => { handleFieldSaveRef.current = handleFieldSave; }, [handleFieldSave]);
  useEffect(() => { popUndoRef.current         = popUndo; },         [popUndo]);

  useEffect(() => {
    const handler = async (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        const tag = document.activeElement?.tagName?.toLowerCase();
        const isEditing = document.activeElement?.contentEditable === "true"
          || tag === "input" || tag === "textarea";
        if (isEditing) return;
        e.preventDefault();
        const fieldId = lastEditedFieldId.current;
        if (!fieldId) return;
        const stack = undoHistoriesRef.current[fieldId];
        if (!stack || !stack.length) return;
        const top   = stack[stack.length - 1];
        const field = fieldsRef.current.find(f => f.id === fieldId);
        if (!field) return;
        if (top.segs && top.segs.length > 0) {
          await handleFieldSaveRef.current(field, top.segs, null, null);
        } else {
          await handleFieldSaveRef.current(field, top.text, null, null);
        }
        popUndoRef.current(fieldId);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []); // empty deps — reads everything via refs

  const resetDoc = useCallback(async () => {
    try {
      const r = await fetch(`${API_BASE}/reset/${sessionId}`, { method: "POST" });
      const d = await r.json();
      if (d.success) { setFields(d.fields); setEditCount(0); setAddingAfter(null); setEditingField(null); showToast("Reset to original ✓", "success"); await renderPreview(sessionId); }
    } catch { showToast("Reset failed", "error"); }
  }, [sessionId, renderPreview]);

  const handleAddPage = useCallback(async () => {
    try {
      const r = await fetch(`${API_BASE}/add-page/${sessionId}`, { method: "POST" });
      const d = await r.json();
      if (d.success) {
        setFields(d.fields);
        setEditCount(c => c + 1);
        showToast("New page added ✓", "success");
        if (d.page_break_para_index !== undefined) {
          // Use functional update so we read the latest allPageBreaks
          setAllPageBreaks(prev => {
            const updated = [...prev, d.page_break_para_index].sort((a, b) => a - b);
            const newPageNum = updated.indexOf(d.page_break_para_index) + 1; // 1-based
            // Navigate to the new page's section tab
            setActiveSection(`__page_${newPageNum}__`);
            return updated;
          });
          setPageWriterParaIdx(d.page_break_para_index);
          setShowPageWriter(false); // section tab replaces the dialog flow
        }
        await renderPreview(sessionId);
      } else {
        showToast(d.message || "Failed to add page", "error");
      }
    } catch { showToast("Add page failed", "error"); }
  }, [sessionId, renderPreview]);

  // Write a plain-text block to the blank page
  const handleWritePageBlock = useCallback(async (text) => {
    if (!text.trim() || pageWriterParaIdx < 0) return;
    setWritingPage(true);
    try {
      const r = await fetch(`${API_BASE}/write-page-block`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, after_para_index: pageWriterParaIdx, text }),
      });
      const d = await r.json();
      if (d.success) {
        setFields(d.fields);
        setEditCount(c => c + 1);
        // Refresh page breaks — write-page-block may have auto-inserted
        // additional page breaks for large content (every 50 lines)
        const newBreaks = await refreshPageBreaks(sessionId);
        // If new page sections were created, update grouped and navigate to first new one
        if (newBreaks && newBreaks.length > allPageBreaks.length) {
          const newCount = newBreaks.length;
          showToast(`Content written ✓ — ${newCount} page section${newCount > 1 ? "s" : ""} created`, "success");
          // Navigate to the first newly-added page section
          const firstNewBreak = newBreaks[allPageBreaks.length];
          if (firstNewBreak !== undefined) {
            setPageWriterParaIdx(firstNewBreak);
            const newPageNum = newBreaks.indexOf(firstNewBreak) + 1;
            setActiveSection(`__page_${newPageNum}__`);
          }
        } else {
          showToast("Content written to page ✓", "success");
        }
        await renderPreview(sessionId);
        setShowPageWriter(false);
      } else {
        showToast(d.message || "Write failed", "error");
      }
    } catch { showToast("Write failed", "error"); }
    setWritingPage(false);
  }, [sessionId, pageWriterParaIdx, allPageBreaks, renderPreview, refreshPageBreaks]);

  // Bulk-delete all content written to the blank page
  const handleClearPageBlock = useCallback(async () => {
    if (pageWriterParaIdx < 0) return;
    try {
      const r = await fetch(`${API_BASE}/clear-page-block`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, after_para_index: pageWriterParaIdx }),
      });
      const d = await r.json();
      if (d.success) {
        setFields(d.fields);
        setEditCount(c => c + 1);
        showToast(`Page cleared (${d.removed} line${d.removed !== 1 ? "s" : ""} removed) ✓`, "success");
        await refreshPageBreaks(sessionId);
        await renderPreview(sessionId);
        setConfirmClearPage(false);
      } else {
        showToast(d.message || "Clear failed", "error");
      }
    } catch { showToast("Clear failed", "error"); }
  }, [sessionId, pageWriterParaIdx, renderPreview, refreshPageBreaks]);

  // Delete the entire blank page (page break + all content)
  const handleDeletePage = useCallback(async () => {
    if (pageWriterParaIdx < 0) return;
    try {
      const r = await fetch(`${API_BASE}/delete-page-block`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, after_para_index: pageWriterParaIdx }),
      });
      const d = await r.json();
      if (d.success) {
        setFields(d.fields);
        setEditCount(c => c + 1);
        showToast("Page deleted ✓", "success");
        // Remove deleted page from the list; refresh gives updated indices
        const remaining = await refreshPageBreaks(sessionId);
        if (remaining.length === 0) {
          setPageWriterParaIdx(-1);
          setShowPageWriter(false);
        }
        setConfirmDeletePage(false);
        setConfirmClearPage(false);
        await renderPreview(sessionId);
      } else {
        showToast(d.message || "Delete page failed", "error");
      }
    } catch { showToast("Delete page failed", "error"); }
  }, [sessionId, pageWriterParaIdx, renderPreview, refreshPageBreaks]);

  const handleShare = useCallback(async () => {
    setShareLoading(true);
    try {
      const r = await fetch(`${API_BASE}/share/${sessionId}`);
      if (!r.ok) throw new Error("Could not generate share link");
      const link = `${API_BASE}/share/${sessionId}`;
      setShareLink(link);
      await navigator.clipboard.writeText(link);
      showToast("Share link copied ✓", "success");
    } catch (e) { showToast("Share failed: " + e.message, "error"); }
    setShareLoading(false);
  }, [sessionId]);

  const handleAddSkillToResume = useCallback(async (skillName) => {
    const techField =
      fields.find(f => /^technical skills/i.test(f.text || "")) ||
      fields.find(f => (f.section?.key || "").toLowerCase().includes("skill")) ||
      fields.find(f => /technical skills/i.test(f.text || ""));
    if (!techField) throw new Error("Technical Skills field not found");
    let segments;
    try {
      const sr = await fetch(`${API_BASE}/get-segments/${sessionId}?para=${techField.paraIndex}&source=${techField.source ?? "body"}`);
      const sd = await sr.json();
      const existingSegs = sd.segments || [];
      if (existingSegs.length > 0) {
        const lastSeg = existingSegs[existingSegs.length - 1];
        segments = [...existingSegs, { text: ", " + skillName, bold: lastSeg.bold||false, italic:false, underline:false, strike:false, color:lastSeg.color||"", fontFamily:lastSeg.fontFamily||"", fontSize:lastSeg.fontSize||"" }];
      } else {
        segments = [{ text: techField.text + ", " + skillName, bold: techField.isBold||false, italic:false, underline:false, strike:false, color:"", fontFamily:"", fontSize:"" }];
      }
    } catch {
      segments = [{ text: techField.text + ", " + skillName, bold: techField.isBold||false, italic:false, underline:false, strike:false, color:"", fontFamily:"", fontSize:"" }];
    }
    const r = await fetch(`${API_BASE}/edit-segments`, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ session_id:sessionId, field_id:techField.id, para_index:techField.paraIndex??-1, source:techField.source??"body", segments, formatting:null }),
    });
    const d = await r.json();
    if (d.success) { setFields(d.fields); setEditCount(c=>c+1); setPendingSection("skills"); setShowMatchPanel(false); await renderPreview(sessionId); }
    else throw new Error(d.message || "Failed to update skills field");
  }, [sessionId, fields, renderPreview]);

  const downloadDocx = useCallback((e) => {
    const a = document.createElement("a"); a.href = `${API_BASE}/download/${sessionId}`;
    a.download = fileName.replace(/\.(docx|pdf)$/i, "_edited.docx"); a.click();
    sparkle(e?.clientX || 300, e?.clientY || 300, "#3b82f6"); showToast("Downloading .docx", "info");
  }, [sessionId, fileName]);

  const downloadPdf = useCallback((e) => {
    const a = document.createElement("a"); a.href = `${API_BASE}/download-pdf/${sessionId}`;
    a.download = fileName.replace(/\.(docx|pdf)$/i, "_edited.pdf"); a.click();
    sparkle(e?.clientX || 300, e?.clientY || 300, "#22d3ee"); showToast("Downloading .pdf", "info");
  }, [sessionId, fileName]);

  const switchVariant = useCallback(async (variantId) => {
    const v = variants.find(x => x.id === variantId);
    if (!v || v.sessionId === sessionId) return;
    // Allow switching to Original — it shows read-only preview
    // Cache current state before switching
    if (previewUrl) setVariantPreviews(prev => ({ ...prev, [sessionId]: previewUrl }));
    setFieldsCache(prev => ({ ...prev, [sessionId]: fields }));
    setActiveVariantId(variantId);
    setSessionId(v.sessionId);
    setEditCount(0); setAddingAfter(null); setEditingField(null);
    setUndoHistories({});
    // Use cached fields — avoids LLM re-run
    const cachedFields = fieldsCache[v.sessionId];
    if (cachedFields && cachedFields.length > 0) {
      setFields(cachedFields);
    } else {
      try {
        const r = await fetch(`${API_BASE}/fields/${v.sessionId}`);
        if (r.ok) { const d = await r.json(); if (d.fields) { setFields(d.fields); setFieldsCache(prev => ({ ...prev, [v.sessionId]: d.fields })); } }
      } catch {}
    }
    // Use cached preview — avoids PDF re-render
    const cachedPrev = variantPreviews[v.sessionId];
    if (cachedPrev) {
      setPreviewUrl(cachedPrev);
      setPreviewVer(x => x + 1);
    } else {
      setPreviewUrl(null);
      await renderPreview(v.sessionId);
    }
  }, [variants, sessionId, fields, previewUrl, fieldsCache, variantPreviews, renderPreview]);

  const cloneVariant = useCallback(async () => {
    if (!sessionId || cloningVariant) return;
    setCloningVariant(true);
    try {
      const r = await fetch(`${API_BASE}/clone-session/${sessionId}`, { method: "POST" });
      const d = await r.json();
      if (d.success) {
        const newId = "v" + (variants.length + 1) + "_" + Date.now();
        const srcName = variants.find(v => v.id === activeVariantId)?.name || "Variant";
        const newVariant = { id: newId, name: srcName + " (copy)", sessionId: d.session_id };
        setVariants(prev => [...prev, newVariant]);
        // Switch to new variant
        setActiveVariantId(newId);
        setSessionId(d.session_id);
        setFields(d.fields || []);
        setEditCount(0); setAddingAfter(null); setEditingField(null);
        setUndoHistories({});
        showToast("New variant created ✓", "success");
        await renderPreview(d.session_id);
      } else showToast(d.detail || "Clone failed", "error");
    } catch (e) { showToast("Clone failed: " + e.message, "error"); }
    setCloningVariant(false);
  }, [sessionId, variants, activeVariantId, cloningVariant, renderPreview]);

  const deleteVariant = useCallback((variantId) => {
    if (variants.length <= 1) { showToast("Can't delete the only variant", "error"); return; }
    const remaining = variants.filter(v => v.id !== variantId);
    setVariants(remaining);
    if (activeVariantId === variantId) {
      const fallback = remaining[remaining.length - 1];
      switchVariant(fallback.id);
    }
  }, [variants, activeVariantId, switchVariant]);

  const handleAddBlankLine = useCallback(async (field) => {
    // Silently insert a blank paragraph after this field — causes reflow like pressing Enter in Word
    try {
      const r = await fetch(`${API_BASE}/add-line`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          after_para_index: field.paraIndex ?? -1,
          source: field.source ?? "body",
          segments: [{ text: " ", bold: false, italic: false, underline: false, strike: false, color: "", fontFamily: "", fontSize: "" }],
          inherit_list_format: false,
        }),
      });
      const d = await r.json();
      if (d.success) {
        setFields(d.fields);
        setEditCount(c => c + 1);
        await renderPreview(sessionId);
      }
    } catch(e) { /* silent */ }
  }, [sessionId, renderPreview]);

  const handleMoveToNextPage = useCallback(async (sectionKey, fields, enable) => {
    // Prefer the section header field (isHeader) — page break goes on the heading itself
    const sectionFields = fields.filter(f => (f.section?.key || "other") === sectionKey && f.source === "body");
    const firstField = sectionFields.find(f => f.isHeader) || sectionFields[0];
    if (!firstField) { showToast("No fields found in this section", "error"); return; }
    try {
      const r = await fetch(`${API_BASE}/move-to-next-page`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, para_index: firstField.paraIndex, source: "body", enable }),
      });
      const d = await r.json();
      if (d.success) {
        setFields(d.fields);
        setSectionPageBreaks(prev => ({ ...prev, [sectionKey]: enable }));
        showToast(enable ? "Section moved to next page ✓" : "Page break removed ✓", "success");
        await renderPreview(sessionId);
      } else showToast(d.message || "Failed", "error");
    } catch (e) { showToast("Failed: " + e.message, "error"); }
  }, [sessionId, renderPreview]);

  const goNew = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null); setAppView("landing"); setLandingStep("hero");
    setFileName(""); setEditCount(0); setAddingAfter(null); setIsPdf(false);
    setShowJDManager(false); setShowMatchPanel(false); setEditingField(null);
    setPreviewPage(1); setPreviewTotal(0);
    setVariants([]); setActiveVariantId(null);
  }, [previewUrl]);

  // Fields that belong to the ACTIVE page only (between its page break and the next one)
  const pageFields = React.useMemo(() => {
    if (pageWriterParaIdx < 0) return [];
    const sortedBreaks = [...allPageBreaks].sort((a, b) => a - b);
    const myIdx = sortedBreaks.indexOf(pageWriterParaIdx);
    const nextBreak = myIdx >= 0 && myIdx < sortedBreaks.length - 1
      ? sortedBreaks[myIdx + 1]
      : Infinity;
    return fields.filter(f =>
      f.source === "body" &&
      f.paraIndex > pageWriterParaIdx &&
      f.paraIndex < nextBreak &&
      !f.isHeader
    );
  }, [fields, pageWriterParaIdx, allPageBreaks]);

  const grouped = {};
  fields.forEach(f => { const k = f.section?.key || "other"; if (!grouped[k]) grouped[k] = []; grouped[k].push(f); });

  // Inject blank pages as virtual sections so they appear in the progress bar
  const sortedPageBreaksList = [...allPageBreaks].sort((a, b) => a - b);
  sortedPageBreaksList.forEach((breakIdx, i) => {
    const pageKey = `__page_${i + 1}__`;
    const nextBreak = sortedPageBreaksList[i + 1] ?? Infinity;
    grouped[pageKey] = fields.filter(f =>
      f.source === "body" && f.paraIndex > breakIdx && f.paraIndex < nextBreak && !f.isHeader
    );
  });

  // Helper: human-readable label for any section key
  useEffect(() => {
    if (!pendingSection) return;
    const g = {};
    fields.forEach(f => { const k = f.section?.key || "other"; if (!g[k]) g[k] = []; g[k].push(f); });
    const keys = Object.keys(g);
    const target = keys.find(k => k.toLowerCase().includes(pendingSection.toLowerCase())) || keys[0];
    if (target) { setActiveSection(target); setAddingAfter(null); setEditingField(null); }
    setPendingSection(null);
  }, [pendingSection]);

  // Load all variant previews when compare mode opens
  useEffect(() => {
    if (!compareMode || variants.length === 0) return;
    const load = async () => {
      const map = {};
      for (const v of variants) {
        if (v.readOnly) continue;
        if (v.sessionId === sessionId) { map[v.sessionId] = previewUrl; continue; }
        try {
          const r = await fetch(`${API_BASE}/preview-pdf/${v.sessionId}?t=${Date.now()}`);
          if (r.ok) { const blob = await r.blob(); map[v.sessionId] = URL.createObjectURL(blob); }
        } catch {}
      }
      setVariantPreviews(map);
    };
    load();
  }, [compareMode]);

  const getSectionLabel = (k) => {
    if (k.startsWith("__page_")) return `Page ${k.replace("__page_", "").replace(/__/g, "")}`;
    return STEP_LABELS[k] || k.replace(/_/g, " ");
  };

  // Strip bullet chars, then take only the text BEFORE any tab stop.
  // Certification/date fields have right-aligned dates via tab (e.g. "AI-ML Internship\tMay 2023").
  // The PDF text stream joins items without the tab, so searching the full text with tab fails.
  // Taking only the pre-tab portion gives a reliable short needle that always matches.
  const highlightText = (() => {
    const raw = editingField?.text || "";
    const noBullet = raw.replace(/^[\s•◦▪▸–\-*·○■□\u2022\u25E6\u25AA\u25B8]+\s*/, "");
    // Split on tab — take the part before the tab (or the whole string if no tab)
    const preTabs = noBullet.split("\t")[0].trim();
    // Also collapse multiple spaces (e.g. from letter-spaced headings)
    return preTabs.replace(/\s{2,}/g, " ").trim() || null;
  })();

  return (
    <ThemeProvider theme={theme}>
      <style>{GLOBAL_CSS}</style>
      {toast && <Toast key={toast.key} message={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
      {shareLink && (
        <Box sx={{ position:"fixed",top:72,left:"50%",transform:"translateX(-50%)",zIndex:9999,minWidth:400,maxWidth:520,
          bgcolor:isDark?"rgba(10,18,55,.97)":"#fff",border:isDark?"1px solid rgba(167,139,250,.3)":"1px solid #e2e8f0",
          borderRadius:3,p:"18px 22px",boxShadow:"0 12px 48px rgba(0,0,0,.4)",animation:"fadeUp .2s ease" }}>
          <Box sx={{ display:"flex",alignItems:"center",justifyContent:"space-between",mb:1.5 }}>
            <Typography sx={{ fontSize:14,fontWeight:700,color:isDark?"#e0eaff":"#111827" }}>Share Resume</Typography>
            <Box component="button" onClick={()=>setShareLink(null)} sx={{ width:26,height:26,borderRadius:"50%",border:"none",bgcolor:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:isDark?"rgba(160,185,255,.5)":"#9ca3af","&:hover":{bgcolor:isDark?"rgba(255,255,255,.08)":"#f3f4f6"} }}><X size={13}/></Box>
          </Box>
          <Box sx={{ display:"flex",alignItems:"center",gap:1,p:"8px 12px",borderRadius:2,bgcolor:isDark?"rgba(255,255,255,.04)":"#f8fafc",border:isDark?"1px solid rgba(167,139,250,.2)":"1px solid #e2e8f0",mb:1.25 }}>
            <Typography sx={{ fontSize:11.5,fontFamily:"monospace",flex:1,color:isDark?"#a78bfa":"#7c3aed",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{shareLink}</Typography>
            <Box component="button" onClick={async()=>{await navigator.clipboard.writeText(shareLink);showToast("Copied ✓","success");}} sx={{ flexShrink:0,px:1.5,py:0.5,borderRadius:1.5,border:"none",bgcolor:"#7c3aed",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'Inter',sans-serif","&:hover":{bgcolor:"#6d28d9"} }}>Copy</Box>
          </Box>
          <Box component="a" href={shareLink} target="_blank" rel="noopener noreferrer" sx={{ display:"flex",alignItems:"center",justifyContent:"center",gap:0.75,px:2,py:0.875,borderRadius:2,bgcolor:isDark?"rgba(124,58,237,.12)":"#f5f3ff",border:isDark?"1px solid rgba(167,139,250,.25)":"1px solid #ddd6fe",color:isDark?"#c4b5fd":"#7c3aed",fontSize:12.5,fontWeight:600,fontFamily:"'Inter',sans-serif",textDecoration:"none","&:hover":{bgcolor:isDark?"rgba(124,58,237,.22)":"#ede9fe"} }}>
            <Eye size={13}/> Open Preview
          </Box>
        </Box>
      )}
      {shareLink && (
        <Box sx={{ position:"fixed",top:72,left:"50%",transform:"translateX(-50%)",zIndex:9999,minWidth:400,maxWidth:520,
          bgcolor:isDark?"rgba(10,18,55,.97)":"#fff",border:isDark?"1px solid rgba(167,139,250,.3)":"1px solid #e2e8f0",
          borderRadius:3,p:"18px 22px",boxShadow:isDark?"0 12px 48px rgba(0,0,0,.55)":"0 8px 40px rgba(0,0,0,.18)",animation:"fadeUp .2s ease" }}>
          <Box sx={{ display:"flex",alignItems:"center",justifyContent:"space-between",mb:1.5 }}>
            <Box sx={{ display:"flex",alignItems:"center",gap:1 }}>
              <Box sx={{ width:28,height:28,borderRadius:1.5,background:"linear-gradient(135deg,#7c3aed,#a855f7)",display:"flex",alignItems:"center",justifyContent:"center" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              </Box>
              <Typography sx={{ fontSize:14,fontWeight:700,color:isDark?"#e0eaff":"#111827" }}>Share Resume</Typography>
            </Box>
            <Box component="button" onClick={() => setShareLink(null)} sx={{ width:26,height:26,borderRadius:"50%",border:"none",bgcolor:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:isDark?"rgba(160,185,255,.5)":"#9ca3af","&:hover":{ bgcolor:isDark?"rgba(255,255,255,.08)":"#f3f4f6" } }}><X size={13}/></Box>
          </Box>
          <Typography sx={{ fontSize:11.5,color:isDark?"rgba(160,185,255,.6)":"#6b7280",mb:1.25,lineHeight:1.6 }}>Anyone with this link can view your resume as a PDF:</Typography>
          <Box sx={{ display:"flex",alignItems:"center",gap:1,p:"8px 12px",borderRadius:2,bgcolor:isDark?"rgba(255,255,255,.04)":"#f8fafc",border:isDark?"1px solid rgba(167,139,250,.2)":"1px solid #e2e8f0",mb:1.25 }}>
            <Typography sx={{ fontSize:11.5,fontFamily:"monospace",flex:1,color:isDark?"#a78bfa":"#7c3aed",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{shareLink}</Typography>
            <Box component="button" onClick={async()=>{ await navigator.clipboard.writeText(shareLink); showToast("Copied ✓","success"); }} sx={{ flexShrink:0,px:1.5,py:0.5,borderRadius:1.5,border:"none",bgcolor:"#7c3aed",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'Inter',sans-serif","&:hover":{ bgcolor:"#6d28d9" } }}>Copy</Box>
          </Box>
          <Box component="a" href={shareLink} target="_blank" rel="noopener noreferrer" sx={{ display:"flex",alignItems:"center",justifyContent:"center",gap:0.75,px:2,py:0.875,borderRadius:2,bgcolor:isDark?"rgba(124,58,237,.12)":"#f5f3ff",border:isDark?"1px solid rgba(167,139,250,.25)":"1px solid #ddd6fe",color:isDark?"#c4b5fd":"#7c3aed",fontSize:12.5,fontWeight:600,fontFamily:"'Inter',sans-serif",textDecoration:"none","&:hover":{ bgcolor:isDark?"rgba(124,58,237,.22)":"#ede9fe" } }}>
            <Eye size={13}/> Open Preview
          </Box>
          <Typography sx={{ fontSize:10,color:isDark?"rgba(100,130,255,.35)":"#c4c9d4",mt:1.25,textAlign:"center" }}>Link is live while your session is active · Reflects latest edits</Typography>
        </Box>
      )}

      {/* ══ LANDING ══════════════════════════════════════════════════ */}
      {appView === "landing" && (
        <Box sx={{
          minHeight: "100vh", fontFamily: "'Inter',sans-serif", position: "relative", overflow: "hidden",
          background: isDark ? "#060c28" : "linear-gradient(135deg,#f0f4ff 0%,#ffffff 60%,#f5f8ff 100%)",
          transition: "background .5s ease",
        }}>
          {/* Night scene — only in dark mode */}
          {isDark && <NightScene />}
          {/* Light mode background blobs */}
          {!isDark && (
            <Box sx={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none" }}>
              <Box sx={{ position:"absolute", top:"-8%", left:"-8%", width:"38%", height:"38%", bgcolor:"rgba(37,99,235,0.06)", borderRadius:"50%", filter:"blur(100px)" }} />
              <Box sx={{ position:"absolute", bottom:"-8%", right:"-8%", width:"38%", height:"38%", bgcolor:"rgba(22,163,74,0.05)", borderRadius:"50%", filter:"blur(100px)" }} />
            </Box>
          )}
          <Box sx={{ position: "relative", zIndex: 5 }}>
            <LandingNav onLogoClick={() => setLandingStep("hero")} isDark={isDark} onToggleDark={() => setIsDark(d => !d)} />
            <Box component="main" sx={{
              ...(landingStep === "choice" || landingStep === "upload" ? {
                // Full-width two-column layout — no card
              } : landingStep !== "hero" ? {
                maxWidth: 600, mx: "auto", my: 4,
                bgcolor: isDark ? "rgba(10,20,60,0.78)" : "rgba(255,255,255,0.92)",
                backdropFilter: "blur(20px)",
                border: isDark ? "1px solid rgba(100,130,255,.15)" : "1px solid rgba(0,0,0,0.07)",
                borderRadius: 4,
                boxShadow: isDark ? "0 16px 64px rgba(0,0,0,.4)" : "0 8px 40px rgba(0,0,0,.08)",
                transition: "background .4s, border-color .4s",
              } : {})
            }}>
              {landingStep === "hero"       && <HeroStep onNext={() => setLandingStep("choice")} isDark={isDark} />}
              {landingStep === "choice"     && <ChoiceStep onUpload={() => setLandingStep("upload")} onBack={() => setLandingStep("hero")} isDark={isDark} />}
              {landingStep === "upload"     && <UploadStep onBack={() => setLandingStep("choice")} onFile={handleFile} uploading={landingUploading} isDark={isDark} />}
              {landingStep === "processing" && <ProcessingStep progress={uploadProgress} isDark={isDark} />}
              {landingStep === "success"    && <SuccessStep fileName={fileName} onEdit={() => setAppView("editor")} isDark={isDark} />}
            </Box>
          </Box>
          {landingStep === "upload" && backendOk !== null && (
            <Box sx={{ position: "fixed", top: 80, right: 20, px: 1.5, py: 0.75, borderRadius: 99, bgcolor: backendOk ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${backendOk ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`, display: "flex", alignItems: "center", gap: 0.75, zIndex: 10 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: backendOk ? "#16a34a" : "#dc2626", boxShadow: `0 0 6px ${backendOk ? "#16a34a" : "#dc2626"}` }} />
              <Typography sx={{ fontSize: 11.5, fontWeight: 600, color: backendOk ? "#16a34a" : "#ef4444" }}>{backendOk ? "Backend connected" : "Backend offline"}</Typography>
            </Box>
          )}
        </Box>
      )}

      {/* ══ EDITOR ═══════════════════════════════════════════════════ */}
      {appView === "editor" && (
        <>
        {/* ══ COMPARE MODE ══ */}
        {compareMode && (
          <Box sx={{ height:"100vh", display:"flex", flexDirection:"column",
            bgcolor: isDark?"#060c28":"#f0f2f7", fontFamily:"'Inter',sans-serif" }}>
            {/* Compare topbar */}
            <Box sx={{ height:58, px:3, bgcolor: isDark?"rgba(8,14,50,.98)":"#fff",
              borderBottom: isDark?"1px solid rgba(80,110,255,.12)":"1px solid #e8edf5",
              display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0,
              boxShadow: isDark?"0 2px 20px rgba(0,0,0,.4)":"0 1px 6px rgba(0,0,0,.06)" }}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box sx={{ width:30, height:30, borderRadius:2, background:"linear-gradient(135deg,#3d6bff,#6a92ff)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <Eye size={14} color="#fff" />
                </Box>
                <Typography sx={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:800, fontSize:14, color: isDark?"#e0eaff":"#111827", letterSpacing:"-.02em" }}>Compare Variants</Typography>
                <Box sx={{ px:1.25, py:0.375, borderRadius:99, bgcolor:isDark?"rgba(22,163,74,.1)":"#f0fdf4", border:isDark?"1px solid rgba(22,163,74,.25)":"1px solid #bbf7d0" }}>
                  <Typography sx={{ fontSize:10.5, fontWeight:600, color:isDark?"#4ade80":"#16a34a" }}>3 versions · side by side</Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography sx={{ fontSize:11, color: isDark?"rgba(160,185,255,.5)":"#94a3b8" }}>Click Edit → to edit a variant</Typography>
                <RippleBtn variant="ghost" onClick={() => setCompareMode(false)} style={{ fontSize:12, padding:"5px 14px" }}><X size={13} /> Exit</RippleBtn>
              </Stack>
            </Box>
            {/* 3-column grid */}
            <Box sx={{ flex:1, display:"grid", gridTemplateColumns:"1fr 1fr 1fr", overflow:"hidden", minHeight:0 }}>
              {[
                { label:"Original", sublabel:"Uploaded resume · Read-only", vId:"original", color:"#6b7280" },
                { label: variants.find(v=>v.id==="v1")?.name||"Variant 1", sublabel:"Independent copy · Editable", vId:"v1", color:"#2563eb" },
                { label: variants.find(v=>v.id==="v2")?.name||"Variant 2", sublabel:"Independent copy · Editable", vId:"v2", color:"#7c3aed" },
              ].map((col, ci) => {
                const variant = variants.find(v=>v.id===col.vId);
                const isOriginal = col.vId === "original";
                const pUrl = isOriginal ? originalPreviewUrl
                  : (variant?.sessionId === sessionId ? previewUrl : variantPreviews[variant?.sessionId]);
                return (
                  <Box key={ci} sx={{ display:"flex", flexDirection:"column", overflow:"hidden",
                    borderRight: ci<2 ? (isDark?"1px solid rgba(80,110,255,.12)":"1px solid #e2e8f0") : "none" }}>
                    {/* Column header */}
                    <Box sx={{ px:2, py:1.25, flexShrink:0,
                      bgcolor: isDark?"rgba(8,14,50,.98)":"#fff",
                      borderBottom: isDark?"1px solid rgba(80,110,255,.1)":"1px solid #e8edf5",
                      display:"flex", alignItems:"center", justifyContent:"space-between",
                      cursor: isOriginal ? "default" : "pointer" }}
                      onClick={isOriginal ? undefined : async () => { if (variant) await switchVariant(variant.id); setCompareMode(false); }}>
                      <Box sx={{ display:"flex", alignItems:"center", gap:1 }}>
                        <Box sx={{ width:8, height:8, borderRadius:"50%", bgcolor:col.color, boxShadow:`0 0 8px ${col.color}80`, flexShrink:0 }} />
                        <Box>
                          <Typography sx={{ fontSize:12.5, fontWeight:700, color:isDark?"#e0eaff":"#111827", lineHeight:1.2 }}>{col.label}</Typography>
                          <Typography sx={{ fontSize:10, color:isDark?"rgba(160,185,255,.45)":"#94a3b8" }}>{col.sublabel}</Typography>
                        </Box>
                      </Box>
                      {isOriginal ? (
                        <Box sx={{ px:1.25, py:0.375, borderRadius:99, bgcolor:"rgba(107,114,128,.1)", border:"1px solid rgba(107,114,128,.25)", fontSize:10, fontWeight:700, color:isDark?"#9ca3af":"#6b7280", fontFamily:"'Inter',sans-serif" }}>🔒 Original</Box>
                      ) : (
                        <RippleBtn variant="accent" onClick={async () => {
                          if (variant) { await switchVariant(variant.id); }
                          setCompareMode(false);
                        }} style={{ fontSize:10.5, padding:"4px 12px", background:col.color, boxShadow:`0 2px 10px ${col.color}55` }}>
                          Edit →
                        </RippleBtn>
                      )}
                    </Box>
                    {/* PDF scroll area — click anywhere to edit this variant */}
                    <Box
                      onClick={isOriginal ? undefined : async () => { if (variant) await switchVariant(variant.id); setCompareMode(false); }}
                      sx={{ flex:1, overflowY:"auto", p:1.5, bgcolor:isDark?"#060e2a":"#e8eaf0",
                        cursor: isOriginal ? "default" : "pointer",
                        position:"relative",
                        "&:hover .compare-edit-overlay": { opacity: isOriginal ? 0 : 1 }
                      }}>
                      {/* Hover overlay hint */}
                      {!isOriginal && (
                        <Box className="compare-edit-overlay" sx={{
                          position:"absolute", top:8, left:"50%", transform:"translateX(-50%)",
                          zIndex:10, opacity:0, transition:"opacity .2s",
                          pointerEvents:"none",
                          display:"flex", alignItems:"center", gap:0.75,
                          px:1.75, py:0.75, borderRadius:99,
                          bgcolor:"rgba(0,0,0,.65)", backdropFilter:"blur(6px)",
                          border:`1px solid ${col.color}55`,
                          boxShadow:`0 4px 16px rgba(0,0,0,.4)`
                        }}>
                          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                            <path d="M8.5 1.5a1.5 1.5 0 0 1 2.12 2.12L4 10.25l-2.75.5.5-2.75L8.5 1.5Z"
                              stroke={col.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <Typography sx={{ fontSize:11, fontWeight:700, color:"#fff", fontFamily:"'Inter',sans-serif", whiteSpace:"nowrap" }}>
                            Click to edit this variant
                          </Typography>
                        </Box>
                      )}
                      {pUrl ? (
                        <PDFViewer url={pUrl} version={previewVer}
                          highlightText={null} scrollContainerRef={{ current:null }}
                          onPageChange={()=>{}} fields={[]} onFieldClick={()=>{}} />
                      ) : (
                        <Box sx={{ height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:1.5, bgcolor:isDark?"rgba(12,22,65,.6)":"#fff", borderRadius:2, border:isDark?"1.5px dashed rgba(80,110,220,.3)":"1.5px dashed #dde1ea", minHeight:300 }}>
                          <SpinnerEl size={20} color={col.color} />
                          <Typography sx={{ fontSize:12, color:isDark?"rgba(160,185,255,.5)":"#94a3b8" }}>Loading preview…</Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}


        <Box className={isDark ? "night-editor" : ""} sx={{ display: compareMode ? "none" : "flex", height: "100vh", fontFamily: "'Inter',sans-serif", bgcolor: isDark ? "#060c28" : "#f0f2f7", color: "text.primary", transition: "background .4s" }}>

          {showJDManager && <JDManagerPanel onClose={() => setShowJDManager(false)} showToast={showToast} />}
          {showMatchPanel && <MatchPanel sessionId={sessionId} onClose={() => setShowMatchPanel(false)} showToast={showToast} onGoToSection={(sec) => { setShowMatchPanel(false); setPendingSection(sec); }} onAddSkill={handleAddSkillToResume} />}
          {showAIChat && (
            <AIChatPanel onClose={() => setShowAIChat(false)} sessionId={sessionId} fields={fields}
              activeSection={activeSection} editingField={editingField} showToast={showToast} isDark={isDark} />
          )}

          {/* Page writer dialog — auto-opens after Add Page */}
          <PageWriterDialog
            open={showPageWriter}
            onWrite={handleWritePageBlock}
            onClose={() => setShowPageWriter(false)}
            writing={writingPage}
            pageFields={pageFields}
            onSaveField={handleFieldSave}
            onDeleteField={handleDeleteField}
            deleting={saving}
          />

          {/* ── LEFT: Preview 45% ── */}
          <div style={{ width: "45%", flexShrink: 0, height: "100vh", position: "relative", borderRight: isDark ? "1.5px solid rgba(80,110,240,.15)" : "1.5px solid #e5e9f2", background: isDark ? "#080f32" : "#e8eaf0", transition: "background .4s, border-color .4s" }}>

            {/* Preview topbar */}
            <Box sx={{ position:"absolute", top:0, left:0, right:0, height:54,
              bgcolor:isDark?"rgba(8,14,50,.96)":"#fff",
              borderBottom:isDark?"1px solid rgba(80,110,255,.12)":"1px solid #e8edf5",
              display:"flex", alignItems:"center", px:2, gap:1.25, zIndex:2,
              backdropFilter:"blur(14px)", transition:"background .4s",
              boxShadow:isDark?"0 2px 20px rgba(0,0,0,.35)":"0 1px 6px rgba(0,0,0,.06)" }}>

              {/* Eye icon + label */}
              <Box sx={{ display:"flex", alignItems:"center", gap:1, flexShrink:0 }}>
                <Box sx={{ width:28, height:28, background:isDark?"linear-gradient(135deg,#3d6bff,#6a92ff)":"#2563eb", borderRadius:1.75, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:isDark?"0 2px 10px rgba(61,107,255,.4)":"0 2px 8px rgba(37,99,235,.3)" }}>
                  <Eye size={13} color="#fff"/>
                </Box>
                <Box>
                  <Typography sx={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:800, fontSize:13, color:isDark?"#e0eaff":"#111827", letterSpacing:"-.01em", lineHeight:1.1 }}>Preview</Typography>
                  <Typography sx={{ fontSize:9.5, color:isDark?"rgba(160,185,255,.5)":"#94a3b8", fontFamily:"'Inter',sans-serif" }}>hover · click to edit</Typography>
                </Box>
              </Box>

              {/* Variant tabs — center */}
              {variants.length > 0 && (
                <Box sx={{ flex:1, minWidth:0, display:"flex", alignItems:"center", gap:0.625, overflow:"hidden" }}>
                  <Typography sx={{ fontSize:9, fontWeight:700, color:isDark?"rgba(160,185,255,.3)":"#c4c9d4", textTransform:"uppercase", letterSpacing:".08em", flexShrink:0 }}>Variants</Typography>
                  {variants.map(v => {
                    const isActive = v.id===activeVariantId;
                    const c = v.id==="original"?"#6b7280":v.id==="v1"?"#3b82f6":"#8b5cf6";
                    return (
                      <Box key={v.id} sx={{ display:"flex", alignItems:"center", gap:0.25, flexShrink:isActive?0:1, minWidth:0, overflow:"hidden" }}>
                        {renamingId===v.id ? (
                          <input autoFocus value={renameVal} onChange={e=>setRenameVal(e.target.value)}
                            onBlur={()=>{if(renameVal.trim())setVariants(prev=>prev.map(x=>x.id===v.id?{...x,name:renameVal.trim()}:x));setRenamingId(null);}}
                            onKeyDown={e=>{if(e.key==="Enter"){if(renameVal.trim())setVariants(prev=>prev.map(x=>x.id===v.id?{...x,name:renameVal.trim()}:x));setRenamingId(null);}if(e.key==="Escape")setRenamingId(null);}}
                            style={{ width:80,height:26,padding:"0 8px",borderRadius:5,border:`1.5px solid ${c}`,fontFamily:"'Inter',sans-serif",fontSize:11.5,fontWeight:600,background:isDark?"#0a1237":"#fff",color:isDark?"#e0eaff":"#111827",outline:"none" }}/>
                        ) : (
                          <Box onClick={()=>switchVariant(v.id)}
                            onDoubleClick={()=>{if(!v.readOnly){setRenamingId(v.id);setRenameVal(v.name);}}}
                            title={v.readOnly?"Original — click to preview (read-only)":"Click to switch · Double-click to rename"}
                            sx={{ display:"flex", alignItems:"center", gap:0.5, height:26, px:1, borderRadius:1, cursor:v.readOnly?"default":"pointer", userSelect:"none", flexShrink:isActive?0:1, minWidth:0, overflow:"hidden",
                              border:`1.5px solid ${isActive?c:(isDark?"rgba(80,110,255,.12)":"#e2e8f0")}`,
                              bgcolor:isActive?(isDark?`${c}22`:`${c}10`):"transparent",
                              transition:"all .13s", "&:hover":v.readOnly?{}:{borderColor:c} }}>
                            <Box sx={{ width:5, height:5, borderRadius:"50%", bgcolor:isActive?c:(isDark?"rgba(160,185,255,.2)":"#d1d5db"), flexShrink:0 }}/>
                            <Typography sx={{ fontSize:11.5, fontWeight:isActive?700:500, color:isActive?c:(isDark?"rgba(180,205,255,.55)":"#64748b"), whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", fontFamily:"'Inter',sans-serif" }}>
                              {v.name}{v.readOnly?" 🔒":""}
                            </Typography>
                          </Box>
                        )}
                        {variants.length>1&&!v.readOnly&&(
                          <Box component="button" onClick={e=>{e.stopPropagation();deleteVariant(v.id);}}
                            sx={{ width:13,height:13,borderRadius:"50%",border:"none",bgcolor:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:isDark?"rgba(160,185,255,.2)":"#d1d5db",p:0,flexShrink:0,"&:hover":{color:"#ef4444"} }}>
                            <X size={8}/>
                          </Box>
                        )}
                      </Box>
                    );
                  })}

                </Box>
              )}

              {/* Right — live status */}
              <Box sx={{ display:"flex", alignItems:"center", gap:1, flexShrink:0, ml:"auto" }}>
                <Box sx={{ display:"flex", alignItems:"center", gap:0.625, px:1.25, py:0.375, borderRadius:99,
                  bgcolor:isDark?(previewLoading?"rgba(245,158,11,.1)":"rgba(22,163,74,.1)"):(previewLoading?"rgba(245,158,11,.08)":"rgba(22,163,74,.08)"),
                  border:isDark?(previewLoading?"1px solid rgba(245,158,11,.25)":"1px solid rgba(22,163,74,.25)"):(previewLoading?"1px solid rgba(245,158,11,.2)":"1px solid rgba(22,163,74,.2)") }}>
                  <Box sx={{ width:6, height:6, borderRadius:"50%", bgcolor:previewLoading?"#f59e0b":"#22c55e", boxShadow:previewLoading?"0 0 7px #f59e0b":"0 0 7px #22c55e", animation:previewLoading?"pulse 1s infinite":"none" }}/>
                  <Typography sx={{ fontSize:10.5, fontWeight:600, fontFamily:"'Inter',sans-serif", color:isDark?(previewLoading?"#fbbf24":"#4ade80"):(previewLoading?"#d97706":"#16a34a") }}>
                    {previewLoading?"Updating…":"Live"}
                  </Typography>
                </Box>
                {editCount>0 && (
                  <Box sx={{ display:"flex", alignItems:"center", gap:0.5, px:1.125, py:0.375, borderRadius:99, bgcolor:isDark?"rgba(61,107,255,.14)":"#eff6ff", border:isDark?"1px solid rgba(61,107,255,.3)":"1px solid #bfdbfe" }}>
                    <Typography sx={{ fontSize:10.5, fontWeight:700, fontFamily:"'Inter',sans-serif", color:isDark?"#7ca1ff":"#1d4ed8" }}>{editCount} {editCount===1?"edit":"edits"}</Typography>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Preview scroll area — click on blank space to deselect field */}
            <div
              ref={previewScrollRef}
              onClick={e => {
                // Only clear if the click landed on the scroll bg, not on a text zone or link
                if (e.target === previewScrollRef.current || e.target.dataset?.bgClear) {
                  setEditingField(null);
                }
              }}
              style={{ position: "absolute", top: 54, left: 0, right: 0, bottom: 0, overflowY: "auto", overflowX: "hidden", padding: 12, boxSizing: "border-box", background: isDark ? "#060e2a" : "#e8eaf0", transition: "background .4s" }}>
              {previewUrl ? (
                <PDFViewer
                  url={previewUrl}
                  version={previewVer}
                  highlightText={highlightText}
                  scrollContainerRef={previewScrollRef}
                  onPageChange={(cur, tot) => {
                    setPreviewPage(cur);
                    setPreviewTotal(tot);
                  }}
                  fields={fields}
                  onFieldClick={(field) => {
                    if (!field) { setEditingField(null); return; }  // null = deselect
                    const sKey = field.section?.key;
                    if (sKey) setActiveSection(sKey);
                    setTimeout(() => {
                      const el = document.querySelector(`[data-field-id="${field.id}"]`);
                      if (el) {
                        el.scrollIntoView({ behavior: "smooth", block: "center" });
                        setTimeout(() => el.click(), 80);
                      }
                    }, 120);
                  }}
                />
              ) : (
                <div style={{ height: "100%", background: isDark ? "rgba(12,22,65,.6)" : "#fff", borderRadius: 10, border: isDark ? "1.5px dashed rgba(80,110,220,.3)" : "1.5px dashed #dde1ea", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
                  {previewLoading ? (
                    <><SpinnerEl size={22} color="#2563eb" /><span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 13, fontWeight: 700, color: "#374151" }}>Generating preview…</span><span style={{ fontSize: 11.5, color: "#9ca3af" }}>DOCX → PDF converting</span></>
                  ) : (
                    <><FileText size={24} strokeWidth={1.3} color="#c4c9d4" /><span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 13, fontWeight: 700, color: "#374151" }}>Preview will appear here</span></>
                  )}
                </div>
              )}
            </div>

            {/* "Updating preview…" spinner overlay */}
            {previewLoading && previewUrl && (
              <div style={{ position: "absolute", bottom: 52, left: "50%", transform: "translateX(-50%)", padding: "7px 16px", borderRadius: 99, background: "#fff", border: "1px solid #bfdbfe", fontSize: 11.5, color: "#2563eb", fontWeight: 600, display: "flex", alignItems: "center", gap: 7, boxShadow: "0 4px 16px rgba(37,99,235,.15)", whiteSpace: "nowrap", zIndex: 10 }}>
                <SpinnerEl size={11} color="#2563eb" /> Updating preview…
              </div>
            )}

            {/* ── PAGE INDICATOR BADGE ─────────────────────────────── */}
            {previewUrl && previewTotal > 0 && (
              <div
                style={{
                  position: "absolute",
                  bottom: 14,
                  right: 14,
                  zIndex: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "5px 13px",
                  borderRadius: 99,
                  background: "rgba(15,23,42,0.78)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.22)",
                  animation: "pageBadgeIn .25s cubic-bezier(.34,1.56,.64,1)",
                  pointerEvents: "none",
                  userSelect: "none",
                }}
              >
                {/* Page icon */}
                <svg width="11" height="13" viewBox="0 0 11 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="0.5" y="0.5" width="10" height="12" rx="1.5" stroke="rgba(255,255,255,0.45)" strokeWidth="1"/>
                  <line x1="2.5" y1="3.5" x2="8.5" y2="3.5" stroke="rgba(255,255,255,0.45)" strokeWidth="1" strokeLinecap="round"/>
                  <line x1="2.5" y1="5.5" x2="8.5" y2="5.5" stroke="rgba(255,255,255,0.45)" strokeWidth="1" strokeLinecap="round"/>
                  <line x1="2.5" y1="7.5" x2="6"   y2="7.5" stroke="rgba(255,255,255,0.45)" strokeWidth="1" strokeLinecap="round"/>
                </svg>

                {/* Current page — highlighted */}
                <span style={{
                  fontSize: 12.5,
                  fontWeight: 800,
                  fontFamily: "'Inter',sans-serif",
                  color: "#fff",
                  lineHeight: 1,
                  minWidth: "1ch",
                  textAlign: "right",
                }}>
                  {previewPage}
                </span>

                {/* Divider */}
                <span style={{
                  fontSize: 11,
                  fontWeight: 400,
                  color: "rgba(255,255,255,0.35)",
                  fontFamily: "'Inter',sans-serif",
                  lineHeight: 1,
                }}>
                  /
                </span>

                {/* Total pages */}
                <span style={{
                  fontSize: 12.5,
                  fontWeight: 500,
                  fontFamily: "'Inter',sans-serif",
                  color: "rgba(255,255,255,0.55)",
                  lineHeight: 1,
                }}>
                  {previewTotal}
                </span>
              </div>
            )}
          </div>

          {/* ── RIGHT: Editor 55% ── */}
          <Box sx={{ width: "55%", flexShrink: 0, display: "flex", flexDirection: "column", bgcolor: isDark ? "rgba(10,18,55,1)" : "#fff", overflow: "hidden", transition: "background .4s", backdropFilter: isDark ? "blur(20px)" : "none" }}>

            {/* Topbar */}
            <Box sx={{ px:2, height:54, bgcolor:isDark?"rgba(8,14,50,.98)":"#fff",
              borderBottom:isDark?"1px solid rgba(80,110,255,.1)":"1px solid #e8edf5",
              display:"flex", alignItems:"center", justifyContent:"space-between",
              flexShrink:0, gap:1,
              boxShadow:isDark?"0 2px 20px rgba(0,0,0,.4)":"0 1px 6px rgba(0,0,0,.06)" }}>

              {/* Logo */}
              <Stack direction="row" alignItems="center" spacing={0.875} sx={{ flexShrink:0 }}>
                <Box sx={{ width:30,height:30,borderRadius:1.75,background:"linear-gradient(135deg,#3d6bff,#6a92ff)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:14,flexShrink:0,boxShadow:"0 2px 10px rgba(61,107,255,.4)" }}>✦</Box>
                <Box>
                  <Typography sx={{ fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:800,fontSize:13,letterSpacing:"-.02em",color:isDark?"#e0eaff":"#111827",lineHeight:1.1 }}>ResumeAI</Typography>
                  <Box sx={{ display:"flex",alignItems:"center",gap:0.5 }}>
                    <Typography sx={{ fontSize:9,color:isDark?"rgba(160,185,255,.4)":"#9ca3af",maxWidth:120,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{fileName||"no file loaded"}</Typography>
                    {isPdf && <Box sx={{ fontSize:8,px:0.5,py:"1px",borderRadius:0.5,bgcolor:"rgba(6,182,212,.12)",color:"#06b6d4",border:"1px solid rgba(6,182,212,.25)",fontWeight:700,flexShrink:0 }}>PDF</Box>}
                    {editCount>0 && <Box sx={{ fontSize:8,px:0.5,py:"1px",borderRadius:0.5,fontWeight:700,flexShrink:0,bgcolor:isDark?"rgba(61,107,255,.14)":"rgba(37,99,235,.08)",color:isDark?"#7ca1ff":"#2563eb",border:isDark?"1px solid rgba(61,107,255,.28)":"1px solid rgba(37,99,235,.22)" }}>{editCount} edits</Box>}
                  </Box>
                </Box>
              </Stack>

              {/* Right actions — always visible */}
              <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexShrink:0 }}>
                <TBtn icon={<Ico.JD/>} label="JD Manager" hoverBg={isDark?"rgba(22,163,74,.12)":"#f0fdf4"} hoverColor={isDark?"#4ade80":"#15803d"} hoverBorder={isDark?"rgba(22,163,74,.3)":"#bbf7d0"} active={showJDManager} isNight={isDark} onClick={()=>{setShowJDManager(v=>!v);setShowMatchPanel(false);}}/>
                <TBtn icon={<Ico.Match/>} label="Match" hoverBg={isDark?"rgba(61,107,255,.15)":"#eff6ff"} hoverColor={isDark?"#fff":"#2563eb"} hoverBorder={isDark?"rgba(61,107,255,.35)":"#bfdbfe"} active={showMatchPanel} isNight={isDark} onClick={()=>{setShowMatchPanel(v=>!v);setShowJDManager(false);}}/>
                <Divider orientation="vertical" sx={{ height:16, borderColor:isDark?"rgba(60,90,200,.25)":"#e5e7eb" }}/>
                <TBtn icon={<Ico.Rst/>} label="Reset" hoverBg={isDark?"rgba(220,38,38,.12)":"#fef2f2"} hoverColor={isDark?"#f87171":"#dc2626"} hoverBorder={isDark?"rgba(220,38,38,.3)":"#fecaca"} isNight={isDark} onClick={resetDoc}/>
                <TBtn icon={shareLoading?<SpinnerEl size={10} color={isDark?"#a78bfa":"#7c3aed"}/>:<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>} label="Share" hoverBg={isDark?"rgba(124,58,237,.14)":"#f5f3ff"} hoverColor={isDark?"#fff":"#7c3aed"} hoverBorder={isDark?"rgba(167,139,250,.35)":"#ddd6fe"} isNight={isDark} onClick={handleShare}/>
                <TBtn icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="6" height="18" rx="1"/><rect x="9" y="3" width="6" height="18" rx="1"/><rect x="16" y="3" width="6" height="18" rx="1"/></svg>} label={compareMode?"Exit":"Compare"} active={compareMode} hoverBg={isDark?"rgba(22,163,74,.12)":"#f0fdf4"} hoverColor={isDark?"#4ade80":"#15803d"} hoverBorder={isDark?"rgba(22,163,74,.3)":"#bbf7d0"} isNight={isDark} onClick={()=>setCompareMode(v=>!v)}/>
                <Divider orientation="vertical" sx={{ height:16, borderColor:isDark?"rgba(60,90,200,.25)":"#e5e7eb" }}/>
                <Box onClick={()=>setIsDark(d=>!d)} sx={{ width:30,height:30,borderRadius:"50%",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,bgcolor:isDark?"rgba(255,230,80,.1)":"rgba(100,150,255,.07)",border:isDark?"1.5px solid rgba(255,220,80,.28)":"1.5px solid rgba(100,150,255,.2)",transition:"all .2s","&:hover":{transform:"scale(1.1)"} }}>
                  {isDark?<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="#ffe070" stroke="#ffd040" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>:<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="5" fill="#f59e0b" stroke="#d97706" strokeWidth="1.5"/><line x1="12" y1="2" x2="12" y2="5" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="19" x2="12" y2="22" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/><line x1="4.22" y1="4.22" x2="6.34" y2="6.34" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/><line x1="17.66" y1="17.66" x2="19.78" y2="19.78" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/><line x1="2" y1="12" x2="5" y2="12" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/><line x1="19" y1="12" x2="22" y2="12" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/></svg>}
                </Box>
                <DownloadDropdown onDocx={downloadDocx} onPdf={downloadPdf}/>
              </Stack>
            </Box>

          )}

            {/* ── Section nav + page ── */}
            {(() => {
              const sectionKeys   = Object.keys(grouped);
              const currentKey    = (activeSection && grouped[activeSection]) ? activeSection : (sectionKeys[0] || "");
              const currentIdx    = sectionKeys.indexOf(currentKey);
              const currentFields = grouped[currentKey] || [];
              const goTo = (k) => {
                setActiveSection(k);
                setAddingAfter(null);
                setEditingField(null);
                // Sync active page when navigating to a page section
                if (k.startsWith("__page_")) {
                  const sortedBrks = [...allPageBreaks].sort((a, b) => a - b);
                  const num = parseInt(k.replace("__page_", "").replace(/__/g, "")) - 1; // 0-based
                  if (sortedBrks[num] !== undefined) setPageWriterParaIdx(sortedBrks[num]);
                }
              };

              return (
                <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>

                  {/* ══ STEP PROGRESS BAR ══ */}
                  <Box sx={{ borderBottom: isDark ? "1px solid rgba(80,110,255,.1)" : "1px solid #e8edf5",
                    bgcolor: isDark ? "rgba(8,14,50,.98)" : "#fff", flexShrink: 0, overflowX: "auto",
                    "&::-webkit-scrollbar": { height: 3 },
                    "&::-webkit-scrollbar-thumb": { background: isDark ? "rgba(80,110,220,.35)" : "#e2e8f0", borderRadius: 99 } }}>
                    <Box sx={{ px: 3, pt: 2, pb: 0, minWidth: "max-content" }}>
                      <Box sx={{ position: "relative", display: "flex", alignItems: "center", mb: 1.1 }}>
                        {/* Track */}
                        <Box sx={{ position: "absolute", top: "50%", left: 0, right: 0, height: 2,
                          bgcolor: isDark ? "rgba(60,90,200,.25)" : "#e2e8f0",
                          borderRadius: 99, transform: "translateY(-50%)", zIndex: 0 }} />
                        {/* Fill */}
                        <Box sx={{ position: "absolute", top: "50%", left: 0, height: 2,
                          background: isDark ? "linear-gradient(90deg,#4a7aff,#7ca1ff)" : "linear-gradient(90deg,#2563eb,#60a5fa)",
                          borderRadius: 99, transform: "translateY(-50%)", zIndex: 1,
                          width: sectionKeys.length > 1 ? `${(currentIdx / (sectionKeys.length - 1)) * 100}%` : "0%",
                          transition: "width .45s cubic-bezier(.34,1.56,.64,1)",
                          boxShadow: isDark ? "0 0 8px rgba(124,161,255,.5)" : "none" }} />
                        {sectionKeys.map((k, idx) => {
                          const isActive = k === currentKey;
                          const isDone   = idx < currentIdx;
                          const sf = grouped[k] || [];
                          const allFilled = sf.filter(f => !f.isHeader).length > 0 && sf.filter(f => !f.isHeader && f.text?.trim()).length === sf.filter(f => !f.isHeader).length;
                          const showCheck = (isDone || allFilled) && !isActive;
                          return (
                            <Box key={k} onClick={() => goTo(k)} sx={{ position: "relative", zIndex: 2, flex: "1 0 auto", display: "flex", justifyContent: "center", cursor: "pointer" }}>
                              {k.startsWith("__page_") ? (
                                /* Page-section dot: diamond/page shape */
                                <Box sx={{ width: isActive ? 18 : 14, height: isActive ? 18 : 14, borderRadius: 1, bgcolor: isActive ? "#a78bfa" : (isDark ? "rgba(30,20,80,.7)" : "#f5f3ff"), border: isActive ? "2.5px solid #c4b5fd" : (isDark ? "2px solid rgba(120,80,220,.3)" : "2px solid #ddd6fe"), boxShadow: isActive ? "0 0 0 4px rgba(124,58,237,0.12)" : "none", transition: "all .2s", display: "flex", alignItems: "center", justifyContent: "center", transform: "rotate(45deg)" }}>
                                  {isActive && <Box sx={{ width: 5, height: 5, bgcolor: "#fff", borderRadius: 0.5 }} />}
                                </Box>
                              ) : (
                                <Box sx={{ width: isActive ? 16 : 12, height: isActive ? 16 : 12, borderRadius: "50%", bgcolor: isActive ? (isDark ? "#7ca1ff" : "#2563eb") : showCheck ? "#2563eb" : (isDark ? "rgba(20,35,90,.8)" : "#fff"), border: isActive ? (isDark ? "3px solid rgba(124,161,255,.4)" : "3px solid #bfdbfe") : showCheck ? "2.5px solid #93c5fd" : (isDark ? "2.5px solid rgba(80,110,220,.3)" : "2.5px solid #cbd5e1"), boxShadow: isActive ? "0 0 0 4px rgba(37,99,235,0.15)" : "none", transition: "all .2s", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  {showCheck && (<svg width="6" height="6" viewBox="0 0 8 8" fill="none"><polyline points="1.5,4 3.2,5.8 6.5,2" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>)}
                                </Box>
                              )}
                            </Box>
                          );
                        })}
                      </Box>
                      <Box sx={{ display: "flex" }}>
                        {sectionKeys.map((k) => {
                          const isActive = k === currentKey;
                          return (
                            <Box key={k} onClick={() => goTo(k)}
                              sx={{ flex: "1 0 auto", display: "flex", flexDirection: "column",
                                alignItems: "center", justifyContent: "center",
                                pb: 1.25, pt: 0.875, cursor: "pointer", position: "relative",
                                transition: "background .12s",
                                "&:hover": { bgcolor: isDark ? "rgba(100,130,255,.06)" : "#f8faff" } }}>
                              <Typography sx={{
                                fontSize: 12.5, fontWeight: isActive ? 700 : 500,
                                color: isActive
                                  ? (k.startsWith("__page_") ? "#a78bfa" : (isDark ? "#7ca1ff" : "#2563eb"))
                                  : (k.startsWith("__page_") ? (isDark ? "#7c5cbf" : "#a78bfa") : (isDark ? "rgba(160,190,255,.6)" : "#64748b")),
                                whiteSpace: "nowrap", transition: "color .15s",
                                fontFamily: "'Inter',sans-serif", letterSpacing: "-.01em" }}>
                                {getSectionLabel(k)}
                              </Typography>
                              {isActive && (
                                <Box sx={{ position: "absolute", bottom: 0, left: "10%", right: "10%",
                                  height: 2.5, borderRadius: "3px 3px 0 0",
                                  background: k.startsWith("__page_") ? "#a78bfa"
                                    : (isDark ? "linear-gradient(90deg,#4a7aff,#7ca1ff)" : "#2563eb"),
                                  boxShadow: isDark ? "0 0 8px rgba(124,161,255,.6)" : "none" }} />
                              )}
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>
                  </Box>

                  {/* Section page */}
                  {/* Read-only banner when Original variant is active */}
                  {variants.find(v=>v.id===activeVariantId)?.readOnly && (
                    <Box sx={{ mx:4, mt:2, mb:-1, px:2, py:1, borderRadius:2, bgcolor:"rgba(107,114,128,.08)", border:"1px solid rgba(107,114,128,.2)", display:"flex", alignItems:"center", gap:1 }}>
                      <Typography sx={{ fontSize:11, color:isDark?"#9ca3af":"#6b7280" }}>🔒</Typography>
                      <Typography sx={{ fontSize:11.5, fontWeight:600, color:isDark?"#9ca3af":"#6b7280" }}>Original — read-only. Switch to Variant 1 or 2 to edit.</Typography>
                    </Box>
                  )}
                  <Box sx={{ flex: 1, minHeight: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                    <SectionPage
                      key={currentKey}
                      sectionKey={currentKey}
                      fields={currentFields}
                      onSave={handleFieldSave}
                      undoHistories={undoHistories}
                      onPushUndo={pushUndo}
                      onPopUndo={popUndo}
                      isReadOnly={variants.find(v=>v.id===activeVariantId)?.readOnly||false}
                      onNextSection={currentIdx < sectionKeys.length - 1 ? () => goTo(sectionKeys[currentIdx + 1]) : null}
                      saving={saving}
                      sessionId={sessionId}
                      onAddLine={f => setAddingAfter(addingAfter?.id === f.id ? null : f)}
                      onDeleteLine={handleDeleteLine}
                      onDeleteField={handleDeleteField}
                      addingAfter={addingAfter}
                      setAddingAfter={setAddingAfter}
                      onAddLineSubmit={handleAddLine}
                      onAddPage={handleAddPage}
                      isLastSection={currentIdx === sectionKeys.length - 1}
                      onEditStart={f => setEditingField(f)}
                      onEditEnd={() => setEditingField(null)}
                      onAddContent={() => setShowPageWriter(true)}
                      onLinkSave={handleLinkSave}
                      onRelinkDone={(newFields) => { setFields(newFields); setEditCount(c => c+1); renderPreview(sessionId); showToast("Link restored ✓", "success"); }}
                      isDark={isDark}
                      hasPageBreak={!!sectionPageBreaks[currentKey]}
                      onMoveToNextPage={(enable) => handleMoveToNextPage(currentKey, fields, enable)}
                      onAddBlankLine={handleAddBlankLine}
                    />
                  </Box>

                  {/* Bottom nav bar */}
                  <Box sx={{ px: 4, py: 1.875, bgcolor: isDark ? "rgba(10,18,55,1)" : "#fff", borderTop: isDark ? "1.5px solid rgba(80,110,220,.2)" : "1.5px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                    <Stack direction="row" spacing={1} alignItems="center">

                      {/* ── Back ── */}
                      <Button
                        onClick={() => currentIdx > 0 && goTo(sectionKeys[currentIdx - 1])}
                        disabled={currentIdx === 0}
                        variant="outlined"
                        sx={{ borderRadius: 99, px: 2.25, py: 0.625, fontWeight: 600, fontSize: 12.5, textTransform: "none", borderColor: isDark ? "rgba(80,110,220,.3)" : "#e2e8f0", color: isDark ? "rgba(160,185,255,.7)" : "#64748b", minWidth: 0, bgcolor: "transparent", "&:hover": { borderColor: isDark ? "rgba(124,161,255,.5)" : "#2563eb", color: isDark ? "#ffffff" : "#2563eb", bgcolor: isDark ? "rgba(8,14,48,1)" : "#fff", boxShadow: isDark ? "0 4px 16px rgba(0,0,0,.4)" : "0 2px 8px rgba(37,99,235,.1)" }, "&.Mui-disabled": { opacity: .25 } }}
                      >
                        ← Back
                      </Button>

                      {/* ── Add Page (always visible) ── */}
                      <Button
                        onClick={handleAddPage}
                        variant="outlined"
                        startIcon={<Plus size={12} />}
                        sx={{ borderRadius: 99, px: 2, py: 0.625, fontWeight: 600, fontSize: 12, textTransform: "none", borderColor: isDark ? "rgba(139,92,246,.3)" : "#ddd6fe", color: isDark ? "#a78bfa" : "#7c3aed", bgcolor: "transparent", gap: 0.5, "&:hover": { borderColor: isDark ? "rgba(167,139,250,.6)" : "#7c3aed", color: isDark ? "#ffffff" : "#6d28d9", bgcolor: isDark ? "rgba(8,14,48,1)" : "#fff", boxShadow: isDark ? "0 4px 16px rgba(0,0,0,.4)" : "0 2px 8px rgba(124,58,237,.1)" } }}
                      >
                        Add Page
                      </Button>

                      {/* ── Page section controls: Add Content / Clear / Delete ── */}
                      {currentKey.startsWith("__page_") && !confirmClearPage && !confirmDeletePage && (
                        <Box sx={{ display: "flex", alignItems: "stretch", border: "1.5px solid #ede9fe", borderRadius: 99, overflow: "hidden", bgcolor: "#fdfcff", height: 34 }}>
                          <Box component="button" onClick={() => setShowPageWriter(true)}
                            sx={{ px: 1.75, display: "flex", alignItems: "center", gap: 0.75, border: "none", bgcolor: "transparent", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#7c3aed", fontFamily: "'Inter',sans-serif", borderRight: "1.5px solid #ede9fe", whiteSpace: "nowrap", transition: "background .12s", "&:hover": { bgcolor: isDark ? "rgba(8,14,48,1)" : "#fff", boxShadow: isDark ? "0 4px 16px rgba(0,0,0,.4)" : "0 2px 8px rgba(124,58,237,.1)" } }}>
                            <Plus size={12} /> Add Content
                          </Box>
                          <Box component="button" onClick={() => setConfirmClearPage(true)}
                            sx={{ px: 1.75, display: "flex", alignItems: "center", gap: 0.75, border: "none", bgcolor: "transparent", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#ef4444", fontFamily: "'Inter',sans-serif", borderRight: "1.5px solid #ede9fe", whiteSpace: "nowrap", transition: "background .12s", "&:hover": { bgcolor: isDark ? "rgba(8,14,48,1)" : "#fff", boxShadow: isDark ? "0 4px 16px rgba(0,0,0,.4)" : "0 2px 8px rgba(239,68,68,.08)" } }}>
                            <Trash2 size={12} /> Clear
                          </Box>
                          <Box component="button" onClick={() => setConfirmDeletePage(true)}
                            sx={{ px: 1.75, display: "flex", alignItems: "center", gap: 0.75, border: "none", bgcolor: "transparent", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#dc2626", fontFamily: "'Inter',sans-serif", whiteSpace: "nowrap", transition: "background .12s", "&:hover": { bgcolor: isDark ? "rgba(8,14,48,1)" : "#fff", boxShadow: isDark ? "0 4px 16px rgba(0,0,0,.4)" : "0 2px 8px rgba(220,38,38,.08)" } }}>
                            <Trash2 size={12} /> Delete Page
                          </Box>
                        </Box>
                      )}

                      {/* ── Page action group — shown only on NON-page sections ── */}
                      {pageWriterParaIdx >= 0 && !confirmClearPage && !confirmDeletePage && !currentKey.startsWith("__page_") && (() => {
                        const sortedBreaks = [...allPageBreaks].sort((a, b) => a - b);
                        const multiPage    = sortedBreaks.length > 1;

                        // Open the shared page-picker menu, tagging which action follows
                        const openPicker = (e, action) => {
                          setPendingAction(action);
                          setPagePickerEl(e.currentTarget);
                        };

                        // Single-page helpers (no picker needed)
                        const doWrite  = () => setShowPageWriter(true);
                        const doClear  = () => setConfirmClearPage(true);
                        const doDelete = () => setConfirmDeletePage(true);

                        return (
                          <>
                            {/* ── Shared page-picker Menu (Write / Clear / Delete) ── */}
                            <Menu
                              anchorEl={pagePickerEl}
                              open={Boolean(pagePickerEl)}
                              onClose={() => { setPagePickerEl(null); setPendingAction(null); }}
                              anchorOrigin={{ vertical: "top", horizontal: "left" }}
                              transformOrigin={{ vertical: "bottom", horizontal: "left" }}
                              PaperProps={{ sx: { mb: 0.5, borderRadius: 2.5, boxShadow: "0 8px 32px rgba(0,0,0,.14)", border: "1px solid #ede9fe", minWidth: 200, py: 0.75, overflow: "hidden" } }}
                            >
                              {/* Header */}
                              <Box sx={{ px: 2, pt: 0.5, pb: 1.25, borderBottom: "1px solid #f3f0ff" }}>
                                <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: ".06em" }}>
                                  {pendingAction === "write"  && "Write on which page?"}
                                  {pendingAction === "clear"  && "Clear which page?"}
                                  {pendingAction === "delete" && "Delete which page?"}
                                </Typography>
                              </Box>

                              {sortedBreaks.map((breakIdx, i) => {
                                const linesOnPage = fields.filter(f => {
                                  const next = sortedBreaks[i + 1] ?? Infinity;
                                  return f.source === "body" && f.paraIndex > breakIdx && f.paraIndex < next && !f.isHeader;
                                }).length;

                                return (
                                  <MenuItem
                                    key={breakIdx}
                                    onClick={() => {
                                      setPageWriterParaIdx(breakIdx);
                                      setPagePickerEl(null);
                                      // Fire the queued action for the chosen page
                                      if (pendingAction === "write")  setShowPageWriter(true);
                                      if (pendingAction === "clear")  setConfirmClearPage(true);
                                      if (pendingAction === "delete") setConfirmDeletePage(true);
                                      setPendingAction(null);
                                    }}
                                    sx={{ px: 2, py: 1, minHeight: 0, "&:hover": { bgcolor: "rgba(124,58,237,0.07)" } }}
                                  >
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, width: "100%" }}>
                                      {/* Page number badge */}
                                      <Box sx={{ width: 26, height: 26, borderRadius: 1.5, bgcolor: "#f5f3ff", border: "1.5px solid #ddd6fe", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                        <Typography sx={{ fontSize: 11.5, fontWeight: 800, color: "#7c3aed" }}>{i + 1}</Typography>
                                      </Box>
                                      <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
                                          Page {i + 1}
                                        </Typography>
                                        <Typography sx={{ fontSize: 11, color: "#9ca3af" }}>
                                          {linesOnPage === 0 ? "empty" : `${linesOnPage} line${linesOnPage !== 1 ? "s" : ""}`}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </MenuItem>
                                );
                              })}
                            </Menu>

                            {/* ── Pill ── */}
                            <Box sx={{ display: "flex", alignItems: "stretch", border: "1.5px solid #ede9fe", borderRadius: 99, overflow: "hidden", bgcolor: "#fdfcff", height: 34 }}>

                              {/* Write — shows picker first when multiple pages */}
                              <Box
                                component="button"
                                onClick={e => multiPage ? openPicker(e, "write") : doWrite()}
                                sx={{ px: 1.75, display: "flex", alignItems: "center", gap: 0.75, border: "none", bgcolor: "transparent", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#7c3aed", fontFamily: "'Inter',sans-serif", borderRight: "1.5px solid #ede9fe", whiteSpace: "nowrap", transition: "background .12s", "&:hover": { bgcolor: "rgba(124,58,237,0.09)" } }}
                              >
                                <Edit2 size={12} />
                                Write{multiPage && <ChevronDown size={9} style={{ marginLeft: 2, opacity: .7 }} />}
                              </Box>

                              {/* Clear — shows picker first when multiple pages */}
                              <Box
                                component="button"
                                onClick={e => multiPage ? openPicker(e, "clear") : doClear()}
                                sx={{ px: 1.75, display: "flex", alignItems: "center", gap: 0.75, border: "none", bgcolor: "transparent", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#ef4444", fontFamily: "'Inter',sans-serif", borderRight: "1.5px solid #ede9fe", whiteSpace: "nowrap", transition: "background .12s", "&:hover": { bgcolor: "rgba(239,68,68,0.07)" } }}
                              >
                                <Trash2 size={12} />
                                Clear{multiPage && <ChevronDown size={9} style={{ marginLeft: 2, opacity: .7 }} />}
                              </Box>

                              {/* Delete — shows picker first when multiple pages */}
                              <Box
                                component="button"
                                onClick={e => multiPage ? openPicker(e, "delete") : doDelete()}
                                sx={{ px: 1.75, display: "flex", alignItems: "center", gap: 0.75, border: "none", bgcolor: "transparent", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#dc2626", fontFamily: "'Inter',sans-serif", whiteSpace: "nowrap", transition: "background .12s", "&:hover": { bgcolor: "rgba(220,38,38,0.07)" } }}
                              >
                                <Trash2 size={12} />
                                Delete{multiPage && <ChevronDown size={9} style={{ marginLeft: 2, opacity: .7 }} />}
                              </Box>

                            </Box>
                          </>
                        );
                      })()}

                      {/* ── Clear confirm strip ── */}
                      {pageWriterParaIdx >= 0 && confirmClearPage && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, pl: 1.5, pr: 0.75, py: 0.375, borderRadius: 99, bgcolor: "#fff5f5", border: "1.5px solid #fecaca", animation: "fadeIn .15s ease" }}>
                          <Trash2 size={12} color="#ef4444" />
                          <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#ef4444", whiteSpace: "nowrap" }}>
                            {allPageBreaks.length > 1 ? `Clear Page ${[...allPageBreaks].sort((a,b)=>a-b).indexOf(pageWriterParaIdx)+1}?` : "Clear page content?"}
                          </Typography>
                          <Button size="small" onClick={() => setConfirmClearPage(false)}
                            sx={{ minWidth: 0, px: 1.25, py: 0.25, fontSize: 11, fontWeight: 500, color: "#94a3b8", textTransform: "none", borderRadius: 99 }}>
                            Cancel
                          </Button>
                          <Button size="small" onClick={handleClearPageBlock}
                            sx={{ minWidth: 0, px: 1.5, py: 0.375, fontSize: 11, fontWeight: 700, color: "#fff", textTransform: "none", borderRadius: 99, bgcolor: "#ef4444", "&:hover": { bgcolor: "#dc2626" } }}>
                            Clear
                          </Button>
                        </Box>
                      )}

                      {/* ── Delete page confirm strip ── */}
                      {pageWriterParaIdx >= 0 && confirmDeletePage && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, pl: 1.5, pr: 0.75, py: 0.375, borderRadius: 99, bgcolor: "#fff1f1", border: "1.5px solid #fca5a5", animation: "fadeIn .15s ease" }}>
                          <Trash2 size={12} color="#dc2626" />
                          <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#dc2626", whiteSpace: "nowrap" }}>
                            {allPageBreaks.length > 1 ? `Delete Page ${[...allPageBreaks].sort((a,b)=>a-b).indexOf(pageWriterParaIdx)+1}?` : "Delete this page?"}
                          </Typography>
                          <Button size="small" onClick={() => setConfirmDeletePage(false)}
                            sx={{ minWidth: 0, px: 1.25, py: 0.25, fontSize: 11, fontWeight: 500, color: "#94a3b8", textTransform: "none", borderRadius: 99 }}>
                            Cancel
                          </Button>
                          <Button size="small" onClick={handleDeletePage}
                            sx={{ minWidth: 0, px: 1.5, py: 0.375, fontSize: 11, fontWeight: 700, color: "#fff", textTransform: "none", borderRadius: 99, bgcolor: "#dc2626", "&:hover": { bgcolor: "#b91c1c" } }}>
                            Delete
                          </Button>
                        </Box>
                      )}

                    </Stack>
                    <Typography sx={{ fontSize: 11.5, color: isDark ? "rgba(130,160,255,.45)" : "#94a3b8", fontWeight: 500 }}>{currentIdx + 1} / {sectionKeys.length}</Typography>
                    {currentIdx < sectionKeys.length - 1 ? (
                      <Button onClick={() => goTo(sectionKeys[currentIdx + 1])} variant="contained"
                        sx={{ borderRadius: 99, px: 3.25, py: 0.75, fontWeight: 700, fontSize: 13, textTransform: "none", background: isDark ? "linear-gradient(135deg,#3d6bff,#6a92ff)" : "linear-gradient(135deg,#2563eb,#3b82f6)", boxShadow: isDark ? "0 4px 18px rgba(61,107,255,.45)" : "0 4px 14px rgba(37,99,235,.28)", "&:hover": { boxShadow: isDark ? "0 6px 26px rgba(61,107,255,.6)" : "0 6px 20px rgba(37,99,235,.38)", filter: "brightness(1.1)" } }}>
                        Next: {getSectionLabel(sectionKeys[currentIdx + 1])} →
                      </Button>
                    ) : (
                      <Button onClick={downloadDocx} variant="contained" color="success"
                        sx={{ borderRadius: 99, px: 3.25, py: 0.75, fontWeight: 700, fontSize: 13, textTransform: "none", background: "linear-gradient(135deg,#16a34a,#22c55e)", boxShadow: isDark ? "0 4px 18px rgba(22,163,74,.4)" : "0 4px 14px rgba(22,163,74,.28)", "&:hover": { boxShadow: isDark ? "0 6px 26px rgba(22,163,74,.55)" : "0 6px 20px rgba(22,163,74,.38)", filter: "brightness(1.08)" } }}>
                        Download ↓
                      </Button>
                    )}
                  </Box>

                </Box>
              );
            })()}
          </Box>

        </Box>
        </>
      )}

      {appView === "editor" && (
        <Box onClick={() => setShowAIChat(v => !v)} title="AI Resume Coach"
          sx={{ position:"fixed",bottom:28,right:28,zIndex:250,
            width:52,height:52,borderRadius:"50%",
            background:showAIChat?"linear-gradient(135deg,#5b21b6,#7c3aed)":"linear-gradient(135deg,#7c3aed,#a855f7)",
            boxShadow:showAIChat?"0 4px 20px rgba(124,58,237,.6),0 0 0 4px rgba(124,58,237,.2)":"0 4px 20px rgba(124,58,237,.45)",
            display:"flex",alignItems:"center",justifyContent:"center",
            cursor:"pointer",transition:"all .2s",
            "&:hover":{ transform:"scale(1.1)",boxShadow:"0 6px 28px rgba(124,58,237,.65)" } }}>
          {showAIChat ? <X size={20} color="#fff" /> : <Sparkles size={20} color="#fff" />}
        </Box>
      )}
    </ThemeProvider>
  );
}
