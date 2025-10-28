import {
  usersInsertSchema,
  usersSelectSchema,
  usersUpdateSchema,
} from "../../db/schema.js";
import UserModel from "../../Models/User.js";
import { Request, Response } from "express";
import { PageController } from "../PageController.js";
import { StatusCodes } from "http-status-codes";

export default class UsersController extends PageController {
  constructor() {
    super(UserModel, usersSelectSchema, usersInsertSchema, usersUpdateSchema);
  }

  public async mapRequestBody(body: any, req: Request, res: Response) {
    if (body.id) {
      body.id = Number(body.id);
    }
    
    // Handle avatar data - if it's already an object, keep it as is
    // The User model will handle JSON serialization
    if (body.avatar && typeof body.avatar === 'string') {
      try {
        body.avatar = JSON.parse(body.avatar);
      } catch (e) {
        // If parsing fails, leave as string and let validation handle it
      }
    }
    
    return body;
  }

  // Override create to handle duplicate email/clientId
  public async create(req: Request, res: Response) {
    try {
      await this.preCreate(req, res);
      const body = await this.mapRequestBody(req.body, req, res);
      const data = await this.InsertSchema.parseAsync(body);

      // Check if clientId already exists
      const existingUserByClientId = await UserModel.findByClientId(data.clientId);
      if (existingUserByClientId) {
        this.sendStatus(res, StatusCodes.CONFLICT, "User with this client ID already exists");
        return;
      }

      const results = await this.model.create(data);
      const finalResults = await this.postCreate?.(req, res, results) ?? results;
      if (this.handleHxRedirect(req, res, 'create', finalResults)) return;
      this.renderWithViews(res, 'create', finalResults);
    } catch (error) {
      this.sendStatus(res, StatusCodes.BAD_REQUEST, error);
    }
  }

  // Override update to handle duplicate clientId
  public async update(req: Request, res: Response) {
    await this.preUpdate(req, res);
    const body = await this.mapRequestBody(req.body, req, res);
    try {
      const data = await this.UpdateSchema.parseAsync({
        ...body,
        id: Number(req.params.id),
      });

      // Check if clientId already exists (excluding current user)
      if (data.clientId) {
        const existingUserByClientId = await UserModel.findByClientId(data.clientId);
        if (existingUserByClientId && existingUserByClientId.id !== data.id) {
          this.sendStatus(res, StatusCodes.CONFLICT, "User with this client ID already exists");
          return;
        }
      }

      await this.model.update(data.id, data);
      const finalData = await this.postUpdate?.(req, res, data) ?? data;
      if (this.handleHxRedirect(req, res, 'update', finalData)) return;
      this.renderWithViews(res, 'update', finalData);
    } catch (error) {
      this.sendStatus(res, StatusCodes.BAD_REQUEST, error, { ...body, id: Number(req.params.id) });
    }
  }

  // Custom endpoint to find user by client ID
  public async findByClientId(req: Request, res: Response) {
    try {
      const { clientId } = req.params;
      if (!clientId) {
        this.sendStatus(res, StatusCodes.BAD_REQUEST, "Client ID is required");
        return;
      }

      const user = await UserModel.findByClientId(clientId);
      if (!user) {
        this.sendStatus(res, StatusCodes.NOT_FOUND, "User not found");
        return;
      }

      this.renderWithViews(res, 'read', user);
    } catch (error) {
      this.sendStatus(res, StatusCodes.INTERNAL_SERVER_ERROR, error);
    }
  }

  // Custom endpoint to update user by client ID
  public async updateByClientId(req: Request, res: Response) {
    await this.preUpdate(req, res);
    const body = await this.mapRequestBody(req.body, req, res);
    try {
      const { clientId } = req.params;
      if (!clientId) {
        this.sendStatus(res, StatusCodes.BAD_REQUEST, "Client ID is required");
        return;
      }

      // Check if user exists
      const existingUser = await UserModel.findByClientId(clientId);
      if (!existingUser) {
        this.sendStatus(res, StatusCodes.NOT_FOUND, "User not found");
        return;
      }

      const data = await this.UpdateSchema.parseAsync({
        ...body,
        id: existingUser.id, // Include the actual ID for validation
      });

      // Check if clientId is being changed and already exists
      if (data.clientId && data.clientId !== clientId) {
        const existingUserByNewClientId = await UserModel.findByClientId(data.clientId);
        if (existingUserByNewClientId && existingUserByNewClientId.id !== existingUser.id) {
          this.sendStatus(res, StatusCodes.CONFLICT, "User with this client ID already exists");
          return;
        }
      }

      const updatedUser = await UserModel.updateByClientId(clientId, data);
      const finalData = await this.postUpdate?.(req, res, updatedUser) ?? updatedUser;
      if (this.handleHxRedirect(req, res, 'update', finalData)) return;
      this.renderWithViews(res, 'update', finalData);
    } catch (error) {
      this.sendStatus(res, StatusCodes.BAD_REQUEST, error, { ...body, clientId: req.params.clientId });
    }
  }

  // Alternative endpoint to update user by client ID only (not used)
  public async updateByClientIdOnly(req: Request, res: Response) {
    await this.preUpdate(req, res);
    const body = await this.mapRequestBody(req.body, req, res);
    try {
      const { clientId } = req.params;
      if (!clientId) {
        this.sendStatus(res, StatusCodes.BAD_REQUEST, "Client ID is required");
        return;
      }

      // Check if user exists
      const existingUser = await UserModel.findByClientId(clientId);
      if (!existingUser) {
        this.sendStatus(res, StatusCodes.NOT_FOUND, "User not found");
        return;
      }

      const data = await this.UpdateSchema.parseAsync({
        ...body,
        id: existingUser.id, // Include the actual ID for validation
      });

      // Check if clientId is being changed and already exists
      if (data.clientId && data.clientId !== clientId) {
        const existingUserByNewClientId = await UserModel.findByClientId(data.clientId);
        if (existingUserByNewClientId && existingUserByNewClientId.id !== existingUser.id) {
          this.sendStatus(res, StatusCodes.CONFLICT, "User with this client ID already exists");
          return;
        }
      }

      const updatedUser = await UserModel.updateByClientId(clientId, data);
      const finalData = await this.postUpdate?.(req, res, updatedUser) ?? updatedUser;
      if (this.handleHxRedirect(req, res, 'update', finalData)) return;
      this.renderWithViews(res, 'update', finalData);
    } catch (error) {
      this.sendStatus(res, StatusCodes.BAD_REQUEST, error, { ...body, clientId: req.params.clientId });
    }
  }
}