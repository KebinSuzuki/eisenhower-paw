import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITask extends Document {
  title: string;
  description: string;
  fromDate: Date;
  endDate: Date;
  priorityId: number;
}

const TaskSchema = new Schema<ITask>({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  fromDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  priorityId: { type: Number, required: true },
});

export const Task: Model<ITask> =
  mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema);
