const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
require('dotenv').config()

const { executeWorkflow } = require('./engine/dagExecutor')
const workflowRoutes = require('./routes/workflows')

// 1. Create the Express app
const app = express()

// 2. Wrap it in a raw HTTP server
const httpServer = http.createServer(app)

// 3. Attach Socket.io to the HTTP server
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
})

// 4. Middleware
app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

// 5. Health check
app.get('/health', (req, res) => {
  res.json({ status: 'FlowBoard server is running' })
})

// 6. API Routes
app.use('/api/workflows', workflowRoutes)

// 7. Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`)

  socket.on('workflow:run', (workflow) => {
    console.log('Received workflow:run event')
    console.log('Nodes received:', workflow.nodes.length)
    executeWorkflow(workflow, socket)
  })

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`)
  })
})

// 8. Start the server
const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})