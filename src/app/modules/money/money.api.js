
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
  
  
  