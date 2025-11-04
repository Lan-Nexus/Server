import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useFullscreenStore = defineStore('fullscreen', () => {
  const isFullscreen = ref(false)
  let listenersInitialized = false
  let checkInterval: number | null = null

  // Function to check if document is in fullscreen
  function checkFullscreen() {
    const newFullscreenState = !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    )
    
    console.log('Fullscreen state changed:', newFullscreenState)
    isFullscreen.value = newFullscreenState
  }

  // Toggle fullscreen mode
  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error)
    }
  }

  // Enter fullscreen mode
  async function enterFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
      }
    } catch (error) {
      console.error('Error entering fullscreen:', error)
    }
  }

  // Exit fullscreen mode
  async function exitFullscreen() {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      }
    } catch (error) {
      console.error('Error exiting fullscreen:', error)
    }
  }

  // Initialize fullscreen listeners
  function initializeListeners() {
    if (listenersInitialized) return
    
    console.log('Initializing fullscreen listeners')
    
    // Add all possible fullscreen event listeners
    document.addEventListener('fullscreenchange', checkFullscreen, { passive: true })
    document.addEventListener('webkitfullscreenchange', checkFullscreen, { passive: true })
    document.addEventListener('mozfullscreenchange', checkFullscreen, { passive: true })
    document.addEventListener('MSFullscreenChange', checkFullscreen, { passive: true })
    
    // Additional listeners for better F11 detection
    window.addEventListener('resize', checkFullscreen, { passive: true })
    window.addEventListener('focus', checkFullscreen, { passive: true })
    document.addEventListener('visibilitychange', checkFullscreen, { passive: true })
    
    // Periodic check every 500ms to catch F11 and other edge cases
    checkInterval = window.setInterval(checkFullscreen, 500)
    
    listenersInitialized = true
    checkFullscreen() // Initial check
  }

  // Remove fullscreen listeners
  function removeListeners() {
    if (!listenersInitialized) return
    
    console.log('Removing fullscreen listeners')
    
    document.removeEventListener('fullscreenchange', checkFullscreen)
    document.removeEventListener('webkitfullscreenchange', checkFullscreen)
    document.removeEventListener('mozfullscreenchange', checkFullscreen)
    document.removeEventListener('MSFullscreenChange', checkFullscreen)
    window.removeEventListener('resize', checkFullscreen)
    window.removeEventListener('focus', checkFullscreen)
    document.removeEventListener('visibilitychange', checkFullscreen)
    
    if (checkInterval) {
      clearInterval(checkInterval)
      checkInterval = null
    }
    
    listenersInitialized = false
  }

  return {
    // State
    isFullscreen,
    
    // Actions
    toggleFullscreen,
    enterFullscreen,
    exitFullscreen,
    initializeListeners,
    removeListeners,
    checkFullscreen
  }
})