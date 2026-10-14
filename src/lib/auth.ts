import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@printcraft3d.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'AdminPrintcraft2026!';
const ADMIN_PIN = process.env.ADMIN_PIN || '9876';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
  },
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        pin: { label: 'Admin PIN', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        // Admin PIN quick login
        if (credentials.pin && credentials.pin === ADMIN_PIN) {
          return {
            id: 'admin-pin-user',
            name: 'Head Engineer (Admin)',
            email: ADMIN_EMAIL,
            role: 'ADMIN',
          };
        }

        // Admin email & password login
        if (
          credentials.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
          credentials.password === ADMIN_PASSWORD
        ) {
          return {
            id: 'admin-master-user',
            name: 'PrintCraft Operator (Admin)',
            email: ADMIN_EMAIL,
            role: 'ADMIN',
          };
        }

        // Standard customer email authentication
        if (credentials.email) {
          const email = credentials.email.trim().toLowerCase();
          const name = email.split('@')[0];
          return {
            id: `usr_${Buffer.from(email).toString('hex').slice(0, 10)}`,
            name: name.charAt(0).toUpperCase() + name.slice(1),
            email: email,
            role: 'USER',
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role || (token.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? 'ADMIN' : 'USER');
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role || (session.user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? 'ADMIN' : 'USER');
      }
      return session;
    },
  },
};
