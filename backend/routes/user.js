import express from "express"
import { deleteUser, getUsers, loginUser, registerUser, updateUser, requestPassReset, resetPassword } from "../controllers/user.js";

export const userRouter = express.Router();

userRouter.get("/hello", (req, res, next)=>{res.status(200).json({message: "hello world"})})  // test api
userRouter.post('/login', loginUser);
userRouter.post('/register', registerUser);
userRouter.get('/get-users', getUsers); 
userRouter.patch('/update-user', updateUser);
userRouter.delete('/delete-user/:id', deleteUser);
userRouter.post("/forgot-password", requestPassReset);
userRouter.post("/reset-password/:token", resetPassword);



