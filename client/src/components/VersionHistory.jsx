import { useState, useEffect } from 'react'
import axios from 'axios'

const API = 'http://localhost:3001/api/workflows'

export default function VersionHistory({ workflowId, onRestore, onClose }) {
  const [versions, setVersions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRestoring, setIsRestoring] = useState(false)

  useEffect(() => {
    if (!workflowId) return

    const fetchVersions = async () => {
      try {
        const res = await axios.get(`${API}/${workflowId}/versions`)
        setVersions(res.data.versions)
      } catch (err) {
        console.error('Failed to fetch versions:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchVersions()
  }, [workflowId])

  const handleRestore = async (versionId, versionNumber) => {
    try {
      setIsRestoring(true)
      const res = await axios.post(`${API}/${workflowId}/restore/${versionId}`)
      onRestore(res.data.workflow)
      onClose()
    } catch (err) {
      console.error('Failed to restore version:', err)
    } finally {
      setIsRestoring(false)
    }
  }

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
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>Version History</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#555', fontSize: 20, cursor: 'pointer' }}>✕</button>
        </div>

        {!workflowId && (
          <p style={{ color: '#555', fontSize: 13 }}>Save your workflow first to see version history.</p>
        )}

        {workflowId && isLoading && (
          <p style={{ color: '#555', fontSize: 13 }}>Loading versions...</p>
        )}

        {workflowId && !isLoading && versions.length === 0 && (
          <p style={{ color: '#555', fontSize: 13 }}>No versions yet.</p>
        )}

        {versions.map((version, index) => (
          <div key={version.id} style={{
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
              <p style={{ fontSize: 14, color: '#fff', fontWeight: 500 }}>
                Version {version.version_number}
                {index === 0 && (
                  <span style={{ marginLeft: 8, fontSize: 10, background: '#1a3a6e', color: '#60a5fa', padding: '2px 6px', borderRadius: 4 }}>
                    LATEST
                  </span>
                )}
              </p>
              <p style={{ fontSize: 11, color: '#555', marginTop: 2 }}>
                {new Date(version.created_at).toLocaleString()} · {version.nodes.length} nodes
              </p>
            </div>
            {index !== 0 && (
              <button
                onClick={() => handleRestore(version.id, version.version_number)}
                disabled={isRestoring}
                style={{
                  padding: '6px 12px',
                  background: '#2e1f0d',
                  color: '#fb923c',
                  border: '1px solid #6e3a1a',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: isRestoring ? 'not-allowed' : 'pointer',
                  opacity: isRestoring ? 0.6 : 1,
                }}
              >
                Restore
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}