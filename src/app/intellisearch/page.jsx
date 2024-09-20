'use client'
import Image from 'next/image'
import { useState } from 'react'
import Logo from '@/images/logos/logo.gif'
import background from '@/images/purple_blue_gradient.jpg'
import backgroundImage from '@/images/background-features.jpg'

export default function Home() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('http://127.0.0.1:8000/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ query: query }),
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const data = await response.text()
      setResults(data)
      setShowResults(true)
    } catch (err) {
      console.error('Fetch error:', err.message)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    setShowResults(false)
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-blue-600 bg-cover bg-center p-5 text-center text-white">
      <Image
        className="absolute left-1/2 top-1/2 max-w-none translate-x-[-44%] translate-y-[-42%]"
        src={backgroundImage}
        alt=""
        width={2245}
        height={1636}
        unoptimized
      />
      <div className='z-[60] flex flex-col justify-center items-center '>
        {!showResults ? (
          <>
            <Image
              src={Logo}
              alt="IntelliSearch Logo"
              width={150}
              height={150}
              className="mb-8"
            />
            <h1 className="text-shadow-lg mb-8 font-sans text-5xl">
              IntelliSearch
            </h1>
            <form
              onSubmit={handleSubmit}
              className="mb-8 flex flex-col items-center"
            >
              <label htmlFor="query" className="mb-2 text-lg text-gray-200">
                Search Topic
              </label>
              <input
                type="text"
                id="query"
                name="query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                required
                className="w-96 rounded-lg border-2 border-gray-300 bg-white bg-opacity-90 p-4 text-center text-lg text-gray-800 outline-none transition duration-300 ease-in-out focus:border-blue-500"
              />
              <button
                type="submit"
                className="mt-4 rounded-md bg-blue-600 p-2 text-xl text-gray-800 transition-all hover:bg-gray-300 hover:text-black"
              >
                🕵
              </button>
            </form>
          </>
        ) : (
          <>
            <button
              onClick={handleBack}
              className="mb-4 cursor-pointer rounded-lg bg-blue-600 px-6 py-4 text-lg text-white transition-all hover:bg-blue-800"
            >
              Back to Search
            </button>
            <div
              className="mt-8"
              dangerouslySetInnerHTML={{ __html: results }}
            />
          </>
        )}
        {loading && (
          <p className="mt-4 text-2xl font-bold text-blue-900">
            <span className="mr-1 inline-block h-6 w-6 animate-pulse rounded-full bg-blue-900"></span>
            <span className="mr-1 inline-block h-6 w-6 animate-pulse rounded-full bg-blue-900"></span>
            <span className="inline-block h-6 w-6 animate-pulse rounded-full bg-blue-900"></span>
          </p>
        )}
        {error && <p className="text-red-500">{error}</p>}
      </div>
    </div>
  )
}
