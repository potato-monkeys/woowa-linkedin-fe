import { useState } from 'react';
import AuthShell from '../components/AuthShell.jsx';
import { userApi } from '../api/user.js';

export default function LoginPage({ onNavigate }) {
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nickname = formData.get('nickname')?.trim();
    const password = formData.get('password')?.trim();

    if (!nickname || !password) {
      setError('닉네임 또는 비밀번호를 확인해주세요.');
      return;
    }

    try {
      const response = await userApi.login(nickname, password);
      const token =
        typeof response === 'string' ? response : response?.accessToken;

      if (token) {
        window.localStorage.setItem('crewling-token', token);
      } else {
        throw new Error('인증 토큰을 받을 수 없습니다.');
      }

      if (response && response.user) {
        window.localStorage.setItem(
          'crewling-user',
          JSON.stringify(response.user),
        );
      }

      onNavigate('/app/home');
    } catch (err) {
      setError(
        err.message ||
          '로그인에 실패했습니다. 닉네임과 비밀번호를 확인해주세요.',
      );
    }
  };

  return (
    <AuthShell
      title="오늘 누구와 연결해볼까요?"
      description="닉네임과 비밀번호로 빠르게 들어가요."
      submitLabel="시작하기"
      switchLabel="처음이라면"
      switchButtonLabel="가입하기"
      onSwitch={() => onNavigate('/signup')}
      onSubmit={handleSubmit}
    >
      <label>
        <span>닉네임</span>
        <input
          name="nickname"
          type="text"
          autoComplete="username"
          placeholder="예: 해나"
          required
          minLength={2}
        />
      </label>

      <label>
        <span>비밀번호</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="비밀번호 입력"
          required
          minLength={4}
        />
      </label>

      <p className="form-error" role="alert" aria-live="polite">
        {error}
      </p>
    </AuthShell>
  );
}
