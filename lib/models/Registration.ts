import mongoose, { Schema, Document, Model } from "mongoose";

export type RegistrationStatus = "pending" | "approved" | "rejected";
export type RegistrationRole   = "student" | "lecturer";

export interface IRegistration extends Document {
  role:            RegistrationRole;
  name:            string;
  email:           string;
  contact:         string;
  passwordHash:    string;
  status:          RegistrationStatus;
  /* student-only */
  semester?:       string;
  gender?:         string;
  age?:            number;
  /* lecturer-only */
  position?:       string;
  /* shared */
  profilePicture?:         string;
  profilePictureData?:     Buffer;
  profilePictureMimeType?: string;
  profilePictureSize?:     number;
  profilePictureFileName?: string;
  createdAt:       Date;
  updatedAt:       Date;
}

const RegistrationSchema = new Schema<IRegistration>(
  {
    role:          { type: String, enum: ["student", "lecturer"], required: true },
    name:          { type: String, required: true, trim: true },
    email:         { type: String, required: true, lowercase: true, trim: true },
    contact:       { type: String, required: true },
    passwordHash:  { type: String, required: true },
    status:        { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    /* student */
    semester:      { type: String },
    gender:        { type: String },
    age:           { type: Number },
    /* lecturer */
    position:      { type: String },
    /* shared */
    profilePicture:         { type: String },
    profilePictureData:     { type: Buffer },
    profilePictureMimeType: { type: String },
    profilePictureSize:     { type: Number },
    profilePictureFileName: { type: String },
  },
  { timestamps: true }
);

const Registration: Model<IRegistration> =
  mongoose.models.Registration ?? mongoose.model<IRegistration>("Registration", RegistrationSchema);

export default Registration;
