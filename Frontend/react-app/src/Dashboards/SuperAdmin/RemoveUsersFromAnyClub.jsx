import React, { useState, useEffect } from "react";
import axios from "axios";
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
} from "lucide-react";

const RemoveUsersFromAnyClub = () => {
  const [userClubs, setUserClubs] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClub, setSelectedClub] = useState("");
  const [clubs, setClubs] = useState([]);
  const [totalClubs, setTotalClubs] = useState(0);

  //fetch all clubs
  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get("http://localhost:8080/api/clubs", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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

  const fetchUserClubs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:8080/api/user-clubs/getAll",
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      if (response.data.success) {
        const nonTeacherUsers = response.data.data.filter(
          (user) => user.role.toUpperCase() !== "TEACHER",
        );
        setUserClubs(nonTeacherUsers);
        setFilteredUsers(nonTeacherUsers);
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
    let filtered = userClubs;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(term) ||
          user.prn.toLowerCase().includes(term) ||
          user.department.toLowerCase().includes(term) ||
          user.role.toLowerCase().includes(term),
      );
    }
    if (selectedClub) {
      filtered = filtered.filter(
        (user) => user.clubId.toString() === selectedClub,
      );
    }
    setFilteredUsers(filtered);
  }, [searchTerm, selectedClub, userClubs]);

  const handleRemoveUser = async (user) => {
    const { prn, clubName, name, clubId, role, tenure } = user;
    if (
      !window.confirm(
        `Are you sure you want to remove ${name} from ${clubName}?`,
      )
    )
      return;

    try {
      const response = await axios.delete(
        `http://localhost:8080/api/user-clubs/user/${prn}/club/${clubName}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          data: { prn, clubId, role, tenure },
        },
      );

      if (response.data.success) {
        setSuccessMessage(`Successfully removed ${name} from ${clubName}`);
        fetchUserClubs();
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err) {
      setError(
        `Failed to remove user. ${err.response?.data?.message || err.message}`,
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center">
        <div
          className="w-16 h-16 border-4 rounded-full animate-spin"
          style={{
            borderColor: "rgba(76, 161, 175, 0.1)",
            borderTopColor: "#4CA1AF",
          }}
        ></div>
        <p className="mt-4 font-medium text-slate-500 animate-pulse tracking-wide">
          Synchronizing database...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden text-slate-900 font-sans antialiased pb-20">
      {/* Animated Background Blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-2000" style={{ backgroundColor: "#4CA1AF" }}></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-4000"></div>
      
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 relative z-10">
        {/* 1. Header Section */}
        <div className="mb-8">
          <div
            className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4"
            style={{
              backgroundColor: "rgba(76, 161, 175, 0.1)",
              color: "#37828d",
            }}
          >
            <ShieldCheck size={14} />
            <span>Membership Management</span>
          </div>
          {/* <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Remove User <span style={{color: '#4CA1AF'}}>from Club</span>
          </h1> */}
          <h1 className="text-4xl font-black tracking-tight leading-tight bg-gradient-to-r from-[#4CA1AF] to-[#162F38] bg-clip-text text-transparent">
            Remove User from Club
          </h1>

          <p className="text-slate-500 mt-2 text-lg font-medium">
            Refine your organization by managing club rosters and permissions.
          </p>
        </div>

        {/* 2. Search & Filter Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
          <div className="lg:col-span-8 relative group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors"
              size={20}
              style={{ color: "var(--primary-color-1)" }}
            />
            <input
              type="text"
              placeholder="Search by name, PRN, or department..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:border-transparent transition-all shadow-sm outline-none text-slate-700 font-medium cursor-text"
              style={{ focus: { ringColor: "#4CA1AF" } }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="lg:col-span-4 relative group">
            <Filter
              className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors"
              size={20}
              style={{ color: "var(--primary-color-1)" }}
            />
            <select
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:border-transparent transition-all shadow-sm outline-none appearance-none text-slate-700 font-bold cursor-pointer"
              style={{ focus: { ringColor: "#4CA1AF" } }}
              value={selectedClub}
              onChange={(e) => setSelectedClub(e.target.value)}
            >
              <option value="">All Clubs ({totalClubs})</option>
              {clubs.map((club) => (
                <option key={club.clubId} value={club.clubId}>
                  {club.clubName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 3. Stat Cards Section (Positioned below Search) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-[2rem] border border-white/20 shadow-xl shadow-slate-200/40 flex items-center space-x-5 transition-transform hover:scale-[1.02] cursor-pointer">
            <div
              className="p-4 rounded-2xl"
              style={{
                backgroundColor: "rgba(76, 161, 175, 0.1)",
                color: "#4CA1AF",
              }}
            >
              <Users size={28} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Total Users
              </p>
              <h3 className="text-3xl font-black text-slate-900">
                {filteredUsers.length}
              </h3>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-[2rem] border border-white/20 shadow-xl shadow-slate-200/40 flex items-center space-x-5 transition-transform hover:scale-[1.02] cursor-pointer">
            <div
              className="p-4 rounded-2xl"
              style={{
                backgroundColor: "rgba(76, 161, 175, 0.1)",
                color: "#4CA1AF",
              }}
            >
              <Building2 size={28} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Unique Clubs
              </p>
              <h3 className="text-3xl font-black text-slate-900">
                {clubs.length}
              </h3>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-[2rem] border border-white/20 shadow-xl shadow-slate-200/40 flex items-center space-x-5 transition-transform hover:scale-[1.02] cursor-pointer">
            <div
              className="p-4 rounded-2xl"
              style={{
                backgroundColor: "rgba(76, 161, 175, 0.1)",
                color: "#4CA1AF",
              }}
            >
              <Layers size={28} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Active Roles
              </p>
              <h3 className="text-3xl font-black text-slate-900">
                {[...new Set(filteredUsers.map((u) => u.role))].length}
              </h3>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mb-6 flex items-center p-4 bg-red-50 border-l-4 border-red-500 text-red-800 rounded-xl animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="mr-3 shrink-0" size={20} />
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}
        {successMessage && (
          <div className="mb-6 flex items-center p-4 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 rounded-xl animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="mr-3 shrink-0" size={20} />
            <p className="text-sm font-bold">{successMessage}</p>
          </div>
        )}

        {/* 4. Main Table Grid */}
        <div className="bg-white/80 backdrop-blur-sm rounded-[2.5rem] border border-white/20 shadow-2xl shadow-slate-200/60 overflow-hidden">
          <div className="overflow-x-auto">
            {filteredUsers.length === 0 ? (
              <div className="py-24 text-center">
                <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search size={40} className="text-slate-300" />
                </div>
                <h3 className="text-xl font-black text-slate-900">
                  No members match your criteria
                </h3>
                <p className="text-slate-500 font-medium">
                  Try broadening your search or adjusting filters.
                </p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      Member
                    </th>
                    <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      Club & Status
                    </th>
                    <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      Education
                    </th>
                    <th className="px-10 py-6 text-right text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.userClubId}
                      className="group hover:bg-[#4CA1AF]/5 transition-all duration-300"
                    >
                      <td className="px-10 py-6">
                        <div className="flex items-center space-x-4">
                          <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg group-hover:scale-110 transition-transform"
                            style={{
                              background:
                                "linear-gradient(135deg, #4CA1AF, #315169)",
                            }}
                          >
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <p
                              className="font-black text-slate-900 text-lg leading-tight group-hover:transition-colors"
                              style={{ groupHover: { color: "#4CA1AF" } }}
                            >
                              {user.name}
                            </p>
                            <p className="text-xs font-bold text-slate-400 mt-1">
                              {user.prn}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex flex-col space-y-2">
                          <span className="inline-flex items-center text-sm font-black text-slate-800">
                            <Building2
                              size={16}
                              className="mr-2"
                              style={{ color: "#4CA1AF" }}
                            />
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
                                  ? {
                                      backgroundColor:
                                        "rgba(76, 161, 175, 0.1)",
                                    }
                                  : {
                                      backgroundColor:
                                        "rgba(59, 130, 246, 0.1)",
                                    }
                              }
                            >
                              {user.role.replace(/_/g, " ")}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm font-bold text-slate-700">
                            <Briefcase
                              size={14}
                              className="mr-2 text-slate-400"
                            />
                            {user.department}
                          </div>
                          <p className="text-xs font-bold text-slate-400 ml-5">
                            Year {user.year} • {user.tenure}
                          </p>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <button
                          onClick={() => handleRemoveUser(user)}
                          className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-white hover:border-transparent hover:rotate-12 transition-all shadow-sm active:scale-90 cursor-pointer"
                          style={{ hover: { backgroundColor: "#4CA1AF" } }}
                          title="Remove from club"
                        >
                          <UserMinus size={22} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-10 flex flex-col md:flex-row items-center justify-between text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] px-6 opacity-60">
          <p>
            Database synchronization active • {filteredUsers.length} Users
            Listed
          </p>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <span className="flex items-center">
              <span
                className="w-2.5 h-2.5 rounded-full mr-2 shadow-sm"
                style={{ backgroundColor: "#4CA1AF" }}
              ></span>{" "}
              Admin
            </span>
            <span className="flex items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 mr-2 shadow-sm"></span>{" "}
              Member
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemoveUsersFromAnyClub;
