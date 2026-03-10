/*import NextAuth, { DefaultSession, DefaultUser } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      name: string
      email: string
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    id: string
    role: string
    name: string
    email: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    name: string
  }
}
*/


import type { DefaultSession, DefaultUser } from "next-auth"
import type { Role } from "@/lib/auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: Role
      name: string
      email: string
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    id: string
    role: Role
    name: string
    email: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: Role
    name: string
    email?: string
  }
}