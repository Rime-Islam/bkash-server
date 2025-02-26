import mongoose from 'mongoose';

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

// Define the CashTransaction schema (new schema)
const cashTransactionSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Referring to the 'User' model for the sender
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Referring to the 'User' model for the receiver
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1, // Ensure a positive amount
    },
    status: {
      type: String,
      enum: ['Success', 'Failed', 'Pending'],
      default: 'Pending', // Default status is 'Pending'
    },
    transactionDate: {
      type: Date,
      default: Date.now, // Automatically set to current date/time
    },
  },
  { timestamps: true } // Automatically add createdAt and updatedAt fields
);

// Create and export the Cash and CashTransaction models
const Cash = mongoose.model('Cash', cashInRequestSchema);
const CashTransaction = mongoose.model('CashTransaction', cashTransactionSchema);

export { Cash, CashTransaction };
