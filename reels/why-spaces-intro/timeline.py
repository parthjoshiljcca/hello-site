import json
L=json.load(open('lines.json'))
gap={1:0.15,2:0.3,3:0.15,4:0.15,5:0.15,6:0.3,7:0.25,8:0.35,9:0.1,10:0.45,11:1.8}
t=0.25
for l in L:
    l["start"]=round(t,3); t+=l["dur"]+gap[l["id"]]
json.dump({"lines":L,"total":round(t,2)},open('timeline.json','w'),ensure_ascii=False,indent=1)
print("total",round(t,2)); [print(l["id"],l["start"],l["dur"]) for l in L]
