import express from 'express'
import {getBotResponse,getChatHistory,deleteSession} from '../controllers/chatbot.controller.js'
import protectRoute from '../middleware/protectRoute.js'


const router=express.Router();

router.post("/message", protectRoute,getBotResponse)
router.get("/history", protectRoute, getChatHistory); 
router.delete("/session/:sessionId", protectRoute, deleteSession);




export default router;

