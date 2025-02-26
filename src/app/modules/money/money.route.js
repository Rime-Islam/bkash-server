import express from "express";
import { approveCashinRequest, CashinRequest, getCashinRequestsForAgent } from "./money.api.js";

const MoneyRouter = express.Router();

MoneyRouter.post("/cashin", CashinRequest);
MoneyRouter.get("/cashin/:id", getCashinRequestsForAgent);
MoneyRouter.patch("/approve/:id", approveCashinRequest);

export default MoneyRouter;