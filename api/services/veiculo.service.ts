import { VeiculoModel, IVeiculo } from '../models/Veiculo.js';

export interface VeiculoFilters {
  brand?: string;
  type?: string;
  year?: number;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface VeiculoListResponse {
  data: IVeiculo[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class VeiculoService {
  async create(data: Partial<IVeiculo>): Promise<IVeiculo> {
    return VeiculoModel.create(data);
  }

  async findAll(filters: VeiculoFilters = {}, options: PaginationOptions = {}): Promise<VeiculoListResponse> {
    // Construir query de filtros
    const query: any = {};
    
    if (filters.brand) {
      query.brand = { $regex: filters.brand, $options: 'i' }; // Case-insensitive
    }
    
    if (filters.type) {
      query.type = filters.type;
    }
    
    if (filters.year) {
      query.year = filters.year;
    }

    // Paginação
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 10));
    const skip = (page - 1) * limit;

    // Executar queries em paralelo
    const [data, total] = await Promise.all([
      VeiculoModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      VeiculoModel.countDocuments(query)
    ]);

    return {
      data: data as IVeiculo[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findById(id: string): Promise<IVeiculo | null> {
    return VeiculoModel.findById(id);
  }

  async update(id: string, data: Partial<IVeiculo>): Promise<IVeiculo | null> {
    return VeiculoModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async delete(id: string): Promise<IVeiculo | null> {
    return VeiculoModel.findByIdAndDelete(id);
  }
}

export default new VeiculoService();
