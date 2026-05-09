"use client";

import { useEffect, useState } from "react";
import { FileText } from "lucide-react";

type Doc = {
  _id: string;
  filename: string;
  pages: number;
  createdAt: string;
};

export function DocumentList() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadDocs() {
    const res = await fetch("/api/documents");
    const data = await res.json();

    return data.success ? data.documents : [];
  }

  useEffect(() => {
    let active = true;

    void (async () => {
      const documents = await loadDocs();

      if (active) {
        setDocs(documents);
        setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-xl">
      <h2 className="mb-6 text-xl font-semibold text-white">
        Uploaded Documents
      </h2>

      {loading ? (
        <p className="text-zinc-400">Loading...</p>
      ) : docs.length === 0 ? (
        <p className="text-zinc-400">No documents uploaded yet.</p>
      ) : (
        <div className="space-y-4">
          {docs.map((doc) => (
            <div
              key={doc._id}
              className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 p-4"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-indigo-400" />
                <div>
                  <p className="font-medium text-white">{doc.filename}</p>
                  <p className="text-sm text-zinc-400">
                    {doc.pages} page(s)
                  </p>
                </div>
              </div>

              <p className="text-xs text-zinc-500">
                {new Date(doc.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
