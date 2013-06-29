id                          [a-zA-Z][-a-zA-Z0-9]*

%x code
%x text
%x brace_attributes
%x parentheses_attributes
%x value
%x filter

%%

<code>\n              {
                        this.popState();
                        return 'NEWLINE';
                      }
<code>.*              return 'CODE';

<text>\n              {
                        this.popState();
                        return 'NEWLINE';
                      }
<text>.*              return 'TEXT';

<brace_attributes>"}"           {
                                  this.popState();
                                  return 'RIGHT_BRACE';
                                }
<brace_attributes>[^\}]*        return 'TEXT';

<parentheses_attributes>[ \t]+    return 'WHITESPACE';
<parentheses_attributes>")"       {
                                    this.popState();
                                    return 'RIGHT_PARENTHESIS';
                                  }
<parentheses_attributes>{id}      return 'ATTRIBUTE';
<parentheses_attributes>"="       this.begin('value'); return 'EQUAL';

<value>\"(\\.|[^\\"])*\"     this.popState(); return 'STRING';
<value>[^ \t\)]*             this.popState(); return 'ATTRIBUTE_VALUE';

<filter>"  "          return 'INDENT';
<filter>\n            return 'NEWLINE';
<filter><<EOF>>       return 'EOF';
<filter>[^\n]*        return 'FILTER_LINE';

\n                    return 'NEWLINE';
<<EOF>>               return 'EOF';
"!!!"                 return 'DOCTYPE';
"  "                  return 'INDENT';
"-"                   return 'HYPHEN';
"("                   return 'LEFT_PARENTHESIS';
")"                   return 'RIGHT_PARENTHESIS';
"{"                   return 'LEFT_BRACE';
"}"                   return 'RIGHT_BRACE';
"%"                   return 'PERCENT';
"#"                   return 'OCTOTHORPE';
"."                   return 'PERIOD';
"="                   return 'EQUAL';
\:{id}                return 'FILTER';
{id}                  return 'ALPHABETICAL';
[ \t]+                return 'WHITESPACE';
.*                    return 'REST';
