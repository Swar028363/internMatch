import { api } from './api'

export interface Internship {
  id: number
  posted_by: number
  title: string
  description: string
  location: string
  job_type: string
  duration: string | null
  salary: string | null
  skills: string[]
  is_active: boolean
  created_at: string
  updated_at: string | null
}

export interface InternshipFilters {
  location?: string
  job_type?: string
  skill?: string
  search?: string
}

export interface InternshipCreatePayload {
  title: string
  description: string
  location: string
  job_type: string
  duration?: string
  salary?: string
  skills: string[]
}

export type InternshipUpdatePayload = Partial<InternshipCreatePayload & { is_active: boolean }>

function buildQuery(filters: InternshipFilters): string {
  const params = new URLSearchParams()
  if (filters.location) params.set('location', filters.location)
  if (filters.job_type) params.set('job_type', filters.job_type)
  if (filters.skill) params.set('skill', filters.skill)
  if (filters.search) params.set('search', filters.search)
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

export const internshipService = {
  list: (filters: InternshipFilters = {}) =>
    api.get<Internship[]>(`/internships${buildQuery(filters)}`),

  getMine: () =>
    api.get<Internship[]>('/internships/mine'),

  getById: (id: number) =>
    api.get<Internship>(`/internships/${id}`),

  create: (data: InternshipCreatePayload) =>
    api.post<Internship>('/internships', data),

  update: (id: number, data: InternshipUpdatePayload) =>
    api.put<Internship>(`/internships/${id}`, data),

  delete: (id: number) =>
    api.delete<void>(`/internships/${id}`),
}