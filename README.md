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
### 1. Running using the docker container 
1. Install `docker` and `docker-compose` .
2. Clone the repository 
```
git clone https://github.com/acoli-repo/cqp4rdf 
```
3. Shift to the CQP4RDF repository
```
cd cqp4rdf
```
4. Make the `config.yaml` file
```
cp cqp4rdf/config.docker.yaml cqp4rdf/config.yaml
``` 
5. Build the `docker-compose` image 
```
docker-compose build
```
You can edit the `docker-compose` file as per your needs. If the ports specified in the docker-compose file are not available, i.e. 8088 and 3030, then the mapping can be updated as per the need. After update, the docker-compose file will have to build again.
 
7. Run the docker-compose containers
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
7. Run cqp4rdf
```
python cqp4rdf/main.py
```
8. Shift to the repository, where you have installed your SPARQL endpoint and run the SPARQL endpoint. You can also change the port on which you are running your fuseki endpoint, but same has to update in the `config.yaml` 
```
./fuseki-server
``` 
<!-- 
## API Reference
TODO
Depending on the size of the project, if it is small and simple enough the reference docs can be added to the README. For the medium size, to larger projects, it is important to at least provide a link to where the API reference docs live.
-->

## Direct Deployment
We also have a separate docker file hosted on docker hub so that everything can be deployed easily.

1. once done with your update in the config file and the docker-compose file, build the docker file and push the docker file to your docker hub. Unfortunately, we can't push docker-compose on docker hub.
- instead, the docker-compose is written in comments so that it can be made on the go
- while making a docker-compose to be public on the docker hub, update the cp4rdf section from being built to the image  
2. now login to your server, where you want to host it
- now install docker and docker-compose on the server
- once installed, now make a docker-compose file
- in the docker-compose file, update the d
1. Install the docker and docker-compose
2. Pull the docker image
3. Make a docker-compose file as on the docker hub page
4. run the docker-compose file
5. The fuseki-server would be a port number 3030 and the CQP4RDF would be at the server 8088, by default. this could be updated as per the need.
6. The data can be uploaded on the SARQL endpoint, port number as specified by  
and your website is up
- Now 

<!--
## Tests
TODO
Describe and show how to run the tests with code examples.
-->
## How to use?
TODO
If people like your project they’ll want to learn how they can use it. To do so include step by step guide to use your project.
==> Here include how to make an instance for their project like cdli

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

## License
TODO
A short snippet describing the license (MIT, Apache etc)

MIT © [Yourname]()
