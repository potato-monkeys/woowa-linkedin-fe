import { useEffect, useState } from 'react'

export default function ProfileModal({ user, onClose, onSave }) {
  const [imageFile, setImageFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(user.profileImageUrl || '')

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(user.profileImageUrl || '')
      return undefined
    }

    const nextPreviewUrl = URL.createObjectURL(imageFile)
    setPreviewUrl(nextPreviewUrl)

    return () => URL.revokeObjectURL(nextPreviewUrl)
  }, [imageFile, user.profileImageUrl])

  const handleSubmit = (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const nextUser = {
      nickname: user.nickname,
      bio: formData.get('bio')?.trim() || user.bio,
      imageFile,
    }

    onSave(nextUser)
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="profile-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-heading">
          <div>
            <p className="eyebrow">My Profile</p>
            <h2 id="profile-modal-title">프로필 수정</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="프로필 수정 닫기">
            ×
          </button>
        </div>

        <form className="profile-form" onSubmit={handleSubmit}>
          <label className="profile-image-uploader">
            <span>프로필 사진</span>
            <div className="profile-image-row">
              <div className="profile-image-preview">
                {previewUrl ? (
                  <img src={previewUrl} alt={`${user.nickname} 프로필 미리보기`} />
                ) : (
                  <span>{user.emoji || user.nickname?.slice(0, 1) || '😎'}</span>
                )}
              </div>
              <div>
                <strong>이미지 선택</strong>
                <p>JPG, PNG 이미지를 업로드할 수 있어요.</p>
                <input
                  name="profileImage"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={(event) => setImageFile(event.target.files?.[0] || null)}
                />
              </div>
            </div>
          </label>

          <label>
            <span>닉네임</span>
            <input
              className="readonly-input"
              name="nickname"
              type="text"
              value={user.nickname}
              readOnly
              aria-readonly="true"
            />
          </label>
          <label>
            <span>한 줄 소개</span>
            <textarea name="bio" defaultValue={user.bio || ''} rows="3" />
          </label>
          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              취소
            </button>
            <button type="submit">저장</button>
          </div>
        </form>
      </section>
    </div>
  )
}
