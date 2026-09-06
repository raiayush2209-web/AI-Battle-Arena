import mongoose, { Schema, Document, Model } from "mongoose";

// 1. Define an interface for the User document
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
}

// 2. Create the schema with TypeScript types
const userSchema: Schema<IUser> = new Schema<IUser>({
  username: {
    type: String,
    required: [true, "Username is required"],
    unique: true, // `unique` is a boolean, not an array
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    select: false,
  },
});

// 3. Add pre and post hooks
userSchema.pre<IUser>("save", function () {
  console.log("Pre-save hook triggered for:", this.username);
});

userSchema.post<IUser>("save", function (doc) {
  console.log("Post-save hook triggered for:", doc.username);
});

// 4. Create the model
const UserModel: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default UserModel;
