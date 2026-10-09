"""knowledge/pack 을 학회원 배포용 public/prd-maker-pack.zip 으로 묶는다.

최상위 폴더 없이 파일만 넣는다. 그래야 Mac(두 번 클릭)과 Windows(압축 풀기)
둘 다 다운로드/prd-maker-pack/ 한 겹으로 풀린다.
usage: python3 -I scripts/build-pack.py  (프로젝트 루트에서)
"""
import zipfile
from pathlib import Path

root = Path(__file__).resolve().parent.parent
src = root / "knowledge" / "pack"
out = root / "public" / "prd-maker-pack.zip"

files = sorted(p for p in src.rglob("*") if p.is_file() and p.name != ".DS_Store")
with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
    for p in files:
        z.write(p, p.relative_to(src).as_posix())
print(out.relative_to(root), len(files), "files", out.stat().st_size, "bytes")
