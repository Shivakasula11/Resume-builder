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
  Activity, Layers, Eye, ChevronDown, ChevronUp
} from "lucide-react";

const API_BASE = "http://localhost:8000";

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
*{box-sizing:border-box}
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
function LandingNav({ onLogoClick }) {
  return (
    <Box component="nav" sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1.5, sm: 2 }, borderBottom: "1px solid", borderColor: "divider", bgcolor: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 50 }}>
      <Box sx={{ maxWidth: 1200, mx: "auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer", "&:hover .logo-icon": { transform: "rotate(12deg)" } }} onClick={onLogoClick}>
          <Box className="logo-icon" sx={{ width: { xs: 32, sm: 40 }, height: { xs: 32, sm: 40 }, bgcolor: "primary.main", borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(37,99,235,0.3)", transition: "transform 0.3s ease" }}>
            <Sparkles size={20} color="#fff" />
          </Box>
          <Typography sx={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: { xs: 16, sm: 20 }, color: "text.primary", letterSpacing: "-0.02em" }}>ResumeAI</Typography>
        </Box>
      </Box>
    </Box>
  );
}

function HeroStep({ onNext }) {
  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, sm: 3, lg: 4 }, py: { xs: 6, sm: 10, lg: 16 }, display: "flex", flexDirection: { xs: "column", lg: "row" }, alignItems: "center", gap: { xs: 6, lg: 12 }, animation: "fadeUp .6s ease" }}>
      <Box sx={{ flex: 1, textAlign: { xs: "center", lg: "left" } }}>
        <Chip icon={<Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#16a34a", animation: "pulse 2s infinite", ml: 0.5, flexShrink: 0 }} />} label="48,834 resumes created today"
          sx={{ bgcolor: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", fontWeight: 600, fontSize: 12, mb: 3 }} />
        <Typography variant="h1" sx={{ fontSize: { xs: "2.5rem", sm: "3.5rem", lg: "4.5rem" }, lineHeight: 1.08, mb: 3, color: "text.primary" }}>
          Create your CV with an{" "}<Box component="br" sx={{ display: { xs: "none", sm: "block" } }} />
          <Box component="span" sx={{ color: "primary.main" }}>AI-powered CV maker</Box>
        </Typography>
        <Typography sx={{ fontSize: { xs: 15, sm: 17, lg: 19 }, color: "text.secondary", maxWidth: 480, mx: { xs: "auto", lg: 0 }, mb: 4, lineHeight: 1.7 }}>
          The first step to a better job? A better CV. Only 2% of CVs win, and yours will be one of them.
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent={{ xs: "center", lg: "flex-start" }} alignItems="center" sx={{ mb: 5 }}>
          <Button variant="contained" size="large" endIcon={<ChevronRight size={18} style={{ transition: "transform .2s" }} />} onClick={onNext}
            sx={{ px: 4, py: 1.5, fontSize: 16, borderRadius: 3, boxShadow: "0 4px 20px rgba(37,99,235,0.35)", "&:hover": { boxShadow: "0 6px 28px rgba(37,99,235,0.45)", "& svg": { transform: "translateX(4px)" } }, width: { xs: "100%", sm: "auto" } }}>
            Create Resume
          </Button>
          <Stack direction="row" spacing={2} alignItems="center">
            <Stack direction="row" spacing={0.5} alignItems="center"><ShieldCheck size={15} color="#16a34a" /><Typography sx={{ fontSize: 13, color: "text.secondary", fontWeight: 500 }}>ATS Friendly</Typography></Stack>
            <Stack direction="row" spacing={0.5} alignItems="center"><Clock size={15} color="#2563eb" /><Typography sx={{ fontSize: 13, color: "text.secondary", fontWeight: 500 }}>5 Min Setup</Typography></Stack>
          </Stack>
        </Stack>
        <Stack direction="row" spacing={{ xs: 4, sm: 8 }} justifyContent={{ xs: "center", lg: "flex-start" }} sx={{ pt: 4, borderTop: "1px solid", borderColor: "divider" }}>
          {[{ val: "48%", desc: "more likely to get hired" }, { val: "12%", desc: "better pay with next job" }].map(stat => (
            <Box key={stat.val}>
              <Typography sx={{ fontSize: { xs: 22, sm: 28 }, fontWeight: 800, color: "text.primary", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{stat.val}</Typography>
              <Typography sx={{ fontSize: 12, color: "text.secondary" }}>{stat.desc}</Typography>
            </Box>
          ))}
        </Stack>
      </Box>
      <Box sx={{ flex: 1, position: "relative", width: "100%", maxWidth: { xs: 440, lg: "none" } }}>
        <Paper elevation={0} sx={{ borderRadius: 4, p: { xs: 3, sm: 4 }, position: "relative", zIndex: 1, overflow: "hidden", border: "1px solid", borderColor: "divider", background: "linear-gradient(145deg,#fff 0%,#f8faff 100%)" }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
            <Box sx={{ width: { xs: 48, sm: 60 }, height: { xs: 48, sm: 60 }, borderRadius: 3, overflow: "hidden", border: "3px solid #fff", boxShadow: "0 4px 14px rgba(0,0,0,.12)", flexShrink: 0 }}>
              <img src="https://picsum.photos/seed/resume/200" alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} referrerPolicy="no-referrer" />
            </Box>
            <Box><Typography sx={{ fontWeight: 700, fontSize: { xs: 15, sm: 18 }, color: "text.primary" }}>Samantha Williams</Typography><Typography sx={{ fontSize: 13, color: "text.secondary" }}>Senior Data Analyst</Typography></Box>
          </Stack>
          <Stack spacing={1.5} sx={{ mb: 3 }}>{[0.75, 1, 0.83].map((w, i) => <Box key={i} sx={{ height: { xs: 10, sm: 13 }, bgcolor: "#f1f5f9", borderRadius: 99, width: `${w * 100}%` }} />)}</Stack>
          <Box sx={{ pt: 3, borderTop: "1px solid", borderColor: "divider" }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}><Zap size={14} color="#2563eb" fill="#2563eb" /><Typography sx={{ fontSize: 11, fontWeight: 700, color: "primary.main", letterSpacing: ".08em", textTransform: "uppercase" }}>AI Enhancement Active</Typography></Stack>
            <Box sx={{ bgcolor: "#eff6ff", p: { xs: 1.5, sm: 2 }, borderRadius: 2.5, border: "1px solid #bfdbfe" }}>
              <Typography sx={{ fontSize: { xs: 12, sm: 13 }, color: "text.secondary", lineHeight: 1.6 }}>"Optimized your experience section by highlighting 3 key technical achievements that match top-tier job descriptions."</Typography>
            </Box>
          </Box>
          <Box sx={{ position: "absolute", bottom: -40, right: -40, width: 160, height: 160, bgcolor: "rgba(37,99,235,0.06)", borderRadius: "50%", filter: "blur(40px)" }} />
        </Paper>
        <Box sx={{ display: { xs: "none", sm: "flex" }, position: "absolute", top: -18, right: -18, width: 80, height: 80, bgcolor: "#fff", borderRadius: 3, boxShadow: "0 8px 30px rgba(0,0,0,.12)", border: "1px solid #f1f5f9", transform: "rotate(12deg)", zIndex: 2, alignItems: "center", justifyContent: "center" }}>
          <Box sx={{ width: "75%", height: "75%", bgcolor: "#f0fdf4", borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center" }}><CheckCircle2 size={28} color="#16a34a" /></Box>
        </Box>
      </Box>
    </Box>
  );
}

function ChoiceStep({ onUpload, onBack }) {
  return (
    <Box sx={{ maxWidth: 500, mx: "auto", px: 2, py: { xs: 8, sm: 16 }, textAlign: "center", animation: "fadeUp .5s ease" }}>
      <Typography variant="h2" sx={{ fontSize: { xs: "1.8rem", sm: "2.4rem" }, mb: { xs: 5, sm: 8 }, color: "text.primary" }}>How will you make your resume?</Typography>
      <Paper elevation={0} onClick={onUpload} sx={{ p: { xs: 3, sm: 4 }, border: "1.5px solid", borderColor: "divider", borderRadius: 4, cursor: "pointer", textAlign: "left", mb: 3, transition: "all .2s", "&:hover": { borderColor: "primary.main", boxShadow: "0 8px 40px rgba(37,99,235,0.1)", transform: "translateY(-2px)" } }}>
        <Box sx={{ width: { xs: 50, sm: 60 }, height: { xs: 50, sm: 60 }, bgcolor: "#eff6ff", borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center", mb: 3 }}><Upload size={28} color="#2563eb" /></Box>
        <Typography sx={{ fontWeight: 700, fontSize: 18, color: "text.primary", mb: 1 }}>I already have a resume</Typography>
        <Typography sx={{ color: "text.secondary", fontSize: { xs: 13, sm: 15 }, lineHeight: 1.6 }}>Upload your existing resume to make quick edits and AI optimizations.</Typography>
      </Paper>
      <Button startIcon={<ArrowLeft size={15} />} onClick={onBack} sx={{ color: "text.disabled", fontWeight: 500 }}>Go Back</Button>
    </Box>
  );
}

function UploadStep({ onBack, onFile, uploading }) {
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);
  return (
    <Box sx={{ maxWidth: 600, mx: "auto", px: 2, py: { xs: 8, sm: 12 }, animation: "fadeUp .5s ease" }}>
      <Button startIcon={<ArrowLeft size={15} />} onClick={onBack} sx={{ mb: 3, color: "primary.main", fontWeight: 700 }}>Go Back</Button>
      <Paper elevation={0}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); onFile(e.dataTransfer?.files?.[0]); }}
        sx={{ border: "2px dashed", borderColor: dragOver ? "primary.main" : "divider", borderRadius: 5, p: { xs: 6, sm: 10 }, textAlign: "center", cursor: "pointer", transition: "all .25s", bgcolor: dragOver ? alpha("#2563eb", 0.04) : "background.paper", transform: dragOver ? "scale(1.02)" : "scale(1)", boxShadow: dragOver ? "0 0 0 4px rgba(37,99,235,0.1)" : "0 4px 24px rgba(0,0,0,0.06)", "&:hover": { borderColor: "primary.light", bgcolor: alpha("#2563eb", 0.02) } }}
        onClick={() => !uploading && fileRef.current?.click()}>
        <input ref={fileRef} type="file" accept=".pdf,.docx" style={{ display: "none" }} onChange={e => onFile(e.target.files?.[0])} />
        {uploading ? (
          <Stack spacing={2} alignItems="center"><CircularProgress size={36} /><Typography sx={{ fontWeight: 700, color: "primary.main", fontSize: 16 }}>Processing your resume…</Typography></Stack>
        ) : (
          <Stack spacing={2.5} alignItems="center">
            <Box sx={{ width: 64, height: 64, bgcolor: "#f9fafb", border: "1.5px solid #e5e7eb", borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", animation: "float 4s ease-in-out infinite" }}><FileText size={28} strokeWidth={1.2} /></Box>
            <Box><Typography sx={{ fontWeight: 700, fontSize: 18, color: "text.primary", mb: 0.5 }}>Drag and drop your resume here</Typography><Typography sx={{ fontSize: 13, color: "text.disabled" }}>Supported formats: PDF, DOCX</Typography></Box>
            <Typography sx={{ color: "text.disabled", fontWeight: 500 }}>or</Typography>
            <Button variant="contained" sx={{ px: 5, py: 1.3, borderRadius: 2.5, boxShadow: "0 4px 14px rgba(37,99,235,0.3)" }}>Upload from device</Button>
          </Stack>
        )}
      </Paper>
    </Box>
  );
}

function ProcessingStep({ progress }) {
  const r = 45; const circ = 2 * Math.PI * r;
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", px: 2, textAlign: "center", gap: { xs: 4, sm: 6 }, animation: "fadeIn .4s ease" }}>
      <Box sx={{ position: "relative", width: { xs: 96, sm: 128 }, height: { xs: 96, sm: 128 } }}>
        <svg style={{ width: "100%", height: "100%" }} viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="none" stroke="#f1f5f9" strokeWidth="6" />
          <circle cx="50" cy="50" r={r} fill="none" stroke="#2563eb" strokeWidth="6" strokeDasharray={circ} strokeDashoffset={circ - (circ * progress) / 100} strokeLinecap="round" style={{ transformOrigin: "center", transform: "rotate(-90deg)", transition: "stroke-dashoffset .1s linear" }} />
        </svg>
        <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Typography sx={{ color: "primary.main", fontWeight: 800, fontSize: { xs: 18, sm: 22 } }}>{progress}%</Typography>
        </Box>
      </Box>
      <Box>
        <Typography variant="h2" sx={{ fontSize: { xs: "2rem", sm: "2.8rem" }, mb: 2, color: "text.primary" }}>Processing.</Typography>
        <Typography sx={{ fontSize: { xs: 13, sm: 16 }, color: "text.secondary", maxWidth: 420, mx: "auto", lineHeight: 1.7 }}>Please wait while our AI processes the information from your resume and selects the right fields</Typography>
      </Box>
    </Box>
  );
}

function SuccessStep({ fileName, onEdit }) {
  return (
    <Box sx={{ maxWidth: 560, mx: "auto", px: 2, py: { xs: 8, sm: 16 }, textAlign: "center", animation: "fadeUp .5s ease" }}>
      <Box sx={{ width: { xs: 72, sm: 88 }, height: { xs: 72, sm: 88 }, bgcolor: "#f0fdf4", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 4 }}><CheckCircle2 size={44} color="#16a34a" /></Box>
      <Typography variant="h2" sx={{ fontSize: { xs: "1.8rem", sm: "2.4rem" }, mb: 2, color: "text.primary" }}>Upload Successful!</Typography>
      <Typography sx={{ fontSize: { xs: 14, sm: 16 }, color: "text.secondary", lineHeight: 1.7, mb: 5 }}>Your resume has been analyzed. We've extracted your experience, skills, and education to build your AI-optimized CV.</Typography>
      <Paper elevation={0} sx={{ p: { xs: 2, sm: 2.5 }, border: "1.5px solid", borderColor: "divider", borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "space-between", mb: 4, cursor: "pointer", transition: "all .2s", "&:hover": { borderColor: "primary.main", bgcolor: alpha("#2563eb", 0.02) } }} onClick={onEdit}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box sx={{ width: { xs: 40, sm: 48 }, height: { xs: 40, sm: 48 }, bgcolor: "#eff6ff", borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><FileDown size={22} color="#2563eb" /></Box>
          <Box sx={{ textAlign: "left" }}><Typography sx={{ fontWeight: 700, color: "text.primary", fontSize: { xs: 13, sm: 14 } }}>{fileName || "resume_optimized.docx"}</Typography><Typography sx={{ color: "text.disabled", fontSize: 12 }}>Ready for editing</Typography></Box>
        </Stack>
        <Box sx={{ p: 1, bgcolor: "#f9fafb", borderRadius: "50%", display: "flex" }}><ChevronRight size={18} /></Box>
      </Paper>
      <Button variant="outlined" size="large" startIcon={<Edit2 size={18} />} onClick={onEdit}
        sx={{ px: 4, py: 1.5, borderRadius: 3, fontSize: 15, width: "100%", borderWidth: 1.5, "&:hover": { borderWidth: 1.5, bgcolor: alpha("#2563eb", 0.04) } }}>
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

function InlineEditor({ field, sc, saving, onApply, onCancel, onDelete, initialSegments = null }) {
  const ref      = useRef(null);
  const colorRef = useRef(null);
  const rangeRef = useRef(null);
  const [fmt, setFmt] = useState({ bold: false, italic: false, underline: false, strike: false });
  const [align, setAlign] = useState("left");
  const [lastFont, setLastFont] = useState(() => loadFontMemory().fontFamily || "");
  const [lastSize, setLastSize] = useState(() => loadFontMemory().fontSize ? loadFontMemory().fontSize.replace("pt", "") : "");
  const [lineSpacing, setLineSpacing] = useState("");

  useEffect(() => {
    if (!ref.current) return;
    const esc = t => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    if (initialSegments && initialSegments.length > 0) {
      const html = initialSegments.map(s => {
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
    ensureSelection(); document.execCommand("fontName", false, val);
    if (sel.rangeCount > 0) rangeRef.current = sel.getRangeAt(0).cloneRange();
    saveFontMemory(val, null); setLastFont(val);
  };
  const applySize = val => {
    if (!val) return;
    ref.current?.focus();
    const sel = window.getSelection();
    if (rangeRef.current) { sel.removeAllRanges(); sel.addRange(rangeRef.current); }
    ensureSelection();
    const PT_SCALE = { "8": 1, "9": 1, "10": 2, "11": 2, "12": 3, "14": 4, "16": 4, "18": 5, "20": 5, "22": 6, "24": 6, "28": 7, "32": 7, "36": 7 };
    document.execCommand("fontSize", false, PT_SCALE[val] || 3);
    if (sel.rangeCount > 0) rangeRef.current = sel.getRangeAt(0).cloneRange();
    saveFontMemory(null, val + "pt"); setLastSize(val);
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
    if (e.key === "Escape") onCancel();
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); apply(); }
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
      </div>
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

  // Detect whether section uses plain-text bullet chars vs Word list formatting (numPr)
  const TEXT_BULLET_RE = /^(–\s|•\s|▪\s|›\s|→\s)/;
  const hasTextBullets = [field, ...sectionFields].some(f => TEXT_BULLET_RE.test(f.text || ""));

  const [bullet, setBullet] = useState(() => {
    // No text-based bullets found → section uses Word list bullets → default to None
    // We'll inherit the list format from the backend instead
    if (!hasTextBullets) return "";
    // Text bullets found → find which one is in use
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
    if (!bullet) {
      // No text bullet — ask backend to inherit list/bullet formatting from source paragraph
      onAdd(field, { segments: segs, inherit_list_format: true });
      return;
    }
    // Text bullet selected — prepend it; don't inherit Word list format (would double-bullet)
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
      <InlineEditor field={stub} sc="#2563eb" saving={adding} onApply={handleApply} onCancel={onCancel} onDelete={onCancel} />
    </Box>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   FIELD ROW
══════════════════════════════════════════════════════════════════════ */
function FieldRow({ field, onSave, onAddLine, onDeleteLine, onDeleteField, saving, onReplaceImage, onEditBar, sessionId }) {
  const [editing, setEditing]       = useState(false);
  const [value, setValue]           = useState(field.text);
  const [hovered, setHovered]       = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [fieldSegs, setFieldSegs]   = useState(null);
  const [segsLoading, setSegsLoading] = useState(false);
  const imgRef  = useRef(null);
  const sparkle = useSparkle();
  const sc       = field.section?.color || "#2563eb";
  const mod      = field.text !== field.originalText;
  const isInserted = field.isInserted || false;
  const hasValue   = !!(field.text && field.text.trim());

  useEffect(() => { setValue(field.text); }, [field.text]);
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

  const save   = (e) => { if (value.trim() && value !== field.text) { onSave(field, value.trim() || field.text, null); if (e) sparkle(e.clientX || 200, e.clientY || 200, sc); } setEditing(false); };
  const cancel = () => { setValue(field.text); setEditing(false); };

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
        <Typography onClick={() => setEditing(true)} sx={{ fontSize: 10, fontWeight: 700, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.1em", flex: 1, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{field.text}</Typography>
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
        onApply={(segs, paraFmt) => { onSave(field, segs, null, paraFmt); setEditing(false); }}
        onCancel={cancel}
        onDelete={() => { setEditing(false); setConfirmDel(true); }} />
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
  ].filter(Boolean).join(" ");

  return (
    <Box
      className={cardCls}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => setEditing(true)}
      sx={{ opacity: saving ? .5 : 1, mb: 1, userSelect: "none" }}
    >
      <Box sx={{ px: 2, pt: 1.375, pb: 1.5, position: "relative", minHeight: 60 }}>
        {fieldLabel && (
          <Typography sx={{
            fontSize: 10.5, fontWeight: 600, mb: 0.5, letterSpacing: ".01em",
            color: mod ? "#2563eb" : isInserted ? "#16a34a" : "#94a3b8",
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
            color: hasValue ? (field.type === "icon-link" ? "#2563eb" : "#111827") : "#c1c8d4",
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
            opacity: hovered ? 1 : 0,
            transition: "opacity .15s",
            pointerEvents: hovered ? "auto" : "none",
          }}>
            {!isInserted && (
              <Tooltip title="Add line below" placement="top">
                <Box component="button"
                  onMouseDown={e => { e.stopPropagation(); e.preventDefault(); onAddLine(field); }}
                  sx={{
                    width: 24, height: 24, borderRadius: 1, border: "1px solid #e5e7eb",
                    bgcolor: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", color: "#9ca3af", flexShrink: 0,
                    "&:hover": { borderColor: "#2563eb", color: "#2563eb", bgcolor: "#eff6ff" },
                    transition: "all .12s",
                  }}>
                  <Plus size={11} />
                </Box>
              </Tooltip>
            )}
            <Tooltip title="Delete" placement="top">
              <Box component="button"
                onMouseDown={e => { e.stopPropagation(); e.preventDefault(); setConfirmDel(true); }}
                sx={{
                  width: 24, height: 24, borderRadius: 1, border: "1px solid rgba(220,38,38,0.25)",
                  bgcolor: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: "#ef4444", flexShrink: 0,
                  "&:hover": { bgcolor: "rgba(220,38,38,0.06)" },
                  transition: "all .12s",
                }}>
                <Trash2 size={11} />
              </Box>
            </Tooltip>
            <Tooltip title="Edit" placement="top">
              <Box sx={{
                width: 24, height: 24, borderRadius: 1, border: "1px solid rgba(37,99,235,0.3)",
                bgcolor: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center",
                color: "#2563eb", flexShrink: 0,
              }}>
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
            opacity: hovered ? 0 : 1,
            transition: "opacity .15s",
            pointerEvents: "none",
          }}>
            {hasValue
              ? <Check size={12} color="#fff" strokeWidth={3} />
              : <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: "#cbd5e1" }} />
            }
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   SECTION PAGE
══════════════════════════════════════════════════════════════════════ */
const SECTION_META = {
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

// ── FIX: added onAddLineSubmit prop ──────────────────────────────────
function SectionPage({ sectionKey, fields, onSave, saving, sessionId, onAddLine, onDeleteLine, onDeleteField, addingAfter, setAddingAfter, onAddLineSubmit }) {
  const meta = SECTION_META[sectionKey.toLowerCase()] || SECTION_META.other;
  const nonHeaderFields = fields.filter(f => !f.isHeader);
  const filledCount = nonHeaderFields.filter(f => f.text && f.text.trim()).length;
  const totalCount  = nonHeaderFields.length;
  const pct = totalCount > 0 ? Math.round(filledCount / totalCount * 100) : 100;

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      <Box sx={{ px: 4, pt: 3.5, pb: 2.5, flexShrink: 0 }}>
        <Typography sx={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 900, fontSize: 28, letterSpacing: "-.03em", color: "#0f172a", lineHeight: 1.15, mb: 0.875 }}>
          {meta.label}
        </Typography>
        <Typography sx={{ fontSize: 14, color: "#64748b", lineHeight: 1.6, maxWidth: 560 }}>{meta.desc}</Typography>
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
      <Divider sx={{ mx: 4, borderColor: "#f1f5f9" }} />
      <Box sx={{ flex: 1, overflowY: "auto", px: 4, py: 2.5, pb: 6 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1.5 }}>
          {fields.map(f => {
            const isWide = f.isHeader || (f.text && f.text.length > 55) || f.type === "progress-bar" || f.type === "image" || (f.format && ["SUMMARY","OBJECTIVE","BIO","DESCRIPTION","BULLET"].includes(f.format.toUpperCase()));
            return (
              <Box key={f.id} sx={{ gridColumn: isWide ? "1 / -1" : "auto" }}>
                <FieldRow field={f} onSave={onSave} saving={saving} sessionId={sessionId}
                  onAddLine={x => setAddingAfter(addingAfter?.id === x.id ? null : x)}
                  onDeleteLine={onDeleteLine} onDeleteField={onDeleteField}
                  onReplaceImage={() => {}} onEditBar={() => {}} />
                {addingAfter?.id === f.id && (
                  <Box sx={{ mt: 0.5 }}>
                    {/* ── FIX: use onAddLineSubmit + pass sectionFields for bullet detection ── */}
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
function TBtn({ icon, label, hoverBg, hoverColor, hoverBorder, active, onClick }) {
  const [hov, setHov] = useState(false);
  const on = active || hov;
  return (
    <RippleBtn variant="ghost" onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: on ? hoverBg : "transparent", color: on ? hoverColor : "#374151", borderColor: on ? hoverBorder : "#e5e7eb", transition: "all .2s" }}>
      <span style={{ display: "inline-flex", alignItems: "center" }}>{icon}</span> {label}
    </RippleBtn>
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
   MATCH PANEL
══════════════════════════════════════════════════════════════════════ */
function MatchPanel({ sessionId, onClose, showToast }) {
  const [role, setRole] = useState(""); const [level, setLevel] = useState("fresher"); const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false); const [result, setResult] = useState(null); const [dlLoading, setDlLoading] = useState(false); const [expandedJD, setExpandedJD] = useState(null);
  const sparkle = useSparkle();
  useEffect(() => { fetchRoles(); }, []);
  const fetchRoles = async () => { try { const r = await fetch(`${API_BASE}/ai/jd/roles`); const d = await r.json(); setRoles(d.roles || []); } catch {} };
  const runMatch = async () => {
    if (!role.trim()) { showToast("Select a role first", "error"); return; }
    setLoading(true); setResult(null);
    try {
      const r = await fetch(`${API_BASE}/ai/compare`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ session_id: sessionId, role: role.trim(), level, force_refresh: false }) });
      const d = await r.json();
      if (!r.ok || d.detail || d.error) showToast(d.detail || d.error || `Error ${r.status}`, "error");
      else { setResult(d); showToast("Match complete ✓", "success"); }
    } catch (e) { showToast(`Failed: ${e.message}`, "error"); }
    setLoading(false);
  };
  const downloadReport = async (e) => {
    if (!result) return; setDlLoading(true);
    try {
      const r = await fetch(`${API_BASE}/ai/compare-report`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ session_id: sessionId, role: role.trim(), level }) });
      if (!r.ok) { showToast("PDF generation failed", "error"); setDlLoading(false); return; }
      const blob = await r.blob(); const url = URL.createObjectURL(blob); const a = document.createElement("a");
      a.href = url; a.download = `resume_vs_${role.replace(/\s+/g, "_")}_report.pdf`; a.click(); URL.revokeObjectURL(url);
      showToast("Report downloaded", "success"); sparkle(e.clientX, e.clientY, "#22c55e");
    } catch { showToast("Download failed", "error"); }
    setDlLoading(false);
  };
  const score = result?.overall_score ?? 0;
  const inputSx = { mb: 1, "& .MuiOutlinedInput-root": { bgcolor: "#f5f6fa", fontSize: 12, borderRadius: 1.5 } };
  return (
    <>
      <div className="panel-overlay" onClick={onClose} />
      <div className="side-panel">
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: "16px 20px", borderBottom: "1px solid #e5e7eb", flexShrink: 0 }}>
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Box sx={{ width: 32, height: 32, borderRadius: 2, background: "linear-gradient(135deg,#2563eb,#3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}><Ico.Match /></Box>
            <Box><Typography sx={{ fontSize: 14, fontWeight: 700 }}>Resume Match</Typography><Typography sx={{ fontSize: 10, color: "text.disabled" }}>ATS Score vs Real JDs</Typography></Box>
          </Stack>
          <RippleBtn variant="ghost" onClick={onClose} style={{ padding: "4px 8px" }}><Ico.X /></RippleBtn>
        </Stack>
        <Box sx={{ flex: 1, overflowY: "auto", p: "16px 20px" }}>
          <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
            <TextField select label="Role" size="small" value={role} onChange={e => setRole(e.target.value)} sx={{ flex: 1, ...inputSx }} SelectProps={{ displayEmpty: true }}>
              <MenuItem value=""><em>Select role…</em></MenuItem>
              {roles.map(r => <MenuItem key={`${r.role}-${r.level}`} value={r.role}>{r.role} — {r.jd_count} JDs</MenuItem>)}
            </TextField>
            <TextField select label="Level" size="small" value={level} onChange={e => setLevel(e.target.value)} sx={{ width: 100, ...inputSx }}>
              <MenuItem value="fresher">Fresher</MenuItem><MenuItem value="experienced">Experienced</MenuItem>
            </TextField>
          </Stack>
          {roles.length === 0 && <Box sx={{ p: "10px 14px", bgcolor: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.3)", borderRadius: 2, fontSize: 11, color: "#ef4444", mb: 1.5 }}>No JDs stored yet — add some via <strong>JD Manager</strong>.</Box>}
          <RippleBtn variant="accent" onClick={runMatch} disabled={loading || !role} style={{ width: "100%", justifyContent: "center", padding: "10px", marginBottom: 16 }}>
            {loading ? <><SpinnerEl size={12} color="#fff" /> Analyzing…</> : <><Ico.Match /> Run Match</>}
          </RippleBtn>
          {result && (
            <Stack spacing={1.75}>
              <Paper elevation={0} sx={{ bgcolor: "#f9fafb", borderRadius: 2, border: "1px solid #e5e7eb", p: "20px", display: "flex", gap: 2, alignItems: "center" }}>
                <ScoreRing score={Math.round(score)} size={90} />
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: 12, color: "text.disabled", mb: 0.5 }}>Average Match Score</Typography>
                  <Typography sx={{ fontSize: 22, fontWeight: 800, color: "#16a34a", mb: 0.5 }}>{score}%</Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <PillEl bg="rgba(22,163,74,0.08)" color="#22c55e" border="rgba(22,163,74,0.3)">Best: {result.max_score}%</PillEl>
                    <PillEl bg="rgba(220,38,38,0.08)" color="#ef4444" border="rgba(220,38,38,0.3)">Worst: {result.min_score}%</PillEl>
                    <PillEl>{result.total_jds} JDs</PillEl>
                  </Stack>
                </Box>
              </Paper>
              {result.common_matched?.length > 0 && (
                <Paper elevation={0} sx={{ bgcolor: "#f9fafb", borderRadius: 2, border: "1px solid #e5e7eb", p: "12px 14px" }}>
                  <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#16a34a", textTransform: "uppercase", letterSpacing: ".06em", mb: 1 }}>✓ Skills You Have</Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {result.common_matched.slice(0, 15).map(s => <span key={s.skill} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 4, background: "rgba(22,163,74,0.08)", color: "#16a34a", border: "1px solid rgba(22,163,74,0.25)" }}>{s.skill} <span style={{ opacity: .7 }}>({s.pct}%)</span></span>)}
                  </Box>
                </Paper>
              )}
              {result.common_missing?.length > 0 && (
                <Paper elevation={0} sx={{ bgcolor: "#f9fafb", borderRadius: 2, border: "1px solid #e5e7eb", p: "12px 14px" }}>
                  <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#ef4444", textTransform: "uppercase", letterSpacing: ".06em", mb: 1 }}>✗ Skills to Learn</Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {result.common_missing.slice(0, 12).map(s => <span key={s.skill} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 4, background: "rgba(220,38,38,0.08)", color: "#ef4444", border: "1px solid rgba(220,38,38,0.25)" }}>{s.skill} <span style={{ opacity: .7 }}>({s.pct}%)</span></span>)}
                  </Box>
                </Paper>
              )}
              {result.jd_results?.length > 0 && (
                <Paper elevation={0} sx={{ bgcolor: "#f9fafb", borderRadius: 2, border: "1px solid #e5e7eb", p: "12px 14px" }}>
                  <Typography sx={{ fontSize: 10, fontWeight: 700, color: "text.disabled", textTransform: "uppercase", letterSpacing: ".06em", mb: 1.25 }}>Per-JD Breakdown</Typography>
                  <Stack spacing={0.75}>
                    {result.jd_results.map((jd, i) => {
                      const jc = "#16a34a"; const isOpen = expandedJD === i;
                      return (
                        <Box key={i} sx={{ borderRadius: 1, border: "1px solid #e5e7eb", overflow: "hidden" }}>
                          <Box onClick={() => setExpandedJD(isOpen ? null : i)} sx={{ p: "8px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 1, bgcolor: isOpen ? "#f5f6fa" : "transparent" }}>
                            <Box sx={{ width: 36, height: 36, borderRadius: 1, bgcolor: `${jc}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <Typography sx={{ fontSize: 13, fontWeight: 800, color: jc }}>{jd.score}</Typography>
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography sx={{ fontSize: 11.5, fontWeight: 600 }}>{jd.company || `JD #${i + 1}`}</Typography>
                              <Typography sx={{ fontSize: 10, color: "text.disabled", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{jd.verdict}</Typography>
                            </Box>
                            <Typography component="span" sx={{ color: "text.disabled", fontSize: 10 }}>{isOpen ? "▲" : "▼"}</Typography>
                          </Box>
                          {isOpen && (
                            <Box sx={{ p: "10px 12px", borderTop: "1px solid #e5e7eb" }}>
                              {jd.strengths && <Typography sx={{ fontSize: 10.5, color: "#16a34a", mb: 0.75 }}>✓ {jd.strengths}</Typography>}
                              {jd.gaps && <Typography sx={{ fontSize: 10.5, color: "#ef4444", mb: 1 }}>✗ {jd.gaps}</Typography>}
                              {jd.matched_skills?.length > 0 && <Box sx={{ mb: 0.75 }}><Typography component="span" sx={{ fontSize: 9, color: "text.disabled", fontWeight: 700, textTransform: "uppercase" }}>Matched: </Typography><Typography component="span" sx={{ fontSize: 10, color: "#16a34a" }}>{jd.matched_skills.join(", ")}</Typography></Box>}
                              {jd.missing_skills?.length > 0 && <Box><Typography component="span" sx={{ fontSize: 9, color: "text.disabled", fontWeight: 700, textTransform: "uppercase" }}>Missing: </Typography><Typography component="span" sx={{ fontSize: 10, color: "#ef4444" }}>{jd.missing_skills.slice(0, 8).join(", ")}</Typography></Box>}
                            </Box>
                          )}
                        </Box>
                      );
                    })}
                  </Stack>
                </Paper>
              )}
              <RippleBtn variant="green" onClick={downloadReport} disabled={dlLoading} style={{ width: "100%", justifyContent: "center", padding: "10px" }}>
                {dlLoading ? <><SpinnerEl size={12} color="#fff" /> Generating…</> : <><Ico.Dl /> Download PDF Report</>}
              </RippleBtn>
            </Stack>
          )}
        </Box>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   PDF VIEWER
══════════════════════════════════════════════════════════════════════ */
function PDFPage({ page, viewport, annotations }) {
  const canvasRef  = useRef(null);
  const renderTask = useRef(null);

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

  const linkOverlays = annotations
    .filter(a => a.subtype === "Link" && (a.url || a.action?.url))
    .map((ann, ai) => {
      const href = ann.url || ann.action?.url || "";
      if (!href) return null;
      const [sx, , , sy, tx, ty] = viewport.transform;
      const px1 = ann.rect[0] * sx + tx;
      const px2 = ann.rect[2] * sx + tx;
      const py1 = ann.rect[1] * sy + ty;
      const py2 = ann.rect[3] * sy + ty;
      const left   = Math.min(px1, px2) / viewport.width  * 100;
      const top    = Math.min(py1, py2) / viewport.height * 100;
      const width  = Math.abs(px2 - px1) / viewport.width  * 100;
      const height = Math.abs(py2 - py1) / viewport.height * 100;
      return (
        <a key={ai} href={href} target="_blank" rel="noopener noreferrer"
          title={href}
          style={{
            position: "absolute",
            left: `${left}%`, top: `${top}%`,
            width: `${width}%`, height: `${height}%`,
            zIndex: 3, cursor: "pointer", display: "block", borderRadius: 2,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(37,99,235,0.13)"; e.currentTarget.style.outline = "1.5px solid rgba(37,99,235,0.45)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.outline = "none"; }}
        />
      );
    }).filter(Boolean);

  const aspectPct = (viewport.height / viewport.width) * 100;

  return (
    <Box sx={{ width: "100%", bgcolor: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,.15)", borderRadius: 1, overflow: "hidden" }}>
      <div style={{ position: "relative", width: "100%", paddingBottom: `${aspectPct}%`, display: "block" }}>
        <canvas ref={canvasRef} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "block" }} />
        {linkOverlays}
      </div>
    </Box>
  );
}

function PDFViewer({ url, version }) {
  const [pages, setPages]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

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
        if (!cancelled) { setPages(pagesData); setLoading(false); }
      })
      .catch(e => { if (!cancelled) { setError(e.message); setLoading(false); } });

    return () => { cancelled = true; };
  }, [url, version]);

  if (loading) return (
    <Stack alignItems="center" justifyContent="center"
      sx={{ flex: 1, gap: 1.5, bgcolor: "#fff", borderRadius: 2.5, border: "1.5px dashed #dde1ea" }}>
      <SpinnerEl size={22} color="#2563eb" />
      <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Rendering preview…</Typography>
      <Typography sx={{ fontSize: 11, color: "#9ca3af" }}>Loading PDF.js…</Typography>
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
        <PDFPage key={idx} page={page} viewport={viewport} annotations={annotations} />
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   STEP LABELS
══════════════════════════════════════════════════════════════════════ */
const STEP_LABELS = {
  contact:"Contacts", personal:"Personal", experience:"Experience",
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
  const [fields, setFields]           = useState([]);
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
  const sparkle = useSparkle();

  const showToast = (msg, type = "info") => setToast({ msg, type, key: Date.now() });

  useEffect(() => {
    fetch(`${API_BASE}/health`).then(r => r.json()).then(() => setBackendOk(true)).catch(() => setBackendOk(false));
  }, []);

  const renderPreview = useCallback(async (sid) => {
    if (!sid) return; setPreviewLoading(true);
    try {
      const r = await fetch(`${API_BASE}/preview-pdf/${sid}?t=${Date.now()}`);
      if (!r.ok) throw new Error(`Preview ${r.status}`);
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      setPreviewUrl(prev => { if (prev) URL.revokeObjectURL(prev); return url; });
      setPreviewVer(v => v + 1);
    } catch (e) { showToast("Preview failed — is docx2pdf / LibreOffice installed?", "error"); }
    setPreviewLoading(false);
  }, []);

  const handleFile = useCallback(async (file) => {
    if (!file) return;
    const ext = file.name.toLowerCase();
    if (!ext.endsWith(".docx") && !ext.endsWith(".pdf")) { showToast("Only .docx and .pdf supported", "error"); return; }
    setFileName(file.name); setIsPdf(ext.endsWith(".pdf"));
    setLandingUploading(true); setLandingStep("processing"); setUploadProgress(0);
    let fakeP = 0;
    const fakeTick = setInterval(() => { fakeP = Math.min(fakeP + 2, 85); setUploadProgress(fakeP); }, 60);
    try {
      const fd = new FormData(); fd.append("file", file);
      const r = await fetch(`${API_BASE}/upload`, { method: "POST", body: fd });
      if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.detail || `Upload failed (${r.status})`); }
      const d = await r.json();
      clearInterval(fakeTick); setUploadProgress(100);
      setSessionId(d.session_id); setFields(d.fields); setEditCount(0);
      setActiveSection(d.fields[0]?.section?.key || "");
      setTimeout(() => {
        setLandingStep("success"); setLandingUploading(false);
        showToast(d.converted_from_pdf ? "PDF converted to DOCX ✓" : "Uploaded ✓", "success");
        renderPreview(d.session_id);
      }, 400);
    } catch (e) {
      clearInterval(fakeTick); showToast(e.message, "error");
      setLandingStep("upload"); setLandingUploading(false);
    }
  }, [renderPreview]);

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
        const r = await fetch(`${API_BASE}/edit-segments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ session_id: sessionId, field_id: field.id, para_index: field.paraIndex ?? -1, source: field.source ?? "body", segments: segs, formatting: Object.keys(mergedFmt).length ? mergedFmt : null }) });
        const d = await r.json();
        if (d.success) { setFields(d.fields); setEditCount(c => c + 1); showToast("Edit applied — updating preview…", "success"); await renderPreview(sessionId); }
        else showToast(d.message || "Edit failed", "error");
        setSaving(false); return;
      }
      const newText = newTextOrSegs;
      const r = await fetch(`${API_BASE}/edit`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ session_id: sessionId, field_id: field.id, old_text: field.text, new_text: newText, para_index: field.paraIndex ?? -1, source: field.source ?? "body", run_indices: field.runIndices ?? null, link_rid: field.linkRId || null, is_textbox: field.isTextbox || false, set_bold: formatting?.bold !== undefined ? formatting.bold : null, formatting: formatting || null }) });
      const d = await r.json();
      if (d.success) { setFields(d.fields); setEditCount(c => c + 1); showToast("Edit applied — updating preview…", "success"); await renderPreview(sessionId); }
      else showToast(d.message || "Edit failed", "error");
    } catch (e) { showToast("Edit failed: " + e.message, "error"); }
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

  const resetDoc = useCallback(async () => {
    try {
      const r = await fetch(`${API_BASE}/reset/${sessionId}`, { method: "POST" });
      const d = await r.json();
      if (d.success) { setFields(d.fields); setEditCount(0); setAddingAfter(null); showToast("Reset to original ✓", "success"); await renderPreview(sessionId); }
    } catch { showToast("Reset failed", "error"); }
  }, [sessionId, renderPreview]);

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

  const goNew = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null); setAppView("landing"); setLandingStep("hero");
    setFileName(""); setEditCount(0); setAddingAfter(null); setIsPdf(false);
    setShowJDManager(false); setShowMatchPanel(false);
  }, [previewUrl]);

  const grouped = {};
  fields.forEach(f => { const k = f.section?.key || "other"; if (!grouped[k]) grouped[k] = []; grouped[k].push(f); });

  return (
    <ThemeProvider theme={theme}>
      <style>{GLOBAL_CSS}</style>
      {toast && <Toast key={toast.key} message={toast.msg} type={toast.type} onDone={() => setToast(null)} />}

      {/* ══ LANDING ══════════════════════════════════════════════════ */}
      {appView === "landing" && (
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default", fontFamily: "'Inter',sans-serif", position: "relative", overflow: "hidden" }}>
          <Box sx={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
            <Box sx={{ position: "absolute", top: "-10%", left: "-10%", width: "40%", height: "40%", bgcolor: "rgba(37,99,235,0.05)", borderRadius: "50%", filter: "blur(120px)" }} />
            <Box sx={{ position: "absolute", bottom: "-10%", right: "-10%", width: "40%", height: "40%", bgcolor: "rgba(22,163,74,0.05)", borderRadius: "50%", filter: "blur(120px)" }} />
          </Box>
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <LandingNav onLogoClick={() => setLandingStep("hero")} />
            <Box component="main">
              {landingStep === "hero"       && <HeroStep onNext={() => setLandingStep("choice")} />}
              {landingStep === "choice"     && <ChoiceStep onUpload={() => setLandingStep("upload")} onBack={() => setLandingStep("hero")} />}
              {landingStep === "upload"     && <UploadStep onBack={() => setLandingStep("choice")} onFile={handleFile} uploading={landingUploading} />}
              {landingStep === "processing" && <ProcessingStep progress={uploadProgress} />}
              {landingStep === "success"    && <SuccessStep fileName={fileName} onEdit={() => setAppView("editor")} />}
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
        <Box sx={{ display: "flex", height: "100vh", fontFamily: "'Inter',sans-serif", bgcolor: "#f0f2f7", color: "text.primary" }}>

          {showJDManager && <JDManagerPanel onClose={() => setShowJDManager(false)} showToast={showToast} />}
          {showMatchPanel && <MatchPanel sessionId={sessionId} onClose={() => setShowMatchPanel(false)} showToast={showToast} />}

          {/* ── LEFT: Preview 45% ── */}
          <div style={{ width: "45%", flexShrink: 0, height: "100vh", position: "relative", borderRight: "1.5px solid #e5e9f2", background: "#e8eaf0" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 54, background: "#fff", borderBottom: "1.5px solid #f0f2f7", display: "flex", alignItems: "center", gap: 12, padding: "0 16px", zIndex: 2, boxShadow: "0 1px 4px rgba(0,0,0,.04)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 28, height: 28, background: "#2563eb", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}><Eye size={13} color="#fff" /></div>
                <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: 13, color: "#111827" }}>Preview</span>
              </div>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: previewLoading ? "#f59e0b" : "#16a34a", boxShadow: `0 0 6px ${previewLoading ? "#f59e0b80" : "#16a34a80"}` }} />
              {editCount > 0 && <Chip label={`${editCount} edit${editCount !== 1 ? "s" : ""}`} size="small" sx={{ height: 20, fontSize: 9.5, bgcolor: "#dbeafe", color: "#1d4ed8", border: "1px solid #bfdbfe" }} />}
            </div>
            <div style={{ position: "absolute", top: 54, left: 0, right: 0, bottom: 0, overflowY: "auto", overflowX: "hidden", padding: 12, boxSizing: "border-box", background: "#e8eaf0" }}>
              {previewUrl ? (
                <PDFViewer url={previewUrl} version={previewVer} />
              ) : (
                <div style={{ height: "100%", background: "#fff", borderRadius: 10, border: "1.5px dashed #dde1ea", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
                  {previewLoading ? (
                    <><SpinnerEl size={22} color="#2563eb" /><span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 13, fontWeight: 700, color: "#374151" }}>Generating preview…</span><span style={{ fontSize: 11.5, color: "#9ca3af" }}>DOCX → PDF converting</span></>
                  ) : (
                    <><FileText size={24} strokeWidth={1.3} color="#c4c9d4" /><span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 13, fontWeight: 700, color: "#374151" }}>Preview will appear here</span></>
                  )}
                </div>
              )}
            </div>
            {previewLoading && previewUrl && (
              <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", padding: "7px 16px", borderRadius: 99, background: "#fff", border: "1px solid #bfdbfe", fontSize: 11.5, color: "#2563eb", fontWeight: 600, display: "flex", alignItems: "center", gap: 7, boxShadow: "0 4px 16px rgba(37,99,235,.15)", whiteSpace: "nowrap", zIndex: 10 }}>
                <SpinnerEl size={11} color="#2563eb" /> Updating preview…
              </div>
            )}
          </div>

          {/* ── RIGHT: Editor 55% ── */}
          <Box sx={{ width: "55%", flexShrink: 0, display: "flex", flexDirection: "column", bgcolor: "#fff", overflow: "hidden" }}>

            {/* Topbar */}
            <Box sx={{ px: 2.5, height: 54, bgcolor: "#fff", borderBottom: "1.5px solid #f0f2f7", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, gap: 1 }}>
              <Stack direction="row" alignItems="center" spacing={1.25}>
                <Box sx={{ width: 32, height: 32, borderRadius: 2.25, background: "linear-gradient(135deg,#2563eb,#60a5fa)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 15, boxShadow: "0 3px 12px rgba(37,99,235,0.28)", flexShrink: 0 }}>✦</Box>
                <Box>
                  <Typography sx={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: 14.5, letterSpacing: "-.02em", lineHeight: 1.1, color: "#111827" }}>CV Editor</Typography>
                  <Typography sx={{ fontSize: 10.5, color: "#9ca3af", maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fileName || "no file loaded"}</Typography>
                </Box>
                {isPdf && <PillEl bg="rgba(6,182,212,0.08)" color="#06b6d4" border="rgba(6,182,212,0.2)" style={{ fontSize: 8.5 }}>PDF</PillEl>}
                {editCount > 0 && <PillEl bg="rgba(37,99,235,0.08)" color="#2563eb" border="rgba(37,99,235,0.22)" style={{ fontSize: 8.5 }}>{editCount} edited</PillEl>}
              </Stack>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <TBtn icon={<Ico.JD />}             label="JD Manager" hoverBg="#f0fdf4" hoverColor="#15803d" hoverBorder="#bbf7d0" active={showJDManager}  onClick={() => { setShowJDManager(v => !v);  setShowMatchPanel(false); }} />
                <TBtn icon={<Ico.Match />}           label="Match"      hoverBg="#eff6ff" hoverColor="#2563eb" hoverBorder="#bfdbfe" active={showMatchPanel} onClick={() => { setShowMatchPanel(v => !v); setShowJDManager(false); }} />
                <Divider orientation="vertical" sx={{ height: 18, mx: 0.5 }} />
                <TBtn icon={<Ico.Rst />}             label="Reset"      hoverBg="#fef2f2" hoverColor="#dc2626" hoverBorder="#fecaca" onClick={resetDoc} />
                <TBtn icon={<ArrowLeft size={13} />} label="New"        hoverBg="#f0fdf4" hoverColor="#15803d" hoverBorder="#bbf7d0" onClick={goNew} />
                <DownloadDropdown onDocx={downloadDocx} onPdf={downloadPdf} />
              </Stack>
            </Box>

            {/* ── Section nav + page ── */}
            {(() => {
              const sectionKeys  = Object.keys(grouped);
              const currentKey   = (activeSection && grouped[activeSection]) ? activeSection : (sectionKeys[0] || "");
              const currentIdx   = sectionKeys.indexOf(currentKey);
              const currentFields = grouped[currentKey] || [];
              const goTo = (k) => { setActiveSection(k); setAddingAfter(null); };

              return (
                <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>

                  {/* ══ STEP PROGRESS BAR ══ */}
                  <Box sx={{
                    borderBottom: "2px solid #e8edf5",
                    bgcolor: "#fff",
                    flexShrink: 0,
                    overflowX: "auto",
                    "&::-webkit-scrollbar": { height: 3 },
                    "&::-webkit-scrollbar-thumb": { background: "#e2e8f0", borderRadius: 99 },
                  }}>
                    <Box sx={{ px: 3, pt: 2.5, pb: 0, minWidth: "max-content" }}>
                      <Box sx={{ position: "relative", display: "flex", alignItems: "center", mb: 1.25 }}>
                        <Box sx={{ position: "absolute", top: "50%", left: 0, right: 0, height: 3, bgcolor: "#e2e8f0", borderRadius: 99, transform: "translateY(-50%)", zIndex: 0 }} />
                        <Box sx={{ position: "absolute", top: "50%", left: 0, height: 3, bgcolor: "#2563eb", borderRadius: 99, transform: "translateY(-50%)", zIndex: 1, width: sectionKeys.length > 1 ? `${(currentIdx / (sectionKeys.length - 1)) * 100}%` : "0%", transition: "width .4s cubic-bezier(.34,1.56,.64,1)" }} />
                        {sectionKeys.map((k, idx) => {
                          const isActive = k === currentKey;
                          const isDone   = idx < currentIdx;
                          const sf = grouped[k] || [];
                          const allFilled = sf.filter(f => !f.isHeader).length > 0 &&
                            sf.filter(f => !f.isHeader && f.text?.trim()).length === sf.filter(f => !f.isHeader).length;
                          const showCheck = (isDone || allFilled) && !isActive;
                          return (
                            <Box key={k} onClick={() => goTo(k)} sx={{ position: "relative", zIndex: 2, flex: "1 0 auto", display: "flex", justifyContent: "center", cursor: "pointer" }}>
                              <Box sx={{ width: isActive ? 16 : 12, height: isActive ? 16 : 12, borderRadius: "50%", bgcolor: isActive ? "#2563eb" : showCheck ? "#2563eb" : "#fff", border: isActive ? "3px solid #bfdbfe" : showCheck ? "2.5px solid #93c5fd" : "2.5px solid #cbd5e1", boxShadow: isActive ? "0 0 0 4px rgba(37,99,235,0.15)" : "none", transition: "all .2s", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {showCheck && (<svg width="6" height="6" viewBox="0 0 8 8" fill="none"><polyline points="1.5,4 3.2,5.8 6.5,2" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>)}
                              </Box>
                            </Box>
                          );
                        })}
                      </Box>
                      <Box sx={{ display: "flex" }}>
                        {sectionKeys.map((k) => {
                          const isActive = k === currentKey;
                          return (
                            <Box key={k} onClick={() => goTo(k)} sx={{ flex: "1 0 auto", display: "flex", justifyContent: "center", pb: 1.5, pt: 1, cursor: "pointer", position: "relative" }}>
                              <Typography sx={{ fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? "#2563eb" : "#64748b", whiteSpace: "nowrap", transition: "color .15s", fontFamily: "'Inter',sans-serif", letterSpacing: "-.01em" }}>
                                {STEP_LABELS[k] || k.replace(/_/g, " ")}
                              </Typography>
                              {isActive && (<Box sx={{ position: "absolute", bottom: 0, left: "5%", right: "5%", height: 3, bgcolor: "#2563eb", borderRadius: "3px 3px 0 0" }} />)}
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>
                  </Box>

                  {/* Section page */}
                  <Box sx={{ flex: 1, minHeight: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                    {/* ── FIX: pass onAddLineSubmit={handleAddLine} ── */}
                    <SectionPage
                      key={currentKey}
                      sectionKey={currentKey}
                      fields={currentFields}
                      onSave={handleFieldSave}
                      saving={saving}
                      sessionId={sessionId}
                      onAddLine={f => setAddingAfter(addingAfter?.id === f.id ? null : f)}
                      onDeleteLine={handleDeleteLine}
                      onDeleteField={handleDeleteField}
                      addingAfter={addingAfter}
                      setAddingAfter={setAddingAfter}
                      onAddLineSubmit={handleAddLine}
                    />
                  </Box>

                  {/* Bottom nav bar */}
                  <Box sx={{ px: 4, py: 1.875, bgcolor: "#fff", borderTop: "1.5px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                    <Button onClick={() => currentIdx > 0 && goTo(sectionKeys[currentIdx - 1])} disabled={currentIdx === 0}
                      variant="outlined" sx={{ borderRadius: 99, px: 2.75, py: 0.75, fontWeight: 600, fontSize: 13, textTransform: "none", borderColor: "#e2e8f0", color: "#475569", "&:hover": { borderColor: "#2563eb", color: "#2563eb", bgcolor: "#eff6ff" }, "&.Mui-disabled": { opacity: .35, borderColor: "#e2e8f0" } }}>
                      ← Back
                    </Button>
                    <Typography sx={{ fontSize: 11.5, color: "#94a3b8", fontWeight: 500 }}>{currentIdx + 1} / {sectionKeys.length}</Typography>
                    {currentIdx < sectionKeys.length - 1 ? (
                      <Button onClick={() => goTo(sectionKeys[currentIdx + 1])} variant="contained"
                        sx={{ borderRadius: 99, px: 3.25, py: 0.75, fontWeight: 700, fontSize: 13, textTransform: "none", background: "linear-gradient(135deg,#2563eb,#3b82f6)", boxShadow: "0 4px 14px rgba(37,99,235,0.28)", "&:hover": { boxShadow: "0 6px 20px rgba(37,99,235,0.38)" } }}>
                        Next: {STEP_LABELS[sectionKeys[currentIdx + 1]] || "Next"} →
                      </Button>
                    ) : (
                      <Button onClick={downloadDocx} variant="contained" color="success"
                        sx={{ borderRadius: 99, px: 3.25, py: 0.75, fontWeight: 700, fontSize: 13, textTransform: "none", background: "linear-gradient(135deg,#16a34a,#22c55e)", boxShadow: "0 4px 14px rgba(22,163,74,0.28)" }}>
                        Download ↓
                      </Button>
                    )}
                  </Box>

                </Box>
              );
            })()}
          </Box>

        </Box>
      )}
    </ThemeProvider>
  );
}