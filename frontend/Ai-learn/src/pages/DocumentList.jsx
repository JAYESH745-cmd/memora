import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Clock,
  FileText,
  FileUp,
  Library,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import Button from "../components/common/Button.jsx";
import Spinner from "../components/common/Spinner.jsx";
import documentService from "../services/documentService.js";

const formatSize = (bytes = 0) => {
  if (!bytes) return "0 KB";
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(1)} KB`;
};

const DocumentListPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploading, setUploading] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchDocuments = async () => {
    try {
      const data = await documentService.getDocuments();
      setDocuments(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to fetch documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const filteredDocuments = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return documents;

    return documents.filter((doc) =>
      [doc.title, doc.fileName]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(search))
    );
  }, [documents, query]);

  const totals = useMemo(
    () => ({
      documents: documents.length,
      flashcards: documents.reduce(
        (sum, doc) => sum + (doc.flashcardCount ?? doc.flashcardsCount ?? 0),
        0
      ),
      quizzes: documents.reduce(
        (sum, doc) => sum + (doc.quizCount ?? doc.quizzesCount ?? 0),
        0
      ),
    }),
    [documents]
  );

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFile(file);
      setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!uploadFile || !uploadTitle) {
      toast.error("Please provide a title and select a file.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("title", uploadTitle);

    try {
      await documentService.uploadDocument(formData);
      toast.success("Document uploaded successfully!");
      setIsUploadModalOpen(false);
      setUploadFile(null);
      setUploadTitle("");
      setLoading(true);
      fetchDocuments();
    } catch (err) {
      toast.error(err.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteRequest = (doc) => {
    setSelectedDoc(doc);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDoc) return;

    setDeleting(true);
    try {
      await documentService.deleteDocument(selectedDoc._id);
      toast.success(`"${selectedDoc.title}" deleted`);
      setDocuments((prev) => prev.filter((doc) => doc._id !== selectedDoc._id));
      setIsDeleteModalOpen(false);
      setSelectedDoc(null);
    } catch (err) {
      toast.error(err.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[520px] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1fr_330px]">
          <div className="p-6 sm:p-8">
            <div className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              <Library size={14} />
              Document library
            </div>
            <h1 className="mt-5 text-3xl font-bold text-slate-950 sm:text-4xl">
              Turn PDFs into study fuel
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
              Upload source material, open any document, and build flashcards or quizzes from the same workspace.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(true)}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <Plus size={17} />
                Upload document
              </button>
              <button
                type="button"
                onClick={() => navigate("/flashcards")}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Review flashcards
                <ArrowRight size={17} />
              </button>
            </div>
          </div>

          <div className="border-t border-slate-200 bg-slate-950 p-6 text-white lg:border-l lg:border-t-0">
            <p className="text-sm font-medium text-slate-300">Library snapshot</p>
            <div className="mt-6 grid grid-cols-3 gap-3">
              <HeroMetric label="Docs" value={totals.documents} />
              <HeroMetric label="Cards" value={totals.flashcards} />
              <HeroMetric label="Quizzes" value={totals.quizzes} />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative max-w-xl flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search documents"
              className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
            />
          </div>
          <p className="text-sm font-medium text-slate-500">
            {filteredDocuments.length} of {documents.length} documents
          </p>
        </div>
      </section>

      {filteredDocuments.length === 0 ? (
        <EmptyDocuments onUpload={() => setIsUploadModalOpen(true)} hasQuery={!!query} />
      ) : (
        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredDocuments.map((doc) => (
            <DocumentCard
              key={doc._id}
              doc={doc}
              onOpen={() => navigate(`/documents/${doc._id}`)}
              onDelete={(e) => {
                e.stopPropagation();
                handleDeleteRequest(doc);
              }}
            />
          ))}
        </section>
      )}

      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close upload modal"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                <FileUp size={22} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-950">Upload document</h2>
                <p className="text-sm text-slate-500">Add a PDF to your learning library.</p>
              </div>
            </div>

            <form onSubmit={handleUpload} className="mt-6 space-y-5">
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Document title
                </label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-slate-400"
                  placeholder="e.g. React Interview Prep"
                />
              </div>

              <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center transition hover:border-emerald-400 hover:bg-emerald-50">
                <Upload className="mb-3 h-9 w-9 text-emerald-600" />
                <p className="text-sm font-semibold text-slate-700">
                  {uploadFile ? uploadFile.name : "Click to select a PDF"}
                </p>
                <p className="mt-1 text-xs text-slate-500">PDF up to 10MB</p>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsUploadModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading}>
                  {uploading ? "Uploading..." : "Upload PDF"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <Trash2 size={22} />
            </div>
            <h2 className="mt-4 text-lg font-bold text-slate-950">Delete document?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              This will delete <span className="font-semibold text-slate-950">{selectedDoc?.title}</span> from your library.
              This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button variant="danger" onClick={handleConfirmDelete} disabled={deleting}>
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const HeroMetric = ({ label, value }) => (
  <div className="rounded-lg bg-white/10 p-3">
    <p className="text-2xl font-bold">{value}</p>
    <p className="mt-1 text-xs font-medium text-slate-300">{label}</p>
  </div>
);

const DocumentCard = ({ doc, onOpen, onDelete }) => {
  const flashcardCount = doc.flashcardCount ?? doc.flashcardsCount ?? 0;
  const quizCount = doc.quizCount ?? doc.quizzesCount ?? 0;
  const status = doc.status || "ready";

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex min-h-64 flex-col rounded-lg border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100">
          <FileText size={23} />
        </div>
        <button
          type="button"
          onClick={onDelete}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
          aria-label={`Delete ${doc.title || "document"}`}
        >
          <Trash2 size={17} />
        </button>
      </div>

      <div className="mt-5 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold uppercase text-slate-600">
            {status}
          </span>
          <span className="text-xs font-medium text-slate-400">{formatSize(doc.fileSize)}</span>
        </div>
        <h3 className="mt-4 line-clamp-2 text-lg font-bold text-slate-950">
          {doc.title || doc.fileName || "Untitled document"}
        </h3>
        <p className="mt-2 line-clamp-1 text-sm text-slate-500">
          {doc.fileName || "PDF learning material"}
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <MiniStat icon={BookOpen} label="Cards" value={flashcardCount} />
        <MiniStat icon={BrainCircuit} label="Quizzes" value={quizCount} />
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-500">
          <Clock size={14} />
          {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : "Recently"}
        </span>
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700 transition group-hover:text-slate-950">
          Open
          <ArrowRight size={15} />
        </span>
      </div>
    </button>
  );
};

const MiniStat = ({ icon, label, value }) => (
  <div className="rounded-lg bg-slate-50 p-3">
    <div className="flex items-center gap-2 text-slate-500">
      {React.createElement(icon, { size: 15 })}
      <span className="text-xs font-medium">{label}</span>
    </div>
    <p className="mt-2 text-lg font-bold text-slate-950">{value}</p>
  </div>
);

const EmptyDocuments = ({ onUpload, hasQuery }) => (
  <section className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
      <FileText size={28} />
    </div>
    <h3 className="mt-4 text-lg font-bold text-slate-950">
      {hasQuery ? "No matching documents" : "Your library is ready"}
    </h3>
    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
      {hasQuery
        ? "Try a different search term to find the material you need."
        : "Upload your first PDF and Memora will turn it into a focused learning workspace."}
    </p>
    {!hasQuery && (
      <button
        type="button"
        onClick={onUpload}
        className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        <Plus size={17} />
        Upload document
      </button>
    )}
  </section>
);

export default DocumentListPage;
