import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "../../components/ConfirmDialog";
import {
  Users,
  Search,
  Filter,
  ShieldCheck,
  Building2,
  AlertCircle,
  CheckCircle2,
  UserMinus,
  Briefcase,
  Layers,
  Pencil,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL || "http://72.155.88.211:8080";

export const useFilteredUsersCount = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const token = localStorage.getItem("token");

        if (user?.role === "TEACHERS") {
          const clubsResponse = await axios.get(
            `${BASE_URL}/api/user-clubs/user/${user.prn}`,
            { headers: { Authorization: `Bearer ${token}` } },
          );

          if (clubsResponse.data.success) {
            const teacherRoleClubs = clubsResponse.data.data.filter((club) =>
              ["TEACHER", "TEACHERS"].includes(club.role.toUpperCase()),
            );

            let totalStudents = 0;
            for (const club of teacherRoleClubs) {
              const studentsResponse = await axios.get(
                `${BASE_URL}/api/user-clubs/club/${club.clubName}`,
                { headers: { Authorization: `Bearer ${token}` } },
              );
              if (studentsResponse.data.success) {
                const students = studentsResponse.data.data.filter((u) =>
                  ["TEAM_MEMBER", "CLUB_ADMIN"].includes(u.role.toUpperCase()),
                );
                totalStudents += students.length;
              }
            }
            setCount(totalStudents);
          }
        } else {
          const response = await axios.get(
            `${BASE_URL}/api/user-clubs`,
            { headers: { Authorization: `Bearer ${token}` } },
          );
          if (response.data.success) {
            const nonTeacherUsers = response.data.data.filter(
              (u) => u.role.toUpperCase() !== "TEACHERS",
            );
            setCount(nonTeacherUsers.length);
          }
        }
      } catch (err) {
        console.error("Error fetching count:", err);
        setCount(0);
      }
    };
    fetchData();
  }, []);

  return count;
};

// ─── Edit Role Modal ───────────────────────────────────────────────────────────
const EditRoleModal = ({ user, availableRoles, onClose, onSave, saving }) => {
  const [selectedRole, setSelectedRole] = useState(user.role);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Modal header */}
        <div
          className="px-8 py-6 flex items-center justify-between"
          style={{
            background: "linear-gradient(135deg, rgba(76,161,175,0.08), rgba(49,81,105,0.06))",
            borderBottom: "1px solid rgba(76,161,175,0.15)",
          }}
        >
          <div>
            <h3 className="text-lg font-black text-slate-800">Edit Role</h3>
            <p className="text-sm text-slate-500 mt-0.5">
              Change role for <span className="font-bold text-[#4CA1AF]">{user.name}</span> in{" "}
              <span className="font-bold">{user.clubName}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal body */}
        <div className="px-8 py-6">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
            Select New Role
          </label>
          <div className="flex flex-col gap-2">
            {availableRoles.map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`w-full px-5 py-3.5 rounded-2xl text-sm font-bold text-left transition-all border-2 ${
                  selectedRole === role
                    ? "border-[#4CA1AF] text-[#4CA1AF]"
                    : "border-slate-100 text-slate-600 hover:border-slate-200 hover:bg-slate-50"
                }`}
                style={
                  selectedRole === role
                    ? { backgroundColor: "rgba(76,161,175,0.08)" }
                    : {}
                }
              >
                <div className="flex items-center justify-between">
                  <span>{role.replace(/_/g, " ")}</span>
                  {selectedRole === role && (
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs"
                      style={{ backgroundColor: "#4CA1AF" }}
                    >
                      <Check size={12} />
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Modal footer */}
        <div className="px-8 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(selectedRole)}
            disabled={saving || selectedRole === user.role}
            className="flex-1 py-3 rounded-2xl text-white font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg, #4CA1AF, #315169)" }}
          >
            {saving ? "Saving..." : "Save Role"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const UserRemoveFromClub = () => {
  const navigate = useNavigate();
  const [userClubs, setUserClubs] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClub, setSelectedClub] = useState("");
  const [teacherPrn, setTeacherPrn] = useState("");
  const [teacherClubs, setTeacherClubs] = useState([]);
  const [teacherStudents, setTeacherStudents] = useState([]);
  const [loadingClubs, setLoadingClubs] = useState(false);

  // Edit role state
  const [editingUser, setEditingUser] = useState(null);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [savingRole, setSavingRole] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: "", message: "", variant: "primary", confirmText: "Confirm", onConfirm: () => {} });
  const closeConfirm = () => setConfirmDialog((prev) => ({ ...prev, isOpen: false }));

  // Pagination state
  const PAGE_SIZE = 10;
  const [currentPage, setCurrentPage] = useState(0);

  // prn -> blob URL
  const [profileImages, setProfileImages] = useState({});

  const token = localStorage.getItem("token");

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      setProfileImages((prev) => {
        Object.values(prev).forEach((url) => {
          if (url) URL.revokeObjectURL(url);
        });
        return {};
      });
    };
  }, []);

  // Fetch available roles on mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/api/user-clubs/getAllClubRoles`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (res.data?.success) {
          // Filter out teacher roles so only student-level roles are shown
          const roles = (res.data.data || []).filter(
            (r) => !["TEACHER", "TEACHERS"].includes(r.toUpperCase()),
          );
          setAvailableRoles(roles);
        }
      } catch (err) {
        console.error("Error fetching roles:", err);
        // Fallback
        setAvailableRoles(["TEAM_MEMBER", "CLUB_ADMIN"]);
      }
    };
    fetchRoles();
  }, []);

  const fetchProfileImages = async (userList) => {
    const withImages = userList.filter((u) => u.hasProfileImage && u.imageUrl);
    const results = await Promise.all(
      withImages.map(async (user) => {
        try {
          const res = await axios.get(`${BASE_URL}${user.imageUrl}`, {
            headers: { Authorization: `Bearer ${token}` },
            responseType: "blob",
          });
          if (res.data && res.data.size > 0) {
            return { prn: user.prn, blobUrl: URL.createObjectURL(res.data) };
          }
          return { prn: user.prn, blobUrl: null };
        } catch {
          return { prn: user.prn, blobUrl: null };
        }
      }),
    );
    const map = results.reduce((acc, r) => {
      if (r) acc[r.prn] = r.blobUrl;
      return acc;
    }, {});
    setProfileImages((prev) => ({ ...prev, ...map }));
  };

  // ── Teacher flow ──
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.prn) {
      setTeacherPrn(user.prn);
      fetchTeacherClubs(user.prn);
    }
  }, []);

  const fetchTeacherClubs = async (prn) => {
    if (!prn) return;
    setLoadingClubs(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/api/user-clubs/user/${prn}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (response.data.success) {
        const teacherRoleClubs = response.data.data.filter((club) =>
          ["TEACHER", "TEACHERS"].includes(club.role.toUpperCase()),
        );
        setTeacherClubs(teacherRoleClubs);
        fetchStudentsFromClubs(teacherRoleClubs);
      }
    } catch (err) {
      console.error("Error fetching teacher clubs:", err);
      setTeacherClubs([]);
    } finally {
      setLoadingClubs(false);
    }
  };

  const fetchStudentsFromClubs = async (clubs) => {
    if (!clubs.length) return;
    try {
      const allStudents = [];
      for (const club of clubs) {
        const response = await axios.get(
          `${BASE_URL}/api/user-clubs/club/${club.clubName}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (response.data.success) {
          const students = response.data.data.filter((u) =>
            ["TEAM_MEMBER", "CLUB_ADMIN"].includes(u.role.toUpperCase()),
          );
          allStudents.push(...students);
        }
      }
      setTeacherStudents(allStudents);
      await fetchProfileImages(allStudents);
    } catch (err) {
      console.error("Error fetching club students:", err);
      setTeacherStudents([]);
    }
  };

  // ── Non-teacher flow ──
  const fetchUserClubs = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user"));

      if (user?.role === "TEACHERS") {
        await fetchTeacherClubs(user.prn);
        setLoading(false);
        return;
      }

      const response = await axios.get(`${BASE_URL}/api/user-clubs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        const nonTeacherUsers = response.data.data.filter(
          (u) => u.role.toUpperCase() !== "TEACHERS",
        );
        setUserClubs(nonTeacherUsers);
        setFilteredUsers(nonTeacherUsers);
        await fetchProfileImages(nonTeacherUsers);
      }
    } catch (err) {
      setError("Failed to fetch user data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserClubs();
  }, []);

  useEffect(() => {
    let filtered = teacherStudents.length > 0 ? teacherStudents : userClubs;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(term) ||
          user.prn.toLowerCase().includes(term) ||
          (user.department && user.department.toLowerCase().includes(term)) ||
          user.role.toLowerCase().includes(term),
      );
    }
    if (selectedClub) {
      filtered = filtered.filter(
        (user) => user.clubId && user.clubId.toString() === selectedClub,
      );
    }
    setFilteredUsers(filtered);
  }, [searchTerm, selectedClub, userClubs, teacherStudents]);

  // Reset to first page whenever filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, selectedClub, userClubs, teacherStudents]);

  const handleRemoveUser = async (user) => {
    const { prn, clubName, name, clubId, role, tenure } = user;
    try {
      const response = await axios.delete(
        `${BASE_URL}/api/user-clubs/user/${prn}/club/${clubName}`,
        {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          data: { prn, clubId, role, tenure },
        },
      );
      if (response.data.success) {
        setSuccessMessage(`Successfully removed ${name} from ${clubName}`);
        fetchUserClubs();
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err) {
      setError(`Failed to remove user. ${err.response?.data?.message || err.message}`);
    }
  };

  const handleSaveRole = async (newRole) => {
    if (!editingUser || newRole === editingUser.role) return;
    setSavingRole(true);
    console.log(newRole, editingUser.prn, editingUser.clubId);
    try {
      const response = await axios.post(
        `${BASE_URL}/api/user-clubs/changeClubRole`,
        {
          prn: editingUser.prn,
          clubId: editingUser.clubId,
          newRole,
        },
        {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        },
      );
      if (response.data?.success) {
        setSuccessMessage(
          `Role updated to ${newRole.replace(/_/g, " ")} for ${editingUser.name}`,
        );
        setEditingUser(null);
        fetchUserClubs();
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        throw new Error(response.data?.message || "Failed to update role");
      }
    } catch (err) {
      setError(`Failed to update role. ${err.response?.data?.message || err.message}`);
    } finally {
      setSavingRole(false);
    }
  };

  if (loading || loadingClubs) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center">
        <div
          className="w-16 h-16 border-4 rounded-full animate-spin"
          style={{ borderColor: "rgba(76, 161, 175, 0.1)", borderTopColor: "#4CA1AF" }}
        ></div>
        <p className="mt-4 font-medium text-slate-500 animate-pulse tracking-wide">
          {teacherPrn ? "Loading teacher's students..." : "Synchronizing database..."}
        </p>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 text-slate-900 font-sans antialiased relative overflow-hidden">
      <style jsx>{`
        @keyframes blob {
          0%   { transform: translate(0px, 0px)   scale(1);   }
          33%  { transform: translate(30px, -50px) scale(1.1); }
          66%  { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px)   scale(1);   }
        }
        .animate-blob          { animation: blob 7s infinite; }
        .animation-delay-2000  { animation-delay: 2s; }
        .animation-delay-4000  { animation-delay: 4s; }
      `}</style>

      {/* Edit Role Modal */}
      {editingUser && (
        <EditRoleModal
          user={editingUser}
          availableRoles={availableRoles}
          onClose={() => setEditingUser(null)}
          onSave={handleSaveRole}
          saving={savingRole}
        />
      )}

      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-2000"
          style={{ backgroundColor: "#4CA1AF" }}
        ></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-4000"></div>
      </div>

      {/* Fixed Back Button Bar */}
      <div className="fixed top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#4CA1AF] transition-colors group cursor-pointer"
            >
              <svg
                className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform"
                style={{ color: "#4CA1AF" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span className="font-bold">Back to Dashboard</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 pt-24 sm:px-6 lg:px-8 relative z-10">
        {/* 1. Header */}
        <div className="mb-8">
          <div
            className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4"
            style={{ backgroundColor: "rgba(76, 161, 175, 0.1)", color: "#4CA1AF" }}
          ></div>
          <h1 className="text-4xl font-black tracking-tight leading-tight bg-gradient-to-r from-[#4CA1AF] to-[#162F38] bg-clip-text text-transparent">
            User Club Association
          </h1>
          <p className="text-slate-500 mt-2 text-lg font-medium">
            Refine your organization by managing club rosters and permissions.
          </p>
        </div>

        {/* 2. Search & Filter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
          <div className="lg:col-span-8 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors" size={20} style={{ color: "#4CA1AF" }} />
            <input
              type="text"
              placeholder="Search by name, PRN, or department..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:border-transparent transition-all shadow-sm outline-none text-slate-700 font-medium cursor-text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="lg:col-span-4 relative group">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors" size={20} style={{ color: "#4CA1AF" }} />
            <select
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:border-transparent transition-all shadow-sm outline-none appearance-none text-slate-700 font-bold cursor-pointer"
              value={selectedClub}
              onChange={(e) => setSelectedClub(e.target.value)}
            >
              <option value="">All Clubs</option>
              {teacherClubs.map((club) => (
                <option key={club.clubId} value={club.clubId}>
                  {club.clubName} • {club.role}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 3. Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { icon: <Users size={28} />, label: "Total Users",   value: filteredUsers.length,                                    bg: "rgba(59,130,246,0.12)",  color: "#3B82F6" },
            { icon: <Building2 size={28} />, label: "Unique Clubs",  value: teacherClubs.length,                                     bg: "rgba(16,185,129,0.12)",  color: "#10B981" },
            { icon: <Layers size={28} />, label: "Active Roles",  value: [...new Set(filteredUsers.map((u) => u.role))].length,   bg: "rgba(168,85,247,0.12)",  color: "#A855F7" },
          ].map(({ icon, label, value, bg, color }) => (
            <div key={label} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex items-center space-x-5 transition-transform hover:scale-[1.02] cursor-pointer">
              <div className="p-4 rounded-2xl" style={{ backgroundColor: bg, color }}>{icon}</div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</p>
                <h3 className="text-3xl font-black text-slate-900">{value}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Teacher Dashboard Banner */}
        {teacherClubs.length > 0 && (
          <div className="mb-6 p-6 border rounded-[2rem] shadow-xl" style={{ background: "linear-gradient(to right, rgba(76,161,175,0.1), rgba(49,81,105,0.1))", borderColor: "rgba(76,161,175,0.2)" }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-2xl" style={{ backgroundColor: "rgba(190,166,108,0.15)", color: "#ef9d0f" }}>
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black" style={{ color: "#26727e" }}>Teacher Dashboard Mode</h3>
                  <p className="text-sm font-medium" style={{ color: "#26727e" }}>Showing students from your assigned clubs</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold" style={{ color: "#26727e" }}>PRN: {teacherPrn}</p>
                <p className="text-xs" style={{ color: "#26727e" }}>{teacherClubs.length} clubs assigned</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-bold mb-2" style={{ color: "#34757e" }}>Your Clubs:</p>
              <div className="flex flex-wrap gap-2">
                {teacherClubs.map((club) => (
                  <span key={club.clubId} className="px-4 py-2 bg-white text-sm font-bold rounded-full border shadow-sm hover:shadow-md transition-shadow" style={{ color: "#34757e", borderColor: "rgba(76,161,175,0.2)" }}>
                    {club.clubName} • {club.role}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Notifications */}
        {error && (
          <div className="mb-6 flex items-center p-4 bg-red-50 border-l-4 border-red-500 text-red-800 rounded-xl">
            <AlertCircle className="mr-3 shrink-0" size={20} />
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}
        {successMessage && (
          <div className="mb-6 flex items-center p-4 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 rounded-xl">
            <CheckCircle2 className="mr-3 shrink-0" size={20} />
            <p className="text-sm font-bold">{successMessage}</p>
          </div>
        )}

        {/* 4. Table */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/60 overflow-hidden">
          <div className="overflow-x-auto">
            {filteredUsers.length === 0 ? (
              <div className="py-24 text-center">
                <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search size={40} className="text-slate-300" />
                </div>
                <h3 className="text-xl font-black text-slate-900">No members match your criteria</h3>
                <p className="text-slate-500 font-medium">Try broadening your search or adjusting filters.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Member</th>
                    <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Club & Status</th>
                    <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Education</th>
                    <th className="px-10 py-6 text-right text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE).map((user) => {
                    const blobUrl = profileImages[user.prn];
                    return (
                      <tr key={user.userClubId} className="group hover:bg-[#4CA1AF]/5 transition-all duration-300">
                        {/* Member */}
                        <td className="px-10 py-6">
                          <div className="flex items-center space-x-4">
                            <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                              {blobUrl ? (
                                <img src={blobUrl} alt={user.name} className="w-14 h-14 object-cover rounded-2xl" />
                              ) : (
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl" style={{ background: "linear-gradient(135deg, #4CA1AF, #315169)" }}>
                                  {user.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-black text-slate-900 text-lg leading-tight transition-colors group-hover:text-[#4CA1AF]">{user.name}</p>
                              <p className="text-xs font-bold text-slate-400 mt-1">{user.prn}</p>
                            </div>
                          </div>
                        </td>

                        {/* Club & Status */}
                        <td className="px-10 py-6">
                          <div className="flex flex-col space-y-2">
                            <span className="inline-flex items-center text-sm font-black text-slate-800">
                              <Building2 size={16} className="mr-2" style={{ color: "#4CA1AF" }} />
                              {user.clubName}
                            </span>
                            <div>
                              <span
                                className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm border ${
                                  user.role === "CLUB_ADMIN" ? "text-purple-700 border-purple-100" : "text-blue-700 border-blue-100"
                                }`}
                                style={user.role === "CLUB_ADMIN" ? { backgroundColor: "rgba(76,161,175,0.1)" } : { backgroundColor: "rgba(59,130,246,0.1)" }}
                              >
                                {user.role.replace(/_/g, " ")}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Education */}
                        <td className="px-10 py-6">
                          <div className="space-y-1">
                            <div className="flex items-center text-sm font-bold text-slate-700">
                              <Briefcase size={14} className="mr-2 text-slate-400" />
                              {user.department}
                            </div>
                            <p className="text-xs font-bold text-slate-400 ml-5">Year {user.year} • {user.tenure}</p>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-10 py-6">
                          <div className="flex items-center justify-end gap-2">
                            {/* Edit Role button */}
                            <button
                              onClick={() => setEditingUser(user)}
                              className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-white hover:border-transparent hover:bg-[#4CA1AF] transition-all shadow-sm active:scale-90 cursor-pointer"
                              title="Edit role"
                            >
                              <Pencil size={18} />
                            </button>

                            {/* Remove button */}
                            <button
                              onClick={() => setConfirmDialog({ isOpen: true, title: "Remove from Club", message: `Are you sure you want to remove ${user.name} from ${user.clubName}?`, confirmText: "Remove", variant: "danger", onConfirm: () => { closeConfirm(); handleRemoveUser(user); } })}
                              className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-white hover:border-transparent hover:rotate-12 hover:bg-red-500 transition-all shadow-sm active:scale-90 cursor-pointer"
                              title="Remove from club"
                            >
                              <UserMinus size={22} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Pagination */}
        {filteredUsers.length > PAGE_SIZE && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
            <p className="text-sm font-bold text-slate-500">
              Showing{" "}
              <span className="text-slate-800">{currentPage * PAGE_SIZE + 1}–{Math.min((currentPage + 1) * PAGE_SIZE, filteredUsers.length)}</span>
              {" "}of{" "}
              <span className="text-slate-800">{filteredUsers.length}</span> members
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-white hover:bg-[#4CA1AF] hover:border-[#4CA1AF] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronLeft size={18} />
              </button>

              {Array.from({ length: Math.ceil(filteredUsers.length / PAGE_SIZE) }, (_, i) => i)
                .filter((i) => i === 0 || i === Math.ceil(filteredUsers.length / PAGE_SIZE) - 1 || Math.abs(i - currentPage) <= 1)
                .reduce((acc, i, idx, arr) => {
                  if (idx > 0 && i - arr[idx - 1] > 1) acc.push("...");
                  acc.push(i);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === "..." ? (
                    <span key={`ellipsis-${idx}`} className="px-1 text-slate-400 font-bold text-sm">…</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setCurrentPage(item)}
                      className={`w-10 h-10 rounded-xl text-sm font-black transition-all shadow-sm ${
                        item === currentPage
                          ? "text-white border-transparent"
                          : "bg-white border border-slate-200 text-slate-600 hover:border-[#4CA1AF] hover:text-[#4CA1AF]"
                      }`}
                      style={item === currentPage ? { background: "linear-gradient(135deg, #4CA1AF, #315169)" } : {}}
                    >
                      {item + 1}
                    </button>
                  ),
                )}

              <button
                onClick={() => setCurrentPage((p) => Math.min(Math.ceil(filteredUsers.length / PAGE_SIZE) - 1, p + 1))}
                disabled={currentPage >= Math.ceil(filteredUsers.length / PAGE_SIZE) - 1}
                className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-white hover:bg-[#4CA1AF] hover:border-[#4CA1AF] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 flex flex-col md:flex-row items-center justify-between text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] px-6 opacity-60">
          <p>Database synchronization active • {filteredUsers.length} Users Listed</p>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <span className="flex items-center">
              <span className="w-2.5 h-2.5 rounded-full mr-2 shadow-sm" style={{ backgroundColor: "#4CA1AF" }}></span>
              Admin
            </span>
            <span className="flex items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 mr-2 shadow-sm"></span>
              Member
            </span>
          </div>
        </div>
      </div>
    </div>

    <ConfirmDialog
      isOpen={confirmDialog.isOpen}
      title={confirmDialog.title}
      message={confirmDialog.message}
      confirmText={confirmDialog.confirmText}
      variant={confirmDialog.variant}
      onConfirm={confirmDialog.onConfirm}
      onCancel={closeConfirm}
    />
    </>
  );
};

export default UserRemoveFromClub;