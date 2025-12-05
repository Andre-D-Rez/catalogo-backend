import { UserModel, IUser } from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

class AuthService {
  async register(name: string, email: string, password: string): Promise<IUser> {
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) throw new Error('Email já cadastrado');
    const hashedPassword = await bcrypt.hash(password, 10);
    return UserModel.create({ name, email, password: hashedPassword, role: 'user' });
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
