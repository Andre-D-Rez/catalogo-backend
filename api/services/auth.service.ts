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

  async login(email: string, password: string): Promise<{ user: IUser; token: string }> {
    const user = await UserModel.findOne({ email });
    if (!user) throw new Error('Credenciais inválidas');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new Error('Credenciais inválidas');

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    return { user, token };
  }

export default new AuthService();
