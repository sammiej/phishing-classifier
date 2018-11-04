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
    var regexp = /((http(s)?|ftp)?(:\/\/.))?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}(\.|\/)[a-z]{0,6}([-a-zA-Z0-9@:%_\+.~#?$&//=]*)/igm;

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
    var regexpUrl = /((http(s)?|ftp)?(:\/\/.))?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}(\.|\/)\b[a-z]{0,6}([-a-zA-Z0-9@:%_\+.~#?$&//=]*)/igm;
    // Strips all subdomains, ex. http://www.dummy.com
    var regexpDomain = /^((http[s]?|ftp):\/\/)?[A-Za-z0-9.:-]+(?!.*\|\w*$)/i;
    // Strips all domain prepends, ex. dummy.com
    var regexpProto = /^((http[s]?|ftp):\/\/)?(www.)?/i;

    // Find all matches
    var urls = emailBody.match(regexpUrl);
    if(urls == null) return 0;

    var i, domain;
    for(i=0; i<urls.length; i++) {
        urls[i] = urls[i].match(regexpDomain)[0];
        domain = urls[i].replace(regexpProto, '');
        domainSet.add(domain);
    }
    return domainSet.size;
};

/*
 * Helper function to extract href attribute from urlElement
 *
 * Param: the url element including <a href="">...</a>
 * Returns: the href attribute, a string
 */
function getHref(urlElement) {
    if(urlElement.indexOf('"') < 0) return false;
    urlElement = urlElement.replace('<a href="', '');
    if(urlElement.indexOf('"') < 0) return false;

    var end = urlElement.indexOf('"');
    return urlElement.substring(0, end);
}

 /*
  * Helper function to extract link text from urlElement
  *
  * Param: the url element including <a href="">...</a>
  * Returns: the text between the tags, a string
  */
function getLinkText(urlElement) {
    if(urlElement.indexOf('">') < 0) return false;
    var start = urlElement.indexOf('">') + 2;
    var end = urlElement.indexOf('</a>');

    return urlElement.substring(start, end);
}

/**
 * [HTML emails]
 * Checks URL text in email body and detects presence of the words "Click",
 *      "Here", "Login", "Update", "Link"
 *
 * Params: body, the body of the email in html
 * Returns: true if link texts contains presence of any of keywords
 *          false if it doesn't
 */
 exports.keywordPresenceInUrls = function(emailBody) {
     var keywords = ["click", "here", "login", "update", "link"];
     var regexp = /<a[^>]*>([^<]+)<\/a>/igm;
     var linkTags = emailBody.match(regexp);

     if(linkTags == null) return false;

     var i, j, urlText;
     for(i=0; i<linkTags.length; i++) {
         urlText = getLinkText(linkTags[i]);
         if(!urlText) continue;

         for(j=0; j<keywords.length; j++) {
             if(urlText.toLowerCase().includes(keywords[j])) {
                 return true;
             }
         }
     }
     return false;
 };

 /**
  * [HTML emails]
  * All the links (containing a URL-based link text) in an email are checked
  * and if there is a disparity between the link text and the href attribute
  *
  * Params: body, the body of the email in html
  * Returns: true if email body contains any disparities between href attribute and link text
  *          false if it doesn't
  */
 exports.disparitiesBetweenHrefLinkText = function(emailBody) {
     // <a href="">...</a>
     var regexpLinkTags = /<a[^>]*>([^<]+)<\/a>/igm;
     // Will match up to ex. http://www.test.com
     var regexpUrl = /((http(s)?|ftp)?(:\/\/.))?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}(\.|\/)\b[a-z]{0,6}([-a-zA-Z0-9@:%_\+.~#?$&//=]*)/igm;
     // Strips all subdomains, ex. http://www.dummy.com
     var regexpDomain = /^((http[s]?|ftp):\/\/)?[A-Za-z0-9.:-]+(?!.*\|\w*$)/i;
     // Strips all domain prepends, ex. dummy.com
     var regexpProto = /^((http[s]?|ftp):\/\/)?(www.)?/i;

     var linkTags = emailBody.match(regexpLinkTags);
     if(linkTags == null) return false;

     var i, url, linkText, urlDomain, href, hrefDomain;
     for(i=0; i<linkTags.length; i++) {
         linkText = getLinkText(linkTags[i]);
         href = getHref(linkTags[i]);
         if(!linkText || !href) continue;

         // Find url in link text
         url = linkText.match(regexpUrl)[0];
         href = href.match(regexpUrl)[0];
         // If anything is not URL-based, skip
         if(!url || !href) {
             console.log(url + " " + href);
             continue;
         }

         // Strip subdomains and protocols/prepends
         urlDomain = url.match(regexpDomain)[0].replace(regexpProto, '');
         hrefDomain = href.match(regexpDomain)[0].replace(regexpProto, '');

         if(urlDomain != hrefDomain) {
             console.log(urlDomain);
             console.log(hrefDomain);
             return true;
         }
     }
     return false;
 };
