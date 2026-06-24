import Message from "../models/message.model.js";
import { GoogleGenerativeAI } from "@google/generative-ai";



// ─── Generate smart session title ───
const generateSessionTitle = (message) => {
  const key = message.toLowerCase().trim();
  if (key.includes("react")) return "React";
  if (key.includes("node")) return "Node.js";
  if (key.includes("mongodb") || key.includes("mongo")) return "MongoDB";
  if (key.includes("dsa") || key.includes("algorithm") || key.includes("data structure")) return "DSA";
  if (key.includes("javascript") || key.includes("js")) return "JavaScript";
  if (key.includes("system design")) return "System Design";
  if (key.includes("tailwind")) return "Tailwind CSS";
  if (key.includes("typescript")) return "TypeScript";
  if (key.includes("nextjs") || key.includes("next.js")) return "Next.js";
  if (key.includes("css") || key.includes("flexbox") || key.includes("grid")) return "CSS";
  if (key.includes("git")) return "Git";
  if (key.includes("docker")) return "Docker";
  if (key.includes("aws")) return "AWS";
  if (key.includes("oop") || key.includes("object")) return "OOP Concepts";
  if (key.includes("os") || key.includes("operating system") || key.includes("process") || key.includes("thread")) return "Operating System";
  if (key.includes("network") || key.includes("tcp") || key.includes("http") || key.includes("dns")) return "Computer Networks";
  if (key.includes("database") || key.includes("sql") || key.includes("dbms")) return "Database";
  if (key.includes("hr") || key.includes("behavioral") || key.includes("yourself")) return "HR Questions";
  if (key.includes("resume")) return "Resume Tips";
  if (key.includes("interview")) return "Interview Prep";
  if (key.includes("placement")) return "Placement Tips";
  if (key.includes("salary")) return "Salary Negotiation";
  if (key.includes("sort") || key.includes("search")) return "Algorithms";
  if (key.includes("hook")) return "React Hooks";
  if (key.includes("jwt") || key.includes("auth")) return "Authentication";
  if (key.includes("api")) return "API Design";
  if (key.includes("security") || key.includes("xss") || key.includes("csrf")) return "Security";
  if (key.includes("deploy") || key.includes("vercel") || key.includes("render")) return "Deployment";
  if (key.includes("test") || key.includes("jest")) return "Testing";
  return message.slice(0, 20);
};

// ─── Send message + get Gemini AI response ───
export const getBotResponse = async (req, res) => {
  const { message, sessionId, sessionTitle } = req.body;
  const userId = req.user._id;

 const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);




  try {
    console.log("message ->", message);

    if (!message?.trim()) {
      return res.status(400).json({ error: "Message cannot be empty" });
    }

    if (!sessionId) {
      return res.status(400).json({ error: "Session ID is required" });
    }

    //  Get previous messages for context
    const previousMessages = await Message.find({ userId, sessionId })
      .sort({ createdAt: 1 })
      .select("sender text");

    //  Smart title on first message only
    let smartTitle = sessionTitle || "New Chat";
    if (previousMessages.length === 0) {
      smartTitle = generateSessionTitle(message);
    }

    //  Build Gemini history format
    const history = previousMessages.map((msg) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    }));

    //  Gemini model with strict SDE-only instruction
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: `You are a friendly SDE Interview Prep Assistant. 

BASIC CONVERSATIONS (answer naturally and briefly):
- Greetings like "hi", "hello", "hey" → Reply warmly and friendly. Example: "Hey! 👋 Ready to ace your interviews? Ask me anything about DSA, React, Node.js, or system design!"
- "thank you", "thanks" → "You're welcome! Keep grinding! 💪"
- "bye", "goodbye" → "Goodbye! Best of luck with your interviews! 🚀"
- "good morning/evening/night" → Respond naturally with a warm greeting
- "how are you" → "I'm doing great! Ready to help you crack interviews! 💪 What topic shall we cover today?"
- "great", "awesome", "nice", "ok", "okay" → Respond naturally and briefly
- "who are you", "what are you" → "I'm your SDE Interview Prep Assistant! 🤖 I help with DSA, MERN stack, system design, HR questions, and placement prep!"
- "what can you do" → "I can help you with DSA, JavaScript, React, Node.js, MongoDB, system design, OS, CN, OOP, DBMS, HR questions and placement tips! Ask me anything! 🚀"

TOPICS YOU ANSWER (tech/interview only):
- DSA (Arrays, Linked Lists, Trees, Graphs, Sorting, Searching, DP, Recursion)
- JavaScript (closures, hoisting, promises, async/await, ES6+, event loop)
- React (hooks, state, props, context, virtual DOM, lifecycle)
- Node.js (Express, middleware, REST API, JWT, bcrypt)
- MongoDB (Mongoose, schemas, aggregation, indexing, populate)
- System Design (scalability, caching, load balancing, microservices)
- CSS and Tailwind CSS (flexbox, grid, responsive design, gradients)
- TypeScript, Next.js, Git, Docker, AWS
- OOP (encapsulation, inheritance, polymorphism, abstraction)
- Operating System (processes, threads, deadlock, memory management)
- Computer Networks (OSI model, TCP/IP, HTTP, DNS, WebSocket)
- Database (SQL, NoSQL, normalization, ACID, joins, indexing)
- Security (JWT, OAuth, XSS, CSRF, bcrypt, helmet)
- Testing (Jest, unit testing, TDD, Postman)
- HR and Behavioral questions (STAR method, introduce yourself)
- Placement, resume tips, salary negotiation
- Deployment (Vercel, Render, Docker, AWS, CI/CD)

IF USER ASKS ANYTHING OUTSIDE ABOVE TOPICS (politics, movies, sports, cooking, general knowledge etc.):
Reply EXACTLY:
"I'm your SDE Interview Prep Assistant! 🤖 I can only help with tech and interview topics like:
- DSA and Algorithms
- JavaScript, React, Node.js, MongoDB
- System Design
- CSS and Tailwind CSS
- OS, CN, OOP, DBMS
- HR questions and placement tips

Please ask me something related to software development or interviews! 💪"

RESPONSE STYLE — VERY IMPORTANT:
- Keep answers SHORT and CONCISE (max 8-10 lines for normal questions)
- For simple questions: 3-5 lines maximum
- Use bullet points instead of long paragraphs
- Include ONE small code example only if absolutely necessary
- For DSA mention time/space complexity in ONE line
- NO long explanations — straight to the point
- Think like a quick interview flashcard answer, not a textbook chapter
- For greetings/casual chat: 1-2 lines only`,
    });

    //  Start chat with history for memory
    const chat = model.startChat({ history });

    //  Send message to Gemini
    console.log("Calling Gemini...");
    const result = await chat.sendMessage(message);
    const botReply = result.response.text();
    console.log("Gemini replied ✅");

    //  Save user message to MongoDB
    await Message.create({
      sender: "user",
      text: message,
      userId,
      sessionId,
      sessionTitle: smartTitle,
    });

    //  Save bot reply to MongoDB
    await Message.create({
      sender: "bot",
      text: botReply,
      userId,
      sessionId,
      sessionTitle: smartTitle,
    });

    return res.status(200).json({
      userMessage: message,
      botReply,
      sessionTitle: smartTitle,
    });

  } catch (error) {
    console.error("Error in getBotResponse:", error.message);

    if (error.status === 429) {
      return res.status(200).json({
        userMessage: message,
        botReply: "⚠️ Too many requests! Please wait a moment and try again. 🙏",
      });
    }

    if (error.status === 400 || error.status === 401) {
      return res.status(200).json({
        userMessage: message,
        botReply: "⚠️ API key issue. Please check your Gemini API key! 🔑",
      });
    }

    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// ─── Get Chat History  ───
export const getChatHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const messages = await Message.find({ userId })
      .sort({ createdAt: 1 })
      .select("sender text sessionId sessionTitle createdAt");

    const sessionsMap = {};
    messages.forEach((msg) => {
      if (!sessionsMap[msg.sessionId]) {
        sessionsMap[msg.sessionId] = {
          sessionId: msg.sessionId,
          sessionTitle: msg.sessionTitle,
          createdAt: msg.createdAt,
          messages: [],
        };
      }
      sessionsMap[msg.sessionId].messages.push(msg);
    });

    const sessions = Object.values(sessionsMap).sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );

    return res.status(200).json({ success: true, sessions });

  } catch (error) {
    console.error("getChatHistory error:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// ─── Delete Session  ───
export const deleteSession = async (req, res) => {
  try {
    const userId = req.user._id;
    const { sessionId } = req.params;

    await Message.deleteMany({ userId, sessionId });

    return res.status(200).json({
      success: true,
      message: "Session deleted successfully",
    });

  } catch (error) {
    console.error("deleteSession error:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};