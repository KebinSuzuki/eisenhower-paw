import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IProjectMember extends Document {
  projectId: Types.ObjectId;
  personId: Types.ObjectId;
}

const ProjectMemberSchema = new Schema<IProjectMember>({
  projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
  personId: { type: Schema.Types.ObjectId, ref: "Person", required: true },
});

ProjectMemberSchema.index({ projectId: 1, personId: 1 }, { unique: true });

export const ProjectMember: Model<IProjectMember> =
  mongoose.models.ProjectMember ||
  mongoose.model<IProjectMember>("ProjectMember", ProjectMemberSchema);
