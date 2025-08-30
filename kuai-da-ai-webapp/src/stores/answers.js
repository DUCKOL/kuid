// src/stores/answers.js
import { ref } from 'vue'
import { defineStore } from 'pinia'
import { io } from 'socket.io-client'

export const useAnswersStore = defineStore('answers', () => {
  const socket = ref(null)
  const isConnected = ref(false)
  const answers = ref([])

  function connect(token) {
    if (socket.value) return;
    socket.value = io('http://localhost:3000');

    socket.value.on('connect', () => socket.value.emit('authenticate', token));
    socket.value.on('authenticated', () => isConnected.value = true);
    socket.value.on('disconnect', () => isConnected.value = false);
    socket.value.on('newAnswer', (data) => answers.value.unshift(data));
  }

  function disconnect() {
    if (socket.value) {
      socket.value.disconnect();
      socket.value = null;
      isConnected.value = false;
      answers.value = [];
    }
  }

  return { isConnected, answers, connect, disconnect }
})