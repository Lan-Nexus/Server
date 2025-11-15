import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../utls/api'
import webSocketManager, { type GameEventEventData, type WebSocketCallbacks } from '@/utls/websocket'

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

export const useEventsStore = defineStore('events', () => {
    // State
    const events = ref<GameEvent[]>([])
    const isLoading = ref(false)
    const error = ref<string | null>(null)
    const isConnected = ref(false)
    const isWebSocketEnabled = ref(true)

    // WebSocket event handlers
    function handleEventCreated(eventData: GameEventEventData) {
        console.log('🎯 [Events Store] Event created via WebSocket:', eventData)
        console.log('🎯 [Events Store] Current events count:', events.value.length)
        console.log('🎯 [Events Store] Event already exists?', !!events.value.find(e => e.id === eventData.id))
        
        if (eventData.id && !events.value.find(e => e.id === eventData.id)) {
            events.value.push(eventData as GameEvent)
            console.log('🎯 [Events Store] Event added! New count:', events.value.length)
        } else {
            console.log('🎯 [Events Store] Event NOT added (duplicate or no ID)')
        }
    }

    function handleEventUpdated(eventData: GameEventEventData) {
        console.log('🎯 [Events Store] Event updated via WebSocket:', eventData)
        console.log('🎯 [Events Store] Current events:', events.value.map(e => ({ id: e.id, gameName: e.gameName })))
        
        const index = events.value.findIndex(e => e.id === eventData.id)
        console.log('🎯 [Events Store] Found event at index:', index)
        
        if (index !== -1) {
            const oldEvent = events.value[index]
            events.value[index] = { ...oldEvent, ...eventData as GameEvent }
            console.log('🎯 [Events Store] Event updated from:', oldEvent, 'to:', events.value[index])
        } else {
            console.log('🎯 [Events Store] Event NOT found for update')
        }
    }

    function handleEventDeleted(data: { id: number }) {
        console.log('🎯 [Events Store] Event deleted via WebSocket:', data.id)
        console.log('🎯 [Events Store] Current events count:', events.value.length)
        
        const beforeLength = events.value.length
        events.value = events.value.filter(e => e.id !== data.id)
        
        console.log('🎯 [Events Store] Events after deletion:', events.value.length)
        console.log('🎯 [Events Store] Actually removed?', beforeLength > events.value.length)
    }

    function handleEventStatusUpdated(data: { id: number; status: 'active' | 'cancelled' }) {
        console.log('🎯 [Events Store] Event status updated via WebSocket:', data)
        
        const event = events.value.find(e => e.id === data.id)
        if (event) {
            const oldStatus = event.status
            event.status = data.status
            console.log('🎯 [Events Store] Status changed from', oldStatus, 'to', event.status)
        } else {
            console.log('🎯 [Events Store] Event NOT found for status update')
        }
    }

    function handleEventsListUpdated(data: { events: GameEventEventData[] }) {
        console.log('🎯 [Events Store] Events list updated via WebSocket:', data.events.length, 'events')
        console.log('🎯 [Events Store] Previous events count:', events.value.length)
        
        events.value = data.events as GameEvent[]
        
        console.log('🎯 [Events Store] New events count:', events.value.length)
        console.log('🎯 [Events Store] Events:', events.value.map(e => ({ id: e.id, gameName: e.gameName, status: e.status })))
    }

    function handleWebSocketConnected() {
        console.log('🎯 [Events Store] WebSocket connected - events store')
        isConnected.value = true
        error.value = null
    }

    function handleWebSocketDisconnected() {
        console.log('🎯 [Events Store] WebSocket disconnected - events store')
        isConnected.value = false
    }

    function handleWebSocketError(wsError: any) {
        console.error('🎯 [Events Store] WebSocket error in events store:', wsError)
    }

    // Initialize WebSocket connection and event handlers
    function initializeWebSocket() {
        console.log('🎯 [Events Store] Initializing WebSocket...')
        console.log('🎯 [Events Store] WebSocket enabled?', isWebSocketEnabled.value)
        
        if (!isWebSocketEnabled.value) {
            console.log('🎯 [Events Store] WebSocket disabled, skipping initialization')
            return
        }
        
        const callbacks: WebSocketCallbacks = {
            onEventCreated: handleEventCreated,
            onEventUpdated: handleEventUpdated,
            onEventDeleted: handleEventDeleted,
            onEventStatusUpdated: handleEventStatusUpdated,
            onEventsListUpdated: handleEventsListUpdated,
            onConnected: handleWebSocketConnected,
            onDisconnected: handleWebSocketDisconnected,
            onError: handleWebSocketError
        }
        
        console.log('🎯 [Events Store] Setting callbacks:', Object.keys(callbacks))
        webSocketManager.setCallbacks(callbacks)
        isConnected.value = webSocketManager.getConnectionStatus()
        console.log('🎯 [Events Store] WebSocket initialized. Connected?', isConnected.value)
    }

    // Cleanup WebSocket connection
    function cleanupWebSocket() {
        webSocketManager.setCallbacks({})
    }

    // Toggle WebSocket functionality
    function toggleWebSocket() {
        isWebSocketEnabled.value = !isWebSocketEnabled.value
        if (isWebSocketEnabled.value) {
            initializeWebSocket()
        } else {
            cleanupWebSocket()
            isConnected.value = false
        }
    }

    // Actions
    async function fetchEvents() {
        isLoading.value = true
        error.value = null
        try {
            const response = await api.get<GameEvent[]>('/api/events')
            events.value = response.data
        } catch (err: any) {
            error.value = err.message || 'Failed to fetch events'
            console.error('Error fetching events:', err)
        } finally {
            isLoading.value = false
        }
    }

    async function fetchEventById(id: number) {
        isLoading.value = true
        error.value = null
        try {
            const response = await api.get<GameEvent>(`/api/events/${id}`)
            return response.data
        } catch (err: any) {
            error.value = err.message || 'Failed to fetch event'
            console.error('Error fetching event:', err)
            throw err
        } finally {
            isLoading.value = false
        }
    }

    async function createEvent(eventData: CreateEventType) {
        isLoading.value = true
        error.value = null
        try {
            const response = await api.post<GameEvent>('/api/events', eventData)
            // WebSocket will handle adding to the list
            if (!isWebSocketEnabled.value || !isConnected.value) {
                events.value.push(response.data)
            }
            return response.data
        } catch (err: any) {
            error.value = err.message || 'Failed to create event'
            console.error('Error creating event:', err)
            throw err
        } finally {
            isLoading.value = false
        }
    }

    async function updateEvent(id: number, eventData: Partial<CreateEventType>) {
        isLoading.value = true
        error.value = null
        try {
            const response = await api.put<GameEvent>(`/api/events/${id}`, eventData)
            // WebSocket will handle updating the list
            if (!isWebSocketEnabled.value || !isConnected.value) {
                const index = events.value.findIndex(event => event.id === id)
                if (index !== -1) {
                    events.value[index] = response.data
                }
            }
            return response.data
        } catch (err: any) {
            error.value = err.message || 'Failed to update event'
            console.error('Error updating event:', err)
            throw err
        } finally {
            isLoading.value = false
        }
    }

    async function deleteEvent(id: number) {
        isLoading.value = true
        error.value = null
        try {
            await api.delete(`/api/events/${id}`)
            // WebSocket will handle removing from the list
            if (!isWebSocketEnabled.value || !isConnected.value) {
                events.value = events.value.filter(event => event.id !== id)
            }
        } catch (err: any) {
            error.value = err.message || 'Failed to delete event'
            console.error('Error deleting event:', err)
            throw err
        } finally {
            isLoading.value = false
        }
    }

    async function updateEventStatus(id: number, status: 'active' | 'cancelled') {
        isLoading.value = true
        error.value = null
        try {
            const response = await api.put<GameEvent>(`/api/events/${id}/status`, { status })
            // WebSocket will handle updating the list
            if (!isWebSocketEnabled.value || !isConnected.value) {
                const index = events.value.findIndex(event => event.id === id)
                if (index !== -1) {
                    events.value[index] = response.data
                }
            }
            return response.data
        } catch (err: any) {
            error.value = err.message || 'Failed to update event status'
            console.error('Error updating event status:', err)
            throw err
        } finally {
            isLoading.value = false
        }
    }

    // Computed getters
    function getEventById(id: number) {
        return events.value.find(event => event.id === id)
    }

    function getEventsByGame(gameId: number) {
        return events.value.filter(event => event.gameId === gameId)
    }

    function getEventsByStatus(status: string) {
        return events.value.filter(event => {
            const computedStatus = computeEventStatus(event.startTime, event.endTime, event.status)
            return computedStatus === status
        })
    }

    // Initialize WebSocket when store is created
    initializeWebSocket()

    return {
        // State
        events,
        isLoading,
        error,
        isConnected,
        isWebSocketEnabled,

        // Actions
        fetchEvents,
        fetchEventById,
        createEvent,
        updateEvent,
        deleteEvent,
        updateEventStatus,

        // Getters
        getEventById,
        getEventsByGame,
        getEventsByStatus,

        // WebSocket management
        initializeWebSocket,
        cleanupWebSocket,
        toggleWebSocket
    }
})