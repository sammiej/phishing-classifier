const JsIdentifier = {};

// finding presence of javascript
JsIdentifier.parseJS = function (email) {
    email = email.toLowerCase();
    return email.includes("</script>");
};
/**
 * Takes in a url and parse out a domain.
 * ex1) www.google.co.in/sadfask/ -> google.co.in
 * ex2) http://user:pass@google.com/?a=b#asdd -> @google.com
 * ex3) https://www.compzets.com?asd=10 ->compzets.com
 * ex4) www.compzets.com?asd=10 -> compzets.com
 * @param url: string
 */
JsIdentifier.parseDomain = function (url) {
    const domainNameRegex = /^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/?\n]+)/g
    var match = domainNameRegex.exec(url);
    return match[1];

};
/**
 * Identifies the href tag for linking and outputs list of url.
 * I: 'hello <a href="https://www.google.com/?FDsfa=fsfs">text</a>
 * O: ['href="https://www.google.com/?FDsfa=fsfs"']
 * @param email: string that can contain text and html tags and links
 */
JsIdentifier.parseHrefs = function (email) {
    var regex = /href=".*?"/g;
    var hrefList = email.match(regex);
    return hrefList;
};
/**
 * Given input in 'href="..."' format, output the ...
 * component.
 * @param href
 * @returns string
 */
JsIdentifier.parseUrl = function (href) {
    var regex = /".*?"/g;
    var url = regex.exec(href);
    url = url[0].substring(1, url[0].length-1);
    return url;
};
/**
 * Returns number of dots inside a string.
 * @param domain
 * @returns {number}
 */
JsIdentifier.countDots = function (domain) {
    return domain.split(".").length-1;
};
/**
 * Given an email with plain text (not <a href="">) urls
 * return a list of plain urls.
 * @param email: string
 * @returns array of url
 */
// TODO: regex for parsing out text after isnt working
JsIdentifier.parsePlainUrls = function (email) {
    var regex = /([^"]https?:\/\/[^\s]+)|( www\.[^\s]+)/g
    var urlList = email.match(regex);
    for (let i in urlList) {
        urlList[i] = urlList[i].trim();
        urlList[i] = this.plainToHref(urlList[i]);
    }
    return urlList;
};

JsIdentifier.plainToHref = function (plainUrl) {
  return '<a href="' + plainUrl  + '">';
};

/**
 * Given an email with href and plaintext links,
 * return a list of domains.
 * @param email: string
 * @returns {Array}
 */
JsIdentifier.findDomainList = function (email) {
    const urlList = this.parseHrefs(email).concat(this.parsePlainUrls(email));
    var domainList = [];
    for (var u of urlList) {
        var url = this.parseUrl(u);
        domainList.push(this.parseDomain(url));
    }
    return domainList;
};
/**
 * Given a list of domains in email and the senders domain,
 * return the number of times the domains in domain list doesn't
 * match the sender's domain.
 * @param domainList: [string]
 * @param senderDomain: [string]
 * @returns number of mismatched domains
 */
JsIdentifier.numOfDomainMisMatch = function (domainList, senderDomain) {
    let count = 0;
    for(domain of domainList) {
        if(domain !== senderDomain) {
            count++;
        }
    }
    return count;
};
/**
 * Given a email, return the number of links embedded inside as
 * referenced by 'href="..."'.
 * @param email
 * @returns number of links
 */
JsIdentifier.numOfLinks = function (email) {
    let regex = /href=".*?/g;
    return email.match(regex).length;
};
/**
 * Returns boolean for whether an email contains "text/html"
 * to indicate it's a html email.
 * @param email
 * @returns {boolean} true for if email is text/html
 */
JsIdentifier.isHtmlEmail = function (email) {
    return email.includes("text/html");
};

module.exports = {JsIdentifier};
