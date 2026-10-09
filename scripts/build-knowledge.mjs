// knowledge/ 아래 발표 자료(slides.md)와 학회원 문서팩(pack/)을 튜터 프롬프트용 TS 모듈로 묶는다.
// 슬라이드나 문서팩을 고친 뒤 `npm run knowledge` 로 lib/knowledge.ts 를 다시 만든다.
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const packDir = join(root, "knowledge/pack");

function walk(dir) {
  return readdirSync(dir)
    .sort()
    .flatMap((name) => {
      const p = join(dir, name);
      if (name.startsWith(".")) return [];
      return statSync(p).isDirectory() ? walk(p) : [p];
    });
}

// 학회원 프로젝트에서 보이는 경로로 적는다 (AGENTS.append.md 는 AGENTS.md 맨 아래에 붙는다)
const packFiles = walk(packDir).map((p) => {
  const rel = relative(packDir, p);
  const shown = rel === "AGENTS.append.md" ? "AGENTS.md (맨 아래에 붙는 부분)" : rel;
  return `<file path="${shown}">\n${readFileSync(p, "utf8").trim()}\n</file>`;
});

const slides = readFileSync(join(root, "knowledge/slides.md"), "utf8").trim();

const out = `// 생성 파일. 직접 고치지 말고 knowledge/ 를 고친 뒤 \`npm run knowledge\`.
export const SLIDES = ${JSON.stringify(slides)};

export const PACK = ${JSON.stringify(packFiles.join("\n\n"))};
`;

writeFileSync(join(root, "lib/knowledge.ts"), out);
console.log(`lib/knowledge.ts: slides ${slides.length}자, pack ${packFiles.length}개 파일`);
