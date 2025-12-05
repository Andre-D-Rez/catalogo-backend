import { UserRedisAdapter, IUser, UserRole } from '../models/User.redis.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const userAdapter = new UserRedisAdapter();

class AuthService {
  async register(name: string, email: string, password: string): Promise<IUser> {
    // Verificar se email já existe
    const existingUser = await userAdapter.findOne({ email });
    if (existingUser) throw new Error('Email já cadastrado');

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar novo usuário
    const user = await userAdapter.create({
      name,
      email,
      password: hashedPassword,
      role: UserRole.USER,
    });

    return user;
  }

  async login(email: string, password: string): Promise<{ user: IUser; token: string }> {
    const user = await userAdapter.findOne({ email });
    if (!user) throw new Error('Credenciais inválidas');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new Error('Credenciais inválidas');

    const token = jwt.sign(
      { id: user._id || user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '7d' }
    );

    return { user, token };
  }
}

export default new AuthService();
