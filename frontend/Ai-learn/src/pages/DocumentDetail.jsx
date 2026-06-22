import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import documentService from "../services/documentService.js"
import Spinner from "../components/common/Spinner.jsx";
import toast from "react-hot-toast";
import { ArrowLeft, ExternalLink } from "lucide-react";
import ChatInterface from "../components/chat/ChatInterface.jsx";
import AIActions from "../components/ai/aiActions.jsx";
import FlashcardManager from "../components/flashcards/FlashcardManager.jsx";
import QuizManager from "../components/quizzes/QuizManager.jsx";
import { BASE_URL } from "../utils/apiPaths.js";

const DocumentDetailPage = () => {
  const { id } = useParams();

  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Content");

  useEffect(() => {
    const fetchDocumentDetails = async () => {
      try {
        const data = await documentService.getDocumentById(id);
        setDocument(data);
      } catch {
        toast.error("Failed to fetch document details");
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentDetails();
  }, [id]);

  // ---------- PDF URL ----------
  const getPdfUrl = () => {
    if (!document?.data?.filePath) return null;

    const filePath = document.data.filePath;
    if (filePath.startsWith("http")) return filePath;

    return `${BASE_URL}${filePath.startsWith("/") ? "" : "/"}${filePath}`;
  };

  // ---------- TAB CONTENT ----------
  const renderContent = () => {
    const pdfUrl = getPdfUrl();

    if (!pdfUrl) {
      return (
        <div className="text-slate-500 text-sm">
          PDF not available.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-medium text-slate-700">
            Document Viewer
          </span>

          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-emerald-600 text-sm hover:underline"
          >
            <ExternalLink size={16} />
            Open in new tab
          </a>
        </div>

        <iframe
          src={pdfUrl}
          title="PDF Viewer"
          className="w-full h-[75vh] rounded-lg border"
        />
      </div>
    );
  };

  const renderChat = () => (
    <div >
      <ChatInterface/>
    </div>
  );

  const renderAIActions = () => (
    <div>
      <AIActions/>
    </div>
  );

  const renderFlashcardsTab = () => (
    <div>
      <FlashcardManager documentId={id}/>
    </div>
  );

  const renderQuizzesTab = () => (
    <div >
      <QuizManager documentId={id} />
    </div>
  );

  const tabs = [
    { name: "Content", content: renderContent() },
    { name: "Chat", content: renderChat() },
    { name: "AI Actions", content: renderAIActions() },
    { name: "Flashcards", content: renderFlashcardsTab() },
    { name: "Quizzes", content: renderQuizzesTab() },
  ];

  if (loading) return <Spinner />;

  if (!document) {
    return (
      <div className="text-center text-slate-500">
        Document not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* ---------- Header ---------- */}
        <div className="mb-6">
          <Link
            to="/documents"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft size={16} />
            Back to Documents
          </Link>

          <h1 className="text-2xl font-semibold text-slate-900 mt-3">
            {document.data?.title}
          </h1>
        </div>

        {/* ---------- Tabs ---------- */}
        <div className="border-b border-slate-200 mb-6">
          <div className="flex gap-6">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`pb-3 text-sm font-medium transition ${
                  activeTab === tab.name
                    ? "border-b-2 border-emerald-500 text-emerald-600"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* ---------- Tab Content ---------- */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          {tabs.find((t) => t.name === activeTab)?.content}
        </div>
      </div>
    </div>
  );
};

export default DocumentDetailPage;
