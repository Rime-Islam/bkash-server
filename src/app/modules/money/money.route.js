import express from "express";
import { approveCashinRequest, CashinRequest, getCashinRequestsForAgent, sendMoney } from "./money.api.js";

const MoneyRouter = express.Router();

MoneyRouter.post("/cashin", CashinRequest);
MoneyRouter.get("/cashin/:id", getCashinRequestsForAgent);
MoneyRouter.patch("/approve/:id", approveCashinRequest);
MoneyRouter.post("/send", sendMoney);

export default MoneyRouter;