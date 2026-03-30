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
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 40px", height: "60px",
      background: "rgba(10,10,10,0.95)", backdropFilter: "blur(12px)",
      borderBottom: "1px solid rgba(255,255,255,0.08)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }} onClick={() => setView("landing")}>
        <div style={{ width: "32px", height: "32px", borderRadius: "4px", background: "var(--orange)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "18px", color: "white", lineHeight: 1 }}>T</span>
        </div>
        <span style={{ fontFamily: "var(--font-display)", fontSize: "22px", letterSpacing: "0.05em" }}>
          T&P <span style={{ color: "var(--orange)" }}>CELL</span>
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
        {["companies", "placements", "sessions", "team"].map(l => (
          <a key={l} href={`#tnp-${l}`} style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", textDecoration: "none", letterSpacing: "0.02em", transition: "color 0.15s" }}
            onMouseEnter={e => e.target.style.color = "white"}
            onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.6)"}
          >{l.charAt(0).toUpperCase() + l.slice(1)}</a>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <OrangeBtn small outline onClick={() => navigate("/dashboard")}>
          ← Dashboard
        </OrangeBtn>
        {canAccess(globalRole, tnpRole, "enter_portal") && (
          <OrangeBtn small onClick={() => setView(view === "portal" ? "landing" : "portal")}>
            {view === "portal" ? "← Back" : "T&P Portal →"}
          </OrangeBtn>
        )}
        <div style={{
          display: "flex", alignItems: "center", gap: "8px",
          padding: "4px 12px 4px 4px",
          background: "rgba(255,255,255,0.06)", borderRadius: "99px", border: "1px solid rgba(255,255,255,0.1)",
        }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "var(--orange)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 600 }}>
            {user?.username?.slice(0, 2)?.toUpperCase() || "?"}
          </div>
          <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>{user?.username}</span>
          {tnpRole && <Badge variant="orange">{roleLabel || tnpRole}</Badge>}
        </div>
      </div>
    </nav>
  );
}
