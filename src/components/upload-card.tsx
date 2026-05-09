"use client";

import { useEffect, useState } from "react";

type DocumentItem = {
  _id: string;
  filename: string;
  pages: number;
};

export function UploadCard({
  onSelect,
  selectedDocumentId,
}: {
  onSelect: (id: string, name: string) => void;
  selectedDocumentId?: string;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadDocs() {
    const res = await fetch("/api/documents");
    const data = await res.json();
    return data.documents || [];
  }

  useEffect(() => {
    let active = true;

    void (async () => {
      const documents = await loadDocs();

      if (active) {
        setDocs(documents);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  async function uploadFile() {
    if (!file) return;

    setLoading(true);

    const form = new FormData();
    form.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: form,
    });

    const data = await res.json();

    setLoading(false);
    setFile(null);

    const documents = await loadDocs();
    setDocs(documents);

    if (data.documentId) {
      onSelect(data.documentId, data.filename);
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <h2 className="mb-4 text-xl font-semibold">
        Upload PDF
      </h2>

      <input
        type="file"
        accept=".pdf"
        onChange={(e) =>
          setFile(e.target.files?.[0] || null)
        }
        className="mb-4 block w-full"
      />

      <button
        onClick={uploadFile}
        disabled={loading || !file}
        className="mb-6 rounded-xl bg-indigo-600 px-4 py-3 font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>

      <div className="space-y-2">
        {docs.map((doc) => (
          <button
            key={doc._id}
            onClick={() =>
              onSelect(doc._id, doc.filename)
            }
            className={`block w-full rounded-xl border p-3 text-left transition ${
              selectedDocumentId === doc._id
                ? "border-indigo-500 bg-indigo-500/10"
                : "border-zinc-800 bg-zinc-950 hover:border-indigo-500"
            }`}
          >
            <div className="font-medium">
              {doc.filename}
            </div>
            <div className="text-sm text-zinc-400">
              {doc.pages} page(s)
            </div>
            {selectedDocumentId === doc._id ? (
              <p className="mt-2 text-xs font-medium text-indigo-300">
                Active for chat
              </p>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
}
