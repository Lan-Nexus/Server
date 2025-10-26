<template>
  <div>
    <!-- Password Modal -->
    <input
      type="checkbox"
      :id="modalId"
      class="modal-toggle"
      v-model="isOpen"
    />
    <div class="modal" role="dialog">
      <div
        class="modal-box max-w-md bg-base-100/95 backdrop-blur-sm border border-base-300/20"
      >
        <div
          class="flex justify-between items-center mb-6 pb-4 border-b border-base-300/20"
        >
          <div class="flex items-center gap-3">
            <div class="p-2 bg-warning/10 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6 text-warning"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-1a2 2 0 00-2-2H6a2 2 0 00-2 2v1a2 2 0 002 2zM11 5a2 2 0 012 0"
                />
              </svg>
            </div>
            <h3
              class="text-xl font-bold bg-gradient-to-r from-warning to-accent bg-clip-text text-transparent"
            >
              Set Password
            </h3>
          </div>
          <button
            @click="close"
            class="btn btn-sm btn-circle btn-ghost hover:btn-error transition-all duration-200"
          >
            ✕
          </button>
        </div>

        <!-- User Info -->
        <div v-if="user" class="bg-base-200/50 rounded-lg p-4 mb-6 border border-base-300/20">
          <div class="flex items-center gap-3">
            <UserAvatar
              :name="user.name"
              size="sm"
              :hover="false"
              :avatar="user.avatar || undefined"
            />
            <div>
              <div class="font-medium">{{ user.name }}</div>
              <div class="text-sm text-base-content/60">{{ user.clientId }}</div>
            </div>
          </div>
        </div>

        <!-- Password Form -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- New Password Field -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">
                <span class="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4 text-warning"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-1a2 2 0 00-2-2H6a2 2 0 00-2 2v1a2 2 0 002 2zM11 5a2 2 0 012 0"
                    />
                  </svg>
                  New Password
                </span>
                <span class="text-error">*</span>
              </span>
            </label>
            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Enter new password"
                class="input input-bordered w-full pr-10 focus:input-warning transition-all duration-200"
                :class="{ 'input-error': passwordError }"
                required
                minlength="6"
                @input="validatePassword"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 flex items-center pr-3 hover:text-warning transition-colors"
              >
                <svg
                  v-if="showPassword"
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M9.878 9.878l-.85-.85m4.242 4.242l2.121 2.122M14.12 14.12l.85.85m-2.121-2.122l3.536 3.536M21 12c-1.274-4.057-5.065-7-9.542-7-.847 0-1.669.118-2.454.336"
                  />
                </svg>
                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </button>
            </div>
            <label v-if="passwordError" class="label">
              <span class="label-text-alt text-error">{{ passwordError }}</span>
            </label>
            <label v-else class="label">
              <span class="label-text-alt text-base-content/60">
                Minimum 6 characters required
              </span>
            </label>
          </div>

          <!-- Confirm Password Field -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">
                <span class="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4 text-warning"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Confirm Password
                </span>
                <span class="text-error">*</span>
              </span>
            </label>
            <input
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="Confirm new password"
              class="input input-bordered w-full focus:input-warning transition-all duration-200"
              :class="{ 
                'input-error': confirmPasswordError,
                'input-success': confirmPassword && !confirmPasswordError && password === confirmPassword
              }"
              required
              @input="validateConfirmPassword"
            />
            <label v-if="confirmPasswordError" class="label">
              <span class="label-text-alt text-error">{{ confirmPasswordError }}</span>
            </label>
          </div>

          <!-- Password Strength Indicator -->
          <div v-if="password" class="bg-base-200/30 rounded-lg p-3 border border-base-300/20">
            <div class="text-xs font-medium text-base-content/70 mb-2">Password Strength</div>
            <div class="flex gap-1 mb-2">
              <div 
                v-for="i in 4" 
                :key="i"
                class="flex-1 h-1 rounded"
                :class="getStrengthBarClass(i)"
              ></div>
            </div>
            <div class="text-xs" :class="getStrengthTextClass()">
              {{ getStrengthText() }}
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-end gap-3 pt-4">
            <button
              type="button"
              @click="close"
              class="btn btn-ghost hover:btn-error transition-all duration-200"
              :disabled="isLoading"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="btn btn-warning hover:btn-warning-focus transition-all duration-200"
              :disabled="isLoading || !isFormValid"
              :class="{ 'loading': isLoading }"
            >
              <svg
                v-if="!isLoading"
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-1a2 2 0 00-2-2H6a2 2 0 00-2 2v1a2 2 0 002 2zM11 5a2 2 0 012 0"
                />
              </svg>
              Set Password
            </button>
          </div>
        </form>
      </div>
      <label class="modal-backdrop" :for="modalId">Close</label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useUsersStore, type User } from '@/stores/users'
import UserAvatar from '@/components/common/UserAvatar.vue'

interface Props {
  user: User | null
  show: boolean
  modalId?: string
}

interface Emits {
  (e: 'close'): void
  (e: 'success', message: string): void
  (e: 'error', message: string): void
}

const props = withDefaults(defineProps<Props>(), {
  modalId: 'password-modal'
})

const emit = defineEmits<Emits>()

const usersStore = useUsersStore()

// Form data
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const passwordError = ref('')
const confirmPasswordError = ref('')
const isLoading = ref(false)

// Reactive modal state
const isOpen = ref(false)

// Watch show prop to control modal
watch(() => props.show, (newValue) => {
  isOpen.value = newValue
})

// Watch isOpen to emit close event
watch(isOpen, (newValue) => {
  if (!newValue) {
    emit('close')
  }
})

// Computed properties
const isFormValid = computed(() => {
  return password.value.length >= 6 &&
         confirmPassword.value === password.value &&
         !passwordError.value &&
         !confirmPasswordError.value
})

// Password strength calculation
const passwordStrength = computed(() => {
  if (!password.value) return 0
  
  let strength = 0
  
  // Length check
  if (password.value.length >= 6) strength++
  if (password.value.length >= 8) strength++
  
  // Character variety checks
  if (/[a-z]/.test(password.value) && /[A-Z]/.test(password.value)) strength++
  if (/\d/.test(password.value)) strength++
  if (/[^a-zA-Z0-9]/.test(password.value)) strength++
  
  return Math.min(strength, 4)
})

// Validation functions
function validatePassword() {
  passwordError.value = ''
  
  if (!password.value) {
    passwordError.value = 'Password is required'
    return false
  }
  
  if (password.value.length < 6) {
    passwordError.value = 'Password must be at least 6 characters'
    return false
  }
  
  // Re-validate confirm password if it exists
  if (confirmPassword.value) {
    validateConfirmPassword()
  }
  
  return true
}

function validateConfirmPassword() {
  confirmPasswordError.value = ''
  
  if (!confirmPassword.value) {
    confirmPasswordError.value = 'Please confirm your password'
    return false
  }
  
  if (confirmPassword.value !== password.value) {
    confirmPasswordError.value = 'Passwords do not match'
    return false
  }
  
  return true
}

// Password strength styling
function getStrengthBarClass(index: number) {
  if (index <= passwordStrength.value) {
    switch (passwordStrength.value) {
      case 1: return 'bg-error'
      case 2: return 'bg-warning'
      case 3: return 'bg-info'
      case 4: return 'bg-success'
      default: return 'bg-base-300'
    }
  }
  return 'bg-base-300'
}

function getStrengthTextClass() {
  switch (passwordStrength.value) {
    case 1: return 'text-error'
    case 2: return 'text-warning'
    case 3: return 'text-info'
    case 4: return 'text-success'
    default: return 'text-base-content/60'
  }
}

function getStrengthText() {
  switch (passwordStrength.value) {
    case 0: return 'Very Weak'
    case 1: return 'Weak'
    case 2: return 'Fair'
    case 3: return 'Good'
    case 4: return 'Strong'
    default: return ''
  }
}

// Handle form submission
async function handleSubmit() {
  if (!validatePassword() || !validateConfirmPassword() || !props.user) {
    return
  }
  
  isLoading.value = true
  
  try {
    await usersStore.setPassword(props.user.id, password.value)
    emit('success', `Password set for ${props.user.name}`)
    close()
  } catch (error: any) {
    emit('error', error.message || 'Failed to set password')
  } finally {
    isLoading.value = false
  }
}

// Close modal and reset form
function close() {
  isOpen.value = false
  resetForm()
}

// Reset form data
function resetForm() {
  password.value = ''
  confirmPassword.value = ''
  showPassword.value = false
  showConfirmPassword.value = false
  passwordError.value = ''
  confirmPasswordError.value = ''
  isLoading.value = false
}

// Reset form when user changes
watch(() => props.user, () => {
  resetForm()
})
</script>