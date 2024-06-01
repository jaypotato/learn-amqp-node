import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    placeOfBirth: { type: String, required: true },
    utcOffset: { type: Number, required: true }, // save offset in minutes
    email: { type: String, required: true },
    // isDeleted: Boolean // just in case need softdelete
  },
  {
    collection: "user",
    timestamps: true,
  }
);

UserSchema.index({ email: 1 }, { unique: true });
export const UserModel = mongoose.model("User", UserSchema);

export const getUsers = () => UserModel.find();
export const getUserByEmail = (email: string) => UserModel.findOne({ email });
export const getUserById = (id: string) => UserModel.findById(id);
export const createUser = (values: Record<string, any>) =>
  new UserModel(values).save().then((user) => user.toObject());
export const deleteUserByEmail = (email: string) =>
  UserModel.findOneAndDelete({ email });