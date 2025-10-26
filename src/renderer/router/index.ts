import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import CreateGameView from '@/views/CreateGameView.vue'
import ViewGameView from '@/views/ViewGameView.vue'
import EditGameView from '@/views/UpdateGameView.vue'
import LoginView from '@/views/LoginView.vue'
import CreateGameSteamView from '@/views/CreateGameSteamView.vue'
import FindGameView from '@/views/FindGameView.vue'
import addGameView from '@/views/addGameView.vue'
import EventsView from '@/views/EventsView.vue'
import UsersView from '@/views/UsersView.vue'
import { useAuthStore } from '@/stores/auth'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/game/create',
      name: 'createGame',
      component: CreateGameView,
    },
    {
      path: '/game/view/:id',
      name: 'viewGame',
      component: ViewGameView,
    },
    {
      path: '/steam/',
      name: 'createGameSteam',
      component: CreateGameSteamView,
    },
    {
      path: '/game/edit/:id',
      name: 'editGame',
      component: EditGameView,
    },
    {
      path: '/game/find',
      name: 'findGame',
      component: FindGameView,
    },
    {
      path: '/game/find/add/:gameId',
      name: 'addGame',
      component: addGameView,
    },
    {
      path: '/events',
      name: 'events',
      component: EventsView,
    },
    {
      path: '/users',
      name: 'users',
      component: UsersView,
    },
  ],
})

// Global navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Initialize auth state from localStorage on first load
  if (!authStore.isAuthenticated) {
    const hasValidToken = authStore.initializeAuth()
    
    // If we have a token, validate it
    if (hasValidToken) {
      const isValid = await authStore.validateToken()
      if (!isValid) {
        authStore.clearAuth()
      }
    }
  }
  
  // Check if route requires authentication
  const requiresAuth = to.path !== '/login'
  
  if (requiresAuth && !authStore.isAuthenticated) {
    // Redirect to login page with return URL
    next({ path: '/login', query: { redirect: to.fullPath } })
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    // Redirect to home if already authenticated
    next('/')
  } else {
    next()
  }
})

export default router
