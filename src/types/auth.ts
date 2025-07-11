export interface User {
  name: string
  email: string
  username: string
  role: string
  groups: string[]
}

export interface KeycloakTokenParsed {
  name: string
  email: string
  groups: string[]
  exp: number
  iat: number
}

export type UserRole = "admin" | "desk-manager" | "USER_ROLE" | "TEAM_MEMBER_ROLE"
