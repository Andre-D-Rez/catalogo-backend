import { VeiculoRedisAdapter, IVeiculo } from '../models/Veiculo.redis.js';
import kv from '../database/kv.js';

const veiculoAdapter = new VeiculoRedisAdapter();

class VeiculoService {
  /**
   * Obtém versão atual do cache (para invalidação global)
   */
  private async getVersion(): Promise<number> {
    const version = await kv.get('veiculos:version');
    return version ? Number(version) : 1;
  }

  /**
   * Incrementa versão do cache (invalida todos os caches de listagem)
   */
  async bumpVersion(): Promise<void> {
    await kv.incr('veiculos:version');
  }

  /**
   * Lista veículos com paginação e cache Redis
   */
  async findAll(filters: any): Promise<{ data: IVeiculo[]; total: number; page: number; limit: number }> {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(filters.limit) || 10));

    const query = { ...filters } as Record<string, any>;
    delete query.page;
    delete query.limit;

    const version = await this.getVersion();
    const key = `veiculos:v${version}:brand:${query.brand || '*'}:type:${query.type || '*'}:year:${query.year || '*'}:p${page}:l${limit}`;

    const cached = await kv.get(key);
    if (cached) {
      try {
        const parsed = typeof cached === 'string' ? JSON.parse(cached) : cached;
        if (parsed && parsed.data && parsed.total !== undefined && parsed.page !== undefined && parsed.limit !== undefined) {
          return parsed as { data: IVeiculo[]; total: number; page: number; limit: number };
        }
      } catch {
        /* ignore parse errors and continue */
      }
    }

    // Get all matching vehicles
    const allVeiculos = await veiculoAdapter.find(query);
    const total = allVeiculos.length;

    // Apply pagination
    const data = allVeiculos.slice((page - 1) * limit, page * limit);

    const result = { data, total, page, limit };
    // Store cached payload as JSON to keep compatibility across Redis/Vercel KV/memory
    await kv.set(key, JSON.stringify(result), { ex: 300 }); // cache 5 minutos
    return result;
  }

  /**
   * Cria um novo veículo e invalida cache
   */
  async create(data: Partial<IVeiculo>): Promise<IVeiculo> {
    const veiculo = await veiculoAdapter.create(data as Omit<IVeiculo, '_id' | 'id'>);
    await this.bumpVersion();
    return veiculo;
  }

  /**
   * Atualiza veículo e invalida cache
   */
  async update(id: string, data: Partial<IVeiculo>): Promise<IVeiculo | null> {
    const veiculo = await veiculoAdapter.findByIdAndUpdate(id, data);
    if (veiculo) {
      await this.bumpVersion();
    }
    return veiculo;
  }

  /**
   * Busca veículo por ID
   */
  async findById(id: string): Promise<IVeiculo | null> {
    return veiculoAdapter.findById(id);
  }

  /**
   * Remove veículo e invalida cache
   */
  async delete(id: string): Promise<IVeiculo | null> {
    const veiculo = await veiculoAdapter.findByIdAndDelete(id);
    if (veiculo) {
      await this.bumpVersion();
    }
    return veiculo;
  }
}

export default new VeiculoService();
