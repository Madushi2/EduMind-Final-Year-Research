import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ILecturePdf extends Document {
  course:       Types.ObjectId;
  lecturer:     Types.ObjectId;
  title:        string;
  description?: string;
  specialNote?: string;
  fileName:     string;
  mimeType:     string;
  size:         number;
  fileData:     Buffer;
  active:       boolean;
  createdAt:    Date;
  updatedAt:    Date;
}

const LecturePdfSchema = new Schema<ILecturePdf>(
  {
    course:      { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    lecturer:    { type: Schema.Types.ObjectId, ref: "Registration", required: true, index: true },
    title:       { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    specialNote: { type: String, trim: true },
    fileName:    { type: String, required: true, trim: true },
    mimeType:    { type: String, required: true, default: "application/pdf" },
    size:        { type: Number, required: true },
    fileData:    { type: Buffer, required: true },
    active:      { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

const LecturePdf: Model<ILecturePdf> =
  mongoose.models.LecturePdf ?? mongoose.model<ILecturePdf>("LecturePdf", LecturePdfSchema);

export default LecturePdf;
