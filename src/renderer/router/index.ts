import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import CreateGameView from '@/views/CreateGameView.vue'
import ViewGameView from '@/views/ViewGameView.vue'
import EditGameView from '@/views/UpdateGameView.vue'
import GamesView from '@/views/GamesView.vue'
import LoginView from '@/views/LoginView.vue'
import SetupView from '@/views/SetupView.vue'
import CreateGameSteamView from '@/views/CreateGameSteamView.vue'
import AddGameWithImagesView from '@/views/AddGameWithImagesView.vue'
import FindGameView from '@/views/FindGameView.vue'
import addGameView from '@/views/addGameView.vue'
import EventsView from '@/views/EventsView.vue'
import UsersView from '@/views/UsersView.vue'
import GameSessionsView from '@/views/GameSessionsView.vue'
import DashboardView from '@/views/DashboardView.vue'
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
      path: '/games',
      name: 'games',
      component: GamesView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/setup',
      name: 'setup',
      component: SetupView,
    },
    {
      path: '/game/create',
      name: 'createGame',
      component: CreateGameView,
    },
    {
      path: '/game/add-with-images',
      name: 'addGameWithImages',
      component: AddGameWithImagesView,
    },
    {
      path: '/steam/',
      name: 'createGameSteam',
      component: CreateGameSteamView,
    },
    {
      path: '/game/view/:id',
      name: 'viewGame',
      component: ViewGameView,
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
    {
      path: '/game-sessions',
      name: 'gameSessions',
      component: GameSessionsView,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
    },
  ],
})

// Global navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // First, check if the system needs setup (unless we're already going to setup)
  if (to.path !== '/setup') {
    try {
      const response = await fetch('/auth/setup/check')
      const data = await response.json()

      if (data.needsSetup) {
        // System needs setup, redirect to setup page
        return next('/setup')
      }
    } catch (error) {
      console.error('Failed to check setup status:', error)
      // Continue with normal auth flow if setup check fails
    }
  }

  // If we're on the setup page but setup is already complete, redirect to login
  if (to.path === '/setup') {
    try {
      const response = await fetch('/auth/setup/check')
      const data = await response.json()

      if (!data.needsSetup) {
        // Setup is complete, redirect to login or home
        return next(authStore.isAuthenticated ? '/' : '/login')
      }
    } catch (error) {
      console.error('Failed to check setup status:', error)
    }
  }

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

  // Check if route requires authentication (exclude login and setup pages)
  const requiresAuth = to.path !== '/login' && to.path !== '/setup'

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
