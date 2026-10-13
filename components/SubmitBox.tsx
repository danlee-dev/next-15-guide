"use client";

import { useState } from "react";
import type { Session } from "@/lib/sessions";
import { boardPayload, postBoard } from "./board";
import { useToast } from "./ui";
import { linksOf, repoOf, withLinks, type Patch, type Store } from "./store";

// 회고 단계의 제출 칸. 무엇을 받는지(레포, 배포 주소나 PRD 링크, 한두 줄 설명)는 세션마다 lib/sessions.ts 에서 정한다.
// 제출 버튼을 누를 때만 현황판의 링크가 바뀐다 (자동 저장은 링크를 건드리지 않는다)
export default function SubmitBox({ s, patch, go, ses }: { s: Store; patch: Patch; go: (id: string) => void; ses: Session }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const cfg = ses.submit;
  const links = linksOf(s, ses.id);
  const repo = repoOf(s, ses.id, cfg.repoAnswer);
  const submittedAt = links.submittedAt ?? (ses.id === "s8" ? s.submittedAt : null);

  // 처음 고칠 때 지금 보이는 레포 주소를 저장해 두고, 레포 칸을 고쳤다는 표시를 남긴다
  const setLink = (k: "repo" | "deploy" | "feature", v: string) =>
    patch((st) => {
      const l = linksOf(st, ses.id);
      return withLinks(st, ses.id, { ...l, repo: repoOf(st, ses.id, cfg.repoAnswer), repoEdited: l.repoEdited || k === "repo", [k]: v });
    });

  const submit = async () => {
    if (cfg.repo.required && !repo.trim()) {
      setErr("GitHub 레포 주소를 적어 주세요");
      return;
    }
    if (repo.trim() && !/github\.com\/[^/\s]+\/[^/\s]+/i.test(repo)) {
      setErr("https://github.com/아이디/프로젝트 처럼 레포 주소 전체를 붙여 주세요");
      return;
    }
    if (cfg.note.required && !(links.feature || "").trim()) {
      setErr(`${cfg.note.label.replace(/\s*\(.*\)$/, "")}을 적어 주세요`);
      return;
    }
    if (!repo.trim() && !links.deploy.trim() && !(links.feature || "").trim()) {
      setErr("하나 이상 적어 주세요");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      await postBoard(JSON.stringify(boardPayload(s, true, ses)));
      const now = Date.now();
      patch((st) => ({ ...withLinks(st, ses.id, { ...linksOf(st, ses.id), submittedAt: now }), submittedAt: ses.id === "s8" ? now : st.submittedAt }));
      toast("제출했어요. 현황판에 떴어요");
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="submit">
      <div className="q">
        <label htmlFor={`sub-repo-${ses.id}`}>{cfg.repo.label}</label>
        <div className="hint">{cfg.repo.hint}</div>
        <input id={`sub-repo-${ses.id}`} className="field mono" value={repo} onChange={(e) => setLink("repo", e.target.value)} placeholder={cfg.repo.placeholder} autoComplete="off" />
      </div>
      <div className="q">
        <label htmlFor={`sub-note-${ses.id}`}>{cfg.note.label}</label>
        <div className="hint">{cfg.note.hint}</div>
        <textarea
          id={`sub-note-${ses.id}`}
          className="field"
          rows={3}
          maxLength={400}
          value={links.feature || ""}
          onChange={(e) => setLink("feature", e.target.value)}
          placeholder={cfg.note.placeholder}
        />
        <div className="feat-ex">
          <span>이런 식으로 적어요</span>
          <ul>
            {cfg.note.examples.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="q">
        <label htmlFor={`sub-link-${ses.id}`}>{cfg.link.label}</label>
        <div className="hint">{cfg.link.hint}</div>
        <input id={`sub-link-${ses.id}`} className="field mono" value={links.deploy} onChange={(e) => setLink("deploy", e.target.value)} placeholder={cfg.link.placeholder} autoComplete="off" />
      </div>
      {err && <p className="submit-err">{err}</p>}
      <div className="submit-row">
        <button type="button" className="btn btn-ink" disabled={busy} onClick={submit}>
          {busy ? "올리는 중..." : submittedAt ? "다시 제출하기" : "제출하기"}
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => go(ses.boardPage)}>
          현황 보기
        </button>
      </div>
    </div>
  );
}
