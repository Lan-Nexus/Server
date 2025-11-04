import {
    gameEventsInsertSchema,
    gameEventsSelectSchema,
    gameEventsUpdateSchema,
} from "../../db/schema.js";
import GameEventModel from "../../Models/GameEvent.js";
import { Request, Response } from "express";
import { PageController } from "../PageController.js";

export default class GameEventsController extends PageController {
    constructor() {
        super(GameEventModel, gameEventsSelectSchema, gameEventsInsertSchema, gameEventsUpdateSchema);
    }

    // Override create to return JSON
    public async create(req: Request, res: Response) {
        try {
            await this.preCreate(req, res);
            const body = await this.mapRequestBody(req.body, req, res);
            const data = await this.InsertSchema.parseAsync(body);
            const results = await this.model.create(data);
            const finalResults = await this.postCreate?.(req, res, results) ?? results;
            res.json(finalResults);
        } catch (error) {
            console.error('Error creating event:', error);
            res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to create event' });
        }
    }

    // Override update to return JSON
    public async update(req: Request, res: Response) {
        try {
            await this.preUpdate(req, res);
            const body = await this.mapRequestBody(req.body, req, res);
            const data = await this.UpdateSchema.parseAsync({
                ...body,
                id: Number(req.params.id),
            });
            await this.model.update(data.id, data);
            const updatedEvent = await this.model.read(data.id);
            const finalData = await this.postUpdate?.(req, res, updatedEvent) ?? updatedEvent;
            res.json(finalData);
        } catch (error) {
            console.error('Error updating event:', error);
            res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to update event' });
        }
    }

    // Override read to return JSON
    public async read(req: Request, res: Response) {
        try {
            await this.preRead(req, res);
            const { id } = await this.SelectSchema.pick({ id: true }).parseAsync({
                id: Number(req.params.id),
            });
            const results = await this.model.read(id);
            const finalResults = await this.postRead?.(req, res, results) ?? results;
            if (finalResults == void 0) {
                res.status(404).json({ error: 'Event not found' });
                return;
            }
            res.json(finalResults);
        } catch (error) {
            console.error('Error reading event:', error);
            res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to read event' });
        }
    }

    // Override delete to return JSON
    public async delete(req: Request, res: Response) {
        try {
            await this.preDelete(req, res);
            const { id } = await this.SelectSchema.pick({ id: true }).parseAsync({
                id: Number(req.params.id),
            });
            const results = await this.model.read(id);
            if (results == void 0) {
                res.status(404).json({ error: 'Event not found' });
                return;
            }
            await this.postDelete?.(req, res, results);
            await this.model.delete(id);
            res.json({ success: true, message: 'Event deleted successfully' });
        } catch (error) {
            console.error('Error deleting event:', error);
            res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to delete event' });
        }
    }    // Override the list method to handle query parameters for filtering
    public async list(req: Request, res: Response) {
        try {
            const { gameId, status, startDate, endDate } = req.query;

            let events;

            if (gameId) {
                events = await GameEventModel.listByGame(parseInt(gameId as string));
            } else if (status) {
                events = await GameEventModel.listByStatus(status as 'upcoming' | 'active' | 'completed' | 'cancelled');
            } else if (startDate && endDate) {
                events = await GameEventModel.listByDateRange(startDate as string, endDate as string);
            } else {
                events = await GameEventModel.list();
            }

            await this.postList(req, res, events);
            res.json(events);
        } catch (error) {
            console.error('Error listing game events:', error);
            res.status(500).json({ error: 'Failed to retrieve game events' });
        }
    }

    // Custom method to update event status
    public async updateStatus(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const { status } = req.body;

            if (!['active', 'cancelled', 'upcoming', 'completed'].includes(status)) {
                return res.status(400).json({ error: 'Invalid status. Only "active", "cancelled", "upcoming", and "completed" are allowed.' });
            }

            await GameEventModel.updateStatus(id, status);
            const updatedEvent = await GameEventModel.read(id);

            res.json(updatedEvent);
        } catch (error) {
            console.error('Error updating event status:', error);
            res.status(500).json({ error: 'Failed to update event status' });
        }
    }    // Custom method to get upcoming events
    public async upcoming(req: Request, res: Response) {
        try {
            const events = await GameEventModel.listByStatus('upcoming');
            res.json(events);
        } catch (error) {
            console.error('Error retrieving upcoming events:', error);
            res.status(500).json({ error: 'Failed to retrieve upcoming events' });
        }
    }

    // Custom method to get events for a specific game
    public async gameEvents(req: Request, res: Response) {
        try {
            const gameId = parseInt(req.params.gameId);
            const events = await GameEventModel.listByGame(gameId);
            res.json(events);
        } catch (error) {
            console.error('Error retrieving game events:', error);
            res.status(500).json({ error: 'Failed to retrieve game events' });
        }
    }

    public async mapRequestBody(body: any, req: Request, res: Response) {
        // Ensure gameName is set if gameId is provided
        if (body.gameId && !body.gameName) {
            // You might want to fetch the game name from the games table here
            // For now, we'll assume it's provided in the request
        }

        // Convert ISO string dates to Date objects for database
        if (body.startTime && typeof body.startTime === 'string') {
            body.startTime = new Date(body.startTime);
        }

        if (body.endTime && typeof body.endTime === 'string') {
            body.endTime = new Date(body.endTime);
        }

        return body;
    }
}