'use client';

import { Box, useTheme } from '@mui/material';
import { useRouter } from 'next/navigation';
import {
  CAuthPage,
  type AuthForgotPasswordPayload,
  type AuthLoginPayload,
  type AuthRegisterPayload,
  useAuthPage,
} from 'orbcafe-ui';

const HeaderBrandLogo = () => {
  const theme = useTheme();
  const src = theme.palette.mode === 'dark' ? '/LOGO3.png' : '/LOGO2.png';

  return (
    <Box
      component="img"
      src={src}
      alt="ORBCAFE UI"
      sx={{ width: 260, maxWidth: '72vw', height: 48, display: 'block', objectFit: 'contain' }}
    />
  );
};

export default function AuthExampleClient() {
  const router = useRouter();

  const handleLogin = async (payload: AuthLoginPayload) => {
    console.log('Demo login payload', payload);
    router.push('/std-report');
  };

  const handleRegister = async (payload: AuthRegisterPayload) => {
    console.log('Demo register payload', payload);
  };

  const handleForgotPassword = async (payload: AuthForgotPasswordPayload) => {
    console.log('Demo forgot password payload', payload);
  };

  const auth = useAuthPage({
    onLogin: handleLogin,
    onRegister: handleRegister,
    onForgotPassword: handleForgotPassword,
  });

  return (
    <CAuthPage
      {...auth.authPageProps}
      logo={<HeaderBrandLogo />}
      copy={{
        productName: 'ORBCAFE UI',
        headline: 'Examples workspace',
        subheadline: 'Sign in to inspect the reusable ORBCAFE UI modules for reports, planning, pad workflows, and agent interfaces.',
      }}
    />
  );
}
