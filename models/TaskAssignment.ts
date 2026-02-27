import mongoose, { Schema, Document, Model, Types } from "mongoose"

export type RACIRole = "R" | "A" | "C" | "I"

export interface ITaskAssignment extends Document {
  taskId: Types.ObjectId
  personId: Types.ObjectId
  projectId: Types.ObjectId
  raciRole: RACIRole
}

const TaskAssignmentSchema = new Schema<ITaskAssignment>(
  {
    taskId: { type: Schema.Types.ObjectId, ref: "Task", required: true },
    personId: { type: Schema.Types.ObjectId, ref: "Person", required: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    raciRole: {
      type: String,
      enum: ["R", "A", "C", "I"],
      required: true,
    },
  },
  { timestamps: true }
)

TaskAssignmentSchema.index(
  { taskId: 1, personId: 1, projectId: 1 },
  { unique: true }
)

const TaskAssignment: Model<ITaskAssignment> =
  mongoose.models.TaskAssignment ||
  mongoose.model<ITaskAssignment>("TaskAssignment", TaskAssignmentSchema)

export default TaskAssignment
