import kv from '../database/kv.js';
import { randomUUID } from 'crypto';

const parseJson = <T>(value: any): T | null => {
  if (!value) return null;
  try {
    if (typeof value === 'string') return JSON.parse(value) as T;
    return value as T;
  } catch {
    return null;
  }
};

export interface IVeiculo {
  _id?: string;
  id?: string;
  brand: string;
  type: string;
  year: number;
  modelName?: string;
  description?: string;
  color?: string;
  price?: number;
  imageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Redis-based Vehicle storage (fallback when MongoDB is not available)
 */
export class VeiculoRedisAdapter {
  private static readonly VEICULOS_PREFIX = 'veiculos:data:';
  private static readonly VEICULOS_INDEX = 'veiculos:index';

  /**
   * Create a new vehicle
   */
  async create(data: Omit<IVeiculo, '_id' | 'id'>): Promise<IVeiculo> {
    console.log('🚗 Creating vehicle:', data);
    const id = randomUUID();
    const veiculo: IVeiculo = {
      _id: id,
      id,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Store vehicle in Redis
    const key = `${VeiculoRedisAdapter.VEICULOS_PREFIX}${id}`;
    console.log('💾 Saving vehicle to Redis:', key);
    await kv.set(key, JSON.stringify(veiculo));
    console.log('✅ Vehicle saved');

    // Add to index
    const indexKey = VeiculoRedisAdapter.VEICULOS_INDEX;
    const indexData = await kv.get(indexKey);
    const index = parseJson<string[]>(indexData) || [];
    if (!index.includes(id)) {
      index.push(id);
      await kv.set(indexKey, JSON.stringify(index));
      console.log('📝 Index updated');
    }

    return veiculo;
  }

  /**
   * Find vehicle by ID
   */
  async findById(id: string): Promise<IVeiculo | null> {
    const key = `${VeiculoRedisAdapter.VEICULOS_PREFIX}${id}`;
    const veiculoData = await kv.get(key);
    return parseJson<IVeiculo>(veiculoData);
  }

  /**
   * Find vehicles with filters
   */
  async find(query: Record<string, any> = {}): Promise<IVeiculo[]> {
    const indexKey = VeiculoRedisAdapter.VEICULOS_INDEX;
    const index = parseJson<string[]>(await kv.get(indexKey)) || [];

    const veiculos: IVeiculo[] = [];

    for (const id of index) {
      const key = `${VeiculoRedisAdapter.VEICULOS_PREFIX}${id}`;
      const veiculoData = await kv.get(key);
      const veiculo = parseJson<IVeiculo>(veiculoData);
      if (veiculo) {
        // Apply filters
        if (query.brand && veiculo.brand?.toLowerCase() !== query.brand.toLowerCase()) continue;
        if (query.type && veiculo.type?.toLowerCase() !== query.type.toLowerCase()) continue;
        if (query.year && veiculo.year !== Number(query.year)) continue;
        
        veiculos.push(veiculo);
      }
    }

    return veiculos;
  }

  /**
   * Get all vehicles
   */
  async findAll(): Promise<IVeiculo[]> {
    return this.find();
  }

  /**
   * Count documents matching query
   */
  async countDocuments(query: Record<string, any> = {}): Promise<number> {
    const veiculos = await this.find(query);
    return veiculos.length;
  }

  /**
   * Update vehicle
   */
  async findByIdAndUpdate(id: string, data: Partial<IVeiculo>): Promise<IVeiculo | null> {
    const veiculo = await this.findById(id);
    if (!veiculo) return null;

    const updated: IVeiculo = {
      ...veiculo,
      ...data,
      _id: veiculo._id,
      id: veiculo.id,
      createdAt: veiculo.createdAt,
      updatedAt: new Date(),
    };

    const key = `${VeiculoRedisAdapter.VEICULOS_PREFIX}${id}`;
    await kv.set(key, JSON.stringify(updated));

    return updated;
  }

  /**
   * Delete vehicle
   */
  async findByIdAndDelete(id: string): Promise<IVeiculo | null> {
    const veiculo = await this.findById(id);
    if (!veiculo) return null;

    const key = `${VeiculoRedisAdapter.VEICULOS_PREFIX}${id}`;
    await kv.del(key);

    // Remove from index
    const indexKey = VeiculoRedisAdapter.VEICULOS_INDEX;
    const index = (await kv.get(indexKey)) ? JSON.parse(await kv.get(indexKey)) : [];
    const newIndex = index.filter((itemId: string) => itemId !== id);
    await kv.set(indexKey, JSON.stringify(newIndex));

    return veiculo;
  }

  /**
   * Skip and limit for pagination
   */
  skip(count: number) {
    return { skip: count, limit: undefined as any };
  }

  limit(count: number) {
    return { limit: count };
  }
}

export const veiculoRedisAdapter = new VeiculoRedisAdapter();
