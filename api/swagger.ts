import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import { SwaggerDefinition } from 'swagger-jsdoc';

const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API de Catálogo de Veículos',
    version: '1.0.0',
    description: 'API REST para gerenciar catálogo de veículos com autenticação JWT e armazenamento Redis',
    contact: {
      name: 'Backend em Express + Redis',
    },
  },
  servers: [
    {
      url: process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : 'http://localhost:3000',
      description: process.env.VERCEL_URL ? 'Servidor de produção (Vercel)' : 'Servidor de desenvolvimento',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Insira o token JWT obtido no login',
      },
    },
    schemas: {
      User: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: {
            type: 'string',
            description: 'Nome do usuário',
            example: 'João Silva',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Email do usuário',
            example: 'joao@example.com',
          },
          password: {
            type: 'string',
            format: 'password',
            description: 'Senha do usuário (mínimo 6 caracteres)',
            example: 'senha123',
          },
          role: {
            type: 'string',
            enum: ['user', 'admin'],
            description: 'Papel do usuário',
            example: 'user',
          },
        },
      },
      Veiculo: {
        type: 'object',
        required: ['brand', 'type', 'year'],
        properties: {
          _id: {
            type: 'string',
            description: 'ID do veículo',
            example: '41be8716-bdbd-4ab8-a9ba-6c9459100ff1',
          },
          id: {
            type: 'string',
            description: 'ID do veículo (alias)',
            example: '41be8716-bdbd-4ab8-a9ba-6c9459100ff1',
          },
          brand: {
            type: 'string',
            description: 'Marca do veículo',
            example: 'Toyota',
          },
          type: {
            type: 'string',
            description: 'Tipo do veículo',
            example: 'SUV',
          },
          year: {
            type: 'integer',
            minimum: 1900,
            description: 'Ano de fabricação',
            example: 2024,
          },
          modelName: {
            type: 'string',
            description: 'Nome do modelo',
            example: 'RAV4',
          },
          description: {
            type: 'string',
            description: 'Descrição do veículo',
            example: 'SUV compacto com tecnologia híbrida',
          },
          color: {
            type: 'string',
            description: 'Cor do veículo',
            example: 'Prata',
          },
          price: {
            type: 'number',
            description: 'Preço do veículo',
            example: 180000,
          },
          imageUrl: {
            type: 'string',
            description: 'URL da imagem',
            example: 'https://exemplo.com/imagem.jpg',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Data de criação',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Data de atualização',
          },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            description: 'Mensagem de erro',
          },
          message: {
            type: 'string',
            description: 'Detalhes do erro',
          },
        },
      },
    },
  },
  tags: [
    {
      name: 'Auth',
      description: 'Endpoints de autenticação (registro e login)',
    },
    {
      name: 'Veículos',
      description: 'CRUD de veículos (listagem pública, modificação requer admin)',
    },
    {
      name: 'System',
      description: 'Endpoints do sistema',
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: process.env.NODE_ENV === 'production' 
    ? [] // Em produção, usa apenas a definição abaixo (sem JSDoc)
    : [], // Não usa JSDoc dos arquivos
};

const baseSpec = swaggerJsdoc(options);

// Adiciona os endpoints manualmente (funciona em produção e dev)
export const swaggerSpec = {
  ...baseSpec,
  paths: {
    '/health': {
      get: {
        summary: 'Health check',
        tags: ['System'],
        responses: {
          '200': {
            description: 'Servidor funcionando',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'OK' },
                    message: { type: 'string', example: 'Server is running' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/': {
      get: {
        summary: 'Root endpoint',
        tags: ['System'],
        responses: {
          '200': {
            description: 'Mensagem de boas-vindas',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Catalogo Backend API' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/auth/register': {
      post: {
        summary: 'Registrar novo usuário',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/User' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Usuário criado com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Usuário registrado com sucesso' },
                    user: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        email: { type: 'string' },
                        role: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          '400': { description: 'Email já cadastrado ou dados inválidos' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        summary: 'Login de usuário',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'joao@example.com' },
                  password: { type: 'string', format: 'password', example: 'senha123' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login realizado com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                    user: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        email: { type: 'string' },
                        role: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': { description: 'Credenciais inválidas' },
        },
      },
    },
    '/api/veiculos': {
      get: {
        summary: 'Listar veículos (público)',
        tags: ['Veículos'],
        parameters: [
          { in: 'query', name: 'brand', schema: { type: 'string' }, description: 'Filtrar por marca' },
          { in: 'query', name: 'type', schema: { type: 'string' }, description: 'Filtrar por tipo' },
          { in: 'query', name: 'year', schema: { type: 'integer' }, description: 'Filtrar por ano' },
          { in: 'query', name: 'page', schema: { type: 'integer', default: 1 }, description: 'Página' },
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 10, maximum: 100 }, description: 'Itens por página' },
        ],
        responses: {
          '200': {
            description: 'Lista de veículos',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Veiculo' },
                    },
                    total: { type: 'integer', example: 50 },
                    page: { type: 'integer', example: 1 },
                    limit: { type: 'integer', example: 10 },
                  },
                },
              },
            },
          },
          '500': { description: 'Erro interno' },
        },
      },
      post: {
        summary: 'Criar novo veículo (requer admin)',
        tags: ['Veículos'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['brand', 'type', 'year'],
                properties: {
                  brand: { type: 'string', example: 'Toyota' },
                  type: { type: 'string', example: 'SUV' },
                  year: { type: 'integer', example: 2024 },
                  modelName: { type: 'string', example: 'RAV4' },
                  description: { type: 'string', example: 'SUV compacto com tecnologia híbrida' },
                  color: { type: 'string', example: 'Prata' },
                  price: { type: 'number', example: 180000 },
                  imageUrl: { type: 'string', example: 'https://exemplo.com/imagem.jpg' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Veículo criado com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Veiculo' },
              },
            },
          },
          '400': { description: 'Dados inválidos' },
          '401': { description: 'Não autenticado' },
          '403': { description: 'Não autorizado (requer admin)' },
        },
      },
    },
    '/api/veiculos/{id}': {
      get: {
        summary: 'Buscar veículo por ID (público)',
        tags: ['Veículos'],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'ID do veículo' },
        ],
        responses: {
          '200': {
            description: 'Veículo encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Veiculo' },
              },
            },
          },
          '404': { description: 'Veículo não encontrado' },
        },
      },
      put: {
        summary: 'Atualizar veículo (requer admin)',
        tags: ['Veículos'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'ID do veículo' },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  brand: { type: 'string' },
                  type: { type: 'string' },
                  year: { type: 'integer' },
                  modelName: { type: 'string' },
                  description: { type: 'string' },
                  color: { type: 'string' },
                  price: { type: 'number' },
                  imageUrl: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Veículo atualizado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Veiculo' },
              },
            },
          },
          '400': { description: 'Dados inválidos' },
          '401': { description: 'Não autenticado' },
          '403': { description: 'Não autorizado (requer admin)' },
          '404': { description: 'Veículo não encontrado' },
        },
      },
      delete: {
        summary: 'Deletar veículo (requer admin)',
        tags: ['Veículos'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'ID do veículo' },
        ],
        responses: {
          '200': {
            description: 'Veículo excluído com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Veículo excluído com sucesso' },
                  },
                },
              },
            },
          },
          '401': { description: 'Não autenticado' },
          '403': { description: 'Não autorizado (requer admin)' },
          '404': { description: 'Veículo não encontrado' },
        },
      },
    },
  },
};

export default (app: Application) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log('✅ Swagger docs available at /api-docs');
};
