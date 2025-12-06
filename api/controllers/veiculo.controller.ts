import { Request, Response } from 'express';
import veiculoService from '../services/veiculo.service.js';

class VeiculoController {
  async create(req: Request, res: Response): Promise<Response> {
    try {
      console.log('📝 Create vehicle request:', req.body);
      const veiculo = await veiculoService.create(req.body);
      console.log('✅ Vehicle created:', veiculo.id);
      return res.status(201).json(veiculo);
    } catch (error: any) {
      console.error('❌ Create vehicle error:', error.message, error);
      return res.status(400).json({ error: error.message });
    }
  }

  async findAll(req: Request, res: Response): Promise<Response> {
    try {
      console.log('🔍 FindAll request with query:', req.query);
      const result = await veiculoService.findAll(req.query);
      console.log('✅ FindAll result:', { total: result.total, dataLength: result.data.length });
      return res.status(200).json(result);
    } catch (error: any) {
      console.error('❌ FindAll error:', error.message);
      console.error('Stack trace:', error.stack);
      return res.status(500).json({ error: error.message, stack: error.stack });
    }
  }

  async findById(req: Request, res: Response): Promise<Response> {
    const veiculo = await veiculoService.findById(req.params.id);
    if (!veiculo) return res.status(404).json({ message: 'Veículo não encontrado' });
    return res.status(200).json(veiculo);
  }

  async update(req: Request, res: Response): Promise<Response> {
    try {
      const veiculo = await veiculoService.update(req.params.id, req.body);
      if (!veiculo) {
        return res.status(404).json({ error: 'Veículo não encontrado' });
      }
      return res.status(200).json(veiculo);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const veiculo = await veiculoService.delete(req.params.id);
      if (!veiculo) {
        return res.status(404).json({ error: 'Veículo não encontrado' });
      }
      return res.status(200).json({ message: 'Veículo excluído com sucesso' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}

export default new VeiculoController();
