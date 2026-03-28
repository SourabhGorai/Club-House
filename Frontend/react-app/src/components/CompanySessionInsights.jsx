import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_URL || "http://72.155.88.211:8080";

function getCurrentSession() {
  const now = new Date();
  const startYear = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
  return `${startYear}-${String(startYear + 1).slice(2)}`;
}

function authHeaders() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return {
    Authorization: `Bearer ${token}`,
    "X-User-PRN": user?.prn || "",
    "X-User-Role": user?.role || "USER",
  };
}

function computeAverage(values = []) {
  const nums = values
    .map((v) => Number(v))
    .filter((v) => Number.isFinite(v) && v > 0);

  if (!nums.length) return null;

  const sum = nums.reduce((acc, n) => acc + n, 0);
  return sum / nums.length;
}

export default function CompanySessionInsights() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(getCurrentSession());
  const [rows, setRows] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState(null);

  const loadSessions = async () => {
    setLoadingSessions(true);

    try {
      const res = await axios.get(`${BASE_URL}/api/visitYear/all/getAllSessions`, {
        headers: authHeaders(),
      });

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
    if (!session) return;

    setLoadingData(true);
    setError(null);

    try {
      const res = await axios.get(`${BASE_URL}/api/company/all/combinedPackage`, {
        headers: authHeaders(),
        params: { session },
      });

      const raw = res.data?.data ?? [];
      setRows(Array.isArray(raw) ? raw : []);
    } catch (err) {
      setRows([]);
      setError(err.response?.data?.message || "Failed to load company insights");
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

  const summary = useMemo(() => {
    const companyCount = rows.length;
    const totalStudents = rows.reduce((acc, row) => acc + (Number(row?.studentsHired) || 0), 0);

    const allPackages = rows.flatMap((row) =>
      (Array.isArray(row?.packageOffered) ? row.packageOffered : [])
        .map((v) => Number(v))
        .filter((v) => Number.isFinite(v) && v > 0),
    );

    const sessionAvg = allPackages.length
      ? allPackages.reduce((acc, n) => acc + n, 0) / allPackages.length
      : null;

    return { companyCount, totalStudents, sessionAvg };
  }, [rows]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #0c0c0c 0%, #121212 60%, #0f0f0f 100%)",
      color: "#fff",
      fontFamily: "'DM Sans', sans-serif",
      padding: "28px 24px 56px",
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "24px",
        }}>
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            style={{
              border: "1px solid rgba(255,255,255,0.2)",
              color: "#fff",
              background: "transparent",
              padding: "8px 14px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Back to Dashboard
          </button>

          <button
            type="button"
            onClick={() => navigate("/tnp")}
            style={{
              border: "1px solid rgba(244,96,12,0.4)",
              color: "#f4600c",
              background: "rgba(244,96,12,0.08)",
              padding: "8px 14px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Open TNP Page
          </button>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "12px", letterSpacing: "0.12em", color: "#f4600c", marginBottom: "8px" }}>
            PUBLIC INSIGHTS
          </div>
          <h1 style={{ fontSize: "42px", margin: 0, lineHeight: 1.1 }}>
            Session-wise Company Insights
          </h1>
          <p style={{ color: "rgba(255,255,255,0.72)", marginTop: "10px" }}>
            Company wise hired count and package offers for each academic session.
          </p>
        </div>

        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
          marginBottom: "20px",
        }}>
          <label htmlFor="session-select" style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px" }}>
            Select Session
          </label>
          <select
            id="session-select"
            value={selectedSession}
            disabled={loadingSessions}
            onChange={(e) => setSelectedSession(e.target.value)}
            style={{
              minWidth: "180px",
              background: "#1a1a1a",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "8px",
              padding: "10px 12px",
            }}
          >
            {sessions.map((session) => (
              <option key={session} value={session}>
                {session}
              </option>
            ))}
          </select>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "10px",
          marginBottom: "20px",
        }}>
          <div style={{ background: "#171717", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "16px" }}>
            <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.65)" }}>Companies</div>
            <div style={{ fontSize: "30px", fontWeight: 600 }}>{summary.companyCount}</div>
          </div>
          <div style={{ background: "#171717", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "16px" }}>
            <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.65)" }}>Total Students Hired</div>
            <div style={{ fontSize: "30px", fontWeight: 600 }}>{summary.totalStudents}</div>
          </div>
          <div style={{ background: "#171717", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "16px" }}>
            <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.65)" }}>Session Average Package</div>
            <div style={{ fontSize: "30px", fontWeight: 600, color: "#f4600c" }}>
              {summary.sessionAvg !== null ? `₹${summary.sessionAvg.toFixed(2)} LPA` : "-"}
            </div>
          </div>
        </div>

        {error && (
          <div style={{
            marginBottom: "16px",
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.4)",
            borderRadius: "10px",
            padding: "12px 14px",
            color: "#fca5a5",
          }}>
            {error}
          </div>
        )}

        <div style={{
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "12px",
          overflow: "hidden",
          background: "#141414",
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr 1.1fr 1fr",
            gap: "8px",
            padding: "12px 14px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            fontSize: "12px",
            letterSpacing: "0.06em",
            color: "rgba(255,255,255,0.65)",
            textTransform: "uppercase",
          }}>
            <div>Company</div>
            <div>Industry</div>
            <div>Package Offered</div>
            <div>Students Hired</div>
          </div>

          {loadingData ? (
            <div style={{ padding: "26px", textAlign: "center", color: "rgba(255,255,255,0.7)" }}>
              Loading data...
            </div>
          ) : rows.length === 0 ? (
            <div style={{ padding: "26px", textAlign: "center", color: "rgba(255,255,255,0.45)" }}>
              No company data found for this session.
            </div>
          ) : (
            rows.map((row, idx) => {
              const packages = Array.isArray(row?.packageOffered)
                ? row.packageOffered.map((v) => Number(v)).filter((v) => Number.isFinite(v) && v > 0)
                : [];
              const avg = computeAverage(packages);

              return (
                <div
                  key={`${row?.companyId || idx}-${row?.name || "company"}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.4fr 1fr 1.1fr 1fr",
                    gap: "8px",
                    padding: "14px",
                    borderBottom: idx === rows.length - 1 ? "none" : "1px solid rgba(255,255,255,0.06)",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: "2px" }}>{row?.name || "-"}</div>
                    <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)" }}>{row?.academicSession || selectedSession}</div>
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.8)" }}>{row?.industry || "-"}</div>
                  <div>
                    <div style={{ color: "#f4600c", fontWeight: 600 }}>
                      {avg !== null ? `Avg ₹${avg.toFixed(2)} LPA` : "-"}
                    </div>
                    <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)" }}>
                      {packages.length ? `Offers: ${packages.join(", ")}` : "No package entries"}
                    </div>
                  </div>
                  <div style={{ fontWeight: 600 }}>{Number(row?.studentsHired) || 0}</div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
