import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    pin: { type: String, required: true},
    mobile: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    nid: { type: String, required: true, unique: true },
    accountType: { type: String, enum: ["User", "Agent", "Admin"], required: true },
    balance: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
