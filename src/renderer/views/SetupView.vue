<template>
  <div
    class="min-h-screen bg-gradient-to-br from-base-100 to-base-200 flex items-center justify-center p-6"
  >
    <div class="w-full max-w-md">
      <!-- Setup Card -->
      <div
        class="card bg-base-100/90 backdrop-blur-sm border border-base-300/20 shadow-xl"
      >
        <div class="card-body">
          <!-- Header -->
          <div class="flex items-center gap-3 mb-6">
            <div class="p-3 bg-primary/10 rounded-xl">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-8 w-8 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <div>
              <h2
                class="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
              >
                Welcome to Lan-Nexus
              </h2>
              <p class="text-base-content/70">
                Create your admin account to get started
              </p>
            </div>
          </div>

          <!-- Setup Form -->
          <form @submit.prevent="handleSetup" class="space-y-4">
            <!-- Name Field -->
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
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Full Name
                    <span class="text-error text-sm ml-1">*</span>
                  </span>
                </span>
              </label>
              <input
                v-model="form.name"
                type="text"
                placeholder="Enter your full name"
                class="input input-bordered w-full focus:input-accent transition-all duration-200"
                required
                :disabled="isLoading"
              />
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
                    Username (Client ID)
                    <span class="text-error text-sm ml-1">*</span>
                  </span>
                </span>
              </label>
              <input
                v-model="form.clientId"
                type="text"
                placeholder="Choose a username"
                class="input input-bordered w-full focus:input-secondary transition-all duration-200"
                required
                :disabled="isLoading"
              />
            </div>

            <!-- Password Field -->
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
                    Password
                    <span class="text-error text-sm ml-1">*</span>
                  </span>
                </span>
              </label>
              <div class="relative">
                <input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Choose a secure password (min 6 characters)"
                  class="input input-bordered w-full pr-10 focus:input-warning transition-all duration-200"
                  required
                  :disabled="isLoading"
                  minlength="6"
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
                    <span class="text-error text-sm ml-1">*</span>
                  </span>
                </span>
              </label>
              <div class="relative">
                <input
                  v-model="form.confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  placeholder="Confirm your password"
                  class="input input-bordered w-full pr-10 focus:input-warning transition-all duration-200"
                  :class="{
                    'input-error':
                      form.confirmPassword &&
                      form.password !== form.confirmPassword,
                  }"
                  required
                  :disabled="isLoading"
                />
                <button
                  type="button"
                  @click="showConfirmPassword = !showConfirmPassword"
                  class="absolute inset-y-0 right-0 flex items-center pr-3 hover:text-warning transition-colors"
                >
                  <svg
                    v-if="showConfirmPassword"
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
              <label
                v-if="
                  form.confirmPassword && form.password !== form.confirmPassword
                "
                class="label"
              >
                <span class="label-text-alt text-error"
                  >Passwords do not match</span
                >
              </label>
            </div>

            <!-- Error Display -->
            <div v-if="error" class="alert alert-error">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{{ error }}</span>
            </div>

            <!-- Setup Button -->
            <button
              type="submit"
              class="btn btn-primary w-full hover:btn-primary-focus transition-all duration-200"
              :class="{ loading: isLoading }"
              :disabled="isLoading || !isFormValid"
            >
              <svg
                v-if="!isLoading"
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
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Create Admin Account
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const isLoading = ref(false);
const error = ref("");
const showPassword = ref(false);
const showConfirmPassword = ref(false);

const form = ref({
  name: "",
  clientId: "",
  password: "",
  confirmPassword: "",
});

const isFormValid = computed(() => {
  return (
    form.value.name.trim() !== "" &&
    form.value.clientId.trim() !== "" &&
    form.value.password.length >= 6 &&
    form.value.password === form.value.confirmPassword
  );
});

const handleSetup = async () => {
  if (!isFormValid.value) {
    error.value = "Please fill in all fields correctly";
    return;
  }

  if (form.value.password !== form.value.confirmPassword) {
    error.value = "Passwords do not match";
    return;
  }

  isLoading.value = true;
  error.value = "";

  try {
    const setupData = {
      name: form.value.name.trim(),
      clientId: form.value.clientId.trim(),
      password: form.value.password,
    };

    const response = await fetch("/auth/setup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(setupData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Setup failed");
    }

    // Store the authentication data
    authStore.setAuth(data.token, data.user);

    // Redirect to home page
    router.push("/");
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Setup failed";
  } finally {
    isLoading.value = false;
  }
};
</script>
