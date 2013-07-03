__buffer.push("<select>");

this.tickets.each(function(ticket) {
  __buffer.push("<option>");
  __buffer.push("" + ticket.name);
  __buffer.push("<option />");
  return void 0;
});

__buffer.push("<select />");
