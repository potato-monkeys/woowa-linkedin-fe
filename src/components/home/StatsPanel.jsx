export default function StatsPanel({ relationsCount }) {
  const stats = [
    {
      id: 'network',
      value: 5, // Match mockup "5"
      label: '이번 주 새 연결',
      icon: (
        <svg className="stat-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      colorClass: 'green-theme',
    },
    {
      id: 'activity',
      value: '밥', // Match mockup "밥"
      label: '가장 많은 활동',
      icon: (
        <svg className="stat-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
      iconReplacement: (
        // Fork & Spoon / Knife icon style
        <svg className="stat-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      ),
      // Wait, let's write a simple clean meal icon:
      iconSvg: (
        <svg className="stat-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 20V4M6 20V4M10 4v10a4 4 0 0 0 8 0V4" />
          <line x1="14" y1="4" x2="14" y2="18" />
        </svg>
      ),
      colorClass: 'orange-theme',
    },
    {
      id: 'messages',
      value: 18, // Match mockup "18"
      label: '아직 가까워질 크루',
      icon: (
        <svg className="stat-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      colorClass: 'blue-theme',
    },
  ]

  return (
    <div className="stats-panel-row">
      {stats.map((stat) => (
        <div className={`stat-card ${stat.colorClass}`} key={stat.id}>
          <div className="stat-icon-wrapper">
            {stat.id === 'activity' ? stat.iconSvg : stat.icon}
          </div>
          <div className="stat-details">
            <span className="stat-label">{stat.label}</span>
            <strong className="stat-value">{stat.value}</strong>
          </div>
        </div>
      ))}
    </div>
  )
}
