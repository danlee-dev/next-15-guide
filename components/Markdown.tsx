"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// 학회원이 올린 마크다운(PRD 등)을 읽기 좋게 그린다. 표·체크박스는 GFM.
// HTML 태그는 그리지 않는다(react-markdown 기본). 링크는 새 탭으로
export default function Markdown({ text }: { text: string }) {
  return (
    <div className="md">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ children }) => (
            <div className="md-tbl">
              <table>{children}</table>
            </div>
          ),
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
