import { VeiculoModel, IVeiculo } from '../models/Veiculo.js';

class VeiculoService {
  async create(data: Partial<IVeiculo>): Promise<IVeiculo> {
    return VeiculoModel.create(data);
  }

  async findAll(): Promise<IVeiculo[]> {
    return VeiculoModel.find().sort({ createdAt: -1 });
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
