import { FaPlus, FaTrash } from "react-icons/fa";

const Sidebar = ({ sidebarOpen, chats, activeChatId, createNewChat, deleteChat, switchChat }) => {
  return (
    <div
      className={`fixed md:static top-0 left-0 h-full w-64 sm:w-72 bg-gray-900 border-r border-white/10 z-50 flex flex-col transform transition-transform duration-300
      ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-white/10 flex-shrink-0">
        <span className="font-bold text-white text-sm sm:text-base">💬 Chats</span>
        <button
          onClick={createNewChat}
          className="text-green-400 hover:scale-110 transition-transform p-1"
          title="New Chat"
        >
          <FaPlus size={14} />
        </button>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-2">
        {chats.length === 0 ? (
          <p className="text-gray-400 text-xs sm:text-sm text-center mt-4 px-2">
            No chats yet. Start typing to begin!
          </p>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => switchChat(chat.id)}
              className={`p-2 sm:p-3 rounded-lg flex justify-between items-center cursor-pointer transition-colors ${
                activeChatId === chat.id
                  ? "bg-blue-600"
                  : "bg-white/5 hover:bg-white/10"
              }`}
            >
              <div className="overflow-hidden flex-1 mr-2">
                {/* Chat title */}
                <div className="text-xs sm:text-sm text-white truncate font-medium">
                  {chat.title}
                </div>

                {/* ✅ Date + Time */}
                <div className="flex items-center gap-1 mt-0.5">
                  {chat.date && (
                    <span className="text-[10px] sm:text-xs text-gray-400">
                      {chat.date}
                    </span>
                  )}
                  {chat.date && chat.time && (
                    <span className="text-[10px] text-gray-500">•</span>
                  )}
                  {chat.time && (
                    <span className="text-[10px] sm:text-xs text-gray-400">
                      {chat.time}
                    </span>
                  )}
                </div>
              </div>

              {/* Delete button */}
              <button
                onClick={(e) => deleteChat(chat.id, e)}
                className="text-red-400 hover:scale-110 transition-transform flex-shrink-0"
              >
                <FaTrash size={11} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Sidebar;