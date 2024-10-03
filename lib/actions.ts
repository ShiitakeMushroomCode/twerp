'use server';

import { signIn, signOut } from '@/auth';
import { loginSchema } from 'types/schema';

const defaultValues = {
  email: '',
  password: '',
};

export async function login(prevState: any, formData: FormData) {
  try {
    const phone_number = formData.get('phone_number');
    const password = formData.get('password');

    const validatedFields = loginSchema.safeParse({
      phone_number: phone_number,
      password: password,
    });

    if (!validatedFields.success) {
      return {
        message: 'validation error',
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    await signIn('credentials', formData);

    return {
      message: 'success',
      errors: {},
    };
  } catch (error) {
    return {
      message: 'credentials error',
      errors: {
        ...defaultValues,
        credentials: 'incorrect email or password',
      },
    };
  }
}

export async function logout() {
  await signOut();
}
