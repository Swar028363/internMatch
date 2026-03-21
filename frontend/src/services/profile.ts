import { api } from './api'

// Applicant profile
export interface ApplicantProfile {
  id: number
  user_id: number
  first_name: string | null
  middle_name: string | null
  last_name: string | null
  dob: string | null
  gender: string | null
  city: string | null
  state: string | null
  country: string | null
  phone: string | null
  education_level: string | null
  degree_name: string | null
  college_name: string | null
  university_name: string | null
  graduation_year: number | null
  gpa: string | null
  skills: string[]
  headline: string | null
  bio: string | null
  languages_spoken: string[]
  hobbies: string[]
  portfolio_url: string | null
  github_url: string | null
  linkedin_url: string | null
  personal_website: string | null
  profile_completed: boolean
  profile_completion_percentage: number
  created_at: string
  updated_at: string | null
  last_active_at: string | null
}

export type ApplicantProfileUpdate = Partial<
  Omit<ApplicantProfile, 'id' | 'user_id' | 'profile_completed' | 'profile_completion_percentage' | 'created_at' | 'updated_at' | 'last_active_at'>
>

// Recruiter profile
export interface RecruiterProfile {
  id: number
  user_id: number
  company_id: number | null
  first_name: string | null
  middle_name: string | null
  last_name: string | null
  gender: string | null
  profile_photo_url: string | null
  cover_photo_url: string | null
  job_title: string | null
  department: string | null
  years_of_experience: number | null
  bio: string | null
  phone_number: string | null
  linkedin_url: string | null
  github_url: string | null
  twitter_url: string | null
  language_preference: string | null
  profile_completed: boolean
  profile_completion_percentage: number
  created_at: string
  updated_at: string | null
  last_active_at: string | null
}

export type RecruiterProfileUpdate = Partial<
  Omit<RecruiterProfile, 'id' | 'user_id' | 'company_id' | 'profile_completed' | 'profile_completion_percentage' | 'created_at' | 'updated_at' | 'last_active_at'>
>

// Service
export const profileService = {
  // Applicant
  getApplicantProfile: () =>
    api.get<ApplicantProfile>('/applicant/profile'),

  updateApplicantProfile: (data: ApplicantProfileUpdate) =>
    api.put<ApplicantProfile>('/applicant/profile', data),

  getApplicantProfileById: (userId: number) =>
    api.get<ApplicantProfile>(`/applicant/profile/${userId}`),

  // Recruiter
  getRecruiterProfile: () =>
    api.get<RecruiterProfile>('/recruiter/profile'),

  updateRecruiterProfile: (data: RecruiterProfileUpdate) =>
    api.put<RecruiterProfile>('/recruiter/profile', data),
}