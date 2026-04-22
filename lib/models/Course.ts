import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ICourse extends Document {
  name:      string;
  code:      string;
  semester:  string;
  credits:   number;
  active:    boolean;
  lecturers: Types.ObjectId[];
  students:  Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    name:      { type: String, required: true, trim: true },
    code:      { type: String, required: true, trim: true, uppercase: true },
    semester:  { type: String, required: true },
    credits:   { type: Number, required: true, min: 1 },
    active:    { type: Boolean, default: true },
    lecturers: [{ type: Schema.Types.ObjectId, ref: "Registration" }],
    students:  [{ type: Schema.Types.ObjectId, ref: "Registration" }],
  },
  { timestamps: true }
);

const Course: Model<ICourse> =
  mongoose.models.Course ?? mongoose.model<ICourse>("Course", CourseSchema);

export default Course;
