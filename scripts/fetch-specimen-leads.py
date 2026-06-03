#!/usr/bin/env python3
"""Fetch + clean Wikipedia leads for the Game's type-specimen (specimenContent.ts).

For each term, pulls the lead via the action API (action=parse&section=0) and
cleans it: keeps links (inert <a class="lnk">, no href), <strong>, <em> and all
prose; drops footnotes, edit links, infobox cruft. Prints JSON keyed by term;
paste each `html` into the matching SPECIMENS entry (category assignment and
Tittle's accented-glyph trim are done by hand).

    python3 scripts/fetch-specimen-leads.py   # needs beautifulsoup4
"""
import json, re, time, urllib.parse, urllib.request
from bs4 import BeautifulSoup, NavigableString, Tag, Comment

UA = "TypefaceOff/1.0 (font specimen content; https://github.com/sitapix/typeface-off)"

# term (hero word) -> Wikipedia article title (slug). Keep in sync with SPECIMENS.
TERMS = [
    ("Typeface", "Typeface"),
    ("Kerning", "Kerning"),
    ("Roman type", "Roman_type"),
    ("Pilcrow", "Pilcrow"),
    ("Blackletter", "Blackletter"),
    ("Ampersand", "Ampersand"),
    ("Swash", "Swash_(typography)"),
    ("Tittle", "Tittle"),
]

# tags kept (mapped to our minimal output set); everything else is unwrapped
ALLOWED = {"a": "a", "b": "strong", "strong": "strong", "i": "em", "em": "em"}


def fetch_lead_html(title):
    url = "https://en.wikipedia.org/w/api.php?" + urllib.parse.urlencode({
        "action": "parse", "page": title, "prop": "text", "section": "0",
        "format": "json", "formatversion": "2", "redirects": "1",
    })
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req) as r:
        return json.load(r)["parse"]["text"]


def clean_node(node, out):
    if isinstance(node, Comment):
        return
    if isinstance(node, NavigableString):
        out.append(str(node))
        return
    if not isinstance(node, Tag):
        return
    cls = node.get("class") or []
    name = node.name
    if name == "style":
        return
    if name == "sup" and "reference" in cls:
        return
    if "mw-editsection" in cls or "noprint" in cls or "mw-ref" in cls:
        return
    if name in ALLOWED:
        inner = []
        for c in node.children:
            clean_node(c, inner)
        html = "".join(inner).strip()
        if not html:
            return
        if ALLOWED[name] == "a":
            out.append(f'<a class="lnk">{html}</a>')
        else:
            out.append(f"<{ALLOWED[name]}>{html}</{ALLOWED[name]}>")
    else:
        for c in node.children:
            clean_node(c, out)


def lead_paragraphs(html):
    soup = BeautifulSoup(html, "html.parser")
    root = soup.select_one(".mw-parser-output") or soup
    paras = []
    for p in root.find_all("p", recursive=True):
        if "mw-empty-elt" in (p.get("class") or []):
            continue
        out = []
        for c in p.children:
            clean_node(c, out)
        txt = re.sub(r"\s+", " ", "".join(out)).strip()
        txt = re.sub(r"\[\d+\]", "", txt)
        txt = re.sub(r"\s+([.,;:])", r"\1", txt)
        if len(re.sub(r"<[^>]+>", "", txt)) < 5:
            continue
        paras.append(txt)
        if len(re.sub(r"<[^>]+>", "", " ".join(paras))) >= 170 or len(paras) >= 2:
            break
    return "".join(f"<p>{p}</p>" for p in paras)


def main():
    result = {}
    for term, slug in TERMS:
        try:
            result[term] = {"source": slug, "html": lead_paragraphs(fetch_lead_html(slug))}
        except Exception as e:  # noqa: BLE001 - surface any fetch/parse failure inline
            result[term] = {"source": slug, "html": "", "error": str(e)}
        time.sleep(1.2)
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
