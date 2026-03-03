import { io } from 'socket.io-client'

// Created once at module level — survives React Strict Mode remounts
const socket = io('http://localhost:3001', {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
})

socket.on('connect', () => {
  console.log('Connected to server:', socket.id)
})

socket.on('connect_error', (err) => {
  console.log('Connection error:', err.message)
})

export function useSocket() {
  return socket
}