id                          [_a-zA-Z][-_a-zA-Z0-9]*
NameStartChar               ":" | [A-Z] | "_" | [a-z] //| [\u00C0-\u00D6] | [\u00D8-\u00F6] | [\u00F8-\u02FF] | [\u0370-\u037D] | [\u037F-\u1FFF] | [\u200C-\u200D] | [\u2070-\u218F] | [\u2C00-\u2FEF] | [\u3001-\uD7FF] | [\uF900-\uFDCF] | [\uFDF0-\uFFFD] | [\u10000-\uEFFFF]
NameChar                    {NameStartChar} | "-" | [0-9] //| \u00B7 | [\u0300-\u036F] | [\u203F-\u2040]
Name                        {NameStartChar}{NameChar}*(?!\-)

%x code
%x text
%x brace_attributes
%x brace_value
%x parentheses_attributes
%x value
%x filter

%%

<code>\n                          this.popState(); return 'NEWLINE';
<code>.*                          yytext = yytext.trim(); return 'CODE';

<text>\n                          this.popState(); return 'NEWLINE';
<text>.*                          return 'TEXT';

<brace_attributes>"}"             this.popState(); return 'RIGHT_BRACE';
<brace_attributes>\:{id}          yytext = yytext.substring(1); return 'ATTRIBUTE';
<brace_attributes>[ \t]*"=>"[ \t] this.begin('brace_value'); return 'EQUAL';
<brace_attributes>","[ \t]*       return 'SEPARATOR';
<brace_attributes>[^\}]*          return 'TEXT';

<brace_value>\"(\\.|[^\\"])*\"    this.popState(); return 'STRING';
<brace_value>[^ \t\}]*            this.popState(); return 'ATTRIBUTE_VALUE';

<parentheses_attributes>[ \t]+    return 'SEPARATOR';
<parentheses_attributes>")"       this.popState(); return 'RIGHT_PARENTHESIS';
<parentheses_attributes>{id}      return 'ATTRIBUTE';
<parentheses_attributes>"="       this.begin('value'); return 'EQUAL';

<value>\"(\\.|[^\\"])*\"          this.popState(); return 'STRING';
<value>[^ \t\)]*                  this.popState(); return 'ATTRIBUTE_VALUE';

<filter>\n            yy.indent = 0; this.popState(); return 'NEWLINE';
<filter><<EOF>>       return 'EOF';
<filter>[^\n]*        return 'FILTER_LINE';

\n                    yy.indent = 0; return 'NEWLINE';
<<EOF>>               return 'EOF';
"!!!"                 return 'DOCTYPE';
"  "                  yy.indent += 1; if(yy.indent > yy.filterIndent){this.begin('filter'); }; return 'INDENT';
"("                   this.begin("parentheses_attributes"); return 'LEFT_PARENTHESIS';
"{"                   this.begin("brace_attributes"); return 'LEFT_BRACE';
\:{id}                yy.filterIndent = yy.indent; yytext = yytext.substring(1); return 'FILTER';
\#{Name}              yytext = yytext.substring(1); return 'ID';
\.{Name}              yytext = yytext.substring(1); return 'CLASS';
\%{Name}              yytext = yytext.substring(1); return 'TAG';
"="                   this.begin("code"); return 'EQUAL';
"-"                   this.begin("code"); return 'HYPHEN';
[ \t]+                return 'WHITESPACE';
.*                    return 'TEXT';
