// Role types
export type Role = "ADMIN" | "TEACHER" | "STUDENT";

// User status types
export type UserStatus = "PENDING" | "APPROVED" | "REJECTED";

// Question visibility types
export type QuestionVisibility = "PUBLIC" | "PRIVATE_ADMIN" | "PRIVATE_TEACHER";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
}

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  status: UserStatus;
  isVerified: boolean;
  createdAt: Date;
}

export interface SubjectWithVideos {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  videos: {
    id: string;
    title: string;
    youtubeUrl: string;
  }[];
}

export interface MeetingWithHost {
  id: string;
  title: string;
  description: string | null;
  zoomLink: string;
  scheduledAt: Date;
  cancelled: boolean;
  cancelReason: string | null;
  host: {
    id: string;
    name: string;
    role: Role;
  };
}

export interface TestWithQuestions {
  id: string;
  title: string;
  description: string | null;
  duration: number;
  showRanking: boolean;
  questions: {
    id: string;
    question: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    marks: number;
  }[];
}

export interface TestResult {
  testId: string;
  oderId: string;
  userName: string;
  score: number;
  totalMarks: number;
  rank?: number;
  completedAt: Date | null;
}

export interface QuestionWithAnswers {
  id: string;
  content: string;
  visibility: QuestionVisibility;
  createdAt: Date;
  askedBy: {
    id: string;
    name: string;
  };
  target: {
    id: string;
    name: string;
  } | null;
  answers: {
    id: string;
    content: string;
    createdAt: Date;
    answerer: {
      id: string;
      name: string;
      role: Role;
    };
  }[];
}

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  pendingApprovals: number;
  totalSubjects: number;
  totalVideos: number;
  upcomingMeetings: number;
  activeTests: number;
}
