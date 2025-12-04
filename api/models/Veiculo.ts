import mongoose, { Document, Schema } from 'mongoose';

export enum VeiculoType {
  SEDAN = 'Sedan',
  SUV = 'SUV',
  HATCH = 'Hatch',
  PICKUP = 'Pickup',
  COUPE = 'Coupe',
  CONVERTIBLE = 'Convertible'
}

export interface IVeiculo extends Document {
  brand: string;
  modelName: string;
  type: VeiculoType;
  year: number;
  description?: string;
  imagens?: string[];
}

const VeiculoSchema = new Schema<IVeiculo>({
  brand: {
    type: String,
    required: true,
    trim: true
  },
  modelName: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: Object.values(VeiculoType),
    required: true
  },
  year: {
    type: Number,
    required: true,
    min: 1900,
    max: new Date().getFullYear() + 1
  },
  description: {
    type: String,
    trim: true
  },
  imagens: [{
    type: String
  }]
}, {
  timestamps: true
});

export const VeiculoModel = mongoose.model<IVeiculo>('Veiculo', VeiculoSchema);
