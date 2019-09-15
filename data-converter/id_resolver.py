import os
path="./mtaac_gold_corpus/morph/to_dict_refined/output/"
os.chdir(path)
files=os.listdir(".")
# write="./to_dict_refined/"
for i in files:
	print(i)
	count=1
	data=""
	with open(i) as f:		
		do_opt=False
		for line in f:
			if(line.strip()=="#ID	FORM	LEMMA	UPOSTAG	XPOSTAG	FEATS	HEAD	DEPREL	DEPS	MISC"):
				line="#ID	CDLI_ID	FORM	LEMMA	UPOSTAG	XPOSTAG	FEATS	HEAD	DEPREL	DEPS	MISC"
				do_opt=True
			elif(do_opt):
				line=line.strip()
				ann=line.split("\t")
				# ann.append("0")
				if(len(line.strip())>0):
					ann=[str(count)]+ann
					count+=1
					ann=[i.strip() for i in ann]
					line="\t".join(ann)
			if(len(line.strip())>0):
				data+=line.strip()+"\n"
	with open(i,"w") as f:
		f.write(data)