export interface StaffTraining {
  id: string
  staff_id: string
  skill_name: string
  progress: number
  certified: boolean
  certification_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface StaffWithTraining {
  id: string
  name: string
  position: string
  role: string
  trainings: StaffTraining[]
  overallProgress: number
}

export interface CertificationRecord {
  id: string
  staff_name: string
  skill_name: string
  certification_date: string
  notes: string | null
}
