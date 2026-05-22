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
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        >
          <line
            x1="9"
            y1="49"
            x2="47"
            y2="33"
            stroke="var(--primary)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <line
            x1="47"
            y1="33"
            x2="81"
            y2="11"
            stroke="#b4c7be"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </svg>
        <span className="logo-node logo-node-main" style={{ zIndex: 2 }} />
        <span className="logo-node logo-node-a" style={{ zIndex: 2 }} />
        <span className="logo-node logo-node-b" style={{ zIndex: 2 }} />
      </div>

      <p className="eyebrow">Warm Campus Network</p>
      <h1>크루링</h1>
      <p className="brand-copy">우테코 생활 속 접점이 관계 지도로 이어지는 공간</p>

      <div className="mini-map" aria-hidden="true">
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1,
            opacity: 0.92,
          }}
        >
          {demoProfiles.map((crew) => {
            const colors = {
              green: 'var(--primary)',
              coral: 'var(--accent-coral)',
              blue: 'var(--accent-blue)',
              yellow: 'var(--accent-yellow)',
            }
            return (
              <line
                key={crew.name}
                x1="50%"
                y1="50%"
                x2={`${crew.x}%`}
                y2={`${crew.y}%`}
                stroke={colors[crew.color]}
                strokeWidth="8"
                strokeLinecap="round"
              />
            )
          })}
        </svg>

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
