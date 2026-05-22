const demoProfiles = [
  { name: '토미', x: 72, y: 20, color: 'green' },
  { name: '루나', x: 18, y: 38, color: 'coral' },
  { name: '리버', x: 82, y: 58, color: 'blue' },
  { name: '하리', x: 35, y: 82, color: 'yellow' },
]

function BrandPanel() {
  return (
    <section className="brand-panel" aria-label="크루링 소개">
      <div className="logo-mark" aria-hidden="true">
        <span className="logo-node logo-node-main" />
        <span className="logo-node logo-node-a" />
        <span className="logo-node logo-node-b" />
        <span className="logo-line logo-line-a" />
        <span className="logo-line logo-line-b" />
      </div>

      <p className="eyebrow">Warm Campus Network</p>
      <h1>크루링</h1>
      <p className="brand-copy">우테코 생활 속 접점이 관계 지도로 이어지는 공간</p>

      <div className="mini-map" aria-hidden="true">
        {demoProfiles.map((crew) => (
          <span
            className={`crew-dot crew-dot-${crew.color}`}
            key={crew.name}
            style={{ left: `${crew.x}%`, top: `${crew.y}%` }}
          >
            <span>{crew.name}</span>
          </span>
        ))}
        <span className="me-dot">나</span>
        <span className="map-line line-1" />
        <span className="map-line line-2" />
        <span className="map-line line-3" />
        <span className="map-line line-4" />
      </div>
    </section>
  )
}

export default function AuthShell({
  title,
  description,
  submitLabel,
  switchLabel,
  switchButtonLabel,
  onSwitch,
  onSubmit,
  children,
}) {
  return (
    <main className="auth-page">
      <BrandPanel />

      <section className="auth-card" aria-labelledby="auth-title">
        <div className="auth-heading">
          <span className="app-badge">crewling.app</span>
          <h2 id="auth-title">{title}</h2>
          <p>{description}</p>
        </div>

        <form className="auth-form" onSubmit={onSubmit} noValidate>
          {children}
          <button className="primary-button" type="submit">
            {submitLabel}
          </button>
        </form>

        <div className="auth-switch">
          <span>{switchLabel}</span>
          <button type="button" className="text-button" onClick={onSwitch}>
            {switchButtonLabel}
          </button>
        </div>
      </section>
    </main>
  )
}
