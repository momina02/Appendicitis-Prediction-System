import React, { useState } from "react";
import axios from "axios";
import "./Chatbot.css"; // Make sure this file has your custom styles

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userInput = input;
    const newMessages = [...messages, { text: userInput, sender: "user" }];
    setMessages(newMessages);
    setInput("");

    try {
      // Changed endpoint URL and payload key to "question"
      const response = await axios.post("http://127.0.0.1:8000/ask", { question: userInput });
      console.log("Backend response:", response.data);
      setMessages([...newMessages, { text: response.data.response, sender: "bot" }]);
    } catch (error) {
      console.error("Error connecting to chatbot:", error);
      setMessages([...newMessages, { text: "Error: Unable to connect to chatbot", sender: "bot" }]);
    }
  };

  return (
    <div className="custom-chatbot-container">
      {isOpen ? (
        <div className="custom-chatbot-box">
          <div className="custom-chatbot-header">
            <span>Chatbot</span>
            <button onClick={() => setIsOpen(false)} className="custom-chatbot-close">×</button>
          </div>
          <div className="custom-chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`custom-chatbot-message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
          </div>
          <div className="custom-chatbot-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask something..."
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      ) : (
        <button className="custom-chatbot-toggle" onClick={() => setIsOpen(true)}>🩺</button>
      )}
    </div>
  );
};

export default Chatbot;
