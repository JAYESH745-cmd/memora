import React, { useEffect, useState, } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FileText,
  Trash2,
  Plus,
  Upload,
  Clock,
  X,
} from "lucide-react";

import documentService from "../services/documentService.js";
import Spinner from "../components/common/Spinner.jsx";
import Button from "../components/common/Button.jsx";

const DocumentListPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate=useNavigate();

  // Upload modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploading, setUploading] = useState(false);

  // Delete modal
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
      setDocuments((prev) =>
        prev.filter((d) => d._id !== selectedDoc._id)
      );
      setIsDeleteModalOpen(false);
      setSelectedDoc(null);
    } catch (err) {
      toast.error(err.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="min-h-screen relative bg-slate-50">
      {/* subtle dotted background */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="relative max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-medium text-slate-900 mb-2">
              My Documents
            </h1>
            <p className="text-slate-500 text-sm">
              Manage and organize your learning materials
            </p>
          </div>

          <Button onClick={() => setIsUploadModalOpen(true)}>
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Upload Document
          </Button>
        </div>

        {/* Documents Grid */}
        {documents.length === 0 ? (
          <p className="text-slate-500 text-sm">
            No documents uploaded yet.
          </p>
        ) : (
          <div className="grid grid-cols-1  sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => (
              <div
                key={doc._id}
                className="bg-white rounded-xl cursor-pointer transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-lg border border-slate-200 p-5 shadow-sm hover:shadow-md transition"
                onClick={()=>{
                  navigate(`/documents/${doc._id}`)
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <FileText className="text-emerald-600 w-5 h-5" />
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteRequest(doc);
                    }}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="mt-4 font-medium text-slate-900">
                  {doc.title}
                </h3>

                <p className="text-xs text-slate-500 mt-1">
                  {((doc.fileSize ?? 0) / 1024).toFixed(1)} KB
                </p>

                <div className="flex items-center gap-2 mt-4 text-xs">
                  <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-600">
                    {doc.flashcardsCount || 0} Flashcards
                  </span>
                  <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-600">
                    {doc.quizzesCount || 0} Quizzes
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400 mt-4">
                  <Clock className="w-4 h-4" />
                  Uploaded {doc.createdAt
                    ? new Date(doc.createdAt).toLocaleDateString()
                    : "recently"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 relative">
            <button
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X />
            </button>

            <h2 className="text-lg font-semibold text-slate-900">
              Upload New Document
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Add a PDF document to your library
            </p>

            <form onSubmit={handleUpload} className="space-y-5">
              <div>
                <label className="text-xs font-medium text-slate-600">
                  DOCUMENT TITLE
                </label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="e.g. React Interview Prep"
                />
              </div>

              <label className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-emerald-400">
                <Upload className="w-8 h-8 text-emerald-500 mb-2" />
                <p className="text-sm text-slate-600">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-slate-400">
                  PDF up to 10MB
                </p>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="text-sm text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>

                <Button type="submit" disabled={uploading}>
                  {uploading ? "Uploading..." : "Upload"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="font-semibold text-slate-900 mb-2">
              Delete Document
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-medium">
                {selectedDoc?.title}
              </span>
              ?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-sm text-slate-500"
              >
                Cancel
              </button>
              <Button
                onClick={handleConfirmDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
{isDeleteModalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    {/* Backdrop */}
    <div
      className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      onClick={() => setIsDeleteModalOpen(false)}
    />

    {/* Modal */}
    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
      {/* Close button */}
      <button
        onClick={() => setIsDeleteModalOpen(false)}
        className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
      >
        ✕
      </button>

      {/* Icon */}
      <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center mb-4">
        <span className="text-red-500 text-xl">🗑</span>
      </div>

      {/* Title */}
      <h2 className="text-lg font-semibold text-slate-900 mb-2">
        Confirm Deletion
      </h2>

      {/* Message */}
      <p className="text-sm text-slate-600 mb-6">
        Are you sure you want to delete the document{" "}
        <span className="font-semibold text-slate-900">
          {selectedDoc?.title}
        </span>
        ? This action cannot be undone.
      </p>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => setIsDeleteModalOpen(false)}
          disabled={deleting}
        >
          Cancel
        </Button>

        <Button
          variant="danger"
          onClick={handleConfirmDelete}
          disabled={deleting}
          className="bg-blue-500 hover:bg-red-600 text-white shadow-red-500/30"
        >
          {deleting ? "Deleting..." : "Delete"}
        </Button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default DocumentListPage;
