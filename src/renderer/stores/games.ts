import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import api from '../utls/api'
import type { AxiosProgressEvent } from 'axios';

export type getGameType = {
    id?: number,
    gameID: string, // Unique identifier for the game
    name: string,
    description: string,
    icon?: string,
    logo?: string,
    headerImage?: string,
    imageCard?: string,
    heroImage?: string,
    archives?: string, // Path to uploaded archive
    type: string,
    install: string, // Install script
    uninstall: string, // Uninstall script
    play: string, // Play script
    needsKey: string,
    executable: string, // Path to the executable file
    executables?: string[], // Array of process names to monitor
    status: string,
    keys: string[]
};

export type postGameType = {
    id?: number,
    gameID: string, // Unique identifier for the game
    name: string,
    description: string,
    icon?: File,
    logo?: File,
    headerImage?: File,
    imageCard?: File,
    heroImage?: File,
    archives?: File, // Path to uploaded archive
    type: string,
    install: string, // Install script
    uninstall: string, // Uninstall script
    play: string, // Play script
    needsKey: string,
    executable: string, // Path to the executable file
    executables?: string[], // Array of process names to monitor
    status: string,
    keys: string[]
};

function setFormData(gameData: postGameType): FormData {
    const formData = new FormData();

    console.log('setFormData - Input gameData:', gameData);
    console.log('setFormData - executables value:', gameData.executables);

    for (const key in gameData) {
        const typedKey = key as keyof postGameType;
        const value = gameData[typedKey];

        console.log(`Processing key: ${key}, value:`, value, 'type:', typeof value);

        // Skip null and undefined, but allow empty arrays and empty strings
        if (value !== undefined && value !== null) {
            // Convert executables array to JSON string for transmission
            if (typedKey === 'executables' && Array.isArray(value)) {
                const jsonString = JSON.stringify(value);
                console.log(`Converting executables array (length: ${value.length}) to JSON: ${jsonString}`);
                formData.append(key, jsonString);
            } else if (!Array.isArray(value)) {
                // Don't append other arrays (like keys) - only executables
                formData.append(key, value as any);
            }
        }
    }

    console.log('FormData entries:');
    for (const [key, value] of formData.entries()) {
        console.log(`  ${key}: ${value}`);
    }

    return formData;
}

export const useGamesStore = defineStore('games', {
    state: () => ({
        games: [] as getGameType[],
        uploadProgress: void 0 as number | undefined,
        isProcessing: false
    }),

    getters: {
        getGameById: (state) => {
            const game = (id: number) => state.games.find(game => game.id === id);
            return game;
        },
        hasGame: (state) => (gameID: string) => {
            return state.games.some(game => game.gameID == gameID);
        }
    },
    actions: {
        async getGames() {
            const response = await api.get('/api/games')
            this.games = response.data.data || response.data || []
        },

        async deleteGame(gameId: number) {
            try {
                await api.delete(`/api/games/${gameId}`);
                this.games = this.games.filter(game => game.id !== gameId);
            } catch (error) {
                console.error("Error deleting game:", error);
            }
        },

        async createGame(gameData: postGameType) {

            const formData = setFormData(gameData);

            const response = await api.post<{ data: postGameType }>('/api/games', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Accept': 'application/json'
                }
            });
            this.games.push(response.data.data as getGameType)
            return response.data.data as getGameType;
        },

        async updateGame(id: string, gameData: postGameType) {
            this.isProcessing = true;
            try {
                const formData = setFormData(gameData);
                const response = await api.put<{ data: postGameType }>(`/api/games/${id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Accept': 'application/json'
                    },
                    onUploadProgress: (progressEvent: AxiosProgressEvent) => {
                        console.log(progressEvent.lengthComputable);
                        if (progressEvent.lengthComputable) {
                            console.log(progressEvent);
                            const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total ?? 0));
                            // You can emit or handle percentCompleted here as needed
                            console.log(`Upload progress: ${percentCompleted}%`);
                            this.uploadProgress = percentCompleted;
                        }
                    }
                });
                this.games.push(response.data.data as getGameType)
            } finally {
                this.isProcessing = false;
                this.uploadProgress = void 0; // Reset progress after upload
            }
        }
    }
});
