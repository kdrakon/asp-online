
/**
 * PEG.js Grammar for Answer Set Programming
 *
 * Author: Sean Policarpio
 *
 */


start
    = (rules [" ""\n"]*)*

rules
    = rule
    / fact
    
rule
    = " "* (head) " "* (":-") " "* (body) " "* "."

head
    = literal
    / " "*

body
    = ("not")? (" "*)(literal)" "* ((" "*) (",") (" "*) (body))?

fact
    = " "* literal " "* "."

literal
    = atom
    / "-" atom

atom
    = predicate " "* "(" terms ")" " "*
    / term

terms
    = (" "* term " "*) (" "* "," " "* terms)?
    / (" "* variable " "*) (" "* "," " "* terms)?

term
    = ([a-z0-9]+ [0-9a-zA-Z]*)

variable
    = ([A-Za-z]+ [0-9a-zA-Z]*)

predicate
    = ([a-z]+ [0-9a-zA-Z]*)
