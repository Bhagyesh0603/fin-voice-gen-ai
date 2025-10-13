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
    async jwt({ token, user, account, profile }) {
      // Handle Google OAuth user creation/update
      if (account?.provider === 'google' && user) {
        try {
          await connectDB()
          
          // Check if user exists in our database
          let dbUser = await User.findOne({ email: user.email })
          
          if (!dbUser) {
            // Create new user
            dbUser = await User.create({
              name: user.name || 'FinVoice User',
              email: user.email!,
              avatar: user.image,
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
            console.log('✅ Created new Google user:', dbUser.email)
          } else {
            // Update existing user
            await User.findByIdAndUpdate(dbUser._id, {
              name: user.name || dbUser.name,
              avatar: user.image || dbUser.avatar,
              lastActive: new Date()
            })
            console.log('✅ Updated existing Google user:', dbUser.email)
          }
          
          // Store database user ID in token
          token.id = dbUser._id.toString()
          token.dbUser = {
            id: dbUser._id.toString(),
            email: dbUser.email,
            name: dbUser.name,
            avatar: dbUser.avatar
          }
        } catch (error) {
          console.error('❌ Error in JWT callback for Google user:', error)
        }
      }
      
      // For credentials provider, user is already handled in authorize
      if (user && !account) {
        token.id = user.id
      }
      
      return token
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string
      }
      
      // If we have stored db user info, use it
      if (token?.dbUser) {
        session.user = {
          ...session.user,
          ...token.dbUser
        }
      }
      
      return session
    },
    async signIn({ user, account, profile }) {
      // Always allow sign in - user creation is handled in JWT callback
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