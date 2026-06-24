import useChat from "../../hooks/useChat";
import Header from "./Header";
import Sidebar from "./Sidebar";
import ChatArea from "./ChatArea";
import InputBar from "./InputBar";

const Bot = () => {
  const {
    input, setInput,
    loading,
    historyLoading, 
    sidebarOpen, setSidebarOpen,
    chats,
    activeChatId,
    currentMessages,
    messagesEndRef,
    createNewChat,
    deleteChat,
    switchChat,
    handleSendMessage,
  } = useChat();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">

      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        chats={chats}
        activeChatId={activeChatId}
        createNewChat={createNewChat}
        deleteChat={deleteChat}
        switchChat={switchChat}
      />

      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0 h-full">
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <ChatArea
          currentMessages={currentMessages}
          loading={loading}
          historyLoading={historyLoading}
          messagesEndRef={messagesEndRef}
        />
        <InputBar
          input={input}
          setInput={setInput}
          handleSendMessage={handleSendMessage}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default Bot;