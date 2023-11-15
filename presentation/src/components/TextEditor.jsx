import React, { useCallback, useEffect, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import axios from "axios";

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

const baseURL = "http://localhost:5220/api/v1";

export default function TextEditor() {
  const [quill, setQuill] = useState();

  useEffect(() => {
    const handler = (delta, oldDelta, source) => {
      if (source !== "user") return;
      console.log("Sending ", JSON.stringify(delta));
      axios
        .post(`${baseURL}/Producer`, JSON.stringify(delta), {
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((response) => console.log(response.status))
        .catch((error) => console.error(error));
    };

    if (quill != null) {
      quill.on("text-change", handler);
    }

    return () => {
      if (quill != null) {
        quill.off("text-change", handler);
      }
    };
  }, [quill]);

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
