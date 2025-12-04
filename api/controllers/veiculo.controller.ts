import { Request, Response } from 'express';
import veiculoService from '../services/veiculo.service.js';
import { cacheGet, cacheSet, cacheDelPattern } from '../database/redis.js';

class VeiculoController {
  async create(req: Request, res: Response): Promise<Response> {
    try {
      const veiculo = await veiculoService.create(req.body);
      
      // Invalidar cache de listagem ao criar novo veículo
      await cacheDelPattern('veiculos:list:*');
      
      return res.status(201).json(veiculo);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async getAll(req: Request, res: Response): Promise<Response> {
    try {
      // Extrair filtros e paginação da query string
      const { brand, type, year, page, limit } = req.query;
      
      const filters = {
        brand: brand as string,
        type: type as string,
        year: year ? parseInt(year as string) : undefined
      };
      
      const options = {
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10
      };

      // Criar chave de cache baseada nos filtros e paginação
      const cacheKey = `veiculos:list:${JSON.stringify(filters)}:${options.page}:${options.limit}`;
      
      // Tentar obter do cache
      const cached = await cacheGet(cacheKey);
      if (cached) {
        return res.status(200).json({ ...cached, fromCache: true });
      }

      // Se não estiver no cache, buscar do banco
      const result = await veiculoService.findAll(filters, options);
      
      // Armazenar no cache por 5 minutos (300 segundos)
      await cacheSet(cacheKey, result, 300);
      
      return res.status(200).json({ ...result, fromCache: false });
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
      
      // Invalidar cache ao atualizar
      await cacheDelPattern('veiculos:list:*');
      
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
      
      // Invalidar cache ao deletar
      await cacheDelPattern('veiculos:list:*');
      
      return res.status(200).json({ message: 'Veículo excluído com sucesso' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}

export default new VeiculoController();
