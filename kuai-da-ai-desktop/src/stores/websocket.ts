// src/stores/websocket.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { io, Socket } from 'socket.io-client'

export const useWebsocketStore = defineStore('websocket', () => {
  const socket = ref<Socket | null>(null)
  const isConnected = ref(false)

  function connect(token: string) {
    if (socket.value) return;

    socket.value = io('http://localhost:3000');

    socket.value.on('connect', () => {
      console.log('连接到 WebSocket 服务器...');
      socket.value?.emit('authenticate', token);
    });

    socket.value.on('authenticated', () => {
      console.log('WebSocket 认证成功!');
      isConnected.value = true;
    });
    
    socket.value.on('disconnect', () => {
      console.log('与 WebSocket 服务器断开');
      isConnected.value = false;
    });
  }

  function disconnect() {
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
      isConnected.value = false
    }
  }
  
  return { socket, isConnected, connect, disconnect }
})