export interface Staff {
  id: string
  name: string
  position: string
  email: string
  phone: string
  joinDate: string
  status: "active" | "inactive"
  role: "manager" | "chef" | "hall" | "staff" // "part-time" を "staff" に変更
  skills: string[]
}

export interface StaffFormValues {
  name: string
  position: string
  email: string
  phone: string
  joinDate: string
  status: "active" | "inactive"
  role: "manager" | "chef" | "hall" | "staff" // "part-time" を "staff" に変更
  skills: string[]
}
