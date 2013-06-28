
/* lexical grammar */
%lex

%%
\n                    return 'NEWLINE';
<<EOF>>               return 'EOF';
"  "                  return 'INDENT';
"-"                   return 'HYPHEN';
"("                   return 'LEFT_PARENTHESIS';
")"                   return 'RIGHT_PARENTHESIS';
"%"                   return 'PERCENT';
"#"                   return 'OCTOTHORPE';
"."                   return 'PERIOD';
"="                   return 'EQUAL';
[a-zA-Z0-9]+          return 'ALPHABETICAL';
.*                    return 'REST';

/lex

%start file

%% /* language grammar */

file
  : lines EOF                  { return $$ = $1; }
  ;

lines
  : lines line                 { $$ = $lines; $$.push($line); }
  | line                       { $$ = [$line]; }
  ;

indentation
  : indentation INDENT         { $$ = $indentation; $$.push("INDENT") }
  | INDENT                     { $$ = ["INDENT"]; }
  ;

line
  : indentation tag rest NEWLINE   { $$ = $indentation; $$.push($2, $3); }
  | tag rest NEWLINE               { $$ = [$1, $2]; }
  | indentation tag NEWLINE        { $$ = [$2]; }
  | tag NEWLINE                    { $$ = [$1]; }
  | indentation rest NEWLINE
  | rest NEWLINE
  | NEWLINE
  ;

tag
  : PERCENT name idComponent classComponents { $$ = {tag: $name, id: $idComponent, classes: $classComponents};}
  | PERCENT name classComponents       { $$ = {tag: $name, classes: $classComponents}; }
  | PERCENT name                       { $$ = {tag: $name}; }
  | idComponent                        { $$ = {tag: "div", id: $idComponent}; }
  | idComponent classComponents        { $$ = {tag: "div", id: $idComponent, classes: $classComponents}; }
  | classComponents                    { $$ = {tag: "div", classes: $classComponents}; }
  ;

idComponent
  : OCTOTHORPE name                   { $$ = $name; }
  ;

classComponents
  : classComponents classComponent    { $$ = classComponents.concat($classComponent); }
  | classComponent                    { $$ = [$classComponent]; }
  ;

classComponent
  : PERIOD name                       { $$ = $name; }
  ;

attributes
  : LEFT_PARENTHESIS attributePairs RIGHT_PARENTHESIS  { $$ = $attributePairs; }
  ;

attributePairs
  : attributePairs attributePair
  | attributePair
  ;

attributePair
  : name EQUAL attributeExpression
  ;

attributeExpression
  : ALPHABETICAL
  ;

name
  : ALPHABETICAL
  ;

rest
  : HYPHEN REST
  | EQUAL REST
  | REST
  ;
