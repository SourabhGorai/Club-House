// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
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
//   Layers
// } from 'lucide-react';

// const UserRemoveFromClub = () => {
//   const [userClubs, setUserClubs] = useState([]);
//   const [filteredUsers, setFilteredUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [successMessage, setSuccessMessage] = useState('');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedClub, setSelectedClub] = useState('');

//   // LOGIC PRESERVED
//   const clubs = [...new Set(userClubs.map(item => ({ id: item.clubId, name: item.clubName })))];
  
//   const fetchUserClubs = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get('http://localhost:8080/api/user-clubs', {
//         headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
//       });
//       if (response.data.success) {
//         const nonTeacherUsers = response.data.data.filter(user => 
//           user.role.toUpperCase() !== 'TEACHER'
//         );
//         setUserClubs(nonTeacherUsers);
//         setFilteredUsers(nonTeacherUsers);
//       }
//     } catch (err) {
//       setError('Failed to fetch user data. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { fetchUserClubs(); }, []);

//   useEffect(() => {
//     let filtered = userClubs;
//     if (searchTerm) {
//       const term = searchTerm.toLowerCase();
//       filtered = filtered.filter(user => 
//         user.name.toLowerCase().includes(term) ||
//         user.prn.toLowerCase().includes(term) ||
//         user.department.toLowerCase().includes(term) ||
//         user.role.toLowerCase().includes(term)
//       );
//     }
//     if (selectedClub) {
//       filtered = filtered.filter(user => user.clubId.toString() === selectedClub);
//     }
//     setFilteredUsers(filtered);
//   }, [searchTerm, selectedClub, userClubs]);

//   const handleRemoveUser = async (user) => {
//     const { prn, clubName, name, clubId, role, tenure } = user;
//     if (!window.confirm(`Are you sure you want to remove ${name} from ${clubName}?`)) return;

//     try {
//       const response = await axios.delete(
//         `http://localhost:8080/api/user-clubs/user/${prn}/club/${clubName}`,
//         {
//           headers: {
//             'Authorization': `Bearer ${localStorage.getItem('token')}`,
//             'Content-Type': 'application/json'
//           },
//           data: { prn, clubId, role, tenure }
//         }
//       );

//       if (response.data.success) {
//         setSuccessMessage(`Successfully removed ${name} from ${clubName}`);
//         fetchUserClubs();
//         setTimeout(() => setSuccessMessage(''), 3000);
//       }
//     } catch (err) {
//       setError(`Failed to remove user. ${err.response?.data?.message || err.message}`);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center">
//         <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
//         <p className="mt-4 font-medium text-slate-500 animate-pulse tracking-wide">Synchronizing database...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans antialiased pb-20">
//       <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
//         {/* 1. Header Section */}
//         <div className="mb-8">
//           <div className="inline-flex items-center space-x-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
//             <ShieldCheck size={14} />
//             <span>Membership Management</span>
//           </div>
//           <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
//             Remove User <span className="text-indigo-600">from Club</span>
//           </h1>
//           <p className="text-slate-500 mt-2 text-lg font-medium">Refine your organization by managing club rosters and permissions.</p>
//         </div>

//         {/* 2. Search & Filter Bar */}
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
//           <div className="lg:col-span-8 relative group">
//             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
//             <input
//               type="text"
//               placeholder="Search by name, PRN, or department..."
//               className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm outline-none text-slate-700 font-medium"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//           </div>
//           <div className="lg:col-span-4 relative group">
//             <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
//             <select
//               className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm outline-none appearance-none text-slate-700 font-bold cursor-pointer"
//               value={selectedClub}
//               onChange={(e) => setSelectedClub(e.target.value)}
//             >
//               <option value="">All Clubs</option>
//               {clubs.map((club) => (
//                 <option key={club.id} value={club.id}>{club.name}</option>
//               ))}
//             </select>
//           </div>
//         </div>

//         {/* 3. Stat Cards Section (Positioned below Search) */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
//           <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex items-center space-x-5 transition-transform hover:scale-[1.02]">
//             <div className="p-4 rounded-2xl bg-blue-50 text-blue-600">
//               <Users size={28} />
//             </div>
//             <div>
//               <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Users</p>
//               <h3 className="text-3xl font-black text-slate-900">{filteredUsers.length}</h3>
//             </div>
//           </div>

//           <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex items-center space-x-5 transition-transform hover:scale-[1.02]">
//             <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-600">
//               <Building2 size={28} />
//             </div>
//             <div>
//               <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Unique Clubs</p>
//               <h3 className="text-3xl font-black text-slate-900">{clubs.length}</h3>
//             </div>
//           </div>

//           <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex items-center space-x-5 transition-transform hover:scale-[1.02]">
//             <div className="p-4 rounded-2xl bg-purple-50 text-purple-600">
//               <Layers size={28} />
//             </div>
//             <div>
//               <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Roles</p>
//               <h3 className="text-3xl font-black text-slate-900">
//                 {[...new Set(filteredUsers.map(u => u.role))].length}
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
//         <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/60 overflow-hidden">
//           <div className="overflow-x-auto">
//             {filteredUsers.length === 0 ? (
//               <div className="py-24 text-center">
//                 <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
//                   <Search size={40} className="text-slate-300" />
//                 </div>
//                 <h3 className="text-xl font-black text-slate-900">No members match your criteria</h3>
//                 <p className="text-slate-500 font-medium">Try broadening your search or adjusting filters.</p>
//               </div>
//             ) : (
//               <table className="w-full text-left border-collapse">
//                 <thead>
//                   <tr className="bg-slate-50/50 border-b border-slate-100">
//                     <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Member</th>
//                     <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Club & Status</th>
//                     <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Education</th>
//                     <th className="px-10 py-6 text-right text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-slate-100">
//                   {filteredUsers.map((user) => (
//                     <tr key={user.userClubId} className="group hover:bg-indigo-50/30 transition-all duration-300">
//                       <td className="px-10 py-6">
//                         <div className="flex items-center space-x-4">
//                           <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
//                             {user.name.charAt(0)}
//                           </div>
//                           <div>
//                             <p className="font-black text-slate-900 text-lg leading-tight group-hover:text-indigo-600 transition-colors">{user.name}</p>
//                             <p className="text-xs font-bold text-slate-400 mt-1">{user.prn}</p>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-10 py-6">
//                         <div className="flex flex-col space-y-2">
//                           <span className="inline-flex items-center text-sm font-black text-slate-800">
//                             <Building2 size={16} className="mr-2 text-indigo-400" />
//                             {user.clubName}
//                           </span>
//                           <div>
//                             <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm border ${
//                               user.role === 'CLUB_ADMIN' 
//                                 ? 'bg-purple-50 text-purple-700 border-purple-100'
//                                 : 'bg-blue-50 text-blue-700 border-blue-100'
//                             }`}>
//                               {user.role}
//                             </span>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-10 py-6">
//                         <div className="space-y-1">
//                           <div className="flex items-center text-sm font-bold text-slate-700">
//                             <Briefcase size={14} className="mr-2 text-slate-400" />
//                             {user.department}
//                           </div>
//                           <p className="text-xs font-bold text-slate-400 ml-5">Year {user.year} • {user.tenure}</p>
//                         </div>
//                       </td>
//                       <td className="px-10 py-6 text-right">
//                         <button
//                           onClick={() => handleRemoveUser(user)}
//                           className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200 hover:rotate-12 transition-all shadow-sm active:scale-90"
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
//           <p>Database synchronization active • {filteredUsers.length} Users Listed</p>
//           <div className="flex items-center space-x-6 mt-4 md:mt-0">
//             <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-purple-500 mr-2 shadow-sm"></span> Admin</span>
//             <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 mr-2 shadow-sm"></span> Member</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserRemoveFromClub;















import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  Layers
} from 'lucide-react';

const UserRemoveFromClub = () => {
  const [userClubs, setUserClubs] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClub, setSelectedClub] = useState('');
  // Add these state variables
const [teacherPrn, setTeacherPrn] = useState('');
const [teacherClubs, setTeacherClubs] = useState([]);
const [teacherStudents, setTeacherStudents] = useState([]);
const [loadingClubs, setLoadingClubs] = useState(false);

  // LOGIC PRESERVED
const clubs = teacherStudents.length > 0 
  ? [...new Set(teacherStudents.map(item => ({ id: item.clubId, name: item.clubName })))]
  : [...new Set(userClubs.map(item => ({ id: item.clubId, name: item.clubName })))];
  
  useEffect(() => {
  // Get teacher PRN from localStorage user object
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
      `http://localhost:8080/api/user-clubs/user/${prn}`,
      {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      }
    );
    
    if (response.data.success) {
      // Filter only clubs where user has TEACHER/TEACHERS role
      const teacherRoleClubs = response.data.data.filter(club => 
        ['TEACHER', 'TEACHERS'].includes(club.role.toUpperCase())
      );
      setTeacherClubs(teacherRoleClubs);
      
      // Fetch students from each club
      fetchStudentsFromClubs(teacherRoleClubs);
    }
  } catch (err) {
    console.error('Error fetching teacher clubs:', err);
    setTeacherClubs([]);
  } finally {
    setLoadingClubs(false);
  }
};

const fetchStudentsFromClubs = async (clubs) => {
  if (!clubs.length) return;
  
  try {
    const allStudents = [];
    
    // Fetch students from each club
    for (const club of clubs) {
      const response = await axios.get(
        `http://localhost:8080/api/user-clubs/club/${club.clubName}`, 
        {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }
      );
      
      if (response.data.success) {
        // Filter to keep only MEMBER and CLUB_ADMIN roles
        const students = response.data.data.filter(user => 
          ['MEMBER', 'CLUB_ADMIN'].includes(user.role.toUpperCase())
        );
        allStudents.push(...students);
      }
    }
    
    setTeacherStudents(allStudents);
  } catch (err) {
    console.error('Error fetching club students:', err);
    setTeacherStudents([]);
  }
};


const fetchUserClubs = async () => {
  try {
    setLoading(true);
    const user = JSON.parse(localStorage.getItem("user"));
    
    // If user is a teacher, use teacher-specific logic
    if (user?.role === 'TEACHERS' || user?.role === 'TEACHER') {
      // Teacher logic - get their clubs and students
      await fetchTeacherClubs(user.prn);
      setLoading(false);
      return;
    }
    
    // Original logic for non-teachers
    const response = await axios.get('http://localhost:8080/api/user-clubs', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    
    if (response.data.success) {
      const nonTeacherUsers = response.data.data.filter(user => 
        user.role.toUpperCase() !== 'TEACHER'
      );
      setUserClubs(nonTeacherUsers);
      setFilteredUsers(nonTeacherUsers);
    }
  } catch (err) {
    setError('Failed to fetch user data. Please try again.');
  } finally {
    setLoading(false);
  }
};
  useEffect(() => { fetchUserClubs(); }, []);

 useEffect(() => {
  let filtered = [];
  
  // If teacher has students, use those
  if (teacherStudents.length > 0) {
    filtered = teacherStudents;
  } else {
    // Otherwise use original userClubs
    filtered = userClubs;
  }
  
  // Apply search filter
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(user => 
      user.name.toLowerCase().includes(term) ||
      user.prn.toLowerCase().includes(term) ||
      (user.department && user.department.toLowerCase().includes(term)) ||
      user.role.toLowerCase().includes(term)
    );
  }
  
  // Apply club filter
  if (selectedClub) {
    filtered = filtered.filter(user => 
      user.clubId && user.clubId.toString() === selectedClub
    );
  }
  
  setFilteredUsers(filtered);
}, [searchTerm, selectedClub, userClubs, teacherStudents]);

  const handleRemoveUser = async (user) => {
    const { prn, clubName, name, clubId, role, tenure } = user;
    if (!window.confirm(`Are you sure you want to remove ${name} from ${clubName}?`)) return;

    try {
      const response = await axios.delete(
        `http://localhost:8080/api/user-clubs/user/${prn}/club/${clubName}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          data: { prn, clubId, role, tenure }
        }
      );

      if (response.data.success) {
        setSuccessMessage(`Successfully removed ${name} from ${clubName}`);
        fetchUserClubs();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      setError(`Failed to remove user. ${err.response?.data?.message || err.message}`);
    }
  };

if (loading || loadingClubs) {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center">
      <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
      <p className="mt-4 font-medium text-slate-500 animate-pulse tracking-wide">
        {teacherPrn ? "Loading teacher's students..." : "Synchronizing database..."}
      </p>
    </div>
  );
}

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans antialiased pb-20">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* 1. Header Section */}
        <div className="mb-8">
          <div className="inline-flex items-center space-x-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
            <ShieldCheck size={14} />
            <span>Membership Management</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Remove User <span className="text-indigo-600">from Club</span>
          </h1>
          <p className="text-slate-500 mt-2 text-lg font-medium">Refine your organization by managing club rosters and permissions.</p>
        </div>

        {/* 2. Search & Filter Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
          <div className="lg:col-span-8 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search by name, PRN, or department..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm outline-none text-slate-700 font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="lg:col-span-4 relative group">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
            <select
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm outline-none appearance-none text-slate-700 font-bold cursor-pointer"
              value={selectedClub}
              onChange={(e) => setSelectedClub(e.target.value)}
            >
              <option value="">All Clubs</option>
              {clubs.map((club) => (
                <option key={club.id} value={club.id}>{club.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 3. Stat Cards Section (Positioned below Search) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex items-center space-x-5 transition-transform hover:scale-[1.02]">
            <div className="p-4 rounded-2xl bg-blue-50 text-blue-600">
              <Users size={28} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Users</p>
              <h3 className="text-3xl font-black text-slate-900">{filteredUsers.length}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex items-center space-x-5 transition-transform hover:scale-[1.02]">
            <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-600">
              <Building2 size={28} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Unique Clubs</p>
              <h3 className="text-3xl font-black text-slate-900">{clubs.length}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex items-center space-x-5 transition-transform hover:scale-[1.02]">
            <div className="p-4 rounded-2xl bg-purple-50 text-purple-600">
              <Layers size={28} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Roles</p>
              <h3 className="text-3xl font-black text-slate-900">
                {[...new Set(filteredUsers.map(u => u.role))].length}
              </h3>
            </div>
          </div>
        </div>

        {/* Teacher's Clubs Info Section */}
{teacherClubs.length > 0 && (
  <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-[2rem] shadow-xl shadow-blue-100/50">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h3 className="text-xl font-black text-blue-900">
            Teacher Dashboard Mode
          </h3>
          <p className="text-sm text-blue-700 font-medium">
            Showing students from your assigned clubs
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold text-blue-800">PRN: {teacherPrn}</p>
        <p className="text-xs text-blue-600">{teacherClubs.length} clubs assigned</p>
      </div>
    </div>
    
    {/* Teacher's Clubs List */}
    <div className="mt-4">
      <p className="text-sm font-bold text-blue-800 mb-2">Your Clubs:</p>
      <div className="flex flex-wrap gap-2">
        {teacherClubs.map(club => (
          <span 
            key={club.clubId} 
            className="px-4 py-2 bg-white text-blue-700 text-sm font-bold rounded-full border border-blue-200 shadow-sm hover:shadow-md transition-shadow"
          >
            {club.clubName} • {club.role}
          </span>
        ))}
      </div>
    </div>
  </div>
)}

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
                  {filteredUsers.map((user) => (
                    <tr key={user.userClubId} className="group hover:bg-indigo-50/30 transition-all duration-300">
                      <td className="px-10 py-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 text-lg leading-tight group-hover:text-indigo-600 transition-colors">{user.name}</p>
                            <p className="text-xs font-bold text-slate-400 mt-1">{user.prn}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex flex-col space-y-2">
                          <span className="inline-flex items-center text-sm font-black text-slate-800">
                            <Building2 size={16} className="mr-2 text-indigo-400" />
                            {user.clubName}
                          </span>
                          <div>
                            <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm border ${
                              user.role === 'CLUB_ADMIN' 
                                ? 'bg-purple-50 text-purple-700 border-purple-100'
                                : 'bg-blue-50 text-blue-700 border-blue-100'
                            }`}>
                              {user.role}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm font-bold text-slate-700">
                            <Briefcase size={14} className="mr-2 text-slate-400" />
                            {user.department}
                          </div>
                          <p className="text-xs font-bold text-slate-400 ml-5">Year {user.year} • {user.tenure}</p>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <button
                          onClick={() => handleRemoveUser(user)}
                          className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200 hover:rotate-12 transition-all shadow-sm active:scale-90"
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
          <p>Database synchronization active • {filteredUsers.length} Users Listed</p>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-purple-500 mr-2 shadow-sm"></span> Admin</span>
            <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 mr-2 shadow-sm"></span> Member</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserRemoveFromClub;