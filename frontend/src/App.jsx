import { useState, useEffect } from "react";
import './App.css'
import "prismjs/themes/prism-tomorrow.css";
import prism from "prismjs";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { Editor } from "@monaco-editor/react";

function App() {
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState(
    `function sum() {
  return 1 + 1;
}`
  );
  const [review, setReview] = useState("");

  useEffect(() => {
    prism.highlightAll();
  }, []);

  async function reviewCode() {
    setLoading(true);
    setReview("");

    const response = await fetch("https://code-reviewer-k04l.onrender.com/ai/get-review", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      setReview((prev) => prev + chunk);
    }

    setLoading(false);
  }

  const DefaultValue = `\nfunction greet(name) {\n\tconsole.log("Hello, " + name + "!");\n}\n\ngreet("Alex");\n`;

  return (
    <main className="h-screen w-screen p-6 flex flex-col md:flex-row gap-4">
      <div className="h-full flex-2 bg-black relative overflow-auto rounded-xl">
        <div className="h-full w-full bg-gray-900 rounded-xl overflow-y-auto mt-3">
          <Editor
            options={{
              minimap: {
                enabled: false,
              },
            }}
            theme="vs-dark"
            defaultValue={DefaultValue}
            value={code}
            onChange={(code) => setCode(code)}
          />
        </div>
        <button
          disabled={loading}
          onClick={reviewCode}
          className={`absolute w-20 h-8 bottom-4 right-4  bg-white text-black px-4 flex items-center justify-center py-2 font-medium  rounded-md cursor-${loading ? 'not-allowed' : 'pointer'} hover:bg-indigo-400 hover:text-white transition text-md`}
        >
          {loading ? (
          <img src={"/stop-circle.png"} alt="loading" className="w-6 h-6" />
          ) : "Review"}
        </button>
      </div>

      <div className="h-full flex-2 bg-[#282a36] p-4 text-white overflow-auto rounded-xl">
        <Markdown className="markdown-output prose prose-invert max-w-none" rehypePlugins={[rehypeHighlight]}>
          {review}
        </Markdown>
      </div>
    </main>
  );
}

export default App;
