export default function ProfileModal({ user, onClose, onSave }) {
  const handleSubmit = (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const nextUser = {
      nickname: formData.get('nickname')?.trim() || user.nickname,
      bio: formData.get('bio')?.trim() || user.bio,
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
          <label>
            <span>닉네임</span>
            <input name="nickname" type="text" defaultValue={user.nickname} />
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
