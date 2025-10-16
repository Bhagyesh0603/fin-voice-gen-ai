import NextAuth, { NextAuthOptions, User as NextAuthUser } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongodb'
import { User } from '@/lib/models'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        name: { label: 'Name', type: 'text' },
        isRegister: { label: 'Is Register', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        await connectDB()

        try {
          if (credentials.isRegister === 'true') {
            // Registration logic
            const existingUser = await User.findOne({ email: credentials.email })
            if (existingUser) {
              throw new Error('User already exists with this email')
            }

            const hashedPassword = await bcrypt.hash(credentials.password, 12)
            const newUser = await User.create({
              name: credentials.name || 'FinVoice User',
              email: credentials.email,
              password: hashedPassword,
              preferences: {
                currency: 'INR',
                language: 'en',
                notifications: true,
                voiceEnabled: true
              },
              financialProfile: {
                riskTolerance: 'medium',
                financialGoals: []
              }
            })

            return {
              id: newUser._id.toString(),
              email: newUser.email,
              name: newUser.name,
              image: newUser.avatar
            }
          } else {
            // Login logic
            const user = await User.findOne({ email: credentials.email })
            if (!user || !user.password) {
              throw new Error('Invalid email or password')
            }

            const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
            if (!isPasswordValid) {
              throw new Error('Invalid email or password')
            }

            // Update last active
            await User.findByIdAndUpdate(user._id, { lastActive: new Date() })

            return {
              id: user._id.toString(),
              email: user.email,
              name: user.name,
              image: user.avatar
            }
          }
        } catch (error: any) {
          throw new Error(error.message || 'Authentication failed')
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in - add user ID to token
      if (user) {
        token.id = user.id
      }
      
      // Handle Google OAuth user creation/update
      if (account?.provider === 'google') {
        try {
          await connectDB()
          
          // Check if user exists in our database
          let dbUser = await User.findOne({ email: token.email })
          
          if (!dbUser) {
            // Create new user
            dbUser = await User.create({
              name: token.name || 'FinVoice User',
              email: token.email!,
              avatar: token.picture,
              provider: account.provider,
              providerId: account.providerAccountId,
              preferences: {
                currency: 'INR',
                language: 'en',
                notifications: true,
                voiceEnabled: true
              },
              financialProfile: {
                riskTolerance: 'medium',
                financialGoals: []
              }
            })
          } else {
            // Update existing user
            await User.findByIdAndUpdate(dbUser._id, {
              name: token.name || dbUser.name,
              avatar: token.picture || dbUser.avatar,
              lastActive: new Date()
            })
          }
          
          // Store database user ID in token
          token.id = dbUser._id.toString()
        } catch (error) {
          console.error('Error in JWT callback:', error)
        }
      }
      
      return token
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string
      }
      if (token?.email) {
        session.user.email = token.email
      }
      if (token?.name) {
        session.user.name = token.name
      }
      if (token?.picture) {
        session.user.image = token.picture
      }
      
      return session
    },
    async signIn({ user, account }) {
      // Always allow sign in
      return true
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development'
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }