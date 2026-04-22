import mongoose, { Schema, Document, Model } from "mongoose";

export interface IExhibition extends Document {
  name:        string;
  dates:       Date[];
  description?: string;
  mainImage:   string;
  subImages:   string[];
  createdAt:   Date;
  updatedAt:   Date;
}

const ExhibitionSchema = new Schema<IExhibition>(
  {
    name:        { type: String, required: true, trim: true },
    dates:       [{ type: Date, required: true }],
    description: { type: String, trim: true },
    mainImage:   { type: String, required: true },
    subImages:   [{ type: String }],
  },
  { timestamps: true }
);

const Exhibition: Model<IExhibition> =
  mongoose.models.Exhibition ?? mongoose.model<IExhibition>("Exhibition", ExhibitionSchema);

export default Exhibition;
