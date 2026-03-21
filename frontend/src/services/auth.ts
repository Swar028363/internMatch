import { api } from './api'

export interface TokenResponse {
  access_token: string
  token_type: string
}

export interface MessageResponse {
  message: string
}

export interface MeResponse {
  id: number
  email: string
  role: 'applicant' | 'recruiter'
}

export const authService = {
  // Step 1 - sends OTP, does NOT create account yet
  register: (payload: { email: string; password: string; role: 'applicant' | 'recruiter' }) =>
    api.post<MessageResponse>('/auth/register', payload),

  // Step 2 - verifies OTP, creates account, returns token
  verifyOtp: (payload: { email: string; otp: string }) =>
    api.post<TokenResponse>('/auth/verify-otp', payload),

  // Resend OTP for registration or password reset
  resendOtp: (payload: { email: string; purpose: 'verify' | 'reset' }) =>
    api.post<MessageResponse>('/auth/resend-otp', payload),

  login: (payload: { email: string; password: string }) =>
    api.post<TokenResponse>('/auth/login', payload),

  forgotPassword: (payload: { email: string }) =>
    api.post<MessageResponse>('/auth/forgot-password', payload),

  resetPassword: (payload: { email: string; otp: string; new_password: string }) =>
    api.post<MessageResponse>('/auth/reset-password', payload),

  getMe: () => api.get<MeResponse>('/users/me'),
}