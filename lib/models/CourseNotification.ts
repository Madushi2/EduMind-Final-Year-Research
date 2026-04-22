import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type NotificationPriority = "low" | "normal" | "high" | "urgent";

export interface ICourseNotification extends Document {
  course:      Types.ObjectId;
  lecturer:    Types.ObjectId;
  title:       string;
  description: string;
  priority:    NotificationPriority;
  createdAt:   Date;
  updatedAt:   Date;
}

const CourseNotificationSchema = new Schema<ICourseNotification>(
  {
    course:      { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    lecturer:    { type: Schema.Types.ObjectId, ref: "Registration", required: true, index: true },
    title:       { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    priority:    { type: String, enum: ["low", "normal", "high", "urgent"], default: "normal", index: true },
  },
  { timestamps: true }
);

const CourseNotification: Model<ICourseNotification> =
  mongoose.models.CourseNotification ??
  mongoose.model<ICourseNotification>("CourseNotification", CourseNotificationSchema);

export default CourseNotification;
