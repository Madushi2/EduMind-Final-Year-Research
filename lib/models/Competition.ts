import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICompetition extends Document {
  name:              string;
  date:              Date;
  description?:      string;
  whoCanParticipate: string;
  mainImage:         string;
  subImages:         string[];
  createdAt:         Date;
  updatedAt:         Date;
}

const CompetitionSchema = new Schema<ICompetition>(
  {
    name:              { type: String, required: true, trim: true },
    date:              { type: Date,   required: true },
    description:       { type: String, trim: true },
    whoCanParticipate: { type: String, required: true, trim: true },
    mainImage:         { type: String, required: true },
    subImages:         [{ type: String }],
  },
  { timestamps: true }
);

const Competition: Model<ICompetition> =
  mongoose.models.Competition ?? mongoose.model<ICompetition>("Competition", CompetitionSchema);

export default Competition;
