import mongoose, { Document, Schema } from 'mongoose';

export interface IVeiculo extends Document {
  brand: string;
  type: string;
  year: number;
  modelName?: string;
  color?: string;
  price?: number;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VeiculoSchema = new Schema<IVeiculo>(
  {
    brand: { type: String, required: true, index: true },
    type: { type: String, required: true, index: true },
    year: { type: Number, required: true, index: true },
    modelName: { type: String },
    color: { type: String },
    price: { type: Number },
    imageUrl: { type: String },
  },
  { timestamps: true }
);

export const VeiculoModel = mongoose.model<IVeiculo>('Veiculo', VeiculoSchema);
