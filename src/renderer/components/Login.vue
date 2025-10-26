<template>
  <div class="min-h-screen bg-gradient-to-br from-base-100 to-base-200 flex items-center justify-center p-6">
    <div class="w-full max-w-md">
      <!-- Login Card -->
      <div class="card bg-base-100/90 backdrop-blur-sm border border-base-300/20 shadow-xl">
        <div class="card-body">
          <!-- Header -->
          <div class="flex items-center gap-3 mb-6">
            <div class="p-3 bg-primary/10 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            </div>
            <div>
              <h2 class="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Sign In
              </h2>
              <p class="text-base-content/70">
                Enter your credentials to access the system
              </p>
            </div>
          </div>

          <!-- Login Form -->
          <form @submit.prevent="handleLogin" class="space-y-4">
            <!-- Client ID Field -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">
                  <span class="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Client ID
                  </span>
                  <span class="text-error">*</span>
                </span>
              </label>
              <input 
                v-model="clientId" 
                type="text" 
                placeholder="Enter your client ID"
                class="input input-bordered w-full focus:input-secondary transition-all duration-200"
                :class="{ 'input-error': errors.clientId }"
                required 
              />
              <label v-if="errors.clientId" class="label">
                <span class="label-text-alt text-error">{{ errors.clientId }}</span>
              </label>
            </div>

            <!-- Password Field -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">
                  <span class="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-1a2 2 0 00-2-2H6a2 2 0 00-2 2v1a2 2 0 002 2zM11 5a2 2 0 012 0" />
                    </svg>
                    Password
                  </span>
                  <span class="text-error">*</span>
                </span>
              </label>
              <div class="relative">
                <input 
                  v-model="password" 
                  :type="showPassword ? 'text' : 'password'" 
                  placeholder="Enter your password"
                  class="input input-bordered w-full pr-10 focus:input-warning transition-all duration-200"
                  :class="{ 'input-error': errors.password }"
                  required 
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 flex items-center pr-3 hover:text-warning transition-colors"
                >
                  <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M9.878 9.878l-.85-.85m4.242 4.242l2.121 2.122M14.12 14.12l.85.85m-2.121-2.122l3.536 3.536M21 12c-1.274-4.057-5.065-7-9.542-7-.847 0-1.669.118-2.454.336" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
              <label v-if="errors.password" class="label">
                <span class="label-text-alt text-error">{{ errors.password }}</span>
              </label>
            </div>

            <!-- Error Display -->
            <div v-if="authStore.error" class="alert alert-error">
              <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{{ authStore.error }}</span>
            </div>

            <!-- Login Button -->
            <button 
              type="submit" 
              class="btn btn-primary w-full hover:btn-primary-focus transition-all duration-200"
              :class="{ 'loading': authStore.isLoading }"
              :disabled="authStore.isLoading || !isFormValid"
            >
              <svg v-if="!authStore.isLoading" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

// Form state
const clientId = ref('')
const password = ref('')
const showPassword = ref(false)

const errors = ref({
  clientId: '',
  password: ''
})

// Computed
const isFormValid = computed(() => {
  return clientId.value.trim().length > 0 && password.value.trim().length > 0
})

// Methods
function clearForm() {
  clientId.value = ''
  password.value = ''
  errors.value = {
    clientId: '',
    password: ''
  }
}

function validateForm(): boolean {
  errors.value = {
    clientId: '',
    password: ''
  }

  let isValid = true

  if (!clientId.value.trim()) {
    errors.value.clientId = 'Client ID is required'
    isValid = false
  }

  if (!password.value.trim()) {
    errors.value.password = 'Password is required'
    isValid = false
  }

  return isValid
}

async function handleLogin() {
  if (!validateForm()) {
    return
  }

  try {
    const credentials = { 
      clientId: clientId.value.trim(), 
      password: password.value.trim() 
    }

    await authStore.login(credentials)
    
    // Redirect to intended page or home
    const redirectPath = (route.query.redirect as string) || '/'
    router.push(redirectPath)
  } catch (error) {
    // Error is handled by the auth store
    console.error('Login failed:', error)
  }
}
</script>
