
import { Course } from './types';

// Ganti email ini dengan email kamu sendiri untuk menjadi "Super Admin"
export const ADMIN_EMAILS = ['admin@catalogix.com', 'owner@gmail.com'];

// --- DATABASE: FIREBASE (ACTIVE) ---
// Config ada di file: firebaseConfig.ts

// --- GOOGLE SHEETS CONFIG (OPTIONAL) ---
export const GOOGLE_SHEET_CSV_URL = "";
export const GOOGLE_SHEET_USERS_CSV_URL = "";
export const GOOGLE_SCRIPT_URL = "";

export const CATEGORIES = [
  "Semua", 
  "AI Tools",
  "Productivity",
  "No-Code",
  "Business"
];

// --- DATA DUMMY (FALLBACK) ---
export const COURSES: Course[] = [
  {
    id: 'c1', 
    title: 'Bikin Tools AI Sendiri Tanpa Coding (Rahasia Bongkar Dapur)',
    description: 'Pelajari cara membuat tools AI canggih menggunakan teknologi terbaru tanpa perlu keahlian coding. Panduan langkah demi langkah dari nol.',
    thumbnail: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=800&auto=format&fit=crop', // AI/Tech Image
    instructor: 'Admin CatalogiX',
    instructorAvatar: 'https://i.pravatar.cc/150?u=admin',
    totalDuration: '3 Jam',
    rating: 5.0,
    studentCount: 850,
    level: 'Pemula',
    price: 1200000,
    discountPrice: 99000,
    tags: ['AI Tools', 'No-Code'],
    modules: [
      {
        id: 'm1',
        title: 'BAB 1: Mindset & Persiapan',
        lessons: [
          {
            id: 'l1',
            title: 'Kenapa Harus Jadi Creator?',
            duration: '05:00',
            videoUrl: 'https://www.youtube.com/watch?v=ScMzIvxBSi4', 
            description: 'Pengantar mengenai pentingnya bertransformasi menjadi pembuat solusi digital.',
            isCompleted: false
          }
        ]
      }
    ]
  }
];

// Saran Hosting Video untuk Rekaman Layar
export const HOSTING_ADVICE = [
  {
    title: "YouTube (Unlisted) - REKOMENDASI",
    description: "Paling Pas untuk Awal. Gratis, server kencang, teks di layar terbaca jelas. Setting 'Unlisted' agar tidak muncul di pencarian publik.",
    icon: "Youtube"
  },
  {
    title: "Bunny.net - OPSI PRO",
    description: "Gunakan ini jika kursus sudah ramai ($1/bulan). Video aman, tidak bisa didownload (DRM), dan buffering cepat.",
    icon: "Rabbit"
  }
];
