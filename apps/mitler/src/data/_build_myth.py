#!/usr/bin/env python3
"""Builder for myths_<lang>.json files."""
import json, sys, os
HERE = os.path.dirname(os.path.abspath(__file__))
ORDER = ['id','name','emoji','culture','era','element','category','summary',
         'depthMeaning','jungian','dreamMeaning','wakingMeaning','lesson','rarity']
PRESERVE = ['id','emoji','element','rarity']
TRANSLATE = ['name','culture','era','category','summary','depthMeaning','jungian',
             'dreamMeaning','wakingMeaning','lesson']

def build(lang):
    en = json.load(open(os.path.join(HERE,'myths_en.json'),encoding='utf-8'))
    tbl = json.load(open(os.path.join(HERE,f'_myth_{lang}.json'),encoding='utf-8'))
    out=[]; missing=[]
    for e in en:
        i=e['id']; t=tbl.get(i)
        if t is None: missing.append(i); continue
        item={}
        for k in ORDER:
            if k in PRESERVE: item[k]=e[k]
            else:
                if k not in t: raise SystemExit(f'{i}: missing field {k}')
                item[k]=t[k]
        out.append(item)
    if missing: raise SystemExit(f'MISSING ids ({len(missing)}): {missing}')
    if len(out)!=len(en): raise SystemExit('count mismatch')
    path=os.path.join(HERE,f'myths_{lang}.json')
    with open(path,'w',encoding='utf-8') as f:
        json.dump(out,f,ensure_ascii=False,indent=2); f.write('\n')
    print(f'WROTE {path} ({len(out)} items)')

if __name__=='__main__': build(sys.argv[1])
