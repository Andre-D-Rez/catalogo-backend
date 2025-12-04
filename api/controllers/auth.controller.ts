import { Request, Response } from 'express';
import authService from '../services/auth.service.js';

class AuthController {
  async register(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password, name, role } = req.body;
      const result = await authService.register(email, password, name, role);
      return res.status(201).json(result);
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
