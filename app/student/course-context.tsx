"use client";

import { createContext } from "react";

export interface StudentCourse {
  id:        string;
  code:      string;
  name:      string;
  semester?: string;
  credits?:  number;
}

interface CourseCtx {
  selectedCourse:    StudentCourse | null;
  setSelectedCourse: (course: StudentCourse | null) => void;
  markNotifRead:     (courseId: string) => void;
}

export const CourseContext = createContext<CourseCtx>({
  selectedCourse:    null,
  setSelectedCourse: () => {},
  markNotifRead:     () => {},
});
