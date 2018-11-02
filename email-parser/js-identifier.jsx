export default class JsIdentifier {

    // finding presence of javascript
    parseJS(email) {
        email = email.toLowerCase();
        return email.includes("<///script>");
    }
    // number of dots in domain name
    parseDots(domain) {
        return domain.split(".").length-1;
    }
    // domain comes from message items()[0].from[0].email;
    // extract domain names from email
    // TODO:
    extractDomainNames(email) {
        var domains = [];
        let curr = email.indexOf("mailto:");
        while(true) {
            if (curr === -1) return domains;
            else {
                curr+=8;
                if(email.get(curr) === null) return domains;
                else {
                    email = email.substr(curr);
                    var mailingAddr = email.substr(0, email.indexOf('"'));
                    domains.push(mailingAddr);
                    curr = email.indexOf("mailto:");
                }
            }
        }
    }
    // compare domain name from sender v.s. domain names in email
    compareDomains(sender, emails) {
        let count = 0;
        for (let e of emails) {
            if (e !== sender)
                count++;
        }
        return count/emails.length;
    }
    // count number of links
    numLinks(email) {
        let count = 0;
        let curr = email.indexOf("http");
        while(true) {
            if (curr === -1) return count;
            else {
                count++;
                curr += 5;
                if (email.get(curr) === null) return count;
                else {
                    email.substr(curr);
                    curr = email.indexOf("http");
                }
            }
        }
    }
    // html email
    isHTMLemail(email) {
        email = email.toLowerCase();
        return email.contains("html");
    }





}