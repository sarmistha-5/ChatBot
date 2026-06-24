import MessageBubble from "./MessageBubble";

const ChatArea = ({ currentMessages, loading, historyLoading,messagesEndRef }) => {
  return (
    <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 pb-24">
      
        {historyLoading ? (
        <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
          <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Loading your chat history...</p>
        </div>
      ) 
      
      
      : currentMessages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 gap-3">
          <span className="text-5xl">🚀</span>
          <p className="text-lg font-medium">Start a new conversation</p>
          <p className="text-sm">
            Ask me about Javascript,MongoDB, React,express, Node.js,interview or placement tips!
          </p>
        </div>
      ) : (
        currentMessages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} />
        ))
      )}

      {loading && (
        <div className="flex justify-start">
          <div className="bg-white/10 backdrop-blur-md border border-white/10 px-4 py-3 rounded-2xl rounded-bl-sm">
            <div className="flex gap-1 items-center">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </main>
  );
};

export default ChatArea;