
const simpleParser = require("mailparser").simpleParser;
const assert = require("assert");

/**
 * @param email raw email.
 * @return Promise that resolves to an object containing sender and body of the email.
 */
function parseEmail(rawEmail) {
  return simpleParser(rawEmail)
    .then(parsed => {
      let split = "\n\n";
      let index = rawEmail.indexOf(split);
      assert(index >= 0);
      let body = rawEmail.substring(index+split.length);
      let sender = [];
      for (let addr of parsed.from.value) {
        if (addr.address) {
          sender.push(addr.address);
        } else {
          if (addr.group &&
              addr.group.length >= 1) {
            for (let gaddr of addr.group) {
              if (gaddr.address) {
                sender.push(gaddr.address);
              }
            }
          }
        }
      }
      return {body, sender};
    })
    .catch(err => {
      let reason = new Error("Error when parsing email");
      reason.stack += `\nCaused By:\n${err.stack}`;
      return reason;
    });
}

module.exports = {parseEmail}
