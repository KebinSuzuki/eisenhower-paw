import mongoose, { Schema, Document, Model } from "mongoose"

export type EisenhowerQuadrant = "DO" | "SCHEDULE" | "DELEGATE" | "ELIMINATE"

export interface IProject extends Document {
  title: string
  fromDate: Date
  toDate: Date
  priorityId: number
  eisenhowerQuadrant: EisenhowerQuadrant
}

const ProjectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    priorityId: { type: Number, required: true },
    eisenhowerQuadrant: {
      type: String,
      enum: ["DO", "SCHEDULE", "DELEGATE", "ELIMINATE"],
      default: "DO",
      required: true,
    },
  },
  { timestamps: true }
)

const Project: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema)

export default Project
