export type ProjectType =
  | 'Mosque'
  | 'House'
  | 'Store'
  | 'School Room'
  | 'Tank'
  | 'Well'
  | 'School'
  | 'Food Aid'
  | 'Markaz'

export type ProjectStatus = 'Pending' | 'On Going' | 'On Hold' | 'Completed' | 'Cancelled'

export type PaymentStatus = 'Pending' | 'Released' | 'Cancelled'

export type AccountType = 'Project Account' | 'Expenses Account' | 'Savings Account'

export type UserRole = 'admin' | 'member'

export interface Project {
  id: string
  project_number: string
  name: string
  donor: string
  type: ProjectType
  area_sqm: number | null
  supervisor: string
  address: string
  batch_number: string
  batch_year: number
  budget: number
  status: ProjectStatus
  has_tank: boolean
  size: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface PaymentRelease {
  id: string
  project_id: string
  check_number: string | null
  voucher_number: string | null
  amount: number
  status: PaymentStatus
  notes: string | null
  released_by: string
  released_at: string | null
  released_date: string | null
  created_at: string
}

export interface Expense {
  id: string
  date: string
  check_number: string
  voucher_number: string
  amount: number
  purpose: string
  requested_by: string
  account_type: AccountType
  status: PaymentStatus
  created_by: string
  created_at: string
}

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  created_at: string
}

export interface ProjectPhase {
  id: string
  project_id: string
  name: string
  created_at: string
}

export interface ProjectFile {
  id: string
  phase_id: string
  file_name: string
  file_path: string
  file_type: string
  file_size: number
  uploaded_by: string
  created_at: string
}

export interface DashboardStats {
  total_projects: number
  active_projects: number
  total_budget: number
  total_released: number
}
