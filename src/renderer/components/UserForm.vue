<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Avatar Preview -->
    <div class="form-control">
      <label class="label">
        <span class="label-text font-medium">
          <span class="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 text-accent"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Avatar Preview
          </span>
        </span>
      </label>
      <div class="flex items-center gap-4 p-4 bg-base-200/30 rounded-lg border border-base-300/20">
        <UserAvatar 
          :name="formData.name || 'User'" 
          size="lg"
          :hover="false"
        />
        <div class="flex-1">
          <p class="text-sm text-base-content/70">
            This is how the user's avatar will appear throughout the application.
          </p>
          <p class="text-xs text-base-content/50 mt-1">
            Avatar color is automatically generated based on the user's name.
          </p>
        </div>
      </div>
    </div>

    <!-- Name Field -->
    <div class="form-control">
      <label class="label">
        <span class="label-text font-medium">
          <span class="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Name
          </span>
          <span class="text-error">*</span>
        </span>
      </label>
      <input
        v-model="formData.name"
        type="text"
        placeholder="Enter user name"
        class="input input-bordered w-full focus:input-primary transition-all duration-200"
        :class="{ 'input-error': errors.name }"
        required
        maxlength="255"
      />
      <label v-if="errors.name" class="label">
        <span class="label-text-alt text-error">{{ errors.name }}</span>
      </label>
    </div>

    <!-- Client ID Field -->
    <div class="form-control">
      <label class="label">
        <span class="label-text font-medium">
          <span class="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 text-secondary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
            Client ID
          </span>
          <span class="text-error">*</span>
        </span>
      </label>
      <div class="relative">
        <input
          v-model="formData.clientId"
          type="text"
          placeholder="Enter unique client ID"
          class="input input-bordered w-full pr-10 focus:input-secondary transition-all duration-200"
          :class="{ 
            'input-error': errors.clientId,
            'input-success': formData.clientId && !errors.clientId && isClientIdValid
          }"
          required
          maxlength="255"
          @blur="validateClientId"
        />
        <div class="absolute inset-y-0 right-0 flex items-center pr-3">
          <svg
            v-if="formData.clientId && !errors.clientId && isClientIdValid"
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-success"
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
          <svg
            v-else-if="errors.clientId"
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-error"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      </div>
      <label v-if="errors.clientId" class="label">
        <span class="label-text-alt text-error">{{ errors.clientId }}</span>
      </label>
      <label v-else class="label">
        <span class="label-text-alt text-base-content/60">
          Must be unique across all users
        </span>
      </label>
    </div>

    <!-- Action Buttons -->
    <div class="flex justify-end gap-3 pt-4 border-t border-base-300/20">
      <button
        type="button"
        @click="$emit('cancel')"
        class="btn btn-ghost hover:btn-error hover:text-error transition-all duration-200"
        :disabled="isLoading"
      >
        <svg
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
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
        Cancel
      </button>
      <button
        type="submit"
        class="btn btn-primary hover:btn-primary-focus transition-all duration-200"
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
            d="M5 13l4 4L19 7"
          />
        </svg>
        {{ submitText }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useUsersStore, type User, type CreateUserType } from '@/stores/users'
import UserAvatar from '@/components/common/UserAvatar.vue'

interface Props {
  user?: User
  isLoading?: boolean
  submitText?: string
}

interface Emits {
  (e: 'submit', data: CreateUserType): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  submitText: 'Save User'
})

const emit = defineEmits<Emits>()

const usersStore = useUsersStore()

const formData = ref<CreateUserType>({
  name: '',
  clientId: ''
})

const errors = ref({
  name: '',
  clientId: ''
})

const isClientIdValid = ref(false)

// Computed properties
const isFormValid = computed(() => {
  return formData.value.name.trim().length > 0 &&
         formData.value.clientId.trim().length > 0 &&
         !errors.value.name &&
         !errors.value.clientId &&
         isClientIdValid.value
})

// Initialize form with existing user data
onMounted(() => {
  if (props.user) {
    formData.value = {
      name: props.user.name,
      clientId: props.user.clientId
    }
    isClientIdValid.value = true
  }
})

// Watch for prop changes
watch(() => props.user, (newUser) => {
  if (newUser) {
    formData.value = {
      name: newUser.name,
      clientId: newUser.clientId
    }
    isClientIdValid.value = true
  } else {
    resetForm()
  }
}, { deep: true })

// Validate name
function validateName() {
  errors.value.name = ''
  
  if (!formData.value.name.trim()) {
    errors.value.name = 'Name is required'
    return false
  }
  
  if (formData.value.name.length > 255) {
    errors.value.name = 'Name must be less than 255 characters'
    return false
  }
  
  return true
}

// Validate client ID
function validateClientId() {
  errors.value.clientId = ''
  isClientIdValid.value = false
  
  if (!formData.value.clientId.trim()) {
    errors.value.clientId = 'Client ID is required'
    return false
  }
  
  if (formData.value.clientId.length > 255) {
    errors.value.clientId = 'Client ID must be less than 255 characters'
    return false
  }
  
  // Check if client ID is available (excluding current user when editing)
  const excludeId = props.user?.id
  if (!usersStore.isClientIdAvailable(formData.value.clientId, excludeId)) {
    errors.value.clientId = 'This Client ID is already in use'
    return false
  }
  
  isClientIdValid.value = true
  return true
}

// Validate entire form
function validateForm(): boolean {
  const nameValid = validateName()
  const clientIdValid = validateClientId()
  
  return nameValid && clientIdValid
}

// Handle form submission
function handleSubmit() {
  if (!validateForm()) {
    return
  }
  
  emit('submit', {
    name: formData.value.name.trim(),
    clientId: formData.value.clientId.trim()
  })
}

// Reset form
function resetForm() {
  formData.value = {
    name: '',
    clientId: ''
  }
  errors.value = {
    name: '',
    clientId: ''
  }
  isClientIdValid.value = false
}

// Watch form data for real-time validation
watch(() => formData.value.name, validateName)
watch(() => formData.value.clientId, () => {
  // Only validate if the field has been touched (has content)
  if (formData.value.clientId.trim()) {
    validateClientId()
  } else {
    errors.value.clientId = ''
    isClientIdValid.value = false
  }
})
</script>