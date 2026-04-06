import { useEffect, useRef, useState } from "react";
import axios from "axios";

const ADMIN_TNP_ROLES = ["TNP_HEAD", "PRESIDENT", "VICE_PRESIDENT"];
const ADD_ALLOWED_TNP_ROLES = [...ADMIN_TNP_ROLES, "CO_ORDINATOR"];

function safeArray(raw) {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.content)) return raw.content;
  return [];
}

function getSessionId(item) {
  return item?.yearId ?? item?.visitYearId ?? item?.id ?? null;
}

function getSessionLabel(item) {
  return item?.academicSession || item?.session || "—";
}

export default function PortalIndustrySessionAdmin({
  globalRole,
  tnpRole,
  baseUrl,
  authHeaders,
  OrangeBtn,
}) {
  const [industries, setIndustries] = useState([]);
  const [sessions, setSessions] = useState([]);

  const [industryLoading, setIndustryLoading] = useState(true);
  const [sessionLoading, setSessionLoading] = useState(true);

  const [industryError, setIndustryError] = useState("");
  const [sessionError, setSessionError] = useState("");

  const [industryInput, setIndustryInput] = useState("");
  const [industrySaving, setIndustrySaving] = useState(false);
  const [industryMsg, setIndustryMsg] = useState("");

  const [editingIndustryId, setEditingIndustryId] = useState(null);
  const [editingIndustryName, setEditingIndustryName] = useState("");

  const [sessionYearInput, setSessionYearInput] = useState(new Date().getFullYear());
  const [sessionSaving, setSessionSaving] = useState(false);
  const [sessionMsg, setSessionMsg] = useState("");
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 900;
  });
  const confirmResolverRef = useRef(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "Are you sure?",
    message: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    variant: "danger",
  });

  const canAdd =
    globalRole === "SUPER_ADMIN" ||
    ADD_ALLOWED_TNP_ROLES.includes(tnpRole);

  const canEditDelete =
    globalRole === "SUPER_ADMIN" ||
    ADMIN_TNP_ROLES.includes(tnpRole);

  const closeConfirm = () => {
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
    if (confirmResolverRef.current) {
      confirmResolverRef.current(false);
      confirmResolverRef.current = null;
    }
  };

  const openConfirm = ({ title, message, confirmText = "Delete" }) =>
    new Promise((resolve) => {
      confirmResolverRef.current = resolve;
      setConfirmDialog({
        isOpen: true,
        title,
        message,
        confirmText,
        cancelText: "Cancel",
        variant: "danger",
      });
    });

  const handleConfirm = () => {
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
    if (confirmResolverRef.current) {
      confirmResolverRef.current(true);
      confirmResolverRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (confirmResolverRef.current) {
        confirmResolverRef.current(false);
        confirmResolverRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 900);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const ActionBtn = ({ children, onClick, disabled, outline, type = "button" }) => {
    if (OrangeBtn) {
      return (
        <OrangeBtn
          small
          type={type}
          onClick={onClick}
          disabled={disabled}
          outline={outline}
        >
          {children}
        </OrangeBtn>
      );
    }

    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        style={{
          padding: "9px 14px",
          borderRadius: "10px",
          border: outline ? "1px solid rgba(244,96,12,0.6)" : "1px solid rgba(244,96,12,0.95)",
          background: outline ? "rgba(244,96,12,0.06)" : "linear-gradient(135deg, #f4600c 0%, #ff7b2c 100%)",
          color: outline ? "#ff934f" : "#fff",
          fontSize: "12px",
          fontWeight: 600,
          letterSpacing: "0.03em",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.7 : 1,
          transition: "all 0.2s ease",
          whiteSpace: "nowrap",
        }}
      >
        {children}
      </button>
    );
  };

  const loadIndustries = async () => {
    setIndustryLoading(true);
    setIndustryError("");
    try {
      const res = await axios.get(`${baseUrl}/api/industry/all/getAll`, {
        headers: authHeaders(),
      });
      const raw = res.data?.data ?? res.data;
      setIndustries(safeArray(raw));
    } catch (err) {
      setIndustries([]);
      setIndustryError(err.response?.data?.message || "Failed to load industries");
    } finally {
      setIndustryLoading(false);
    }
  };

  const loadSessions = async () => {
    setSessionLoading(true);
    setSessionError("");
    try {
      const res = await axios.get(`${baseUrl}/api/visitYear/all/getAllSessions`, {
        headers: authHeaders(),
      });
      const raw = res.data?.data ?? res.data;
      const rows = safeArray(raw).sort((a, b) => {
        const aYear = Number(String(getSessionLabel(a)).split("-")[0]) || 0;
        const bYear = Number(String(getSessionLabel(b)).split("-")[0]) || 0;
        return bYear - aYear;
      });
      setSessions(rows);
    } catch (err) {
      setSessions([]);
      setSessionError(err.response?.data?.message || "Failed to load academic sessions");
    } finally {
      setSessionLoading(false);
    }
  };

  useEffect(() => {
    loadIndustries();
    loadSessions();
  }, []);

  const handleIndustryAdd = async (e) => {
    e.preventDefault();
    if (!canAdd) return;

    const name = industryInput.trim();
    if (!name) return;

    setIndustrySaving(true);
    setIndustryMsg("");
    try {
      await axios.post(
        `${baseUrl}/api/industry/all/add/${encodeURIComponent(name)}`,
        null,
        { headers: authHeaders() },
      );
      setIndustryInput("");
      setIndustryMsg("Industry added");
      loadIndustries();
    } catch (err) {
      setIndustryMsg(err.response?.data?.message || "Failed to add industry");
    } finally {
      setIndustrySaving(false);
    }
  };

  const startIndustryEdit = (row) => {
    if (!canEditDelete) return;
    setEditingIndustryId(row?.industryId);
    setEditingIndustryName(row?.name || "");
    setIndustryMsg("");
  };

  const cancelIndustryEdit = () => {
    setEditingIndustryId(null);
    setEditingIndustryName("");
  };

  const saveIndustryEdit = async () => {
    if (!canEditDelete || !editingIndustryId) return;

    const name = editingIndustryName.trim();
    if (!name) return;

    setIndustrySaving(true);
    setIndustryMsg("");
    try {
      await axios.put(
        `${baseUrl}/api/industry/all/udpate/${editingIndustryId}/${encodeURIComponent(name)}`,
        null,
        { headers: authHeaders() },
      );
      setIndustryMsg("Industry updated");
      cancelIndustryEdit();
      loadIndustries();
    } catch (err) {
      setIndustryMsg(err.response?.data?.message || "Failed to update industry");
    } finally {
      setIndustrySaving(false);
    }
  };

  const deleteIndustry = async (id) => {
    if (!canEditDelete) return;
    const ok = await openConfirm({
      title: "Delete industry?",
      message: "This will remove the industry from the list.",
    });
    if (!ok) return;

    setIndustrySaving(true);
    setIndustryMsg("");
    try {
      await axios.delete(`${baseUrl}/api/industry/all/delete/${id}`, {
        headers: authHeaders(),
      });
      setIndustryMsg("Industry deleted");
      if (editingIndustryId === id) cancelIndustryEdit();
      loadIndustries();
    } catch (err) {
      setIndustryMsg(err.response?.data?.message || "Failed to delete industry");
    } finally {
      setIndustrySaving(false);
    }
  };

  const handleSessionAdd = async (e) => {
    e.preventDefault();
    if (!canAdd) return;

    const year = Number(sessionYearInput);
    if (!Number.isFinite(year)) return;

    setSessionSaving(true);
    setSessionMsg("");
    try {
      await axios.post(`${baseUrl}/api/visitYear/all/add/${year}`, null, {
        headers: authHeaders(),
      });
      setSessionMsg("Academic session added");
      loadSessions();
    } catch (err) {
      setSessionMsg(err.response?.data?.message || "Failed to add academic session");
    } finally {
      setSessionSaving(false);
    }
  };

  const deleteSession = async (yearId) => {
    if (!canEditDelete) return;
    const ok = await openConfirm({
      title: "Delete academic session?",
      message: "This will remove the academic session from the list.",
    });
    if (!ok) return;

    setSessionSaving(true);
    setSessionMsg("");
    try {
      await axios.delete(`${baseUrl}/api/visitYear/all/delete/${yearId}`, {
        headers: authHeaders(),
      });
      setSessionMsg("Academic session deleted");
      loadSessions();
    } catch (err) {
      setSessionMsg(err.response?.data?.message || "Failed to delete academic session");
    } finally {
      setSessionSaving(false);
    }
  };

  return (
    <div style={{ animation: "tnpFadeUp 0.3s ease", display: "grid", gap: "18px" }}>
      <div
        style={{
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "16px",
          padding: isMobile ? "16px" : "20px 22px",
          background: "radial-gradient(circle at top right, rgba(244,96,12,0.2), transparent 45%), var(--black-card)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: isMobile ? "flex-start" : "center", flexDirection: isMobile ? "column" : "row" }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: isMobile ? "32px" : "42px", letterSpacing: "0.04em", lineHeight: 1.05, marginBottom: "8px" }}>
              INDUSTRIES & SESSIONS
            </h2>
            <p style={{ color: "var(--white-60)", fontSize: "13px", fontFamily: "var(--font-mono)", maxWidth: "780px" }}>
              Manage placement taxonomy in one place. Coordinators can add entries; Super Admin, TNP Head, President, and Vice President can edit or delete.
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ padding: "6px 10px", borderRadius: "999px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", fontSize: "11px", color: "var(--white-70)", fontFamily: "var(--font-mono)" }}>
              Industries: {industries.length}
            </span>
            <span style={{ padding: "6px 10px", borderRadius: "999px", border: "1px solid rgba(255,146,0,0.35)", background: "rgba(255,146,0,0.08)", fontSize: "11px", color: "var(--orange)", fontFamily: "var(--font-mono)" }}>
              Sessions: {sessions.length}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))", gap: "16px" }}>
        <section
          style={{
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px",
            overflow: "hidden",
            background: "var(--black-card)",
            minWidth: 0,
          }}
        >
          <div style={{ padding: "16px", borderBottom: "1px solid rgba(255,255,255,0.08)", background: "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))" }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "24px", letterSpacing: "0.04em", marginBottom: "6px" }}>INDUSTRIES</h3>
            <p style={{ fontSize: "12px", color: "var(--white-60)", fontFamily: "var(--font-mono)" }}>
              Use clear industry names to categorize incoming companies.
            </p>
          </div>

          <div style={{ padding: "16px" }}>
            <form onSubmit={handleIndustryAdd} style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr auto", gap: "10px", marginBottom: "12px" }}>
              <input
                value={industryInput}
                onChange={(e) => setIndustryInput(e.target.value)}
                placeholder="Add industry name"
                disabled={!canAdd || industrySaving}
                style={{
                  width: "100%",
                  padding: "11px 12px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "10px",
                  color: "white",
                  fontSize: "14px",
                }}
              />
              <ActionBtn type="submit" disabled={!canAdd || industrySaving}>Add Industry</ActionBtn>
            </form>

            {industryMsg && (
              <div style={{ marginBottom: "10px", fontSize: "12px", color: "var(--orange)", fontFamily: "var(--font-mono)", padding: "8px 10px", borderRadius: "8px", border: "1px solid rgba(255,146,0,0.25)", background: "rgba(255,146,0,0.08)" }}>
                {industryMsg}
              </div>
            )}

            {industryError && (
              <div style={{ marginBottom: "10px", fontSize: "12px", color: "#ef4444", padding: "8px 10px", borderRadius: "8px", border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)" }}>
                {industryError}
              </div>
            )}

            {industryLoading ? (
              <div style={{ color: "var(--white-60)", fontSize: "13px", padding: "14px", border: "1px dashed rgba(255,255,255,0.14)", borderRadius: "10px", textAlign: "center" }}>Loading industries...</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: isMobile ? "360px" : "460px", overflowY: "auto", paddingRight: "2px" }}>
                {industries.map((row) => {
                  const id = row?.industryId;
                  const isEditing = editingIndustryId === id;
                  return (
                    <div
                      key={id}
                      style={{
                        padding: "12px",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "10px",
                        background: "rgba(255,255,255,0.02)",
                        display: "grid",
                        gap: "10px",
                      }}
                    >
                      {isEditing ? (
                        <input
                          value={editingIndustryName}
                          onChange={(e) => setEditingIndustryName(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "10px 11px",
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.12)",
                            borderRadius: "8px",
                            color: "white",
                            fontSize: "13px",
                          }}
                        />
                      ) : (
                        <div style={{ fontSize: "14px", color: "var(--white-95)", fontWeight: 500 }}>{row?.name || "—"}</div>
                      )}

                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {canEditDelete && isEditing && (
                          <>
                            <ActionBtn onClick={saveIndustryEdit} disabled={industrySaving}>Save</ActionBtn>
                            <ActionBtn outline onClick={cancelIndustryEdit}>Cancel</ActionBtn>
                          </>
                        )}

                        {canEditDelete && !isEditing && (
                          <>
                            <ActionBtn outline onClick={() => startIndustryEdit(row)}>Edit</ActionBtn>
                            <button
                              type="button"
                              onClick={() => deleteIndustry(id)}
                              style={{
                                padding: "9px 14px",
                                borderRadius: "10px",
                                background: "rgba(239,68,68,0.1)",
                                border: "1px solid rgba(239,68,68,0.25)",
                                color: "#ef4444",
                                fontSize: "12px",
                                fontWeight: 600,
                                letterSpacing: "0.03em",
                                cursor: "pointer",
                              }}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}

                {industries.length === 0 && (
                  <div style={{ color: "var(--white-30)", fontFamily: "var(--font-mono)", fontSize: "12px", textAlign: "center", padding: "16px", border: "1px dashed rgba(255,255,255,0.14)", borderRadius: "10px" }}>
                    No industries found
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        <section
          style={{
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px",
            overflow: "hidden",
            background: "var(--black-card)",
            minWidth: 0,
          }}
        >
          <div style={{ padding: "16px", borderBottom: "1px solid rgba(255,255,255,0.08)", background: "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))" }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "24px", letterSpacing: "0.04em", marginBottom: "6px" }}>ACADEMIC SESSIONS</h3>
            <p style={{ fontSize: "12px", color: "var(--white-60)", fontFamily: "var(--font-mono)" }}>
              Maintain session timeline for filtering and reporting.
            </p>
          </div>

          <div style={{ padding: "16px" }}>
            <form onSubmit={handleSessionAdd} style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr auto", gap: "10px", marginBottom: "12px" }}>
              <input
                type="number"
                value={sessionYearInput}
                onChange={(e) => setSessionYearInput(e.target.value)}
                placeholder="Session start year (e.g. 2026)"
                disabled={!canAdd || sessionSaving}
                style={{
                  width: "100%",
                  padding: "11px 12px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "10px",
                  color: "white",
                  fontSize: "14px",
                }}
              />
              <ActionBtn type="submit" disabled={!canAdd || sessionSaving}>Add Session</ActionBtn>
            </form>

            {sessionMsg && (
              <div style={{ marginBottom: "10px", fontSize: "12px", color: "var(--orange)", fontFamily: "var(--font-mono)", padding: "8px 10px", borderRadius: "8px", border: "1px solid rgba(255,146,0,0.25)", background: "rgba(255,146,0,0.08)" }}>
                {sessionMsg}
              </div>
            )}

            {sessionError && (
              <div style={{ marginBottom: "10px", fontSize: "12px", color: "#ef4444", padding: "8px 10px", borderRadius: "8px", border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)" }}>
                {sessionError}
              </div>
            )}

            {sessionLoading ? (
              <div style={{ color: "var(--white-60)", fontSize: "13px", padding: "14px", border: "1px dashed rgba(255,255,255,0.14)", borderRadius: "10px", textAlign: "center" }}>Loading sessions...</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: isMobile ? "360px" : "460px", overflowY: "auto", paddingRight: "2px" }}>
                {sessions.map((row, idx) => {
                  const id = getSessionId(row);
                  return (
                    <div
                      key={id ?? `${getSessionLabel(row)}-${idx}`}
                      style={{
                        padding: "12px",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "10px",
                        background: "rgba(255,255,255,0.02)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "10px",
                        flexWrap: "wrap",
                      }}
                    >
                      <span style={{ fontSize: "14px", color: "var(--white-95)", fontWeight: 500 }}>{getSessionLabel(row)}</span>
                      {canEditDelete && id != null && (
                        <button
                          type="button"
                          onClick={() => deleteSession(id)}
                          style={{
                            padding: "9px 14px",
                            borderRadius: "10px",
                            background: "rgba(239,68,68,0.1)",
                            border: "1px solid rgba(239,68,68,0.25)",
                            color: "#ef4444",
                            fontSize: "12px",
                            fontWeight: 600,
                            letterSpacing: "0.03em",
                            cursor: "pointer",
                          }}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  );
                })}

                {sessions.length === 0 && (
                  <div style={{ color: "var(--white-30)", fontFamily: "var(--font-mono)", fontSize: "12px", textAlign: "center", padding: "16px", border: "1px dashed rgba(255,255,255,0.14)", borderRadius: "10px" }}>
                    No academic sessions found
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      {confirmDialog.isOpen && (
        <div
          role="presentation"
          onClick={closeConfirm}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 320,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={confirmDialog.title}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "420px",
              borderRadius: "14px",
              border:
                confirmDialog.variant === "danger"
                  ? "1px solid rgba(239,68,68,0.45)"
                  : "1px solid rgba(244,96,12,0.35)",
              background: "linear-gradient(180deg, #1a1a1a 0%, #121212 100%)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.55)",
              overflow: "hidden",
              animation: "tnpFadeUp 0.2s ease",
            }}
          >
            <div
              style={{
                padding: "18px 18px 14px",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  letterSpacing: "0.05em",
                  fontSize: "26px",
                  lineHeight: 1,
                  color:
                    confirmDialog.variant === "danger"
                      ? "#f87171"
                      : "var(--orange)",
                  marginBottom: "10px",
                }}
              >
                CONFIRM ACTION
              </div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "var(--white)",
                  marginBottom: confirmDialog.message ? "8px" : 0,
                }}
              >
                {confirmDialog.title}
              </div>
              {confirmDialog.message ? (
                <div
                  style={{
                    fontSize: "13px",
                    lineHeight: 1.6,
                    color: "var(--white-60)",
                  }}
                >
                  {confirmDialog.message}
                </div>
              ) : null}
            </div>
            <div
              style={{
                padding: "14px 18px",
                display: "flex",
                justifyContent: "space-between",
                gap: "10px",
              }}
            >
              <ActionBtn outline onClick={closeConfirm}>
                {confirmDialog.cancelText || "Cancel"}
              </ActionBtn>
              <ActionBtn onClick={handleConfirm}>
                {confirmDialog.confirmText || "Confirm"}
              </ActionBtn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
