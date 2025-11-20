import React, { useState } from 'react';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { AuthInput } from './AuthInput';
import { AuthButton } from './AuthButton';
import { AuthMessage } from './AuthMessage';

interface AuthFormProps {
  isSignUp: boolean;
  onSubmit: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loading?: boolean;
}

export const AuthForm = ({ isSignUp, onSubmit, loading }: AuthFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // 유효성 검사
    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('유효한 이메일 주소를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await onSubmit(email, password);

      if (result.success) {
        setSuccess(isSignUp ? '회원가입이 완료되었습니다!' : '로그인 성공!');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      } else {
        setError(result.error || '오류가 발생했습니다.');
      }
    } catch (err: any) {
      setError(err.message || '오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Error/Success Messages */}
      {error && <AuthMessage type="error" message={error} />}
      {success && <AuthMessage type="success" message={success} />}

      {/* Email Input */}
      <AuthInput
        label="이메일"
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="your@email.com"
        icon={Mail}
        disabled={isSubmitting || loading}
      />

      {/* Password Input */}
      <AuthInput
        label="비밀번호"
        type="password"
        value={password}
        onChange={setPassword}
        placeholder="••••••••"
        icon={Lock}
        disabled={isSubmitting || loading}
      />

      {/* Confirm Password (Sign Up Only) */}
      {isSignUp && (
        <AuthInput
          label="비밀번호 확인"
          type="password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="••••••••"
          icon={Lock}
          disabled={isSubmitting || loading}
        />
      )}

      {/* Submit Button */}
      <AuthButton
        type="submit"
        variant="primary"
        loading={isSubmitting || loading}
        disabled={isSubmitting || loading}
      >
        <>
          <span>{isSignUp ? '회원가입' : '로그인'}</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </>
      </AuthButton>
    </form>
  );
};
