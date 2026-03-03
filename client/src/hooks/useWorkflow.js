import { useState } from 'react'
import axios from 'axios'

const API = 'http://localhost:3001/api/workflows'

export function useWorkflow() {
  const [savedWorkflows, setSavedWorkflows] = useState([])
  const [currentWorkflowId, setCurrentWorkflowId] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch all saved workflows
  const fetchWorkflows = async () => {
    try {
      setIsLoading(true)
      const res = await axios.get(API)
      setSavedWorkflows(res.data.workflows)
    } catch (err) {
      console.error('Failed to fetch workflows:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Save current workflow
  const saveWorkflow = async (name, nodes, edges) => {
    try {
      setIsSaving(true)

      if (currentWorkflowId) {
        // Update existing workflow
        const res = await axios.put(`${API}/${currentWorkflowId}`, {
          name, nodes, edges
        })
        return res.data.workflow
      } else {
        // Create new workflow
        const res = await axios.post(API, { name, nodes, edges })
        setCurrentWorkflowId(res.data.workflow.id)
        return res.data.workflow
      }
    } catch (err) {
      console.error('Failed to save workflow:', err)
    } finally {
      setIsSaving(false)
    }
  }

  // Delete a workflow
  const deleteWorkflow = async (id) => {
    try {
      await axios.delete(`${API}/${id}`)
      setSavedWorkflows((prev) => prev.filter((w) => w.id !== id))
      if (currentWorkflowId === id) setCurrentWorkflowId(null)
    } catch (err) {
      console.error('Failed to delete workflow:', err)
    }
  }

  return {
    savedWorkflows,
    currentWorkflowId,
    isSaving,
    isLoading,
    fetchWorkflows,
    saveWorkflow,
    deleteWorkflow,
    setCurrentWorkflowId,
  }
}
