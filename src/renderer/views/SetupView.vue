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
              <i class="fas fa-cogs text-primary text-2xl"></i>
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
                    <i class="fas fa-user text-accent"></i>
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
                    <i class="fas fa-id-badge text-secondary"></i>
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
                    <i class="fas fa-lock text-warning"></i>
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
                  <i v-if="showPassword" class="fas fa-eye-slash"></i>
                  <i v-else class="fas fa-eye"></i>
                </button>
              </div>
            </div>

            <!-- Confirm Password Field -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-medium">
                  <span class="flex items-center gap-2">
                    <i class="fas fa-check-circle text-warning"></i>
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
                  <i v-if="showConfirmPassword" class="fas fa-eye-slash"></i>
                  <i v-else class="fas fa-eye"></i>
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
              <i class="fas fa-exclamation-circle"></i>
              <span>{{ error }}</span>
            </div>

            <!-- Setup Button -->
            <button
              type="submit"
              class="btn btn-primary w-full hover:btn-primary-focus transition-all duration-200"
              :class="{ loading: isLoading }"
              :disabled="isLoading || !isFormValid"
            >
              <i v-if="!isLoading" class="fas fa-user-plus"></i>
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
