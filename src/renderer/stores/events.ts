import { defineStore } from 'pinia'
import api from '../utls/api'

export type GameEvent = {
    id?: number;
    gameId: number;
    gameName: string;
    startTime: string | Date; // Can be ISO string or Date object
    endTime: string | Date; // Can be ISO string or Date object
    status: 'active' | 'cancelled';
    description?: string;
    // Game image fields from JOIN
    gameIcon?: string;
    gameLogo?: string;
    gameImageCard?: string;
    // Computed status based on timestamps
    computedStatus?: 'upcoming' | 'active' | 'completed';
};

export type CreateEventType = {
    gameId: number;
    gameName: string;
    startTime: string;
    endTime: string;
    status?: 'active' | 'cancelled';
    description?: string;
};

// Utility function to compute event status based on timestamps
export function computeEventStatus(startTime: string | Date, endTime: string | Date, manualStatus: 'active' | 'cancelled'): 'upcoming' | 'active' | 'completed' | 'cancelled' {
    if (manualStatus === 'cancelled') {
        return 'cancelled';
    }

    const now = new Date();
    const start = typeof startTime === 'string' ? new Date(startTime) : startTime;
    const end = typeof endTime === 'string' ? new Date(endTime) : endTime;

    if (now < start) {
        return 'upcoming';
    } else if (now >= start && now <= end) {
        return 'active';
    } else {
        return 'completed';
    }
}

export const useEventsStore = defineStore('events', {
    state: () => ({
        events: [] as GameEvent[],
        isLoading: false,
        error: null as string | null
    }),

    getters: {
        getEventById: (state) => (id: number) => {
            return state.events.find(event => event.id === id);
        },

        getEventsByGame: (state) => (gameId: number) => {
            return state.events.filter(event => event.gameId === gameId);
        },

        getEventsByStatus: (state) => (status: string) => {
            return state.events.filter(event => {
                const computedStatus = computeEventStatus(event.startTime, event.endTime, event.status);
                return computedStatus === status;
            });
        },

        upcomingEvents: (state) => {
            return state.events.filter(event => {
                const computedStatus = computeEventStatus(event.startTime, event.endTime, event.status);
                return computedStatus === 'upcoming';
            });
        },

        // Add computed status to all events
        eventsWithComputedStatus: (state) => {
            return state.events.map(event => ({
                ...event,
                computedStatus: computeEventStatus(event.startTime, event.endTime, event.status)
            }));
        }
    },

    actions: {
        async fetchEvents() {
            this.isLoading = true;
            this.error = null;
            try {
                const response = await api.get<GameEvent[]>('/api/events');
                this.events = response.data;
            } catch (error: any) {
                this.error = error.message || 'Failed to fetch events';
                console.error('Error fetching events:', error);
            } finally {
                this.isLoading = false;
            }
        },

        async fetchEventById(id: number) {
            this.isLoading = true;
            this.error = null;
            try {
                const response = await api.get<GameEvent>(`/api/events/${id}`);
                return response.data;
            } catch (error: any) {
                this.error = error.message || 'Failed to fetch event';
                console.error('Error fetching event:', error);
                throw error;
            } finally {
                this.isLoading = false;
            }
        },

        async createEvent(eventData: CreateEventType) {
            this.isLoading = true;
            this.error = null;
            try {
                const response = await api.post<GameEvent>('/api/events', eventData);
                this.events.push(response.data);
                return response.data;
            } catch (error: any) {
                this.error = error.message || 'Failed to create event';
                console.error('Error creating event:', error);
                throw error;
            } finally {
                this.isLoading = false;
            }
        },

        async updateEvent(id: number, eventData: Partial<CreateEventType>) {
            this.isLoading = true;
            this.error = null;
            try {
                const response = await api.put<GameEvent>(`/api/events/${id}`, eventData);
                const index = this.events.findIndex(event => event.id === id);
                if (index !== -1) {
                    this.events[index] = response.data;
                }
                return response.data;
            } catch (error: any) {
                this.error = error.message || 'Failed to update event';
                console.error('Error updating event:', error);
                throw error;
            } finally {
                this.isLoading = false;
            }
        },

        async deleteEvent(id: number) {
            this.isLoading = true;
            this.error = null;
            try {
                await api.delete(`/api/events/${id}`);
                this.events = this.events.filter(event => event.id !== id);
            } catch (error: any) {
                this.error = error.message || 'Failed to delete event';
                console.error('Error deleting event:', error);
                throw error;
            } finally {
                this.isLoading = false;
            }
        },

        async updateEventStatus(id: number, status: 'active' | 'cancelled') {
            this.isLoading = true;
            this.error = null;
            try {
                const response = await api.put<GameEvent>(`/api/events/${id}/status`, { status });
                const index = this.events.findIndex(event => event.id === id);
                if (index !== -1) {
                    this.events[index] = response.data;
                }
                return response.data;
            } catch (error: any) {
                this.error = error.message || 'Failed to update event status';
                console.error('Error updating event status:', error);
                throw error;
            } finally {
                this.isLoading = false;
            }
        }
    }
});