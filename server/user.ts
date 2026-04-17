import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export const authSession = async () => {
  return await auth.api.getSession({
    headers: await headers(),
  });
};

export const authIsNotRequired = async () => {
  const session = await authSession();
  if (session) {
    redirect("/")
  }
}

export const authIsRequired = async () => {
  const session = await authSession();

  if (session == null) {
    redirect("/login");
  }

  return session;

};
