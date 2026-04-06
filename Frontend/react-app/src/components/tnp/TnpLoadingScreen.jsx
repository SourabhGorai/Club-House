import { useEffect, useRef, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://72.155.88.211:8080";
const TNP_PREFETCH_STORAGE_KEY = "tnp:prefetch";
const MIN_WAIT_MS = 1400;

function getCurrentSession() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  return m >= 7 ? `${y}-${y + 1}` : `${y - 1}-${y}`;
}

function getAuthHeaders(token, user) {
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  if (user?.prn) headers["X-User-PRN"] = user.prn;
  if (user?.role) headers["X-User-Role"] = user.role;
  return headers;
}

const STAGES = [
  {
    id: "profile",
    label: "Profile",
    msg: "Loading your profile...",
    targetP: 25,
  },
  { id: "role", label: "Access", msg: "Fetching permissions...", targetP: 52 },
  {
    id: "stats",
    label: "Insights",
    msg: "Syncing placement data...",
    targetP: 78,
  },
  { id: "launch", label: "Launch", msg: "Launching portal...", targetP: 100 },
];

// ── Background particle canvas ───────────────────────────────────────────────
function BgCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W = 0,
      H = 0,
      raf;
    const particles = Array.from({ length: 90 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      vx: (Math.random() - 0.5) * 0.012,
      vy: (Math.random() - 0.5) * 0.012,
      r: Math.random() * 1.8 + 0.3,
      a: Math.random() * 0.5 + 0.1,
      warm: Math.random() < 0.5,
      phase: Math.random() * Math.PI * 2,
    }));
    function resize() {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W * devicePixelRatio;
      canvas.height = H * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
    }
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    let t = 0;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      t += 0.008;
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = 100;
        if (p.x > 100) p.x = 0;
        if (p.y < 0) p.y = 100;
        if (p.y > 100) p.y = 0;
        const px = (p.x / 100) * W,
          py = (p.y / 100) * H;
        const flicker = p.a * (0.6 + 0.4 * Math.sin(t * 2 + p.phase));
        ctx.beginPath();
        ctx.arc(px, py, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.warm
          ? `rgba(255,110,30,${flicker})`
          : `rgba(255,255,255,${flicker * 0.6})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);
  return (
    <canvas
      ref={ref}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    />
  );
}

// ── Animated ring canvas ─────────────────────────────────────────────────────
function RingCanvas({ progress }) {
  const ref = useRef(null);
  const progRef = useRef(progress);
  useEffect(() => {
    progRef.current = progress;
  }, [progress]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    // Canvas is 360x360, rendered at 180x180 CSS — 2× retina
    const CX = 180,
      CY = 180,
      R = 137;
    let raf,
      t = 0;
    const ringDots = Array.from({ length: 12 }, (_, i) => ({
      angle: (i / 12) * Math.PI * 2,
      speed: 0.008 + (i % 3) * 0.004,
      r: i % 3 === 0 ? 4.5 : 3,
      orbit: i % 2 === 0 ? R + 22 : R + 14,
      warm: i % 2 === 0,
    }));
    function draw() {
      ctx.clearRect(0, 0, 360, 360);
      t += 0.016;
      const pv = progRef.current / 100;

      // Track
      ctx.beginPath();
      ctx.arc(CX, CY, R, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.lineWidth = 16;
      ctx.stroke();

      // Progress arc
      const startA = -Math.PI / 2,
        endA = startA + Math.PI * 2 * pv;
      ctx.beginPath();
      ctx.arc(CX, CY, R, startA, endA);
      const g = ctx.createLinearGradient(CX - R, CY, CX + R, CY);
      g.addColorStop(0, "#b83e00");
      g.addColorStop(0.5, "#ff6a1a");
      g.addColorStop(1, "#ffb060");
      ctx.strokeStyle = g;
      ctx.lineWidth = 16;
      ctx.lineCap = "round";
      ctx.stroke();

      // Dashed outer rings
      [R + 28, R + 42].forEach((rr, i) => {
        ctx.save();
        ctx.translate(CX, CY);
        ctx.rotate(t * (i === 0 ? 0.4 : -0.25));
        ctx.beginPath();
        ctx.arc(0, 0, rr, 0, Math.PI * 2);
        ctx.setLineDash(i === 0 ? [6, 10] : [3, 8]);
        ctx.strokeStyle = `rgba(244,96,12,${0.15 + 0.06 * Math.sin(t + i)})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.restore();
      });

      // Orbiting dots
      ringDots.forEach((d) => {
        d.angle += d.speed;
        const dx = CX + Math.cos(d.angle) * d.orbit;
        const dy = CY + Math.sin(d.angle) * d.orbit;
        ctx.beginPath();
        ctx.arc(dx, dy, d.r, 0, Math.PI * 2);
        const glow = ctx.createRadialGradient(dx, dy, 0, dx, dy, d.r * 3);
        glow.addColorStop(
          0,
          d.warm ? "rgba(255,110,30,0.95)" : "rgba(255,255,255,0.85)",
        );
        glow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = glow;
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={ref}
      width={360}
      height={360}
      style={{
        position: "absolute",
        inset: 0,
        width: "180px",
        height: "180px",
      }}
    />
  );
}

// ── Main loading screen ───────────────────────────────────────────────────────
export default function TnpLoadingScreen() {
  const navigate = useNavigate();
  const user = useMemo(
    () => JSON.parse(localStorage.getItem("user") || "{}"),
    [],
  );
  const token = localStorage.getItem("token");

  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState(
    "Preparing secure connection...",
  );
  const [activeStage, setActiveStage] = useState(-1);

  // Smooth animated progress
  const progressRef = useRef(0);
  const targetProgRef = useRef(0);
  const lastRounded = useRef(0);
  useEffect(() => {
    let raf;
    function animate() {
      progressRef.current +=
        (targetProgRef.current - progressRef.current) * 0.035;
      const rounded = Math.round(progressRef.current);
      if (rounded !== lastRounded.current) {
        lastRounded.current = rounded;
        setProgress(rounded);
      }
      raf = requestAnimationFrame(animate);
    }
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Data fetching + stage progression
  useEffect(() => {
    let isCancelled = false;
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));

    const advance = (i, msg) => {
      if (isCancelled) return;
      setActiveStage(i);
      setStatusText(msg);
      targetProgRef.current = STAGES[i].targetP;
    };

    const run = async () => {
      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      const session = getCurrentSession();
      const headers = getAuthHeaders(token, user);
      const startedAt = Date.now();

      advance(0, STAGES[0].msg);
      const profilePromise = user?.prn
        ? axios
            .get(`${BASE_URL}/api/profiles/prn/${user.prn}`, { headers })
            .then((r) => r.data?.data ?? r.data ?? null)
            .catch(() => null)
        : Promise.resolve(null);

      await wait(400);
      advance(1, STAGES[1].msg);
      const rolePromise =
        user?.prn && user?.role !== "SUPER_ADMIN"
          ? axios
              .get(`${BASE_URL}/api/tnp/all/getByPrn/${user.prn}`, { headers })
              .then((r) => r.data?.data?.role ?? null)
              .catch(() => null)
          : Promise.resolve(
              user?.role === "SUPER_ADMIN" ? "SUPER_ADMIN" : null,
            );

      await wait(400);
      advance(2, STAGES[2].msg);
      const companyStatsPromise = axios
        .get(`${BASE_URL}/api/company/all/stats`, { headers })
        .then((r) => r.data?.data ?? r.data ?? {})
        .catch(() => ({}));
      const placementStatsPromise = axios
        .get(
          `${BASE_URL}/api/placements/all/stats/${encodeURIComponent(session)}`,
          { headers },
        )
        .then((r) => r.data?.data ?? r.data ?? {})
        .catch(() => ({}));

      const [profileDetails, tnpRole, companyStats, placementStats] =
        await Promise.all([
          profilePromise,
          rolePromise,
          companyStatsPromise,
          placementStatsPromise,
        ]);

      const elapsed = Date.now() - startedAt;
      if (elapsed < MIN_WAIT_MS) await wait(MIN_WAIT_MS - elapsed);
      if (isCancelled) return;

      const landingStats = {
        totalCompanies:
          companyStats?.totalCompaniesVisited ?? companyStats?.totalCompanies,
        totalPlacements:
          companyStats?.totalStudentsPlaced ?? placementStats?.totalPlacements,
        highestPackage:
          companyStats?.highestPackage ?? placementStats?.highestPackage,
        averagePackage:
          companyStats?.averagePackage ?? placementStats?.averagePackage,
      };

      sessionStorage.setItem(
        TNP_PREFETCH_STORAGE_KEY,
        JSON.stringify({
          timestamp: Date.now(),
          userPrn: user?.prn || "",
          session,
          tnpRole,
          profileDetails,
          landingStats,
        }),
      );

      advance(3, STAGES[3].msg);
      await wait(600);
      if (!isCancelled) navigate("/tnp", { replace: true });
    };

    run();
    return () => {
      isCancelled = true;
    };
  }, [navigate, token, user]);

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        position: "relative",
        overflow: "hidden",
        background:
          "radial-gradient(ellipse 70% 60% at 20% -10%, rgba(244,96,12,0.35) 0%, transparent 60%)," +
          "radial-gradient(ellipse 50% 50% at 90% 110%, rgba(200,60,0,0.2) 0%, transparent 55%)," +
          "#080808",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'DM Sans', sans-serif",
        color: "#fff",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;600;700&family=DM+Mono:wght@400;500&family=Bebas+Neue&display=swap');
        @keyframes tnp-fadeup    { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes tnp-shine     { from{transform:translateX(-150%)} to{transform:translateX(250%)} }
        @keyframes tnp-dotpulse  { 0%,100%{transform:scale(1)} 50%{transform:scale(1.45)} }
        .tnp-center   { animation: tnp-fadeup 0.7s cubic-bezier(0.22,1,0.36,1); }
        .tnp-shine    { animation: tnp-shine 1.5s linear infinite; }
        .tnp-dot-active { animation: tnp-dotpulse 0.9s ease-in-out infinite !important; }
      `}</style>

      <BgCanvas />

      <div
        className="tnp-center"
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        {/* ── Ring ── */}
        <div
          style={{
            position: "relative",
            width: 180,
            height: 180,
            marginBottom: 32,
          }}
        >
          <RingCanvas progress={progress} />
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 52,
                lineHeight: 1,
                color: "#fff",
                letterSpacing: "0.04em",
              }}
            >
              {progress}
            </span>
            <span
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 10,
                color: "rgba(255,160,80,0.9)",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                marginTop: 2,
              }}
            >
              sync
            </span>
          </div>
        </div>

        {/* ── Title ── */}
        <h1
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(52px, 10vw, 88px)",
            letterSpacing: "0.06em",
            lineHeight: 1,
            margin: "0 0 4px",
          }}
        >
          TNP <span style={{ color: "#ff6a1a" }}>Portal</span>
        </h1>
        <p
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 11,
            letterSpacing: "0.18em",
            color: "rgba(255,255,255,0.4)",
            textTransform: "uppercase",
            margin: "0 0 36px",
          }}
        >
          Training &amp; Placement System
        </p>

        {/* ── Status ── */}
        <p
          key={statusText}
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.6)",
            letterSpacing: "0.02em",
            minHeight: 20,
            margin: "0 0 20px",
            transition: "opacity 0.3s",
          }}
        >
          {statusText}
        </p>

        {/* ── Progress bar ── */}
        <div
          style={{
            width: 260,
            height: 2,
            background: "rgba(255,255,255,0.08)",
            borderRadius: 2,
            overflow: "hidden",
            marginBottom: 36,
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: "linear-gradient(90deg, #c94800, #ff6a1a, #ffaa60)",
              borderRadius: 2,
              transition: "width 0.5s ease",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              className="tnp-shine"
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)",
              }}
            />
          </div>
        </div>

        {/* ── Stage dots ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {STAGES.map((s, i) => {
              const done = i < activeStage;
              const active = i === activeStage;
              return (
                <div
                  key={s.id}
                  className={active ? "tnp-dot-active" : ""}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background:
                      done || active ? "#ff6a1a" : "rgba(255,255,255,0.12)",
                    boxShadow: active
                      ? "0 0 14px rgba(255,106,26,0.9)"
                      : done
                        ? "0 0 6px rgba(255,106,26,0.5)"
                        : "none",
                    transition: "all 0.4s",
                  }}
                />
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            {STAGES.map((s, i) => (
              <span
                key={s.id}
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 10,
                  color:
                    i === activeStage
                      ? "rgba(255,160,80,0.9)"
                      : "rgba(255,255,255,0.28)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  transition: "color 0.4s",
                  width: 52,
                  textAlign: "center",
                }}
              >
                {s.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
