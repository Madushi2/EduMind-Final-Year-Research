import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEvent extends Document {
  name:       string;
  date:       Date;
  description?: string;
  mainImage:  string;
  subImages:  string[];
  createdAt:  Date;
  updatedAt:  Date;
}

const EventSchema = new Schema<IEvent>(
  {
    name:        { type: String, required: true, trim: true },
    date:        { type: Date,   required: true },
    description: { type: String, trim: true },
    mainImage:   { type: String, required: true },
    subImages:   [{ type: String }],
  },
  { timestamps: true }
);

const Event: Model<IEvent> =
  mongoose.models.Event ?? mongoose.model<IEvent>("Event", EventSchema);

export default Event;
