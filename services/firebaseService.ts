
import { db } from '../firebaseConfig';
import { collection, getDocs, addDoc, setDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { Course, User } from '../types';
import { COURSES as DEFAULT_COURSES } from '../constants';

const COURSES_COLLECTION = 'courses';
const USERS_COLLECTION = 'users';

// --- COURSES ---

export const fetchCoursesFromFirebase = async (): Promise<Course[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COURSES_COLLECTION));
    const courses: Course[] = [];
    
    querySnapshot.forEach((doc) => {
      // Menggabungkan data dari firestore dengan ID dokumen
      courses.push(doc.data() as Course);
    });

    if (courses.length === 0) {
        return DEFAULT_COURSES; // Fallback jika DB kosong
    }
    
    return courses;
  } catch (error) {
    console.error("Error fetching courses from Firebase:", error);
    // Kembalikan default jika config firebase belum diisi user
    return DEFAULT_COURSES;
  }
};

export const saveCourseToFirebase = async (course: Course): Promise<boolean> => {
  try {
    await setDoc(doc(db, COURSES_COLLECTION, course.id), course);
    return true;
  } catch (error) {
    console.error("Error saving course to Firebase:", error);
    alert("Gagal menyimpan ke Firebase. Pastikan Config API KEY sudah benar di firebaseConfig.ts");
    return false;
  }
};

export const deleteCourseFromFirebase = async (courseId: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, COURSES_COLLECTION, courseId));
    return true;
  } catch (error) {
    console.error("Error deleting course:", error);
    return false;
  }
};

// --- USERS ---

export const fetchUsersFromFirebase = async (): Promise<User[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, USERS_COLLECTION));
    const users: User[] = [];
    
    querySnapshot.forEach((doc) => {
      // PENTING: Kita simpan ID dokumen asli ke property 'docId'
      // agar nanti bisa dihapus dengan tepat.
      const userData = doc.data() as User;
      users.push({
          ...userData,
          docId: doc.id 
      });
    });

    return users;
  } catch (error) {
    console.error("Error fetching users from Firebase:", error);
    return [];
  }
};

export const addUserToFirebase = async (user: User): Promise<boolean> => {
    try {
        // Kita paksa ID dokumennya menjadi Email agar mudah dilacak
        // Namun fungsi fetchUsers di atas tetap akan menghandle jika ID-nya acak
        const normalizedEmail = user.email.toLowerCase().trim();
        await setDoc(doc(db, USERS_COLLECTION, normalizedEmail), user);
        return true;
    } catch (error) {
        console.error("Error adding user:", error);
        return false;
    }
};

// Update Parameter: Menerima docId optional
export const deleteUserFromFirebase = async (email: string, docId?: string): Promise<{ success: boolean; message?: string }> => {
    try {
        // PRIORITAS 1: Hapus menggunakan ID Dokumen Asli (Paling Akurat)
        if (docId) {
            console.log(`[FIREBASE DELETE] Menghapus via docId: ${docId}`);
            await deleteDoc(doc(db, USERS_COLLECTION, docId));
            return { success: true };
        }

        // PRIORITAS 2: Hapus menggunakan Email sebagai ID (Fallback)
        const normalizedEmail = email.toLowerCase().trim();
        console.log(`[FIREBASE DELETE] Mencoba menghapus via Email ID: ${normalizedEmail}`);
        
        // Cek dulu apakah dokumen dengan ID email ini ada?
        // (Ini trik agar deleteDoc tidak return success palsu)
        // Tapi deleteDoc memang void, jadi kita coba delete saja.
        await deleteDoc(doc(db, USERS_COLLECTION, normalizedEmail));

        // PRIORITAS 3: Hapus via Query (Jika ID-nya acak dan docId tidak diberikan)
        // Ini pembersihan ganda untuk memastikan data benar-benar hilang
        const q = query(collection(db, USERS_COLLECTION), where("email", "==", normalizedEmail));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
             console.log(`[FIREBASE DELETE] Ditemukan sisa data via Query Email. Membersihkan...`);
             const deletePromises = querySnapshot.docs.map(d => deleteDoc(d.ref));
             await Promise.all(deletePromises);
        }

        return { success: true };
    } catch (error: any) {
        console.error("Error deleting user:", error);
        return { success: false, message: error.message || "Terjadi kesalahan sistem." };
    }
};
