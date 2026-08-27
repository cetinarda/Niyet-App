#!/usr/bin/env python3
"""Builder for archetypes_<lang>.json files.
Reads archetypes_en.json as template, applies a per-id translation table,
preserves id/emoji/element/rarity, writes same key order.
Usage: python3 _build_arch.py <lang>
Translation tables are stored in _arch_<lang>.json as {id: {field: value, ...}}.
"""
import json, sys, os

HERE = os.path.dirname(os.path.abspath(__file__))
ORDER = ['id','name','emoji','tradition','element','category','keywords',
         'essence','lightAspect','shadowAspect','dreamMeaning','wakingMeaning',
         'advice','affirmation','rarity']
PRESERVE = ['id','emoji','element','rarity']  # copied verbatim from EN
TRANSLATE = ['name','tradition','category','keywords','essence','lightAspect',
             'shadowAspect','dreamMeaning','wakingMeaning','advice','affirmation']

def build(lang):
    en = json.load(open(os.path.join(HERE,'archetypes_en.json'),encoding='utf-8'))
    tbl = json.load(open(os.path.join(HERE,f'_arch_{lang}.json'),encoding='utf-8'))
    out = []
    missing = []
    for e in en:
        i = e['id']
        t = tbl.get(i)
        if t is None:
            missing.append(i); continue
        item = {}
        for k in ORDER:
            if k in PRESERVE:
                item[k] = e[k]
            else:
                if k not in t:
                    raise SystemExit(f'{i}: missing field {k}')
                item[k] = t[k]
        # sanity: keywords must be list of same length
        if len(item['keywords']) != len(e['keywords']):
            raise SystemExit(f'{i}: keyword count mismatch {len(item["keywords"])} vs {len(e["keywords"])}')
        out.append(item)
    if missing:
        raise SystemExit(f'MISSING ids ({len(missing)}): {missing}')
    if len(out)!=len(en):
        raise SystemExit(f'count mismatch {len(out)} vs {len(en)}')
    path = os.path.join(HERE,f'archetypes_{lang}.json')
    with open(path,'w',encoding='utf-8') as f:
        json.dump(out,f,ensure_ascii=False,indent=2)
        f.write('\n')
    print(f'WROTE {path} ({len(out)} items)')

if __name__=='__main__':
    build(sys.argv[1])
