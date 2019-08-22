import os

# STEP 1:- pull the github repo
os.system("git clone https://github.com/cdli-gh/mtaac_gold_corpus/")
os.chdir("mtaac_gold_corpus")
print("Pulling the repo complete")
print("=="*30)
# STEP 2:- check of any error files
ignored_files=[]
# the files which have the IDs of all the cases which we are accepting ...
# for eg:- r.2.3	sag-kesz2	sagkesz[state of goods]	N	_	_	_
accepted={
	"P100943.conll":["o.2.4"],
	"P121584.conll":["r.3.1","r.2.3"]
}
conll_files_path="./morph/to_dict/"
files=os.listdir(conll_files_path)
for i in files:
	print_data=False
	with open(conll_files_path+i) as f:
		line_count=0
		for line in f:
			line=line.strip()
			line_count+=1
			if(line_count>2):
				s1=line.split("\t")[:4]
				s2=line.split()[:4]
				if(s1==['']):
					s1=[]
				if(s1!=s2):
					
					# print(i,s2[0])
					
					if(i in accepted.keys() and s2[0] in accepted[i.strip()]):
						print("File {file_number}: {file_id} ... Case already accepted".format(file_number=i.strip(),file_id=s1[0]))
						continue
					if(print_data==False):
						ignored_files.append(i.strip())
						print(i)
						print_data=True
					print(line)
					print(s1,"\t",s2)
	if(print_data==True):
		print("----"*30)

if(len(ignored_files)>0):
	print("will be proceeding without these files:-")
	without_files=[i for i in ignored_files]
	for i in without_files:
		print(i)

print("=="*30)


# STEP 3:-fine tune the data
dirName="./morph/to_dict_refined/"
try:
    os.mkdir(dirName)
    print("Directory " , dirName ,  " Created ") 
except FileExistsError:
    print("Directory " , dirName ,  " already exists")
# os.chdir("./mtaac_gold_corpus/morph/")
files=os.listdir("./morph/to_dict/")
write="./morph/to_dict_refined/"
for i in files:
	if(i.strip() in ignored_files):
		continue
	# print("Refining "+i)
	f2=open(write+i,"w")
	with open("./morph/to_dict/"+i) as f:		
		do_opt=False
		for line in f:
			if(line.strip()=="# ID	FORM	SEGM	XPOSTAG	HEAD	DEPREL	MISC"):
				# line="# NUM_ID	ID	FORM	SEGM	XPOSTAG	HEAD	DEPREL	MISC"
				do_opt=True
			elif(do_opt):
				ann=line.split("\t")[:4]
				ann.append("0")
				# ann=[str(count)]+ann
				# count+=1
				ann=[i.strip() for i in ann]
				line="\t".join(ann)
			f2.write(line.strip()+"\n")
	f2.close()

print("All the files have been refined...")

# STEP 4:- cdonll->conllu data
# import 
# conllu add #ID add #HEAD default value
# conlu->rdf
# blank file checker
# report
# update the rdf data
