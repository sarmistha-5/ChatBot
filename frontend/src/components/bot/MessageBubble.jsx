const MessageBubble = ({ msg }) => {
  const isUser = msg.sender === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`px-4 py-3 rounded-2xl max-w-[75%] shadow-md ${
          isUser
            ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-br-sm"
            : "bg-white/10 backdrop-blur-md border border-white/10 text-gray-100 rounded-bl-sm"
        }`}
      >
        {/* Message text */}
        <div className="text-sm leading-relaxed">{msg.text}</div>

        {/* ✅ Date + Time below message */}
        <div className={`text-[10px] opacity-50 mt-1 flex gap-1
          ${isUser ? "justify-end" : "justify-start"}`}>
          {msg.date && <span>{msg.date}</span>}
          {msg.date && msg.time && <span>•</span>}
          {msg.time && <span>{msg.time}</span>}
        </div>

      </div>
    </div>
  );
};

export default MessageBubble;