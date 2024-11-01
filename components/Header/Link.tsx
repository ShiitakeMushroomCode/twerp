import { Link as MuiLink, LinkProps as MuiLinkProps } from '@mui/material';
import NextLink, { LinkProps as NextLinkProps } from 'next/link';
import * as React from 'react';

// Next.js Link와 MUI Link의 속성 결합
type CombinedLinkProps = Omit<NextLinkProps, 'href'> &
  Omit<MuiLinkProps, 'href'> & {
    href: NextLinkProps['href'];
  };

// 커스텀 Link 컴포넌트 생성
const Link = React.forwardRef<HTMLAnchorElement, CombinedLinkProps>((props, ref) => {
  const { href, ...other } = props;

  return (
    <NextLink href={href} passHref legacyBehavior>
      <MuiLink ref={ref} {...other} />
    </NextLink>
  );
});

Link.displayName = 'Link';

export default Link;
