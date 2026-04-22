import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface INotificationRead extends Document {
  student:      Types.ObjectId;
  notification: Types.ObjectId;
  readAt:       Date;
}

const NotificationReadSchema = new Schema<INotificationRead>(
  {
    student:      { type: Schema.Types.ObjectId, ref: "Registration", required: true },
    notification: { type: Schema.Types.ObjectId, ref: "CourseNotification", required: true },
    readAt:       { type: Date, default: Date.now },
  },
  { timestamps: false }
);

NotificationReadSchema.index({ student: 1, notification: 1 }, { unique: true });

const NotificationRead: Model<INotificationRead> =
  mongoose.models.NotificationRead ??
  mongoose.model<INotificationRead>("NotificationRead", NotificationReadSchema);

export default NotificationRead;
