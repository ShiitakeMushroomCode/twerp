import 'next-auth';
import { User } from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';

export type ExtendedJWT = DefaultJWT & {
  role?: string;
};
export type ExtendedAdapter = User & {
  id?: number;
  company?: string;
  role?: string;
};

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user?: ExtendedAdapter;
    jwt?: ExtendedJWT;
  }
}

export type ExtendedSession = Session & {
  jwt?: ExtendedJWT;
};
export type AwaitableExtendedSession = Awaitable<ExtendedSession | DefaultSession>;
