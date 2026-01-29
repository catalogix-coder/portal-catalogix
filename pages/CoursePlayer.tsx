
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Play, Circle, ChevronLeft, ChevronRight, Lock, ShieldAlert, FileText, ChevronDown, ChevronUp, ExternalLink, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useCourses } from '../context/CourseContext';
import { useAuth } from '../context/AuthContext';
import { Course, Lesson } from '../types';

const CoursePlayer: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { getCourse } = useCourses();
  const { user, isLoggedIn, openLogin } = useAuth(); 
  const navigate = useNavigate();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [openModules, setOpenModules] = useState<{[key: string]: boolean}>({});
  
  // State untuk Checklist (Disimpan di memory sementara, idealnya di database)
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);

  // LOGIC CHECK ACCESS
  const hasAccess = user && (
      user.role === 'instructor' || 
      user.accessList.includes('*') || 
      (courseId && user.accessList.includes(courseId))
  );

  useEffect(() => {
    if (courseId) {
        const foundCourse = getCourse(courseId);
        if (foundCourse) {
            setCourse(foundCourse);
            // Default active lesson & expand first module
            if (foundCourse.modules.length > 0) {
                const firstMod = foundCourse.modules[0];
                setOpenModules({ [firstMod.id]: true });
                if (firstMod.lessons.length > 0) {
                    setActiveLesson(firstMod.lessons[0]);
                }
            }
        }
    }
  }, [courseId, getCourse]);

  const toggleModule = (modId: string) => {
      setOpenModules(prev => ({...prev, [modId]: !prev[modId]}));
  };

  // --- NAVIGATION LOGIC (FLAT LIST) ---
  // Mengubah struktur Bab > Pelajaran menjadi satu list panjang urut untuk memudahkan Next/Prev
  const allLessons = useMemo(() => {
      if (!course) return [];
      return course.modules.flatMap(m => m.lessons);
  }, [course]);

  const currentLessonIndex = useMemo(() => {
      return allLessons.findIndex(l => l.id === activeLesson?.id);
  }, [allLessons, activeLesson]);

  const handleNextLesson = () => {
      if (currentLessonIndex < allLessons.length - 1 && activeLesson) {
          // 1. Tandai materi sekarang sebagai selesai
          if (!completedLessonIds.includes(activeLesson.id)) {
              setCompletedLessonIds(prev => [...prev, activeLesson.id]);
          }

          // 2. Pindah ke materi berikutnya
          const nextLesson = allLessons[currentLessonIndex + 1];
          setActiveLesson(nextLesson);
          
          // 3. Buka module tempat materi berikutnya berada (jika tertutup)
          const parentModule = course?.modules.find(m => m.lessons.some(l => l.id === nextLesson.id));
          if (parentModule) {
              setOpenModules(prev => ({...prev, [parentModule.id]: true}));
          }
      }
  };

  const handlePrevLesson = () => {
      if (currentLessonIndex > 0) {
          const prevLesson = allLessons[currentLessonIndex - 1];
          setActiveLesson(prevLesson);
          
           // Buka module parentnya
           const parentModule = course?.modules.find(m => m.lessons.some(l => l.id === prevLesson.id));
           if (parentModule) {
               setOpenModules(prev => ({...prev, [parentModule.id]: true}));
           }
      }
  };

  // --- VIDEO PARSING HELPER FUNCTIONS ---

  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return null;
    const cleanUrl = url.trim();
    let videoId = '';

    try {
        const urlObj = new URL(cleanUrl);
        if (urlObj.hostname.includes('youtube.com')) {
            if (urlObj.searchParams.has('v')) {
                videoId = urlObj.searchParams.get('v') || '';
            } else if (urlObj.pathname.startsWith('/embed/')) {
                videoId = urlObj.pathname.split('/embed/')[1];
            } else if (urlObj.pathname.startsWith('/live/')) {
                videoId = urlObj.pathname.split('/live/')[1];
            }
        } else if (urlObj.hostname.includes('youtu.be')) {
            videoId = urlObj.pathname.slice(1);
        }
    } catch (e) {
        // Fallback Regex
        const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = cleanUrl.match(regExp);
        videoId = (match && match[2]) ? match[2] : '';
    }

    if (videoId.includes('?')) videoId = videoId.split('?')[0];
    if (videoId.includes('&')) videoId = videoId.split('&')[0];
    
    if (!videoId || videoId.length < 5) return null;

    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1&origin=${window.location.origin}`;
  };

  // Logic Khusus Dropbox
  const getDropboxDirectUrl = (url: string) => {
      if (!url.includes('dropbox.com')) return null;
      
      let cleanUrl = url.trim();
      
      // Mengubah ?dl=0 atau ?dl=1 menjadi ?raw=1 (Direct Stream)
      if (cleanUrl.includes('?dl=')) {
          cleanUrl = cleanUrl.replace(/dl=0/g, 'raw=1').replace(/dl=1/g, 'raw=1');
      } else if (cleanUrl.includes('?')) {
          cleanUrl = cleanUrl + '&raw=1';
      } else {
          cleanUrl = cleanUrl + '?raw=1';
      }
      
      return cleanUrl;
  };

  const isDirectVideoFile = (url: string) => {
      return url.match(/\.(mp4|webm|ogg|mov)$/i);
  };

  // --- RENDER VIDEO PLAYER COMPONENT ---
  const renderVideoPlayer = () => {
      if (!activeLesson) {
          return (
            <div className="absolute inset-0 flex items-center justify-center text-zinc-500">
                Pilih materi untuk memutar
            </div>
          );
      }

      const url = activeLesson.videoUrl || '';
      
      // 1. YouTube
      const youtubeUrl = getYoutubeEmbedUrl(url);
      if (youtubeUrl) {
          return (
            <iframe 
                key={activeLesson.id} // FORCE RELOAD IFRAME
                src={youtubeUrl} 
                title={activeLesson.title}
                className="w-full h-full absolute inset-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
            />
          );
      }

      // 2. Dropbox (Native Video Tag)
      const dropboxUrl = getDropboxDirectUrl(url);
      if (dropboxUrl) {
          return (
             <video 
                key={activeLesson.id} // PENTING: Gunakan ID Lesson agar Player di-reset total saat ganti materi
                controls 
                controlsList="nodownload" 
                className="w-full h-full absolute inset-0 bg-black"
                poster={course?.thumbnail}
                onContextMenu={(e) => e.preventDefault()}
                autoPlay={true} // Auto play saat pindah video
             >
                 <source src={dropboxUrl} type="video/mp4" />
                 {/* Fallback source */}
                 <source src={dropboxUrl} />
                 Browser Anda tidak mendukung tag video.
             </video>
          );
      }

      // 3. Direct Video File (MP4/WebM hosting sendiri)
      if (isDirectVideoFile(url)) {
          return (
             <video 
                key={activeLesson.id}
                controls 
                controlsList="nodownload" 
                className="w-full h-full absolute inset-0 bg-black"
                poster={course?.thumbnail}
                onContextMenu={(e) => e.preventDefault()}
                autoPlay={true}
             >
                 <source src={url} />
                 Browser Anda tidak mendukung tag video.
             </video>
          );
      }

      // 4. Fallback: Generic Iframe
      if (url.startsWith('http')) {
          return (
              <>
                <iframe 
                    key={activeLesson.id}
                    src={url} 
                    title={activeLesson.title}
                    className="w-full h-full absolute inset-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    onError={(e) => console.log("Iframe load error", e)}
                />
                <div className="absolute top-2 right-2 group opacity-0 group-hover:opacity-100 transition-opacity">
                     <a href={url} target="_blank" rel="noreferrer" className="bg-black/50 hover:bg-black/80 text-white text-xs px-3 py-1.5 rounded flex items-center gap-1 backdrop-blur-sm transition-all">
                        <ExternalLink className="w-3 h-3" /> Buka
                     </a>
                </div>
              </>
          );
      }

      // 5. Total Fallback (Invalid URL)
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 p-8 text-center bg-zinc-900">
            <div className="bg-zinc-800 p-4 rounded-full mb-4">
                <AlertCircle className="w-8 h-8 text-zinc-500" />
            </div>
            <p className="mb-2 font-medium text-white">Format Video Tidak Didukung</p>
            <p className="text-sm text-zinc-500 mb-6">
                Masukkan link YouTube, Dropbox, atau MP4.
            </p>
        </div>
      );
  };


  if (!course) return <div className="p-8 text-center text-zinc-500">Memuat materi...</div>;

  // --- ACCESS DENIED STATE ---
  if (!isLoggedIn || !hasAccess) {
      return (
          <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
              <div className="bg-white max-w-md w-full rounded-2xl p-8 text-center shadow-2xl">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Lock className="w-8 h-8 text-red-600" />
                  </div>
                  <h1 className="text-2xl font-bold text-zinc-900 mb-2">Akses Terkunci</h1>
                  <p className="text-zinc-500 mb-8">
                      {isLoggedIn ? "Anda belum membeli materi kursus ini." : "Silakan login terlebih dahulu."}
                  </p>
                  <button onClick={() => navigate('/')} className="w-full py-3 bg-zinc-900 text-white font-bold rounded-lg hover:bg-zinc-800 transition-colors">Kembali ke Katalog</button>
              </div>
          </div>
      );
  }

  // --- STANDARD LMS LAYOUT (SIDEBAR LEFT, CONTENT RIGHT) ---
  return (
    // Update wrapper: min-h pada mobile, fixed h pada desktop
    <div className="flex flex-col min-h-[calc(100vh-80px)] md:h-[calc(100vh-80px)] bg-zinc-100 md:overflow-hidden">
        
        {/* Mobile Header (Title only) */}
        <div className="md:hidden bg-white p-4 border-b border-zinc-200">
             <h1 className="text-base font-bold text-zinc-900 truncate">{course.title}</h1>
        </div>

        <div className="flex flex-col md:flex-row flex-1 md:overflow-hidden relative">
            
            {/* 1. SIDEBAR NAVIGATION (LEFT) */}
            {/* Update sidebar: h-auto di mobile, h-full di desktop. Order 2 di mobile (bawah). */}
            <div className="w-full md:w-96 lg:w-[450px] bg-white border-r border-zinc-200 flex flex-col md:h-full h-auto order-2 md:order-1 border-t md:border-t-0">
                 <div className="p-5 border-b border-zinc-200 hidden md:block">
                     <Link to="/" className="flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-primary-600 mb-3">
                        <ChevronLeft className="w-4 h-4" /> Kembali ke Katalog
                     </Link>
                     <h2 className="text-lg font-bold text-zinc-900 leading-tight">{course.title}</h2>
                     <div className="mt-3 flex items-center justify-between">
                         <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
                             <ShieldAlert className="w-3.5 h-3.5" /> Member Access
                         </div>
                         <div className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                             {completedLessonIds.length} / {allLessons.length} Selesai
                         </div>
                     </div>
                 </div>

                 {/* Sidebar content: allow grow on mobile */}
                 <div className="flex-1 md:overflow-y-auto custom-scrollbar">
                     {course.modules.map((module, index) => {
                         const isOpen = openModules[module.id];
                         return (
                             <div key={module.id} className="border-b border-zinc-100 last:border-0">
                                 <button 
                                    onClick={() => toggleModule(module.id)}
                                    className="w-full px-5 py-4 bg-zinc-50 flex items-center justify-between hover:bg-zinc-100 transition-colors"
                                 >
                                     <div className="text-left">
                                         <p className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-1">BAB {index + 1}</p>
                                         <p className="text-sm text-zinc-900 font-bold">{module.title}</p>
                                     </div>
                                     {isOpen ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                                 </button>
                                 
                                 {isOpen && (
                                     <div className="bg-white">
                                         {module.lessons.map((lesson) => {
                                             const isActive = lesson.id === activeLesson?.id;
                                             const isCompleted = completedLessonIds.includes(lesson.id);

                                             return (
                                                 <button
                                                     key={lesson.id}
                                                     onClick={() => {
                                                        setActiveLesson(lesson);
                                                        // Di mobile, scroll ke atas saat pilih materi
                                                        if (window.innerWidth < 768) {
                                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                                        }
                                                     }}
                                                     className={`w-full flex items-start gap-4 p-4 transition-all border-l-[4px] ${
                                                         isActive 
                                                         ? 'border-primary-500 bg-primary-50/50' 
                                                         : 'border-transparent hover:bg-zinc-50'
                                                     }`}
                                                 >
                                                     <div className="mt-0.5 shrink-0">
                                                        {isActive ? (
                                                            <Play className="w-5 h-5 text-primary-600 fill-primary-600" />
                                                        ) : isCompleted ? (
                                                            <CheckCircle2 className="w-5 h-5 text-green-500 fill-green-100" />
                                                        ) : (
                                                            <Circle className="w-5 h-5 text-zinc-300" />
                                                        )}
                                                     </div>
                                                     <div className="text-left min-w-0">
                                                         <p className={`text-sm font-medium leading-snug ${isActive ? 'text-primary-900 font-bold' : isCompleted ? 'text-zinc-500 line-through decoration-zinc-300' : 'text-zinc-700'}`}>
                                                             {lesson.title}
                                                         </p>
                                                         <span className="text-xs text-zinc-400 mt-1.5 block">{lesson.duration}</span>
                                                     </div>
                                                 </button>
                                             );
                                         })}
                                     </div>
                                 )}
                             </div>
                         );
                     })}
                 </div>
            </div>

            {/* 2. MAIN CONTENT (RIGHT) */}
            {/* Update main: h-auto di mobile, order 1 di mobile (atas). */}
            <div className="flex-1 flex flex-col md:h-full h-auto md:overflow-y-auto bg-zinc-100 order-1 md:order-2">
                
                {/* Video Container - Sticky on mobile */}
                <div className="w-full bg-black shadow-lg z-30 sticky top-0 md:static">
                     <div className="max-w-5xl mx-auto w-full aspect-video bg-black relative group">
                        {renderVideoPlayer()}
                     </div>
                </div>

                {/* NAVIGATION BUTTONS (NEXT/PREV) */}
                <div className="bg-zinc-900 border-t border-zinc-800 py-4 px-4 md:px-8">
                    <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
                        <button 
                            onClick={handlePrevLesson}
                            disabled={currentLessonIndex <= 0}
                            className="flex items-center gap-2 text-sm md:text-base font-bold text-zinc-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            <span className="hidden sm:inline">Materi Sebelumnya</span>
                            <span className="sm:hidden">Sebelumnya</span>
                        </button>
                        
                        <button 
                            onClick={handleNextLesson}
                            disabled={currentLessonIndex >= allLessons.length - 1}
                            className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-full text-sm md:text-base font-bold shadow-lg shadow-primary-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <span className="hidden sm:inline">Lanjut Materi Berikutnya</span>
                            <span className="sm:hidden">Lanjut</span>
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content Description Area */}
                <div className="flex-1 max-w-5xl w-full mx-auto px-4 md:px-8 py-8">
                    {activeLesson && (
                        <div className="animate-in fade-in duration-300">
                            <div className="flex items-center gap-2 mb-4 text-primary-600">
                                <FileText className="w-5 h-5" />
                                <span className="text-xs font-bold uppercase tracking-wider">Deskripsi Materi</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-6">{activeLesson.title}</h1>
                            <div className="prose prose-zinc prose-lg max-w-none text-zinc-600 leading-relaxed">
                                <p>{activeLesson.description || "Tidak ada deskripsi untuk materi ini."}</p>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    </div>
  );
};

export default CoursePlayer;
