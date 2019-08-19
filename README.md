# CQP4RDF

CQP4RDF is a tool which can be used to easily query from a corpus which has multiple layers of annotations. For querying either the query can be written directly in form of `CQP` or the query can be generated from the Query Generator GUI which we have developed and is capable to generate complex `CQP` queries.   

## Motivation

In our experiments with SPARQL for corpora querying, we stumbled upon a problem: writing complex SPARQL queries is hard. Especially for people without enough expertise in the field. To make the process easier, it makes sense to use a widely-known corpus query language, use it and then translate queries to SPARQL queries which are then run against our data.

A good candidate for the query language is CQP — a language developed for the IMS Corpus Workbench.
It is used in corpus management systems like SketchEngine, NoSketchEngine, Corpus Tool and others.
Many linguists have experience with it, and even for those who have never worked with it, it is relatively easy to get started.

Here is an example, a query that looks for sentences that contain exactly two verbs: one with a lemma է (to be), and another one which is either a perfective converb or an imperfective converb:

```
(    v1:[conll:LEM='է' and rdfs:type='olia:Verb'] 
     v2:[a='eanc:ImperfectiveConverb' or rdfs:type='eanc:PerfectiveConverb']) 
     within 
         (<powla:sentence/> !containing v3:[rdfs:type='olia:Verb'])
) & v1.ID != v3.ID and v2.ID != v3.ID
```

Although it is a bit complicated, it is easier to write and to understand than its SPARQL counterpart with all the UNIONs and FILTERs.

Further, we have also have built a query builder, which is capable of generating complex `CQP` format queries. 

## Implementation

CQP grammar is parsed by the [Lark Python module](https://github.com/lark-parser/lark) which parses context-free grammars in [eBNF notation](https://en.wikipedia.org/wiki/Extended_Backus%E2%80%93Naur_form) into its abstract syntax tree. AST is then been transformed into SPARQL.

The details of the CQP dialect can be found in [the corresponding document](./docs/cqp_dialect.md).

Currently, there is a simple web interface for searching with CQP in EANC (or any other POWLA-annotated corpus) written in Python. Its description can be found in [the corresponding document](./docs/web_interface.md).

<!-- ## Build status
Build status of continuous integration i.e. Travis, appveyor etc. Ex. - 

[![Build Status](https://travis-ci.org/akashnimare/foco.svg?branch=master)](https://travis-ci.org/akashnimare/foco)
[![Windows Build Status](https://ci.appveyor.com/api/projects/status/github/akashnimare/foco?branch=master&svg=true)](https://ci.appveyor.com/project/akashnimare/foco/branch/master)
 -->
<!-- ## Code style
If you're using any code style like xo, standard etc. That will help others while contributing to your project. Ex. -

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)
 --> 
## Screenshots
![screencapture-35-157-4-217-8080-2019-08-15-13_16_44](https://user-images.githubusercontent.com/22503629/63080573-0cdb2e80-bf5f-11e9-9fa2-1c4c4eca26dc.png)

## Technology Used
<b>Built with</b>
- [Python]()
- [Javascript]()
- [JQuery]()
- [Bootstrap]()
- [CQP]()
- [SPARQL]()
- [Docker]()
- [HTML]()
- [CSS]()

## Features
This project is the first of its kind, which is using `SPARQL` to query over the multiple layers of corpus annotations. We use the format of the `CQP` language, which is much easier as compared to `SPARQL`. The `CQP` query is then converted to `SPARQL` query which is then queried over the RDF endpoint, which then retrieves the results. 
To expand the power of the tool, we had to leave one of the constraints of `CQP`. We have left the constraint that the words in the `CQP` query will be always continuous. The words are not always next to each other. For making the words to be continuous, a separate `nextWord` dependency has to be added. Leaving this constraint helps to add a lot of power to the tool.
<!--
## Code Example
TODO 
Show what the library does as concisely as possible, developers should be able to figure out **how** your project solves their problem by looking at the code example. Make sure the API you are showing off is obvious, and that your code is short and concise.
-->
## Installation

There are 2 methods to install, in both the cases, after running the fuseki server, the data has to uploaded on the fuseki server. 
For that create the database with the name as specified in the `config.yaml` file. 
Also, when uploading the file, specify the IRI which has been specified in the `config.yaml` file.

### 1. Running using the docker container 
1. Create a virtualenv in python
```
virtualenv cqp4rdf_env --python=python3
```
2. Shift to that enviornment
```
source cqp4rdf_env/bin/activate
```
3. Install `docker` and `docker-compose` .
4. Clone the repository 
```
git clone https://github.com/acoli-repo/cqp4rdf 
```
5. Shift to the CQP4RDF repository
```
cd cqp4rdf
```
6. Make the `config.yaml` file
```
cp cqp4rdf/config.docker.yaml cqp4rdf/config.yaml
``` 
7. Edit the `config.yaml` as per your requirements and needs.

8. Edit the `docker-compose` file as per your needs. If the ports specified in the docker-compose file are not available, i.e. 8088 and 3030, then the mapping can be updated as per the need. After update, the docker-compose file will have to build again.

9. Build the `docker-compose` image 
```
docker-compose build
```

10. Run the docker-compose containers
```
docker-compose up
```
This will start the 2 docker containers i.e. the CQP4RDF 


### 2. Running independently without docker

You will need a triple store with a SPARQL endpoint to use `cqp4rdf`. It was tested with Apache Jena Fuseki and Blazegraph.
Apart from that, you need to create a config file `config.yaml` in the installation directory (you can make a copy of `config.example.yaml` and modify it). The URL for the SPARQL endpoint is configured there.

Triples should be stored in a named graph that is also specified in config.

1. Create a virtualenv in python
```
virtualenv cqp4rdf_env --python=python3
```
2. Shift to that enviornment
```
source cqp4rdf_env/bin/activate
```
3. Clone the repository 
```
git clone https://github.com/acoli-repo/cqp4rdf 
```
4. Shift to the CQP4RDF repository
```
cd cqp4rdf
```
5. Make the `config.yaml` file
```
cp cqp4rdf/config.example.yaml cqp4rdf/config.yaml
```
6. Install the dependencies in the virtual enviornment 
```
pip install -r requirements.txt 
```
7. Edit the `config.yaml` as per your requirements and needs.

8. Run cqp4rdf
```
python cqp4rdf/main.py
```
9. Shift to the repository, where you have installed your SPARQL endpoint and run the SPARQL endpoint. You can also change the port on which you are running your fuseki endpoint, but same has to update in the `config.yaml` 
```
./fuseki-server
``` 

<!-- 
## API Reference
TODO
Depending on the size of the project, if it is small and simple enough the reference docs can be added to the README. For the medium size, to larger projects, it is important to at least provide a link to where the API reference docs live.
-->
## Configuring the `config.yaml` file

All the fields in the `config.yaml` files have already been commented. 
Here we would be explainign the most important thing in setting the `config.yaml`, i.e. the fields that we are specifying in the corpus.
For eg:-
```
 FEATS:
   name: FEATS
   query: conll:FEATS
   disabled: false
   type: list
   multivalued: true
   separator: "|"
   values:
     - "Case"
     - "Animacy"
```
This is one of the field, which has various options:-
- **name**:- This specifies the name of the field.
- **query**:- When being added in the query, this field would be represented like "conll:FEATS".
- **disabled**:- This option refers to the whether the field has to disabled or enabled. 
    - `disabled=True`:- it means that the field is disabled and would be ignored. 
    - `disabled=False`:- it means that the field is not disabled and would not be ignored.
- **type**:- This option refers to the type of field.
    - `type = list`:- would be showing the values in the dropdown
    - `type = suggest`:- would be suggesting the values 
    - `type = integer`:- would be having an input box with only integers allowed
- **multivalued**:- This option refers whether that field has mutiple values or not. WOuld be used when showing the info for the word.
    - `multivalued = true`:- would be referring that the field can have multiple values.
    - `multivalued = false`:- would be referring that the field does not have multiple values.
- **separator**:- The value of the separator would be used to separate the values for a field, if the field has multiple values. Used when showing the word info for the retrieved sentences. *It option is only required when `mulivalued=true`*
- **values**:- *This option is only required when the `type=list` or the `type=suggest`.* This option is a list, which would would be containing the value to be suggetsed or in the dropdown.
    - if `type=list`, then these values would be shown in the dropdown.
    - if `type=suggest`, then these values would be suggested in the text box.

## Deployment

Since we have the docker containers, the app can be directly deployed.
All the instructions are same as that of running the docker container.
Just a few more additions:-
- Just for security purposes, after the data has been uploaded on the fuseki server, it would be better to comment out the ports section for the fuseki server, so that it is not publically accessible.
- Also, since you would be leaving the terminal, it would be nice to run the `docker-compose` in daemon mode, so that yu can exit the container easily. It can be done in the following way ( use -d for the same):- 
```
docker-compose up -d
```


<!--
## Tests
TODO
Describe and show how to run the tests with code examples.
-->
<!--
## How to use?
TODO
If people like your project they’ll want to learn how they can use it. To do so include step by step guide to use your project.
==> Here include how to make an instance for their project like cdli
-->
<!--
## Contribute
TODO
Let people know how they can contribute to your project. A [contributing guideline](https://github.com/zulip/zulip-electron/blob/master/CONTRIBUTING.md) will be a big plus.
==> Ask for contributing guidelines
-->
## Further Improvements
Some of the possible future improvements:-
- An `ADMIN` portal, which can be used to configure and would be saved as config file.  
- The portal which can be used to upload the data directly without uploading from the SPRQL endpoint 
- Improving the API, so that they can return multiple types of value

## Credits
- Max Ionov
- Florian Stein
- Ilya Khait
- Sagar
<!--
## License
TODO
A short snippet describing the license (MIT, Apache etc)
MIT © [Yourname]()
-->
