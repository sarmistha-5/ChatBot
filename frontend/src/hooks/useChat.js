import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import config from "../config";

const useChat = () => {
  const { token } = useAuth();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messagesByChat, setMessagesByChat] = useState({});
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesByChat, activeChatId]);

  useEffect(() => {
    if (!token) return;
    loadChatHistory();
  }, [token]);

  //  Helper to format date nicely
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Helper to format time
  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const loadChatHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await axios.get(`${config.API_URL}/bot/v1/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const sessions = res.data.sessions;

      if (sessions && sessions.length > 0) {
        const newChats = [];
        const newMessagesByChat = {};

        sessions.forEach((session) => {
          newChats.push({
            id: session.sessionId,
            title: session.sessionTitle,
            date: formatDate(session.createdAt),       //  date label
            fullDate: new Date(session.createdAt),      //  for sorting
            time: formatTime(session.createdAt),        //  time
          });

          newMessagesByChat[session.sessionId] = session.messages.map((msg) => ({
            text: msg.text,
            sender: msg.sender,
            time: formatTime(msg.createdAt),
            date: formatDate(msg.createdAt),            //  date on each message
          }));
        });

        setChats(newChats.reverse());
        setMessagesByChat(newMessagesByChat);
        setActiveChatId(null); //  no active chat on login
      } else {
        setChats([]);
        setMessagesByChat({});
        setActiveChatId(null);
      }

    } catch (err) {
      console.error("Failed to load chat history:", err.message);
    }
    setHistoryLoading(false);
  };

  const createNewChat = () => {
    const id = `session_${Date.now()}`;
    setChats((prev) => [{
      id,
      title: "New Chat",
      date: "Today",
      fullDate: new Date(),
      time: formatTime(new Date()),
    }, ...prev]);
    setActiveChatId(id);
    setMessagesByChat((prev) => ({ ...prev, [id]: [] }));
  };

  const deleteChat = async (chatId, e) => {
    e.stopPropagation();
    try {
      await axios.delete(
        `${config.API_URL}/bot/v1/session/${chatId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Failed to delete session from DB:", err.message);
    }
    setChats((prev) => prev.filter((c) => c.id !== chatId));
    setMessagesByChat((prev) => {
      const updated = { ...prev };
      delete updated[chatId];
      return updated;
    });
    if (activeChatId === chatId) setActiveChatId(null);
  };

  const switchChat = (chatId) => {
    setActiveChatId(chatId);
    setInput("");
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    let chatId = activeChatId;

    //  Create new chat in sidebar ONLY when user sends first message
    if (!chatId) {
      chatId = `session_${Date.now()}`;
      setChats((prev) => [{
        id: chatId,
        title: "New Chat",
        date: "Today",
        fullDate: new Date(),
        time: formatTime(new Date()),
      }, ...prev]);
      setActiveChatId(chatId);
      setMessagesByChat((prev) => ({ ...prev, [chatId]: [] }));
    }

    const now = new Date();
    const userMsg = input;

    const currentMessages = messagesByChat[chatId] || [];
    const isFirstMessage = currentMessages.filter(m => m.sender === "user").length === 0;
    const sessionTitle = chats.find(c => c.id === chatId)?.title || "New Chat";

    //  Add user message with date + time
    setMessagesByChat((prev) => ({
      ...prev,
      [chatId]: [
        ...(prev[chatId] || []),
        {
          text: userMsg,
          sender: "user",
          time: formatTime(now),
          date: formatDate(now),
        },
      ],
    }));

    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(
        `${config.API_URL}/bot/v1/message`,
        {
          message: userMsg,
          sessionId: chatId,
          sessionTitle,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const botReply = res.data.botReply;
      const newTitle = res.data.sessionTitle;

      // Update sidebar title with smart title from backend
      if (isFirstMessage && newTitle) {
        setChats((prev) =>
          prev.map((c) =>
            c.id === chatId ? { ...c, title: newTitle } : c
          )
        );
      }

      // Add bot message with date + time
      setMessagesByChat((prev) => ({
        ...prev,
        [chatId]: [
          ...(prev[chatId] || []),
          {
            text: botReply,
            sender: "bot",
            time: formatTime(now),
            date: formatDate(now),
          },
        ],
      }));

    } catch (err) {
      console.error("API Error:", err);
      setMessagesByChat((prev) => ({
        ...prev,
        [chatId]: [
          ...(prev[chatId] || []),
          {
            text: "⚠️ Something went wrong. Is your backend running on port 5003?",
            sender: "bot",
            time: formatTime(now),
            date: formatDate(now),
          },
        ],
      }));
    }

    setLoading(false);
  };

  return {
    input, setInput,
    loading,
    historyLoading,
    sidebarOpen, setSidebarOpen,
    chats,
    activeChatId,
    currentMessages: messagesByChat[activeChatId] || [],
    messagesEndRef,
    createNewChat,
    deleteChat,
    switchChat,
    handleSendMessage,
    formatDate,
    formatTime,
  };
};

export default useChat;