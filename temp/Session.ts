export default function getSession() {
  const sesstion = {
    user: {
      name: '회사원',
      email: 'officeworker@gmail.com',
      company: '회사',
      phone: '010-1234-5678',
    },
    expires: '2024-10-01T15:42:27.095Z',
    jwt: {
      sub: '1',
      role: '1',
      iat: 1727796446,
      exp: 1727797346,
      jti: '4c102b83-5bc3-4463-bfb2-67bd4c97e943',
    },
  };
  return sesstion;
}
