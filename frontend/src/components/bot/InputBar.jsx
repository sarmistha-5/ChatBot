const InputBar = ({ input, setInput, handleSendMessage, loading }) => {
  return (
    <footer className="flex-shrink-0 backdrop-blur-md bg-white/5 border-t border-white/10 p-2 sm:p-3">
      <div className="flex gap-2 max-w-4xl mx-auto">
        <input
          className="flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-xl bg-white/10 text-white text-sm placeholder-gray-400 outline-none focus:ring-1 focus:ring-green-400 transition"
          placeholder="Ask about DSA, React, placements..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && handleSendMessage()}
        />
        <button
          onClick={handleSendMessage}
          disabled={loading}
          className="px-3 sm:px-5 py-2 sm:py-3 rounded-xl bg-gradient-to-r from-green-400 to-blue-500 text-white text-sm font-medium disabled:opacity-50 hover:opacity-90 transition active:scale-95 flex-shrink-0"
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </footer>
  );
};

export default InputBar;
