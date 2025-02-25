import User from "./auth.schema.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../../config/index.js";


export const register = async (req, res) => {
  try {
    const { name, pin, mobile, email, accountType, nid } = req.body;

    const existingUser = await User.findOne({
      $or: [{ mobile }, { email }, { nid }],
    });

    if (existingUser)
        {
            return res.status(400).json({ message: "User already exists! Please check your NID, email or PIN " });
        };

    let balance = accountType === "Agent" ? 100000 : 40;

    const newUser = new User({
      name,
      pin,
      mobile,
      email,
      accountType,
      nid,
      balance,
    });

    await newUser.save();
    res.status(201).json({ message: "Registration successful", newUser });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

export const login = async (req, res) => {
  try {
    const { identifier, pin } = req.body;

    const user = await User.findOne({ $or: [{ mobile: identifier }, { email: identifier }] });

    if (!user) return res.status(400).json({ message: "User not found" });

   
    const token = jwt.sign({ id: user._id, accountType: user.accountType }, config.jwt_access_token, {
      expiresIn: "1d",
    });

    res.json({ message: "Login successful", token, user });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};
