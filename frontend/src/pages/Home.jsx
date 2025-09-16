import React, { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import axios from "axios";
import { toast } from "react-toastify";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark as codeTheme } from "react-syntax-highlighter/dist/esm/styles/prism";
import "react-toastify/dist/ReactToastify.css";
import "../index.css"; // Tailwind CSS import

const Home = () => {
  const [code, setCode] = useState("");
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!code.trim()) {
      return alert("Please write some code to review.");
    }

    try {
      setLoading(true);
      const { data } = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/get-service`,
        { code },
        { withCredentials: true }
      );

      toast.success(data.message || "✅ Code reviewed successfully!");
      setReview(
        typeof data === "object" ? JSON.stringify(data, null, 2) : data
      );
      setCode("");
    } catch (error) {
      toast.error("❌ Failed to review code");
    } finally {
      setLoading(false);
    }
  };

  // Copy full review (text + code)
  const handleCopyAll = () => {
    if (!review) return toast.error("⚠️ Nothing to copy");
    navigator.clipboard.writeText(review);
    toast.success("📋 Full review copied!");
  };

  // Copy only code snippets
  const handleCopyCode = () => {
    if (!review) return toast.error("⚠️ Nothing to copy");

    const codeBlocks = [...review.matchAll(/```(?:\w+)?\n([\s\S]*?)```/g)].map(
      (m) => m[1].trim()
    );

    if (codeBlocks.length === 0) {
      return toast.error("⚠️ No code found in review!");
    }

    const finalCode = codeBlocks.join("\n\n"); // अगर multiple snippets हैं तो join कर देगा

    navigator.clipboard.writeText(finalCode);
    toast.success("📋 Code snippets copied!");
  };


  return (
    <div className="main w-full h-[100vh] flex flex-col md:flex-row overflow-y-hidden font-sans bg-black">
      {/* Left Section */}
      <form
        onSubmit={submitHandler}
        className="left relative w-full md:w-1/2 h-[30vh] md:h-[100vh] text-white flex flex-col gap-4 p-4 bg-[#121111] rounded-lg shadow-lg "
      >
        <h2 className="text-lg font-semibold mb-2">✍️ Write Your Code</h2>
        <div className="user-code w-full h-[70vh] md:h-[85vh] rounded overflow-y-scroll scrollbar-hide border border-gray-700">
          
          <CodeMirror
            value={code}
            height="100%"
            extensions={[javascript({ jsx: true })]}
            theme={oneDark}
            onChange={(value) => setCode(value)}
            className="text-sm"
            placeholder="Write your code here..."
          />
        </div>

        {/* Review Button */}
        <div className="review-button">
          <button
            type="submit"
            disabled={loading}
            className="absolute bottom-3 right-5 px-5 py-2 bg-emerald-700 rounded-lg hover:bg-emerald-600 disabled:bg-gray-600 shadow-md transition"
          >
            {loading ? "⏳ Reviewing..." : "🔍 Review Code"}
          </button>
        </div>
      </form>

      {/* Right Section */}
      <div className="right w-full md:w-1/2 bg-[#1f1f1f] p-4 overflow-y-scroll rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4 gap-2">
          <h1 className="text-white font-bold text-2xl">🤖 AI Review</h1>
          <div className="flex gap-2">
            <button
              onClick={handleCopyAll}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm shadow-md"
            >
              📋 Copy All
            </button>
            <button
              onClick={handleCopyCode}
              className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm shadow-md"
            >
              📋 Copy Code
            </button>
          </div>
        </div>

        {/* Markdown rendering with syntax highlighting */}
        <div className="text-sm bg-[#899f85] p-3 rounded-lg border border-gray-700 shadow-inner prose prose-invert max-w-none">
          {review ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={codeTheme}
                      language={match[1]}
                      PreTag="div"
                      className="rounded-md my-2"
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  ) : (
                    <code className="bg-gray-100 px-1 py-0.5 rounded text-black">
                      {children}
                    </code>
                  );
                },
              }}
            >
              {review}
            </ReactMarkdown>
          ) : (
            <div>
              <p className="text-gray-100">⚠️ No review yet. Submit code to get AI feedback.</p>
            </div>
            
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
