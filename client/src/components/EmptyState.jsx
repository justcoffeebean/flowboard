export default function EmptyState({ nodeCount }) {
  if (nodeCount > 0) return null

  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      textAlign: 'center',
      pointerEvents: 'none',
      zIndex: 5,
    }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>⚡</div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#ffffff', marginBottom: 8 }}>
        Build your first workflow
      </h2>
      <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6, maxWidth: 280 }}>
        Drag a <span style={{ color: '#4ade80' }}>Trigger</span> from the sidebar to get started,
        then connect <span style={{ color: '#60a5fa' }}>Actions</span> to automate your process.
      </p>
    </div>
  )
}