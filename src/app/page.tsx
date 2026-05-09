"use client";

import { useState } from "react";
import { Navbar } from "@/src/components/navbar";
import { UploadCard } from "@/src/components/upload-card";
import { ChatPanel } from "@/src/components/chat-panel";

export default function HomePage() {
  const [selectedDocumentId, setSelectedDocumentId] = useState("");
  const [selectedDocumentName, setSelectedDocumentName] = useState("");

  function handleSelectDocument(id: string, name: string) {
    setSelectedDocumentId(id);
    setSelectedDocumentName(name);
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-10">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            Chat With Your Documents
          </h1>

          <p className="mt-3 text-zinc-400">
            Upload PDFs, select any file, and ask AI smart questions instantly.
          </p>
        </div>

        {/* Main Layout */}
        <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
          {/* Left Sidebar */}
          <div>
            <UploadCard
              onSelect={handleSelectDocument}
              selectedDocumentId={selectedDocumentId}
            />
          </div>

          {/* Right Chat Area */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
            {selectedDocumentId ? (
              <>
                {/* Selected Document Header */}
                <div className="mb-6 border-b border-zinc-800 pb-4">
                  <p className="text-sm text-zinc-400">
                    Selected Document
                  </p>

                  <h2 className="mt-1 text-xl font-semibold text-white">
                    {selectedDocumentName}
                  </h2>
                </div>

                {/* Chat Panel */}
                <ChatPanel
                  key={selectedDocumentId}
                  documentId={selectedDocumentId}
                  documentName={selectedDocumentName}
                />
              </>
            ) : (
              <div className="flex h-full min-h-[500px] items-center justify-center rounded-2xl border border-dashed border-zinc-700 bg-zinc-950 text-center">
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    No Document Selected
                  </h3>

                  <p className="mt-2 text-zinc-400">
                    Upload a PDF or choose an existing file to start chatting.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
