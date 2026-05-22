import { useState } from 'react'
import AuthShell from '../components/AuthShell.jsx'

export default function SignupPage({ onNavigate }) {
  const [error, setError] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const nickname = formData.get('nickname')?.trim()
    const password = formData.get('password')?.trim()
    const passwordConfirm = formData.get('passwordConfirm')?.trim()

    if (!nickname || !password) {
      setError('닉네임 또는 비밀번호를 확인해주세요.')
      return
    }

    if (password !== passwordConfirm) {
      setError('비밀번호가 서로 달라요.')
      return
    }

    window.localStorage.setItem(
      'crewling-user',
      JSON.stringify({
        nickname,
        bio: formData.get('bio')?.trim() || '함께 연결을 만들어가고 있어요',
      }),
    )
    onNavigate('/app/home')
  }

  return (
    <AuthShell
      title="처음 만나는 크루링"
      description="닉네임만 정하면 바로 관계 지도를 시작할 수 있어요."
      submitLabel="가입하기"
      switchLabel="이미 계정이 있다면"
      switchButtonLabel="로그인으로 이동"
      onSwitch={() => onNavigate('/login')}
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
          autoComplete="new-password"
          placeholder="비밀번호 입력"
          required
          minLength={4}
        />
      </label>

      <label>
        <span>비밀번호 확인</span>
        <input
          name="passwordConfirm"
          type="password"
          autoComplete="new-password"
          placeholder="한 번 더 입력"
          required
          minLength={4}
        />
      </label>

      <label>
        <span>한 줄 소개</span>
        <input name="bio" type="text" autoComplete="off" placeholder="예: 산책과 커피를 좋아해요" />
      </label>

      <p className="form-error" role="alert" aria-live="polite">
        {error}
      </p>
    </AuthShell>
  )
}
