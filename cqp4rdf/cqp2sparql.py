import lark
import collections
import itertools

from lark.tree import pydot__tree_to_png    # Just a neat utility function
from IPython.display import Image


def save_diagram(tree, filename, show=False):
    pydot__tree_to_png(tree, filename)
    if show:
        return Image(filename)


def show_diagram(tree):
    return save_diagram(tree, 'tmp_img.png', show=True)

def invert(t):
    if type(t) == lark.lexer.Token:
        return t
    if t.data == "neg":
        return negless(t.children[0])
    if t.data == "eq":
        return lark.tree.Tree("neq", [negless(child) for child in t.children])
    if t.data == "neq":
        return lark.tree.Tree("eq", [negless(child) for child in t.children])
    if t.data == "conjunction":
        return lark.tree.Tree("disjunction", [invert(child) for child in t.children])
    if t.data == "disjunction":
        return lark.tree.Tree("conjunction", [invert(child) for child in t.children])
    if t.data == "c_disjunc":
        return lark.tree.Tree("c_conjunc", [invert(child) for child in t.children])
    if t.data == "c_conjunc":
        return lark.tree.Tree("c_disjunc", [invert(child) for child in t.children])
    if t.data == "c_neg":
        return negless(t.children[0])
    if t.data == "c_eq":
        return lark.tree.Tree("c_neq", [negless(child) for child in t.children])
    if t.data == "c_neq":
        return lark.tree.Tree("c_eq", [negless(child) for child in t.children])
    return lark.tree.Tree(t.data, [invert(child) for child in t.children])

def negless(t):
    if type(t) == lark.lexer.Token:
        return t
    if t.data == "neg":
        return invert(t.children[0])
    if t.data == "c_neg":
        return invert(t.children[0])
    return lark.tree.Tree(t.data, [negless(child) for child in t.children])

seq = "_Nr"

done_unfolde = False

def limited(t, count, low, up):
    global done_unfolde
    new_count = low + count
    done_unfolde = True
    if new_count > up:
        raise IndexError('Error: Upper limit reached.')
    return (lark.tree.Tree("exect_num", [t.children[0], lark.tree.Tree("count", [lark.lexer.Token("NUMBER", str(new_count))])]))

def first_count(t, count):
    if type(t) == lark.lexer.Token:
        return t
    
    global done_unfolde
    
    total_max = 10
    
    if not done_unfolde:
        if (t.data == "limited"):
            low = int(t.children[1].children[0])
            up = int(t.children[2].children[0])
            return limited(t, count, low, up)
        
        if (t.data == "sequence"):
            low = 0
            up = total_max
            return limited(t, count, low, up)
        
        if (t.data == "non_empty_sequence"):
            low = 1
            up = total_max
            return limited(t, count, low, up)
        
        if (t.data == "limited_lower"):
            low = int(t.children[1].children[0])
            up = total_max
            return limited(t, count, low, up)
        
        if (t.data == "limited_upper"):
            low = 0
            up = int(t.children[1].children[0])
            return limited(t, count, low, up)
        
        if (t.data == "optinal"):
            low = 0
            up = 1
            return limited(t, count, low, up)
        
        if (t.data == "altern"):
            done_unfolde = True
            try:
                return t.children[count]
            except:
                raise IndexError('Error: Upper limit reached.')
    
    return lark.tree.Tree(t.data, [first_count(child, count) for child in t.children])

def unfold(tree):
    res = []
    global done_unfolde
    i = 0

    # print(tree.pretty())

    done_unfolde = True 
    local_done = done_unfolde
    while local_done:
        try:
            done_unfolde = False
            pure = first_count(tree, i)
            local_done = done_unfolde
            if done_unfolde:
                res += unfold(pure)
            else:
                res += [pure]
            i += 1
        except:
            break
    
    # for re in res:
    #     print(re.pretty())

    return res

def concat(querys):
    # trees = [CQP2SPARQLTransformer().transform(seq) for seq in (unfold(negless(parser.parse(query))))]
    querys = [query for query in querys if query]
    if not querys:
        return ""

    if len(querys) == 1:
        return querys[0]

    print(querys)

    return querys[0].split("{")[0] + "{\n\t{" + "UNION\n\t{\n".join([query.split("{")[1].replace("\n", "\n\t") for query in querys]) + "\n}"



Condition = collections.namedtuple('Condition', 'operation name value')

class CQP2SPARQLTransformer(lark.Transformer):
    name_tmpl = {key: '?{}_{{}}'.format(key) for key in ('val', 'var', 'cond')}
    cond_tmpl = '{name}{operation}{value}'
    sparql_tmpl = """%s

SELECT DISTINCT {variables}
FROM <%s>
WHERE
{{
{conditions}

{filters}
}}
"""
    def _debug_output(self):
        msg = '--- {} ---\n{}\n'
        print(msg.format('TOKENS', self.tokens))
        print(msg.format('CONDITIONS', self.token_conditions))
        print(msg.format('COND_VALUES', self.condition_values))
    
    def __init__(self, prefixes, corpus_iri):
        super(CQP2SPARQLTransformer, self).__init__()

        self.sparql_tmpl = self.sparql_tmpl % (prefixes, corpus_iri)
        
        # A list of all the variables (both named and var_N)
        self.tokens = []

        # for withins and contains
        self.hiden_tokens = []

        # for within sentence
        self.parents = []
        
        # Contains conditions for each token_group. Should we rename it? What's the difference from token_conditions?
        self.token_conditions = {}
        
        # Contains values for each condition mentioned in self.token_conditions
        self.condition_values = {}
        
        # Contains counters for various variable names (e.g. variable names, value names)
        self.indices = collections.defaultdict(int)
        
        # Should contain information about global constraints listed in the end of the CQP query.
        # At the moment I have no idea of how this should be implemented
        self.constraints_conditions = []

        self.constraints_values = []

    
    def _new_name(self, name_type):
        if name_type not in self.name_tmpl:
            raise ArgumentError('Unknown index: {}'.format(name_tmpl))
            
        self.indices[name_type] += 1
        return self.name_tmpl[name_type].format(self.indices[name_type])
    
    def _new_var_name(self):
        return self._new_name('var')
    
    def _new_val_name(self):
        return self._new_name('val')
    
    def _new_cond_name(self):
        return self._new_name('cond')
    
    def _token_value(self, args):
        return str(args[0])
    
    def _binary_op(self, args, operation):
        '''
        Returns:
        1. Property
        2. Object
        3. Operation
        4. Value
        '''
        val_name = self._new_val_name()
        self.condition_values[val_name] = Condition(operation=operation, name=args[0], value=args[1]) #self.cond_tmpl.format(op=operation, val_name=args[0], val=args[1]))

        return val_name


    def _add_condition(self, var_name, cond, num=""):
        if not cond:
            return ""

        var_name += num
        # cond += num

        # print("\t", var_name, cond)

        # print(self.condition_values)

        # OR AND
        if self.condition_values[cond].name in self.condition_values:
            return "(" + self._add_condition(var_name, self.condition_values[cond].name, num) + " " + self.condition_values[cond].operation + " " + self._add_condition(var_name, self.condition_values[cond].value, num) + ")"

        # NOT
        elif self.condition_values[cond].value in self.condition_values:
            return "(" + self.condition_values[cond].operation + self._add_condition(var_name, self.condition_values[cond].value, num) + ")"

        else:
            # == (-> REGEX)
            if not num:
                self.constraints_values += [[var_name, cond, self.condition_values[cond]]]
            # print(self.constraints_values)
            return self.condition_values[cond].operation + "(" + cond + num + ", " + self.condition_values[cond].value + ")"
            
    def param(self, args):
        return self._token_value(args)
        
    def count(self, args):
        return self._token_value(args)
    
    def value(self, args):
        # return self._token_value(args)
        val = self._token_value(args)

        val = '"^' + val[1:-1] + '$"'

        return val

    def neg(self, args):
        # print("WARNING!!\tuse the negless funktion!!!")
        raise ArgumentError("Always use the negless function!")
        # return self._invert(args)
        return self._binary_op([None, args[0]], '!')
    
    def eq(self, args):
        # return self._binary_op(args, '=')
        # args[1] = '"^' + args[1][1:-1] + '$"'
        return self._binary_op(args, 'regex')
        # return "regex(" + args[0] + ", " + args[1] + ")"
    
    def neq(self, args):
        # return self._binary_op(args, '!=')
        # args[1] = '"^' + args[1][1:-1] + '$"'
        return self._binary_op(args, '!regex')
        # return "!regex(" + args[0] + ", " + args[1] + ")"
    
    def conjunction(self, args):
        # Here all the single conditions are already processed, so we can add them to some other data structures
        
        print('conjunction', args)
        return self._binary_op(args, '&&')
    
    def disjunction(self, args):
        # Here all the single conditions AND all the conjunctions are already processed, so we can add them to some other data structures
        
        print('disjunction', args[0] + args[1])
        return self._binary_op(args, '||')
    
    def words(self, args):
        # print("words", args)
        # self.tokens.extend(arg['var_name'] for arg in args)
        # return args

        out = []
        for arg in args:
            out += arg

        return out
        # return self._add_seq(args, 1)

    def _add_num_tok(self, tok, num):
        # out = {"word_cond" : tok["word_cond"]}
        out = {key:tok[key] for key in tok}
        out["var_name"] = tok["var_name"] + seq + str(num)

        return out

    def sequence(self, args):
        raise ArgumentError("Always use the unfold function!")
    def non_empty_sequence(self, args):
        raise ArgumentError("Always use the unfold function!")
    def limited(self, args):
        raise ArgumentError("Always use the unfold function!")
    def limited_lower(self, args):
        raise ArgumentError("Always use the unfold function!")
    def limited_upper(self, args):
        raise ArgumentError("Always use the unfold function!")
    def exect_num(self, args):
        raise ArgumentError("Always use the unfold function!")
    def optinal(self, args):
        raise ArgumentError("Always use the unfold function!")
    def altern(self, args):
        raise ArgumentError("Always use the unfold function!")

    def exect_num(self, args):
        count = int(args[1])

        seqs = []

        for i in range(count):
            seqs += [self._add_num_tok(arg, i) for arg in args[0]]


        print("num", seqs)

        # print([arg["var_name"] for arg in args[0]])

        for x in [arg["var_name"] for arg in args[0]]:

            for val in self.constraints_values:
                if x == val[0]:
                    print("val", val)
                    for i in range(count):
                        self.constraints_values += [[val[0] + seq + str(i), val[1] + seq + str(i), val[2]]]
                        # self.condition_values[x+seq+str(i)] = self.condition_values[x]+seq+str(i)
                        


            if x in self.token_conditions:
                for i in range(count):
                    self.token_conditions[x+seq+str(i)] = self.token_conditions[x]+seq+str(i)

                y = self.token_conditions[x]
                if y in self.condition_values:
                    for i in range(count):
                        self.condition_values[y+seq+str(i)] = self.condition_values[y]

                    del self.condition_values[y]

                del self.token_conditions[x]


        # for x in [arg["var_name"] for arg in args[0]]:

        #     # print("x", x)
        #     # print("cond\t", self.condition_values)

        #     if x in self.token_conditions:
        #         print(self.token_conditions[x])
        #         for i in range(count):
        #             # print("\t-\t", self._add_condition(x, self.token_conditions[x], seq+str(i)))
        #             flt = self._add_condition(x, self.token_conditions[x], seq+str(i))

        #             if flt:
        #                 print("filter", flt)
        #                 self.constraints_conditions += [flt]


        self.constraints_values = [a for a in self.constraints_values if (not a[0] in [arg["var_name"] for arg in args[0]])]


        # print("cond\t", self.condition_values)

        return seqs



    def word(self, args):
        # here we need to add var_name to each arg
        word_data = {child.data: child.children[0] if len(child.children) else None for child in args}
        
        var_name = '?{}'.format(word_data['var_name']) if 'var_name' in word_data else self._new_var_name()
        if var_name in self.token_conditions:
            raise IndexError('Variable name {} is defined more than once'.format(word_data['var_name']))

        word_data['var_name'] = var_name
        print('word_data: ', word_data)
        
        if 'word_cond' in word_data and word_data['word_cond']:
            self.token_conditions[var_name] = word_data['word_cond']

        # flt = self._add_condition(var_name, word_data["word_cond"])

        # if flt:
        #     print("filter", flt)
        #     self.constraints_conditions += [flt]
        
        return [word_data]



    def query(self, args):
        print("query", args[0])

        self.tokens.extend(arg['var_name'] for arg in args[0] if (not arg['var_name'] in self.hiden_tokens))

        print("tokens", self.tokens)

        for tok in self.tokens + self.hiden_tokens:
            print("tok", tok)
            try:
                flt = self._add_condition(tok, self.token_conditions[tok])
                print("filter", flt)
                self.constraints_conditions += [flt]
            except:
                print("no condition for", tok)

        
        return args



    def within(self, args):
        print("within", args)

        if type(args[1]) == lark.lexer.Token:
            parent = str(args[1])
            parent = parent.replace("<","").replace("/","").replace(">","").replace(" ","")
            fst = args[0][ 0]["var_name"]
            lst = args[0][-1]["var_name"]
            # sent = self._new_val_name()
            mom = self._new_val_name()
            dad = self._new_val_name()

            self.token_conditions[fst] = mom
            self.token_conditions[lst] = dad

            self.condition_values[mom] = ""

            self.constraints_values += [[fst, mom, Condition(operation="=", name="powla:hasParent", value=None)]]
            self.constraints_values += [[lst, dad, Condition(operation="=", name="powla:hasParent", value=None)]]

            if parent:
                self.parents += [[mom, parent], [dad, parent]]

            self.constraints_conditions += [mom + "=" + dad]

            return args[0]

        self.hiden_tokens.extend(arg['var_name'] for arg in args[1])

        print(len([arg['var_name'] for arg in args[0]]))

        cond = ("=" + args[0][0]['var_name'] + ") || (").join([arg['var_name'] for arg in args[1]][:(1+len(args[1])-len(args[0]))])

        cond = "(" + cond + "=" + args[0][0]['var_name'] + ")"

        self.constraints_conditions += [cond]

        return args[0] + args[1]

    def containing(self, args):
        print("containing", args, len(args[0]), len(args[1]))

        self.hiden_tokens.extend(arg['var_name'] for arg in args[1])

        print(len([arg['var_name'] for arg in args[0]]))

        cond = ("=" + args[1][0]['var_name'] + ") || (").join([arg['var_name'] for arg in args[0]][:(1+len(args[0])-len(args[1]))])

        cond = "(" + cond + "=" + args[1][0]['var_name'] + ")"
        
        self.constraints_conditions += [cond]

        return args[0] + args[1]


    def segments(self, args):
        print("segs", args)
        return args[0]

    def segment(self, args):
        print("sg", args)
        return args[0]
    #     # return self._token_value(args)



    # ******************************* CONSTRAINTS *******************************
    def constraints(self, args):
        # print("constraints", args)

        # self.token_conditions["constraints"] = args[0]

        print("constraints", args)

        self.constraints_conditions += args[0]

        return args[0]

    def c_disjunc(self, args):
        print("c_or", args)
        
        # return self._binary_op(args, '||')
        # return "(" + args[0] + "||" + args[1] + ")"

        return ["(" + arg0 + "||" + arg1 + ")" for arg0 in args[0] for arg1 in args[1]]


    def c_conjunc(self, args):
        print("c_and", args)

        # return self._binary_op(args, '&&')
        # return "(" + args[0] + "&&" + args[1] + ")"

        return ["(" + arg0 + "&&" + arg1 + ")" for arg0 in args[0] for arg1 in args[1]]
        

    def c_neg(self, args):
        # print("WARNING!!\tuse the negless funktion!!!")
        raise ArgumentError("Always use the negless function!")
        return ["!(" + arg + ")" for arg in args[0]]

    def c_eq(self, args):
        # self.constraints_conditions += [args[0]+"="+args[1]]

        print("c_eq", args)

        # return args[0]["term_cond"] + "=" + args[1]["term_cond"]

        return [arg0["term_cond"] + "=" + arg1["term_cond"] for arg0 in args[0] for arg1 in args[1]]
        
        # self._binary_op([arg["term_cond"] for arg in args], '=')

    def c_neq(self, args):
        # self.constraints_conditions += [args[0]+"!="+args[1]]
        print("c_neq", args)

        # return " (" + args[0]["term_cond"] + "!=" + args[1]["term_cond"] +") "
        
        return [" (" + arg0["term_cond"] + "!=" + arg1["term_cond"] +") " for arg0 in args[0] for arg1 in args[1]]


         # self._binary_op([arg["term_cond"] for arg in args], '!=')

    def term(self, args):
        term_data = {args[0].data: args[0].children[0]}

        var_name ='?{}'.format(term_data['var_name'])

        # # term_data = {}
        # # term_data["var_name"] = var_name
        # # term_data["term_cond"] = self._new_val_name()

        # print("term_data:", term_data)

        var_names = [tok for tok in self.tokens if tok.startswith(var_name)]

        term_datas = []

        for var_name in var_names:
            term_data = {args[0].data: args[0].children[0]}

            # var_name ='?{}'.format(term_data['var_name'])

            term_data = {}
            term_data["var_name"] = var_name
            term_data["term_cond"] = self._new_val_name()

            self.constraints_values += [[var_name, term_data["term_cond"], Condition(operation="=", name=args[1], value=None)]]
    
            print("term_data:", term_data)

            term_datas += [term_data]


        return term_datas

    def c_param(self, args):
        return self._token_value(args)



    def start(self, args):
        self._debug_output()

        # variables = "?before ?output ?post"
        variables = "?words ?links ?parents"
        # variables = ' '.join([(tok + "_word " + tok) for tok in self.tokens])

        sparql = collections.OrderedDict((name, []) for name in ('var_definitions',
                                                                 'token_precedence',
                                                                 'token_conditions',
                                                                 'var_optional',
                                                                 'var_filters', 
                                                                 'token_bind'))


        print("\nconstraints_values\n", self.constraints_values)
        print("\nconstraints_conditions\n", self.constraints_conditions)

        # sparql['token_bind'] = ["\tBIND(CONCAT(?pre" + '_word, "  ", ?pre'.join([str(x) for x in range(5)]) + "_word) AS ?before) .", 
        #                         "\tBIND(CONCAT(" + '_word, "  ", '.join(self.tokens) + "_word) AS ?output) .", 
        #                         "\tBIND(CONCAT(?post" + '_word, "  ", ?post'.join([str(x) for x in range(5)]) + "_word) AS ?post) ."]

        sparql['token_bind'] += ["\tBIND(CONCAT((" + '_word), " ", ('.join(self.tokens) + "_word)) AS ?words) ."]
        sparql['token_bind'] += ["\tBIND(CONCAT(STR(" + '), " ", STR('.join(self.tokens) + ")) AS ?links) ."]
        sparql['token_bind'] += ["\tBIND(CONCAT(STR(" + '_parent), " ", STR('.join(self.tokens) + "_parent)) AS ?parents) ."]

        if not self.tokens:
            return ""

        # self.tokens = ["?pre"+str(x) for x in range(5)] + self.tokens + ["?post"+str(x) for x in range(5)]
        
        for var in self.tokens:
            sparql['var_definitions'].append('\t{var} a nif:Word .'.format(var=var))
            # sparql['var_definitions'].append('\t{var} a nif:Word .'.format(var=var))

            sparql['var_optional'].append('\t' + var + ' conll:FORM ' + var + '_word . ')
            sparql['var_optional'].append('\t' + var + ' conll:HEAD* ' + var + '_parent . ')
            sparql['var_optional'].append('\t' + var + '_parent a nif:Sentence . ')


        for var in self.hiden_tokens:
            sparql['var_definitions'].append('\t{var} a nif:Word .'.format(var=var))

        
        for var in self.parents:
            sparql['var_definitions'].append('\t{par} a {typ} .'.format(par = var[0], typ =var[1]))


        for var in self.constraints_values:
            sparql['token_conditions'].append('\t{var} {property} {value} .'.format(var=var[0], 
                                                                                    property=var[2].name,
                                                                                    value=var[1]
                                                                                   ))


        for var in self.constraints_conditions:
            sparql['var_filters'].append("\tFILTER(" + var + ") .")
            # sparql['var_filters'].append("\tFILTER({}).".format(self.cond_tmpl.format(name=var[0]["term_cond"], 
            #                                                                           operation=var[2], 
            #                                                                           value=var[1]["term_cond"]
            #                                                                          )))
        
        # for i, token in enumerate(self.tokens[:-1]):
        #         sparql['token_precedence'].append("\t{} nif:nextWord {} .".format(self.tokens[i], self.tokens[i+1]))

        for i, token in enumerate(self.hiden_tokens[:-1]):
                sparql['token_precedence'].append("\t{} nif:nextWord {} .".format(self.hiden_tokens[i], self.hiden_tokens[i+1]))


        
        return self.sparql_tmpl.format(variables=variables,
                                       conditions='\n\n'.join('\n'.join(section) for section in sparql.values()),
                                       filters=''
                                      )

#TODO: 
#   syntax anpassen: within nach constraints 
#   auch syntax: alternations klammern zu schwach 
#   wie umgehen mit variablen die in alternation vorkommen? zB (a:[] | b:[]) c:[] & a.word=c.word | b.lem=c.lem
#   !contaioning und !within 