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

    // Override the list method to handle query parameters for filtering
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

            if (!['upcoming', 'active', 'completed', 'cancelled'].includes(status)) {
                return res.status(400).json({ error: 'Invalid status' });
            }

            await GameEventModel.updateStatus(id, status);
            const updatedEvent = await GameEventModel.read(id);

            res.json(updatedEvent);
        } catch (error) {
            console.error('Error updating event status:', error);
            res.status(500).json({ error: 'Failed to update event status' });
        }
    }

    // Custom method to get upcoming events
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

        return body;
    }
}