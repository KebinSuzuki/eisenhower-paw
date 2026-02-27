import mongoose, { Schema, Document, Model, Types } from "mongoose"

export interface IProjectMember extends Document {
  projectId: Types.ObjectId
  personId: Types.ObjectId
  role: string
}

const ProjectMemberSchema = new Schema<IProjectMember>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    personId: { type: Schema.Types.ObjectId, ref: "Person", required: true },
    role: { type: String, default: "" },
  },
  { timestamps: true }
)

ProjectMemberSchema.index({ projectId: 1, personId: 1 }, { unique: true })

const ProjectMember: Model<IProjectMember> =
  mongoose.models.ProjectMember ||
  mongoose.model<IProjectMember>("ProjectMember", ProjectMemberSchema)

export default ProjectMember
