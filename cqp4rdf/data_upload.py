import os
import sys
import requests
import oyaml

config_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'config.yaml')
with open(config_path, encoding='utf-8') as inp_file:
    config = oyaml.safe_load(inp_file)

# the URL of the github repo where data is stored
github_repo = config['corpora'][config['default']]['data']
# the graph name
corpus_iri = config['corpora'][config['default']]['iri']
# the URL of the Fuseki Server
sparql_host = config['sparql']['host']
# the path to store data 
db_name = config['sparql']['store']

# cloning the github repo and shifting to the directory
os.system("git clone {}".format(github_repo))
os.chdir("rdf_converted_data")

# headers to be sent along with the request to upload data
headers = {'Content-Type': 'text/turtle;charset=utf-8'}

# iterate over all the file except the hidden files and upload them
for i in os.listdir():
	if(not i.startswith(".")):
		data=open(i).read()
		requests.post("{}?graph={}".format(sparql_host+db_name,corpus_iri),data=data.encode("utf-8"), headers=headers)

# shift out of the directory and delete the directory
os.chdir("..")
os.system("rm -rf rdf_converted_data")


