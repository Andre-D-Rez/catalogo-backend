import { UserModel } from '../models/User.js';
import jwt from 'jsonwebtoken';

class AuthService {
  async register(email: string, password: string, name: string, role: string = 'user') {
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      throw new Error('Email já cadastrado');
    }

    const user = await UserModel.create({ email, password, name, role });
    const token = this.generateToken(user._id.toString(), user.email, user.role);

    return {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    };
  }

  async login(email: string, password: string) {
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('Credenciais inválidas');
    }

    const token = this.generateToken(user._id.toString(), user.email, user.role);

    return {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    };
  }

  private generateToken(id: string, email: string, role: string): string {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET não configurado');
    }

    return jwt.sign({ id, email, role }, jwtSecret, { expiresIn: '7d' });
  }
}

export default new AuthService();
