import mongoose, { Schema, Document, Model } from "mongoose"

export interface IPosition extends Document {
  idPosition: number
  position: string
}

const PositionSchema = new Schema<IPosition>(
  {
    idPosition: { type: Number, required: true, unique: true },
    position: { type: String, required: true },
  },
  { timestamps: true }
)

const Position: Model<IPosition> =
  mongoose.models.Position || mongoose.model<IPosition>("Position", PositionSchema)

export default Position
