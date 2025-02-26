import express from "express";
import { register, login, getAllUsers, blockUsers, getRequestedUsers, acceptUser, rejectUser, getAgents, getUsers } from "./auth.api.js";

const AuthRouter = express.Router();

AuthRouter.post("/register", register);
AuthRouter.post("/login", login);
AuthRouter.get("/", getAllUsers);
AuthRouter.get("/agents", getAgents);
AuthRouter.get("/users/:id", getUsers);
AuthRouter.get("/request", getRequestedUsers);
AuthRouter.patch("/users/:id", blockUsers);
AuthRouter.patch("/accept/:id", acceptUser);
AuthRouter.patch("/reject/:id", rejectUser);

export default AuthRouter;