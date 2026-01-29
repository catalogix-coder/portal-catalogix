
import React, { useState, useEffect } from 'react';
import { Plus, Save, Layout, Image as ImageIcon, DollarSign, BarChart, Search, Edit3, Trash, ChevronLeft, Box, Loader2, RefreshCw, Youtube, Database, Users, UserPlus, Mail, Shield, CheckSquare, Square, X, AlertTriangle, CheckCircle, Video, GripVertical, ChevronDown, ChevronUp, Lock, UserCog } from 'lucide-react';
import { useCourses } from '../context/CourseContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Course, User, Module, Lesson } from '../types';
import { fetchUsersFromFirebase, addUserToFirebase, deleteUserFromFirebase } from '../services/firebaseService';

const Admin: React.FC = () => {
  const { courses, addCourse, updateCourse, deleteCourse, refreshCourses } = useCourses();
  const { user } = useAuth(); 
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!user || user.role !== 'instructor') {
        navigate('/');
    }
  }, [user, navigate]);

  const [activeTab, setActiveTab] = useState<'courses' | 'users'>('courses');
  const [view, setView] = useState<'list' | 'create'>('list');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // --- FORM STATE COURSES ---
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null); 
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800');
  const [category, setCategory] = useState('Marketing');
  const [price, setPrice] = useState('149000');
  const [level, setLevel] = useState<'Pemula' | 'Menengah' | 'Lanjut'>('Pemula');

  // --- DYNAMIC MODULES STATE ---
  const [modules, setModules] = useState<Module[]>([
      {
          id: `mod-${Date.now()}`,
          title: 'BAB 1: Pendahuluan',
          lessons: [
              {
                  id: `les-${Date.now()}`,
                  title: 'Pengenalan Materi',
                  duration: '05:00',
                  videoUrl: '',
                  description: 'Deskripsi singkat video ini...',
                  isCompleted: false
              }
          ]
      }
  ]);

  // --- USER STATE ---
  const [usersList, setUsersList] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'user' | 'course', id: string, name: string, docId?: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  
  // User Form State (Add & Edit)
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [selectedAccessIds, setSelectedAccessIds] = useState<string[]>([]);
  const [grantFullAccess, setGrantFullAccess] = useState(false);
  
  // New: Edit User State
  const [editingUserEmail, setEditingUserEmail] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'users') {
        loadUsers();
    }
  }, [activeTab]);

  useEffect(() => {
    if (notification) {
        const timer = setTimeout(() => setNotification(null), 3000);
        return () => clearTimeout(timer);
    }
  }, [notification]);

  const loadUsers = async () => {
      setIsLoadingUsers(true);
      try {
          const data = await fetchUsersFromFirebase();
          setUsersList(data);
      } catch (e) {
          console.error("Gagal load users:", e);
      }
      setIsLoadingUsers(false);
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
      setNotification({ type, message });
  };

  // --- COURSE LOGIC (Omitted for brevity, standard CRUD) ---
  const resetForm = () => {
      setEditingCourseId(null);
      setTitle('');
      setDescription('');
      setPrice('149000');
      setThumbnail('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800');
      setModules([{id: `mod-${Date.now()}`, title: 'BAB 1: Pendahuluan', lessons: []}]);
  };

  const handleEditCourse = (course: Course) => {
      setEditingCourseId(course.id);
      setTitle(course.title);
      setDescription(course.description);
      setThumbnail(course.thumbnail);
      setPrice(course.discountPrice ? course.discountPrice.toString() : '0');
      setCategory(course.tags[0] || 'Marketing');
      setLevel(course.level);
      setModules(JSON.parse(JSON.stringify(course.modules)));
      setView('create');
  };

  const handleCancelEdit = () => {
      resetForm();
      setView('list');
  };

  // ... (Module/Lesson handlers kept same) ...
  const addModule = () => {
      setModules([...modules, { id: `mod-${Date.now()}`, title: `BAB ${modules.length + 1}: Judul Bab Baru`, lessons: [] }]);
  };
  const updateModuleTitle = (index: number, val: string) => {
      const newModules = [...modules]; newModules[index].title = val; setModules(newModules);
  };
  const removeModule = (index: number) => {
      if (modules.length === 1) return alert("Minimal harus ada 1 Bab.");
      const newModules = [...modules]; newModules.splice(index, 1); setModules(newModules);
  };
  const addLesson = (moduleIndex: number) => {
      const newModules = [...modules];
      newModules[moduleIndex].lessons.push({ id: `les-${Date.now()}-${Math.random()}`, title: 'Judul Materi', duration: '10:00', videoUrl: '', description: '', isCompleted: false });
      setModules(newModules);
  };
  const updateLesson = (modIndex: number, lesIndex: number, field: keyof Lesson, val: string) => {
      const newModules = [...modules]; (newModules[modIndex].lessons[lesIndex] as any)[field] = val; setModules(newModules);
  };
  const removeLesson = (modIndex: number, lesIndex: number) => {
      const newModules = [...modules]; newModules[modIndex].lessons.splice(lesIndex, 1); setModules(newModules);
  };

  const handleSubmitCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const totalVideos = modules.reduce((acc, m) => acc + m.lessons.length, 0);
    if (totalVideos === 0) { showNotification('error', "Mohon tambahkan minimal 1 video materi."); setIsSubmitting(false); return; }
    const courseId = editingCourseId || `c-${Date.now()}`;
    const courseData: Course = { id: courseId, title, description, instructor: user?.name || 'Instructor', instructorAvatar: user?.avatar, thumbnail, totalDuration: `${totalVideos * 10} Menit (Estimasi)`, rating: 5.0, studentCount: 0, level, price: parseInt(price) * 2, discountPrice: parseInt(price), tags: [category], modules };
    let success = false;
    if (editingCourseId) { success = await updateCourse(courseData); } else { success = await addCourse(courseData); }
    setIsSubmitting(false);
    if (success) { showNotification('success', editingCourseId ? "Kursus berhasil diperbarui!" : "Kursus berhasil disimpan!"); setView('list'); resetForm(); } else { showNotification('error', "Gagal menyimpan data."); }
  };

  const initiateDelete = (type: 'user' | 'course', id: string, name: string, docId?: string) => {
    setDeleteTarget({ type, id, name, docId });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
        if (deleteTarget.type === 'user') {
            const result = await deleteUserFromFirebase(deleteTarget.id, deleteTarget.docId);
            if (result.success) {
                setUsersList(prev => prev.filter(u => u.email !== deleteTarget.id));
                showNotification('success', "Data siswa berhasil dihapus.");
                // Jika user yang dihapus sedang diedit, reset form
                if (editingUserEmail === deleteTarget.id) {
                    resetUserForm();
                }
            } else { showNotification('error', `Gagal: ${result.message}`); }
        } else {
            const success = await deleteCourse(deleteTarget.id);
            if (success) { showNotification('success', "Kursus berhasil dihapus permanen."); } else { showNotification('error', "Gagal menghapus kursus."); }
        }
    } catch (error) { showNotification('error', "Terjadi kesalahan sistem."); } finally { setIsDeleting(false); setDeleteTarget(null); }
  };


  // --- USER HANDLERS (NEW EDIT LOGIC) ---
  
  const resetUserForm = () => {
      setNewUserEmail('');
      setNewUserName('');
      setSelectedAccessIds([]);
      setGrantFullAccess(false);
      setEditingUserEmail(null);
  };

  const handleEditUser = (u: User) => {
      setEditingUserEmail(u.email);
      setNewUserEmail(u.email); // Read only when editing
      setNewUserName(u.name);
      
      if (u.accessList.includes('*')) {
          setGrantFullAccess(true);
          setSelectedAccessIds([]);
      } else {
          setGrantFullAccess(false);
          setSelectedAccessIds(u.accessList);
      }
      
      // Scroll to form (for mobile/tablet UX)
      document.getElementById('user-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSaveUser = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!newUserEmail.trim() || !newUserName.trim()) return;

      const finalAccessList = grantFullAccess ? ['*'] : selectedAccessIds;
      if (finalAccessList.length === 0) {
          showNotification('error', "Pilih minimal satu kelas atau 'Akses Semua'.");
          return;
      }

      setIsAddingUser(true);
      const userPayload: User = {
          email: newUserEmail.toLowerCase().trim(),
          name: newUserName,
          avatar: `https://i.pravatar.cc/150?u=${newUserEmail}`,
          role: 'student',
          accessList: finalAccessList 
      };

      // addUserToFirebase acts as upsert (Insert or Update)
      const success = await addUserToFirebase(userPayload);
      
      if (success) {
          showNotification('success', editingUserEmail ? `Data akses siswa diperbarui.` : `Siswa berhasil didaftarkan.`);
          resetUserForm();
          await loadUsers();
      } else {
          showNotification('error', "Gagal menyimpan data siswa.");
      }
      setIsAddingUser(false);
  };

  const toggleCourseAccess = (courseId: string) => {
      if (selectedAccessIds.includes(courseId)) {
          setSelectedAccessIds(prev => prev.filter(id => id !== courseId));
      } else {
          setSelectedAccessIds(prev => [...prev, courseId]);
      }
  };

  const handleRefresh = async () => {
      setIsRefreshing(true);
      await refreshCourses();
      setIsRefreshing(false);
  };

  if (!user || user.role !== 'instructor') return null;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 relative">
        
        {/* NOTIFICATION TOAST */}
        {notification && (
            <div className={`fixed top-4 right-4 z-[200] px-6 py-4 rounded-xl shadow-2xl border flex items-center gap-3 animate-in slide-in-from-top-5 duration-300 ${
                notification.type === 'success' ? 'bg-white border-green-200 text-green-800' : 'bg-white border-red-200 text-red-800'
            }`}>
                {notification.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-500" /> : <AlertTriangle className="w-5 h-5 text-red-500" />}
                <p className="font-bold text-sm">{notification.message}</p>
            </div>
        )}

        {/* DELETE CONFIRMATION MODAL */}
        {deleteTarget && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !isDeleting && setDeleteTarget(null)}></div>
                <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full relative z-10 overflow-hidden">
                    <div className="p-6 text-center">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash className="w-6 h-6 text-red-600" />
                        </div>
                        <h3 className="text-lg font-bold text-zinc-900 mb-2">Hapus Data?</h3>
                        <p className="text-sm text-zinc-500 mb-6">
                            Anda akan menghapus {deleteTarget.type === 'user' ? 'akses siswa' : 'kursus'} <strong>{deleteTarget.name}</strong>. Tindakan ini tidak bisa dibatalkan.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteTarget(null)} disabled={isDeleting} className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded-lg transition-colors">Batal</button>
                            <button onClick={confirmDelete} disabled={isDeleting} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
                                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Hapus'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Header Admin */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
                <h1 className="text-3xl font-bold text-zinc-900">Studio Admin</h1>
                <p className="text-zinc-500 mt-1">Halo, {user.name}. Kelola konten dan siswa CatalogiX.</p>
            </div>
            <div className="flex bg-white p-1 rounded-xl border border-zinc-200 shadow-sm">
                <button onClick={() => setActiveTab('courses')} className={`px-4 py-2 text-sm font-bold rounded-lg flex items-center gap-2 transition-all ${activeTab === 'courses' ? 'bg-zinc-900 text-white shadow-md' : 'text-zinc-500 hover:bg-zinc-50'}`}>
                    <Box className="w-4 h-4" /> Kelola Kursus
                </button>
                <button onClick={() => setActiveTab('users')} className={`px-4 py-2 text-sm font-bold rounded-lg flex items-center gap-2 transition-all ${activeTab === 'users' ? 'bg-primary-500 text-white shadow-md' : 'text-zinc-500 hover:bg-zinc-50'}`}>
                    <Users className="w-4 h-4" /> Kelola Siswa
                </button>
            </div>
        </div>

        {/* ======================= TAB: COURSES ======================= */}
        {activeTab === 'courses' && (
            <>
                {view === 'list' ? (
                    <>
                        <div className="flex justify-end gap-3 mb-6">
                            <button onClick={handleRefresh} className="bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-all" disabled={isRefreshing}>
                                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} /> 
                                {isRefreshing ? 'Loading...' : 'Refresh Data'}
                            </button>
                            <button onClick={() => { resetForm(); setView('create'); }} className="bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-md transition-all">
                                <Plus className="w-5 h-5" /> Buat Kursus Baru
                            </button>
                        </div>

                        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
                                <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                                    <Database className="w-4 h-4 text-zinc-500" /> Daftar Kursus
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-zinc-50 border-b border-zinc-200">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold text-zinc-600">Kursus</th>
                                            <th className="px-6 py-4 font-semibold text-zinc-600">Siswa</th>
                                            <th className="px-6 py-4 font-semibold text-zinc-600 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100">
                                        {courses.length > 0 ? courses.map((course) => (
                                            <tr key={course.id} className="hover:bg-zinc-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <img src={course.thumbnail} alt="" className="w-12 h-8 object-cover rounded shadow-sm" />
                                                        <div>
                                                            <p className="font-medium text-zinc-900 line-clamp-1">{course.title}</p>
                                                            <p className="text-[10px] text-zinc-500">{course.modules.length} Bab • {course.modules.reduce((a,b)=>a+b.lessons.length,0)} Video</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-zinc-600">{course.studentCount.toLocaleString()}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button onClick={() => handleEditCourse(course)} className="text-zinc-400 hover:text-primary-500 p-1 transition-colors mr-2" title="Edit Kursus">
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => initiateDelete('course', course.id, course.title)} className="text-zinc-400 hover:text-red-500 p-1 transition-colors" title="Hapus Kursus">
                                                        <Trash className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={3} className="px-6 py-12 text-center text-zinc-500">Belum ada data.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                ) : (
                    // VIEW CREATE/EDIT COURSE
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-6 flex items-center justify-between">
                            <button onClick={handleCancelEdit} className="text-sm text-zinc-500 hover:text-primary-500 flex items-center gap-1 transition-colors">
                                <ChevronLeft className="w-4 h-4" /> Kembali ke Daftar
                            </button>
                            <h1 className="text-2xl font-bold text-zinc-900">
                                {editingCourseId ? 'Edit Materi Kursus' : 'Tambah Materi Baru'}
                            </h1>
                        </div>

                        <form onSubmit={handleSubmitCourse} className="space-y-8">
                             {/* ... Form input fields for course (title, price, modules) ... */}
                             {/* KEEPING THIS PART COMPACT AS IT WAS NOT REQUESTED TO CHANGE */}
                            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 space-y-4">
                                <h3 className="text-lg font-semibold text-zinc-900 flex items-center gap-2 pb-2 border-b border-zinc-100">
                                    <Layout className="w-5 h-5 text-primary-500" /> Informasi Dasar
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-1">Judul Kursus</label>
                                        <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2 bg-zinc-50 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-1">Harga (IDR)</label>
                                        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full px-4 py-2 bg-zinc-50 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1">Deskripsi Singkat</label>
                                    <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-4 py-2 bg-zinc-50 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-1">URL Thumbnail (Gambar)</label>
                                        <input type="text" value={thumbnail} onChange={(e) => setThumbnail(e.target.value)} className="w-full px-4 py-2 bg-zinc-50 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-1">Kategori</label>
                                        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-2 bg-zinc-50 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                                            <option>Marketing</option><option>Programming</option><option>Design</option><option>Business</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 space-y-6">
                                <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                                     <h3 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                                        <Video className="w-5 h-5 text-primary-500" /> Kurikulum & Materi
                                     </h3>
                                     <button type="button" onClick={addModule} className="text-xs font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                                        <Plus className="w-3 h-3" /> Tambah Bab
                                     </button>
                                </div>
                                <div className="space-y-6">
                                    {modules.map((module, mIndex) => (
                                        <div key={module.id} className="bg-zinc-50 rounded-xl border border-zinc-200 overflow-hidden">
                                            <div className="bg-zinc-100 p-3 flex items-center gap-2 border-b border-zinc-200">
                                                <GripVertical className="w-4 h-4 text-zinc-400 cursor-move" />
                                                <input type="text" value={module.title} onChange={(e) => updateModuleTitle(mIndex, e.target.value)} className="bg-transparent font-bold text-zinc-800 text-sm w-full outline-none focus:bg-white focus:px-2 focus:py-1 rounded transition-all" />
                                                <button type="button" onClick={() => removeModule(mIndex)} className="p-1 text-zinc-400 hover:text-red-500"><Trash className="w-4 h-4" /></button>
                                            </div>
                                            <div className="p-3 space-y-3">
                                                {module.lessons.map((lesson, lIndex) => (
                                                    <div key={lesson.id} className="bg-white p-4 rounded-lg border border-zinc-200 shadow-sm space-y-3">
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex items-center gap-2 mb-2"> <span className="bg-primary-50 text-primary-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Video {lIndex + 1}</span> </div>
                                                            <button type="button" onClick={() => removeLesson(mIndex, lIndex)} className="text-zinc-300 hover:text-red-500"><X className="w-4 h-4" /></button>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            <input type="text" placeholder="Judul Materi Video" value={lesson.title} onChange={(e) => updateLesson(mIndex, lIndex, 'title', e.target.value)} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded text-sm focus:ring-1 focus:ring-primary-500 outline-none" />
                                                            <div className="relative">
                                                                <Youtube className="absolute left-2 top-2.5 w-4 h-4 text-red-500" />
                                                                <input type="text" placeholder="Link YouTube" value={lesson.videoUrl} onChange={(e) => updateLesson(mIndex, lIndex, 'videoUrl', e.target.value)} className="w-full pl-8 pr-3 py-2 bg-zinc-50 border border-zinc-300 rounded text-sm focus:ring-1 focus:ring-primary-500 outline-none" />
                                                            </div>
                                                        </div>
                                                        <textarea placeholder="Deskripsi singkat..." value={lesson.description} onChange={(e) => updateLesson(mIndex, lIndex, 'description', e.target.value)} className="w-full px-3 py-2 bg-zinc-50 border border-zinc-300 rounded text-sm focus:ring-1 focus:ring-primary-500 outline-none resize-none" rows={2} />
                                                    </div>
                                                ))}
                                                <button type="button" onClick={() => addLesson(mIndex)} className="w-full py-2 border-2 border-dashed border-zinc-300 hover:border-primary-400 hover:bg-primary-50 text-zinc-500 hover:text-primary-600 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2">
                                                    <Plus className="w-3 h-3" /> Tambah Video Materi
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center justify-end gap-4 pt-4 pb-12">
                                <button type="button" onClick={handleCancelEdit} disabled={isSubmitting} className="px-6 py-2.5 text-zinc-600 bg-zinc-100 hover:bg-zinc-200 font-medium rounded-lg transition-colors">Batal</button>
                                <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 text-white bg-primary-500 hover:bg-primary-600 font-medium rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-70">
                                    {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : <><Save className="w-4 h-4" /> {editingCourseId ? 'Update Kursus' : 'Simpan Kursus'}</>}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </>
        )}

        {/* ======================= TAB: USERS ======================= */}
        {activeTab === 'users' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* User Form & Table */}
                <div className="lg:col-span-1">
                     <div id="user-form" className={`bg-white rounded-xl border shadow-sm p-6 sticky top-8 transition-all ${editingUserEmail ? 'border-primary-300 ring-2 ring-primary-50' : 'border-zinc-200'}`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className={`p-2 rounded-lg ${editingUserEmail ? 'bg-primary-100 text-primary-600' : 'bg-primary-50 text-primary-500'}`}>
                                    {editingUserEmail ? <UserCog className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                                </div>
                                <h3 className="font-bold text-zinc-900">{editingUserEmail ? 'Edit Akses Siswa' : 'Daftarkan Siswa'}</h3>
                            </div>
                            {editingUserEmail && (
                                <button onClick={resetUserForm} className="text-xs text-zinc-400 hover:text-zinc-600 font-bold">Batal</button>
                            )}
                        </div>
                        
                        <form onSubmit={handleSaveUser} className="space-y-4">
                             <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Informasi Siswa</label>
                                <input 
                                    type="email" 
                                    required 
                                    value={newUserEmail} 
                                    onChange={(e) => setNewUserEmail(e.target.value)} 
                                    disabled={!!editingUserEmail} // Kunci email saat edit
                                    className={`w-full px-4 py-2.5 bg-white border rounded-lg outline-none text-zinc-900 shadow-sm ${editingUserEmail ? 'bg-zinc-100 text-zinc-500 cursor-not-allowed border-zinc-200' : 'border-zinc-300 focus:ring-2 focus:ring-primary-500'}`} 
                                    placeholder="Alamat Email..." 
                                />
                                <input 
                                    type="text" 
                                    required 
                                    value={newUserName} 
                                    onChange={(e) => setNewUserName(e.target.value)} 
                                    className="w-full px-4 py-2.5 bg-white border border-zinc-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-zinc-900 placeholder-zinc-400 shadow-sm" 
                                    placeholder="Nama Lengkap..." 
                                />
                             </div>
                             
                             <div className="space-y-2 pt-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Pilih Akses Kursus</label>
                                <div className="border border-zinc-300 rounded-xl p-3 h-48 overflow-y-auto bg-zinc-50/50">
                                    <div onClick={() => setGrantFullAccess(!grantFullAccess)} className="flex items-center gap-3 p-3 bg-white border border-zinc-200 rounded-lg cursor-pointer hover:border-primary-400 transition-colors mb-2 shadow-sm group">
                                        <div className={`w-5 h-5 rounded flex items-center justify-center transition-all ${grantFullAccess ? 'bg-primary-500 text-white' : 'border-2 border-zinc-300 group-hover:border-primary-400'}`}>
                                            {grantFullAccess && <CheckSquare className="w-3.5 h-3.5" />}
                                        </div>
                                        <span className={`text-sm font-bold ${grantFullAccess ? 'text-primary-700' : 'text-zinc-700'}`}>Buka Semua Akses (All Access)</span>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        {courses.map(c => {
                                            const isSelected = selectedAccessIds.includes(c.id);
                                            return (
                                                <div key={c.id} onClick={() => toggleCourseAccess(c.id)} className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer hover:bg-white transition-colors border border-transparent ${isSelected ? 'bg-white border-primary-200' : ''}`}>
                                                     <div className={`mt-0.5 w-4 h-4 border rounded flex items-center justify-center shrink-0 ${isSelected ? 'bg-primary-500 border-primary-500 text-white' : 'border-zinc-300 bg-white'}`}>
                                                        {isSelected && <CheckSquare className="w-3 h-3"/>}
                                                     </div>
                                                     <div className="flex-1 min-w-0">
                                                         <p className={`text-xs font-bold truncate ${isSelected ? 'text-primary-700' : 'text-zinc-700'}`}>{c.title}</p>
                                                     </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                             </div>

                             <div className="flex gap-2">
                                 {editingUserEmail && (
                                     <button type="button" onClick={resetUserForm} className="px-4 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-lg font-bold">Batal</button>
                                 )}
                                 <button type="submit" disabled={isAddingUser} className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-lg font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2">
                                    {isAddingUser ? <Loader2 className="w-4 h-4 animate-spin"/> : editingUserEmail ? <Save className="w-4 h-4" /> : <UserPlus className="w-4 h-4"/>}
                                    {isAddingUser ? 'Menyimpan...' : editingUserEmail ? 'Simpan Perubahan' : 'Daftarkan Siswa'}
                                 </button>
                             </div>
                        </form>
                     </div>
                </div>
                
                {/* Tabel Siswa */}
                <div className="lg:col-span-2">
                     <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex justify-between items-center">
                            <h3 className="font-bold text-zinc-900">Data Pengguna</h3>
                            <span className="text-xs font-bold bg-zinc-200 text-zinc-600 px-2 py-1 rounded-full">{usersList.length} User</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-zinc-50 text-zinc-500 border-b border-zinc-200">
                                    <tr>
                                        <th className="px-5 py-3 font-semibold w-[40%]">Siswa / Role</th>
                                        <th className="px-5 py-3 font-semibold">Akses</th>
                                        <th className="px-5 py-3 font-semibold text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {usersList.length > 0 ? usersList.map(u => (
                                        <tr key={u.email} className={`transition-colors ${editingUserEmail === u.email ? 'bg-primary-50' : 'hover:bg-zinc-50'}`}>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img 
                                                        src={u.avatar || `https://i.pravatar.cc/150?u=${u.email}`} 
                                                        className="w-10 h-10 rounded-full border border-zinc-200 object-cover" 
                                                        alt="" 
                                                    />
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-0.5">
                                                            <span className="font-bold text-zinc-900 line-clamp-1">{u.name}</span>
                                                            {u.role === 'instructor' ? (
                                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-900 text-white uppercase border border-zinc-900">Admin</span>
                                                            ) : (
                                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary-50 text-primary-600 uppercase border border-primary-100">Student</span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-zinc-500 font-medium">{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                {u.role === 'instructor' ? (
                                                    <span className="flex items-center gap-1.5 text-xs font-bold text-zinc-500">
                                                        <Shield className="w-3.5 h-3.5" /> Full Control
                                                    </span>
                                                ) : (
                                                    <div className="flex flex-col gap-1">
                                                        {u.accessList.includes('*') ? (
                                                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded w-fit">
                                                                <CheckCircle className="w-3 h-3" /> All Access
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-zinc-600 font-medium">
                                                                <span className="font-bold text-zinc-900">{u.accessList.length}</span> Kursus Dimiliki
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                {u.role !== 'instructor' && (
                                                    <button 
                                                        onClick={() => handleEditUser(u)}
                                                        className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-primary-100 text-zinc-400 hover:text-primary-600 transition-colors mr-2"
                                                        title="Edit Akses"
                                                    >
                                                        <Edit3 className="w-4 h-4"/>
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={()=>initiateDelete('user', u.email, u.name, u.docId)} 
                                                    className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-red-50 text-zinc-400 hover:text-red-600 transition-colors"
                                                    title="Hapus User"
                                                >
                                                    <Trash className="w-4 h-4"/>
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-8 text-center text-zinc-400 text-sm">Belum ada siswa terdaftar.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                     </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default Admin;
