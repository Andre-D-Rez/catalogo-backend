import kv from '../database/kv.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user'
}

export interface IUser {
  _id?: string;
  id?: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

// Redis-based User storage (fallback when MongoDB is not available)
export class UserRedisAdapter {
  private static readonly USERS_PREFIX = 'users:';
  private static readonly USERS_INDEX = 'users:index';

  /**
   * Create a new user
   */
  async create(data: Omit<IUser, '_id' | 'id'>): Promise<IUser> {
    const id = uuidv4();
    const user: IUser = {
      _id: id,
      id,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Store user in Redis
    const key = `${UserRedisAdapter.USERS_PREFIX}${user.email}`;
    await kv.set(key, JSON.stringify(user));

    // Add to index for listing
    const indexKey = UserRedisAdapter.USERS_INDEX;
    const index = (await kv.get(indexKey)) ? JSON.parse(await kv.get(indexKey)) : [];
    if (!index.includes(user.email)) {
      index.push(user.email);
      await kv.set(indexKey, JSON.stringify(index));
    }

    return user;
  }

  /**
   * Find user by email
   */
  async findOne(query: { email: string }): Promise<IUser | null> {
    const key = `${UserRedisAdapter.USERS_PREFIX}${query.email}`;
    const userData = await kv.get(key);
    
    if (!userData) return null;

    try {
      return JSON.parse(userData) as IUser;
    } catch {
      return null;
    }
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<IUser | null> {
    const indexKey = UserRedisAdapter.USERS_INDEX;
    const index = (await kv.get(indexKey)) ? JSON.parse(await kv.get(indexKey)) : [];

    for (const email of index) {
      const key = `${UserRedisAdapter.USERS_PREFIX}${email}`;
      const userData = await kv.get(key);
      if (userData) {
        const user = JSON.parse(userData) as IUser;
        if (user._id === id || user.id === id) {
          return user;
        }
      }
    }

    return null;
  }

  /**
   * Get all users
   */
  async find(): Promise<IUser[]> {
    const indexKey = UserRedisAdapter.USERS_INDEX;
    const index = (await kv.get(indexKey)) ? JSON.parse(await kv.get(indexKey)) : [];

    const users: IUser[] = [];
    for (const email of index) {
      const key = `${UserRedisAdapter.USERS_PREFIX}${email}`;
      const userData = await kv.get(key);
      if (userData) {
        users.push(JSON.parse(userData) as IUser);
      }
    }

    return users;
  }

  /**
   * Delete user by email
   */
  async deleteOne(query: { email: string }): Promise<boolean> {
    const key = `${UserRedisAdapter.USERS_PREFIX}${query.email}`;
    const indexKey = UserRedisAdapter.USERS_INDEX;

    await kv.del(key);

    const index = (await kv.get(indexKey)) ? JSON.parse(await kv.get(indexKey)) : [];
    const newIndex = index.filter((email: string) => email !== query.email);
    await kv.set(indexKey, JSON.stringify(newIndex));

    return true;
  }
}

export const userRedisAdapter = new UserRedisAdapter();
