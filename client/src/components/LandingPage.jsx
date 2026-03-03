export default function LandingPage({ onEnter }) {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#0f0f0f',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      {/* Glow effect */}
      <div style={{
        position: 'absolute',
        width: 600,
        height: 600,
        background: 'radial-gradient(circle, rgba(74,222,128,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Badge */}
      <div style={{
        background: '#0d2e1f',
        border: '1px solid #1a5c3a',
        borderRadius: 100,
        padding: '6px 14px',
        fontSize: 12,
        color: '#4ade80',
        fontWeight: 600,
        marginBottom: 32,
        letterSpacing: 0.5,
      }}>
        ⚡ Workflow Automation Platform
      </div>

      {/* Heading */}
      <h1 style={{
        fontSize: 64,
        fontWeight: 800,
        color: '#ffffff',
        textAlign: 'center',
        lineHeight: 1.1,
        letterSpacing: -2,
        marginBottom: 24,
        maxWidth: 700,
      }}>
        Build workflows
        <br />
        <span style={{ color: '#4ade80' }}>visually.</span>
      </h1>

      {/* Subheading */}
      <p style={{
        fontSize: 18,
        color: '#555',
        textAlign: 'center',
        maxWidth: 480,
        lineHeight: 1.7,
        marginBottom: 48,
      }}>
        Drag, connect, and automate. FlowBoard lets you build
        multi-step workflows without writing a single line of code.
      </p>

      {/* CTA Buttons */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={onEnter}
          style={{
            padding: '16px 32px',
            background: '#4ade80',
            color: '#000',
            border: 'none',
            borderRadius: 10,
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => e.target.style.background = '#22c55e'}
          onMouseLeave={(e) => e.target.style.background = '#4ade80'}
        >
          Start Building →
        </button>
        <button
          style={{
            padding: '16px 32px',
            background: 'transparent',
            color: '#555',
            border: '1px solid #2a2a2a',
            borderRadius: 10,
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          View on GitHub
        </button>
      </div>

      {/* Feature pills */}
      <div style={{
        display: 'flex',
        gap: 12,
        marginTop: 64,
        flexWrap: 'wrap',
        justifyContent: 'center',
        maxWidth: 600,
      }}>
        {[
          '⚡ Real-time execution',
          '🔀 DAG engine',
          '💾 Auto-save',
          '🕐 Version history',
          '🔄 Retry logic',
          '🌐 Webhook triggers',
        ].map((feature) => (
          <div key={feature} style={{
            background: '#1a1a1a',
            border: '1px solid #2a2a2a',
            borderRadius: 100,
            padding: '8px 16px',
            fontSize: 13,
            color: '#555',
          }}>
            {feature}
          </div>
        ))}
      </div>
    </div>
  )
}