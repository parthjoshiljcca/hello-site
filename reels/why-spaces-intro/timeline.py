import json
L=json.load(open('lines.json'))
gap={1:0.7,2:0.9,3:0.45,4:0.45,5:0.45,6:0.9,7:0.8,8:1.0,9:0.25,10:0.9,11:2.6}
t=0.8
for l in L:
    l["start"]=round(t,3); t+=l["dur"]+gap[l["id"]]
json.dump({"lines":L,"total":round(t,2)},open('timeline.json','w'),ensure_ascii=False,indent=1)
print("total",round(t,2)); [print(l["id"],l["start"],l["dur"]) for l in L]
