import { useState, useCallback, useRef } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import Sidebar from './components/Sidebar.jsx'
import ExecutionLog from './components/ExecutionLog.jsx'
import SaveLoadModal from './components/SaveLoadModal.jsx'
import VersionHistory from './components/VersionHistory.jsx'
import EmptyState from './components/EmptyState.jsx'
import Toast from './components/Toast.jsx'
import LandingPage from './components/LandingPage.jsx'
import { useSocket } from './hooks/useSocket'
import { useWorkflow } from './hooks/useWorkflow'
import { useToast } from './hooks/useToast'

const initialNodes = []
const initialEdges = []
let nodeIdCounter = 1

const statusStyles = {
  running: { background: '#1a3a6e', border: '2px solid #60a5fa' },
  complete: { background: '#0d2e1f', border: '2px solid #4ade80' },
  error: { background: '#3a0d0d', border: '2px solid #f87171' },
  idle: {},
}

function FlowCanvas() {
  const [nodes, setNodes] = useState(initialNodes)
  const [edges, setEdges] = useState(initialEdges)
  const [isRunning, setIsRunning] = useState(false)
  const [executionLog, setExecutionLog] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const reactFlowWrapper = useRef(null)
  const { screenToFlowPosition } = useReactFlow()
  const socket = useSocket()
  const { toasts, addToast, removeToast } = useToast()
  const {
    savedWorkflows,
    currentWorkflowId,
    isSaving,
    isLoading,
    fetchWorkflows,
    saveWorkflow,
    deleteWorkflow,
    setCurrentWorkflowId,
  } = useWorkflow()

  const updateNodeStatus = useCallback((nodeId, status) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, style: statusStyles[status] }
          : node
      )
    )
  }, [])

  const resetNodeStyles = useCallback(() => {
    setNodes((nds) => nds.map((node) => ({ ...node, style: {} })))
  }, [])

  const runWorkflow = useCallback(() => {
    if (isRunning) return
    if (nodes.length === 0) {
      addToast('Add some nodes to your workflow first!', 'warning')
      return
    }

    resetNodeStyles()
    setExecutionLog([])
    setIsRunning(true)
    addToast('Workflow started', 'info')

    socket.once('execution:start', ({ totalNodes }) => {
      setExecutionLog([`▶ Starting workflow with ${totalNodes} nodes...`])
    })

    socket.on('execution:nodeStart', ({ nodeId }) => {
      updateNodeStatus(nodeId, 'running')
      setExecutionLog((log) => [...log, `⏳ Running node ${nodeId}...`])
    })

    socket.on('execution:nodeRetry', ({ nodeId, attempt, maxRetries, retryingIn }) => {
      updateNodeStatus(nodeId, 'running')
      setExecutionLog((log) => [
        ...log,
        `🔄 Node ${nodeId} failed, retrying (${attempt}/${maxRetries}) in ${retryingIn / 1000}s...`
      ])
    })

    socket.on('execution:nodeComplete', ({ nodeId, output }) => {
      updateNodeStatus(nodeId, 'complete')
      setExecutionLog((log) => [...log, `✅ Node ${nodeId}: ${output}`])
    })

    socket.on('execution:nodeError', ({ nodeId, error }) => {
      updateNodeStatus(nodeId, 'error')
      setExecutionLog((log) => [...log, `❌ Node ${nodeId} failed: ${error}`])
      setIsRunning(false)
      addToast('Workflow failed — check the execution log', 'error')
      socket.off('execution:nodeStart')
      socket.off('execution:nodeRetry')
      socket.off('execution:nodeComplete')
      socket.off('execution:nodeError')
    })

    socket.once('execution:complete', ({ message }) => {
      setExecutionLog((log) => [...log, `🎉 ${message}`])
      setIsRunning(false)
      addToast('Workflow completed successfully!', 'success')
      socket.off('execution:nodeStart')
      socket.off('execution:nodeRetry')
      socket.off('execution:nodeComplete')
      socket.off('execution:nodeError')
    })

    socket.once('execution:error', ({ message }) => {
      setExecutionLog((log) => [...log, `❌ Error: ${message}`])
      setIsRunning(false)
      addToast(message, 'error')
    })

    socket.emit('workflow:run', { nodes, edges })
  }, [nodes, edges, isRunning, socket, updateNodeStatus, resetNodeStyles, addToast])

  const handleSave = useCallback(async (name) => {
    await saveWorkflow(name, nodes, edges)
    setShowModal(false)
    addToast(`"${name}" saved successfully`, 'success')
  }, [nodes, edges, saveWorkflow, addToast])

  const handleLoad = useCallback((workflow) => {
    if (!workflow) return
    const cleanNodes = workflow.nodes.map((n) => ({ ...n, style: {} }))
    setNodes(cleanNodes)
    setEdges(workflow.edges)
    setCurrentWorkflowId(workflow.id)
    setExecutionLog([])
    const maxId = Math.max(...workflow.nodes.map((n) => parseInt(n.id) || 0))
    nodeIdCounter = maxId + 1
    addToast(`"${workflow.name}" loaded`, 'info')
  }, [setCurrentWorkflowId, addToast])

  const handleRestore = useCallback((workflow) => {
    const cleanNodes = workflow.nodes.map((n) => ({ ...n, style: {} }))
    setNodes(cleanNodes)
    setEdges(workflow.edges)
    setExecutionLog([])
    addToast('Version restored successfully', 'success')
  }, [addToast])

  const handleClear = useCallback(() => {
    setNodes([])
    setEdges([])
    setExecutionLog([])
    addToast('Canvas cleared', 'info')
  }, [addToast])

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  )

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  )

  const onConnect = useCallback(
    (connection) => setEdges((eds) => addEdge({ ...connection, animated: true }, eds)),
    []
  )

  const onDrop = useCallback((event) => {
    event.preventDefault()
    const nodeType = event.dataTransfer.getData('nodeType')
    const label = event.dataTransfer.getData('label')
    if (!nodeType) return

    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    })

    const newNode = {
      id: `${nodeIdCounter++}`,
      type: nodeType === 'trigger' ? 'input' : 'default',
      data: { label },
      position,
    }

    setNodes((nds) => nds.concat(newNode))
  }, [screenToFlowPosition])

  const onDragOver = useCallback((event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar
        onRun={runWorkflow}
        isRunning={isRunning}
        onOpenModal={() => setShowModal(true)}
        onOpenHistory={() => setShowVersionHistory(true)}
        nodeCount={nodes.length}
        onClear={handleClear}
      />
      <div className="canvas-wrapper" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          fitView
        >
          <Background color="#2a2a2a" />
          <Controls />
          <MiniMap
            style={{ background: '#1a1a1a' }}
            nodeColor="#2a2a2a"
          />
        </ReactFlow>
        <EmptyState nodeCount={nodes.length} />
        <ExecutionLog logs={executionLog} />
      </div>

      <Toast toasts={toasts} onRemove={removeToast} />

      <SaveLoadModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        onLoad={handleLoad}
        onDelete={deleteWorkflow}
        savedWorkflows={savedWorkflows}
        isSaving={isSaving}
        isLoading={isLoading}
        fetchWorkflows={fetchWorkflows}
      />

      {showVersionHistory && (
        <VersionHistory
          workflowId={currentWorkflowId}
          onRestore={handleRestore}
          onClose={() => setShowVersionHistory(false)}
        />
      )}
    </div>
  )
}

function AppContent() {
  const [hasEntered, setHasEntered] = useState(false)

  if (!hasEntered) {
    return <LandingPage onEnter={() => setHasEntered(true)} />
  }

  return (
    <ReactFlowProvider>
      <FlowCanvas />
    </ReactFlowProvider>
  )
}

export default function App() {
  return <AppContent />
}