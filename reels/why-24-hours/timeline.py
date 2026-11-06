import json
L=json.load(open('lines.json'));t=0.2
PAUSE={3:0.4,4:1.15,10:0.85,15:0.7,20:0.6,25:0.6}
for i,l in enumerate(L):
    l["start"]=round(t,3);l["pause"]=PAUSE.get(l["id"],0);t+=l["pause"];nxt=L[i+1]["scene"] if i+1<len(L) else None
    t+=l["dur"]+(1.8 if nxt is None else .45 if nxt=='end' and l['scene']!='end' else .2 if nxt!=l["scene"] else .08)
json.dump({"lines":L,"total":round(t,2)},open('timeline.json','w'),ensure_ascii=False,indent=1);print("total",round(t,2))
