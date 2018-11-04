var exports = module.exports = {};

/**
 * Helper for detecting IPv4 mask of format #.#.#.# in URLs
 */
function check_IPv4(urls) {
    // Modified - http://regexlib.com/DisplayPatterns.aspx?cattabindex=1&categoryId=2
    var regexp = /((?:2[0-5]{2}|1\d{2}|[1-9]\d|[1-9])\.(?:(?:2[0-5]{2}|1\d{2}|[1-9]\d|\d)\.){2}(?:2[0-5]{2}|1\d{2}|[1-9]\d|\d))(:(\d|[1-9]\d|[1-9]\d{2,3}|[1-5]\d{4}|6[0-4]\d{3}|654\d{2}|655[0-2]\d|6553[0-5]){0,4})?/gm;

    var i;
    for(i=0; i<urls.length; i++) {
        if(regexp.test(urls[i])) return true;
    }

    return false;
}

/**
 * Helper for detecting IPv6 mask of format ex. H:H:H::H in URLs
 */
function check_IPv6(urls) {
    // http://regexlib.com/DisplayPatterns.aspx?cattabindex=1&categoryId=2
    var regexp = /([0-9a-f]{1,4}:){7}([0-9a-f]){1,4}/igm;

    var i;
    for(i=0; i<urls.length; i++) {
        if(regexp.test(urls[i])) return true;
    }

    return false;
}

/**
 * [All emails]
 * Checks URLs in email body and detects whether they are IP masked
 *
 * Params: body, the body of the email in html
 * Returns: true if email body contains presence of IP masked containsIPUrls
 *          false if it doesn't
 */
exports.urlContainsIP = function(emailBody) {
    // Modified - https://regexr.com/3e6m0
    // Unrestrictive, any resemblance of urls
    var regexp = /((http(s)?|ftp)?(:\/\/.))?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}(\.|\/)[a-z]{0,6}([-a-zA-Z0-9@:%_\+.~#?&//=]*)/igm;

    var urls = emailBody.match(regexp);

    if(urls == null) return false;

    if(check_IPv4(urls)) return true;
    if(check_IPv6(urls)) return true;
    return false;
};

/**
 * [All emails]
 * Counts distinct domain names in extracted URLs in an email
 *
 * Params: body, the body of the email in html
 * Returns: count of distinct domain names present
 */
exports.numberOfLinkedToDomain = function (emailBody) {
    var domainSet = new Set();

    // Unrestrictive, finds all urls with /g flag, ex. http://www.dummy.com/phishing
    var regexpUrl = /((http(s)?|ftp)?(:\/\/.))?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}(\.|\/)[a-z]{0,6}([-a-zA-Z0-9@:%_\+.~#?&//=]*)/igm;
    // Strips all subdomains, ex. http://www.dummy.com
    var regexpDomain = /^((http[s]?|ftp):\/\/)?[A-Za-z0-9.:-]+(?!.*\|\w*$)/i;
    // Strips all domain prepends, ex. www.dummy.com
    var regexpProto = /^((http[s]?|ftp):\/\/)?(www.)?/i;

    // Find all matches
    var urls = emailBody.match(regexpUrl);
    if(urls == null) return 0;

    var i, domain, end;
    for(i=0; i<urls.length; i++) {
        urls[i] = urls[i].match(regexpDomain)[0];
        domain = urls[i].replace(regexpProto, '');
        domainSet.add(domain);
    }
    return domainSet.size;
};
