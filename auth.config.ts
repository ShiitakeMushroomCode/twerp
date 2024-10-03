import type { NextAuthConfig } from 'next-auth';
import { AwaitableExtendedSession } from './next-auth';

export const authConfig = {
  session: {
    strategy: 'jwt',
    maxAge: 15 * 60,
    updateAge: 5 * 60,
  },
  jwt: {
    maxAge: 15 * 60,
  },
  pages: {
    error: '/',
    signIn: '/',
    signOut: '/',
  },
  callbacks: {
    authorized({ auth }) {
      const isAuthenticated = !!auth?.user;
      return isAuthenticated;
    },
    async redirect({ url, baseUrl }) {
      return baseUrl;
    },
    async jwt({ token, user, account, profile }) {
      if (token.exp) {
        token.name = new Date(token.exp * 1000).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
      }
      token.role = '1';
      return token;
    },
    async session({ session, token }: AwaitableExtendedSession) {
      if (session.user) {
        session.jwt = token;
        session.user.company = '1';
      }
      return session;
    },
  },
  providers: [],
  secret: process.env.AUTH_SECRET,
} satisfies NextAuthConfig;
