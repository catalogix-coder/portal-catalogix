
import React, { useState, useEffect } from 'react';
import { 
    ShieldCheck, Monitor, Award, ChevronRight, PlayCircle, 
    Smile, ThumbsUp, Lightbulb, Users, Globe, Clapperboard, FileBadge, Film,
    ChevronLeft, BookOpen, GraduationCap, Infinity, Briefcase, Zap, CheckCircle2, Star, Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import CourseCard from '../components/CourseCard';
import { CATEGORIES } from '../constants';
import { useCourses } from '../context/CourseContext';
import { useAuth } from '../context/AuthContext';

const Dashboard: React.FC = () => {
  const { courses } = useCourses();
  const { openSignup, user, isLoggedIn } = useAuth(); // Ambil user & status login

  // --- CAROUSEL LOGIC (Hanya untuk Guest) ---
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = courses.length > 0 ? courses.slice(0, 5) : [];
  
  useEffect(() => {
    if (slides.length <= 1 || isLoggedIn) return; // Stop carousel kalau sudah login
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length, isLoggedIn]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // --- LOGIC: MEMISAHKAN KURSUS SAYA VS KURSUS LAIN ---
  const myCourseIds = user?.accessList || [];
  const myCourses = courses.filter(c => myCourseIds.includes(c.id) || myCourseIds.includes('*'));
  const otherCourses = courses.filter(c => !myCourseIds.includes(c.id) && !myCourseIds.includes('*'));


  // --- TAMPILAN 1: STUDENT DASHBOARD (JIKA SUDAH LOGIN) ---
  if (isLoggedIn && user) {
    return (
      <div className="pb-12 bg-zinc-50 min-h-screen">
        {/* Welcome Header */}
        <div className="bg-white border-b border-zinc-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 flex items-center gap-2">
                            Halo, {user.name} <span className="animate-pulse">👋</span>
                        </h1>
                        <p className="text-zinc-500 mt-2 text-sm md:text-lg">
                            Senang melihatmu kembali! Siap melanjutkan petualangan belajarmu hari ini?
                        </p>
                    </div>
                    {user.role === 'student' && (
                        <div className="w-full md:w-auto bg-primary-50 px-4 py-2 rounded-lg border border-primary-100 flex items-center gap-3">
                             <div className="bg-primary-500 text-white p-2 rounded-full">
                                <GraduationCap className="w-5 h-5" />
                             </div>
                             <div>
                                 <p className="text-xs text-primary-600 font-bold uppercase tracking-wider">Status Member</p>
                                 <p className="font-bold text-zinc-900">Active Student</p>
                             </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-12 md:space-y-16">
            
            {/* SECTION: KELAS SAYA */}
            <section>
                <div className="flex items-center gap-2 mb-6 border-b border-zinc-200 pb-4">
                    <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-primary-500" />
                    <h2 className="text-xl md:text-2xl font-bold text-zinc-900">Kelas Saya</h2>
                </div>

                {myCourses.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {myCourses.map(course => (
                            <CourseCard key={course.id} course={course} isOwned={true} />
                        ))}
                    </div>
                ) : (
                    // Jika belum punya kelas
                    <div className="bg-white rounded-xl border border-zinc-200 p-8 md:p-12 text-center shadow-sm">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-zinc-100 rounded-full mb-4">
                            <BookOpen className="w-8 h-8 text-zinc-400" />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-900 mb-2">Belum ada kelas yang diambil</h3>
                        <p className="text-zinc-500 mb-8 max-w-md mx-auto text-sm md:text-base">
                            Kamu belum terdaftar di kelas manapun. Yuk, cari topik yang kamu minati dan mulai belajar skill baru!
                        </p>
                        <button 
                            onClick={() => document.getElementById('browse-all')?.scrollIntoView({ behavior: 'smooth' })}
                            className="w-full sm:w-auto px-6 py-3 bg-primary-500 text-white font-bold rounded-lg hover:bg-primary-600 transition-colors shadow-md"
                        >
                            Cari Kelas Sekarang
                        </button>
                    </div>
                )}
            </section>

            {/* SECTION: REKOMENDASI (UPSELLING) */}
            {otherCourses.length > 0 && (
                <section id="browse-all">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg md:text-xl font-bold text-zinc-900">Mungkin Kamu Juga Suka</h2>
                        <Link to="#" className="text-primary-600 font-bold text-sm hover:underline">Lihat Semua</Link>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                         {otherCourses.slice(0, 4).map(course => (
                            <CourseCard key={course.id} course={course} isOwned={false} />
                        ))}
                    </div>
                </section>
            )}

        </div>
      </div>
    );
  }

  // --- TAMPILAN 2: PUBLIC / GUEST LANDING PAGE (DEFAULT) ---
  return (
    <div className="pb-12 bg-zinc-50">
      
      {/* 1. HERO SECTION - SLIDING CAROUSEL */}
      <section className="w-full bg-zinc-900 relative overflow-hidden group">
        
        {/* Background Pattern - Opacity dinaikkan jadi 50% agar lebih terlihat jelas */}
        <div className="absolute inset-0 opacity-50 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] z-0"></div>
        
        {/* Gradient Overlay Utama */}
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/95 via-zinc-900/90 to-zinc-900/50 z-0"></div>

        {/* Pink Glow Effect - PINDAH KE KIRI ATAS */}
        <div className="absolute -left-40 -top-40 w-[800px] h-[800px] bg-primary-600/15 blur-[120px] rounded-full pointer-events-none z-0"></div>
        
        {/* Navigation Arrows */}
        {slides.length > 1 && (
            <>
                <button 
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all hidden md:flex items-center justify-center group-hover:opacity-100 opacity-0 duration-300"
                >
                    <ChevronLeft className="w-8 h-8" />
                </button>
                <button 
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all hidden md:flex items-center justify-center group-hover:opacity-100 opacity-0 duration-300"
                >
                    <ChevronRight className="w-8 h-8" />
                </button>
            </>
        )}

        {/* Carousel Track */}
        <div className="relative z-10 w-full overflow-hidden">
            <div 
                className="flex transition-transform duration-700 ease-in-out h-full"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
                {slides.map((course) => (
                    <div key={course.id} className="w-full flex-shrink-0 min-w-full">
                        {/* Mobile Padding reduced (py-12 vs py-20) */}
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24 min-h-[500px] md:min-h-[650px] flex items-center">
                            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 w-full">
                                
                                {/* Left Text */}
                                <div className="w-full md:w-1/2 text-white text-center md:text-left z-20">
                                    <span className="inline-block py-1 px-3 rounded bg-primary-500/20 text-primary-300 text-[10px] md:text-xs font-bold tracking-wider mb-4 border border-primary-500/30">
                                        FEATURED COURSE
                                    </span>
                                    {/* Responsive Text Sizes - Returned to safe sizes to avoid clipping */}
                                    <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 md:mb-6 tracking-tight line-clamp-3 pb-1">
                                        {course.title}
                                    </h1>
                                    <p className="text-sm sm:text-base md:text-lg text-zinc-300 mb-6 max-w-lg leading-relaxed line-clamp-3 mx-auto md:mx-0">
                                        {course.description}
                                    </p>
                                    
                                    <div className="flex items-center justify-center md:justify-start gap-6 text-sm font-medium mb-8 text-zinc-400">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4" /> {course.studentCount.toLocaleString()} Siswa
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <ThumbsUp className="w-4 h-4" /> {Math.floor(course.rating * 20)}% Positif
                                        </div>
                                    </div>

                                    {/* Price and Button Stack */}
                                    <div className="mt-4 flex flex-col items-center md:items-start gap-6">
                                        {/* Price Block */}
                                        <div className="mr-0 md:mr-2">
                                            {course.discountPrice && course.price && (
                                                <div className="flex items-center gap-3 mb-1 justify-center md:justify-start">
                                                    <p className="text-zinc-500 text-sm line-through font-medium">
                                                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(course.price || 0)}
                                                    </p>
                                                    {/* DISC BADGE */}
                                                    <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-bold px-2 py-0.5 rounded tracking-wide">
                                                        HEMAT {Math.round((((course.price || 0) - course.discountPrice) / (course.price || 1)) * 100)}%
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-3">
                                                <span className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                                                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(course.discountPrice || 0)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Button Block - Full width on mobile */}
                                        <button 
                                            onClick={openSignup}
                                            className="w-full md:w-auto bg-primary-600 hover:bg-primary-500 text-white px-8 py-3.5 md:py-4 rounded-lg font-bold inline-flex items-center justify-center gap-3 shadow-lg shadow-primary-900/20 transition-all transform hover:-translate-y-0.5 group"
                                        >
                                            <PlayCircle className="w-5 h-5 md:w-6 md:h-6 fill-white/20" />
                                            <span className="text-base md:text-lg">Mulai Belajar Sekarang</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Right Image Area - Single Card Style (Reference Look) */}
                                <div className="hidden md:block md:w-1/2 relative z-10 px-4">
                                     {/* Main Card Container */}
                                     <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-zinc-700/50 bg-zinc-800 transition-all duration-500 group-hover:shadow-primary-900/20 group-hover:border-zinc-600/50">
                                        <img 
                                            src={course.thumbnail} 
                                            alt={course.title} 
                                            className="w-full h-auto object-cover aspect-[4/3] transform transition-transform duration-700 group-hover:scale-105"
                                        />
                                        {/* Optional Gradient Overlay for Depth */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60"></div>
                                    </div>
                                    
                                    {/* Instructor Badge (Floating) */}
                                    <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl hidden lg:block border border-zinc-100 max-w-[260px] z-20 animate-in slide-in-from-bottom-4 fade-in duration-700 delay-200">
                                        <p className="text-[10px] font-bold text-zinc-400 uppercase mb-2 tracking-wide">Instructor</p>
                                        <div className="flex items-center gap-3">
                                            <img src={course.instructorAvatar} className="w-12 h-12 rounded-full border-2 border-zinc-100 shadow-sm object-cover" alt="Teacher" />
                                            <div className="overflow-hidden">
                                                <span className="font-bold text-zinc-900 block text-sm truncate">{course.instructor}</span>
                                                <span className="text-xs text-zinc-500 truncate block">Expert Mentor</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Carousel Indicators */}
        {slides.length > 1 && (
            <div className="absolute bottom-6 md:bottom-8 left-0 right-0 flex justify-center gap-2 z-20">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                            index === currentSlide ? 'w-8 bg-primary-500' : 'w-2 bg-zinc-600 hover:bg-zinc-400'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        )}
      </section>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 2. STATS BAR (PENGGANTI VALUE PROPS REDUNDAN) */}
        <section className="bg-white border-b border-zinc-200 shadow-sm relative z-20 -mt-8 md:-mt-0 rounded-t-2xl md:rounded-none mx-4 md:mx-0 overflow-hidden">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-zinc-100">
                {/* Stat 1 */}
                <div className="p-6 md:py-8 text-center group hover:bg-zinc-50 transition-colors cursor-default">
                    <div className="inline-flex items-center justify-center p-2.5 bg-primary-50 text-primary-600 rounded-xl mb-3 group-hover:scale-110 transition-transform duration-300">
                       <Users className="w-6 h-6" />
                    </div>
                    <p className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight">1.2k+</p>
                    <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mt-1">Siswa Aktif</p>
                </div>

                {/* Stat 2 */}
                <div className="p-6 md:py-8 text-center group hover:bg-zinc-50 transition-colors cursor-default">
                    <div className="inline-flex items-center justify-center p-2.5 bg-primary-50 text-primary-600 rounded-xl mb-3 group-hover:scale-110 transition-transform duration-300">
                       <Star className="w-6 h-6" />
                    </div>
                    <p className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight">4.9/5</p>
                    <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mt-1">Rating Review</p>
                </div>

                {/* Stat 3 */}
                <div className="p-6 md:py-8 text-center group hover:bg-zinc-50 transition-colors cursor-default">
                    <div className="inline-flex items-center justify-center p-2.5 bg-primary-50 text-primary-600 rounded-xl mb-3 group-hover:scale-110 transition-transform duration-300">
                       <Clock className="w-6 h-6" />
                    </div>
                    <p className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight">24/7</p>
                    <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mt-1">Akses Materi</p>
                </div>

                {/* Stat 4 */}
                <div className="p-6 md:py-8 text-center group hover:bg-zinc-50 transition-colors cursor-default">
                    <div className="inline-flex items-center justify-center p-2.5 bg-primary-50 text-primary-600 rounded-xl mb-3 group-hover:scale-110 transition-transform duration-300">
                       <FileBadge className="w-6 h-6" />
                    </div>
                    <p className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight">50+</p>
                    <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mt-1">Modul Praktik</p>
                </div>
            </div>
        </section>

        {/* 3. MAIN CONTENT: Categories & Grid */}
        <section className="py-12 md:py-16">
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-yellow-400 text-zinc-900 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Best Seller</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-zinc-900">Kursus Populer</h2>
                </div>
                
                {/* Horizontal Scroll for Categories on Mobile */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-full md:max-w-2xl pb-2 md:pb-0">
                    {CATEGORIES.slice(0, 5).map((category, index) => (
                        <button
                        key={index}
                        className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all flex-shrink-0 ${
                            index === 0
                            ? 'bg-zinc-900 text-white'
                            : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                        }`}
                        >
                        {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            {courses.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-xl border border-zinc-200">
                    <div className="inline-block p-4 bg-zinc-50 rounded-full mb-4">
                        <Film className="w-8 h-8 text-zinc-400" />
                    </div>
                    <h3 className="text-lg font-bold text-zinc-900">Belum ada materi</h3>
                    <p className="text-zinc-500 mb-6">Silakan tunggu materi terbaru dirilis.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8 md:gap-y-10">
                    {courses.map(course => (
                        <CourseCard key={course.id} course={course} />
                    ))}
                </div>
            )}

            <div className="mt-12 text-center">
                <button className="w-full sm:w-auto px-12 py-3.5 bg-zinc-100 text-zinc-900 font-bold rounded-lg hover:bg-zinc-200 transition-colors text-sm uppercase tracking-wide flex items-center justify-center gap-2 mx-auto">
                    Lihat Semua Kursus <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </section>

        {/* 4. VALUE PROPS DETAILED (UPDATED TO MATCH) */}
        <section className="py-12 md:py-20 border-t border-zinc-200">
            <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 text-center mb-12 md:mb-16">Apa yang kamu dapat di CatalogiX</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 md:gap-y-12 max-w-6xl mx-auto">
                {/* Item 1 */}
                <div className="flex gap-5">
                    <div className="flex-shrink-0">
                        <Smile className="w-10 h-10 text-zinc-300 stroke-[1.5]" />
                    </div>
                    <div>
                        <h3 className="font-bold text-zinc-900 text-lg mb-2">Belajar sesuai kecepatanmu</h3>
                        <p className="text-zinc-500 leading-relaxed text-sm">
                            Nikmati belajar dari rumah tanpa jadwal yang mengikat dengan metode yang mudah diikuti. Kamu yang atur waktunya.
                        </p>
                    </div>
                </div>

                {/* Item 2 - Updated */}
                <div className="flex gap-5">
                    <div className="flex-shrink-0">
                        <CheckCircle2 className="w-10 h-10 text-zinc-300 stroke-[1.5]" />
                    </div>
                    <div>
                        <h3 className="font-bold text-zinc-900 text-lg mb-2">Investasi Sekali Bayar</h3>
                        <p className="text-zinc-500 leading-relaxed text-sm">
                           Tidak ada biaya tersembunyi. Cukup bayar sekali di awal, dan kamu bisa mengakses materi sepuasnya selamanya.
                        </p>
                    </div>
                </div>

                {/* Item 3 - Updated */}
                <div className="flex gap-5">
                    <div className="flex-shrink-0">
                        <Zap className="w-10 h-10 text-zinc-300 stroke-[1.5]" />
                    </div>
                    <div>
                        <h3 className="font-bold text-zinc-900 text-lg mb-2">Fokus Pada Hasil Karya</h3>
                        <p className="text-zinc-500 leading-relaxed text-sm">
                            Kurikulum dirancang agar kamu menghasilkan portofolio nyata setelah selesai, bukan sekadar sertifikat.
                        </p>
                    </div>
                </div>

                {/* Item 4 */}
                <div className="flex gap-5">
                    <div className="flex-shrink-0">
                        <Lightbulb className="w-10 h-10 text-zinc-300 stroke-[1.5]" />
                    </div>
                    <div>
                        <h3 className="font-bold text-zinc-900 text-lg mb-2">Berbagi pengetahuan dan ide</h3>
                        <p className="text-zinc-500 leading-relaxed text-sm">
                            Ajukan pertanyaan, minta masukan, atau berikan solusi di komunitas member eksklusif.
                        </p>
                    </div>
                </div>
            </div>
        </section>

      </div> {/* End Max Width Container */}
    </div>
  );
};

export default Dashboard;
