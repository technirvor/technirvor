import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { connectToDB } from "@/lib/db"
import UserModel from "@/lib/models/user"
import bcrypt from "bcryptjs"
import GitHub from "next-auth/providers/github"

// Extend the Session user type to include id, role, and phone
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      phone?: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectToDB()

        // Find user by email or phone
        const user = await UserModel.findOne({
          $or: [{ email: credentials?.identifier }, { phone: credentials?.identifier }],
        }).select("+password")

        if (!user) {
          throw new Error("No user found with the provided email or phone number.")
        }

        if (!credentials?.password || !user.password) {
          throw new Error("Invalid credentials.")
        }

        const isMatch = await bcrypt.compare(credentials.password, user.password)

        if (!isMatch) {
          throw new Error("Invalid credentials.")
        }

        // Return user object without password
        const { password, ...userWithoutPassword } = user.toObject()
        return userWithoutPassword as any
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role || "user"
        token.phone = (user as any).phone
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.phone = token.phone as string
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
