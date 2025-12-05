import { VeiculoModel, IVeiculo } from '../models/Veiculo.js';
import kv from '../database/kv.js';

class VeiculoService {
  /**
   * Obtém versão atual do cache (para invalidação global)
   */
  private async getVersion(): Promise<number> {
    const version = await kv.get<number>('veiculos:version');
    return version || 1;
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

    const cached = await kv.get<{ data: IVeiculo[]; total: number; page: number; limit: number }>(key);
    if (cached) return cached;

    const [data, total] = await Promise.all([
      VeiculoModel.find(query)
        .skip((page - 1) * limit)
        .limit(limit),
      VeiculoModel.countDocuments(query),
    ]);

    const result = { data, total, page, limit };
    await kv.set(key, result, { ex: 300 }); // cache 5 minutos
    return result;
  }

  /**
   * Cria um novo veículo e invalida cache
   */
  async create(data: Partial<IVeiculo>): Promise<IVeiculo> {
    const veiculo = await VeiculoModel.create(data);
    await this.bumpVersion();
    return veiculo;
  }

  /**
   * Atualiza veículo e invalida cache
   */
  async update(id: string, data: Partial<IVeiculo>): Promise<IVeiculo | null> {
    const veiculo = await VeiculoModel.findByIdAndUpdate(id, data, { new: true });
    await this.bumpVersion();
    return veiculo;
  }

  /**
   * Busca veículo por ID
   */
  async findById(id: string): Promise<IVeiculo | null> {
    return VeiculoModel.findById(id);
  }

  /**
   * Remove veículo e invalida cache
   */
  async delete(id: string): Promise<IVeiculo | null> {
    const veiculo = await VeiculoModel.findByIdAndDelete(id);
    await this.bumpVersion();
    return veiculo;
  }
}

export default new VeiculoService();
