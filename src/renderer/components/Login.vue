<template>
  <div
    class="min-h-screen bg-gradient-to-br from-base-100 to-base-200 flex items-center justify-center p-6"
  >
    <div class="w-full max-w-md">
      <!-- Login Card -->
      <div
        class="card bg-base-100/90 backdrop-blur-sm border border-base-300/20 shadow-xl"
      >
        <div class="card-body">
          <!-- Header -->
          <div class="flex items-center gap-3 mb-6">
            <div class="p-3 bg-primary/10 rounded-xl">
              <i class="fas fa-sign-in-alt h-8 w-8 text-primary text-2xl"></i>
            </div>
            <div>
              <h2
                class="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
              >
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
                    <i class="fas fa-id-badge h-4 w-4 text-secondary"></i>
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
                <span class="label-text-alt text-error">{{
                  errors.clientId
                }}</span>
              </label>
            </div>

            <!-- Password Field -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">
                  <span class="flex items-center gap-2">
                    <i class="fas fa-lock h-4 w-4 text-warning"></i>
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
                  <i v-if="showPassword" class="fas fa-eye-slash h-5 w-5"></i>
                  <i v-else class="fas fa-eye h-5 w-5"></i>
                </button>
              </div>
              <label v-if="errors.password" class="label">
                <span class="label-text-alt text-error">{{
                  errors.password
                }}</span>
              </label>
            </div>

            <!-- Error Display -->
            <div v-if="authStore.error" class="alert alert-error">
              <i class="fas fa-exclamation-circle shrink-0 h-6 w-6"></i>
              <span>{{ authStore.error }}</span>
            </div>

            <!-- Login Button -->
            <button
              type="submit"
              class="btn btn-primary w-full hover:btn-primary-focus transition-all duration-200"
              :class="{ loading: authStore.isLoading }"
              :disabled="authStore.isLoading || !isFormValid"
            >
              <i
                v-if="!authStore.isLoading"
                class="fas fa-sign-in-alt h-5 w-5"
              ></i>
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

// Form state
const clientId = ref("");
const password = ref("");
const showPassword = ref(false);

const errors = ref({
  clientId: "",
  password: "",
});

// Computed
const isFormValid = computed(() => {
  return clientId.value.trim().length > 0 && password.value.trim().length > 0;
});

// Methods
function clearForm() {
  clientId.value = "";
  password.value = "";
  errors.value = {
    clientId: "",
    password: "",
  };
}

function validateForm(): boolean {
  errors.value = {
    clientId: "",
    password: "",
  };

  let isValid = true;

  if (!clientId.value.trim()) {
    errors.value.clientId = "Client ID is required";
    isValid = false;
  }

  if (!password.value.trim()) {
    errors.value.password = "Password is required";
    isValid = false;
  }

  return isValid;
}

async function handleLogin() {
  if (!validateForm()) {
    return;
  }

  try {
    const credentials = {
      clientId: clientId.value.trim(),
      password: password.value.trim(),
    };

    await authStore.login(credentials);

    // Redirect to intended page or home
    const redirectPath = (route.query.redirect as string) || "/";
    router.push(redirectPath);
  } catch (error) {
    // Error is handled by the auth store
    console.error("Login failed:", error);
  }
}
</script>
