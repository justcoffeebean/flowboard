export default function ExecutionLog({ logs }) {
  if (logs.length === 0) return null

  return (
    <div style={{
      position: 'absolute',
      bottom: 24,
      right: 24,
      width: 320,
      background: '#1a1a1a',
      border: '1px solid #2a2a2a',
      borderRadius: 12,
      padding: 16,
      zIndex: 10,
      maxHeight: 280,
      overflowY: 'auto',
    }}>
      <p style={{
        fontSize: 11,
        fontWeight: 700,
        color: '#555',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 10
      }}>
        Execution Log
      </p>
      {logs.map((entry, i) => (
        <p key={i} style={{ fontSize: 12, color: '#ccc', marginBottom: 6, lineHeight: 1.5 }}>
          {entry}
        </p>
      ))}
    </div>
  )
}