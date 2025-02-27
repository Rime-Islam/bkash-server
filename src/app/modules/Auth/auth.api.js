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

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.pin !== pin) {
      return res.status(500).json({ message: "Invalid PIN. Please try again." });
    }

    const token = jwt.sign({ id: user._id, accountType: user.accountType }, config.jwt_access_token, {
      expiresIn: "1d",
    });

    res.json({ message: "Login successful", token, user });

  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

export const getTotalBalance = async (req, res) => {
  try {
    // Aggregate total balance of all users
    const totalBalance = await User.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$balance" },
        },
      },
    ]);
    const total = totalBalance.length > 0 ? totalBalance[0].totalAmount : 0;

    res.status(200).json({ totalBalance: total });
  } catch (error) {
    console.error("Error fetching total balance:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ accountType: { $ne: "Admin" } }, "-pin");
    
    if (!users.length) {
      return res.status(404).json({ message: "No users found" });
    }

    res.json({ message: "Users retrieved successfully", users });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};


export const getAgents = async (req, res) => {
  try {
 
    const agents = await User.find({ accountType: 'Agent' }).select('name _id');

    if (!agents || agents.length === 0) {
      return res.status(404).json({ message: 'No agents found' });
    }

    res.json(agents); 
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};

export const getUsers = async (req, res) => {
  try {
    const { id } = req.params;
    const users = await User.find({ 
      accountType: 'User', 
      _id: { $ne: id } 
    }).select('name _id');
    if (!users || users.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }

    res.json(users); 
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};


export const blockUsers = async (req, res) => {
  try {
      const user = await User.findByIdAndUpdate(
        req.params.id, 
        { status: "Blocked" },
         { new: true });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "User blocked successfully", user });
  } catch (error) {
      res.status(500).json({ message: "Server error", error });
  }
}

export const getRequestedUsers = async (req, res) => {
  try {
    const users = await User.find(
      { accountType: { $nin: ["Admin", "User"] } }, 
      "-pin" 
  );
    if (!users.length) {
      return res.status(404).json({ message: "No requested users found" });
    }

    res.json({ 
      message: "Requested users retrieved successfully", 
      users 
    });

  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

export const acceptUser = async (req, res) => {
  try {
      const { id } = req.params;
      const user = await User.findByIdAndUpdate(
        id, 
        { 
          accountType: "Agent",
          balance: 100000
         }, { new: true });

      if (!user) {
          return res.status(404).json({ message: "User not found" });
      }
if(user){

}
      res.json({ message: "User accepted successfully", user });
  } catch (error) {
      res.status(500).json({ message: "Internal Server Error", error });
  }
};

export const rejectUser = async (req, res) => {
  try {
      const { id } = req.params;
      const user = await User.findByIdAndUpdate(id, { accountType: "Rejected" }, { new: true });

      if (!user) {
          return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "User rejected successfully", user });
  } catch (error) {
      res.status(500).json({ message: "Internal Server Error", error });
  }
};