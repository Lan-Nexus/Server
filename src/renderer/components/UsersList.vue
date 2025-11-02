<template>
  <div>
    <!-- Header Section -->
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
    >
      <div class="flex items-center gap-3">
        <div class="p-3 bg-primary/10 rounded-xl">
          <i class="fas fa-users text-primary text-2xl"></i>
        </div>
        <div>
          <h1
            class="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
          >
            User Management
          </h1>
          <p class="text-base-content/70">Manage users and their client IDs</p>
        </div>
      </div>

      <button
        @click="$emit('create')"
        class="btn btn-primary hover:btn-primary-focus gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
      >
        <i class="fas fa-plus"></i>
        Add User
      </button>
    </div>

    <!-- Stats and Search Section -->
    <div
      class="bg-base-100/50 backdrop-blur-sm border border-base-300/20 rounded-2xl p-6 shadow-lg"
    >
      <div
        class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
      >
        <!-- Stats -->
        <div class="flex items-center gap-6">
          <div class="stat p-0">
            <div class="stat-title text-sm">Total Users</div>
            <div class="stat-value text-2xl text-primary">
              {{ usersStore.totalUsers }}
            </div>
          </div>
          <div class="divider divider-horizontal"></div>
          <div class="stat p-0">
            <div class="stat-title text-sm">Filtered Results</div>
            <div class="stat-value text-2xl text-secondary">
              {{ filteredUsers.length }}
            </div>
          </div>
        </div>

        <!-- Search -->
        <div class="form-control w-full max-w-xs">
          <div class="relative">
            <input
              v-model="searchTerm"
              type="text"
              placeholder="Search users..."
              class="input input-bordered w-full pl-10 focus:input-primary transition-all duration-200"
            />
            <i
              class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50"
            ></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="usersStore.isLoading" class="flex justify-center py-12">
      <div class="flex items-center gap-3">
        <span class="loading loading-spinner loading-lg text-primary"></span>
        <span class="text-lg">Loading users...</span>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="usersStore.error" class="alert alert-error shadow-lg">
      <i class="fas fa-exclamation-circle"></i>
      <span>{{ usersStore.error }}</span>
      <button @click="usersStore.fetchUsers()" class="btn btn-sm btn-ghost">
        Try Again
      </button>
    </div>

    <!-- Empty State -->
    <div v-else-if="usersStore.users.length === 0" class="text-center py-12">
      <div class="max-w-md mx-auto">
        <div
          class="p-4 bg-base-200/50 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center"
        >
          <i class="fas fa-users text-4xl text-base-content/30"></i>
        </div>
        <h3 class="text-xl font-semibold mb-2">No users yet</h3>
        <p class="text-base-content/60 mb-4">
          Get started by creating your first user.
        </p>
        <button @click="$emit('create')" class="btn btn-primary">
          Add Your First User
        </button>
      </div>
    </div>

    <!-- No Search Results -->
    <div v-else-if="filteredUsers.length === 0" class="text-center py-8">
      <div class="max-w-md mx-auto">
        <div
          class="p-3 bg-warning/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center"
        >
          <i class="fas fa-search text-2xl text-warning"></i>
        </div>
        <h3 class="text-lg font-semibold mb-2">No results found</h3>
        <p class="text-base-content/60">Try adjusting your search terms.</p>
      </div>
    </div>

    <!-- Users Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <div
        v-for="user in filteredUsers"
        :key="user.id"
        class="card bg-base-100/70 backdrop-blur-sm border border-base-300/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
      >
        <div class="card-body">
          <!-- User Header -->
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <UserAvatar
                :name="user.name"
                size="md"
                :hover="true"
                :avatar="user.avatar || undefined"
              />
              <div>
                <h3 class="card-title text-lg">{{ user.name }}</h3>
                <div class="flex items-center gap-2">
                  <p class="text-sm text-base-content/60">ID: {{ user.id }}</p>
                  <span
                    class="badge badge-xs"
                    :class="{
                      'badge-primary': user.role === 'admin',
                      'badge-secondary': user.role === 'user',
                      'badge-neutral': user.role === 'guest',
                    }"
                    >{{ user.role || "user" }}</span
                  >
                </div>
              </div>
            </div>

            <!-- Actions Dropdown -->
            <div class="dropdown dropdown-end">
              <div
                tabindex="0"
                role="button"
                class="btn btn-ghost btn-sm btn-circle hover:btn-primary"
              >
                <i class="fas fa-ellipsis-v"></i>
              </div>
              <ul
                tabindex="0"
                class="dropdown-content menu bg-base-100 border border-base-300/20 rounded-box z-[1] w-44 p-2 shadow-xl"
              >
                <li>
                  <button
                    @click="$emit('edit', user)"
                    class="flex items-center gap-2 hover:bg-secondary/10 hover:text-secondary"
                  >
                    <i class="fas fa-edit"></i>
                    Edit User
                  </button>
                </li>
                <li>
                  <button
                    @click="handleSetPassword(user)"
                    class="flex items-center gap-2 hover:bg-warning/10 hover:text-warning"
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
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-1a2 2 0 00-2-2H6a2 2 0 00-2 2v1a2 2 0 002 2zM11 5a2 2 0 012 0"
                      />
                    </svg>
                    Set Password
                  </button>
                </li>
                <li>
                  <button
                    @click="handleCopyClientId(user.clientId)"
                    class="flex items-center gap-2 hover:bg-info/10 hover:text-info"
                  >
                    <i class="fas fa-copy"></i>
                    Copy Client ID
                  </button>
                </li>
                <div class="divider my-1"></div>
                <li>
                  <button
                    @click="handleDeleteUser(user)"
                    class="flex items-center gap-2 hover:bg-error/10 hover:text-error"
                  >
                    <i class="fas fa-trash"></i>
                    Delete User
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <!-- Client ID -->
          <div class="bg-base-200/50 rounded-lg p-3 border border-base-300/20">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-xs text-base-content/60 mb-1">Client ID</div>
                <div class="font-mono text-sm font-medium">
                  {{ user.clientId }}
                </div>
              </div>
              <div class="flex items-center justify-between mt-2">
                <div>
                  <div class="text-xs text-base-content/60 mb-1">Role</div>
                  <div
                    class="badge badge-sm"
                    :class="{
                      'badge-primary': user.role === 'admin',
                      'badge-secondary': user.role === 'user',
                      'badge-neutral': user.role === 'guest',
                    }"
                  >
                    {{ user.role || "user" }}
                  </div>
                </div>
              </div>
              <button
                @click="handleCopyClientId(user.clientId)"
                class="btn btn-ghost btn-xs hover:btn-info"
                title="Copy Client ID"
              >
                <i class="fas fa-copy"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Copy Success Toast -->
    <div v-if="showCopyToast" class="toast toast-top toast-end z-50">
      <div class="alert alert-success shadow-xl border border-success/20">
        <i class="fas fa-check-circle"></i>
        <span class="font-medium">Client ID copied to clipboard!</span>
      </div>
    </div>

    <!-- Password Modal -->
    <PasswordModal
      :user="userForPassword"
      :show="showPasswordModal"
      @close="closePasswordModal"
      @success="handlePasswordSuccess"
      @error="handlePasswordError"
    />

    <!-- Delete Confirmation Modal -->
    <input
      type="checkbox"
      id="delete-modal"
      class="modal-toggle"
      v-model="showDeleteModal"
    />
    <div class="modal" role="dialog">
      <div
        class="modal-box bg-base-100/95 backdrop-blur-sm border border-base-300/20"
      >
        <div class="flex items-center gap-3 mb-4">
          <div class="p-2 bg-error/10 rounded-lg">
            <i class="fas fa-exclamation-triangle text-error text-xl"></i>
          </div>
          <h3 class="text-lg font-bold text-error">Delete User</h3>
        </div>

        <p class="mb-6 text-base-content/80">
          Are you sure you want to delete
          <strong>{{ userToDelete?.name }}</strong
          >? This action cannot be undone.
        </p>

        <div class="modal-action">
          <button @click="showDeleteModal = false" class="btn btn-ghost">
            Cancel
          </button>
          <button
            @click="confirmDeleteUser"
            class="btn btn-error"
            :disabled="usersStore.isLoading"
          >
            <span
              v-if="usersStore.isLoading"
              class="loading loading-spinner loading-xs"
            ></span>
            Delete User
          </button>
        </div>
      </div>
      <label class="modal-backdrop" for="delete-modal">Close</label>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useUsersStore, type User } from "@/stores/users";
import UserAvatar from "@/components/common/UserAvatar.vue";
import PasswordModal from "@/components/PasswordModal.vue";

interface Emits {
  (e: "create"): void;
  (e: "edit", user: User): void;
}

const emit = defineEmits<Emits>();

const usersStore = useUsersStore();

const searchTerm = ref("");
const showCopyToast = ref(false);
const showDeleteModal = ref(false);
const userToDelete = ref<User | null>(null);

// Password management
const showPasswordModal = ref(false);
const userForPassword = ref<User | null>(null);

// Toast messages
const showSuccessToast = ref(false);
const showErrorToast = ref(false);
const successMessage = ref("");
const errorMessage = ref("");

// Computed properties
const filteredUsers = computed(() => {
  return usersStore.searchUsers(searchTerm.value);
});

// Toast helper function
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

// Handle copying client ID to clipboard
async function handleCopyClientId(clientId: string) {
  try {
    await navigator.clipboard.writeText(clientId);
    showCopyToast.value = true;
    setTimeout(() => {
      showCopyToast.value = false;
    }, 2000);
  } catch (err) {
    console.error("Failed to copy to clipboard:", err);
  }
}

// Handle password setting
function handleSetPassword(user: User) {
  userForPassword.value = user;
  showPasswordModal.value = true;
}

// Close password modal
function closePasswordModal() {
  showPasswordModal.value = false;
  userForPassword.value = null;
}

// Handle password success
function handlePasswordSuccess(message: string) {
  showToast(message);
}

// Handle password error
function handlePasswordError(message: string) {
  showToast(message, true);
}

// Handle delete user
function handleDeleteUser(user: User) {
  userToDelete.value = user;
  showDeleteModal.value = true;
}

// Confirm delete user
async function confirmDeleteUser() {
  if (!userToDelete.value) return;

  try {
    await usersStore.deleteUser(userToDelete.value.id);
    showDeleteModal.value = false;
    userToDelete.value = null;
    showToast("User deleted successfully");
  } catch (error: any) {
    showToast(error.message || "Failed to delete user", true);
  }
}

// Load users on component mount
onMounted(async () => {
  if (usersStore.users.length === 0) {
    try {
      await usersStore.fetchUsers();
    } catch (error) {
      console.error("Failed to load users:", error);
    }
  }
});
</script>
