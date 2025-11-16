<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../utls/api';

const serverName = ref('');
const logoUrl = ref('');
const logoFile = ref<File | null>(null);
const logoPreview = ref('');
const isLoading = ref(false);
const isSaving = ref(false);
const isUploadingLogo = ref(false);
const showSuccess = ref(false);
const showError = ref(false);
const errorMessage = ref('');

onMounted(async () => {
  await loadSettings();
});

async function loadSettings() {
  isLoading.value = true;
  try {
    const response = await api.get('/api/settings');
    serverName.value = response.data.server_name || 'LAN Nexus Server';
    logoUrl.value = response.data.server_logo || '';
  } catch (error) {
    console.error('Failed to load settings:', error);
    serverName.value = 'LAN Nexus Server';
  } finally {
    isLoading.value = false;
  }
}

async function saveSettings() {
  isSaving.value = true;
  showSuccess.value = false;
  showError.value = false;

  try {
    await api.put('/api/settings', {
      server_name: serverName.value
    });

    console.log('✅ Settings saved successfully');
    showSuccess.value = true;

    // Hide success message after 3 seconds
    setTimeout(() => {
      showSuccess.value = false;
    }, 3000);
  } catch (error) {
    console.error('Failed to save settings:', error);
    errorMessage.value = error instanceof Error ? error.message : 'Failed to save settings';
    showError.value = true;

    setTimeout(() => {
      showError.value = false;
    }, 5000);
  } finally {
    isSaving.value = false;
  }
}

function handleLogoSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  
  if (file) {
    logoFile.value = file;
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      logoPreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
}

async function uploadLogo() {
  if (!logoFile.value) return;

  isUploadingLogo.value = true;
  showSuccess.value = false;
  showError.value = false;

  try {
    const formData = new FormData();
    formData.append('logo', logoFile.value);

    const response = await api.post('/api/settings/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    logoUrl.value = response.data.logo;
    logoPreview.value = '';
    logoFile.value = null;

    console.log('✅ Logo uploaded successfully');
    showSuccess.value = true;

    setTimeout(() => {
      showSuccess.value = false;
    }, 3000);
  } catch (error) {
    console.error('Failed to upload logo:', error);
    errorMessage.value = error instanceof Error ? error.message : 'Failed to upload logo';
    showError.value = true;

    setTimeout(() => {
      showError.value = false;
    }, 5000);
  } finally {
    isUploadingLogo.value = false;
  }
}

function removeLogo() {
  logoPreview.value = '';
  logoFile.value = null;
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-base-100 to-base-200 p-8">
    <!-- Success Toast -->
    <div v-if="showSuccess" class="toast toast-top toast-end z-50">
      <div class="alert alert-success shadow-xl">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Settings saved successfully!</span>
      </div>
    </div>

    <!-- Error Toast -->
    <div v-if="showError" class="toast toast-top toast-end z-50">
      <div class="alert alert-error shadow-xl">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ errorMessage }}</span>
      </div>
    </div>

    <!-- Header -->
    <div class="flex items-center gap-4 mb-8">
      <div class="p-3 bg-primary/10 rounded-xl">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <div>
        <h1 class="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Server Settings
        </h1>
        <p class="text-base-content/60 mt-1">Configure your LAN Nexus server</p>
      </div>
    </div>

    <!-- Settings Card -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <template v-if="isLoading">
          <div class="flex items-center justify-center py-12">
            <span class="loading loading-spinner loading-lg text-primary"></span>
          </div>
        </template>

        <template v-else>
          <!-- Server Name Setting -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold">Server Name</span>
              <span class="label-text-alt text-base-content/50">Shown to clients during connection</span>
            </label>
            <input
              type="text"
              v-model="serverName"
              class="input input-bordered w-full"
              placeholder="LAN Nexus Server"
              :disabled="isSaving"
            />
            <label class="label">
              <span class="label-text-alt">This name appears when clients discover your server</span>
            </label>
          </div>

          <div class="divider"></div>

          <!-- Logo Setting -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold">Server Logo</span>
              <span class="label-text-alt text-base-content/50">Branding for your server</span>
            </label>

            <!-- Current Logo Preview -->
            <div v-if="logoUrl && !logoPreview" class="mb-4">
              <div class="text-sm text-base-content/60 mb-2">Current Logo:</div>
              <div class="avatar">
                <div class="w-24 rounded">
                  <img :src="logoUrl" alt="Server Logo" />
                </div>
              </div>
            </div>

            <!-- New Logo Preview -->
            <div v-if="logoPreview" class="mb-4">
              <div class="text-sm text-base-content/60 mb-2">New Logo Preview:</div>
              <div class="flex items-center gap-4">
                <div class="avatar">
                  <div class="w-24 rounded">
                    <img :src="logoPreview" alt="Logo Preview" />
                  </div>
                </div>
                <button @click="removeLogo" class="btn btn-ghost btn-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Remove
                </button>
              </div>
            </div>

            <!-- File Input -->
            <div class="flex gap-2">
              <input
                type="file"
                @change="handleLogoSelect"
                accept="image/*"
                class="file-input file-input-bordered flex-1"
                :disabled="isUploadingLogo"
              />
              <button
                v-if="logoFile"
                @click="uploadLogo"
                class="btn btn-primary"
                :disabled="isUploadingLogo"
              >
                <span class="loading loading-spinner loading-sm" v-if="isUploadingLogo"></span>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                {{ isUploadingLogo ? 'Uploading...' : 'Upload' }}
              </button>
            </div>
            <label class="label">
              <span class="label-text-alt">Recommended size: 256x256px or larger, PNG or JPG format</span>
            </label>
          </div>

          <!-- Info Alert -->
          <div class="alert alert-info mt-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div class="text-sm">
              <strong>Tip:</strong> Use a descriptive name like "My Cool LAN Party Server" or "Gaming Room Server" to help clients identify your server.
            </div>
          </div>

          <!-- Save Button -->
          <div class="card-actions justify-end mt-6">
            <button
              @click="saveSettings"
              class="btn btn-primary gap-2"
              :disabled="isSaving"
            >
              <svg v-if="!isSaving" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              <span class="loading loading-spinner loading-sm" v-if="isSaving"></span>
              {{ isSaving ? 'Saving...' : 'Save Settings' }}
            </button>
          </div>
        </template>
      </div>
    </div>

    <!-- Additional Settings (Future Expansion) -->
    <div class="card bg-base-100 shadow-xl mt-6">
      <div class="card-body">
        <h3 class="card-title text-lg mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Advanced Settings
        </h3>
        <p class="text-base-content/50 text-sm">Additional settings will appear here in future updates.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-box {
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
