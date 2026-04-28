import React, { useRef, useState } from 'react';

export default function FileUploader({ onFilesAdded }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const forwardFiles = (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    onFilesAdded(files);
  };

  return (
    <div
      className={`drop-zone ${isDragging ? "dragging" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        forwardFiles(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".pdf,.csv,.json,.txt,.text"
        onChange={(e) => forwardFiles(e.target.files)}
        onClick={(e) => {
          e.currentTarget.value = "";
        }}
      />
      <div className="drop-zone-copy">
        <p>Drag and drop files here</p>
        <span>PDF, CSV, JSON, and text files supported</span>
        <button
          type="button"
          className="secondary-btn drop-zone-btn"
          onClick={(e) => {
            e.stopPropagation();
            inputRef.current?.click();
          }}
        >
          Browse files
        </button>
      </div>
    </div>
  );
}
