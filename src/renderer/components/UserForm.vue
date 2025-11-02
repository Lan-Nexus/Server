<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Avatar Preview -->
    <div class="form-control">
      <label class="label">
        <span class="label-text font-medium">
          <span class="flex items-center gap-2">
            <i class="fas fa-image text-accent"></i>
            Avatar Preview
          </span>
        </span>
      </label>
      <div
        class="flex items-center gap-4 p-4 bg-base-200/30 rounded-lg border border-base-300/20"
      >
        <UserAvatar
          :name="formData.name || 'User'"
          size="lg"
          :hover="false"
          :avatar="formData.avatar"
        />
        <div class="flex-1">
          <p class="text-sm text-base-content/70">
            This is how the user's avatar will appear throughout the
            application.
          </p>
          <p class="text-xs text-base-content/50 mt-1">
            {{
              formData.avatar
                ? "Custom avatar from external source"
                : "Avatar color is automatically generated based on the user's name."
            }}
          </p>
        </div>
      </div>
    </div>

    <!-- Name Field -->
    <div class="form-control">
      <label class="label">
        <span class="label-text font-medium">
          <span class="flex items-center gap-2">
            <i class="fas fa-user text-primary"></i>
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
            <i class="fas fa-tag text-secondary"></i>
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
            'input-success':
              formData.clientId && !errors.clientId && isClientIdValid,
          }"
          required
          maxlength="255"
          @blur="validateClientId"
        />
        <div class="absolute inset-y-0 right-0 flex items-center pr-3">
          <i
            v-if="formData.clientId && !errors.clientId && isClientIdValid"
            class="fas fa-check-circle text-success"
          ></i>
          <i
            v-else-if="errors.clientId"
            class="fas fa-exclamation-circle text-error"
          ></i>
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
        <i class="fas fa-times"></i>
        Cancel
      </button>
      <button
        type="submit"
        class="btn btn-primary hover:btn-primary-focus transition-all duration-200"
        :disabled="isLoading || !isFormValid"
        :class="{ loading: isLoading }"
      >
        <i v-if="!isLoading" class="fas fa-check"></i>
        {{ submitText }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useUsersStore, type User, type CreateUserType } from "@/stores/users";
import UserAvatar from "@/components/common/UserAvatar.vue";

interface Props {
  user?: User;
  isLoading?: boolean;
  submitText?: string;
}

interface Emits {
  (e: "submit", data: CreateUserType): void;
  (e: "cancel"): void;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  submitText: "Save User",
});

const emit = defineEmits<Emits>();

const usersStore = useUsersStore();

const formData = ref<CreateUserType>({
  name: "",
  clientId: "",
  avatar: null,
});

const errors = ref({
  name: "",
  clientId: "",
});

const isClientIdValid = ref(false);

// Computed properties
const isFormValid = computed(() => {
  return (
    formData.value.name.trim().length > 0 &&
    formData.value.clientId.trim().length > 0 &&
    !errors.value.name &&
    !errors.value.clientId &&
    isClientIdValid.value
  );
});

// Initialize form with existing user data
onMounted(() => {
  if (props.user) {
    formData.value = {
      name: props.user.name,
      clientId: props.user.clientId,
      avatar: props.user.avatar,
    };
    isClientIdValid.value = true;
  }
});

// Watch for prop changes
watch(
  () => props.user,
  (newUser) => {
    if (newUser) {
      formData.value = {
        name: newUser.name,
        clientId: newUser.clientId,
        avatar: newUser.avatar,
      };
      isClientIdValid.value = true;
    } else {
      resetForm();
    }
  },
  { deep: true }
);

// Validate name
function validateName() {
  errors.value.name = "";

  if (!formData.value.name.trim()) {
    errors.value.name = "Name is required";
    return false;
  }

  if (formData.value.name.length > 255) {
    errors.value.name = "Name must be less than 255 characters";
    return false;
  }

  return true;
}

// Validate client ID
function validateClientId() {
  errors.value.clientId = "";
  isClientIdValid.value = false;

  if (!formData.value.clientId.trim()) {
    errors.value.clientId = "Client ID is required";
    return false;
  }

  if (formData.value.clientId.length > 255) {
    errors.value.clientId = "Client ID must be less than 255 characters";
    return false;
  }

  // Check if client ID is available (excluding current user when editing)
  const excludeId = props.user?.id;
  if (!usersStore.isClientIdAvailable(formData.value.clientId, excludeId)) {
    errors.value.clientId = "This Client ID is already in use";
    return false;
  }

  isClientIdValid.value = true;
  return true;
}

// Validate entire form
function validateForm(): boolean {
  const nameValid = validateName();
  const clientIdValid = validateClientId();

  return nameValid && clientIdValid;
}

// Handle form submission
function handleSubmit() {
  if (!validateForm()) {
    return;
  }

  emit("submit", {
    name: formData.value.name.trim(),
    clientId: formData.value.clientId.trim(),
    avatar: formData.value.avatar,
  });
}

// Reset form
function resetForm() {
  formData.value = {
    name: "",
    clientId: "",
    avatar: null,
  };
  errors.value = {
    name: "",
    clientId: "",
  };
  isClientIdValid.value = false;
}

// Watch form data for real-time validation
watch(() => formData.value.name, validateName);
watch(
  () => formData.value.clientId,
  () => {
    // Only validate if the field has been touched (has content)
    if (formData.value.clientId.trim()) {
      validateClientId();
    } else {
      errors.value.clientId = "";
      isClientIdValid.value = false;
    }
  }
);
</script>
