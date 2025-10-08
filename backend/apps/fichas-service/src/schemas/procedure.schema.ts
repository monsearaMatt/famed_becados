import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Becado } from './becado.schema';

@Schema({ timestamps: true })
export class Procedure extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Becado', required: true })
  becado: Becado;

  @Prop({ required: true })
  tipo: string;

  @Prop({ required: true })
  fecha: Date;

  @Prop({ required: true })
  tutor: string;

  @Prop({ required: true })
  hospital: string;

  @Prop({ type: String, default: null })
  notas: string | null;
}
export const ProcedureSchema = SchemaFactory.createForClass(Procedure);