import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../utls/api';

export const useSettingsStore = defineStore('settings', () => {
  const lanName = ref<string>('LAN Nexus');
  const logoUrl = ref<string>('');
  const serverName = ref<string>('LAN Nexus Server');
  const isLoading = ref<boolean>(false);

  /**
   * Fetch all settings from server
   */
  async function fetchSettings() {
    isLoading.value = true;
    try {
      const response = await api.get('/api/settings');
      
      serverName.value = response.data.server_name || 'LAN Nexus Server';
      lanName.value = response.data.lan_name || 'LAN Nexus';
      logoUrl.value = response.data.logo_url || '';
      
      console.log('✅ Settings loaded:', {
        serverName: serverName.value,
        lanName: lanName.value,
        logoUrl: logoUrl.value
      });
    } catch (error) {
      console.error('Failed to load settings:', error);
      // Keep default values on error
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Update settings on server
   */
  async function updateSettings(updates: {
    server_name?: string;
    lan_name?: string;
    logo_url?: string;
  }) {
    try {
      await api.put('/api/settings', updates);
      
      // Update local state
      if (updates.server_name !== undefined) {
        serverName.value = updates.server_name;
      }
      if (updates.lan_name !== undefined) {
        lanName.value = updates.lan_name;
      }
      if (updates.logo_url !== undefined) {
        logoUrl.value = updates.logo_url;
      }
      
      console.log('✅ Settings updated successfully');
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    }
  }

  /**
   * Reset to default values
   */
  function resetSettings() {
    serverName.value = 'LAN Nexus Server';
    lanName.value = 'LAN Nexus';
    logoUrl.value = '';
  }

  return {
    lanName,
    logoUrl,
    serverName,
    isLoading,
    fetchSettings,
    updateSettings,
    resetSettings
  };
});