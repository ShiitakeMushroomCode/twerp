import { z } from 'zod';

export const loginSchema = z.object({
  phone_number: z
    .string()
    .trim()
    .min(1, { message: '전화번호가 필요합니다!' })
    .regex(/^(010)-\d{4}-\d{4}$/, { message: '유효하지 않은 전화번호 형식입니다. (010-####-####)' }),
  password: z
    .string()
    .trim()
    .min(1, { message: 'Password required!' })
    .min(8, { message: 'Password must have at least 8 characters!' }),
});
