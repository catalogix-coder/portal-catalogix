
export interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl: string; // URL to the video source
  description: string;
  isCompleted: boolean;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  instructor: string;
  instructorAvatar?: string;
  totalDuration: string;
  rating: number;
  studentCount: number;
  level: 'Pemula' | 'Menengah' | 'Lanjut';
  price?: number;
  discountPrice?: number;
  modules: Module[];
  tags: string[];
}

export interface Message {
  role: 'user' | 'model';
  text: string;
}

export interface User {
  docId?: string; // ID Dokumen asli dari Firestore (misal: "8djA9s...")
  name: string;
  email: string;
  avatar: string;
  role: 'student' | 'instructor';
  accessList: string[]; // List of Course IDs this user can access
}
