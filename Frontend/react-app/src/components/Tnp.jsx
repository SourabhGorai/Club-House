import { useState, useEffect, useRef } from "react";

// ── Google Fonts ──────────────────────────────────────────────────────────────
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Mono:wght@400;500&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --orange: #F4600C;
      --orange-light: #FF7D35;
      --orange-dim: rgba(244,96,12,0.12);
      --orange-border: rgba(244,96,12,0.3);
      --black: #0A0A0A;
      --black-soft: #111111;
      --black-card: #161616;
      --black-elevated: #1E1E1E;
      --white: #FFFFFF;
      --white-90: rgba(255,255,255,0.9);
      --white-60: rgba(255,255,255,0.6);
      --white-30: rgba(255,255,255,0.3);
      --white-10: rgba(255,255,255,0.1);
      --white-6: rgba(255,255,255,0.06);
      --font-display: 'Bebas Neue', sans-serif;
      --font-body: 'DM Sans', sans-serif;
      --font-mono: 'DM Mono', monospace;
      --radius: 4px;
      --radius-lg: 8px;
      --radius-xl: 12px;
    }

    body { font-family: var(--font-body); background: var(--black); color: var(--white); line-height: 1.6; }

    ::selection { background: var(--orange); color: var(--white); }

    /* Scrollbar */
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: var(--black); }
    ::-webkit-scrollbar-thumb { background: var(--orange); border-radius: 2px; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(24px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    @keyframes marquee {
      from { transform: translateX(0); }
      to { transform: translateX(-50%); }
    }
    @keyframes glow {
      0%, 100% { box-shadow: 0 0 20px rgba(244,96,12,0.2); }
      50% { box-shadow: 0 0 40px rgba(244,96,12,0.5); }
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `}</style>
);

// ── Mock Data ─────────────────────────────────────────────────────────────────
const COMPANIES = [
  { id: 1, name: "Google", sector: "Technology", logo: "G", color: "#4285F4", hires: 12, pkg: "32 LPA" },
  { id: 2, name: "Microsoft", sector: "Technology", logo: "M", color: "#00BCF2", hires: 8, pkg: "28 LPA" },
  { id: 3, name: "Infosys", sector: "IT Services", logo: "I", color: "#007CC5", hires: 45, pkg: "8 LPA" },
  { id: 4, name: "TCS", sector: "IT Services", logo: "T", color: "#CC0001", hires: 60, pkg: "7 LPA" },
  { id: 5, name: "Deloitte", sector: "Consulting", logo: "D", color: "#86BC25", hires: 20, pkg: "14 LPA" },
  { id: 6, name: "Goldman Sachs", sector: "Finance", logo: "GS", color: "#6495ED", hires: 6, pkg: "42 LPA" },
  { id: 7, name: "Amazon", sector: "Technology", logo: "A", color: "#FF9900", hires: 15, pkg: "30 LPA" },
  { id: 8, name: "Wipro", sector: "IT Services", logo: "W", color: "#341F6A", hires: 38, pkg: "7.5 LPA" },
  { id: 9, name: "Accenture", sector: "Consulting", logo: "Ac", color: "#A100FF", hires: 25, pkg: "10 LPA" },
  { id: 10, name: "JP Morgan", sector: "Finance", logo: "JP", color: "#003087", hires: 9, pkg: "38 LPA" },
  { id: 11, name: "Flipkart", sector: "E-Commerce", logo: "F", color: "#F74E30", hires: 11, pkg: "22 LPA" },
  { id: 12, name: "Swiggy", sector: "Startup", logo: "S", color: "#FC8019", hires: 7, pkg: "18 LPA" },
];

const PLACED_STUDENTS = [
  { prn: "2021BTCS001", name: "Aanya Sharma", dept: "Computer Science", company: "Google", pkg: "32 LPA", role: "SDE II", year: 4, initials: "AS" },
  { prn: "2021BTCS042", name: "Rohan Mehta", dept: "Computer Science", company: "Microsoft", pkg: "28 LPA", role: "SDE", year: 4, initials: "RM" },
  { prn: "2021BTEC018", name: "Priya Nair", dept: "Electronics", company: "Goldman Sachs", pkg: "42 LPA", role: "Analyst", year: 4, initials: "PN" },
  { prn: "2021BTCS077", name: "Karthik Iyer", dept: "Computer Science", company: "Amazon", pkg: "30 LPA", role: "SDE", year: 4, initials: "KI" },
  { prn: "2021BTME022", name: "Sneha Patel", dept: "Mechanical", company: "Deloitte", pkg: "14 LPA", role: "Consultant", year: 4, initials: "SP" },
  { prn: "2021BTCS055", name: "Dev Kulkarni", dept: "Computer Science", company: "JP Morgan", pkg: "38 LPA", role: "Quant Analyst", year: 4, initials: "DK" },
];

const TNP_MEMBERS = [
  { prn: "2020BTCS001", name: "Arjun Verma", role: "TNP_HEAD", dept: "Computer Science", year: 4, initials: "AV", tenure: "2023–24" },
  { prn: "2021BTCS012", name: "Meera Joshi", role: "PRESIDENT", dept: "Computer Science", year: 3, initials: "MJ", tenure: "2023–24" },
  { prn: "2021BTEC034", name: "Siddharth Rao", role: "VICE_PRESIDENT", dept: "Electronics", year: 3, initials: "SR", tenure: "2023–24" },
  { prn: "2022BTCS011", name: "Tanvi Shah", role: "CO_ORDINATOR", dept: "Computer Science", year: 2, initials: "TS", tenure: "2023–24" },
  { prn: "2022BTCS028", name: "Ayush Kumar", role: "CO_ORDINATOR", dept: "Computer Science", year: 2, initials: "AK", tenure: "2023–24" },
  { prn: "2022BTEC009", name: "Riya Desai", role: "CO_ORDINATOR", dept: "Electronics", year: 2, initials: "RD", tenure: "2023–24" },
];

const ROLE_LABELS = {
  TNP_HEAD: "Head",
  PRESIDENT: "President",
  VICE_PRESIDENT: "Vice President",
  CO_ORDINATOR: "Coordinator",
};

const ROLE_RANK = { TNP_HEAD: 0, PRESIDENT: 1, VICE_PRESIDENT: 2, CO_ORDINATOR: 3 };

const STATS = [
  { label: "Companies Visited", value: "80+", suffix: "" },
  { label: "Students Placed", value: "420", suffix: "+" },
  { label: "Highest Package", value: "₹48", suffix: "LPA" },
  { label: "Average Package", value: "₹14.2", suffix: "LPA" },
  { label: "Placement Rate", value: "92", suffix: "%" },
];

// ── Auth mock (in real app → JWT + role from API gateway) ──────────────────
const MOCK_USERS = {
  head: { prn: "2020BTCS001", name: "Arjun Verma", globalRole: "USER", tnpRole: "TNP_HEAD" },
  president: { prn: "2021BTCS012", name: "Meera Joshi", globalRole: "USER", tnpRole: "PRESIDENT" },
  vp: { prn: "2021BTEC034", name: "Siddharth Rao", globalRole: "USER", tnpRole: "VICE_PRESIDENT" },
  coordinator: { prn: "2022BTCS011", name: "Tanvi Shah", globalRole: "USER", tnpRole: "CO_ORDINATOR" },
  superadmin: { prn: "SA001", name: "Super Admin", globalRole: "SUPER_ADMIN", tnpRole: null },
  student: { prn: "2021BTCS099", name: "Random Student", globalRole: "USER", tnpRole: null },
};

// ── Permissions ──────────────────────────────────────────────────────────────
const canAccess = (user, action) => {
  if (!user) return false;
  if (user.globalRole === "SUPER_ADMIN") return true;
  const adminRoles = ["TNP_HEAD", "PRESIDENT", "VICE_PRESIDENT"];
  const allRoles = [...adminRoles, "CO_ORDINATOR"];
  switch (action) {
    case "enter_portal": return allRoles.includes(user.tnpRole);
    case "write_company": return adminRoles.includes(user.tnpRole);
    case "write_placement": return allRoles.includes(user.tnpRole);
    case "manage_members": return adminRoles.includes(user.tnpRole);
    case "change_roles": return user.tnpRole === "TNP_HEAD";
    default: return false;
  }
};

// ── Tiny UI Components ────────────────────────────────────────────────────────
const Badge = ({ children, variant = "default" }) => {
  const styles = {
    default: { bg: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" },
    orange: { bg: "rgba(244,96,12,0.15)", color: "#F4600C" },
    success: { bg: "rgba(34,197,94,0.15)", color: "#22c55e" },
  };
  const s = styles[variant] || styles.default;
  return (
    <span style={{
      display: "inline-block", padding: "2px 10px", borderRadius: "99px",
      fontSize: "11px", fontWeight: 500, letterSpacing: "0.05em",
      fontFamily: "var(--font-mono)", textTransform: "uppercase",
      background: s.bg, color: s.color, border: `1px solid ${s.color}30`,
    }}>{children}</span>
  );
};

const OrangeBtn = ({ children, onClick, small, outline, disabled }) => (
  <button onClick={onClick} disabled={disabled} style={{
    display: "inline-flex", alignItems: "center", gap: "8px",
    padding: small ? "8px 18px" : "12px 28px",
    fontSize: small ? "13px" : "15px", fontWeight: 600,
    fontFamily: "var(--font-body)", letterSpacing: "0.02em",
    borderRadius: "var(--radius)",
    background: outline ? "transparent" : disabled ? "#333" : "var(--orange)",
    color: outline ? "var(--orange)" : disabled ? "#666" : "var(--white)",
    border: outline ? "1px solid var(--orange)" : "none",
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all 0.15s ease",
  }}
    onMouseEnter={e => { if (!disabled) e.target.style.opacity = "0.85"; }}
    onMouseLeave={e => { e.target.style.opacity = "1"; }}
  >{children}</button>
);

const Divider = () => (
  <div style={{ height: "1px", background: "rgba(255,255,255,0.08)", margin: "0" }} />
);

// ── Nav ───────────────────────────────────────────────────────────────────────
const Nav = ({ user, setUser, view, setView }) => {
  const [scrolled, setScrolled] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 40px", height: "60px",
        background: scrolled ? "rgba(10,10,10,0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.08)" : "none",
        transition: "all 0.3s ease",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
          onClick={() => setView("landing")}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "4px",
            background: "var(--orange)", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "18px", color: "white", lineHeight: 1 }}>T</span>
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "22px", letterSpacing: "0.05em" }}>
            TNP <span style={{ color: "var(--orange)" }}>CELL</span>
          </span>
        </div>

        {/* Links */}
        <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          {["Companies", "Placements", "Team"].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} style={{
              color: "var(--white-60)", fontSize: "14px", fontWeight: 400,
              textDecoration: "none", letterSpacing: "0.02em",
              transition: "color 0.15s",
            }}
              onMouseEnter={e => e.target.style.color = "white"}
              onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.6)"}
            >{l}</a>
          ))}
        </div>

        {/* Auth / Portal */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {user ? (
            <>
              {canAccess(user, "enter_portal") && (
                <OrangeBtn small onClick={() => setView(view === "portal" ? "landing" : "portal")}>
                  {view === "portal" ? "← Back" : "TNP Portal →"}
                </OrangeBtn>
              )}
              <div style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "4px 12px 4px 4px",
                background: "rgba(255,255,255,0.06)",
                borderRadius: "99px", border: "1px solid rgba(255,255,255,0.1)",
                cursor: "pointer",
              }} onClick={() => setUser(null)}>
                <div style={{
                  width: "28px", height: "28px", borderRadius: "50%",
                  background: "var(--orange)", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "11px", fontWeight: 600,
                }}>{user.name.split(" ").map(w => w[0]).join("")}</div>
                <span style={{ fontSize: "13px", color: "var(--white-60)" }}>
                  {user.name.split(" ")[0]}
                </span>
                <span style={{ fontSize: "11px", color: "var(--white-30)" }}>✕</span>
              </div>
            </>
          ) : (
            <OrangeBtn small outline onClick={() => setLoginOpen(true)}>Sign In</OrangeBtn>
          )}
        </div>
      </nav>

      {/* Login Modal */}
      {loginOpen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          animation: "fadeIn 0.2s ease",
        }} onClick={() => setLoginOpen(false)}>
          <div style={{
            background: "var(--black-card)", border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "12px", padding: "40px", width: "380px",
            animation: "fadeUp 0.25s ease",
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "28px", letterSpacing: "0.05em", marginBottom: "4px" }}>
              SIGN IN
            </h3>
            <p style={{ color: "var(--white-60)", fontSize: "13px", marginBottom: "28px" }}>
              Choose a demo account to explore the portal
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {Object.entries(MOCK_USERS).map(([key, u]) => (
                <button key={key} onClick={() => { setUser(u); setLoginOpen(false); if (canAccess(u, "enter_portal")) setView("portal"); }} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "12px 16px", borderRadius: "8px",
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                  color: "white", cursor: "pointer", textAlign: "left",
                  transition: "all 0.15s",
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "var(--orange)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
                >
                  <div>
                    <div style={{ fontWeight: 500, fontSize: "14px" }}>{u.name}</div>
                    <div style={{ color: "var(--white-60)", fontSize: "12px" }}>{u.prn}</div>
                  </div>
                  <Badge variant={u.globalRole === "SUPER_ADMIN" ? "orange" : "default"}>
                    {u.globalRole === "SUPER_ADMIN" ? "SUPER ADMIN" : u.tnpRole ? ROLE_LABELS[u.tnpRole] : "Student"}
                  </Badge>
                </button>
              ))}
            </div>
            <button onClick={() => setLoginOpen(false)} style={{
              marginTop: "20px", width: "100%", padding: "10px",
              background: "transparent", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px", color: "var(--white-60)", cursor: "pointer", fontSize: "13px",
            }}>Cancel</button>
          </div>
        </div>
      )}
    </>
  );
};

// ── LANDING PAGE ──────────────────────────────────────────────────────────────
const Hero = ({ user, setView }) => (
  <section style={{
    minHeight: "100vh", display: "flex", flexDirection: "column",
    justifyContent: "flex-end", padding: "0 80px 80px",
    position: "relative", overflow: "hidden",
  }}>
    {/* Grid background */}
    <div style={{
      position: "absolute", inset: 0, zIndex: 0,
      backgroundImage: `
        linear-gradient(rgba(244,96,12,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(244,96,12,0.03) 1px, transparent 1px)
      `,
      backgroundSize: "60px 60px",
    }} />

    {/* Orange glow */}
    <div style={{
      position: "absolute", top: "20%", right: "10%", width: "500px", height: "500px",
      borderRadius: "50%", background: "radial-gradient(circle, rgba(244,96,12,0.12) 0%, transparent 70%)",
      zIndex: 0, animation: "glow 4s ease-in-out infinite",
    }} />

    {/* Diagonal accent line */}
    <div style={{
      position: "absolute", top: 0, right: "30%", width: "1px", height: "100%",
      background: "linear-gradient(to bottom, transparent, rgba(244,96,12,0.2), transparent)",
      zIndex: 0,
    }} />

    <div style={{ position: "relative", zIndex: 1, maxWidth: "900px" }}>
      {/* Session badge */}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: "8px",
        padding: "6px 14px", borderRadius: "99px",
        border: "1px solid var(--orange-border)",
        background: "var(--orange-dim)", marginBottom: "32px",
      }}>
        <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--orange)", animation: "pulse 2s infinite" }} />
        <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: "var(--orange)", letterSpacing: "0.08em" }}>
          PLACEMENT SEASON 2024–25 · ACTIVE
        </span>
      </div>

      <h1 style={{
        fontFamily: "var(--font-display)", fontSize: "clamp(72px, 12vw, 140px)",
        lineHeight: 0.9, letterSpacing: "0.02em", marginBottom: "32px",
      }}>
        <span style={{ display: "block", color: "var(--white)" }}>TRAINING</span>
        <span style={{ display: "block", color: "var(--orange)" }}>&</span>
        <span style={{ display: "block", color: "var(--white)" }}>PLACEMENT</span>
      </h1>

      <div style={{ display: "flex", alignItems: "flex-end", gap: "48px", flexWrap: "wrap" }}>
        <p style={{
          fontSize: "18px", color: "var(--white-60)", maxWidth: "480px",
          fontWeight: 300, lineHeight: 1.7,
        }}>
          Connecting exceptional talent with industry leaders. The official placement cell of our institution — driving careers, building futures.
        </p>
        <div style={{ display: "flex", gap: "12px", flexShrink: 0 }}>
          {canAccess(user, "enter_portal") && (
            <OrangeBtn onClick={() => setView("portal")}>
              Enter TNP Portal →
            </OrangeBtn>
          )}
          <OrangeBtn outline onClick={() => document.getElementById("companies")?.scrollIntoView({ behavior: "smooth" })}>
            Explore
          </OrangeBtn>
        </div>
      </div>
    </div>

    {/* Stats row at bottom */}
    <div style={{
      position: "absolute", bottom: "0", right: "0",
      display: "flex", borderTop: "1px solid rgba(255,255,255,0.08)",
      borderLeft: "1px solid rgba(255,255,255,0.08)",
    }}>
      {STATS.map((s, i) => (
        <div key={i} style={{
          padding: "20px 32px",
          borderRight: "1px solid rgba(255,255,255,0.08)",
          textAlign: "center",
          animation: `fadeUp 0.6s ease ${i * 0.1}s both`,
        }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "32px", color: "var(--orange)", letterSpacing: "0.02em" }}>
            {s.value}<span style={{ fontSize: "18px" }}>{s.suffix}</span>
          </div>
          <div style={{ fontSize: "11px", color: "var(--white-60)", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>
            {s.label}
          </div>
        </div>
      ))}
    </div>
  </section>
);

// ── Companies Marquee ─────────────────────────────────────────────────────────
const CompaniesSection = () => {
  const [filter, setFilter] = useState("All");
  const sectors = ["All", ...new Set(COMPANIES.map(c => c.sector))];
  const filtered = filter === "All" ? COMPANIES : COMPANIES.filter(c => c.sector === filter);

  return (
    <section id="companies" style={{ padding: "100px 0", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "0 80px", marginBottom: "60px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "40px" }}>
          <div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--orange)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Our Recruiters
            </span>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "64px", letterSpacing: "0.03em", marginTop: "4px", lineHeight: 1 }}>
              COMPANIES
            </h2>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
            {sectors.map(s => (
              <button key={s} onClick={() => setFilter(s)} style={{
                padding: "6px 16px", borderRadius: "99px", fontSize: "13px",
                fontFamily: "var(--font-mono)", letterSpacing: "0.03em",
                background: filter === s ? "var(--orange)" : "transparent",
                color: filter === s ? "white" : "var(--white-60)",
                border: filter === s ? "none" : "1px solid rgba(255,255,255,0.15)",
                cursor: "pointer", transition: "all 0.15s",
              }}>{s}</button>
            ))}
          </div>
        </div>
        <Divider />
      </div>

      {/* Marquee strip */}
      <div style={{ overflow: "hidden", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "20px 0", marginBottom: "60px" }}>
        <div style={{ display: "flex", animation: "marquee 30s linear infinite", width: "max-content" }}>
          {[...COMPANIES, ...COMPANIES].map((c, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "0 32px", whiteSpace: "nowrap",
              color: "var(--white-30)", fontSize: "13px", fontFamily: "var(--font-mono)",
              letterSpacing: "0.05em",
            }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: c.color, opacity: 0.8 }} />
              {c.name.toUpperCase()}
            </div>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{ padding: "0 80px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "1px", background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}>
          {filtered.map((c, i) => (
            <div key={c.id} style={{
              background: "var(--black-soft)", padding: "28px 24px",
              display: "flex", flexDirection: "column", gap: "16px",
              transition: "background 0.2s",
              animation: `fadeUp 0.4s ease ${i * 0.05}s both`,
              cursor: "default",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--black-elevated)"}
              onMouseLeave={e => e.currentTarget.style.background = "var(--black-soft)"}
            >
              {/* Logo */}
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{
                  width: "48px", height: "48px", borderRadius: "8px",
                  background: `${c.color}18`, border: `1px solid ${c.color}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-display)", fontSize: "18px", color: c.color,
                  letterSpacing: "0.02em", flexShrink: 0,
                }}>{c.logo}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "15px" }}>{c.name}</div>
                  <div style={{ fontSize: "11px", color: "var(--white-60)", fontFamily: "var(--font-mono)" }}>{c.sector}</div>
                </div>
              </div>
              {/* Stats */}
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <div>
                  <div style={{ fontSize: "18px", fontFamily: "var(--font-display)", color: "var(--orange)", letterSpacing: "0.03em" }}>{c.hires}</div>
                  <div style={{ fontSize: "10px", color: "var(--white-30)", fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }}>HIRED</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "18px", fontFamily: "var(--font-display)", letterSpacing: "0.03em" }}>{c.pkg}</div>
                  <div style={{ fontSize: "10px", color: "var(--white-30)", fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }}>PACKAGE</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ── Placed Students ───────────────────────────────────────────────────────────
const PlacementsSection = () => (
  <section id="placements" style={{ padding: "100px 80px" }}>
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "16px" }}>
      <div>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--orange)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Class of 2024</span>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "64px", letterSpacing: "0.03em", lineHeight: 1 }}>PLACED STUDENTS</h2>
      </div>
      <OrangeBtn outline small>View All 420+ →</OrangeBtn>
    </div>
    <Divider />
    <div style={{ marginTop: "48px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1px", background: "rgba(255,255,255,0.06)" }}>
      {PLACED_STUDENTS.map((s, i) => {
        const company = COMPANIES.find(c => c.name === s.company);
        return (
          <div key={s.prn} style={{
            background: "var(--black-soft)", padding: "24px",
            display: "flex", gap: "16px", alignItems: "flex-start",
            transition: "background 0.2s",
            animation: `fadeUp 0.4s ease ${i * 0.08}s both`,
          }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--black-elevated)"}
            onMouseLeave={e => e.currentTarget.style.background = "var(--black-soft)"}
          >
            {/* Avatar */}
            <div style={{
              width: "52px", height: "52px", borderRadius: "50%", flexShrink: 0,
              background: `linear-gradient(135deg, var(--orange), #c44d0a)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 600, fontSize: "16px", color: "white",
            }}>{s.initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: "16px", marginBottom: "2px" }}>{s.name}</div>
              <div style={{ fontSize: "12px", color: "var(--white-60)", fontFamily: "var(--font-mono)", marginBottom: "12px" }}>{s.dept} · Year {s.year}</div>
              {/* Company row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{
                    width: "24px", height: "24px", borderRadius: "4px",
                    background: `${company?.color || "#fff"}18`, border: `1px solid ${company?.color || "#fff"}30`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "10px", fontFamily: "var(--font-display)", color: company?.color,
                  }}>{company?.logo}</div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 500 }}>{s.company}</div>
                    <div style={{ fontSize: "11px", color: "var(--white-60)", fontFamily: "var(--font-mono)" }}>{s.role}</div>
                  </div>
                </div>
                <div style={{
                  padding: "4px 12px", borderRadius: "4px",
                  background: "rgba(244,96,12,0.12)", border: "1px solid var(--orange-border)",
                  fontSize: "13px", fontWeight: 600, color: "var(--orange)",
                  fontFamily: "var(--font-display)", letterSpacing: "0.04em",
                }}>{s.pkg}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </section>
);

// ── Team Section ──────────────────────────────────────────────────────────────
const TeamSection = ({ setView, user }) => {
  const sorted = [...TNP_MEMBERS].sort((a, b) => ROLE_RANK[a.role] - ROLE_RANK[b.role]);
  const head = sorted.filter(m => m.role === "TNP_HEAD")[0];
  const others = sorted.filter(m => m.role !== "TNP_HEAD");

  const MemberCard = ({ m, large }) => (
    <div style={{
      background: "var(--black-card)", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "8px", padding: large ? "32px" : "24px",
      display: "flex", gap: large ? "24px" : "16px",
      alignItems: large ? "center" : "flex-start",
      transition: "border-color 0.2s, background 0.2s",
    }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = "rgba(244,96,12,0.4)";
        e.currentTarget.style.background = "var(--black-elevated)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
        e.currentTarget.style.background = "var(--black-card)";
      }}
    >
      <div style={{
        width: large ? "72px" : "52px", height: large ? "72px" : "52px",
        borderRadius: "50%", flexShrink: 0,
        background: m.role === "TNP_HEAD" ? "linear-gradient(135deg, var(--orange), #c44d0a)" :
          m.role === "PRESIDENT" ? "linear-gradient(135deg, #6366f1, #4338ca)" :
          m.role === "VICE_PRESIDENT" ? "linear-gradient(135deg, #14b8a6, #0d9488)" :
          "linear-gradient(135deg, #374151, #1f2937)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: 600, fontSize: large ? "22px" : "16px", color: "white",
        border: m.role === "TNP_HEAD" ? "2px solid rgba(244,96,12,0.4)" : "none",
      }}>{m.initials}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: large ? "20px" : "15px", marginBottom: "2px" }}>{m.name}</div>
        <div style={{ fontSize: "12px", color: "var(--white-60)", fontFamily: "var(--font-mono)", marginBottom: "10px" }}>{m.dept}</div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <Badge variant={m.role === "TNP_HEAD" ? "orange" : "default"}>{ROLE_LABELS[m.role]}</Badge>
          <Badge>Year {m.year}</Badge>
          <Badge>{m.tenure}</Badge>
        </div>
      </div>
    </div>
  );

  return (
    <section id="team" style={{ padding: "100px 80px", background: "var(--black-soft)" }}>
      <div style={{ marginBottom: "16px" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--orange)", letterSpacing: "0.1em", textTransform: "uppercase" }}>The People Behind It</span>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "64px", letterSpacing: "0.03em", lineHeight: 1 }}>OUR TEAM</h2>
      </div>
      <Divider />
      <div style={{ marginTop: "48px", display: "grid", gap: "24px" }}>
        {/* Head — full width */}
        {head && <MemberCard m={head} large />}
        {/* Others — grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
          {others.map(m => <MemberCard key={m.prn} m={m} />)}
        </div>
      </div>

      {/* Portal CTA for non-members */}
      {!canAccess(user, "enter_portal") && (
        <div style={{
          marginTop: "80px", padding: "60px", textAlign: "center",
          border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px",
          background: "linear-gradient(135deg, rgba(244,96,12,0.04), transparent)",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: "-40px", right: "-40px",
            width: "200px", height: "200px", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(244,96,12,0.08), transparent)",
          }} />
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--orange)",
            letterSpacing: "0.1em", marginBottom: "16px",
          }}>RESTRICTED ACCESS</div>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "48px", letterSpacing: "0.04em", marginBottom: "16px" }}>
            TNP PORTAL
          </h3>
          <p style={{ color: "var(--white-60)", fontSize: "15px", maxWidth: "420px", margin: "0 auto 32px", lineHeight: 1.7 }}>
            The internal portal is accessible only to registered TNP members. Sign in with your TNP credentials to continue.
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "32px" }}>
            {["CO_ORDINATOR", "VICE_PRESIDENT", "PRESIDENT", "TNP_HEAD"].map(r => (
              <Badge key={r} variant="default">{ROLE_LABELS[r]}</Badge>
            ))}
          </div>
          <OrangeBtn onClick={() => document.querySelector("[data-signin]")?.click()}>
            🔐 Sign In for Access
          </OrangeBtn>
        </div>
      )}
    </section>
  );
};

// ── TNP PORTAL ───────────────────────────────────────────────────────────────
const Portal = ({ user }) => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: "◉" },
    { id: "companies", label: "Companies", icon: "⬡", access: true },
    { id: "placements", label: "Placements", icon: "◈", access: true },
    { id: "members", label: "Members", icon: "◎", access: canAccess(user, "manage_members") },
  ].filter(t => t.access !== false);

  return (
    <div style={{ minHeight: "100vh", paddingTop: "60px", display: "flex" }}>
      {/* Sidebar */}
      <div style={{
        width: "220px", flexShrink: 0, borderRight: "1px solid rgba(255,255,255,0.08)",
        padding: "32px 0", background: "var(--black-soft)", position: "sticky",
        top: "60px", height: "calc(100vh - 60px)", overflowY: "auto",
      }}>
        {/* User card */}
        <div style={{ padding: "0 20px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{
            width: "44px", height: "44px", borderRadius: "50%",
            background: "linear-gradient(135deg, var(--orange), #c44d0a)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 600, fontSize: "16px", marginBottom: "10px",
          }}>{user.name.split(" ").map(w => w[0]).join("")}</div>
          <div style={{ fontWeight: 500, fontSize: "14px" }}>{user.name}</div>
          <div style={{ fontSize: "11px", color: "var(--white-60)", fontFamily: "var(--font-mono)" }}>{user.prn}</div>
          <div style={{ marginTop: "8px" }}>
            <Badge variant={user.globalRole === "SUPER_ADMIN" ? "orange" : "default"}>
              {user.globalRole === "SUPER_ADMIN" ? "Super Admin" : user.tnpRole ? ROLE_LABELS[user.tnpRole] : "Member"}
            </Badge>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: "16px 12px", display: "flex", flexDirection: "column", gap: "2px" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              display: "flex", alignItems: "center", gap: "10px",
              padding: "10px 12px", borderRadius: "6px",
              background: activeTab === t.id ? "rgba(244,96,12,0.15)" : "transparent",
              color: activeTab === t.id ? "var(--orange)" : "var(--white-60)",
              border: "none", cursor: "pointer", textAlign: "left",
              fontSize: "14px", fontFamily: "var(--font-body)",
              transition: "all 0.15s",
            }}>
              <span style={{ fontSize: "14px", opacity: 0.8 }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>

        {/* Access level */}
        <div style={{
          margin: "20px 20px 0", padding: "12px",
          background: "rgba(255,255,255,0.04)", borderRadius: "8px",
          border: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{ fontSize: "10px", color: "var(--white-30)", fontFamily: "var(--font-mono)", letterSpacing: "0.08em", marginBottom: "8px" }}>
            YOUR ACCESS
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {[
              ["View Data", true],
              ["Add Records", canAccess(user, "write_placement")],
              ["Edit Companies", canAccess(user, "write_company")],
              ["Manage Members", canAccess(user, "manage_members")],
              ["Change Roles", canAccess(user, "change_roles")],
            ].map(([label, allowed]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px" }}>
                <span style={{ color: "var(--white-60)" }}>{label}</span>
                <span style={{ color: allowed ? "#22c55e" : "#ef4444", fontSize: "10px" }}>{allowed ? "✓" : "✗"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, minWidth: 0, padding: "40px", overflowY: "auto" }}>
        {activeTab === "dashboard" && <PortalDashboard user={user} />}
        {activeTab === "companies" && <PortalCompanies user={user} />}
        {activeTab === "placements" && <PortalPlacements user={user} />}
        {activeTab === "members" && <PortalMembers user={user} />}
      </div>
    </div>
  );
};

// ── Portal: Dashboard ────────────────────────────────────────────────────────
const PortalDashboard = ({ user }) => {
  const metrics = [
    { label: "Companies This Year", value: "80", change: "+12 vs last year" },
    { label: "Total Placements", value: "420", change: "+68 vs last year" },
    { label: "Highest Package", value: "₹48 LPA", change: "Goldman Sachs" },
    { label: "Avg Package", value: "₹14.2 LPA", change: "+2.1 LPA vs last year" },
    { label: "Placement Rate", value: "92%", change: "+4% vs last year" },
    { label: "Active Members", value: "6", change: "TNP Team 2023-24" },
  ];

  return (
    <div style={{ animation: "fadeUp 0.3s ease" }}>
      <div style={{ marginBottom: "32px" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "40px", letterSpacing: "0.04em" }}>
          WELCOME BACK, {user.name.split(" ")[0].toUpperCase()}
        </h2>
        <p style={{ color: "var(--white-60)", fontSize: "14px", fontFamily: "var(--font-mono)" }}>
          Placement Season 2024-25 · {user.globalRole === "SUPER_ADMIN" ? "Full Access" : ROLE_LABELS[user.tnpRole]} View
        </p>
      </div>

      {/* Metrics grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px", marginBottom: "40px" }}>
        {metrics.map((m, i) => (
          <div key={i} style={{
            padding: "20px", background: "var(--black-card)",
            border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px",
            animation: `fadeUp 0.3s ease ${i * 0.05}s both`,
          }}>
            <div style={{ fontSize: "11px", color: "var(--white-60)", fontFamily: "var(--font-mono)", letterSpacing: "0.06em", marginBottom: "8px", textTransform: "uppercase" }}>
              {m.label}
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "32px", letterSpacing: "0.03em", marginBottom: "4px" }}>
              {m.value}
            </div>
            <div style={{ fontSize: "11px", color: "var(--orange)", fontFamily: "var(--font-mono)" }}>{m.change}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: "24px", letterSpacing: "0.06em", marginBottom: "16px", color: "var(--white-60)" }}>
          QUICK ACTIONS
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "12px" }}>
          {[
            { label: "Add Company Record", desc: "Log a new company visit", action: "write_company", icon: "⊕" },
            { label: "Record Placement", desc: "Mark student as placed", action: "write_placement", icon: "◈" },
            { label: "Bulk Import", desc: "Upload CSV of records", action: "write_company", icon: "⊞" },
            { label: "Manage Members", desc: "Add / update TNP team", action: "manage_members", icon: "◎" },
            { label: "Change Roles", desc: "Reassign member roles", action: "change_roles", icon: "⟳" },
            { label: "Sync Hired Count", desc: "Recalculate studentsHired", action: "write_company", icon: "⟲" },
          ].map((a, i) => {
            const allowed = canAccess(user, a.action);
            return (
              <div key={i} style={{
                padding: "20px", borderRadius: "8px",
                background: allowed ? "rgba(244,96,12,0.06)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${allowed ? "rgba(244,96,12,0.2)" : "rgba(255,255,255,0.06)"}`,
                opacity: allowed ? 1 : 0.5, cursor: allowed ? "pointer" : "not-allowed",
                transition: "all 0.15s",
              }}
                onMouseEnter={e => { if (allowed) e.currentTarget.style.background = "rgba(244,96,12,0.12)"; }}
                onMouseLeave={e => { if (allowed) e.currentTarget.style.background = "rgba(244,96,12,0.06)"; }}
              >
                <div style={{ fontSize: "20px", marginBottom: "8px", color: allowed ? "var(--orange)" : "var(--white-30)" }}>{a.icon}</div>
                <div style={{ fontWeight: 600, fontSize: "14px", marginBottom: "4px" }}>{a.label}</div>
                <div style={{ fontSize: "12px", color: "var(--white-60)" }}>{a.desc}</div>
                {!allowed && <div style={{ fontSize: "10px", color: "#ef4444", fontFamily: "var(--font-mono)", marginTop: "8px" }}>Insufficient Role</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ── Portal: Companies ─────────────────────────────────────────────────────────
const PortalCompanies = ({ user }) => {
  const [adding, setAdding] = useState(false);
  const canWrite = canAccess(user, "write_company");

  return (
    <div style={{ animation: "fadeUp 0.3s ease" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px" }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "40px", letterSpacing: "0.04em" }}>COMPANIES</h2>
          <p style={{ color: "var(--white-60)", fontSize: "13px", fontFamily: "var(--font-mono)" }}>Session 2024-25 · {COMPANIES.length} records</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          {canWrite && <OrangeBtn small outline>Bulk Import</OrangeBtn>}
          {canWrite && <OrangeBtn small onClick={() => setAdding(!adding)}>+ Add Company</OrangeBtn>}
        </div>
      </div>

      {/* Add form */}
      {adding && canWrite && (
        <div style={{
          padding: "24px", background: "var(--black-card)", border: "1px solid rgba(244,96,12,0.3)",
          borderRadius: "8px", marginBottom: "24px", animation: "fadeUp 0.2s ease",
        }}>
          <h4 style={{ fontFamily: "var(--font-display)", fontSize: "20px", letterSpacing: "0.05em", marginBottom: "20px", color: "var(--orange)" }}>
            ADD COMPANY RECORD
          </h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px", marginBottom: "20px" }}>
            {[
              { label: "Company Name", placeholder: "e.g. Google" },
              { label: "Industry", placeholder: "e.g. it-services" },
              { label: "Package Offered (LPA)", placeholder: "e.g. 32" },
              { label: "Students Hired", placeholder: "e.g. 12" },
              { label: "Academic Session (Year)", placeholder: "e.g. 2024" },
            ].map(f => (
              <div key={f.label}>
                <label style={{ fontSize: "11px", color: "var(--white-60)", fontFamily: "var(--font-mono)", letterSpacing: "0.06em", display: "block", marginBottom: "6px" }}>
                  {f.label.toUpperCase()}
                </label>
                <input placeholder={f.placeholder} style={{
                  width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px",
                  color: "white", fontSize: "14px", fontFamily: "var(--font-body)", outline: "none",
                }} />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <OrangeBtn small>Save Record</OrangeBtn>
            <OrangeBtn small outline onClick={() => setAdding(false)}>Cancel</OrangeBtn>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              {["Company", "Sector", "Package", "Hired", "Session", canWrite ? "Actions" : ""].filter(Boolean).map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--white-60)", letterSpacing: "0.06em", fontWeight: 500 }}>
                  {h.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPANIES.map((c, i) => (
              <tr key={c.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                      width: "28px", height: "28px", borderRadius: "4px", flexShrink: 0,
                      background: `${c.color}18`, display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: "11px", fontFamily: "var(--font-display)", color: c.color,
                    }}>{c.logo}</div>
                    <span style={{ fontWeight: 500 }}>{c.name}</span>
                  </div>
                </td>
                <td style={{ padding: "14px 16px", color: "var(--white-60)", fontFamily: "var(--font-mono)", fontSize: "12px" }}>{c.sector}</td>
                <td style={{ padding: "14px 16px", color: "var(--orange)", fontWeight: 600, fontFamily: "var(--font-display)", fontSize: "16px", letterSpacing: "0.03em" }}>{c.pkg}</td>
                <td style={{ padding: "14px 16px", color: "var(--white-60)" }}>{c.hires}</td>
                <td style={{ padding: "14px 16px" }}><Badge>2024-25</Badge></td>
                {canWrite && (
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button style={{ padding: "4px 10px", borderRadius: "4px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--white-60)", fontSize: "12px", cursor: "pointer" }}>Edit</button>
                      <button style={{ padding: "4px 10px", borderRadius: "4px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", fontSize: "12px", cursor: "pointer" }}>Delete</button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── Portal: Placements ───────────────────────────────────────────────────────
const PortalPlacements = ({ user }) => {
  const canWrite = canAccess(user, "write_placement");
  const [search, setSearch] = useState("");
  const filtered = PLACED_STUDENTS.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.company.toLowerCase().includes(search.toLowerCase()) ||
    s.prn.includes(search)
  );

  return (
    <div style={{ animation: "fadeUp 0.3s ease" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px" }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "40px", letterSpacing: "0.04em" }}>PLACEMENTS</h2>
          <p style={{ color: "var(--white-60)", fontSize: "13px", fontFamily: "var(--font-mono)" }}>420 total · showing sample records</p>
        </div>
        {canWrite && <OrangeBtn small>+ Record Placement</OrangeBtn>}
      </div>

      {/* Stats bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1px", background: "rgba(255,255,255,0.08)", marginBottom: "24px", borderRadius: "8px", overflow: "hidden" }}>
        {[
          { label: "Total Placed", value: "420" },
          { label: "Avg Package", value: "₹14.2 LPA" },
          { label: "Highest", value: "₹48 LPA" },
        ].map((s, i) => (
          <div key={i} style={{ background: "var(--black-card)", padding: "20px", textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "28px", color: "var(--orange)", letterSpacing: "0.03em" }}>{s.value}</div>
            <div style={{ fontSize: "11px", color: "var(--white-60)", fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }}>{s.label.toUpperCase()}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <input value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Search by name, PRN, or company..."
        style={{
          width: "100%", padding: "12px 16px", marginBottom: "16px",
          background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "6px", color: "white", fontSize: "14px", fontFamily: "var(--font-body)", outline: "none",
        }}
      />

      {/* List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1px", background: "rgba(255,255,255,0.06)", borderRadius: "8px", overflow: "hidden" }}>
        {filtered.map((s, i) => {
          const company = COMPANIES.find(c => c.name === s.company);
          return (
            <div key={s.prn} style={{
              background: "var(--black-card)", padding: "16px 20px",
              display: "flex", alignItems: "center", gap: "16px",
              transition: "background 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--black-elevated)"}
              onMouseLeave={e => e.currentTarget.style.background = "var(--black-card)"}
            >
              <div style={{
                width: "40px", height: "40px", borderRadius: "50%", flexShrink: 0,
                background: "linear-gradient(135deg, var(--orange), #c44d0a)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 600, fontSize: "13px",
              }}>{s.initials}</div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 500, fontSize: "15px" }}>{s.name}</div>
                <div style={{ fontSize: "12px", color: "var(--white-60)", fontFamily: "var(--font-mono)" }}>{s.prn} · {s.dept}</div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{
                  width: "24px", height: "24px", borderRadius: "4px",
                  background: `${company?.color || "#fff"}18`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "10px", fontFamily: "var(--font-display)", color: company?.color,
                }}>{company?.logo}</div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 500 }}>{s.company}</div>
                  <div style={{ fontSize: "11px", color: "var(--white-60)", fontFamily: "var(--font-mono)" }}>{s.role}</div>
                </div>
              </div>

              <div style={{
                padding: "6px 14px", borderRadius: "4px",
                background: "rgba(244,96,12,0.12)", border: "1px solid var(--orange-border)",
                fontFamily: "var(--font-display)", fontSize: "16px", letterSpacing: "0.04em", color: "var(--orange)",
                flexShrink: 0,
              }}>{s.pkg}</div>

              {canWrite && (
                <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                  <button style={{ padding: "4px 10px", borderRadius: "4px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--white-60)", fontSize: "12px", cursor: "pointer" }}>Edit</button>
                  <button style={{ padding: "4px 10px", borderRadius: "4px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", fontSize: "12px", cursor: "pointer" }}>Del</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Portal: Members ───────────────────────────────────────────────────────────
const PortalMembers = ({ user }) => {
  const canChangeRoles = canAccess(user, "change_roles");
  const sorted = [...TNP_MEMBERS].sort((a, b) => ROLE_RANK[a.role] - ROLE_RANK[b.role]);

  return (
    <div style={{ animation: "fadeUp 0.3s ease" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px" }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "40px", letterSpacing: "0.04em" }}>TNP MEMBERS</h2>
          <p style={{ color: "var(--white-60)", fontSize: "13px", fontFamily: "var(--font-mono)" }}>
            Active team · 2023-24 tenure
            {!canChangeRoles && <span style={{ color: "var(--orange)", marginLeft: "8px" }}>· Role changes require TNP_HEAD</span>}
          </p>
        </div>
        <OrangeBtn small>+ Add Member</OrangeBtn>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
        {sorted.map((m, i) => (
          <div key={m.prn} style={{
            background: "var(--black-card)", border: `1px solid ${m.role === "TNP_HEAD" ? "rgba(244,96,12,0.3)" : "rgba(255,255,255,0.08)"}`,
            borderRadius: "8px", padding: "24px",
            animation: `fadeUp 0.3s ease ${i * 0.06}s both`,
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
              <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                <div style={{
                  width: "48px", height: "48px", borderRadius: "50%",
                  background: m.role === "TNP_HEAD" ? "linear-gradient(135deg, var(--orange), #c44d0a)" :
                    m.role === "PRESIDENT" ? "linear-gradient(135deg, #6366f1, #4338ca)" :
                    m.role === "VICE_PRESIDENT" ? "linear-gradient(135deg, #14b8a6, #0d9488)" :
                    "linear-gradient(135deg, #374151, #1f2937)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 600, fontSize: "16px", flexShrink: 0,
                }}>{m.initials}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "15px" }}>{m.name}</div>
                  <div style={{ fontSize: "11px", color: "var(--white-60)", fontFamily: "var(--font-mono)" }}>{m.prn}</div>
                </div>
              </div>
              <Badge variant={m.role === "TNP_HEAD" ? "orange" : "default"}>
                {ROLE_LABELS[m.role]}
              </Badge>
            </div>
            <div style={{ paddingTop: "14px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "12px", color: "var(--white-60)", fontFamily: "var(--font-mono)" }}>{m.dept} · Year {m.year}</div>
                <div style={{ fontSize: "12px", color: "var(--white-30)", fontFamily: "var(--font-mono)" }}>Tenure: {m.tenure}</div>
              </div>
              {canChangeRoles && m.role !== "TNP_HEAD" && (
                <div style={{ display: "flex", gap: "6px" }}>
                  <button style={{ padding: "4px 10px", borderRadius: "4px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--white-60)", fontSize: "12px", cursor: "pointer" }}>
                    Change Role
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Footer ────────────────────────────────────────────────────────────────────
const Footer = () => (
  <footer style={{
    borderTop: "1px solid rgba(255,255,255,0.08)",
    padding: "48px 80px 32px",
    background: "var(--black)",
  }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "40px", flexWrap: "wrap", gap: "32px" }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
          <div style={{
            width: "28px", height: "28px", borderRadius: "4px",
            background: "var(--orange)", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "16px", color: "white", lineHeight: 1 }}>T</span>
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "20px", letterSpacing: "0.05em" }}>TNP CELL</span>
        </div>
        <p style={{ color: "var(--white-60)", fontSize: "13px", maxWidth: "280px", lineHeight: 1.7 }}>
          Training & Placement Cell — bridging the gap between academia and industry.
        </p>
      </div>
      <div style={{ display: "flex", gap: "64px", flexWrap: "wrap" }}>
        {[
          { title: "Quick Links", links: ["Companies", "Placements", "Our Team", "Statistics"] },
          { title: "Session", links: ["2024-25 (Current)", "2023-24", "2022-23", "Archive"] },
          { title: "Contact", links: ["tnp@college.ac.in", "+91 98765 43210", "Room 204, Admin Block"] },
        ].map(col => (
          <div key={col.title}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--orange)", letterSpacing: "0.1em", marginBottom: "12px" }}>{col.title.toUpperCase()}</div>
            {col.links.map(l => (
              <div key={l} style={{ fontSize: "13px", color: "var(--white-60)", marginBottom: "6px", cursor: "pointer" }}
                onMouseEnter={e => e.target.style.color = "white"} onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.6)"}
              >{l}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
    <Divider />
    <div style={{ marginTop: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
      <span style={{ fontSize: "12px", color: "var(--white-30)", fontFamily: "var(--font-mono)" }}>
        © 2024 Training & Placement Cell. All rights reserved.
      </span>
      <div style={{ display: "flex", gap: "8px" }}>
        {["Policy", "Contact", "Grievance"].map(l => (
          <span key={l} style={{ fontSize: "12px", color: "var(--white-30)", cursor: "pointer", fontFamily: "var(--font-mono)" }}>{l}</span>
        ))}
      </div>
    </div>
  </footer>
);

// ── APP ROOT ──────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("landing");

  useEffect(() => {
    if (view === "landing") window.scrollTo({ top: 0, behavior: "smooth" });
  }, [view]);

  return (
    <>
      <FontLoader />
      <Nav user={user} setUser={setUser} view={view} setView={setView} />

      {view === "landing" ? (
        <main>
          <Hero user={user} setView={setView} />
          <CompaniesSection />
          <PlacementsSection />
          <TeamSection setView={setView} user={user} />
          <Footer />
        </main>
      ) : (
        <Portal user={user} />
      )}
    </>
  );
}