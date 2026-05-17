import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

export default function MarkdownRenderer({
    content,
}: {
    content: string
}) {
    return (
        <div className="prose prose-invert prose-pre:bg-[#0D1117] prose-pre:border prose-pre:border-white/10 max-w-none prose-p:text-gray-200 prose-headings:text-white prose-strong:text-white prose-code:text-blue-300 prose-li:text-gray-200">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                    code(props) {
                        const { children, className } = props
                        const match = /language-(\w+)/.exec(className || '')

                        return match ? (
                            <pre className="rounded-2xl overflow-auto p-4">
                                <code className={className}>
                                    {children}
                                </code>
                            </pre>
                        ) : (
                            <code className="bg-white/10 px-1.5 py-1 rounded text-sm">
                                {children}
                            </code>
                        )
                    },

                    h1: ({ children }) => (
                        <h1 className="text-3xl font-bold mt-6 mb-4">
                            {children}
                        </h1>
                    ),

                    h2: ({ children }) => (
                        <h2 className="text-2xl font-semibold mt-5 mb-3">
                            {children}
                        </h2>
                    ),

                    h3: ({ children }) => (
                        <h3 className="text-xl font-semibold mt-4 mb-2">
                            {children}
                        </h3>
                    ),

                    p: ({ children }) => (
                        <p className="leading-8 text-[15px] text-gray-200 mb-4">
                            {children}
                        </p>
                    ),

                    ul: ({ children }) => (
                        <ul className="list-disc pl-6 space-y-2 mb-4">
                            {children}
                        </ul>
                    ),

                    ol: ({ children }) => (
                        <ol className="list-decimal pl-6 space-y-2 mb-4">
                            {children}
                        </ol>
                    ),

                    blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-300 my-4">
                            {children}
                        </blockquote>
                    ),

                    table: ({ children }) => (
                        <div className="overflow-auto my-4">
                            <table className="w-full border border-white/10">
                                {children}
                            </table>
                        </div>
                    ),

                    th: ({ children }) => (
                        <th className="border border-white/10 bg-white/5 px-4 py-2 text-left">
                            {children}
                        </th>
                    ),

                    td: ({ children }) => (
                        <td className="border border-white/10 px-4 py-2">
                            {children}
                        </td>
                    ),

                    a: ({ href, children }) => (
                        <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 underline"
                        >
                            {children}
                        </a>
                    ),
                    strong: ({ children }) => (
                        <strong className="font-bold text-white">
                            {children}
                        </strong>
                    ),

                    em: ({ children }) => (
                        <em className="italic text-gray-100">
                            {children}
                        </em>
                    ),

                    del: ({ children }) => (
                        <del className="line-through opacity-70">
                            {children}
                        </del>
                    ),

                    u: ({ children }) => (
                        <u className="underline underline-offset-4">
                            {children}
                        </u>
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    )
}