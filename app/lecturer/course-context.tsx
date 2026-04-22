"use client";

import { createContext } from "react";

export interface LecturerCourse {
  id:        string;
  code:      string;
  name:      string;
  semester?: string;
  credits?:  number;
}

interface CourseCtx {
  selectedCourse:    LecturerCourse | null;
  setSelectedCourse: (course: LecturerCourse | null) => void;
}

export const CourseContext = createContext<CourseCtx>({
  selectedCourse:    null,
  setSelectedCourse: () => {},
});
