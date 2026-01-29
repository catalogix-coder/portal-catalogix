
import React, { useState } from 'react';
import { Layers, Search, Menu, User as UserIcon, LogOut, LayoutDashboard, ExternalLink, ChevronDown, PlayCircle, X, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useCourses } from '../context/CourseContext';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { isLoggedIn, user, openLogin, logout } = useAuth();
  const { courses } = useCourses(); // Ambil data kursus
  const isInstructor = user?.role === 'instructor';
  
  // State untuk Mobile Menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 text-zinc-900 font-sans">
      <AuthModal />
      
      {/* Navbar - Sticky & Dark Mode */}
      <nav className="sticky top-0 z-40 bg-zinc-950 border-b border-zinc-800 shadow-md">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* Left: Logo & Mobile Menu Button */}
            <div className="flex items-center gap-5">
              {/* Mobile Menu Button */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden text-zinc-400 hover:text-white focus:outline-none"
              >
                 {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
              </button>

              <Link to="/" className="flex items-center gap-3 group">
                <div className="bg-primary-500 p-2 rounded-xl text-white shadow-sm group-hover:bg-primary-600 transition-colors">
                  <Layers className="h-6 w-6" />
                </div>
                <div className="flex flex-col">
                    <span className="text-xl font-bold tracking-tight text-white leading-none">CatalogiX</span>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none mt-1">Course Portal</span>
                </div>
              </Link>

              {/* Desktop Links with Dropdown */}
              <div className="hidden md:flex items-center space-x-8 ml-10 text-sm font-medium">
                 
                 {/* MENU KURSUS (DROPDOWN) */}
                 <div className="relative group h-20 flex items-center">
                    <Link 
                        to="/" 
                        className={`flex items-center gap-1.5 transition-colors ${location.pathname === '/' ? 'text-white font-bold' : 'text-zinc-400 hover:text-white'}`}
                    >
                        Kursus
                        <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                    </Link>

                    {/* Dropdown Content */}
                    <div className="absolute top-full left-0 w-96 pt-2 hidden group-hover:block z-50">
                        <div className="bg-white rounded-xl shadow-xl border border-zinc-200 overflow-hidden ring-1 ring-black ring-opacity-5">
                            <div className="p-3 grid gap-1">
                                <p className="px-3 py-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">Materi Tersedia</p>
                                
                                {courses.length > 0 ? (
                                    courses.slice(0, 5).map((course) => (
                                        <Link 
                                            key={course.id} 
                                            to={`/course/${course.id}`}
                                            className="flex items-start gap-4 p-3 rounded-lg hover:bg-zinc-50 transition-colors group/item"
                                        >
                                            <img 
                                                src={course.thumbnail} 
                                                alt="" 
                                                className="w-16 h-10 object-cover rounded border border-zinc-100 group-hover/item:border-primary-200 shrink-0"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-zinc-900 line-clamp-2 leading-tight group-hover/item:text-primary-600 mb-1">
                                                    {course.title}
                                                </p>
                                                <p className="text-xs text-zinc-500 truncate">
                                                    {course.totalDuration} • {course.modules.reduce((acc, m) => acc + m.lessons.length, 0)} Video
                                                </p>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-zinc-400 text-sm">
                                        Belum ada kursus
                                    </div>
                                )}
                            </div>
                            <div className="bg-zinc-50 border-t border-zinc-100 p-3">
                                <Link to="/" className="flex items-center justify-center gap-2 text-sm font-bold text-primary-600 hover:text-primary-700">
                                    <PlayCircle className="w-4 h-4" /> Lihat Semua Kursus
                                </Link>
                            </div>
                        </div>
                    </div>
                 </div>

                 {isInstructor && (
                    <Link to="/admin" className={`flex items-center gap-1.5 transition-colors ${location.pathname === '/admin' ? 'text-primary-500 font-bold' : 'text-zinc-400 hover:text-primary-500'}`}>
                        <LayoutDashboard className="w-5 h-5" /> Studio Admin
                    </Link>
                 )}
              </div>
            </div>
            
            {/* Center: Search (Hidden on mobile) */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
                <div className="relative w-full group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-zinc-500 group-focus-within:text-primary-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-12 pr-4 py-2.5 border border-zinc-700 rounded-full leading-5 bg-zinc-900 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:bg-zinc-950 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm transition-all shadow-sm"
                        placeholder="Cari materi kursus..."
                    />
                </div>
            </div>

            {/* Right: Auth & Actions */}
            <div className="flex items-center space-x-5">
               {/* Mobile Search Icon (When logged out or to save space) */}
               <button className="md:hidden text-zinc-400 hover:text-white">
                  <Search className="w-6 h-6" />
               </button>

               {!isLoggedIn ? (
                    <button 
                        onClick={openLogin}
                        className="bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm hover:shadow-md transition-all transform active:scale-95 whitespace-nowrap"
                    >
                        Log in
                    </button>
               ) : (
                   <div className="flex items-center gap-3">
                        <div className="hidden sm:block text-right">
                            <p className="text-sm font-bold leading-none text-white">{user?.name}</p>
                            <p className="text-[10px] text-zinc-400 uppercase tracking-wider mt-0.5">{user?.role}</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center text-sm font-bold border border-zinc-700 relative group cursor-pointer hover:bg-zinc-700 transition-colors">
                            {user?.name.charAt(0).toUpperCase()}
                            
                            {/* Desktop Dropdown */}
                            <div className="absolute right-0 top-full pt-2 w-60 hidden md:group-hover:block z-50">
                                <div className="bg-white rounded-xl shadow-xl border border-zinc-200 py-1 text-zinc-800 ring-1 ring-black ring-opacity-5">
                                    <div className="px-4 py-3 border-b border-zinc-50 bg-zinc-50/50">
                                        <p className="font-bold text-sm truncate text-zinc-900">{user?.name}</p>
                                        <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
                                    </div>
                                    {isInstructor && (
                                        <Link to="/admin" className="block px-4 py-2 text-sm hover:bg-primary-50 hover:text-primary-600 flex items-center gap-2 transition-colors">
                                            <LayoutDashboard className="w-4 h-4" /> Studio Saya
                                        </Link>
                                    )}
                                    <div className="border-t border-zinc-100 mt-1"></div>
                                    <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors rounded-b-xl">
                                        <LogOut className="w-4 h-4" /> Keluar
                                    </button>
                                </div>
                            </div>
                        </div>
                   </div>
               )}
            </div>
          </div>
        </div>

        {/* ================= MOBILE MENU DRAWER ================= */}
        {isMobileMenuOpen && (
            <div className="md:hidden bg-zinc-900 border-b border-zinc-800 animate-in slide-in-from-top-2 duration-200">
                <div className="px-4 pt-2 pb-6 space-y-3">
                    <Link 
                        to="/" 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`block px-4 py-3.5 rounded-md text-lg font-medium flex items-center gap-3 ${location.pathname === '/' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
                    >
                        <Home className="w-5 h-5" /> Beranda
                    </Link>

                    {isInstructor && (
                        <Link 
                            to="/admin" 
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`block px-4 py-3.5 rounded-md text-lg font-medium flex items-center gap-3 ${location.pathname === '/admin' ? 'bg-zinc-800 text-primary-500' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
                        >
                            <LayoutDashboard className="w-5 h-5" /> Studio Admin
                        </Link>
                    )}

                    {isLoggedIn && (
                        <div className="border-t border-zinc-800 pt-3 mt-2">
                             <div className="px-4 flex items-center gap-4 mb-5">
                                <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 font-bold border border-zinc-700 text-lg">
                                    {user?.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-white font-bold text-lg">{user?.name}</p>
                                    <p className="text-sm text-zinc-500">{user?.email}</p>
                                </div>
                             </div>
                             
                             <button 
                                onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                                className="w-full text-left block px-4 py-3 rounded-md text-lg font-medium text-red-400 hover:bg-zinc-800 flex items-center gap-3"
                             >
                                <LogOut className="w-5 h-5" /> Keluar
                             </button>
                        </div>
                    )}
                </div>
            </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow w-full">
        {children}
      </main>

      {/* Footer - SITEMAP EXPANDED (DOMESTIKA STYLE) */}
      <footer className="bg-white border-t border-zinc-200 mt-auto pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Sitemap Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                
                {/* Column 1: Categories */}
                <div>
                    <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-4">Categories</h3>
                    <ul className="space-y-2.5">
                        <li><Link to="#" className="text-sm text-zinc-500 hover:text-primary-600 hover:underline">Illustration courses</Link></li>
                        <li><Link to="#" className="text-sm text-zinc-500 hover:text-primary-600 hover:underline">Craft courses</Link></li>
                        <li><Link to="#" className="text-sm text-zinc-500 hover:text-primary-600 hover:underline">Marketing & Business</Link></li>
                        <li><Link to="#" className="text-sm text-zinc-500 hover:text-primary-600 hover:underline">Photography & Video</Link></li>
                        <li><Link to="#" className="text-sm text-zinc-500 hover:text-primary-600 hover:underline">Design courses</Link></li>
                        <li><Link to="#" className="text-sm text-zinc-500 hover:text-primary-600 hover:underline">3D & Animation</Link></li>
                        <li><Link to="#" className="text-sm text-zinc-500 hover:text-primary-600 hover:underline">Architecture & Spaces</Link></li>
                        <li><Link to="#" className="text-sm text-zinc-500 hover:text-primary-600 hover:underline">Writing courses</Link></li>
                        <li><Link to="#" className="text-sm text-zinc-500 hover:text-primary-600 hover:underline">Web & App Design</Link></li>
                        <li><Link to="#" className="text-sm text-zinc-500 hover:text-primary-600 hover:underline">Artificial Intelligence</Link></li>
                    </ul>
                </div>

                {/* Column 2: Areas */}
                <div>
                    <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-4">Areas</h3>
                    <ul className="space-y-2.5">
                        <li><Link to="#" className="text-sm text-zinc-500 hover:text-primary-600 hover:underline">Digital Illustration</Link></li>
                        <li><Link to="#" className="text-sm text-zinc-500 hover:text-primary-600 hover:underline">Drawing courses</Link></li>
                        <li><Link to="#" className="text-sm text-zinc-500 hover:text-primary-600 hover:underline">Graphic Design</Link></li>
                        <li><Link to="#" className="text-sm text-zinc-500 hover:text-primary-600 hover:underline">Fine Arts courses</Link></li>
                        <li><Link to="#" className="text-sm text-zinc-500 hover:text-primary-600 hover:underline">DIY courses</Link></li>
                        <li><Link to="#" className="text-sm text-zinc-500 hover:text-primary-600 hover:underline">Design courses</Link></li>
                        <li><Link to="#" className="text-sm text-zinc-500 hover:text-primary-600 hover:underline">Photography courses</Link></li>
                        <li><Link to="#" className="text-sm text-zinc-500 hover:text-primary-600 hover:underline">Marketing courses</Link></li>
                        <li><Link to="#" className="text-sm text-zinc-500 hover:text-primary-600 hover:underline">Character Design</Link></li>
                    </ul>
                </div>

                {/* Column 3: Software */}
                <div>
                    <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-4">Software</h3>
                    <ul className="space-y-2.5">
                        <li><Link to="#" className="text-sm text-zinc-500 hover:text-primary-600 hover:underline">Adobe Photoshop</Link></li>
                        <li><Link to="#" className="text-sm text-zinc-500 hover:text-primary-600 hover:underline">Adobe Illustrator</Link></li>
                        <li><Link to="#" className="text-sm text-zinc-500 hover:text-primary-600 hover:underline">Procreate courses</Link></li>
                        <li><Link to="#" className="text-sm text-zinc-500 hover:text-primary-600 hover:underline">Adobe After Effects</Link></li>
                        <li><Link to="#" className="text-sm text-zinc-500 hover:text-primary-600 hover:underline">Adobe Lightroom</Link></li>
                        <li><Link to="#" className="text-sm text-zinc-500 hover:text-primary-600 hover:underline">Cinema 4D courses</Link></li>
                        <li><Link to="#" className="text-sm text-zinc-500 hover:text-primary-600 hover:underline">Adobe InDesign</Link></li>
                        <li><Link to="#" className="text-sm text-zinc-500 hover:text-primary-600 hover:underline">ChatGPT courses</Link></li>
                    </ul>
                </div>

                 {/* Column 4: Lists & Extras */}
                <div>
                    <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-4">Lists</h3>
                    <ul className="space-y-2.5">
                        <li><Link to="#" className="text-sm text-zinc-500 hover:text-primary-600 hover:underline flex items-center gap-2"><span className="text-xs">✨</span> New courses</Link></li>
                        <li><Link to="#" className="text-sm text-zinc-500 hover:text-primary-600 hover:underline flex items-center gap-2"><span className="text-xs">⭐</span> Top rated</Link></li>
                        <li><Link to="#" className="text-sm text-zinc-500 hover:text-primary-600 hover:underline flex items-center gap-2"><span className="text-xs">🔥</span> Popular courses</Link></li>
                        <li><Link to="#" className="text-sm text-primary-600 font-bold hover:underline flex items-center gap-2"><span className="text-xs">🏷️</span> Courses on sale</Link></li>
                    </ul>
                    
                    <div className="mt-8 pt-8 border-t border-zinc-100">
                        <p className="text-xs text-zinc-400 mb-4 uppercase tracking-wider">Settings</p>
                        <div className="flex items-center gap-2 text-sm font-bold text-zinc-700 cursor-pointer hover:text-zinc-900">
                            <div className="w-6 h-6 rounded-full bg-zinc-200 flex items-center justify-center text-[10px] border border-zinc-300">Rp</div>
                            Indonesian Rupiah
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Bottom Branding Bar */}
            <div className="pt-8 border-t border-zinc-200 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-3">
                     <div className="bg-zinc-900 text-white p-1.5 rounded-lg">
                        <Layers className="h-5 w-5" />
                     </div>
                     <span className="font-bold text-lg tracking-tight">CatalogiX</span>
                     <span className="text-zinc-300 mx-1">|</span>
                     <span className="text-xs text-zinc-500">&copy; {new Date().getFullYear()} CatalogiX Inc.</span>
                </div>
                <div className="flex gap-6">
                    <Link to="#" className="text-sm text-zinc-500 hover:text-zinc-900">Terms of use</Link>
                    <Link to="#" className="text-sm text-zinc-500 hover:text-zinc-900">Privacy policy</Link>
                    <Link to="#" className="text-sm text-zinc-500 hover:text-zinc-900">Cookies</Link>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
