
import React from 'react';
import { Users, ThumbsUp, ShoppingCart, PlayCircle, BookOpen, Lock } from 'lucide-react';
import { Course } from '../types';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface CourseCardProps {
  course: Course;
  isOwned?: boolean; // Prop baru untuk mengecek status kepemilikan
}

const CourseCard: React.FC<CourseCardProps> = ({ course, isOwned = false }) => {
  const { openLogin } = useAuth();

  // Format Price to IDR currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Handler untuk mencegat klik jika user belum punya akses
  const handleRestrictedClick = (e: React.MouseEvent) => {
      if (!isOwned) {
          e.preventDefault(); // Batalkan navigasi ke halaman player
          openLogin(); // Buka modal login
      }
  };

  return (
    <div className="group bg-white rounded-xl border border-zinc-200 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full overflow-hidden relative">
      
      {/* Thumbnail Section */}
      <div className="relative aspect-[16/10] overflow-hidden bg-zinc-100">
        <Link 
            to={`/course/${course.id}`} 
            onClick={handleRestrictedClick}
        >
            <img 
            src={course.thumbnail} 
            alt={course.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Overlay Play Icon on Hover */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                 <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full">
                     {isOwned ? (
                         <PlayCircle className="w-10 h-10 text-white fill-white/20" />
                     ) : (
                         <Lock className="w-10 h-10 text-white fill-white/20" />
                     )}
                 </div>
            </div>
        </Link>
        
        {/* Badge: Tampilkan 'Dimiliki' jika user sudah punya akses */}
        <div className="absolute top-4 left-4">
             {isOwned ? (
                 <span className="bg-primary-600 text-white text-xs font-bold px-2.5 py-1.5 rounded uppercase tracking-wide shadow-sm flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" /> Terdaftar
                 </span>
             ) : (
                 <span className="bg-yellow-400 text-zinc-900 text-xs font-bold px-2.5 py-1.5 rounded uppercase tracking-wide shadow-sm">
                    Best Seller
                 </span>
             )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-grow">
        <Link 
            to={`/course/${course.id}`} 
            onClick={handleRestrictedClick}
            className="block"
        >
            <h3 className="text-base font-bold text-zinc-900 mb-2 leading-snug group-hover:text-primary-500 transition-colors line-clamp-2">
            {course.title}
            </h3>
        </Link>

        <p className="text-xs text-zinc-500 mb-4">
          Kursus oleh <span className="text-zinc-800 font-medium hover:underline cursor-pointer">{course.instructor}</span>
        </p>

        {/* Description snippet */}
        <p className="text-xs text-zinc-600 line-clamp-2 mb-5 leading-relaxed">
            {course.description}
        </p>
        
        {/* Stats Row */}
        <div className="mt-auto flex items-center text-xs text-zinc-500 gap-5 mb-5">
           <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>{course.studentCount.toLocaleString()}</span>
           </div>
           <div className="flex items-center gap-1.5">
              <ThumbsUp className="w-3.5 h-3.5 text-green-600" />
              <span className="text-green-600 font-medium">{Math.floor(course.rating * 20)}%</span>
           </div>
        </div>

        {/* TAMPILAN BERBEDA: JIKA DIMILIKI VS JIKA BELUM */}
        {isOwned ? (
            /* Layout untuk Siswa Terdaftar */
            <div className="mt-auto">
                <div className="w-full bg-zinc-100 rounded-full h-2 mb-4 overflow-hidden">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '0%' }}></div> {/* Progress Bar Dummy */}
                </div>
                <Link 
                    to={`/course/${course.id}`}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-primary-600 text-white text-sm font-bold rounded-lg transition-all duration-200 shadow-md hover:bg-primary-700 hover:shadow-lg"
                >
                    <PlayCircle className="w-5 h-5" />
                    Lanjutkan Belajar
                </Link>
            </div>
        ) : (
            /* Layout untuk Toko/Storefront (GUEST) */
            <>
                {course.discountPrice && (
                    <div className="flex items-baseline gap-2.5 mb-4">
                        <span className="text-xs text-zinc-400 line-through decoration-zinc-400">
                            {formatPrice(course.price || 0)}
                        </span>
                        <span className="text-lg font-bold text-primary-600">
                            {formatPrice(course.discountPrice)}
                        </span>
                        <span className="text-[10px] text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded">
                            -{(Math.round((((course.price || 0) - course.discountPrice) / (course.price || 1)) * 100))}%
                        </span>
                    </div>
                )}
                
                {/* BUTTON AKSES MATERI DIGANTI LOGIKANYA */}
                <button 
                    onClick={openLogin}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-100 hover:bg-primary-500 text-zinc-700 hover:text-white text-sm font-bold rounded-lg transition-all duration-200 group-hover:shadow-md cursor-pointer"
                >
                    <ShoppingCart className="w-5 h-5" />
                    Akses Materi
                </button>
            </>
        )}

      </div>
    </div>
  );
};

export default CourseCard;
