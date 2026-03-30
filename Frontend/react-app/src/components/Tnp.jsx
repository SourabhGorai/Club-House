import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import TnpTopNav from "./tnp/TnpTopNav";
import TnpPublicAccessView from "./tnp/TnpPublicAccessView";
import TnpMemberAccessView from "./tnp/TnpMemberAccessView";
import PortalIndustrySessionAdmin from "./tnp/PortalIndustrySessionAdmin";
import ConfirmDialog from "./ConfirmDialog";
import CustomSelect from "./CustomSelect";
import DateTimePicker from "./Datetimepicker";

// ── Google Fonts ──────────────────────────────────────────────────────────────
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Mono:wght@400;500&display=swap');

    .tnp-root *, .tnp-root *::before, .tnp-root *::after { box-sizing: border-box; margin: 0; padding: 0; }

    .tnp-root {
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
      font-family: var(--font-body);
      background: var(--black);
      color: var(--white);
      line-height: 1.6;
      min-height: 100vh;
    }

    .tnp-root ::selection { background: var(--orange); color: var(--white); }
    .tnp-root ::-webkit-scrollbar { width: 4px; }
    .tnp-root ::-webkit-scrollbar-track { background: var(--black); }
    .tnp-root ::-webkit-scrollbar-thumb { background: var(--orange); border-radius: 2px; }

    @keyframes tnpFadeUp {
      from { opacity: 0; transform: translateY(24px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes tnpFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes tnpPulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    @keyframes tnpMarquee {
      from { transform: translateX(0); }
      to { transform: translateX(-50%); }
    }
    @keyframes tnpGlow {
      0%, 100% { box-shadow: 0 0 20px rgba(244,96,12,0.2); }
      50% { box-shadow: 0 0 40px rgba(244,96,12,0.5); }
    }
    @keyframes tnpSpin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `}</style>
);

// ── Config ────────────────────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_URL || "http://72.155.88.211:8080";

// ── Permissions (mirrors backend logic) ──────────────────────────────────────
const canAccess = (globalRole, tnpRole, action) => {
  if (globalRole === "SUPER_ADMIN") return true;
  const adminRoles = ["TNP_HEAD", "PRESIDENT", "VICE_PRESIDENT"];
  const allTnpRoles = [...adminRoles, "CO_ORDINATOR"];
  switch (action) {
    case "enter_portal":
      return allTnpRoles.includes(tnpRole);
    case "write_company":
      return allTnpRoles.includes(tnpRole);
    case "write_company_master":
      return allTnpRoles.includes(tnpRole);
    case "delete_records":
      return adminRoles.includes(tnpRole);
    case "write_placement":
      return allTnpRoles.includes(tnpRole);
    case "manage_members":
      return adminRoles.includes(tnpRole);
    case "change_roles":
      return tnpRole === "TNP_HEAD";
    default:
      return false;
  }
};

const ROLE_LABELS = {
  TNP_HEAD: "Head",
  PRESIDENT: "President",
  VICE_PRESIDENT: "Vice President",
  CO_ORDINATOR: "Coordinator",
};

const ROLE_RANK = {
  TNP_HEAD: 0,
  PRESIDENT: 1,
  VICE_PRESIDENT: 2,
  CO_ORDINATOR: 3,
};
const TNP_VIEW_STORAGE_KEY = "tnp:view";
const TNP_PORTAL_TAB_STORAGE_KEY = "tnp:portalTab";

// ── Tiny UI Components ────────────────────────────────────────────────────────
const Badge = ({ children, variant = "default" }) => {
  const styles = {
    default: { bg: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" },
    orange: { bg: "rgba(244,96,12,0.15)", color: "#F4600C" },
    success: { bg: "rgba(34,197,94,0.15)", color: "#22c55e" },
  };
  const s = styles[variant] || styles.default;
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 10px",
        borderRadius: "99px",
        fontSize: "11px",
        fontWeight: 500,
        letterSpacing: "0.05em",
        fontFamily: "var(--font-mono)",
        textTransform: "uppercase",
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.color}30`,
      }}
    >
      {children}
    </span>
  );
};

const OrangeBtn = ({
  children,
  onClick,
  small,
  outline,
  disabled,
  type = "button",
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      padding: small ? "8px 18px" : "12px 28px",
      fontSize: small ? "13px" : "15px",
      fontWeight: 600,
      fontFamily: "var(--font-body)",
      letterSpacing: "0.02em",
      borderRadius: "var(--radius)",
      background: outline ? "transparent" : disabled ? "#333" : "var(--orange)",
      color: outline ? "var(--orange)" : disabled ? "#666" : "var(--white)",
      border: outline ? "1px solid var(--orange)" : "none",
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "all 0.15s ease",
    }}
    onMouseEnter={(e) => {
      if (!disabled) e.currentTarget.style.opacity = "0.85";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.opacity = "1";
    }}
  >
    {children}
  </button>
);

const Divider = () => (
  <div style={{ height: "1px", background: "rgba(255,255,255,0.08)" }} />
);

const Spinner = ({ size = 32 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      border: `2px solid rgba(244,96,12,0.2)`,
      borderTopColor: "var(--orange)",
      animation: "tnpSpin 0.8s linear infinite",
    }}
  />
);

const ErrorBox = ({ message, onRetry }) => (
  <div
    style={{
      padding: "24px",
      background: "rgba(239,68,68,0.08)",
      border: "1px solid rgba(239,68,68,0.2)",
      borderRadius: "8px",
      textAlign: "center",
    }}
  >
    <div style={{ color: "#ef4444", marginBottom: "8px", fontSize: "14px" }}>
      {message}
    </div>
    {onRetry && (
      <OrangeBtn small outline onClick={onRetry}>
        Retry
      </OrangeBtn>
    )}
  </div>
);

// ── Hook: useApi ──────────────────────────────────────────────────────────────
function useApi(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const fetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${BASE_URL}${url}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-User-PRN": user?.prn || "",
          "X-User-Role": user?.role || "USER",
          ...options.headers,
        },
        params: options.params,
      });
      setData(res.data?.data ?? res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (url) fetch();
  }, [url]);

  return { data, loading, error, refetch: fetch };
}

// ── Academic session helper (year starts July 1) ──────────────────────────────
// e.g. March 2026 → "2025-26", August 2025 → "2025-26"
function getCurrentSession() {
  const now = new Date();
  const startYear =
    now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
  return `${startYear}-${String(startYear + 1).slice(2)}`;
}

// ── Auth headers helper ───────────────────────────────────────────────────────
function authHeaders() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return {
    Authorization: `Bearer ${token}`,
    "X-User-PRN": user?.prn || "",
    "X-User-Role": user?.role || "USER",
    "Content-Type": "application/json",
  };
}

function resolveMediaUrl(imageUrl) {
  if (!imageUrl) return null;
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  return `${BASE_URL}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
}

function toLocalDateTimeWithSeconds(value, endOfDay = false) {
  if (!value) return value;
  if (value.length === 10) {
    return `${value}T${endOfDay ? "23:59:59" : "00:00:00"}`;
  }
  return value.length === 16 ? `${value}:00` : value;
}

function useAppConfirmDialog(isDarkMode = true) {
  const resolverRef = useRef(null);
  const [dialog, setDialog] = useState({
    isOpen: false,
    title: "Are you sure?",
    message: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    variant: "primary",
  });

  const close = () => {
    setDialog((prev) => ({ ...prev, isOpen: false }));
    if (resolverRef.current) {
      resolverRef.current(false);
      resolverRef.current = null;
    }
  };

  const confirm = ({
    title = "Are you sure?",
    message = "",
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "primary",
  } = {}) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setDialog({
        isOpen: true,
        title,
        message,
        confirmText,
        cancelText,
        variant,
      });
    });
  };

  const onConfirm = () => {
    setDialog((prev) => ({ ...prev, isOpen: false }));
    if (resolverRef.current) {
      resolverRef.current(true);
      resolverRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (resolverRef.current) {
        resolverRef.current(false);
        resolverRef.current = null;
      }
    };
  }, []);

  const dialogNode = (
    <ConfirmDialog
      isOpen={dialog.isOpen}
      isDarkMode={isDarkMode}
      title={dialog.title}
      message={dialog.message}
      confirmText={dialog.confirmText}
      cancelText={dialog.cancelText}
      variant={dialog.variant}
      onConfirm={onConfirm}
      onCancel={close}
    />
  );

  return { confirm, dialogNode };
}

const TNP_SELECT_THEME = {
  primaryColor: "#F4600C",
  primaryLight: "rgba(244,96,12,0.15)",
  borderColor: "rgba(255,255,255,0.1)",
  textPrimary: "#FFFFFF",
  textMuted: "rgba(255,255,255,0.6)",
  bgCard: "#161616",
  accentSoft: "rgba(255,255,255,0.05)",
};

async function fetchProtectedImageBlobUrl(imageUrl) {
  const token = localStorage.getItem("token");
  const fullUrl = resolveMediaUrl(imageUrl);
  if (!token || !fullUrl) return null;

  try {
    const res = await axios.get(fullUrl, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: "blob",
    });

    if (res.data?.size > 0) {
      return URL.createObjectURL(res.data);
    }
  } catch {
    return null;
  }

  return null;
}

// ── LANDING PAGE ──────────────────────────────────────────────────────────────
const Hero = ({ user, tnpRole, stats, onEnterPortal }) => {
  const canEnter = canAccess(user?.role, tnpRole, "enter_portal");

  const statCards = [
    {
      label: "Companies Visited",
      value: stats?.totalCompanies ?? "—",
      suffix: "",
    },
    {
      label: "Students Placed",
      value: stats?.totalPlacements ?? "—",
      suffix: "+",
    },
    {
      label: "Highest Package",
      value: stats?.highestPackage ? `₹${stats.highestPackage}` : "—",
      suffix: " LPA",
    },
    {
      label: "Average Package",
      value: stats?.averagePackage
        ? `₹${parseFloat(stats.averagePackage).toFixed(1)}`
        : "—",
      suffix: " LPA",
    },
  ];

  return (
    <section
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "0 80px 80px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          backgroundImage: `
          linear-gradient(rgba(244,96,12,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(244,96,12,0.03) 1px, transparent 1px)
        `,
          backgroundSize: "60px 60px",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "20%",
          right: "10%",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(244,96,12,0.12) 0%, transparent 70%)",
          zIndex: 0,
          animation: "tnpGlow 4s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          right: "30%",
          width: "1px",
          height: "100%",
          background:
            "linear-gradient(to bottom, transparent, rgba(244,96,12,0.2), transparent)",
          zIndex: 0,
        }}
      />

      <div style={{ position: "relative", zIndex: 1, maxWidth: "900px" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 14px",
            borderRadius: "99px",
            border: "1px solid var(--orange-border)",
            background: "var(--orange-dim)",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "var(--orange)",
              animation: "tnpPulse 2s infinite",
            }}
          />
          <span
            style={{
              fontSize: "12px",
              fontFamily: "var(--font-mono)",
              color: "var(--orange)",
              letterSpacing: "0.08em",
            }}
          >
            PLACEMENT SEASON 2024–25 · ACTIVE
          </span>
        </div>

        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(72px, 12vw, 140px)",
            lineHeight: 0.9,
            letterSpacing: "0.02em",
            marginBottom: "32px",
          }}
        >
          <span style={{ display: "block", color: "var(--white)" }}>
            TRAINING
          </span>
          <span style={{ display: "block", color: "var(--orange)" }}>&</span>
          <span style={{ display: "block", color: "var(--white)" }}>
            PLACEMENT
          </span>
        </h1>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: "48px",
            flexWrap: "wrap",
          }}
        >
          <p
            style={{
              fontSize: "18px",
              color: "var(--white-60)",
              maxWidth: "480px",
              fontWeight: 300,
              lineHeight: 1.7,
            }}
          >
            Connecting exceptional talent with industry leaders. The official
            placement cell — driving careers, building futures.
          </p>
          {/* <div style={{ display: "flex", gap: "12px", flexShrink: 0 }}>
            {canEnter && (
              <OrangeBtn onClick={onEnterPortal}>Enter TNP Portal →</OrangeBtn>
            )}
            <OrangeBtn outline onClick={() => document.getElementById("tnp-companies")?.scrollIntoView({ behavior: "smooth" })}>
              Explore
            </OrangeBtn>
          </div> */}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "0",
          right: "0",
          display: "flex",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          borderLeft: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {statCards.map((s, i) => (
          <div
            key={i}
            style={{
              padding: "20px 32px",
              borderRight: "1px solid rgba(255,255,255,0.08)",
              textAlign: "center",
              animation: `tnpFadeUp 0.6s ease ${i * 0.1}s both`,
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "32px",
                color: "var(--orange)",
                letterSpacing: "0.02em",
              }}
            >
              {s.value}
              <span style={{ fontSize: "18px" }}>{s.suffix}</span>
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "var(--white-60)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontFamily: "var(--font-mono)",
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// ── Companies Section ─────────────────────────────────────────────────────────
const CompaniesSection = () => {
  const [filter, setFilter] = useState("All");
  const [companies, setCompanies] = useState([]);
  const [failedLogos, setFailedLogos] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const compRes = await axios.get(
        `${BASE_URL}/api/companyMaster/all/getAll`,
        {
          headers: authHeaders(),
        },
      );
      const raw = compRes.data?.data ?? compRes.data;
      setCompanies(Array.isArray(raw) ? raw : raw?.content || []);
      setFailedLogos({});
    } catch (err) {
      setError("Failed to load companies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered =
    filter === "All"
      ? companies
      : companies.filter((c) => c.industry === filter);

  const sectors = [
    "All",
    ...Array.from(new Set(companies.map((c) => c.industry).filter(Boolean))),
  ];

  // Color palette for companies
  const colors = [
    "#4285F4",
    "#00BCF2",
    "#007CC5",
    "#CC0001",
    "#86BC25",
    "#6495ED",
    "#FF9900",
    "#341F6A",
    "#A100FF",
    "#003087",
    "#F74E30",
    "#FC8019",
  ];
  const getColor = (name) =>
    colors[name?.charCodeAt(0) % colors.length] || "#888";

  return (
    <section
      id="tnp-companies"
      style={{ padding: "100px 0", overflow: "hidden" }}
    >
      <div style={{ padding: "0 80px", marginBottom: "60px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: "40px",
          }}
        >
          <div>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                color: "var(--orange)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Our Recruiters
            </span>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "64px",
                letterSpacing: "0.03em",
                marginTop: "4px",
                lineHeight: 1,
              }}
            >
              COMPANIES
            </h2>
          </div>
          <div
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >
            {sectors.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                style={{
                  padding: "6px 16px",
                  borderRadius: "99px",
                  fontSize: "13px",
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.03em",
                  background: filter === s ? "var(--orange)" : "transparent",
                  color: filter === s ? "white" : "var(--white-60)",
                  border:
                    filter === s ? "none" : "1px solid rgba(255,255,255,0.15)",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <Divider />
      </div>

      {/* Marquee */}
      {companies.length > 0 && (
        <div
          style={{
            overflow: "hidden",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            padding: "20px 0",
            marginBottom: "60px",
          }}
        >
          <div
            style={{
              display: "flex",
              animation: "tnpMarquee 30s linear infinite",
              width: "max-content",
            }}
          >
            {[...companies, ...companies].map((c, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "0 32px",
                  whiteSpace: "nowrap",
                  color: "var(--white-30)",
                  fontSize: "13px",
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.05em",
                }}
              >
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: getColor(c.name),
                    opacity: 0.8,
                  }}
                />
                {c.name?.toUpperCase()}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ padding: "0 80px" }}>
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "60px",
            }}
          >
            <Spinner size={40} />
          </div>
        ) : error ? (
          <ErrorBox message={error} onRetry={loadData} />
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "1px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {filtered.map((c, i) => {
              const color = getColor(c.name);
              const logo = c.name?.slice(0, 2).toUpperCase() || "?";
              const logoKey = c.companyMasterId || c.name || i;
              const cleanedLogoUrl =
                typeof c.logoUrl === "string" ? c.logoUrl.trim() : "";
              const logoSrc = cleanedLogoUrl
                ? resolveMediaUrl(cleanedLogoUrl)
                : null;
              const showLogo = logoSrc && !failedLogos[logoKey];
              return (
                <div
                  key={c.companyMasterId || i}
                  style={{
                    background: "var(--black-soft)",
                    padding: "28px 24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    transition: "background 0.2s",
                    animation: `tnpFadeUp 0.4s ease ${i * 0.03}s both`,
                    cursor: "default",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--black-elevated)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "var(--black-soft)")
                  }
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                    }}
                  >
                    {showLogo ? (
                      <img
                        src={logoSrc}
                        alt={c.name}
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        onError={() =>
                          setFailedLogos((prev) => ({
                            ...prev,
                            [logoKey]: true,
                          }))
                        }
                        style={{
                          width: "52px",
                          height: "52px",
                          borderRadius: "10px",
                          objectFit: "cover",
                          flexShrink: 0,
                          border: "1px solid rgba(255,255,255,0.1)",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "52px",
                          height: "52px",
                          borderRadius: "10px",
                          background: `${color}18`,
                          border: `1px solid ${color}30`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: "var(--font-display)",
                          fontSize: "18px",
                          color,
                          letterSpacing: "0.02em",
                          flexShrink: 0,
                        }}
                      >
                        {logo}
                      </div>
                    )}
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "15px" }}>
                        {c.name}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "var(--white-60)",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {c.industry}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && !loading && (
              <div
                style={{
                  gridColumn: "1/-1",
                  padding: "60px",
                  textAlign: "center",
                  color: "var(--white-30)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                No companies found
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

// ── Placements Section ────────────────────────────────────────────────────────
const PlacementsSection = () => {
  const [placements, setPlacements] = useState([]);
  const [placementImageMap, setPlacementImageMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const currentSession = getCurrentSession();

  const perSlide = 6;

  const chunkPlacements = (items, size) => {
    if (!items.length) return [];
    const chunks = [];
    for (let i = 0; i < items.length; i += size) {
      chunks.push(items.slice(i, i + size));
    }
    return chunks;
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const pageSize = 50;
      let page = 0;
      let allPlacements = [];
      let hasNext = true;

      while (hasNext) {
        const res = await axios.get(
          `${BASE_URL}/api/placements/all/session/${encodeURIComponent(currentSession)}`,
          {
            headers: authHeaders(),
            params: { page, size: pageSize },
          },
        );

        const raw = res.data?.data ?? res.data;
        if (Array.isArray(raw)) {
          allPlacements = raw;
          hasNext = false;
        } else {
          const content = Array.isArray(raw?.content) ? raw.content : [];
          allPlacements = [...allPlacements, ...content];
          const totalPages = Number(raw?.totalPages ?? 0);
          const isLast = raw?.last === true;
          hasNext =
            !isLast &&
            (totalPages > 0
              ? page + 1 < totalPages
              : content.length === pageSize);
          page += 1;

          if (content.length === 0) {
            hasNext = false;
          }
        }
      }

      setPlacements(allPlacements);
    } catch (err) {
      setError("Failed to load placements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentSession]);

  useEffect(() => {
    let isActive = true;
    let createdUrls = [];

    const loadImages = async () => {
      const withImages = placements.filter(
        (s) => s?.imageUrl && (s?.placementId || s?.studentPrn),
      );

      if (!withImages.length) {
        setPlacementImageMap({});
        return;
      }

      const results = await Promise.all(
        withImages.map(async (s) => {
          const key = s.placementId || s.studentPrn;
          const blobUrl = await fetchProtectedImageBlobUrl(s.imageUrl);
          if (blobUrl) createdUrls.push(blobUrl);
          return { key, blobUrl };
        }),
      );

      if (!isActive) {
        createdUrls.forEach((u) => URL.revokeObjectURL(u));
        return;
      }

      const nextMap = {};
      results.forEach((r) => {
        if (r?.key && r.blobUrl) nextMap[r.key] = r.blobUrl;
      });
      setPlacementImageMap(nextMap);
    };

    loadImages();

    return () => {
      isActive = false;
      createdUrls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [placements]);

  const placementSlides = chunkPlacements(placements, perSlide);
  const totalSlides = placementSlides.length;

  useEffect(() => {
    setCurrentSlide(0);
  }, [totalSlides]);

  useEffect(() => {
    if (totalSlides <= 1) return undefined;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 5000);

    return () => clearInterval(timer);
  }, [totalSlides]);

  const goPrev = () => {
    if (totalSlides <= 1) return;
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goNext = () => {
    if (totalSlides <= 1) return;
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <section id="tnp-placements" style={{ padding: "100px 80px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: "16px",
        }}
      >
        <div>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "var(--orange)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Class of 2024
          </span>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "64px",
              letterSpacing: "0.03em",
              lineHeight: 1,
            }}
          >
            PLACED STUDENTS
          </h2>
        </div>
      </div>
      <Divider />

      <div style={{ marginTop: "48px" }}>
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "60px",
            }}
          >
            <Spinner size={40} />
          </div>
        ) : error ? (
          <ErrorBox message={error} onRetry={loadData} />
        ) : (
          <>
            {totalSlides > 1 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    color: "var(--white-60)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {`Slide ${currentSlide + 1} / ${totalSlides}`}
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={goPrev}
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "50%",
                      border: "1px solid rgba(255,255,255,0.18)",
                      background: "transparent",
                      color: "var(--white)",
                      cursor: "pointer",
                      fontSize: "16px",
                    }}
                  >
                    ‹
                  </button>
                  <button
                    onClick={goNext}
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "50%",
                      border: "1px solid rgba(255,255,255,0.18)",
                      background: "transparent",
                      color: "var(--white)",
                      cursor: "pointer",
                      fontSize: "16px",
                    }}
                  >
                    ›
                  </button>
                </div>
              </div>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                gap: "1px",
                background: "rgba(255,255,255,0.06)",
              }}
            >
              {(placementSlides[currentSlide] || []).map((s, i) => {
                const imageKey = s.placementId || s.studentPrn;
                const imageSrc = imageKey ? placementImageMap[imageKey] : null;
                return (
                  <div
                    key={s.placementId || i}
                    style={{
                      padding: "8px",
                      background: "var(--black-soft)",
                      display: "grid",
                      gridTemplateColumns: "120px 1fr",
                      alignItems: "stretch",
                      minHeight: "132px",
                      overflow: "hidden",
                      borderRadius: "14px",
                      transition: "background 0.2s",
                      animation: `tnpFadeUp 0.4s ease ${i * 0.06}s both`,
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "var(--black-elevated)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "var(--black-soft)")
                    }
                  >
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt={s.studentName}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                          borderRadius: "10px",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          background:
                            "linear-gradient(135deg, var(--orange), #c44d0a)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 600,
                          fontSize: "28px",
                          color: "white",
                          borderRadius: "10px",
                        }}
                      >
                        {getInitials(s.studentName)}
                      </div>
                    )}
                    <div style={{ minWidth: 0, padding: "20px" }}>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: "16px",
                          marginBottom: "2px",
                        }}
                      >
                        {s.studentName || s.studentPrn}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "var(--white-60)",
                          fontFamily: "var(--font-mono)",
                          marginBottom: "12px",
                        }}
                      >
                        {s.department || "—"}
                        {s.year ? ` · Year ${s.year}` : ""}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: 500 }}>
                            {s.companyName}
                          </div>
                          <div
                            style={{
                              fontSize: "11px",
                              color: "var(--white-60)",
                              fontFamily: "var(--font-mono)",
                            }}
                          >
                            {s.role}
                          </div>
                        </div>
                        <div
                          style={{
                            padding: "4px 12px",
                            borderRadius: "4px",
                            background: "rgba(244,96,12,0.12)",
                            border: "1px solid var(--orange-border)",
                            fontSize: "13px",
                            fontWeight: 600,
                            color: "var(--orange)",
                            fontFamily: "var(--font-display)",
                            letterSpacing: "0.04em",
                          }}
                        >
                          {s.packageOffered ? `${s.packageOffered} LPA` : "—"}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {placements.length === 0 && (
                <div
                  style={{
                    gridColumn: "1/-1",
                    padding: "60px",
                    textAlign: "center",
                    color: "var(--white-30)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  No placements recorded yet
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

// ── Session Company Insights Section ─────────────────────────────────────────
const SessionCompanyInsightsSection = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(getCurrentSession());
  const [rows, setRows] = useState([]);
  const [sessionStats, setSessionStats] = useState(null);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState(null);

  const loadSessions = async () => {
    setLoadingSessions(true);

    try {
      const res = await axios.get(
        `${BASE_URL}/api/visitYear/all/getAllSessions`,
        {
          headers: authHeaders(),
        },
      );

      const raw = res.data?.data ?? res.data;
      const list = Array.isArray(raw) ? raw : [];

      const sortedSessions = list
        .map((item) => item?.academicSession)
        .filter(Boolean)
        .sort((a, b) => {
          const aYear = Number(String(a).split("-")[0]) || 0;
          const bYear = Number(String(b).split("-")[0]) || 0;
          return bYear - aYear;
        });

      const fallback = getCurrentSession();
      if (!sortedSessions.includes(fallback)) {
        sortedSessions.unshift(fallback);
      }

      setSessions(sortedSessions);
      if (!sortedSessions.includes(selectedSession)) {
        setSelectedSession(sortedSessions[0] || fallback);
      }
    } catch {
      setSessions([getCurrentSession()]);
    } finally {
      setLoadingSessions(false);
    }
  };

  const loadCombinedData = async (session) => {
    if (!session) {
      setRows([]);
      setSessionStats(null);
      return;
    }

    setLoadingData(true);
    setError(null);

    try {
      const [combinedRes, statsRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/company/all/combinedPackage`, {
          headers: authHeaders(),
          params: { session },
        }),
        axios
          .get(
            `${BASE_URL}/api/placements/all/stats/${encodeURIComponent(session)}`,
            {
              headers: authHeaders(),
            },
          )
          .catch(() => ({ data: null })),
      ]);

      const raw = combinedRes.data?.data ?? [];
      setRows(Array.isArray(raw) ? raw : []);
      setSessionStats(statsRes.data?.data ?? null);
    } catch (err) {
      setRows([]);
      setSessionStats(null);
      setError(
        err.response?.data?.message || "Failed to load company insights",
      );
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    loadCombinedData(selectedSession);
  }, [selectedSession]);

  const summary = rows.reduce(
    (acc, row) => {
      acc.companyCount += 1;
      acc.totalStudents += Number(row?.studentsHired) || 0;
      return acc;
    },
    { companyCount: 0, totalStudents: 0 },
  );

  const sessionAvgRaw = Number(sessionStats?.averagePackage);
  const sessionAvg = Number.isFinite(sessionAvgRaw) && sessionAvgRaw > 0
    ? sessionAvgRaw
    : null;

  const packageAverage = (values = []) => {
    const clean = values
      .map((v) => Number(v))
      .filter((v) => Number.isFinite(v) && v > 0);

    if (!clean.length) return null;
    return clean.reduce((acc, n) => acc + n, 0) / clean.length;
  };

  return (
    <section
      id="tnp-sessions"
      style={{ padding: "100px 80px", background: "var(--black-soft)" }}
    >
      <div style={{ marginBottom: "16px" }}>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            color: "var(--orange)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Session-Wise Company Data
        </span>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "64px",
            letterSpacing: "0.03em",
            lineHeight: 1,
          }}
        >
          COMPANY INSIGHTS
        </h2>
      </div>
      <Divider />

      <div
        style={{
          marginTop: "24px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <label
          htmlFor="tnp-session-select"
          style={{
            color: "var(--white-60)",
            fontSize: "13px",
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.04em",
          }}
        >
          SESSION
        </label>
        <div style={{ minWidth: "220px" }}>
          <CustomSelect
            name="session"
            value={selectedSession}
            disabled={loadingSessions}
            onChange={(e) => setSelectedSession(e.target.value)}
            options={sessions.map((session) => ({
              value: session,
              label: session,
            }))}
            placeholder="Select session"
            theme={TNP_SELECT_THEME}
          />
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "10px",
          marginTop: "20px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            background: "var(--black-card)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "10px",
            padding: "16px",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              color: "var(--white-60)",
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.05em",
            }}
          >
            Companies
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "32px" }}>
            {summary.companyCount}
          </div>
        </div>
        <div
          style={{
            background: "var(--black-card)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "10px",
            padding: "16px",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              color: "var(--white-60)",
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.05em",
            }}
          >
            Total Students Hired
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "32px" }}>
            {summary.totalStudents}
          </div>
        </div>
        <div
          style={{
            background: "var(--black-card)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "10px",
            padding: "16px",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              color: "var(--white-60)",
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.05em",
            }}
          >
            Session Average Package
          </div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "32px",
              color: "var(--orange)",
            }}
          >
            {sessionAvg !== null ? `₹${sessionAvg.toFixed(2)} LPA` : "—"}
          </div>
        </div>
      </div>

      {error && (
        <ErrorBox
          message={error}
          onRetry={() => loadCombinedData(selectedSession)}
        />
      )}

      <div
        style={{
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "12px",
          overflow: "hidden",
          background: "var(--black-card)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr 1.1fr 1fr",
            gap: "8px",
            padding: "12px 14px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            fontSize: "12px",
            letterSpacing: "0.06em",
            color: "var(--white-60)",
            textTransform: "uppercase",
            fontFamily: "var(--font-mono)",
          }}
        >
          <div>Company</div>
          <div>Industry</div>
          <div>Package Offered</div>
          <div>Students Hired</div>
        </div>

        {loadingData ? (
          <div
            style={{
              padding: "26px",
              textAlign: "center",
              color: "var(--white-60)",
            }}
          >
            Loading data...
          </div>
        ) : rows.length === 0 ? (
          <div
            style={{
              padding: "26px",
              textAlign: "center",
              color: "var(--white-30)",
              fontFamily: "var(--font-mono)",
            }}
          >
            No company data found for this session.
          </div>
        ) : (
          rows.map((row, idx) => {
            const offers = Array.isArray(row?.packageOffered)
              ? row.packageOffered
                  .map((v) => Number(v))
                  .filter((v) => Number.isFinite(v) && v > 0)
              : [];
            const avg = packageAverage(offers);

            return (
              <div
                key={`${row?.companyId || idx}-${row?.name || "company"}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.4fr 1fr 1.1fr 1fr",
                  gap: "8px",
                  padding: "14px",
                  borderBottom:
                    idx === rows.length - 1
                      ? "none"
                      : "1px solid rgba(255,255,255,0.06)",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, marginBottom: "2px" }}>
                    {row?.name || "—"}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--white-60)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {row?.academicSession || selectedSession}
                  </div>
                </div>
                <div style={{ color: "var(--white-90)" }}>
                  {row?.industry || "—"}
                </div>
                <div>
                  <div style={{ color: "var(--orange)", fontWeight: 600 }}>
                    {avg !== null ? `Avg ₹${avg.toFixed(2)} LPA` : "—"}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--white-60)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {offers.length
                      ? `Offers: ${offers.join(", ")}`
                      : "No package entries"}
                  </div>
                </div>
                <div style={{ fontWeight: 600 }}>
                  {Number(row?.studentsHired) || 0}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};

// ── Team Section ──────────────────────────────────────────────────────────────
const TeamSection = ({ globalRole, tnpRole, onEnterPortal }) => {
  const [members, setMembers] = useState([]);
  const [memberImageMap, setMemberImageMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [coordStart, setCoordStart] = useState(0);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${BASE_URL}/api/tnp/all/getAll/true`, {
        headers: authHeaders(),
      });
      const raw = res.data?.data ?? res.data;
      setMembers(Array.isArray(raw) ? raw : raw?.content || []);
    } catch (err) {
      setError("Failed to load team members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let isActive = true;
    let createdUrls = [];

    const loadImages = async () => {
      const withImages = members.filter((m) => m?.imageUrl && m?.prn);

      if (!withImages.length) {
        setMemberImageMap({});
        return;
      }

      const results = await Promise.all(
        withImages.map(async (m) => {
          const blobUrl = await fetchProtectedImageBlobUrl(m.imageUrl);
          if (blobUrl) createdUrls.push(blobUrl);
          return { key: m.prn, blobUrl };
        }),
      );

      if (!isActive) {
        createdUrls.forEach((u) => URL.revokeObjectURL(u));
        return;
      }

      const nextMap = {};
      results.forEach((r) => {
        if (r?.key && r.blobUrl) nextMap[r.key] = r.blobUrl;
      });
      setMemberImageMap(nextMap);
    };

    loadImages();

    return () => {
      isActive = false;
      createdUrls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [members]);

  const canEnter = canAccess(globalRole, tnpRole, "enter_portal");
  const sorted = [...members].sort(
    (a, b) => (ROLE_RANK[a.role] ?? 9) - (ROLE_RANK[b.role] ?? 9),
  );
  const head = sorted.find((m) => m.role === "TNP_HEAD");
  const leadership = sorted.filter(
    (m) => m.role === "PRESIDENT" || m.role === "VICE_PRESIDENT",
  );
  const coordinators = sorted.filter((m) => m.role === "CO_ORDINATOR");
  const others = sorted.filter(
    (m) =>
      !["TNP_HEAD", "PRESIDENT", "VICE_PRESIDENT", "CO_ORDINATOR"].includes(
        m.role,
      ),
  );

  const coordinatorsPerSlide = 3;
  const canSlideCoordinators = coordinators.length > coordinatorsPerSlide;
  const coordinatorWindow = canSlideCoordinators
    ? Array.from(
        { length: coordinatorsPerSlide },
        (_, idx) => coordinators[(coordStart + idx) % coordinators.length],
      )
    : coordinators;

  const slideCoordinatorsPrev = () => {
    if (!canSlideCoordinators) return;
    setCoordStart(
      (prev) => (prev - 1 + coordinators.length) % coordinators.length,
    );
  };

  const slideCoordinatorsNext = () => {
    if (!canSlideCoordinators) return;
    setCoordStart((prev) => (prev + 1) % coordinators.length);
  };

  useEffect(() => {
    setCoordStart(0);
  }, [coordinators.length]);

  useEffect(() => {
    if (!canSlideCoordinators) return undefined;
    const timer = setInterval(() => {
      setCoordStart((prev) => (prev + 1) % coordinators.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [canSlideCoordinators, coordinators.length]);

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const MemberCard = ({ m, large, highlight }) => {
    const imageSrc = memberImageMap[m.prn] || resolveMediaUrl(m.imageUrl);

    return (
      <div
        style={{
          padding: "8px",
          background: highlight
            ? "linear-gradient(135deg, rgba(244,96,12,0.1), rgba(255,255,255,0.02))"
            : "var(--black-card)",
          border: highlight
            ? "1px solid rgba(244,96,12,0.35)"
            : "1px solid rgba(255,255,255,0.08)",
          borderRadius: "14px",
          display: "grid",
          gridTemplateColumns: large ? "140px 1fr" : "116px 1fr",
          alignItems: "stretch",
          minHeight: large ? "154px" : "132px",
          overflow: "hidden",
          transition: "border-color 0.2s, background 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = highlight
            ? "rgba(255,125,53,0.6)"
            : "rgba(244,96,12,0.4)";
          e.currentTarget.style.background = highlight
            ? "linear-gradient(135deg, rgba(244,96,12,0.16), rgba(255,255,255,0.03))"
            : "var(--black-elevated)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = highlight
            ? "rgba(244,96,12,0.35)"
            : "rgba(255,255,255,0.08)";
          e.currentTarget.style.background = highlight
            ? "linear-gradient(135deg, rgba(244,96,12,0.1), rgba(255,255,255,0.02))"
            : "var(--black-card)";
        }}
      >
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={m.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              borderRadius: "10px",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              background:
                m.role === "TNP_HEAD"
                  ? "linear-gradient(135deg, var(--orange), #c44d0a)"
                  : m.role === "PRESIDENT"
                    ? "linear-gradient(135deg, #6366f1, #4338ca)"
                    : m.role === "VICE_PRESIDENT"
                      ? "linear-gradient(135deg, #14b8a6, #0d9488)"
                      : "linear-gradient(135deg, #374151, #1f2937)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 600,
              fontSize: large ? "28px" : "24px",
              color: "white",
              borderRadius: "10px",
            }}
          >
            {getInitials(m.name)}
          </div>
        )}
        <div style={{ minWidth: 0, padding: large ? "24px" : "20px" }}>
          <div
            style={{
              fontWeight: 600,
              fontSize: large ? "20px" : "15px",
              marginBottom: "2px",
            }}
          >
            {m.name || m.prn}
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "var(--white-60)",
              fontFamily: "var(--font-mono)",
              marginBottom: "10px",
            }}
          >
            {m.department || "—"}
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <Badge variant={m.role === "TNP_HEAD" ? "orange" : "default"}>
              {ROLE_LABELS[m.role] || m.role}
            </Badge>
            {m.year && <Badge>Year {m.year}</Badge>}
            {m.startDate && (
              <Badge>
                {new Date(m.startDate).getFullYear()}
                {m.endDate ? `–${new Date(m.endDate).getFullYear()}` : "–"}
              </Badge>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <section
      id="tnp-team"
      style={{ padding: "100px 80px", background: "var(--black-soft)" }}
    >
      <div style={{ marginBottom: "16px" }}>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            color: "var(--orange)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          The People Behind It
        </span>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "64px",
            letterSpacing: "0.03em",
            lineHeight: 1,
          }}
        >
          OUR TEAM
        </h2>
      </div>
      <Divider />

      <div style={{ marginTop: "48px" }}>
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "60px",
            }}
          >
            <Spinner size={40} />
          </div>
        ) : error ? (
          <ErrorBox message={error} onRetry={loadData} />
        ) : sorted.length === 0 ? (
          <div
            style={{
              padding: "48px",
              textAlign: "center",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "10px",
              color: "var(--white-30)",
              fontFamily: "var(--font-mono)",
            }}
          >
            No active TNP team members are available right now.
          </div>
        ) : (
          <div style={{ display: "grid", gap: "24px" }}>
            {head && <MemberCard m={head} large />}

            {leadership.length > 0 && (
              <div style={{ display: "grid", gap: "12px" }}>
                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--orange)",
                    fontFamily: "var(--font-mono)",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  Leadership
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(300px, 1fr))",
                    gap: "16px",
                  }}
                >
                  {leadership.map((m) => (
                    <MemberCard key={m.tnpId || m.prn} m={m} highlight />
                  ))}
                </div>
              </div>
            )}

            {coordinators.length > 0 && (
              <div style={{ display: "grid", gap: "12px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "11px",
                      color: "var(--white-60)",
                      fontFamily: "var(--font-mono)",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}
                  >
                    Coordinators
                  </div>
                  {canSlideCoordinators && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "11px",
                          color: "var(--white-30)",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        Sliding window view
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          type="button"
                          onClick={slideCoordinatorsPrev}
                          aria-label="Previous coordinators"
                          style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "50%",
                            border: "1px solid rgba(255,255,255,0.18)",
                            background: "transparent",
                            color: "var(--white)",
                            cursor: "pointer",
                            fontSize: "14px",
                            lineHeight: 1,
                          }}
                        >
                          ‹
                        </button>
                        <button
                          type="button"
                          onClick={slideCoordinatorsNext}
                          aria-label="Next coordinators"
                          style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "50%",
                            border: "1px solid rgba(255,255,255,0.18)",
                            background: "transparent",
                            color: "var(--white)",
                            cursor: "pointer",
                            fontSize: "14px",
                            lineHeight: 1,
                          }}
                        >
                          ›
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(300px, 1fr))",
                    gap: "16px",
                  }}
                >
                  {coordinatorWindow.map((m) => (
                    <MemberCard
                      key={`${m.tnpId || m.prn}-${coordStart}`}
                      m={m}
                    />
                  ))}
                </div>
              </div>
            )}

            {others.length > 0 && (
              <div style={{ display: "grid", gap: "12px" }}>
                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--white-60)",
                    fontFamily: "var(--font-mono)",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  Team Members
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(300px, 1fr))",
                    gap: "16px",
                  }}
                >
                  {others.map((m) => (
                    <MemberCard key={m.tnpId || m.prn} m={m} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {!canEnter && (
        <div
          style={{
            marginTop: "80px",
            padding: "60px",
            textAlign: "center",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "8px",
            background:
              "linear-gradient(135deg, rgba(244,96,12,0.04), transparent)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "var(--orange)",
              letterSpacing: "0.1em",
              marginBottom: "16px",
            }}
          >
            RESTRICTED ACCESS
          </div>
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "48px",
              letterSpacing: "0.04em",
              marginBottom: "16px",
            }}
          >
            TNP PORTAL
          </h3>
          <p
            style={{
              color: "var(--white-60)",
              fontSize: "15px",
              maxWidth: "420px",
              margin: "0 auto 32px",
              lineHeight: 1.7,
            }}
          >
            The internal portal is accessible only to registered TNP members.
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              marginBottom: "32px",
            }}
          >
            {["CO_ORDINATOR", "VICE_PRESIDENT", "PRESIDENT", "TNP_HEAD"].map(
              (r) => (
                <Badge key={r}>{ROLE_LABELS[r]}</Badge>
              ),
            )}
          </div>
        </div>
      )}
    </section>
  );
};

// ── Footer ────────────────────────────────────────────────────────────────────
const Footer = () => (
  <footer
    style={{
      borderTop: "1px solid rgba(255,255,255,0.08)",
      padding: "48px 80px 32px",
      background: "var(--black)",
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "40px",
        flexWrap: "wrap",
        gap: "32px",
      }}
    >
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "12px",
          }}
        >
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "4px",
              background: "var(--orange)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "16px",
                color: "white",
                lineHeight: 1,
              }}
            >
              T
            </span>
          </div>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "20px",
              letterSpacing: "0.05em",
            }}
          >
            T&P CELL
          </span>
        </div>
        <p
          style={{
            color: "var(--white-60)",
            fontSize: "13px",
            maxWidth: "280px",
            lineHeight: 1.7,
          }}
        >
          Training & Placement Cell — bridging the gap between academia and
          industry.
        </p>
      </div>
      <div style={{ display: "flex", gap: "64px", flexWrap: "wrap" }}>
        {[
          {
            title: "Quick Links",
            links: ["Companies", "Placements", "Our Team"],
          },
          {
            title: "Contact",
            links: [
              "tnp@college.ac.in",
              "+91 98765 43210",
              "Room 204, Admin Block",
            ],
          },
        ].map((col) => (
          <div key={col.title}>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "var(--orange)",
                letterSpacing: "0.1em",
                marginBottom: "12px",
              }}
            >
              {col.title.toUpperCase()}
            </div>
            {col.links.map((l) => (
              <div
                key={l}
                style={{
                  fontSize: "13px",
                  color: "var(--white-60)",
                  marginBottom: "6px",
                }}
              >
                {l}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
    <Divider />
    <div
      style={{
        marginTop: "24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "12px",
      }}
    >
      <span
        style={{
          fontSize: "12px",
          color: "var(--white-30)",
          fontFamily: "var(--font-mono)",
        }}
      >
        © {new Date().getFullYear()} Training & Placement Cell. All rights
        reserved.
      </span>
    </div>
  </footer>
);

// ══════════════════════════════════════════════════════════════════════════════
// ── TNP PORTAL ────────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

const Portal = ({ user, tnpRole, onBack }) => {
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem(TNP_PORTAL_TAB_STORAGE_KEY);
    return savedTab || "dashboard";
  });
  const globalRole = user?.role || "USER";

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: "◉" },
    { id: "companies", label: "Companies", icon: "⬡" },
    { id: "company-master", label: "Company Master", icon: "▣" },
    { id: "industries-sessions", label: "Industries & Sessions", icon: "◍" },
    { id: "placements", label: "Placements", icon: "◈" },
    {
      id: "members",
      label: "Members",
      icon: "◎",
      hidden: !canAccess(globalRole, tnpRole, "manage_members"),
    },
  ].filter((t) => !t.hidden);

  useEffect(() => {
    localStorage.setItem(TNP_PORTAL_TAB_STORAGE_KEY, activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (!tabs.some((t) => t.id === activeTab)) {
      setActiveTab(tabs[0]?.id || "dashboard");
    }
  }, [activeTab, tabs]);

  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>
      {/* Sidebar */}
      <div
        style={{
          width: "220px",
          flexShrink: 0,
          borderRight: "1px solid rgba(255,255,255,0.08)",
          padding: "32px 0",
          background: "var(--black-soft)",
          position: "sticky",
          top: "0",
          height: "100vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            padding: "0 20px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--orange), #c44d0a)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 600,
              fontSize: "16px",
              marginBottom: "10px",
            }}
          >
            {user?.username?.slice(0, 2)?.toUpperCase() || "?"}
          </div>
          <div style={{ fontWeight: 500, fontSize: "14px" }}>
            {user?.username}
          </div>
          <div
            style={{
              fontSize: "11px",
              color: "var(--white-60)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {user?.prn}
          </div>
          <div style={{ marginTop: "8px" }}>
            <Badge
              variant={globalRole === "SUPER_ADMIN" ? "orange" : "default"}
            >
              {globalRole === "SUPER_ADMIN"
                ? "Super Admin"
                : tnpRole
                  ? ROLE_LABELS[tnpRole]
                  : "Member"}
            </Badge>
          </div>
        </div>

        <nav
          style={{
            padding: "16px 12px",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
          }}
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 12px",
                borderRadius: "6px",
                background:
                  activeTab === t.id ? "rgba(244,96,12,0.15)" : "transparent",
                color: activeTab === t.id ? "var(--orange)" : "var(--white-60)",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                fontSize: "14px",
                fontFamily: "var(--font-body)",
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: "14px", opacity: 0.8 }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>

        <div
          style={{
            margin: "20px 20px 0",
            padding: "12px",
            background: "rgba(255,255,255,0.04)",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              color: "var(--white-30)",
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.08em",
              marginBottom: "8px",
            }}
          >
            YOUR ACCESS
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {[
              ["View Data", true],
              [
                "Add Records",
                canAccess(globalRole, tnpRole, "write_placement"),
              ],
              [
                "Edit Companies",
                canAccess(globalRole, tnpRole, "write_company"),
              ],
              [
                "Manage Company Master",
                canAccess(globalRole, tnpRole, "write_company_master"),
              ],
              [
                "Delete Records",
                canAccess(globalRole, tnpRole, "delete_records"),
              ],
              [
                "Manage Members",
                canAccess(globalRole, tnpRole, "manage_members"),
              ],
              ["Change Role & Tenure", canAccess(globalRole, tnpRole, "change_roles")],
            ].map(([label, allowed]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "12px",
                }}
              >
                <span style={{ color: "var(--white-60)" }}>{label}</span>
                <span
                  style={{
                    color: allowed ? "#22c55e" : "#ef4444",
                    fontSize: "10px",
                  }}
                >
                  {allowed ? "✓" : "✗"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: "20px 12px 0" }}>
          <button
            onClick={onBack}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "6px",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "var(--white-60)",
              cursor: "pointer",
              fontSize: "13px",
              fontFamily: "var(--font-body)",
            }}
          >
            ← Back to Public View
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, minWidth: 0, padding: "40px", overflowY: "auto" }}>
        {activeTab === "dashboard" && (
          <PortalDashboard
            user={user}
            globalRole={globalRole}
            tnpRole={tnpRole}
          />
        )}
        {activeTab === "companies" && (
          <PortalCompanies
            user={user}
            globalRole={globalRole}
            tnpRole={tnpRole}
          />
        )}
        {activeTab === "company-master" && (
          <PortalCompanyMaster
            user={user}
            globalRole={globalRole}
            tnpRole={tnpRole}
          />
        )}
        {activeTab === "industries-sessions" && (
          <PortalIndustrySessionAdmin
            globalRole={globalRole}
            tnpRole={tnpRole}
            baseUrl={BASE_URL}
            authHeaders={authHeaders}
            OrangeBtn={OrangeBtn}
          />
        )}
        {activeTab === "placements" && (
          <PortalPlacements
            user={user}
            globalRole={globalRole}
            tnpRole={tnpRole}
          />
        )}
        {activeTab === "members" && (
          <PortalMembers
            user={user}
            globalRole={globalRole}
            tnpRole={tnpRole}
          />
        )}
      </div>
    </div>
  );
};

// ── Portal Dashboard ──────────────────────────────────────────────────────────
const PortalDashboard = ({ user, globalRole, tnpRole }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const currentSession = getCurrentSession();

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, companiesRes] = await Promise.all([
          axios
            .get(`${BASE_URL}/api/placements/all/stats/${currentSession}`, {
              headers: authHeaders(),
            })
            .catch(() => ({ data: null })),
          axios
            .get(`${BASE_URL}/api/company/all/getAll`, {
              headers: authHeaders(),
            })
            .catch(() => ({ data: [] })),
        ]);
        const rawComp = companiesRes.data?.data ?? companiesRes.data;
        const companyCount = Array.isArray(rawComp)
          ? rawComp.length
          : rawComp?.totalElements || 0;
        setStats({ ...statsRes.data?.data, totalCompanies: companyCount });
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const metrics = [
    {
      label: "Companies This Year",
      value: stats?.totalCompanies ?? "—",
      change: "Current Session",
    },
    {
      label: "Total Placements",
      value: stats?.totalPlacements ?? "—",
      change: currentSession,
    },
    {
      label: "Highest Package",
      value: stats?.highestPackage ? `₹${stats.highestPackage} LPA` : "—",
      change: "This session",
    },
    {
      label: "Avg Package",
      value: stats?.averagePackage
        ? `₹${parseFloat(stats.averagePackage).toFixed(1)} LPA`
        : "—",
      change: currentSession,
    },
  ];

  return (
    <div style={{ animation: "tnpFadeUp 0.3s ease" }}>
      <div style={{ marginBottom: "32px" }}>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "40px",
            letterSpacing: "0.04em",
          }}
        >
          WELCOME BACK, {user?.username?.toUpperCase()}
        </h2>
        <p
          style={{
            color: "var(--white-60)",
            fontSize: "14px",
            fontFamily: "var(--font-mono)",
          }}
        >
          {currentSession} ·{" "}
          {globalRole === "SUPER_ADMIN"
            ? "Full Access"
            : tnpRole
              ? ROLE_LABELS[tnpRole]
              : "Member"}{" "}
          View
        </p>
      </div>

      {loading ? (
        <div
          style={{ display: "flex", padding: "60px", justifyContent: "center" }}
        >
          <Spinner size={40} />
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "12px",
            marginBottom: "40px",
          }}
        >
          {metrics.map((m, i) => (
            <div
              key={i}
              style={{
                padding: "20px",
                background: "var(--black-card)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "8px",
                animation: `tnpFadeUp 0.3s ease ${i * 0.05}s both`,
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  color: "var(--white-60)",
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.06em",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                }}
              >
                {m.label}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "32px",
                  letterSpacing: "0.03em",
                  marginBottom: "4px",
                }}
              >
                {m.value}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "var(--orange)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {m.change}
              </div>
            </div>
          ))}
        </div>
      )}

      <div>
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "24px",
            letterSpacing: "0.06em",
            marginBottom: "16px",
            color: "var(--white-60)",
          }}
        >
          QUICK ACTIONS
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "12px",
          }}
        >
          {[
            {
              label: "Add Company Record",
              desc: "Log a new company visit",
              action: "write_company",
              icon: "⊕",
            },
            {
              label: "Record Placement",
              desc: "Mark student as placed",
              action: "write_placement",
              icon: "◈",
            },
            {
              label: "Bulk Import",
              desc: "Upload multiple records",
              action: "write_company",
              icon: "⊞",
            },
            {
              label: "Manage Members",
              desc: "Add / update TNP team",
              action: "manage_members",
              icon: "◎",
            },
            {
              label: "Change Role & Tenure",
              desc: "Reassign member roles",
              action: "change_roles",
              icon: "⟳",
            },
            {
              label: "Sync Hired Count",
              desc: "Recalculate from placements",
              action: "write_company",
              icon: "⟲",
            },
          ].map((a, i) => {
            const allowed = canAccess(globalRole, tnpRole, a.action);
            return (
              <div
                key={i}
                style={{
                  padding: "20px",
                  borderRadius: "8px",
                  background: allowed
                    ? "rgba(244,96,12,0.06)"
                    : "rgba(255,255,255,0.02)",
                  border: `1px solid ${allowed ? "rgba(244,96,12,0.2)" : "rgba(255,255,255,0.06)"}`,
                  opacity: allowed ? 1 : 0.5,
                  cursor: allowed ? "pointer" : "not-allowed",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (allowed)
                    e.currentTarget.style.background = "rgba(244,96,12,0.12)";
                }}
                onMouseLeave={(e) => {
                  if (allowed)
                    e.currentTarget.style.background = "rgba(244,96,12,0.06)";
                }}
              >
                <div
                  style={{
                    fontSize: "20px",
                    marginBottom: "8px",
                    color: allowed ? "var(--orange)" : "var(--white-30)",
                  }}
                >
                  {a.icon}
                </div>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: "14px",
                    marginBottom: "4px",
                  }}
                >
                  {a.label}
                </div>
                <div style={{ fontSize: "12px", color: "var(--white-60)" }}>
                  {a.desc}
                </div>
                {!allowed && (
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#ef4444",
                      fontFamily: "var(--font-mono)",
                      marginTop: "8px",
                    }}
                  >
                    Insufficient Role
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ── Portal Companies ──────────────────────────────────────────────────────────
const PortalCompanies = ({ user, globalRole, tnpRole }) => {
  const { confirm, dialogNode } = useAppConfirmDialog(true);
  const [companies, setCompanies] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    industry: "",
    packageOffered: "",
    studentsHired: "",
    sessionYear: getCurrentSession().split("-")[0],
  });
  const [formMsg, setFormMsg] = useState("");
  const canWrite = canAccess(globalRole, tnpRole, "write_company");
  const canDelete = canAccess(globalRole, tnpRole, "delete_records");
  const companyPageSize = 10;

  const load = async (page = 0) => {
    setLoading(true);
    setError(null);
    try {
      const [compRes, indRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/company/all/paged/all`, {
          headers: authHeaders(),
          params: { page, size: companyPageSize },
        }),
        axios.get(`${BASE_URL}/api/industry/all/getAll`, {
          headers: authHeaders(),
        }),
      ]);

      const raw = compRes.data?.data ?? compRes.data;
      const content = Array.isArray(raw?.content)
        ? raw.content
        : Array.isArray(raw)
          ? raw
          : [];
      const nextTotalPages = Number(
        raw?.totalPages ?? (content.length ? 1 : 0),
      );
      const nextTotalElements = Number(raw?.totalElements ?? content.length);

      if (nextTotalPages > 0 && page >= nextTotalPages) {
        setCurrentPage(nextTotalPages - 1);
        setLoading(false);
        return;
      }

      setCompanies(content);
      setTotalPages(nextTotalPages);
      setTotalElements(nextTotalElements);
      setIndustries(indRes.data?.data || []);
    } catch (err) {
      setError("Failed to load companies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(currentPage);
  }, [currentPage]);

  const resetForm = () => {
    setEditingId(null);
    setAdding(false);
    setFormMsg("");
    setForm({
      name: "",
      industry: "",
      packageOffered: "",
      studentsHired: "",
      sessionYear: getCurrentSession().split("-")[0],
    });
  };

  const handleEdit = (company) => {
    if (!canWrite) return;
    setEditingId(company.companyId);
    setAdding(true);
    setFormMsg("");
    setForm({
      name: company?.name || "",
      industry: company?.industry || "",
      packageOffered:
        company?.packageOffered != null ? String(company.packageOffered) : "",
      studentsHired:
        company?.studentsHired != null ? String(company.studentsHired) : "",
      sessionYear: company?.academicSession
        ? String(company.academicSession).split("-")[0]
        : getCurrentSession().split("-")[0],
    });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.industry) {
      setFormMsg("Industry is required");
      return;
    }

    const parsedSession = parseInt(form.sessionYear, 10);
    if (!Number.isFinite(parsedSession)) {
      setFormMsg("Session year is required");
      return;
    }

    setSaving(true);
    setFormMsg("");
    try {
      const payload = {
        name: form.name,
        industry: form.industry,
        packageOffered: parseFloat(form.packageOffered),
        studentsHired: form.studentsHired ? parseInt(form.studentsHired) : null,
        academicSession: parsedSession,
      };

      if (editingId) {
        await axios.patch(`${BASE_URL}/api/company/all/${editingId}`, payload, {
          headers: authHeaders(),
        });
      } else {
        await axios.post(`${BASE_URL}/api/company/all/add`, payload, {
          headers: authHeaders(),
        });
      }

      resetForm();
      setCurrentPage(0);
    } catch (err) {
      setFormMsg(
        err.response?.data?.message ||
          (editingId ? "Failed to update company" : "Failed to add company"),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!canDelete) return;
    const ok = await confirm({
      title: "Delete company record?",
      message: "This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "danger",
    });
    if (!ok) return;
    try {
      await axios.delete(`${BASE_URL}/api/company/all/${id}`, {
        headers: authHeaders(),
      });
      load(currentPage);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete");
    }
  };

  const handleSync = async () => {
    const session = getCurrentSession();
    try {
      await axios.get(
        `${BASE_URL}/api/company/all/countTotalStudents/${encodeURIComponent(session)}`,
        {
          headers: authHeaders(),
        },
      );
      load(currentPage);
    } catch (err) {
      alert("Sync failed");
    }
  };

  return (
    <div style={{ animation: "tnpFadeUp 0.3s ease" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "32px",
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "40px",
              letterSpacing: "0.04em",
            }}
          >
            COMPANIES
          </h2>
          <p
            style={{
              color: "var(--white-60)",
              fontSize: "13px",
              fontFamily: "var(--font-mono)",
            }}
          >
            {totalElements} records · {companyPageSize} per page
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          {canWrite && (
            <OrangeBtn small outline onClick={handleSync}>
              Sync Hired
            </OrangeBtn>
          )}
          {canWrite && (
            <OrangeBtn small onClick={() => setAdding(!adding)}>
              + Add Company
            </OrangeBtn>
          )}
        </div>
      </div>

      {/* Add Form */}
      {adding && canWrite && (
        <form
          onSubmit={handleAdd}
          style={{
            padding: "24px",
            background: "var(--black-card)",
            border: "1px solid rgba(244,96,12,0.3)",
            borderRadius: "8px",
            marginBottom: "24px",
            animation: "tnpFadeUp 0.2s ease",
          }}
        >
          <h4
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "20px",
              letterSpacing: "0.05em",
              marginBottom: "20px",
              color: "var(--orange)",
            }}
          >
            {editingId ? "UPDATE COMPANY" : "ADD COMPANY"}
          </h4>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: "16px",
              marginBottom: "20px",
            }}
          >
            {[
              {
                label: "Company Name",
                key: "name",
                placeholder: "e.g. Google",
              },
              {
                label: "Package (LPA)",
                key: "packageOffered",
                placeholder: "e.g. 32",
                type: "number",
              },
              {
                label: "Students Hired",
                key: "studentsHired",
                placeholder: "e.g. 12",
                type: "number",
              },
              {
                label: "Session Year",
                key: "sessionYear",
                placeholder: "e.g. 2024",
                type: "number",
              },
            ].map((f) => (
              <div key={f.key}>
                <label
                  style={{
                    fontSize: "11px",
                    color: "var(--white-60)",
                    fontFamily: "var(--font-mono)",
                    letterSpacing: "0.06em",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  {f.label.toUpperCase()}
                </label>
                <input
                  type={f.type || "text"}
                  placeholder={f.placeholder}
                  value={form[f.key]}
                  required={f.key !== "studentsHired"}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, [f.key]: e.target.value }))
                  }
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "4px",
                    color: "white",
                    fontSize: "14px",
                    fontFamily: "var(--font-body)",
                    outline: "none",
                  }}
                />
              </div>
            ))}
            <div>
              <label
                style={{
                  fontSize: "11px",
                  color: "var(--white-60)",
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.06em",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                INDUSTRY
              </label>
              <CustomSelect
                name="industry"
                value={form.industry}
                onChange={(e) =>
                  setForm((p) => ({ ...p, industry: e.target.value }))
                }
                options={[
                  { value: "", label: "Select industry" },
                  ...industries.map((i) => ({ value: i.name, label: i.name })),
                ]}
                placeholder="Select industry"
                required
                theme={TNP_SELECT_THEME}
              />
            </div>
          </div>
          {formMsg && (
            <div
              style={{
                color: "#ef4444",
                fontSize: "13px",
                marginBottom: "12px",
              }}
            >
              {formMsg}
            </div>
          )}
          <div style={{ display: "flex", gap: "10px" }}>
            <OrangeBtn small type="submit" disabled={saving}>
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Record"
                  : "Save Record"}
            </OrangeBtn>
            <OrangeBtn small outline onClick={resetForm}>
              Cancel
            </OrangeBtn>
          </div>
        </form>
      )}

      {loading ? (
        <div
          style={{ display: "flex", justifyContent: "center", padding: "60px" }}
        >
          <Spinner size={40} />
        </div>
      ) : error ? (
        <ErrorBox message={error} onRetry={() => load(currentPage)} />
      ) : (
        <>
          <div
            style={{
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "14px",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {[
                    "Company",
                    "Industry",
                    "Package",
                    "Hired",
                    "Session",
                    ...(canWrite ? ["Edit"] : []),
                    ...(canDelete ? ["Delete"] : []),
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        fontSize: "11px",
                        fontFamily: "var(--font-mono)",
                        color: "var(--white-60)",
                        letterSpacing: "0.06em",
                        fontWeight: 500,
                      }}
                    >
                      {h.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {companies.map((c) => (
                  <tr
                    key={c.companyId}
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(255,255,255,0.03)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <td style={{ padding: "14px 16px", fontWeight: 500 }}>
                      {c.name}
                    </td>
                    <td
                      style={{
                        padding: "14px 16px",
                        color: "var(--white-60)",
                        fontFamily: "var(--font-mono)",
                        fontSize: "12px",
                      }}
                    >
                      {c.industry}
                    </td>
                    <td
                      style={{
                        padding: "14px 16px",
                        color: "var(--orange)",
                        fontWeight: 600,
                        fontFamily: "var(--font-display)",
                        fontSize: "16px",
                      }}
                    >
                      {c.packageOffered} LPA
                    </td>
                    <td
                      style={{ padding: "14px 16px", color: "var(--white-60)" }}
                    >
                      {c.studentsHired ?? "—"}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <Badge>{c.academicSession}</Badge>
                    </td>
                    {canWrite && (
                      <td style={{ padding: "14px 16px" }}>
                        <button
                          onClick={() => handleEdit(c)}
                          style={{
                            padding: "4px 10px",
                            borderRadius: "4px",
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            color: "var(--white-60)",
                            fontSize: "12px",
                            cursor: "pointer",
                          }}
                        >
                          Edit
                        </button>
                      </td>
                    )}
                    {canDelete && (
                      <td style={{ padding: "14px 16px" }}>
                        <button
                          onClick={() => handleDelete(c.companyId)}
                          style={{
                            padding: "4px 10px",
                            borderRadius: "4px",
                            background: "rgba(239,68,68,0.1)",
                            border: "1px solid rgba(239,68,68,0.2)",
                            color: "#ef4444",
                            fontSize: "12px",
                            cursor: "pointer",
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
                {companies.length === 0 && (
                  <tr>
                    <td
                      colSpan={5 + (canWrite ? 1 : 0) + (canDelete ? 1 : 0)}
                      style={{
                        padding: "40px",
                        textAlign: "center",
                        color: "var(--white-30)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      No companies found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
                marginTop: "14px",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: "var(--white-60)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {`Page ${currentPage + 1} of ${totalPages}`}
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 0))}
                  disabled={currentPage === 0}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    border: "1px solid rgba(255,255,255,0.18)",
                    background: "transparent",
                    color:
                      currentPage === 0 ? "var(--white-30)" : "var(--white)",
                    cursor: currentPage === 0 ? "not-allowed" : "pointer",
                    fontSize: "12px",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages - 1))
                  }
                  disabled={currentPage >= totalPages - 1}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    border: "1px solid rgba(255,255,255,0.18)",
                    background: "transparent",
                    color:
                      currentPage >= totalPages - 1
                        ? "var(--white-30)"
                        : "var(--white)",
                    cursor:
                      currentPage >= totalPages - 1 ? "not-allowed" : "pointer",
                    fontSize: "12px",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {dialogNode}
    </div>
  );
};

// ── Portal Company Master ────────────────────────────────────────────────────
const PortalCompanyMaster = ({ user, globalRole, tnpRole }) => {
  const { confirm, dialogNode } = useAppConfirmDialog(true);
  const [companyMasters, setCompanyMasters] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [saving, setSaving] = useState(false);
  const [formMsg, setFormMsg] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", industryId: "", logoUrl: "" });

  const canWriteMaster = canAccess(globalRole, tnpRole, "write_company_master");
  const canDelete = canAccess(globalRole, tnpRole, "delete_records");
  const companyMasterPageSize = 10;

  const resetForm = () => {
    setEditingId(null);
    setForm({ name: "", industryId: "", logoUrl: "" });
    setFormMsg("");
  };

  const load = async (page = 0) => {
    setLoading(true);
    setError(null);
    try {
      const [masterRes, industryRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/companyMaster/all/getAllPaged`, {
          headers: authHeaders(),
          params: { page, size: companyMasterPageSize },
        }),
        axios.get(`${BASE_URL}/api/industry/all/getAll`, {
          headers: authHeaders(),
        }),
      ]);

      const masterRaw = masterRes.data?.data ?? masterRes.data;
      const industryRaw = industryRes.data?.data ?? industryRes.data;

      const masterList = Array.isArray(masterRaw)
        ? masterRaw
        : Array.isArray(masterRaw?.content)
          ? masterRaw.content
          : [];
      const nextTotalPages = Number(
        masterRaw?.totalPages ?? (masterList.length ? 1 : 0),
      );
      const nextTotalElements = Number(
        masterRaw?.totalElements ?? masterList.length,
      );

      if (nextTotalPages > 0 && page >= nextTotalPages) {
        setCurrentPage(nextTotalPages - 1);
        setLoading(false);
        return;
      }

      const industryList = Array.isArray(industryRaw)
        ? industryRaw
        : Array.isArray(industryRaw?.content)
          ? industryRaw.content
          : [];

      setCompanyMasters(masterList);
      setTotalPages(nextTotalPages);
      setTotalElements(nextTotalElements);
      setIndustries(industryList);
    } catch {
      setError("Failed to load company master records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(currentPage);
  }, [currentPage]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!canWriteMaster) return;
    if (!form.industryId) {
      setFormMsg("Industry is required");
      return;
    }

    setSaving(true);
    setFormMsg("");

    try {
      const payload = {
        name: form.name,
        industryId: Number(form.industryId),
        logoUrl: form.logoUrl,
      };

      if (editingId) {
        await axios.put(
          `${BASE_URL}/api/companyMaster/all/update/${editingId}`,
          payload,
          { headers: authHeaders() },
        );
      } else {
        await axios.post(
          `${BASE_URL}/api/companyMaster/all/addCompany`,
          payload,
          { headers: authHeaders() },
        );
      }

      resetForm();
      setCurrentPage(0);
    } catch (err) {
      setFormMsg(
        err.response?.data?.message || "Failed to save company master record",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    if (!canWriteMaster) return;

    const matchedIndustry = industries.find((i) => i?.name === item?.industry);
    setEditingId(item?.companyMasterId);
    setForm({
      name: item?.name || "",
      industryId: matchedIndustry?.industryId
        ? String(matchedIndustry.industryId)
        : "",
      logoUrl: item?.logoUrl || "",
    });
    setFormMsg("");
  };

  const handleDelete = async (id) => {
    if (!canDelete) return;
    const ok = await confirm({
      title: "Delete company master record?",
      message: "This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "danger",
    });
    if (!ok) return;

    try {
      await axios.delete(`${BASE_URL}/api/companyMaster/all/${id}`, {
        headers: authHeaders(),
      });
      load(currentPage);
    } catch (err) {
      alert(
        err.response?.data?.message || "Failed to delete company master record",
      );
    }
  };

  return (
    <div style={{ animation: "tnpFadeUp 0.3s ease" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "32px",
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "40px",
              letterSpacing: "0.04em",
            }}
          >
            COMPANY MASTER
          </h2>
          <p
            style={{
              color: "var(--white-60)",
              fontSize: "13px",
              fontFamily: "var(--font-mono)",
            }}
          >
            {totalElements} records · {companyMasterPageSize} per page
          </p>
        </div>
      </div>

      {canWriteMaster && (
        <form
          onSubmit={handleSave}
          style={{
            padding: "24px",
            background: "var(--black-card)",
            border: "1px solid rgba(244,96,12,0.3)",
            borderRadius: "8px",
            marginBottom: "24px",
            animation: "tnpFadeUp 0.2s ease",
          }}
        >
          <h4
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "20px",
              letterSpacing: "0.05em",
              marginBottom: "20px",
              color: "var(--orange)",
            }}
          >
            {editingId ? "UPDATE COMPANY MASTER" : "ADD COMPANY MASTER"}
          </h4>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "16px",
              marginBottom: "20px",
            }}
          >
            <div>
              <label
                style={{
                  fontSize: "11px",
                  color: "var(--white-60)",
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.06em",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                COMPANY NAME
              </label>
              <input
                value={form.name}
                required
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "4px",
                  color: "white",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: "11px",
                  color: "var(--white-60)",
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.06em",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                INDUSTRY
              </label>
              <CustomSelect
                name="industryId"
                value={form.industryId}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, industryId: e.target.value }))
                }
                options={[
                  { value: "", label: "Select industry" },
                  ...industries.map((i) => ({
                    value: String(i.industryId),
                    label: i.name,
                  })),
                ]}
                placeholder="Select industry"
                required
                theme={TNP_SELECT_THEME}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: "11px",
                  color: "var(--white-60)",
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.06em",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                LOGO URL
              </label>
              <input
                value={form.logoUrl}
                required
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, logoUrl: e.target.value }))
                }
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "4px",
                  color: "white",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </div>
          </div>
          {formMsg && (
            <div
              style={{
                color: "#ef4444",
                fontSize: "13px",
                marginBottom: "12px",
              }}
            >
              {formMsg}
            </div>
          )}
          <div style={{ display: "flex", gap: "10px" }}>
            <OrangeBtn small type="submit" disabled={saving}>
              {saving ? "Saving..." : editingId ? "Update" : "Add"}
            </OrangeBtn>
            <OrangeBtn small outline onClick={resetForm}>
              Reset
            </OrangeBtn>
          </div>
        </form>
      )}

      {loading ? (
        <div
          style={{ display: "flex", justifyContent: "center", padding: "60px" }}
        >
          <Spinner size={40} />
        </div>
      ) : error ? (
        <ErrorBox message={error} onRetry={() => load(currentPage)} />
      ) : (
        <>
          <div
            style={{
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "14px",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {[
                    "Company",
                    "Industry",
                    "Logo",
                    ...(canWriteMaster ? ["Edit"] : []),
                    ...(canDelete ? ["Delete"] : []),
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        fontSize: "11px",
                        fontFamily: "var(--font-mono)",
                        color: "var(--white-60)",
                        letterSpacing: "0.06em",
                        fontWeight: 500,
                      }}
                    >
                      {h.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {companyMasters.map((c) => (
                  <tr
                    key={c.companyMasterId}
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(255,255,255,0.03)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <td style={{ padding: "14px 16px", fontWeight: 500 }}>
                      {c.name}
                    </td>
                    <td
                      style={{
                        padding: "14px 16px",
                        color: "var(--white-60)",
                        fontFamily: "var(--font-mono)",
                        fontSize: "12px",
                      }}
                    >
                      {c.industry || "—"}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      {c.logoUrl ? (
                        <img
                          src={resolveMediaUrl(c.logoUrl)}
                          alt={`${c.name} logo`}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            const fallback = e.currentTarget.nextSibling;
                            if (fallback) fallback.style.display = "inline";
                          }}
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "8px",
                            objectFit: "cover",
                            border: "1px solid rgba(255,255,255,0.1)",
                            background: "rgba(255,255,255,0.04)",
                          }}
                        />
                      ) : null}
                      <span
                        style={{
                          display: c.logoUrl ? "none" : "inline",
                          color: "var(--white-30)",
                          fontSize: "12px",
                        }}
                      >
                        —
                      </span>
                    </td>
                    {canWriteMaster && (
                      <td style={{ padding: "14px 16px" }}>
                        <button
                          onClick={() => handleEdit(c)}
                          style={{
                            padding: "4px 10px",
                            borderRadius: "4px",
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            color: "var(--white-60)",
                            fontSize: "12px",
                            cursor: "pointer",
                          }}
                        >
                          Edit
                        </button>
                      </td>
                    )}
                    {canDelete && (
                      <td style={{ padding: "14px 16px" }}>
                        <button
                          onClick={() => handleDelete(c.companyMasterId)}
                          style={{
                            padding: "4px 10px",
                            borderRadius: "4px",
                            background: "rgba(239,68,68,0.1)",
                            border: "1px solid rgba(239,68,68,0.2)",
                            color: "#ef4444",
                            fontSize: "12px",
                            cursor: "pointer",
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
                {companyMasters.length === 0 && (
                  <tr>
                    <td
                      colSpan={canWriteMaster || canDelete ? 5 : 3}
                      style={{
                        padding: "40px",
                        textAlign: "center",
                        color: "var(--white-30)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      No company master records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
                marginTop: "14px",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: "var(--white-60)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {`Page ${currentPage + 1} of ${totalPages}`}
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 0))}
                  disabled={currentPage === 0}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    border: "1px solid rgba(255,255,255,0.18)",
                    background: "transparent",
                    color:
                      currentPage === 0 ? "var(--white-30)" : "var(--white)",
                    cursor: currentPage === 0 ? "not-allowed" : "pointer",
                    fontSize: "12px",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages - 1))
                  }
                  disabled={currentPage >= totalPages - 1}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    border: "1px solid rgba(255,255,255,0.18)",
                    background: "transparent",
                    color:
                      currentPage >= totalPages - 1
                        ? "var(--white-30)"
                        : "var(--white)",
                    cursor:
                      currentPage >= totalPages - 1 ? "not-allowed" : "pointer",
                    fontSize: "12px",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {dialogNode}
    </div>
  );
};

// ── Portal Placements ─────────────────────────────────────────────────────────
const PortalPlacements = ({ user, globalRole, tnpRole }) => {
  const { confirm, dialogNode } = useAppConfirmDialog(true);
  const [placements, setPlacements] = useState([]);
  const [placementImageMap, setPlacementImageMap] = useState({});
  const [stats, setStats] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [sessionOptions, setSessionOptions] = useState([]);
  const [selectedCompanySession, setSelectedCompanySession] =
    useState(getCurrentSession());
  const [companyOptionsLoading, setCompanyOptionsLoading] = useState(false);
  const [companyOptionsError, setCompanyOptionsError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    studentPrn: "",
    companyId: "",
    role: "",
    packageOffered: "",
  });
  const [formMsg, setFormMsg] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const canWrite = canAccess(globalRole, tnpRole, "write_placement");
  const canDeletePlacement =
    canAccess(globalRole, tnpRole, "delete_records") &&
    tnpRole !== "CO_ORDINATOR";
  const placementsPageSize = 15;

  const sortSessionsDesc = (sessions) =>
    [...sessions].sort((a, b) => {
      const aYear = Number(String(a).split("-")[0]) || 0;
      const bYear = Number(String(b).split("-")[0]) || 0;
      return bYear - aYear;
    });

  const loadSessionOptions = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/visitYear/all/getAllSessions`,
        {
          headers: authHeaders(),
        },
      );

      const raw = res.data?.data ?? res.data;
      const list = Array.isArray(raw) ? raw : [];
      const sessions = sortSessionsDesc(
        list.map((item) => item?.academicSession).filter(Boolean),
      );

      if (!sessions.length) {
        setSessionOptions([getCurrentSession()]);
        return;
      }

      setSessionOptions(sessions);
      if (!sessions.includes(selectedCompanySession)) {
        setSelectedCompanySession(sessions[0]);
      }
    } catch {
      setSessionOptions([getCurrentSession()]);
    }
  };

  const loadCompaniesBySession = async (session) => {
    if (!session) {
      setCompanies([]);
      setCompanyOptionsError("");
      return;
    }

    setCompanyOptionsLoading(true);
    setCompanyOptionsError("");
    try {
      const res = await axios.get(
        `${BASE_URL}/api/company/all/search/session`,
        {
          headers: authHeaders(),
          params: { session },
        },
      );

      const payload = res.data?.data ?? res.data;
      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.content)
          ? payload.content
          : [];

      const normalized = list
        .map((item) => ({
          companyId: item?.companyId,
          name: item?.name,
          industry: item?.industry,
          packageOffered: item?.packageOffered,
          academicSession: item?.academicSession,
          studentsHired: item?.studentsHired,
        }))
        .filter((item) => item.companyId != null && item.name);

      setCompanies(normalized);
    } catch (err) {
      setCompanies([]);
      setCompanyOptionsError(
        err.response?.data?.message ||
          "Unable to fetch companies for selected session",
      );
    } finally {
      setCompanyOptionsLoading(false);
    }
  };

  const load = async (session, page = 0) => {
    if (!session) {
      setPlacements([]);
      setStats(null);
      setTotalPages(0);
      setTotalElements(0);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const statsPromise = axios
        .get(
          `${BASE_URL}/api/placements/all/stats/${encodeURIComponent(session)}`,
          { headers: authHeaders() },
        )
        .catch(() => ({ data: null }));

      const pRes = await axios.get(
        `${BASE_URL}/api/placements/all/session/${encodeURIComponent(session)}`,
        {
          headers: authHeaders(),
          params: { page, size: placementsPageSize },
        },
      );

      const raw = pRes.data?.data ?? pRes.data;
      const content = Array.isArray(raw?.content)
        ? raw.content
        : Array.isArray(raw)
          ? raw
          : [];
      const nextTotalPages = Number(
        raw?.totalPages ?? (content.length ? 1 : 0),
      );
      const nextTotalElements = Number(raw?.totalElements ?? content.length);

      // If current page becomes invalid after mutations, move to the new last page.
      if (nextTotalPages > 0 && page >= nextTotalPages) {
        setCurrentPage(nextTotalPages - 1);
        setLoading(false);
        return;
      }

      const sRes = await statsPromise;
      setPlacements(content);
      setTotalPages(nextTotalPages);
      setTotalElements(nextTotalElements);
      setStats(sRes.data?.data);
    } catch (err) {
      setError("Failed to load placements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessionOptions();
  }, []);

  useEffect(() => {
    loadCompaniesBySession(selectedCompanySession);
    setCurrentPage(0);
    setForm((prev) => ({ ...prev, companyId: "" }));
  }, [selectedCompanySession]);

  useEffect(() => {
    load(selectedCompanySession, currentPage);
  }, [selectedCompanySession, currentPage]);

  useEffect(() => {
    let isActive = true;
    let createdUrls = [];

    const loadImages = async () => {
      const withImages = placements.filter(
        (s) => s?.imageUrl && (s?.placementId || s?.studentPrn),
      );

      if (!withImages.length) {
        setPlacementImageMap({});
        return;
      }

      const results = await Promise.all(
        withImages.map(async (s) => {
          const key = s.placementId || s.studentPrn;
          const blobUrl = await fetchProtectedImageBlobUrl(s.imageUrl);
          if (blobUrl) createdUrls.push(blobUrl);
          return { key, blobUrl };
        }),
      );

      if (!isActive) {
        createdUrls.forEach((u) => URL.revokeObjectURL(u));
        return;
      }

      const nextMap = {};
      results.forEach((r) => {
        if (r?.key && r.blobUrl) nextMap[r.key] = r.blobUrl;
      });
      setPlacementImageMap(nextMap);
    };

    loadImages();

    return () => {
      isActive = false;
      createdUrls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [placements]);

  const filtered = placements.filter(
    (s) =>
      (s.studentName || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.companyName || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.studentPrn || "").includes(search),
  );

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!selectedCompanySession) {
      setFormMsg("Session is required");
      return;
    }
    if (!form.companyId) {
      setFormMsg("Company is required");
      return;
    }
    setSaving(true);
    setFormMsg("");
    try {
      await axios.post(
        `${BASE_URL}/api/placements/all/create`,
        {
          studentPrn: form.studentPrn,
          companyId: parseInt(form.companyId),
          role: form.role,
          packageOffered: parseFloat(form.packageOffered),
        },
        { headers: authHeaders() },
      );
      setAdding(false);
      setForm({ studentPrn: "", companyId: "", role: "", packageOffered: "" });
      setCurrentPage(0);
    } catch (err) {
      setFormMsg(err.response?.data?.message || "Failed to record placement");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!canDeletePlacement) return;
    const ok = await confirm({
      title: "Delete placement record?",
      message: "This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "danger",
    });
    if (!ok) return;
    try {
      await axios.delete(`${BASE_URL}/api/placements/all/${id}`, {
        headers: authHeaders(),
      });
      load(selectedCompanySession, currentPage);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete");
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div style={{ animation: "tnpFadeUp 0.3s ease" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "32px",
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "40px",
              letterSpacing: "0.04em",
            }}
          >
            PLACEMENTS
          </h2>
          <p
            style={{
              color: "var(--white-60)",
              fontSize: "13px",
              fontFamily: "var(--font-mono)",
            }}
          >
            {totalElements} records · {placementsPageSize} per page
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ minWidth: "170px" }}>
            <CustomSelect
              name="selectedCompanySession"
              value={selectedCompanySession}
              onChange={(e) => setSelectedCompanySession(e.target.value)}
              disabled={loading || sessionOptions.length === 0}
              options={sessionOptions.map((session) => ({
                value: session,
                label: session,
              }))}
              placeholder="Select session"
              theme={TNP_SELECT_THEME}
            />
          </div>
          {canWrite && (
            <OrangeBtn small onClick={() => setAdding(!adding)}>
              + Record Placement
            </OrangeBtn>
          )}
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1px",
            background: "rgba(255,255,255,0.08)",
            marginBottom: "24px",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          {[
            { label: "Total Placed", value: stats.totalPlacements ?? "—" },
            {
              label: "Avg Package",
              value: stats.averagePackage
                ? `₹${parseFloat(stats.averagePackage).toFixed(1)} LPA`
                : "—",
            },
            {
              label: "Highest",
              value: stats.highestPackage
                ? `₹${stats.highestPackage} LPA`
                : "—",
            },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                background: "var(--black-card)",
                padding: "20px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "28px",
                  color: "var(--orange)",
                  letterSpacing: "0.03em",
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "var(--white-60)",
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.06em",
                }}
              >
                {s.label.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add form */}
      {adding && canWrite && (
        <form
          onSubmit={handleAdd}
          style={{
            padding: "24px",
            background: "var(--black-card)",
            border: "1px solid rgba(244,96,12,0.3)",
            borderRadius: "8px",
            marginBottom: "24px",
            animation: "tnpFadeUp 0.2s ease",
          }}
        >
          <h4
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "20px",
              letterSpacing: "0.05em",
              marginBottom: "20px",
              color: "var(--orange)",
            }}
          >
            RECORD PLACEMENT
          </h4>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: "16px",
              marginBottom: "20px",
            }}
          >
            {[
              {
                label: "Student PRN",
                key: "studentPrn",
                placeholder: "e.g. 2021BTCS001",
              },
              { label: "Job Role", key: "role", placeholder: "e.g. SDE" },
              {
                label: "Package (LPA)",
                key: "packageOffered",
                placeholder: "e.g. 32",
                type: "number",
              },
            ].map((f) => (
              <div key={f.key}>
                <label
                  style={{
                    fontSize: "11px",
                    color: "var(--white-60)",
                    fontFamily: "var(--font-mono)",
                    letterSpacing: "0.06em",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  {f.label.toUpperCase()}
                </label>
                <input
                  type={f.type || "text"}
                  placeholder={f.placeholder}
                  value={form[f.key]}
                  required
                  onChange={(e) =>
                    setForm((p) => ({ ...p, [f.key]: e.target.value }))
                  }
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "4px",
                    color: "white",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>
            ))}
            <div>
              <label
                style={{
                  fontSize: "11px",
                  color: "var(--white-60)",
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.06em",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                SESSION
              </label>
              <CustomSelect
                name="selectedCompanySession"
                value={selectedCompanySession}
                onChange={(e) => setSelectedCompanySession(e.target.value)}
                options={sessionOptions.map((session) => ({
                  value: session,
                  label: session,
                }))}
                placeholder="Select session"
                required
                theme={TNP_SELECT_THEME}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: "11px",
                  color: "var(--white-60)",
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.06em",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                COMPANY
              </label>
              <CustomSelect
                name="companyId"
                value={form.companyId}
                onChange={(e) =>
                  setForm((p) => ({ ...p, companyId: e.target.value }))
                }
                disabled={companyOptionsLoading || !selectedCompanySession}
                options={[
                  {
                    value: "",
                    label: companyOptionsLoading
                      ? "Loading companies..."
                      : "Select company",
                  },
                  ...companies.map((c) => ({
                    value: String(c.companyId),
                    label: `${c.name} (${c.academicSession || selectedCompanySession})`,
                  })),
                ]}
                placeholder="Select company"
                required
                theme={TNP_SELECT_THEME}
              />
              {companyOptionsError && (
                <div
                  style={{
                    marginTop: "6px",
                    fontSize: "12px",
                    color: "#ef4444",
                  }}
                >
                  {companyOptionsError}
                </div>
              )}
              {!companyOptionsLoading &&
                !companyOptionsError &&
                selectedCompanySession &&
                companies.length === 0 && (
                  <div
                    style={{
                      marginTop: "6px",
                      fontSize: "12px",
                      color: "var(--white-60)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    No companies found for {selectedCompanySession}
                  </div>
                )}
            </div>
          </div>
          {formMsg && (
            <div
              style={{
                color: "#ef4444",
                fontSize: "13px",
                marginBottom: "12px",
              }}
            >
              {formMsg}
            </div>
          )}
          <div style={{ display: "flex", gap: "10px" }}>
            <OrangeBtn small type="submit" disabled={saving}>
              {saving ? "Saving..." : "Record"}
            </OrangeBtn>
            <OrangeBtn small outline onClick={() => setAdding(false)}>
              Cancel
            </OrangeBtn>
          </div>
        </form>
      )}

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name, PRN, or company..."
        style={{
          width: "100%",
          padding: "12px 16px",
          marginBottom: "16px",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "6px",
          color: "white",
          fontSize: "14px",
          outline: "none",
        }}
      />

      {loading ? (
        <div
          style={{ display: "flex", justifyContent: "center", padding: "60px" }}
        >
          <Spinner size={40} />
        </div>
      ) : error ? (
        <ErrorBox
          message={error}
          onRetry={() => load(selectedCompanySession, currentPage)}
        />
      ) : (
        <>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1px",
              background: "rgba(255,255,255,0.06)",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            {filtered.map((s) => {
              const imageKey = s.placementId || s.studentPrn;
              const imageSrc = imageKey ? placementImageMap[imageKey] : null;
              return (
                <div
                  key={s.placementId}
                  style={{
                    background: "var(--black-card)",
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--black-elevated)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "var(--black-card)")
                  }
                >
                  {imageSrc ? (
                    <img
                      src={imageSrc}
                      alt={s.studentName}
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        flexShrink: 0,
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        flexShrink: 0,
                        background:
                          "linear-gradient(135deg, var(--orange), #c44d0a)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 600,
                        fontSize: "13px",
                      }}
                    >
                      {getInitials(s.studentName)}
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: "15px" }}>
                      {s.studentName || s.studentPrn}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "var(--white-60)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {s.studentPrn}
                      {s.department ? ` · ${s.department}` : ""}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "14px", fontWeight: 500 }}>
                      {s.companyName}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "var(--white-60)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {s.role}
                    </div>
                  </div>
                  <div
                    style={{
                      padding: "6px 14px",
                      borderRadius: "4px",
                      background: "rgba(244,96,12,0.12)",
                      border: "1px solid var(--orange-border)",
                      fontFamily: "var(--font-display)",
                      fontSize: "16px",
                      letterSpacing: "0.04em",
                      color: "var(--orange)",
                      flexShrink: 0,
                    }}
                  >
                    {s.packageOffered} LPA
                  </div>
                  {canDeletePlacement && (
                    <button
                      onClick={() => handleDelete(s.placementId)}
                      style={{
                        padding: "4px 10px",
                        borderRadius: "4px",
                        background: "rgba(239,68,68,0.1)",
                        border: "1px solid rgba(239,68,68,0.2)",
                        color: "#ef4444",
                        fontSize: "12px",
                        cursor: "pointer",
                        flexShrink: 0,
                      }}
                    >
                      Del
                    </button>
                  )}
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div
                style={{
                  padding: "40px",
                  textAlign: "center",
                  color: "var(--white-30)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                No placements found
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
                marginTop: "14px",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: "var(--white-60)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {`Page ${currentPage + 1} of ${totalPages}`}
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 0))}
                  disabled={currentPage === 0}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    border: "1px solid rgba(255,255,255,0.18)",
                    background: "transparent",
                    color:
                      currentPage === 0 ? "var(--white-30)" : "var(--white)",
                    cursor: currentPage === 0 ? "not-allowed" : "pointer",
                    fontSize: "12px",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages - 1))
                  }
                  disabled={currentPage >= totalPages - 1}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    border: "1px solid rgba(255,255,255,0.18)",
                    background: "transparent",
                    color:
                      currentPage >= totalPages - 1
                        ? "var(--white-30)"
                        : "var(--white)",
                    cursor:
                      currentPage >= totalPages - 1 ? "not-allowed" : "pointer",
                    fontSize: "12px",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {dialogNode}
    </div>
  );
};

// ── Portal Members ────────────────────────────────────────────────────────────
const PortalMembers = ({ user, globalRole, tnpRole }) => {
  const { confirm, dialogNode } = useAppConfirmDialog(true);
  const [members, setMembers] = useState([]);
  const [memberImageMap, setMemberImageMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState(false);
  const [changingRole, setChangingRole] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    prn: "",
    role: "CO_ORDINATOR",
    startDate: "",
    endDate: "",
  });
  const [formMsg, setFormMsg] = useState("");
  const [roleSaving, setRoleSaving] = useState(false);
  const [roleMsg, setRoleMsg] = useState("");
  const [roleForm, setRoleForm] = useState({
    prn: "",
    newRole: "CO_ORDINATOR",
    startDate: "",
    endDate: "",
  });
  const canChangeRoles = canAccess(globalRole, tnpRole, "change_roles");
  const canManage = canAccess(globalRole, tnpRole, "manage_members");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${BASE_URL}/api/tnp/all/getAll/true`, {
        headers: authHeaders(),
      });
      const raw = res.data?.data ?? res.data;
      setMembers(Array.isArray(raw) ? raw : raw?.content || []);
    } catch (err) {
      setError("Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    let isActive = true;
    let createdUrls = [];

    const loadImages = async () => {
      const withImages = members.filter((m) => m?.imageUrl && m?.prn);

      if (!withImages.length) {
        setMemberImageMap({});
        return;
      }

      const results = await Promise.all(
        withImages.map(async (m) => {
          const blobUrl = await fetchProtectedImageBlobUrl(m.imageUrl);
          if (blobUrl) createdUrls.push(blobUrl);
          return { key: m.prn, blobUrl };
        }),
      );

      if (!isActive) {
        createdUrls.forEach((u) => URL.revokeObjectURL(u));
        return;
      }

      const nextMap = {};
      results.forEach((r) => {
        if (r?.key && r.blobUrl) nextMap[r.key] = r.blobUrl;
      });
      setMemberImageMap(nextMap);
    };

    loadImages();

    return () => {
      isActive = false;
      createdUrls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [members]);

  const sorted = [...members].sort(
    (a, b) => (ROLE_RANK[a.role] ?? 9) - (ROLE_RANK[b.role] ?? 9),
  );

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormMsg("");
    try {
      await axios.post(
        `${BASE_URL}/api/tnp/all/add`,
        {
          prn: form.prn,
          role: form.role,
          startDate: form.startDate,
          endDate: form.endDate,
        },
        { headers: authHeaders() },
      );
      setAdding(false);
      setForm({ prn: "", role: "CO_ORDINATOR", startDate: "", endDate: "" });
      load();
    } catch (err) {
      setFormMsg(err.response?.data?.message || "Failed to add member");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (prn) => {
    const ok = await confirm({
      title: "Remove member?",
      message: "This will permanently remove the member from TNP.",
      confirmText: "Remove",
      cancelText: "Cancel",
      variant: "danger",
    });
    if (!ok) return;
    try {
      await axios.delete(`${BASE_URL}/api/tnp/tr/permanentlyDelete/${prn}`, {
        headers: authHeaders(),
      });
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove");
    }
  };

  const handleChangeRole = async (e) => {
    e.preventDefault();
    if (!canChangeRoles) return;

    if (!roleForm.startDate || !roleForm.endDate) {
      setRoleMsg("Start date and end date are required");
      return;
    }

    if (new Date(roleForm.startDate) > new Date(roleForm.endDate)) {
      setRoleMsg("Start date cannot be after end date");
      return;
    }

    setRoleSaving(true);
    setRoleMsg("");
    try {
      await axios.put(
        `${BASE_URL}/api/tnp/tr/changeClubRole`,
        {
          prn: roleForm.prn,
          newRole: roleForm.newRole,
          startDate: toLocalDateTimeWithSeconds(roleForm.startDate, false),
          endDate: toLocalDateTimeWithSeconds(roleForm.endDate, true),
        },
        { headers: authHeaders() },
      );

      setRoleMsg("Role changed successfully");
      setRoleForm({
        prn: "",
        newRole: "CO_ORDINATOR",
        startDate: "",
        endDate: "",
      });
      setChangingRole(false);
      load();
    } catch (err) {
      setRoleMsg(err.response?.data?.message || "Failed to change role");
    } finally {
      setRoleSaving(false);
    }
  };

  const getInitials = (name, prn) => {
    if (name)
      return name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    return (prn || "?").slice(0, 2).toUpperCase();
  };

  return (
    <div style={{ animation: "tnpFadeUp 0.3s ease" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "32px",
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "40px",
              letterSpacing: "0.04em",
            }}
          >
            TNP MEMBERS
          </h2>
          <p
            style={{
              color: "var(--white-60)",
              fontSize: "13px",
              fontFamily: "var(--font-mono)",
            }}
          >
            Active team
            {!canChangeRoles && (
              <span style={{ color: "var(--orange)", marginLeft: "8px" }}>
                · Role changes require TNP_HEAD
              </span>
            )}
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          {canChangeRoles && (
            <OrangeBtn
              small
              outline
              onClick={() => setChangingRole(!changingRole)}
            >
              Change Role & Tenure
            </OrangeBtn>
          )}
          {canManage && (
            <OrangeBtn small onClick={() => setAdding(!adding)}>
              + Add Member
            </OrangeBtn>
          )}
        </div>
      </div>

      {changingRole && canChangeRoles && (
        <form
          onSubmit={handleChangeRole}
          style={{
            padding: "24px",
            background: "var(--black-card)",
            border: "1px solid rgba(244,96,12,0.3)",
            borderRadius: "8px",
            marginBottom: "24px",
            animation: "tnpFadeUp 0.2s ease",
          }}
        >
          <h4
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "20px",
              letterSpacing: "0.05em",
              marginBottom: "20px",
              color: "var(--orange)",
            }}
          >
            CHANGE MEMBER ROLE & TENURE
          </h4>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "16px",
              marginBottom: "20px",
            }}
          >
            <div>
              <label
                style={{
                  fontSize: "11px",
                  color: "var(--white-60)",
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.06em",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                PRN
              </label>
              <input
                placeholder="e.g. 2022BTCS011"
                value={roleForm.prn}
                required
                onChange={(e) =>
                  setRoleForm((p) => ({ ...p, prn: e.target.value }))
                }
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "4px",
                  color: "white",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: "11px",
                  color: "var(--white-60)",
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.06em",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                NEW ROLE
              </label>
              <CustomSelect
                name="newRole"
                value={roleForm.newRole}
                onChange={(e) =>
                  setRoleForm((p) => ({ ...p, newRole: e.target.value }))
                }
                options={Object.entries(ROLE_LABELS)
                  .filter(
                    ([val]) => val !== "TNP_HEAD" || globalRole === "SUPER_ADMIN",
                  )
                  .map(([value, label]) => ({ value, label }))}
                placeholder="Select role"
                required
                theme={TNP_SELECT_THEME}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: "11px",
                  color: "var(--white-60)",
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.06em",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                START DATE
              </label>
              <DateTimePicker
                value={roleForm.startDate}
                required
                onChange={(value) =>
                  setRoleForm((p) => ({ ...p, startDate: value }))
                }
                placeholder="Select start date"
                dateOnly
                theme={TNP_SELECT_THEME}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: "11px",
                  color: "var(--white-60)",
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.06em",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                END DATE
              </label>
              <DateTimePicker
                value={roleForm.endDate}
                required
                onChange={(value) =>
                  setRoleForm((p) => ({ ...p, endDate: value }))
                }
                placeholder="Select end date"
                dateOnly
                theme={TNP_SELECT_THEME}
              />
            </div>
          </div>
          {roleMsg && (
            <div
              style={{
                color: roleMsg.toLowerCase().includes("success")
                  ? "#22c55e"
                  : "#ef4444",
                fontSize: "13px",
                marginBottom: "12px",
              }}
            >
              {roleMsg}
            </div>
          )}
          <div style={{ display: "flex", gap: "10px" }}>
            <OrangeBtn small type="submit" disabled={roleSaving}>
              {roleSaving ? "Saving..." : "Change Role & Tenure"}
            </OrangeBtn>
            <OrangeBtn small outline onClick={() => setChangingRole(false)}>
              Cancel
            </OrangeBtn>
          </div>
        </form>
      )}

      {/* Add form */}
      {adding && canManage && (
        <form
          onSubmit={handleAdd}
          style={{
            padding: "24px",
            background: "var(--black-card)",
            border: "1px solid rgba(244,96,12,0.3)",
            borderRadius: "8px",
            marginBottom: "24px",
            animation: "tnpFadeUp 0.2s ease",
          }}
        >
          <h4
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "20px",
              letterSpacing: "0.05em",
              marginBottom: "20px",
              color: "var(--orange)",
            }}
          >
            ADD MEMBER
          </h4>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "16px",
              marginBottom: "20px",
            }}
          >
            <div>
              <label
                style={{
                  fontSize: "11px",
                  color: "var(--white-60)",
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.06em",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                PRN
              </label>
              <input
                placeholder="e.g. 2022BTCS011"
                value={form.prn}
                required
                onChange={(e) =>
                  setForm((p) => ({ ...p, prn: e.target.value }))
                }
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "4px",
                  color: "white",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: "11px",
                  color: "var(--white-60)",
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.06em",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                ROLE
              </label>
              <CustomSelect
                name="role"
                value={form.role}
                onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                options={Object.entries(ROLE_LABELS)
                  .filter(
                    ([val]) => val !== "TNP_HEAD" || globalRole === "SUPER_ADMIN",
                  )
                  .map(([value, label]) => ({ value, label }))}
                placeholder="Select role"
                required
                theme={TNP_SELECT_THEME}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: "11px",
                  color: "var(--white-60)",
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.06em",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                START DATE
              </label>
              <input
                type="date"
                value={form.startDate}
                required
                onChange={(e) =>
                  setForm((p) => ({ ...p, startDate: e.target.value }))
                }
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "4px",
                  color: "white",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: "11px",
                  color: "var(--white-60)",
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.06em",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                END DATE
              </label>
              <input
                type="date"
                value={form.endDate}
                required
                onChange={(e) =>
                  setForm((p) => ({ ...p, endDate: e.target.value }))
                }
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "4px",
                  color: "white",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </div>
          </div>
          {formMsg && (
            <div
              style={{
                color: "#ef4444",
                fontSize: "13px",
                marginBottom: "12px",
              }}
            >
              {formMsg}
            </div>
          )}
          <div style={{ display: "flex", gap: "10px" }}>
            <OrangeBtn small type="submit" disabled={saving}>
              {saving ? "Saving..." : "Add Member"}
            </OrangeBtn>
            <OrangeBtn small outline onClick={() => setAdding(false)}>
              Cancel
            </OrangeBtn>
          </div>
        </form>
      )}

      {loading ? (
        <div
          style={{ display: "flex", justifyContent: "center", padding: "60px" }}
        >
          <Spinner size={40} />
        </div>
      ) : error ? (
        <ErrorBox message={error} onRetry={load} />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "16px",
          }}
        >
          {sorted.map((m, i) => (
            <div
              key={m.tnpId || m.prn}
              style={{
                background: "var(--black-card)",
                border: `1px solid ${m.role === "TNP_HEAD" ? "rgba(244,96,12,0.3)" : "rgba(255,255,255,0.08)"}`,
                borderRadius: "8px",
                padding: "24px",
                animation: `tnpFadeUp 0.3s ease ${i * 0.06}s both`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{ display: "flex", gap: "14px", alignItems: "center" }}
                >
                  {memberImageMap[m.prn] ? (
                    <img
                      src={memberImageMap[m.prn]}
                      alt={m.name}
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        flexShrink: 0,
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        background:
                          m.role === "TNP_HEAD"
                            ? "linear-gradient(135deg, var(--orange), #c44d0a)"
                            : m.role === "PRESIDENT"
                              ? "linear-gradient(135deg, #6366f1, #4338ca)"
                              : m.role === "VICE_PRESIDENT"
                                ? "linear-gradient(135deg, #14b8a6, #0d9488)"
                                : "linear-gradient(135deg, #374151, #1f2937)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 600,
                        fontSize: "16px",
                        flexShrink: 0,
                      }}
                    >
                      {getInitials(m.name, m.prn)}
                    </div>
                  )}
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "15px" }}>
                      {m.name || m.prn}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "var(--white-60)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {m.prn}
                    </div>
                  </div>
                </div>
                <Badge variant={m.role === "TNP_HEAD" ? "orange" : "default"}>
                  {ROLE_LABELS[m.role] || m.role}
                </Badge>
              </div>
              <div
                style={{
                  paddingTop: "14px",
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--white-60)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {m.department || "—"}
                    {m.year ? ` · Year ${m.year}` : ""}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--white-30)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {m.startDate ? new Date(m.startDate).getFullYear() : "—"}
                    {m.endDate ? `–${new Date(m.endDate).getFullYear()}` : ""}
                  </div>
                </div>
                {canManage && m.role !== "TNP_HEAD" && (
                  <button
                    onClick={() => handleDelete(m.prn)}
                    style={{
                      padding: "4px 10px",
                      borderRadius: "4px",
                      background: "rgba(239,68,68,0.1)",
                      border: "1px solid rgba(239,68,68,0.2)",
                      color: "#ef4444",
                      fontSize: "12px",
                      cursor: "pointer",
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
          {sorted.length === 0 && (
            <div
              style={{
                gridColumn: "1/-1",
                padding: "40px",
                textAlign: "center",
                color: "var(--white-30)",
                fontFamily: "var(--font-mono)",
              }}
            >
              No active members
            </div>
          )}
        </div>
      )}

      {dialogNode}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// ── ROOT COMPONENT ────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

/**
 * TNPPage — drop this into your router at /tnp
 *
 * Reads auth from localStorage (same pattern as UsersDashboard):
 *   localStorage.getItem("user")  → { prn, username, email, role, verified }
 *   localStorage.getItem("token") → JWT
 *
 * Sends X-User-PRN and X-User-Role headers on every request.
 * Looks up tnpRole from GET /tnp/members/{prn} to determine portal access.
 */
export default function TNPPage() {
  const [view, setView] = useState(() => {
    const savedView = localStorage.getItem(TNP_VIEW_STORAGE_KEY);
    return savedView === "portal" ? "portal" : "landing";
  }); // "landing" | "portal"
  const [tnpRole, setTnpRole] = useState(null); // e.g. "TNP_HEAD"
  const [tnpLoading, setTnpLoading] = useState(true);
  const [landingStats, setLandingStats] = useState({});
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const globalRole = user?.role || "USER";
  const currentSession = getCurrentSession();

  // Look up this user's TNP role (if any)
  useEffect(() => {
    const checkTnpRole = async () => {
      if (!user?.prn) {
        setTnpLoading(false);
        return;
      }
      if (globalRole === "SUPER_ADMIN") {
        setTnpRole("SUPER_ADMIN");
        setTnpLoading(false);
        return;
      }
      try {
        const res = await axios.get(
          `${BASE_URL}/api/tnp/all/getByPrn/${user.prn}`,
          { headers: authHeaders() },
        );
        if (res.data?.data?.role) setTnpRole(res.data.data.role);
      } catch {
        /* user is not a TNP member — tnpRole stays null */
      }
      setTnpLoading(false);
    };
    checkTnpRole();
  }, [user?.prn]);

  // Load landing stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        const statsRes = await axios
          .get(`${BASE_URL}/api/company/all/stats`, {
            headers: authHeaders(),
          })
          .catch(() => ({ data: {} }));

        const overall = statsRes.data?.data ?? statsRes.data ?? {};
        setLandingStats({
          totalCompanies: overall.totalCompaniesVisited,
          totalPlacements: overall.totalStudentsPlaced,
          highestPackage: overall.highestPackage,
          averagePackage: overall.averagePackage,
        });
      } catch {}
    };
    loadStats();
  }, []);

  useEffect(() => {
    if (view === "landing") window.scrollTo({ top: 0, behavior: "smooth" });
  }, [view]);

  useEffect(() => {
    localStorage.setItem(TNP_VIEW_STORAGE_KEY, view);
  }, [view]);

  useEffect(() => {
    if (
      !tnpLoading &&
      view === "portal" &&
      !canAccess(globalRole, tnpRole, "enter_portal")
    ) {
      setView("landing");
    }
  }, [tnpLoading, view, globalRole, tnpRole]);

  if (tnpLoading) {
    return (
      <div
        className="tnp-root"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <FontLoader />
        <Spinner size={48} />
      </div>
    );
  }

  return (
    <div className="tnp-root">
      <FontLoader />

      <TnpTopNav
        setView={setView}
        navigate={navigate}
        view={view}
        globalRole={globalRole}
        tnpRole={tnpRole}
        user={user}
        roleLabel={tnpRole ? ROLE_LABELS[tnpRole] || tnpRole : ""}
        canAccess={canAccess}
        Badge={Badge}
        OrangeBtn={OrangeBtn}
      />

      {view === "landing" ? (
        <TnpPublicAccessView
          Hero={Hero}
          CompaniesSection={CompaniesSection}
          PlacementsSection={PlacementsSection}
          SessionCompanyInsightsSection={SessionCompanyInsightsSection}
          TeamSection={TeamSection}
          Footer={Footer}
          user={user}
          tnpRole={tnpRole}
          landingStats={landingStats}
          globalRole={globalRole}
          setView={setView}
        />
      ) : (
        <TnpMemberAccessView
          Portal={Portal}
          user={user}
          tnpRole={tnpRole}
          setView={setView}
        />
      )}
    </div>
  );
}
