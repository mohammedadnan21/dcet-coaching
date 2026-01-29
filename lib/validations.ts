import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  role: z.enum(["TEACHER", "STUDENT"]),
});

export const verifyOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export const setPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const subjectSchema = z.object({
  name: z.string().min(2, "Subject name must be at least 2 characters"),
  description: z.string().optional(),
});

export const videoSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional(),
  youtubeUrl: z.string().url("Invalid YouTube URL"),
  subjectId: z.string().min(1, "Subject is required"),
});

export const meetingSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional(),
  zoomLink: z.string().url("Invalid Zoom link"),
  scheduledAt: z.string().min(1, "Schedule time is required"),
});

export const questionSchema = z.object({
  content: z.string().min(10, "Question must be at least 10 characters"),
  visibility: z.enum(["PUBLIC", "PRIVATE_ADMIN", "PRIVATE_TEACHER"]),
  targetId: z.string().optional(),
});

export const mcQuestionSchema = z.object({
  question: z.string().min(5, "Question must be at least 5 characters"),
  optionA: z.string().min(1, "Option A is required"),
  optionB: z.string().min(1, "Option B is required"),
  optionC: z.string().min(1, "Option C is required"),
  optionD: z.string().min(1, "Option D is required"),
  correctOption: z.enum(["A", "B", "C", "D"]),
  marks: z.number().min(1).default(1),
});

export const mockTestSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional(),
  subjectId: z.string().min(1, "Subject is required"),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  showRanking: z.boolean().default(false),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type SetPasswordInput = z.infer<typeof setPasswordSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SubjectInput = z.infer<typeof subjectSchema>;
export type VideoInput = z.infer<typeof videoSchema>;
export type MeetingInput = z.infer<typeof meetingSchema>;
export type QuestionInput = z.infer<typeof questionSchema>;
export type MCQuestionInput = z.infer<typeof mcQuestionSchema>;
export type MockTestInput = z.infer<typeof mockTestSchema>;
