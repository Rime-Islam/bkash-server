
import User from "../Auth/auth.schema.js";
import { Cash, CashTransaction } from "./money.schema.js";

export const CashinRequest = async (req, res) => {
    try {
      const { amount, agentId, email, pin } = req.body;
  
      // Ensure required fields are present
      if (!amount || !agentId || !email || !pin) {
        return res.status(400).json({ message: "All fields are required." });
      }
  
      // Find the agent by ID
      const agent = await User.findById(agentId);
      if (!agent || agent.accountType !== "Agent") {
        return res.status(404).json({
          message: "Agent not found or invalid account type",
        });
      }
  
      // Find the user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Check if PIN matches
      if (user.pin !== pin) {
        return res.status(400).json({ message: "Invalid PIN. Please try again." });
      }
  
      // Create a cash-in request
      const cashInRequest = new Cash({
        amount,
        agentId,
        email: user.email, // Ensure email is provided
        pin, // Ensure pin is provided
        status: "Pending",
      });
  
      // Save the request
      await cashInRequest.save();
  
      res.status(200).json({
        message: "Cash-in request submitted successfully",
        cashInRequest,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error", error });
    }
  };
  
  export const getCashinRequestsForAgent = async (req, res) => {
    try {
        const { id } = req.params;
      
        const cashinRequests = await Cash.find({ agentId: id }); 
        
        res.status(200).json({ message: "Cash-in requests fetched successfully", cashinRequests });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error", error });
    }
};

export const cashOutByUser = async (req, res) => {
    try {
      const { amount, agentId, email, pin } = req.body;
      const cashOutAmount = Number(amount); // Ensure numeric value
  
      // Validate input
      if (!cashOutAmount || cashOutAmount <= 0) {
        return res.status(400).json({ message: "Invalid cash-out amount" });
      }
  
      // Find the user
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: "User not found" });
  
      // Validate PIN
      if (user.pin !== pin) return res.status(400).json({ message: "Invalid PIN" });
  
      // Find the agent
      const agent = await User.findById(agentId);
      if (!agent || agent.accountType !== "Agent") {
        return res.status(404).json({ message: "Agent not found or invalid" });
      }
  
      // Get the admin
      const admin = await User.findOne({ accountType: "Admin" });
      if (!admin) return res.status(500).json({ message: "Admin account not found" });
  
      // Calculate commissions
      const agentCommission = (cashOutAmount * 1) / 100; 
      const adminCommission = (cashOutAmount * 0.5) / 100; 
      const totalAmount = cashOutAmount + agentCommission + adminCommission; // Total bill
  
      // Check if user has enough balance
      if (user.balance < totalAmount) {
        return res.status(400).json({ message: "Insufficient balance", totalBill: totalAmount });
      }
  
      // Perform balance updates
      user.balance -= totalAmount; 
      agent.balance += agentCommission; 
      admin.balance += adminCommission; 
  
      // Save updated balances
      await user.save();
      await agent.save();
      await admin.save();
  
      // Log the transaction (Optional)
      const transaction = new CashTransaction({
        senderId: user._id,
        receiverId: agent._id,
        amount: cashOutAmount,
        status: "Success",
        type: "CashOut",
        commission: { agent: agentCommission, admin: adminCommission },
      });
      await transaction.save();
  
      // Response
      res.status(200).json({
        message: `Cash-out successful! Total bill ${totalAmount} TK`
      });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  };
  
  export const getTransactionsBySender = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Fetch transactions where the senderId matches
      const transactions = await CashTransaction.find({ id });
  
      if (!transactions || transactions.length === 0) {
        return res.status(404).json({ message: "No transactions found for this sender." });
      }
  
      res.status(200).json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  };

  export const getAllTransactions = async (req, res) => {
    try {
      // Fetch all transactions sorted by date (latest first)
      const transactions = await CashTransaction.find();
  
      if (!transactions || transactions.length === 0) {
        return res.status(404).json({ message: "No transactions found." });
      }
  
      res.status(200).json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  };

export const approveCashinRequest = async (req, res) => {
    const { id } = req.params;
    const { pin, Id } = req.body;
  
    try {
      const agent = await User.findById(Id);

      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
   
      if (agent.pin !== pin) {
        return res.status(400).json({ message: "Invalid PIN" });
      }
  
      const cashRequest = await Cash.findById(id);
      if (!cashRequest) {
        return res.status(404).json({ message: "Request not found" });
      }
      const user = await User.findOne({ email: cashRequest.email });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      if (agent.balance < cashRequest.amount) {
        return res.status(400).json({ message: "Agent has insufficient balance" });
      }

      agent.balance -= cashRequest.amount;
      user.balance += cashRequest.amount;

      await agent.save();
      await user.save();

      cashRequest.status = "Approved";
      await cashRequest.save();
  
      res.status(200).json({ message: "Cash-in request approved successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  };

  export const sendMoney = async (req, res) => {
    const { balance, receiverId, pin, senderId } = req.body;
  
    try {
      const sender = await User.findById(senderId);
  
      if (!sender) {
        return res.status(404).json({ message: "Sender not found" });
      }
  
      if (sender.pin !== pin) {
        return res.status(400).json({ message: "Invalid PIN" });
      }
  
      const receiver = await User.findById(receiverId);
  
      if (!receiver) {
        return res.status(404).json({ message: "Receiver not found" });
      }
  
      if (sender.balance < balance) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
  
      sender.balance -= balance;
      receiver.balance += Number(balance);
  
      if (balance > 100) {
        const admin = await User.findOne({ accountType: 'Admin' });  // Assuming the admin has accountType as 'Admin'
        if (admin) {
          admin.balance += 5;
          await admin.save();
        }
      }
  
      await sender.save();
      await receiver.save();
  
     
      const transaction = new CashTransaction({
        senderId,
        receiverId,
        amount: balance,
        status: 'Success',
      });
      await transaction.save();

      res.status(200).json({ message: "Money sent successfully" });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  };
  
  
  