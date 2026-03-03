import { useEffect } from 'react'

export default function Toast({ toasts, onRemove }) {
  return (
    <div style={{
      position: 'fixed',
      top: 24,
      right: 24,
      zIndex: 200,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onRemove }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 3000)
    return () => clearTimeout(timer)
  }, [toast.id, onRemove])

  const styles = {
    success: { background: '#0d2e1f', border: '1px solid #4ade80', color: '#4ade80' },
    error:   { background: '#3a0d0d', border: '1px solid #f87171', color: '#f87171' },
    info:    { background: '#0d1f3c', border: '1px solid #60a5fa', color: '#60a5fa' },
    warning: { background: '#2e1f0d', border: '1px solid #fb923c', color: '#fb923c' },
  }

  const icons = {
    success: '✅',
    error: '❌',
    info: '💬',
    warning: '⚠️',
  }

  return (
    <div
      onClick={() => onRemove(toast.id)}
      style={{
        ...styles[toast.type || 'info'],
        padding: '12px 16px',
        borderRadius: 10,
        fontSize: 13,
        fontWeight: 500,
        cursor: 'pointer',
        minWidth: 280,
        maxWidth: 360,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        animation: 'slideIn 0.2s ease',
      }}
    >
      <span>{icons[toast.type || 'info']}</span>
      <span>{toast.message}</span>
    </div>
  )
}
