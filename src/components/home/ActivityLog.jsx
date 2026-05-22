import { initialActivityLogs } from '../../data/mockData.js'

export default function ActivityLog() {
  return (
    <div className="activity-log-card side-card">
      <div className="side-card-header">
        <h2>📜 활동 로그</h2>
        <button type="button" className="more-link-btn">
          더보기 <span>❯</span>
        </button>
      </div>

      <div className="activity-log-list">
        {initialActivityLogs.map((log) => (
          <div className="activity-log-item" key={log.id}>
            <div className={`activity-log-avatar type-${log.type}`}>
              <span>{log.emoji}</span>
            </div>
            <div className="activity-log-content">
              <strong className="log-text">
                <span className="crew-name">{log.crewName}님</span>과의 {log.activity}
              </strong>
              <p className="log-desc">{log.description}</p>
            </div>
            <span className="log-time">{log.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
