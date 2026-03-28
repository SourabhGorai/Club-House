import { useEffect, useRef, useState } from "react";
import axios from "axios";
import ConfirmDialog from "../ConfirmDialog";

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
          padding: "8px 12px",
          borderRadius: "6px",
          border: outline ? "1px solid #f4600c" : "none",
          background: outline ? "transparent" : "#f4600c",
          color: outline ? "#f4600c" : "#fff",
          fontSize: "12px",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.7 : 1,
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
    <div style={{ animation: "tnpFadeUp 0.3s ease" }}>
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "40px", letterSpacing: "0.04em" }}>
          INDUSTRIES & SESSIONS
        </h2>
        <p style={{ color: "var(--white-60)", fontSize: "13px", fontFamily: "var(--font-mono)" }}>
          Coordinator can add. Super Admin, TNP Head, President, Vice President can edit/delete.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <section style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", overflow: "hidden" }}>
          <div style={{ padding: "16px", borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "24px", letterSpacing: "0.04em" }}>INDUSTRIES</h3>
          </div>

          <div style={{ padding: "16px" }}>
            <form onSubmit={handleIndustryAdd} style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
              <input
                value={industryInput}
                onChange={(e) => setIndustryInput(e.target.value)}
                placeholder="Add industry name"
                disabled={!canAdd || industrySaving}
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "6px",
                  color: "white",
                  fontSize: "14px",
                }}
              />
              <ActionBtn type="submit" disabled={!canAdd || industrySaving}>Add</ActionBtn>
            </form>

            {industryMsg && (
              <div style={{ marginBottom: "10px", fontSize: "12px", color: "var(--orange)", fontFamily: "var(--font-mono)" }}>
                {industryMsg}
              </div>
            )}

            {industryError && (
              <div style={{ marginBottom: "10px", fontSize: "12px", color: "#ef4444" }}>{industryError}</div>
            )}

            {industryLoading ? (
              <div style={{ color: "var(--white-60)", fontSize: "13px" }}>Loading industries...</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "420px", overflowY: "auto" }}>
                {industries.map((row) => {
                  const id = row?.industryId;
                  const isEditing = editingIndustryId === id;
                  return (
                    <div
                      key={id}
                      style={{
                        padding: "10px",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "6px",
                        background: "var(--black-card)",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      {isEditing ? (
                        <input
                          value={editingIndustryName}
                          onChange={(e) => setEditingIndustryName(e.target.value)}
                          style={{
                            flex: 1,
                            padding: "8px 10px",
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "6px",
                            color: "white",
                            fontSize: "13px",
                          }}
                        />
                      ) : (
                        <div style={{ flex: 1, fontSize: "14px" }}>{row?.name || "—"}</div>
                      )}

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
                              padding: "8px 12px",
                              borderRadius: "6px",
                              background: "rgba(239,68,68,0.1)",
                              border: "1px solid rgba(239,68,68,0.2)",
                              color: "#ef4444",
                              fontSize: "12px",
                              cursor: "pointer",
                            }}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  );
                })}

                {industries.length === 0 && (
                  <div style={{ color: "var(--white-30)", fontFamily: "var(--font-mono)", fontSize: "12px", textAlign: "center", padding: "14px" }}>
                    No industries found
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        <section style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", overflow: "hidden" }}>
          <div style={{ padding: "16px", borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "24px", letterSpacing: "0.04em" }}>ACADEMIC SESSIONS</h3>
          </div>

          <div style={{ padding: "16px" }}>
            <form onSubmit={handleSessionAdd} style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
              <input
                type="number"
                value={sessionYearInput}
                onChange={(e) => setSessionYearInput(e.target.value)}
                placeholder="Session start year"
                disabled={!canAdd || sessionSaving}
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "6px",
                  color: "white",
                  fontSize: "14px",
                }}
              />
              <ActionBtn type="submit" disabled={!canAdd || sessionSaving}>Add</ActionBtn>
            </form>

            {sessionMsg && (
              <div style={{ marginBottom: "10px", fontSize: "12px", color: "var(--orange)", fontFamily: "var(--font-mono)" }}>
                {sessionMsg}
              </div>
            )}

            {sessionError && (
              <div style={{ marginBottom: "10px", fontSize: "12px", color: "#ef4444" }}>{sessionError}</div>
            )}

            {sessionLoading ? (
              <div style={{ color: "var(--white-60)", fontSize: "13px" }}>Loading sessions...</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "420px", overflowY: "auto" }}>
                {sessions.map((row) => {
                  const id = getSessionId(row);
                  return (
                    <div
                      key={id || `${getSessionLabel(row)}-${Math.random()}`}
                      style={{
                        padding: "10px",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "6px",
                        background: "var(--black-card)",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <div style={{ flex: 1, fontSize: "14px" }}>{getSessionLabel(row)}</div>
                      {canEditDelete && id != null && (
                        <button
                          type="button"
                          onClick={() => deleteSession(id)}
                          style={{
                            padding: "8px 12px",
                            borderRadius: "6px",
                            background: "rgba(239,68,68,0.1)",
                            border: "1px solid rgba(239,68,68,0.2)",
                            color: "#ef4444",
                            fontSize: "12px",
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
                  <div style={{ color: "var(--white-30)", fontFamily: "var(--font-mono)", fontSize: "12px", textAlign: "center", padding: "14px" }}>
                    No academic sessions found
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        isDarkMode={true}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
        variant={confirmDialog.variant}
        onConfirm={handleConfirm}
        onCancel={closeConfirm}
      />
    </div>
  );
}
