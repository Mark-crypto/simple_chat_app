import { socket } from "./socket";
import { useEffect, useRef, useState } from "react";

type Chat = {
  sender: string;
  time: string;
  message: string;
};

function App() {
  const [showChat, setShowChat] = useState(false);
  const [chatHistory, setChatHistory] = useState<Chat[]>([]);
  const [message, setMessage] = useState("");
  const [sender, setSender] = useState("");
  const [receiver, setReceiver] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<Record<string, string>>({});

  const roomId = [sender, receiver].sort().join("_").toLowerCase();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    socket.on("onlineStatus", (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.off("onlineStatus");
    };
  }, []);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  useEffect(() => {
    socket.on("privateMessage", ({ sender, message, time }) => {
      setChatHistory((prev) => [...prev, { sender, message, time }]);
    });

    return () => {
      socket.off("privateMessage");
    };
  }, []);

  const handleForm = () => {
    socket.emit("join-room", { roomId, sender });
    setShowChat(true);
  };

  const sendMessage = () => {
    const now = new Date();
    const time = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    socket.emit("privateMessage", { roomId, sender, message, time });
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4 py-6 font-sans">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-blue-600">Encrypted Chat</h1>
        <p className="text-gray-500">Your privacy is our priority</p>
      </div>

      {!showChat ? (
        <form className="bg-white p-6 rounded-xl shadow-md w-full max-w-md space-y-4">
          <div>
            <label
              htmlFor="sender"
              className="block text-sm font-medium text-gray-700"
            >
              From
            </label>
            <input
              type="text"
              id="sender"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={sender}
              onChange={(e) => setSender(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="receiver"
              className="block text-sm font-medium text-gray-700"
            >
              To
            </label>
            <input
              type="text"
              id="receiver"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={receiver}
              onChange={(e) => setReceiver(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={handleForm}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Submit
          </button>
        </form>
      ) : (
        <div className="bg-white w-full max-w-2xl h-[80vh] rounded-xl shadow-md flex flex-col">
          <div className="text-sm text-gray-500 mb-2 text-center">
            {receiver} is{" "}
            {onlineUsers[receiver] ? (
              <span className="text-green-500 font-semibold">Online</span>
            ) : (
              <span className="text-gray-400">Offline</span>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatHistory.map((chat, i) => {
              const isMe = chat.sender === sender;
              return (
                <div
                  key={i}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg shadow ${
                      isMe
                        ? "bg-blue-500 text-white rounded-br-none"
                        : "bg-gray-200 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm font-semibold">
                      {isMe ? "You" : chat.sender}
                    </p>
                    <p>{chat.message}</p>
                    <p className="text-xs text-right text-gray-100 mt-1">
                      {chat.time}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type your message..."
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
