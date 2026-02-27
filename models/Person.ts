import mongoose, { Schema, Document, Model } from "mongoose"

export interface IPerson extends Document {
  name: string
  lastName: string
  idPosition: number
}

const PersonSchema = new Schema<IPerson>(
  {
    name: { type: String, required: true },
    lastName: { type: String, required: true },
    idPosition: { type: Number, required: true },
  },
  { timestamps: true }
)

const Person: Model<IPerson> =
  mongoose.models.Person || mongoose.model<IPerson>("Person", PersonSchema)

export default Person
