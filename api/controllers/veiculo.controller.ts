import { Request, Response } from 'express';
import veiculoService from '../services/veiculo.service.js';

class VeiculoController {
  async create(req: Request, res: Response): Promise<Response> {
    try {
      const veiculo = await veiculoService.create(req.body);
      return res.status(201).json(veiculo);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const veiculos = await veiculoService.findAll();
      return res.status(200).json(veiculos);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getById(req: Request, res: Response): Promise<Response> {
    try {
      const veiculo = await veiculoService.findById(req.params.id);
      if (!veiculo) {
        return res.status(404).json({ error: 'Veículo não encontrado' });
      }
      return res.status(200).json(veiculo);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
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
