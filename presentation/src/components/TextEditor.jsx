import React, { useCallback, useEffect, useState, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["bold", "italic", "underline"],
  [{ color: [] }, { background: [] }],
  [{ script: "sub" }, { script: "super" }],
  [{ align: [] }],
  ["image", "blockquote", "code-block"],
  ["clean"],
];

export default function TextEditor() {
  const socketClient = useRef(null);
  const [quill, setQuill] = useState();

  useEffect(() => {
    socketClient.current = new WebSocket("ws://localhost:5193/wsa");

    socketClient.current.onmessage = (msg) =>
      console.log("Received ", msg.data);

    return () => {
      socketClient.current.close();
    };
  }, [socketClient]);

  useEffect(() => {
    const handler = (delta, oldDelta, source) => {
      if (source !== "user") return;
      console.log("Sending ", delta);
      socketClient.current.send(JSON.stringify(delta));
    };

    if (quill != null) {
      quill.on("text-change", handler);
    }

    return () => {
      if (quill != null) {
        quill.off("text-change", handler);
      }
    };
  }, [socketClient, quill]);

  const wrapperRef = useCallback((wrapper) => {
    if (wrapper == null) return;

    const w = wrapper;
    w.innerHTML = "";

    const editor = document.createElement("div");
    w.append(editor);
    const q = new Quill(editor, {
      theme: "snow",
      modules: { toolbar: TOOLBAR_OPTIONS },
    });

    setQuill(q);
  }, []);

  return <div className="text-editor-container" ref={wrapperRef} />;
}
