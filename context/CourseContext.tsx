
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Course } from '../types';
import { COURSES as INITIAL_COURSES } from '../constants';
import { fetchCoursesFromFirebase, saveCourseToFirebase, deleteCourseFromFirebase } from '../services/firebaseService';

interface CourseContextType {
  courses: Course[];
  isLoading: boolean;
  addCourse: (course: Course) => Promise<boolean>;
  updateCourse: (course: Course) => Promise<boolean>;
  deleteCourse: (id: string) => Promise<boolean>;
  getCourse: (id: string) => Course | undefined;
  isAdminMode: boolean;
  toggleAdminMode: () => void;
  refreshCourses: () => Promise<void>;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export const CourseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Load courses on mount
  const loadCourses = async () => {
    setIsLoading(true);
    const dbCourses = await fetchCoursesFromFirebase();
    if (dbCourses.length > 0) {
      setCourses(dbCourses);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const refreshCourses = async () => {
      await loadCourses();
  }

  const addCourse = async (newCourse: Course) => {
    // 1. Optimistic Update
    setCourses((prev) => [newCourse, ...prev]);
    // 2. Firebase
    const success = await saveCourseToFirebase(newCourse);
    return success;
  };

  const updateCourse = async (updatedCourse: Course) => {
      // 1. Optimistic Update
      setCourses((prev) => prev.map(c => c.id === updatedCourse.id ? updatedCourse : c));
      // 2. Firebase (saveCourse works for update too because it uses setDoc)
      const success = await saveCourseToFirebase(updatedCourse);
      return success;
  };

  const deleteCourse = async (id: string) => {
      // 1. Optimistic Update
      setCourses((prev) => prev.filter(c => c.id !== id));
      // 2. Firebase
      const success = await deleteCourseFromFirebase(id);
      return success;
  };

  const getCourse = (id: string) => {
    return courses.find(c => c.id === id);
  };

  const toggleAdminMode = () => {
    setIsAdminMode(prev => !prev);
  };

  return (
    <CourseContext.Provider value={{ courses, isLoading, addCourse, updateCourse, deleteCourse, getCourse, isAdminMode, toggleAdminMode, refreshCourses }}>
      {children}
    </CourseContext.Provider>
  );
};

export const useCourses = () => {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourses must be used within a CourseProvider');
  }
  return context;
};
