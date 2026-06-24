import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import mongoose from 'mongoose'
import chatbotRoutes from './routes/chatbot.route.js'
import cors from 'cors'
import authRoutes from './routes/auth.route.js'



const app=express()

app.use(express.json())

app.use(cors())

const port=process.env.PORT||3000


mongoose.connect(process.env.MONGO_URI)
.then(()=>{
    console.log("mongoDB is connected")
}).catch((err)=>{
    console.log("Error connecting to mongoDB", err.message)
})



app.get('/',(req,res)=>{
    res.send("hello world!")
})



//defining routes
app.use('/auth', authRoutes)  
app.use('/bot/v1/',chatbotRoutes)



app.listen(port,()=>{
    console.log(`server is running on port ${port}`)
  
})





