import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Becado extends Document {
  @Prop({ required: true, unique: true })
  userId: string;
}
export const BecadoSchema = SchemaFactory.createForClass(Becado);