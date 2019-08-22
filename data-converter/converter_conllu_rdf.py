import os
input_path="./mtaac_gold_corpus/morph/to_dict_refined/output/"
output_path="rdf_converted_data_2"

if(output_path not in os.listdir()):
	os.mkdir(output_path)

fully_annotated_data=os.listdir(input_path)
iri='https://github.com/cdli-gh/Multilayer-Annotation-Query-Tool/data/'
converter_command_1="./conll-rdf/run.sh CoNLLStreamExtractor "+iri
# converter_command_2="#  ID FORM LEMMA UPOSTAG XPOSTAG FEATS HEAD DEPREL DEPS MISC"
converter_command_2="# ID CDLI_ID FORM LEMMA UPOSTAG XPOSTAG FEATS HEAD DEPREL DEPS MISC"

# for i in fully_annotated_data:
for file in fully_annotated_data:
    name=file.split(".")[0]
    new_name=name+".ttl"
    print_command="cat "+os.path.join(input_path,file)
    output_file=os.path.join(output_path,new_name)
    command=print_command+" | "+converter_command_1 + file + converter_command_2 + " > "+ output_file
    # print(open(os.path.join(path,i,i,file)).read())
    print(command)
    os.system(command)
    print("--"*50)
print("__"*50)
