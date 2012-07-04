
/**
 * PEG.js Grammar for Answer Set Programming
 *
 * Author: Sean Policarpio
 *
 */


start
    = (rules [" ""\n""%A0"]*)*

rules
    = rule:rule {return ["<span style='color:green'>"].concat(rule).concat(["</span>"])}
    / fact:fact {return ["<span style='color:green'>"].concat(fact).concat(["</span>"])}
    
rule
    = " "* head:(head) " "* neck:(":-") " "* body:(body) " "* "." {return head.concat(neck).concat(body).concat(["."]) }

head
    = head:literal {return ["<b>"].concat(head).concat(["</b>"])}
    / " "*

body
    = (not:"not")? (" "*)(literal:literal)" "* ((" "*) (",") (" "*) (body:body))?

fact
    = " "* literal:literal " "* "." {return literal.concat(["."])}

literal
    = atom:atom {return atom}
    / "-" atom:atom {return ["<span style='color:red'>", "-", "</span>"].concat(atom)}

atom
    = predicate:predicate " "* "(" terms:terms ")" " "* {return predicate.concat(["("]).concat(terms).concat([")"])}
    / term

terms
    = (" "* term:term " "*) (" "* "," " "* terms)?
    / (" "* variable:variable " "*) (" "* "," " "* terms)?

term
    = term:([a-z]+ [0-9a-zA-Z]*) {return ["<span style='color:blue'>"].concat(term).concat(["</span>"])}

variable
    = variable:([A-Za-z]+ [0-9a-zA-Z]*) {return ["<span style='color:yellow'>"].concat(variable).concat(["</span>"])}

predicate
    = predicate:([a-z]+ [0-9a-zA-Z]*) {return ["<span style='color:purple'>"].concat(predicate).concat(["</span>"])}
