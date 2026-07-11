import { RegisterForm } from '@/components/auth/RegisterForm';

// Mock account registration — account-first signup. No real credential is
// stored. See RegisterForm / lib/authStore.tsx (TRD Q18 auth seam).
export default function RegisterPage() {
  return <RegisterForm />;
}
