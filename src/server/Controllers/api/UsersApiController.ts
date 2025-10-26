import {
  usersInsertSchema,
  usersSelectSchema,
  usersUpdateSchema,
} from "../../db/schema.js";
import UserModel from "../../Models/User.js";
import { Request, Response } from "express";
import { PageController } from "../PageController.js";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";

export default class UsersController extends PageController {
  constructor() {
    super(UserModel, usersSelectSchema, usersInsertSchema, usersUpdateSchema);
  }

  // Schema for password setting
  private passwordSchema = z.object({
    password: z.string().min(6, "Password must be at least 6 characters"),
  });

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
    
    // Ensure role has a default value
    if (!body.role || body.role.trim() === '') {
      body.role = 'user';
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

  // Set password for user by ID
  public async setPassword(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = Number(id);

      if (!userId || isNaN(userId)) {
        this.sendStatus(res, StatusCodes.BAD_REQUEST, "Invalid user ID");
        return;
      }

      const data = await this.passwordSchema.parseAsync(req.body);

      // Check if user exists
      const existingUser = await UserModel.read(userId);
      if (!existingUser) {
        this.sendStatus(res, StatusCodes.NOT_FOUND, "User not found");
        return;
      }

      const updatedUser = await UserModel.setPassword(userId, data.password);
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = updatedUser;
      
      this.renderWithViews(res, 'update', userWithoutPassword);
    } catch (error) {
      this.sendStatus(res, StatusCodes.BAD_REQUEST, error);
    }
  }

  // Set password for user by client ID
  public async setPasswordByClientId(req: Request, res: Response) {
    try {
      const { clientId } = req.params;

      if (!clientId) {
        this.sendStatus(res, StatusCodes.BAD_REQUEST, "Client ID is required");
        return;
      }

      const data = await this.passwordSchema.parseAsync(req.body);

      // Check if user exists
      const existingUser = await UserModel.findByClientId(clientId);
      if (!existingUser) {
        this.sendStatus(res, StatusCodes.NOT_FOUND, "User not found");
        return;
      }

      const updatedUser = await UserModel.setPasswordByClientId(clientId, data.password);
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = updatedUser;
      
      this.renderWithViews(res, 'update', userWithoutPassword);
    } catch (error) {
      this.sendStatus(res, StatusCodes.BAD_REQUEST, error);
    }
  }

  // Authenticate user
  public async authenticate(req: Request, res: Response) {
    try {
      const authSchema = z.object({
        clientId: z.string().min(1, "Client ID is required"),
        password: z.string().min(1, "Password is required"),
      });

      const data = await authSchema.parseAsync(req.body);

      const user = await UserModel.authenticate(data.clientId, data.password);
      
      if (!user) {
        this.sendStatus(res, StatusCodes.UNAUTHORIZED, "Invalid credentials");
        return;
      }

      this.renderWithViews(res, 'read', user);
    } catch (error) {
      this.sendStatus(res, StatusCodes.BAD_REQUEST, error);
    }
  }

  // Get current user info
  public async me(req: Request, res: Response) {
    try {
      // Extract user info from JWT token
      const user = (req as any).user;
      
      if (!user || !user.userId) {
        this.sendStatus(res, StatusCodes.UNAUTHORIZED, "No user information found");
        return;
      }

      // Fetch full user data from database
      const userData = await UserModel.read(user.userId);
      if (!userData) {
        this.sendStatus(res, StatusCodes.NOT_FOUND, "User not found");
        return;
      }
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = userData;
      this.renderWithViews(res, 'read', userWithoutPassword);
    } catch (error) {
      this.sendStatus(res, StatusCodes.INTERNAL_SERVER_ERROR, error);
    }
  }
}