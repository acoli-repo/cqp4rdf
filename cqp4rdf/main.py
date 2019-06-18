from flask import Flask, jsonify, request, render_template

import os
import yaml
import lark
import cqp2sparql
import html
import urllib.parse
import json

import logging

from SPARQLWrapper import SPARQLWrapper, JSON

logging.basicConfig(filename='cqp4rdf.log',
                    format='%(asctime)s %(message)s',
                    datefmt='%d.%m.%Y %I:%M:%S %p',
                    level=logging.INFO)

web_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'web')
config_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'config.yaml')
app = Flask(__name__, static_url_path='', static_folder=web_path, template_folder=web_path)

with open(config_path, encoding='utf-8') as inp_file:
    config = yaml.safe_load(inp_file)

prefixes = '\n'.join('prefix {}: <{}>'.format(key, val) for key, val in config['corpora'][config['default']]['prefixes'].items())
prefixes_index = {val: key for key, val in config['corpora'][config['default']]['prefixes'].items()}

corpus_iri = config['corpora'][config['default']]['iri']

@app.route('/')
def main():
    corpus = request.args.get('corpus')
    return render_template('cqp2sparql.html', config=config, corpus=corpus if corpus else config['default'])

contexts = {}

def allChidren(parent):
    corpus = request.args.get('corpus')

    prefixes = '\n'.join('prefix {}: <{}>'.format(key, val) for key, val in config['corpora'][config['default']]['prefixes'].items())
    prefixes_index = {val: key for key, val in config['corpora'][config['default']]['prefixes'].items()}

    corpus_iri = config['corpora'][config['default']]['iri']

    if corpus and corpus in config['corpora'].keys():
        prefixes = '\n'.join('prefix {}: <{}>'.format(key, val) for key, val in config['corpora'][corpus]['prefixes'].items())
        prefixes_index = {val: key for key, val in config['corpora'][corpus]['prefixes'].items()}

        corpus_iri = config['corpora'][corpus]['iri']

    sparql = """{prefixes}

    SELECT DISTINCT ?word ?link
    FROM <{corpus_iri}>
    WHERE
    {{
        ?link a nif:Word .
        ?sentence a nif:Sentence .
        ?link conll:HEAD* ?sentence . 
        ?link conll:WORD ?word . 
        
        FILTER(?sentence = <{parent}>)


    }} ORDER BY ?link
    """.format(prefixes=prefixes, corpus_iri=corpus_iri, parent=parent)

    conn.setQuery(sparql)

    conn.setReturnFormat(JSON)
    results = conn.query().convert()

    # print(results)

    res = []

    for result in results["results"]["bindings"]:
        res += [{"word": result["word"]["value"], "link": result["link"]["value"]}]


    return res

def linked_word(word):
    return word["word"]
    # return '"<a href="http://192.168.0.113:9999/blazegraph/#explore:kb:%3C' +  word["link"] + '">' + word["word"] + '</a>"  '
    # "http://192.168.0.113:9999/blazegraph/#explore:kb:%3Cfile:///C:/Users/chiarcos/Desktop/corpus/armenian/EANC_sentences_sample///fiction.tsv#s187_1%3E"


@app.route('/api/info')
def word_info():
    word_uri = request.args.get('uri')
    corpus = request.args.get('corpus')

    prefixes = '\n'.join('prefix {}: <{}>'.format(key, val) for key, val in config['corpora'][config['default']]['prefixes'].items())
    prefixes_index = {val: key for key, val in config['corpora'][config['default']]['prefixes'].items()}

    corpus_iri = config['corpora'][config['default']]['iri']

    if corpus and corpus in config['corpora'].keys():
        prefixes = '\n'.join('prefix {}: <{}>'.format(key, val) for key, val in config['corpora'][corpus]['prefixes'].items())
        prefixes_index = {val: key for key, val in config['corpora'][corpus]['prefixes'].items()}

        corpus_iri = config['corpora'][corpus]['iri']

    sparql = """{prefixes}

    SELECT DISTINCT ?pred ?val 
    FROM <{corpus_iri}>
    WHERE
    {{
        <{word_uri}> ?pred ?val .


    }}
    """.format(prefixes=prefixes, corpus_iri=corpus_iri, word_uri=word_uri)

    logging.debug(word_uri)
    logging.info(sparql)

    conn.setQuery(sparql)

    conn.setReturnFormat(JSON)
    results = conn.query().convert()

    res = []

    for result in results["results"]["bindings"]:
        if result["val"]["type"] != "uri":
            pred = result["pred"]["value"]
            for prefix in prefixes_index:
                if pred.startswith(prefix):
                    pred = pred.replace(prefix, prefixes_index[prefix] + ':')
            res += [{"pred": pred, "val": result["val"]["value"]}]

    return json.dumps(res)


@app.route('/api/query')
def query():
    cqp = request.args.get('cqp')
    page = int(request.args.get('page'))  # config['n_results']
    corpus = request.args.get('corpus')

    if not page:
        page = 1

    prefixes = '\n'.join('prefix {}: <{}>'.format(key, val) for key, val in config['corpora'][config['default']]['prefixes'].items())
    prefixes_index = {val: key for key, val in config['corpora'][config['default']]['prefixes'].items()}

    corpus_iri = config['corpora'][config['default']]['iri']

    if corpus and corpus in config['corpora'].keys():
        prefixes = '\n'.join('prefix {}: <{}>'.format(key, val) for key, val in config['corpora'][corpus]['prefixes'].items())
        prefixes_index = {val: key for key, val in config['corpora'][corpus]['prefixes'].items()}

        corpus_iri = config['corpora'][corpus]['iri']

    logging.info('\n\n====== New query ======')
    logging.info(cqp)
    logging.info(parser.parse(cqp).pretty())

    transformer = cqp2sparql.CQP2SPARQLTransformer(prefixes, corpus_iri)
    trees = cqp2sparql.unfold(cqp2sparql.negless(parser.parse(cqp)))

    sparqls = []

    for tree in trees:
        # it's important not to reuse the transformers 
        transformer = cqp2sparql.CQP2SPARQLTransformer(prefixes, corpus_iri)
        sparqls += [transformer.transform(tree)]
        
    sparql = cqp2sparql.concat(sparqls) + "ORDER BY ?links OFFSET " + str((page-1) * config['n_results']) + " LIMIT " + str(config['n_results']+1)

    logging.info(sparql)

    conn.setQuery(sparql)

    conn.setReturnFormat(JSON)
    results = conn.query().convert()

    global contexts

    lst = (len(results["results"]["bindings"]) <= config['n_results'])
    fst = (page==1)

    results["results"]["bindings"] = results["results"]["bindings"][:config['n_results']]

    res = []
    for row in results["results"]["bindings"]:
        # print(row)

        words   = row['words']['value'].split(' ')
        links   = row['links']['value'].split(' ')
        parents = row['parents']['value'].split(' ')

        output = []
        for i in range(len(words)):
            output += [{"word": words[i], "link": links[i]}]

        context = []

        done = []

        for parent in parents:
            if not parent in done:
                try:
                    context += contexts[parent]

                except:
                    contexts[parent] = allChidren(parent)
                    context += contexts[parent]
            done += [parent]

        before = []

        for con in context:
            if con == output[0]:
                break

            before += [con]

        after = []

        for con in context[len(before) + len(words):]:
            after += [con]

        # for con in context:
        #     if not (con in (before+output+after)):
        #         logging.error("AUFSCHREI! " + con["word"] + " | " + " ".join([c["word"] for c in context]))

        logging.debug("before", " ".join([x["word"] for x in before]))
        logging.debug("output", " ".join([x["word"] for x in output]))
        logging.debug("after",  " ".join([x["word"] for x in after]))
        logging.debug("\n")

        # res.append({"result": " ".join([linked_word(x) for x in output])})
        res.append({"l_context": before, "keywords": output, "r_context": after})

    logging.info("done")
    return jsonify({'sparql': html.escape(sparql), 'results': res, "last_page": lst, "first_page": fst, "page": page})


if __name__ == '__main__':
    with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), config['grammar'])) as inp_file:
        parser = lark.Lark(inp_file, debug=True)
        logging.info('loaded')
        logging.debug(parser)

    conn = SPARQLWrapper(urllib.parse.urljoin(config['sparql']['host'], config['sparql']['endpoint']))

    app.run(debug=True, host=config['api']['host'], port=config['api']['port'])

