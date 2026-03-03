// The DAG Executor with Retry Logic + Exponential Backoff
const MAX_RETRIES = 3
const BASE_DELAY_MS = 1000

// Waits for a given number of milliseconds
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Exponential backoff: attempt 1 = 1s, attempt 2 = 2s, attempt 3 = 4s
const getBackoffDelay = (attempt) => BASE_DELAY_MS * Math.pow(2, attempt - 1)

function buildAdjacencyList(nodes, edges) {
  const adjacencyList = {}
  const inDegree = {}

  nodes.forEach((node) => {
    adjacencyList[node.id] = []
    inDegree[node.id] = 0
  })

  edges.forEach((edge) => {
    adjacencyList[edge.source].push(edge.target)
    inDegree[edge.target]++
  })

  return { adjacencyList, inDegree }
}

function getExecutionOrder(nodes, edges) {
  const { adjacencyList, inDegree } = buildAdjacencyList(nodes, edges)

  const queue = []
  nodes.forEach((node) => {
    if (inDegree[node.id] === 0) queue.push(node.id)
  })

  const executionOrder = []

  while (queue.length > 0) {
    const currentId = queue.shift()
    executionOrder.push(currentId)

    adjacencyList[currentId].forEach((childId) => {
      inDegree[childId]--
      if (inDegree[childId] === 0) queue.push(childId)
    })
  }

  if (executionOrder.length !== nodes.length) {
    throw new Error('Workflow contains a cycle — cannot execute')
  }

  return executionOrder
}

async function executeNode(node) {
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

  // Simulate a random failure 20% of the time so retry logic gets triggered
  const shouldFail = Math.random() < 0.2
  if (shouldFail) {
    throw new Error(`Simulated failure in node "${node.data.label}"`)
  }

  switch (node.data.label) {
    case '🟢 Webhook':
    case '🕐 Schedule':
      await delay(800)
      return { success: true, output: 'Trigger fired successfully' }

    case '📧 Send Email':
      await delay(1200)
      return { success: true, output: 'Email sent to user@example.com' }

    case '💬 Slack Message':
      await delay(1000)
      return { success: true, output: 'Slack message posted to #general' }

    case '🌐 HTTP Request':
      await delay(900)
      return { success: true, output: 'GET https://api.example.com → 200 OK' }

    case '🔀 Condition':
      await delay(600)
      return { success: true, output: 'Condition evaluated → true' }

    default:
      await delay(700)
      return { success: true, output: `Node "${node.data.label}" executed` }
  }
}

// Wraps executeNode with retry + exponential backoff
async function executeNodeWithRetry(node, socket) {
  let lastError

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await executeNode(node)
      return result
    } catch (err) {
      lastError = err

      const isLastAttempt = attempt === MAX_RETRIES

      if (!isLastAttempt) {
        const backoff = getBackoffDelay(attempt)

        // Tell the frontend this node is retrying
        socket.emit('execution:nodeRetry', {
          nodeId: node.id,
          attempt,
          maxRetries: MAX_RETRIES,
          retryingIn: backoff,
        })

        // Wait before retrying
        await delay(backoff)
      }
    }
  }

  // All retries exhausted
  throw lastError
}

async function executeWorkflow(workflow, socket) {
  const { nodes, edges } = workflow

  if (!nodes || nodes.length === 0) {
    socket.emit('execution:error', { message: 'Workflow has no nodes' })
    return
  }

  socket.emit('execution:start', { totalNodes: nodes.length })

  let executionOrder
  try {
    executionOrder = getExecutionOrder(nodes, edges)
  } catch (err) {
    socket.emit('execution:error', { message: err.message })
    return
  }

  const nodeMap = {}
  nodes.forEach((node) => { nodeMap[node.id] = node })

  for (const nodeId of executionOrder) {
    const node = nodeMap[nodeId]

    socket.emit('execution:nodeStart', { nodeId })

    try {
      const result = await executeNodeWithRetry(node, socket)

      socket.emit('execution:nodeComplete', {
        nodeId,
        output: result.output,
      })
    } catch (err) {
      socket.emit('execution:nodeError', {
        nodeId,
        error: err.message,
      })
      return
    }
  }

  socket.emit('execution:complete', { message: 'Workflow completed successfully' })
}

module.exports = { executeWorkflow }