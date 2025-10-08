import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Becado } from './becado.schema';

// Subdocumento para cada item de la rúbrica
class RubricItemResponse {
  @Prop({ required: true })
  criterioId: string;
  @Prop({ required: true })
  puntaje: number;
  @Prop()
  comentario?: string;
}

@Schema({ timestamps: true })
export class Evaluation extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Becado', required: true })
  becado: Becado;

  @Prop({ required: true })
  tutorId: string; // El UUID del usuario Tutor de la DB de Postgres

  @Prop({ required: true })
  rubricId: string; // Un identificador para la plantilla de la rúbrica

  @Prop({ type: [RubricItemResponse], required: true })
  respuestas: RubricItemResponse[];

  @Prop()
  puntajeFinal?: number;
}
export const EvaluationSchema = SchemaFactory.createForClass(Evaluation);