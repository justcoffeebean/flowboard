import { useEffect, useState } from 'react'

export default function SaveLoadModal({
  isOpen,
  onClose,
  onSave,
  onLoad,
  onDelete,
  savedWorkflows,
  isSaving,
  isLoading,
  fetchWorkflows,
}) {
  const [workflowName, setWorkflowName] = useState('My Workflow')

  useEffect(() => {
    if (isOpen) fetchWorkflows()
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.7)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        background: '#1a1a1a',
        border: '1px solid #2a2a2a',
        borderRadius: 16,
        padding: 24,
        width: 420,
        maxHeight: '80vh',
        overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>Workflows</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#555', fontSize: 20, cursor: 'pointer' }}>✕</button>
        </div>

        {/* Save section */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
            Save Current Workflow
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              style={{
                flex: 1,
                background: '#0f0f0f',
                border: '1px solid #2a2a2a',
                borderRadius: 8,
                padding: '10px 14px',
                color: '#fff',
                fontSize: 14,
                outline: 'none',
              }}
              placeholder="Workflow name..."
            />
            <button
              onClick={() => onSave(workflowName)}
              disabled={isSaving}
              style={{
                padding: '10px 16px',
                background: '#4ade80',
                color: '#000',
                border: 'none',
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 13,
                cursor: isSaving ? 'not-allowed' : 'pointer',
                opacity: isSaving ? 0.6 : 1,
              }}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {/* Saved workflows list */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
            Saved Workflows
          </p>

          {isLoading && (
            <p style={{ color: '#555', fontSize: 13 }}>Loading...</p>
          )}

          {!isLoading && savedWorkflows.length === 0 && (
            <p style={{ color: '#555', fontSize: 13 }}>No saved workflows yet.</p>
          )}

          {savedWorkflows.map((workflow) => (
            <div key={workflow.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 14px',
              background: '#0f0f0f',
              border: '1px solid #2a2a2a',
              borderRadius: 8,
              marginBottom: 8,
            }}>
              <div>
                <p style={{ fontSize: 14, color: '#fff', fontWeight: 500 }}>{workflow.name}</p>
                <p style={{ fontSize: 11, color: '#555', marginTop: 2 }}>
                  {new Date(workflow.updated_at).toLocaleDateString()}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => { onLoad(workflow); onClose() }}
                  style={{
                    padding: '6px 12px',
                    background: '#1a3a6e',
                    color: '#60a5fa',
                    border: '1px solid #1a3a6e',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Load
                </button>
                <button
                  onClick={() => onDelete(workflow.id)}
                  style={{
                    padding: '6px 12px',
                    background: '#3a0d0d',
                    color: '#f87171',
                    border: '1px solid #3a0d0d',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
