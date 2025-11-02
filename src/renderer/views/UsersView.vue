<template>
  <div class="min-h-screen bg-gradient-to-br from-base-100 to-base-200 p-6">
    <!-- Create User Modal -->
    <input
      type="checkbox"
      id="create-modal"
      class="modal-toggle"
      v-model="showCreateModal"
    />
    <div class="modal" role="dialog">
      <div
        class="modal-box max-w-2xl bg-base-100/95 backdrop-blur-sm border border-base-300/20"
      >
        <div
          class="flex justify-between items-center mb-6 pb-4 border-b border-base-300/20"
        >
          <div class="flex items-center gap-3">
            <div class="p-2 bg-primary/10 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <h3
              class="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
            >
              Create New User
            </h3>
          </div>
          <label
            for="create-modal"
            class="btn btn-sm btn-circle btn-ghost hover:btn-error transition-all duration-200"
          >
            ✕
          </label>
        </div>
        <UserForm
          :is-loading="usersStore.isLoading"
          submit-text="Create User"
          @submit="handleCreateUser"
          @cancel="showCreateModal = false"
        />
      </div>
      <label class="modal-backdrop" for="create-modal">Close</label>
    </div>

    <!-- Edit User Modal -->
    <input
      type="checkbox"
      id="edit-modal"
      class="modal-toggle"
      v-model="showEditModal"
    />
    <div class="modal" role="dialog">
      <div
        class="modal-box max-w-2xl bg-base-100/95 backdrop-blur-sm border border-base-300/20"
      >
        <div
          class="flex justify-between items-center mb-6 pb-4 border-b border-base-300/20"
        >
          <div class="flex items-center gap-3">
            <div class="p-2 bg-secondary/10 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6 text-secondary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <h3
              class="text-xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent"
            >
              Edit User
            </h3>
          </div>
          <label
            for="edit-modal"
            class="btn btn-sm btn-circle btn-ghost hover:btn-error transition-all duration-200"
          >
            ✕
          </label>
        </div>
        <UserForm
          v-if="editingUser"
          :user="editingUser"
          :is-loading="usersStore.isLoading"
          submit-text="Update User"
          @submit="handleUpdateUser"
          @cancel="closeEditModal"
        />
      </div>
      <label class="modal-backdrop" for="edit-modal">Close</label>
    </div>

    <!-- Success Toast -->
    <div v-if="showSuccessToast" class="toast toast-top toast-end z-50">
      <div class="alert alert-success shadow-xl border border-success/20">
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
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span class="font-medium">{{ successMessage }}</span>
      </div>
    </div>

    <!-- Error Toast -->
    <div v-if="showErrorToast" class="toast toast-top toast-end z-50">
      <div class="alert alert-error shadow-xl border border-error/20">
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
        <span class="font-medium">{{ errorMessage }}</span>
      </div>
    </div>

    <!-- Main Content -->
    <UsersList @create="showCreateModal = true" @edit="handleEditUser" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  useUsersStore,
  type CreateUserType,
  type User,
} from "@/stores/users";
import UserForm from "@/components/UserForm.vue";
import UsersList from "@/components/UsersList.vue";

const usersStore = useUsersStore();
const router = useRouter();

const showCreateModal = ref(false);
const showEditModal = ref(false);
const editingUser = ref<User | null>(null);

const showSuccessToast = ref(false);
const showErrorToast = ref(false);
const successMessage = ref("");
const errorMessage = ref("");

function showToast(message: string, isError = false) {
  if (isError) {
    errorMessage.value = message;
    showErrorToast.value = true;
    setTimeout(() => {
      showErrorToast.value = false;
    }, 3000);
  } else {
    successMessage.value = message;
    showSuccessToast.value = true;
    setTimeout(() => {
      showSuccessToast.value = false;
    }, 3000);
  }
}

async function handleCreateUser(userData: CreateUserType) {
  try {
    await usersStore.createUser(userData);
    showCreateModal.value = false;
    showToast("User created successfully!");
  } catch (error: any) {
    showToast(error.message || "Failed to create user", true);
  }
}

function handleEditUser(user: User) {
  editingUser.value = user;
  showEditModal.value = true;
}

async function handleUpdateUser(userData: CreateUserType) {
  if (!editingUser.value?.id) return;

  try {
    await usersStore.updateUser(editingUser.value.id, userData);
    closeEditModal();
    showToast("User updated successfully!");
  } catch (error: any) {
    showToast(error.message || "Failed to update user", true);
  }
}

function closeEditModal() {
  showEditModal.value = false;
  editingUser.value = null;
}

// Load users on mount
onMounted(() => {
  // Router guard handles authentication, so we can safely load users
});
</script>