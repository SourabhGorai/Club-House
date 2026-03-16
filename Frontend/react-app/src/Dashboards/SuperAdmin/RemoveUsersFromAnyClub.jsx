import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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
import CustomSelect from "../../components/CustomSelect"; // ← adjust path as needed
import ConfirmDialog from "../../components/ConfirmDialog";

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
                style={selectedRole === role ? { backgroundColor: "rgba(76,161,175,0.08)" } : {}}
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

const BASE_URL = import.meta.env.VITE_API_URL || "http://72.155.88.211:8080";

// ─── Main Component ────────────────────────────────────────────────────────────
const RemoveUsersFromAnyClub = () => {
  const navigate = useNavigate();
  const [userClubs, setUserClubs] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClub, setSelectedClub] = useState("");
  const [clubs, setClubs] = useState([]);
  const [totalClubs, setTotalClubs] = useState(0);

  // Pagination state
  const PAGE_SIZE = 10;
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [expandedMobileCard, setExpandedMobileCard] = useState(null);

  // Edit role state
  const [editingUser, setEditingUser] = useState(null);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [savingRole, setSavingRole] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: "", message: "", variant: "primary", confirmText: "Confirm", onConfirm: () => {} });
  const closeConfirm = () => setConfirmDialog((prev) => ({ ...prev, isOpen: false }));

  const token = localStorage.getItem("token");

  // Fetch available roles
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/api/user-clubs/getAllClubRoles`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (res.data?.success) {
          setAvailableRoles((res.data.data || []).filter((r) => !r.toUpperCase().includes("TEACHER")));
        }
      } catch (err) {
        console.error("Error fetching roles:", err);
        setAvailableRoles(["TEAM_MEMBER", "CLUB_ADMIN"]);
      }
    };
    fetchRoles();
  }, []);

  // Fetch all clubs
  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/clubs`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          setClubs(response.data.data);
          setTotalClubs(response.data.data.length);
        }
      } catch (error) {
        console.error("Error fetching clubs:", error);
      }
    };
    fetchClubs();
  }, []);

  const fetchPagedData = async (page = 0) => {
    try {
      setLoading(true);
      let url;
      if (selectedClub) {
        const club = clubs.find((c) => String(c.clubId) === String(selectedClub));
        if (club) {
          url = `${BASE_URL}/api/user-clubs/club/${encodeURIComponent(club.clubName)}/paged?page=${page}&size=${PAGE_SIZE}`;
        } else {
          url = `${BASE_URL}/api/user-clubs/getAll/paged?page=${page}&size=${PAGE_SIZE}`;
        }
      } else {
        url = `${BASE_URL}/api/user-clubs/getAll/paged?page=${page}&size=${PAGE_SIZE}`;
      }
      const response = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      if (response.data.success) {
        const pageData = response.data.data;
        setUserClubs(pageData.content);
        setCurrentPage(pageData.pageNumber);
        setTotalPages(pageData.totalPages);
        setTotalElements(pageData.totalElements);
      }
    } catch (err) {
      setError("Failed to fetch user data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Wait until clubs list is loaded when a club filter is active
    if (selectedClub && clubs.length === 0) return;
    fetchPagedData(0);
  }, [selectedClub, clubs]);

  useEffect(() => {
    setExpandedMobileCard(null);
  }, [currentPage, searchTerm, selectedClub]);

  // Search filters current page client-side; club filter is handled server-side
  useEffect(() => {
    if (!searchTerm) {
      setFilteredUsers(userClubs);
      return;
    }
    const term = searchTerm.toLowerCase();
    setFilteredUsers(
      userClubs.filter(
        (user) =>
          user.name.toLowerCase().includes(term) ||
          user.prn.toLowerCase().includes(term) ||
          user.department.toLowerCase().includes(term) ||
          user.role.toLowerCase().includes(term),
      ),
    );
  }, [searchTerm, userClubs]);

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
        fetchPagedData(currentPage);
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err) {
      setError(`Failed to remove user. ${err.response?.data?.message || err.message}`);
    }
  };

  const handleSaveRole = async (newRole) => {
    if (!editingUser || newRole === editingUser.role) return;
    setSavingRole(true);
    try {
      const response = await axios.post(
        `${BASE_URL}/api/user-clubs/changeClubRole`,
        { prn: editingUser.prn, clubId: editingUser.clubId, newRole },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } },
      );
      if (response.data?.success) {
        // Optimistic update
        const patchRole = (u) =>
          u.prn === editingUser.prn && u.clubId === editingUser.clubId
            ? { ...u, role: newRole }
            : u;
        setUserClubs((prev) => prev.map(patchRole));
        setSuccessMessage(`Role updated to ${newRole.replace(/_/g, " ")} for ${editingUser.name}`);
        setEditingUser(null);
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

  // Build club options for CustomSelect
  // First option acts as the "All Clubs" reset — we'll handle it via an empty string value
  const clubOptions = [
    { value: "", label: `All Clubs (${totalClubs})` },
    ...clubs.map((club) => ({ value: String(club.clubId), label: club.clubName })),
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center">
        <div
          className="w-16 h-16 border-4 rounded-full animate-spin"
          style={{ borderColor: "rgba(76, 161, 175, 0.1)", borderTopColor: "#4CA1AF" }}
        ></div>
        <p className="mt-4 font-medium text-slate-500 animate-pulse tracking-wide">
          Synchronizing database...
        </p>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative text-slate-900 font-sans antialiased">
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

      {/* Animated Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-2000" style={{ backgroundColor: "#4CA1AF" }}></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-4000"></div>
      </div>

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

      {/* Sticky Back Button Bar */}
      <div className="sticky top-0 z-50 w-full bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            {/* <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#4CA1AF] transition-colors group"
            >
              <svg
                className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform"
                style={{ color: "#4CA1AF" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Dashboard</span>
            </button> */}
                  <button
        onClick={() => navigate("/dashboard")}
        className="group flex items-center gap-2 sm:gap-3 border border-white/20 hover:border-white/40 font-medium rounded-full py-2 sm:py-2.5 px-4 sm:px-5 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
        style={{ background: "var(--primary-gradient)", color: "white" }}
      >
        <svg
          className="w-4 sm:w-5 h-4 sm:h-5 text-white transform group-hover:scale-110 transition-transform"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
        <span className="text-xs sm:text-sm hidden xs:inline">Dashboard</span>
      </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          {/* <div
            className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4"
            style={{ backgroundColor: "rgba(76, 161, 175, 0.1)", color: "#37828d" }}
          >
            <ShieldCheck size={14} />
            <span>Membership Management</span>
          </div> */}
          <h1 className="text-4xl font-black tracking-tight leading-tight bg-gradient-to-r from-[#4CA1AF] to-[#162F38] bg-clip-text text-transparent">
            Remove User from Club
          </h1>
          <p className="text-slate-500 mt-2 text-lg font-medium">
            Refine your organization by managing club rosters and permissions.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
          {/* Search */}
          <div className="lg:col-span-8 relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              size={20}
              style={{ color: "#4CA1AF" }}
            />
            <input
              type="text"
              placeholder="Search by name, PRN, or department..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:border-transparent transition-all shadow-sm outline-none text-slate-700 font-medium cursor-text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Club filter — CustomSelect */}
          <div className="lg:col-span-4">
            <CustomSelect
              name="clubFilter"
              value={selectedClub}
              onChange={(e) => setSelectedClub(e.target.value)}
              placeholder={`All Clubs (${totalClubs})`}
              options={clubOptions}
              className="h-full"
            />
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { icon: <Users size={28} />, label: "Total Users",  value: filteredUsers.length },
            { icon: <Building2 size={28} />, label: "Unique Clubs", value: clubs.length },
            { icon: <Layers size={28} />, label: "Active Roles", value: [...new Set(filteredUsers.map((u) => u.role))].length },
          ].map(({ icon, label, value }) => (
            <div
              key={label}
              className="bg-white/80 backdrop-blur-sm p-6 rounded-[2rem] border border-white/20 shadow-xl shadow-slate-200/40 flex items-center space-x-5 transition-transform hover:scale-[1.02] cursor-pointer"
            >
              <div className="p-4 rounded-2xl" style={{ backgroundColor: "rgba(76, 161, 175, 0.1)", color: "#4CA1AF" }}>
                {icon}
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</p>
                <h3 className="text-3xl font-black text-slate-900">{value}</h3>
              </div>
            </div>
          ))}
        </div>

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

        {/* Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-[2.5rem] border border-white/20 shadow-2xl shadow-slate-200/60 overflow-hidden">
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
              <>
                {/* Desktop table */}
                <div className="hidden lg:block">
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
                      {filteredUsers.map((user) => (
                        <tr key={user.userClubId} className="group hover:bg-[#4CA1AF]/5 transition-all duration-300">
                          {/* Member */}
                          <td className="px-10 py-6">
                            <div className="flex items-center space-x-4">
                              <div
                                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg group-hover:scale-110 transition-transform"
                                style={{ background: "linear-gradient(135deg, #4CA1AF, #315169)" }}
                              >
                                {user.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-black text-slate-900 text-lg leading-tight group-hover:text-[#4CA1AF] transition-colors">
                                  {user.name}
                                </p>
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
                                    user.role === "CLUB_ADMIN"
                                      ? "text-purple-700 border-purple-100"
                                      : "text-blue-700 border-blue-100"
                                  }`}
                                  style={
                                    user.role === "CLUB_ADMIN"
                                      ? { backgroundColor: "rgba(76, 161, 175, 0.1)" }
                                      : { backgroundColor: "rgba(59, 130, 246, 0.1)" }
                                  }
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
                              <p className="text-xs font-bold text-slate-400 ml-5">
                                Year {user.year} • {user.tenure}
                              </p>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-10 py-6">
                            <div className="flex items-center justify-end gap-2">
                              {!user.role.toUpperCase().includes("TEACHER") && (
                                <button
                                  onClick={() => setEditingUser(user)}
                                  className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-white hover:border-transparent hover:bg-[#4CA1AF] transition-all shadow-sm active:scale-90 cursor-pointer"
                                  title="Edit role"
                                >
                                  <Pencil size={18} />
                                </button>
                              )}
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
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile accordion cards */}
                <div className="lg:hidden p-4 sm:p-6 space-y-3 sm:space-y-4">
                  {filteredUsers.map((user) => {
                    const isExpanded = expandedMobileCard === user.userClubId;
                    return (
                      <div key={user.userClubId} className="rounded-2xl border border-slate-200 p-4 shadow-sm bg-white">
                        <button
                          type="button"
                          onClick={() => setExpandedMobileCard((prev) => (prev === user.userClubId ? null : user.userClubId))}
                          className="w-full flex items-center justify-between gap-3 text-left"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center text-white font-black shadow-sm"
                              style={{ background: "linear-gradient(135deg, #4CA1AF, #315169)" }}
                            >
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-black text-slate-900 truncate">{user.name}</p>
                              <p className="text-xs font-bold text-slate-400 mt-0.5">{user.prn}</p>
                            </div>
                          </div>
                          <ChevronRight
                            size={18}
                            className={`text-slate-400 flex-shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
                          />
                        </button>

                        {isExpanded && (
                          <>
                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center text-slate-700 font-bold">
                                <Building2 size={14} className="mr-2 text-[#4CA1AF]" />
                                <span className="truncate">{user.clubName}</span>
                              </div>
                              <div>
                                <span
                                  className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border whitespace-nowrap ${
                                    user.role === "CLUB_ADMIN" ? "text-purple-700 border-purple-100" : "text-blue-700 border-blue-100"
                                  }`}
                                  style={user.role === "CLUB_ADMIN" ? { backgroundColor: "rgba(76,161,175,0.1)" } : { backgroundColor: "rgba(59,130,246,0.1)" }}
                                >
                                  {user.role.replace(/_/g, " ")}
                                </span>
                              </div>
                              <div className="flex items-center text-slate-700 font-bold sm:col-span-2">
                                <Briefcase size={14} className="mr-2 text-slate-400" />
                                <span className="truncate">{user.department}</span>
                              </div>
                              <div className="text-xs font-bold text-slate-400 sm:col-span-2">Year {user.year} • {user.tenure}</div>
                            </div>

                            <div className="mt-4 flex items-center justify-end gap-2">
                              {!user.role.toUpperCase().includes("TEACHER") && (
                                <button
                                  onClick={() => setEditingUser(user)}
                                  className="inline-flex items-center justify-center h-10 px-3 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-white hover:border-transparent hover:bg-[#4CA1AF] transition-all shadow-sm active:scale-95"
                                >
                                  <Pencil size={16} className="mr-1.5" /> Edit
                                </button>
                              )}
                              <button
                                onClick={() => setConfirmDialog({ isOpen: true, title: "Remove from Club", message: `Are you sure you want to remove ${user.name} from ${user.clubName}?`, confirmText: "Remove", variant: "danger", onConfirm: () => { closeConfirm(); handleRemoveUser(user); } })}
                                className="inline-flex items-center justify-center h-10 px-3 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-white hover:border-transparent hover:bg-red-500 transition-all shadow-sm active:scale-95"
                              >
                                <UserMinus size={16} className="mr-1.5" /> Remove
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
            <p className="text-sm font-bold text-slate-500">
              Showing{" "}
              <span className="text-slate-800">{currentPage * PAGE_SIZE + 1}–{Math.min((currentPage + 1) * PAGE_SIZE, totalElements)}</span>
              {" "}of{" "}
              <span className="text-slate-800">{totalElements}</span> members
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchPagedData(currentPage - 1)}
                disabled={currentPage === 0}
                className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-white hover:bg-[#4CA1AF] hover:border-[#4CA1AF] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronLeft size={18} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i)
                .filter((i) => i === 0 || i === totalPages - 1 || Math.abs(i - currentPage) <= 1)
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
                      onClick={() => fetchPagedData(item)}
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
                onClick={() => fetchPagedData(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
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

export default RemoveUsersFromAnyClub;



// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import {
//   Users,
//   Search,
//   Filter,
//   ShieldCheck,
//   Building2,
//   AlertCircle,
//   CheckCircle2,
//   UserMinus,
//   Briefcase,
//   Layers,
// } from "lucide-react";

// const RemoveUsersFromAnyClub = () => {
//   const [userClubs, setUserClubs] = useState([]);
//   const [filteredUsers, setFilteredUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [successMessage, setSuccessMessage] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedClub, setSelectedClub] = useState("");
//   const [clubs, setClubs] = useState([]);
//   const [totalClubs, setTotalClubs] = useState(0);

//   //fetch all clubs
//   useEffect(() => {
//     const fetchClubs = async () => {
//       try {
//         const token = localStorage.getItem("token");

//         const response = await axios.get(`${BASE_URL}/api/clubs`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         if (response.data.success) {
//           setClubs(response.data.data);
//           setTotalClubs(response.data.data.length);
//         }
//       } catch (error) {
//         console.error("Error fetching clubs:", error);
//       }
//     };

//     fetchClubs();
//   }, []);

//   const fetchUserClubs = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get(
//         `${BASE_URL}/api/user-clubs/getAll`,
//         {
//           headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//         },
//       );
//       if (response.data.success) {
//         const nonTeacherUsers = response.data.data.filter(
//           (user) => user.role.toUpperCase() !== "TEACHER",
//         );
//         setUserClubs(nonTeacherUsers);
//         setFilteredUsers(nonTeacherUsers);
//       }
//     } catch (err) {
//       setError("Failed to fetch user data. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchUserClubs();
//   }, []);

//   useEffect(() => {
//     let filtered = userClubs;
//     if (searchTerm) {
//       const term = searchTerm.toLowerCase();
//       filtered = filtered.filter(
//         (user) =>
//           user.name.toLowerCase().includes(term) ||
//           user.prn.toLowerCase().includes(term) ||
//           user.department.toLowerCase().includes(term) ||
//           user.role.toLowerCase().includes(term),
//       );
//     }
//     if (selectedClub) {
//       filtered = filtered.filter(
//         (user) => user.clubId.toString() === selectedClub,
//       );
//     }
//     setFilteredUsers(filtered);
//   }, [searchTerm, selectedClub, userClubs]);

//   const handleRemoveUser = async (user) => {
//     const { prn, clubName, name, clubId, role, tenure } = user;
//     if (
//       !window.confirm(
//         `Are you sure you want to remove ${name} from ${clubName}?`,
//       )
//     )
//       return;

//     try {
//       const response = await axios.delete(
//         `${BASE_URL}/api/user-clubs/user/${prn}/club/${clubName}`,
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//             "Content-Type": "application/json",
//           },
//           data: { prn, clubId, role, tenure },
//         },
//       );

//       if (response.data.success) {
//         setSuccessMessage(`Successfully removed ${name} from ${clubName}`);
//         fetchUserClubs();
//         setTimeout(() => setSuccessMessage(""), 3000);
//       }
//     } catch (err) {
//       setError(
//         `Failed to remove user. ${err.response?.data?.message || err.message}`,
//       );
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center">
//         <div
//           className="w-16 h-16 border-4 rounded-full animate-spin"
//           style={{
//             borderColor: "rgba(76, 161, 175, 0.1)",
//             borderTopColor: "#4CA1AF",
//           }}
//         ></div>
//         <p className="mt-4 font-medium text-slate-500 animate-pulse tracking-wide">
//           Synchronizing database...
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden text-slate-900 font-sans antialiased pb-20">
//       {/* Animated Background Blobs */}
//       <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob"></div>
//       <div className="absolute top-0 -right-4 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-2000" style={{ backgroundColor: "#4CA1AF" }}></div>
//       <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-4000"></div>
      
//       <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 relative z-10">
//         {/* 1. Header Section */}
//         <div className="mb-8">
//           <div
//             className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4"
//             style={{
//               backgroundColor: "rgba(76, 161, 175, 0.1)",
//               color: "#37828d",
//             }}
//           >
//             <ShieldCheck size={14} />
//             <span>Membership Management</span>
//           </div>
//           {/* <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
//             Remove User <span style={{color: '#4CA1AF'}}>from Club</span>
//           </h1> */}
//           <h1 className="text-4xl font-black tracking-tight leading-tight bg-gradient-to-r from-[#4CA1AF] to-[#162F38] bg-clip-text text-transparent">
//             Remove User from Club
//           </h1>

//           <p className="text-slate-500 mt-2 text-lg font-medium">
//             Refine your organization by managing club rosters and permissions.
//           </p>
//         </div>

//         {/* 2. Search & Filter Bar */}
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
//           <div className="lg:col-span-8 relative group">
//             <Search
//               className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors"
//               size={20}
//               style={{ color: "var(--primary-color-1)" }}
//             />
//             <input
//               type="text"
//               placeholder="Search by name, PRN, or department..."
//               className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:border-transparent transition-all shadow-sm outline-none text-slate-700 font-medium cursor-text"
//               style={{ focus: { ringColor: "#4CA1AF" } }}
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//           </div>
//           <div className="lg:col-span-4 relative group">
//             <Filter
//               className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors"
//               size={20}
//               style={{ color: "var(--primary-color-1)" }}
//             />
//             <select
//               className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:border-transparent transition-all shadow-sm outline-none appearance-none text-slate-700 font-bold cursor-pointer"
//               style={{ focus: { ringColor: "#4CA1AF" } }}
//               value={selectedClub}
//               onChange={(e) => setSelectedClub(e.target.value)}
//             >
//               <option value="">All Clubs ({totalClubs})</option>
//               {clubs.map((club) => (
//                 <option key={club.clubId} value={club.clubId}>
//                   {club.clubName}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         {/* 3. Stat Cards Section (Positioned below Search) */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
//           <div className="bg-white/80 backdrop-blur-sm p-6 rounded-[2rem] border border-white/20 shadow-xl shadow-slate-200/40 flex items-center space-x-5 transition-transform hover:scale-[1.02] cursor-pointer">
//             <div
//               className="p-4 rounded-2xl"
//               style={{
//                 backgroundColor: "rgba(76, 161, 175, 0.1)",
//                 color: "#4CA1AF",
//               }}
//             >
//               <Users size={28} />
//             </div>
//             <div>
//               <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
//                 Total Users
//               </p>
//               <h3 className="text-3xl font-black text-slate-900">
//                 {filteredUsers.length}
//               </h3>
//             </div>
//           </div>

//           <div className="bg-white/80 backdrop-blur-sm p-6 rounded-[2rem] border border-white/20 shadow-xl shadow-slate-200/40 flex items-center space-x-5 transition-transform hover:scale-[1.02] cursor-pointer">
//             <div
//               className="p-4 rounded-2xl"
//               style={{
//                 backgroundColor: "rgba(76, 161, 175, 0.1)",
//                 color: "#4CA1AF",
//               }}
//             >
//               <Building2 size={28} />
//             </div>
//             <div>
//               <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
//                 Unique Clubs
//               </p>
//               <h3 className="text-3xl font-black text-slate-900">
//                 {clubs.length}
//               </h3>
//             </div>
//           </div>

//           <div className="bg-white/80 backdrop-blur-sm p-6 rounded-[2rem] border border-white/20 shadow-xl shadow-slate-200/40 flex items-center space-x-5 transition-transform hover:scale-[1.02] cursor-pointer">
//             <div
//               className="p-4 rounded-2xl"
//               style={{
//                 backgroundColor: "rgba(76, 161, 175, 0.1)",
//                 color: "#4CA1AF",
//               }}
//             >
//               <Layers size={28} />
//             </div>
//             <div>
//               <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
//                 Active Roles
//               </p>
//               <h3 className="text-3xl font-black text-slate-900">
//                 {[...new Set(filteredUsers.map((u) => u.role))].length}
//               </h3>
//             </div>
//           </div>
//         </div>

//         {/* Notifications */}
//         {error && (
//           <div className="mb-6 flex items-center p-4 bg-red-50 border-l-4 border-red-500 text-red-800 rounded-xl animate-in fade-in slide-in-from-top-2">
//             <AlertCircle className="mr-3 shrink-0" size={20} />
//             <p className="text-sm font-bold">{error}</p>
//           </div>
//         )}
//         {successMessage && (
//           <div className="mb-6 flex items-center p-4 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 rounded-xl animate-in fade-in slide-in-from-top-2">
//             <CheckCircle2 className="mr-3 shrink-0" size={20} />
//             <p className="text-sm font-bold">{successMessage}</p>
//           </div>
//         )}

//         {/* 4. Main Table Grid */}
//         <div className="bg-white/80 backdrop-blur-sm rounded-[2.5rem] border border-white/20 shadow-2xl shadow-slate-200/60 overflow-hidden">
//           <div className="overflow-x-auto">
//             {filteredUsers.length === 0 ? (
//               <div className="py-24 text-center">
//                 <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
//                   <Search size={40} className="text-slate-300" />
//                 </div>
//                 <h3 className="text-xl font-black text-slate-900">
//                   No members match your criteria
//                 </h3>
//                 <p className="text-slate-500 font-medium">
//                   Try broadening your search or adjusting filters.
//                 </p>
//               </div>
//             ) : (
//               <table className="w-full text-left border-collapse">
//                 <thead>
//                   <tr className="bg-slate-50/50 border-b border-slate-100">
//                     <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
//                       Member
//                     </th>
//                     <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
//                       Club & Status
//                     </th>
//                     <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
//                       Education
//                     </th>
//                     <th className="px-10 py-6 text-right text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
//                       Actions
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-slate-100">
//                   {filteredUsers.map((user) => (
//                     <tr
//                       key={user.userClubId}
//                       className="group hover:bg-[#4CA1AF]/5 transition-all duration-300"
//                     >
//                       <td className="px-10 py-6">
//                         <div className="flex items-center space-x-4">
//                           <div
//                             className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg group-hover:scale-110 transition-transform"
//                             style={{
//                               background:
//                                 "linear-gradient(135deg, #4CA1AF, #315169)",
//                             }}
//                           >
//                             {user.name.charAt(0)}
//                           </div>
//                           <div>
//                             <p
//                               className="font-black text-slate-900 text-lg leading-tight group-hover:transition-colors"
//                               style={{ groupHover: { color: "#4CA1AF" } }}
//                             >
//                               {user.name}
//                             </p>
//                             <p className="text-xs font-bold text-slate-400 mt-1">
//                               {user.prn}
//                             </p>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-10 py-6">
//                         <div className="flex flex-col space-y-2">
//                           <span className="inline-flex items-center text-sm font-black text-slate-800">
//                             <Building2
//                               size={16}
//                               className="mr-2"
//                               style={{ color: "#4CA1AF" }}
//                             />
//                             {user.clubName}
//                           </span>
//                           <div>
//                             <span
//                               className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm border ${
//                                 user.role === "CLUB_ADMIN"
//                                   ? "text-purple-700 border-purple-100"
//                                   : "text-blue-700 border-blue-100"
//                               }`}
//                               style={
//                                 user.role === "CLUB_ADMIN"
//                                   ? {
//                                       backgroundColor:
//                                         "rgba(76, 161, 175, 0.1)",
//                                     }
//                                   : {
//                                       backgroundColor:
//                                         "rgba(59, 130, 246, 0.1)",
//                                     }
//                               }
//                             >
//                               {user.role.replace(/_/g, " ")}
//                             </span>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-10 py-6">
//                         <div className="space-y-1">
//                           <div className="flex items-center text-sm font-bold text-slate-700">
//                             <Briefcase
//                               size={14}
//                               className="mr-2 text-slate-400"
//                             />
//                             {user.department}
//                           </div>
//                           <p className="text-xs font-bold text-slate-400 ml-5">
//                             Year {user.year} • {user.tenure}
//                           </p>
//                         </div>
//                       </td>
//                       <td className="px-10 py-6 text-right">
//                         <button
//                           onClick={() => handleRemoveUser(user)}
//                           className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-white hover:border-transparent hover:rotate-12 transition-all shadow-sm active:scale-90 cursor-pointer"
//                           style={{ hover: { backgroundColor: "#4CA1AF" } }}
//                           title="Remove from club"
//                         >
//                           <UserMinus size={22} />
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             )}
//           </div>
//         </div>

//         {/* Footer Info */}
//         <div className="mt-10 flex flex-col md:flex-row items-center justify-between text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] px-6 opacity-60">
//           <p>
//             Database synchronization active • {filteredUsers.length} Users
//             Listed
//           </p>
//           <div className="flex items-center space-x-6 mt-4 md:mt-0">
//             <span className="flex items-center">
//               <span
//                 className="w-2.5 h-2.5 rounded-full mr-2 shadow-sm"
//                 style={{ backgroundColor: "#4CA1AF" }}
//               ></span>{" "}
//               Admin
//             </span>
//             <span className="flex items-center">
//               <span className="w-2.5 h-2.5 rounded-full bg-blue-500 mr-2 shadow-sm"></span>{" "}
//               Member
//             </span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RemoveUsersFromAnyClub;
