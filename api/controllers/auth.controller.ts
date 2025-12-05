import { Request, Response } from 'express';
import authService from '../services/auth.service.js';

class AuthController {
  async register(req: Request, res: Response): Promise<Response> {
    try {
      const { name, email, password } = req.body;
      const user = await authService.register(name, email, password);
      const userResponse = { _id: user._id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt };
      return res.status(201).json(userResponse);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async login(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(401).json({ error: error.message });
    }
  }
}

export default new AuthController();
