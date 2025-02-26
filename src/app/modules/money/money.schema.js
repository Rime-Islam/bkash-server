import mongoose from "mongoose";

// Define the CashInRequest schema
const cashInRequestSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
      min: [1, 'Amount must be greater than 0'], // You can set a minimum value for the amount
    },
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Assuming you have a User model where agents are stored
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    pin: {
      type: String,
      required: true,
      minLength: [5, 'PIN must be 5 digits'],
      maxLength: [5, 'PIN must be 5 digits'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending', 
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Will add createdAt and updatedAt fields automatically
  }
);


// Create and export the CashInRequest model
const Cash = mongoose.model('Cash', cashInRequestSchema);

export default Cash;