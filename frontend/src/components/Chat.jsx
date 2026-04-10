import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./Chat.css";

export default function Chat({ user }) {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [typing, setTyping] = useState(false);
  const chatEndRef = useRef(null);
  // Add this at the top
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const fetchHistory = async () => {
  try {
   const res = await axios.get(`${API_URL}/api/history/?user_id=${user}`);


    const formatted = res.data.flatMap(item => [
      { id: item.id, sender: "user", text: item.message },
      { id: item.id, sender: "bot", text: item.response }
    ]);

    setChat(formatted);

  } catch (err) {
    console.log(err);
  }
};

useEffect(() => {
  if (!user) return;

  const loadData = async () => {
    await fetchHistory();
  };

  loadData();

}, [user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMsg = { sender: "user", text: message };
    setChat(prev => [...prev, userMsg]);

    setTyping(true);

    const res = await axios.post(`${API_URL}/api/chat/`, {

      message,
      user_id: user
    });

    setTyping(false);

    const botMsg = { sender: "bot", text: res.data.response };
    setChat(prev => [...prev, botMsg]);

    setMessage("");
  };

const deleteChat = async (id) => {
  if (!id) {
    console.log("Invalid ID");
    return;
  }

  try {
   await axios.delete(`${API_URL}/api/delete/${id}/`);
    fetchHistory();
  } catch (err) {
    console.log("Delete error:", err);
  }
};

  return (
    <div className="chat-container">
      <div className="chat-header">AI Chat</div>

      <div className="chat-body">
        {chat.map((c, i) => (
          <div key={i} className={`chat-bubble ${c.sender}`}>
            {c.text}
            {c.sender === "bot" && (
              <button onClick={() => deleteChat(c.id)}>❌</button>
            )}
          </div>
        ))}

        {typing && <div className="bot">Typing...</div>}

        <div ref={chatEndRef}></div>
      </div>

      <div className="chat-footer">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}