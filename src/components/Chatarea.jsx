'use client'

import Markdown from 'react-markdown'
import { useState, useEffect, useRef } from 'react'
import { Send, Trash } from 'lucide-react'
import Image from 'next/image'
import Gemini from '@/images/avatars/geminis.jpeg'
import User from '@/images/avatars/user.jpg'

const ChatArea = () => {
  const messagesEndRef = useRef(null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([
    {
      role: 'model',
      parts: "Great to meet you. I'm here to help with your questions.",
    },
  ])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [history])

  async function chatting() {
    setLoading(true)
    setHistory((oldHistory) => [
      ...oldHistory,
      {
        role: 'user',
        parts: input,
      },
      {
        role: 'model',
        parts: 'Thinking...',
      },
    ])
    setInput('')

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
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Network response was not ok')
      }

      const data = await response.json()
      const text =
        data.response ||
        "I apologize, but I'm having trouble generating a response right now."

      setHistory((oldHistory) => {
        const newHistory = oldHistory.slice(0, oldHistory.length - 1)
        newHistory.push({
          role: 'model',
          parts: text,
        })
        return newHistory
      })
    } catch (error) {
      setHistory((oldHistory) => {
        const newHistory = oldHistory.slice(0, oldHistory.length - 1)
        newHistory.push({
          role: 'model',
          parts: 'Oops! Something went wrong.',
        })
        return newHistory
      })
      console.error('Error:', error)
      alert(`Oops! Something went wrong: ${error.message}`)
    }

    setLoading(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      chatting()
    }
  }

  function reset() {
    setHistory([
      {
        role: 'model',
        parts: "Great to meet you. I'm here to help with your questions.",
      },
    ])
    setInput('')
  }

  return (
    <div className="relative flex min-h-screen w-full max-w-3xl flex-col items-center rounded-t-3xl bg-gray-900 pt-6 text-white shadow-lg">
      <div className="flex h-full w-full flex-col space-y-4 overflow-y-auto p-4">
        {history.map((item, index) => (
          <div
            key={index}
            className={`flex items-start space-x-3 ${item.role === 'model' ? 'self-start' : 'self-end'}`}
          >
            <div className="h-10 w-10 rounded-full">
              <Image
                alt={item.role === 'model' ? 'Bot' : 'You'}
                src={item.role === 'model' ? { Gemini } : { User }}
                width={40}
                height={40}
                className="rounded-full"
              />
            </div>
            <div
              className={`max-w-xs rounded-lg p-3 ${item.role === 'model' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-white'}`}
            >
              <Markdown>{item.parts}</Markdown>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="absolute bottom-2 flex w-full gap-2 p-4">
        <button
          className="btn btn-outline btn-error rounded-full p-2 shadow-lg hover:bg-red-600"
          title="Reset chat"
          onClick={reset}
        >
          <Trash />
        </button>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="textarea w-full resize-none rounded-full bg-gray-800 p-2 text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          className={`btn rounded-full p-3 shadow-lg ${loading ? 'cursor-not-allowed bg-gray-600' : 'bg-blue-500 hover:bg-blue-700'}`}
          title="Send message"
          onClick={chatting}
          disabled={loading}
        >
          {loading ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : (
            <Send />
          )}
        </button>
      </div>
    </div>
  )
}

export default ChatArea
