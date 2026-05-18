// components/Chat.tsx
import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import MarkdownRenderer from './mdxRenderer'

type Message = {
    role: 'user' | 'assistant'
    content: string
}

export default function Chat({ clientId }: { clientId: string }) {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [docs, setDocs] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [deletingDocId, setDeletingDocId] = useState<string | null>(null)
    const [clearingContext, setClearingContext] = useState(false)

    const fileRef = useRef<HTMLInputElement | null>(null)
    const messagesEndRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        axios.get(`/api/history/${clientId}`).then((r) => {
            setMessages(r.data.history || [])
        })
    }, [clientId])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: 'smooth',
        })
    }, [messages])

    async function send() {
        if (!input.trim() || loading) return

        const message = input

        const userMsg: Message = {
            role: 'user',
            content: message,
        }

        setMessages((m) => [...m, userMsg])
        setInput('')
        setLoading(true)

        try {
            const resp = await axios.post('/api/chat', {
                client_id: clientId,
                message,
            })

            setMessages((m) => [
                ...m,
                {
                    role: 'assistant',
                    content: resp.data.answer,
                },
            ])
        } catch (err) {
            setMessages((m) => [
                ...m,
                {
                    role: 'assistant',
                    content: 'Something went wrong. Please try again.',
                },
            ])
        } finally {
            setLoading(false)
        }
    }

    async function uploadFile() {
        const f = fileRef.current?.files?.[0]

        if (!f) return

        const fd = new FormData()
        fd.append('client_id', clientId)
        fd.append('file', f)

        setUploading(true)

        try {
            const r = await axios.post('/api/upload', fd, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })

            setDocs((d) => [
                ...d,
                {
                    id: r.data.doc_id,
                    chunks: r.data.num_chunks,
                },
            ])

            alert('PDF uploaded successfully')
        } catch (e) {
            alert('Upload failed')
        } finally {
            setUploading(false)
        }
    }

    async function deletePdf(docId: string) {
        if (!docId) return

        setDeletingDocId(docId)

        try {
            await axios.delete('/api/pdf', {
                params: {
                    client_id: clientId,
                    doc_id: docId,
                },
            })

            setDocs((d) => d.filter((doc) => doc.id !== docId))
            alert('Document context deleted')
        } catch (e) {
            alert('Failed to delete document context')
        } finally {
            setDeletingDocId(null)
        }
    }

    async function clearContext() {
        if (!confirm('Clear all uploaded document context for this client?')) {
            return
        }

        setClearingContext(true)

        try {
            await axios.delete(`/api/context/clear/${clientId}`)
            setDocs([])
            setMessages([])
            alert('Context cleared successfully')
        } catch (e) {
            alert('Failed to clear context')
        } finally {
            setClearingContext(false)
        }
    }

    return (
        <div className="h-screen flex bg-[#0B0F19]">
            {/* Sidebar */}
            <aside className="hidden md:flex w-[320px] border-r border-white/10 bg-[#111827] flex-col">
                <div className="p-5 border-b border-white/10">
                    <h1 className="text-2xl font-bold tracking-tight">
                        GenAI Assistant
                    </h1>

                    <p className="text-sm text-gray-400 mt-1">
                        AI powered document chat
                    </p>
                </div>

                <div className="p-5 border-b border-white/10">
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="font-semibold">Upload PDF</h2>

                            {uploading && (
                                <span className="text-xs text-blue-400 animate-pulse">
                                    Uploading...
                                </span>
                            )}
                        </div>

                        <input
                            ref={fileRef}
                            type="file"
                            accept="application/pdf"
                            className="w-full text-sm text-gray-300
              file:mr-4
              file:px-4
              file:py-2
              file:border-0
              file:rounded-xl
              file:bg-blue-600
              file:text-white
              file:cursor-pointer
              file:hover:bg-blue-700"
                        />

                        <button
                            onClick={uploadFile}
                            disabled={uploading}
                            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 transition-all duration-200 rounded-xl py-3 font-medium disabled:opacity-50"
                        >
                            Upload Document
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-5">
                    <div className="flex items-center justify-between mb-4 gap-3">
                        <div>
                            <h2 className="font-semibold">Knowledge Base</h2>
                            <p className="text-xs text-gray-400">
                                Stored PDF context for this client
                            </p>
                        </div>

                        <button
                            onClick={clearContext}
                            disabled={clearingContext}
                            className="text-xs rounded-full border border-white/10 bg-white/5 px-3 py-1 transition hover:bg-white/10 disabled:opacity-50"
                        >
                            {clearingContext ? 'Clearing...' : 'Clear context'}
                        </button>
                    </div>

                    <div className="space-y-3">
                        {docs.length === 0 && (
                            <div className="text-sm text-gray-400 bg-white/5 rounded-xl p-4 border border-white/5">
                                No documents uploaded yet
                            </div>
                        )}

                        {docs.map((d) => (
                            <div
                                key={d.id}
                                className="bg-white/5 border border-white/10 rounded-2xl p-4"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="font-medium truncate">
                                            {d.id}
                                        </p>

                                        <p className="text-sm text-gray-400 mt-1">
                                            {d.chunks} chunks indexed
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-400 rounded-full mt-2" />
                                        <button
                                            onClick={() => deletePdf(d.id)}
                                            disabled={deletingDocId === d.id}
                                            className="text-xs rounded-full border border-white/10 bg-white/5 px-3 py-1 transition hover:bg-white/10 disabled:opacity-50"
                                        >
                                            {deletingDocId === d.id ? 'Deleting...' : 'Delete'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Main Chat */}
            <main className="flex-1 flex flex-col h-screen">
                {/* Header */}
                <div className="h-16 border-b border-white/10 bg-[#111827]/70 backdrop-blur-xl flex items-center justify-between px-6">
                    <div>
                        <h2 className="font-semibold text-lg">
                            AI Chat
                        </h2>

                        <p className="text-sm text-gray-400">
                            Ask questions about your uploaded documents
                        </p>
                    </div>

                    <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 px-3 py-1.5 rounded-full text-sm">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        Online
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-auto px-4 py-6 md:px-10">
                    <div className="max-w-4xl mx-auto space-y-6">
                        {messages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-center py-20">
                                <div className="w-20 h-20 rounded-3xl bg-blue-600/20 flex items-center justify-center text-3xl mb-6">
                                    ✨
                                </div>

                                <h2 className="text-3xl font-bold mb-3">
                                    Welcome to GenAI Chat
                                </h2>

                                <p className="text-gray-400 max-w-lg">
                                    Upload PDFs and start chatting with your documents using AI.
                                </p>
                            </div>
                        )}

                        {messages.map((m, i) => (
                            <div
                                key={i}
                                className={`flex ${m.role === 'user'
                                    ? 'justify-end'
                                    : 'justify-start'
                                    }`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-3xl px-5 py-4 whitespace-pre-wrap shadow-lg ${m.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-br-md'
                                        : 'bg-white/5 border border-white/10 text-gray-100 rounded-bl-md'
                                        }`}
                                >
                                    <div className="text-xs mb-2 opacity-70 font-medium">
                                        {m.role === 'user' ? 'You' : 'AI Assistant'}
                                    </div>

                                    <div className="leading-7 text-[15px] overflow-hidden">
                                        {m.role === 'assistant' ? (
                                            <MarkdownRenderer content={m.content} />
                                        ) : (
                                            <p>{m.content}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white/5 border border-white/10 rounded-3xl rounded-bl-md px-5 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
                                        <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-100" />
                                        <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-200" />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input */}
                <div className="border-t border-white/10 bg-[#111827] p-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white/5 border border-white/10 rounded-3xl px-4 py-3 focus-within:border-blue-500 transition-all">
                            <div className="relative max-h-[320px]">
                                <textarea
                                    rows={1}
                                    value={input}
                                    onChange={(e) => {
                                        setInput(e.target.value)

                                        e.target.style.height = 'auto'
                                        e.target.style.height = `${Math.min(e.target.scrollHeight, 300)}px`
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault()
                                            send()
                                        }
                                    }}
                                    placeholder="Message GenAI Assistant..."
                                    className="w-full bg-transparent outline-none resize-none text-white placeholder:text-gray-500 overflow-y-auto pr-28 pb-14 max-h-[300px]"
                                />

                                <button
                                    onClick={send}
                                    disabled={loading}
                                    className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-all px-5 py-3 rounded-2xl font-medium"
                                >
                                    {loading ? '...' : 'Send'}
                                </button>
                            </div>
                        </div>

                        <p className="text-xs text-gray-500 mt-3 text-center">
                            AI can make mistakes. Verify important information.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    )
}