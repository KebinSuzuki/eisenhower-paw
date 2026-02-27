import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IProjectTask extends Document {
  projectId: Types.ObjectId;
  taskId: Types.ObjectId;
}

const ProjectTaskSchema = new Schema<IProjectTask>({
  projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
  taskId: { type: Schema.Types.ObjectId, ref: "Task", required: true },
});

ProjectTaskSchema.index({ projectId: 1, taskId: 1 }, { unique: true });

export const ProjectTask: Model<IProjectTask> =
  mongoose.models.ProjectTask ||
  mongoose.model<IProjectTask>("ProjectTask", ProjectTaskSchema);
