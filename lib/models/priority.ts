import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPriority extends Document {
  priorityId: number;
  titlePriority: string;
}

const PrioritySchema = new Schema<IPriority>({
  priorityId: { type: Number, required: true, unique: true },
  titlePriority: { type: String, required: true },
});

export const Priority: Model<IPriority> =
  mongoose.models.Priority || mongoose.model<IPriority>("Priority", PrioritySchema);
