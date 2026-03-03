export default function Sidebar({ onRun, isRunning, onOpenModal, onOpenHistory, nodeCount, onClear }) {

  const onDragStart = (event, nodeType, label) => {
    event.dataTransfer.setData('nodeType', nodeType)
    event.dataTransfer.setData('label', label)
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div className="sidebar">
      <span className="sidebar-title">⚡ FlowBoard</span>

      {/* Node counter */}
      <div style={{
        background: '#0f0f0f',
        border: '1px solid #2a2a2a',
        borderRadius: 8,
        padding: '10px 14px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ fontSize: 12, color: '#555' }}>Nodes on canvas</span>
        <span style={{
          fontSize: 13,
          fontWeight: 700,
          color: nodeCount > 0 ? '#4ade80' : '#555'
        }}>
          {nodeCount}
        </span>
      </div>

      <div>
        <p className="sidebar-section-label">Triggers</p>
        <div className="node-item trigger" draggable onDragStart={(e) => onDragStart(e, 'trigger', '🟢 Webhook')}>
          🟢 Webhook
        </div>
        <div className="node-item trigger" draggable onDragStart={(e) => onDragStart(e, 'trigger', '🕐 Schedule')}>
          🕐 Schedule
        </div>
      </div>

      <div>
        <p className="sidebar-section-label">Actions</p>
        <div className="node-item action" draggable onDragStart={(e) => onDragStart(e, 'action', '📧 Send Email')}>
          📧 Send Email
        </div>
        <div className="node-item action" draggable onDragStart={(e) => onDragStart(e, 'action', '💬 Slack Message')}>
          💬 Slack Message
        </div>
        <div className="node-item action" draggable onDragStart={(e) => onDragStart(e, 'action', '🌐 HTTP Request')}>
          🌐 HTTP Request
        </div>
      </div>

      <div>
        <p className="sidebar-section-label">Logic</p>
        <div className="node-item condition" draggable onDragStart={(e) => onDragStart(e, 'condition', '🔀 Condition')}>
          🔀 Condition
        </div>
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button
          className="run-button"
          onClick={onOpenModal}
          style={{ background: '#1a1a1a', color: '#fff', border: '1px solid #2a2a2a' }}
        >
          💾 Save / Load
        </button>
        <button
          className="run-button"
          onClick={onOpenHistory}
          style={{ background: '#1a1a1a', color: '#fff', border: '1px solid #2a2a2a' }}
        >
          🕐 Version History
        </button>
        <button
          className="run-button"
          onClick={onClear}
          disabled={isRunning}
          style={{ background: '#1a1a1a', color: '#f87171', border: '1px solid #3a0d0d' }}
        >
          🗑 Clear Canvas
        </button>
        <button
          className="run-button"
          onClick={onRun}
          disabled={isRunning}
        >
          {isRunning ? '⏳ Running...' : '▶ Run Workflow'}
        </button>
      </div>
    </div>
  )
}