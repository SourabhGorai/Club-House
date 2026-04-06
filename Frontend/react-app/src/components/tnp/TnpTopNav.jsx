import { useEffect, useState } from "react";

export default function TnpTopNav({
  setView,
  navigate,
  view,
  globalRole,
  tnpRole,
  user,
  roleLabel,
  canAccess,
  Badge,
  OrangeBtn,
}) {
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 1280,
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isMobile = viewportWidth < 900;
  const isTiny = viewportWidth < 520;
  const canEnterPortal = canAccess(globalRole, tnpRole, "enter_portal");
  const showLandingLinks = view === "landing";

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setIsMenuOpen(false);
    }
  }, [isMobile]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [view]);

  const navLinks = ["companies", "placements", "sessions", "team"];

  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: isMobile ? "0 14px" : "0 32px",
          height: "60px",
          background: "rgba(10,10,10,0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div
          style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
          onClick={() => setView("landing")}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "4px",
              background: "var(--orange)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontFamily: "var(--font-display)", fontSize: "18px", color: "white", lineHeight: 1 }}>
              T
            </span>
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontSize: isTiny ? "18px" : "22px", letterSpacing: "0.05em" }}>
            T&P {!isTiny && <span style={{ color: "var(--orange)" }}>CELL</span>}
          </span>
        </div>

        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: "30px" }}>
            {showLandingLinks &&
              navLinks.map((l) => (
                <a
                  key={l}
                  href={`#tnp-${l}`}
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    fontSize: "14px",
                    textDecoration: "none",
                    letterSpacing: "0.02em",
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = "rgba(255,255,255,0.6)";
                  }}
                >
                  {l.charAt(0).toUpperCase() + l.slice(1)}
                </a>
              ))}
          </div>
        )}

        {isMobile ? (
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            style={{
              padding: "7px 10px",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.14)",
              background: "transparent",
              color: "var(--white)",
              cursor: "pointer",
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
            }}
          >
            {isMenuOpen ? "Close" : "Menu"}
          </button>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <OrangeBtn small outline onClick={() => navigate("/dashboard")}>
              ← Dashboard
            </OrangeBtn>
            {canEnterPortal && (
              <OrangeBtn small onClick={() => setView(view === "portal" ? "landing" : "portal")}>
                {view === "portal" ? "← Back" : "T&P Portal →"}
              </OrangeBtn>
            )}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "4px 12px 4px 4px",
                background: "rgba(255,255,255,0.06)",
                borderRadius: "99px",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: "var(--orange)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  fontWeight: 600,
                }}
              >
                {user?.username?.slice(0, 2)?.toUpperCase() || "?"}
              </div>
              <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>
                {user?.username}
              </span>
              {tnpRole && <Badge variant="orange">{roleLabel || tnpRole}</Badge>}
            </div>
          </div>
        )}
      </nav>

      {isMobile && isMenuOpen && (
        <div
          style={{
            position: "fixed",
            top: "60px",
            left: 0,
            right: 0,
            zIndex: 99,
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(10,10,10,0.98)",
            backdropFilter: "blur(12px)",
            padding: "12px 14px 14px",
            display: "grid",
            gap: "10px",
          }}
        >
          {showLandingLinks && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {navLinks.map((l) => (
                <a
                  key={l}
                  href={`#tnp-${l}`}
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: "999px",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "rgba(255,255,255,0.75)",
                    textDecoration: "none",
                    fontSize: "12px",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {l.charAt(0).toUpperCase() + l.slice(1)}
                </a>
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <OrangeBtn small outline onClick={() => navigate("/dashboard")}>
              ← Dashboard
            </OrangeBtn>
            {canEnterPortal && (
              <OrangeBtn small onClick={() => setView(view === "portal" ? "landing" : "portal")}>
                {view === "portal" ? "← Back" : "T&P Portal →"}
              </OrangeBtn>
            )}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "8px",
              padding: "8px 10px",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.04)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: "var(--orange)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                {user?.username?.slice(0, 2)?.toUpperCase() || "?"}
              </div>
              <span
                style={{
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.7)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {user?.username}
              </span>
            </div>
            {tnpRole && <Badge variant="orange">{roleLabel || tnpRole}</Badge>}
          </div>
        </div>
      )}
    </>
  );
}
