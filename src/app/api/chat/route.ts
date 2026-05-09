import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { db } from '@/src/lib/db'
import { ObjectId } from 'mongodb'
import { getEmbedding } from '@/src/lib/embed'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { documentId, question, mode } = await req.json()
    const normalizedQuestion =
      typeof question === 'string' ? question.trim() : ''

    if (!documentId || !normalizedQuestion) {
      return NextResponse.json(
        { success: false, message: 'Missing fields' },
        { status: 400 },
      )
    }

    // 1. Embed user question
    const questionEmbedding = await getEmbedding(normalizedQuestion)
    console.log(
      'Question embedding generated',
      questionEmbedding.slice(0, 5),
      '...',
      questionEmbedding.length,
    )

    // 2. Vector search in chunks collection
    const chunks = await db
      .collection('chunks')
      .aggregate([
        {
          $vectorSearch: {
            index: 'vector_index',
            path: 'embedding',
            queryVector: questionEmbedding,
            numCandidates: 150,
            limit: 8,
            filter: {
              documentId: new ObjectId(documentId),
            },
          },
        },
        {
          $project: {
            text: 1,
            score: {
              $meta: 'vectorSearchScore',
            },
          },
        },
      ])
      .toArray()

    if (chunks.length === 0) {
      return NextResponse.json({
        success: true,
        answer:
          'I could not find relevant information for this question in the selected document.',
        sources: 0,
      })
    }

    const context = chunks.map((chunk) => chunk.text).join('\n\n')

    let instructions = ''

    if (mode === 'strict') {
      instructions = `
      Use ONLY the document context.
      Answer exactly based on document.
      Do not add outside knowledge.
      If not found, say not found in document.
      `
    }

    if (mode === 'expert') {
      instructions = `
      Use document context as primary source.
      Then improve answer with professional expertise.
      Rephrase clearly.
      Add helpful guidance if useful.
      Mention if added advice is outside document.
      `
    }

    if (mode === 'summary') {
      instructions = `
      Use document context.
      Give short concise summary answer.
      Max 3 bullet points.
      `
    }

    const prompt = `
      You are DocMind AI.

      ${instructions}

      DOCUMENT CONTEXT:
      ${context}

      QUESTION:
      ${question}
`

    // const prompt = `
    //   You are DocMind AI.

    //   Use ONLY the provided document context.

    //   Instructions:
    //   - Give complete and accurate answers.
    //   - If answer spans multiple sections, combine them.
    //   - Use bullet points when useful.
    //   - Be clear and professional.
    //   - If information is missing, say exactly what is missing.
    //   - Do not invent facts.

    //   CONTEXT:
    //   ${context}

    //   QUESTION:
    //   ${normalizedQuestion}
    //   `

    // 3. Ask LLM
    const completion = await groq.chat.completions.create({
      // model: 'llama-3.1-8b-instant',
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const answer = completion.choices[0]?.message?.content || 'No answer found.'

    return NextResponse.json({
      success: true,
      answer,
      sources: chunks.length
      // sources: chunks.map((chunk, index) => ({
      //   id: index + 1,
      //   text: chunk.text.slice(0, 220),
      //   score: chunk.score,
      // })),
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { success: false, message: 'Chat failed' },
      { status: 500 },
    )
  }
}
