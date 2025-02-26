import express from "express";
import { approveCashinRequest, CashinRequest, cashOutByUser, getCashinRequestsForAgent, sendMoney } from "./money.api.js";

const MoneyRouter = express.Router();

MoneyRouter.post("/cashin", CashinRequest);
MoneyRouter.get("/cashin/:id", getCashinRequestsForAgent);
MoneyRouter.patch("/approve/:id", approveCashinRequest);
MoneyRouter.post("/send", sendMoney);
MoneyRouter.post("/cashout", cashOutByUser);

export default MoneyRouter;