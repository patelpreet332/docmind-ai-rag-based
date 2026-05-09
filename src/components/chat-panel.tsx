'use client'

import { useState } from 'react'

export function ChatPanel({
  documentId,
  documentName,
}: {
  documentId: string
  documentName: string
}) {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sourceCount, setSourceCount] = useState<number | null>(null)
  const [lastQuestion, setLastQuestion] = useState('')
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null)
  const [mode, setMode] = useState('strict')

  async function askQuestion() {
    const trimmedQuestion = question.trim()

    if (!trimmedQuestion) return

    setLoading(true)
    setAnswer('')
    setError('')
    setSourceCount(null)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId,
          question: trimmedQuestion,
          mode,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Unable to get response.')
      }

      setAnswer(data.answer)
      setSourceCount(typeof data.sources === 'number' ? data.sources : null)
      setLastQuestion(trimmedQuestion)
      setLastUpdatedAt(new Date())
    } catch (askError) {
      const message =
        askError instanceof Error
          ? askError.message
          : 'Something went wrong while asking the question.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='rounded-2xl border border-zinc-800 bg-zinc-900 p-8'>
      <h2 className='mb-4 text-xl font-semibold'>Chat With PDF</h2>
      <p className='mb-4 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3 py-2 text-sm text-indigo-200'>
        Fresh context loaded for{' '}
        <span className='font-semibold'>{documentName}</span>. Ask a new
        question to get an answer only from this file.
      </p>

      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder='Ask a question from the selected PDF...'
        className='mb-3 min-h-28 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-4 outline-none transition focus:border-indigo-500'
      />
      <div className='mb-4'>
        <label className='mb-3 block text-sm font-medium text-zinc-400'>
          Answer Mode
        </label>

        <div className='grid gap-3 sm:grid-cols-3'>
          <label className='flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 transition hover:border-indigo-500'>
            <input
              type='radio'
              name='mode'
              value='strict'
              checked={mode === 'strict'}
              onChange={(e) => setMode(e.target.value)}
              className='h-4 w-4 accent-indigo-500'
            />
            <div>
              <p className='text-sm font-medium text-white'>
                📄 Exact Document
              </p>
              <p className='text-xs text-zinc-400'>Only PDF content</p>
            </div>
          </label>

          <label className='flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 transition hover:border-indigo-500'>
            <input
              type='radio'
              name='mode'
              value='expert'
              checked={mode === 'expert'}
              onChange={(e) => setMode(e.target.value)}
              className='h-4 w-4 accent-indigo-500'
            />
            <div>
              <p className='text-sm font-medium text-white'>🧠 AI Expert</p>
              <p className='text-xs text-zinc-400'>Enhanced with AI insight</p>
            </div>
          </label>

          <label className='flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 transition hover:border-indigo-500'>
            <input
              type='radio'
              name='mode'
              value='summary'
              checked={mode === 'summary'}
              onChange={(e) => setMode(e.target.value)}
              className='h-4 w-4 accent-indigo-500'
            />
            <div>
              <p className='text-sm font-medium text-white'>⚡ Summary</p>
              <p className='text-xs text-zinc-400'>Quick concise answer</p>
            </div>
          </label>
        </div>
      </div>
      <p className='mb-4 text-xs text-zinc-400'>
        Press <span className='font-semibold text-zinc-300'>Ask AI</span> after
        changing document to start a fresh Q&A.
      </p>

      <button
        onClick={askQuestion}
        disabled={loading || !question.trim()}
        className='rounded-xl bg-indigo-600 px-5 py-3 font-medium transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50'
      >
        {loading ? 'Thinking...' : 'Ask AI'}
      </button>

      {error ? (
        <div className='mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200'>
          {error}
        </div>
      ) : null}

      {answer && (
        <>
          <div className='mt-6 flex flex-wrap items-center gap-2 text-xs'>
            {sourceCount !== null ? (
              <span className='rounded-full border border-indigo-400/40 bg-indigo-400/10 px-2 py-1 text-indigo-200'>
                {sourceCount} matched chunk{sourceCount === 1 ? '' : 's'}
              </span>
            ) : null}
            {lastUpdatedAt ? (
              <span className='rounded-full border border-zinc-700 bg-zinc-800 px-2 py-1 text-zinc-300'>
                {lastUpdatedAt.toLocaleTimeString()}
              </span>
            ) : null}
          </div>

          {lastQuestion ? (
            <div className='mt-3 rounded-xl border border-zinc-800 bg-zinc-950/70 p-3 text-sm text-zinc-300'>
              <p className='mb-1 text-xs uppercase tracking-wide text-zinc-500'>
                Your question
              </p>
              {lastQuestion}
            </div>
          ) : null}

          <div className='mt-3 rounded-xl border border-zinc-800 bg-zinc-950 p-4 leading-7 text-zinc-200'>
            {answer}
          </div>
        </>
      )}
    </div>
  )
}
