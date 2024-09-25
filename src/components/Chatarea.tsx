'use client';

import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { FaComments, FaTimes } from 'react-icons/fa';

const ChatComponent: React.FC = () => {
  const [isChatboxOpen, setIsChatboxOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    {
      role: 'bot',
      content: "Great to meet you. I'm here to help with your questions.",
    },
  ]);
  const [input, setInput] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleChatbox = () => {
    setIsChatboxOpen((prev) => !prev);
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (input.trim() === '') return;

    // Add user's message to messages
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: 'user', content: input },
    ]);

    setIsLoading(true);

    // Add placeholder for bot's response
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: 'bot', content: 'Thinking...' },
    ]);

    try {
      const response = await fetch('http://localhost:8000/api/query/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: input,
          index_name: 'intelliscan-chatbot',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Network response was not ok');
      }

      const data = await response.json();
      const text =
        data.response ||
        "I apologize, but I'm having trouble generating a response right now.";

      // Replace 'Thinking...' with actual response
      setMessages((prevMessages) => {
        const newMessages = prevMessages.slice(0, prevMessages.length - 1);
        newMessages.push({ role: 'bot', content: text });
        return newMessages;
      });
    } catch (error: any) {
      // Replace 'Thinking...' with error message
      setMessages((prevMessages) => {
        const newMessages = prevMessages.slice(0, prevMessages.length - 1);
        newMessages.push({ role: 'bot', content: 'Oops! Something went wrong.' });
        return newMessages;
      });
      console.error('Error:', error);
      alert(`Oops! Something went wrong: ${error.message}`);
    } finally {
      setIsLoading(false);
      setInput('');
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !isLoading) {
      sendMessage();
    }
  };

  const resetChat = () => {
    setMessages([
      {
        role: 'bot',
        content: "Great to meet you. I'm here to help with your questions.",
      },
    ]);
    setInput('');
  };

  return (
    <>
      <div className="fixed bottom-0 right-0 mb-4 mr-4 z-50">
        <button
          id="open-chat"
          className="bg-[#151516] text-white py-2 px-4 rounded-md hover:bg-[#616162] transition duration-300 flex items-center"
          onClick={toggleChatbox}
        >
          <FaComments className="w-6 h-6 mr-2" />
          Chat
        </button>
      </div>

      {/* Overlay */}
      {isChatboxOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-[60]"
          onClick={toggleChatbox}
        ></div>
      )}

      <div
        id="chat-container"
        className={`fixed bottom-16 right-2 sm:right-4 w-[340px] sm:w-96 transition-transform duration-300 z-[70] ${isChatboxOpen ? 'translate-x-0' : 'translate-x-[500px]'
          }`}
      >
        <div className="bg-white shadow-md rounded-lg max-w-lg w-full">
          <div className="p-4 border-b bg-[#2463eb] text-white rounded-t-lg flex justify-between items-center">
            <p className="text-lg font-semibold">Chat</p>
            <button
              id="close-chat"
              className="text-gray-300 hover:text-gray-400 focus:outline-none focus:text-gray-400"
              onClick={toggleChatbox}
            >
              <FaTimes className="w-6 h-6" />
            </button>
          </div>
          <div className="p-4 h-80 overflow-y-auto">
            {/* Chat messages will be displayed here */}
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-2 ${message.role === 'user' ? 'text-right' : 'text-left'
                  }`}
              >
                <p
                  className={`${message.role === 'user'
                    ? 'bg-[#2463eb] text-white'
                    : 'bg-gray-200 text-gray-700'
                    } rounded-lg py-2 px-4 inline-block`}
                >
                  {message.content}
                </p>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-center items-center mt-4">
                <div className="animate-spin border-t-4 border-[#2463eb] border-solid h-8 w-8 rounded-full"></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-4 border-t flex">
            <input
              id="user-input"
              type="text"
              placeholder="Type a message"
              className="w-full px-3 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              id="send-button"
              className="bg-[#2463eb] text-white px-4 py-2 rounded-r-md hover:bg-[#2463eb]/70 transition duration-300"
              onClick={sendMessage}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="animate-spin border-t-4 border-white border-solid h-5 w-5 rounded-full"></div>
              ) : (
                'Send'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatComponent;
