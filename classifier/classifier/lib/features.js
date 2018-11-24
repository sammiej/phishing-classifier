var features = {};

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
 * Returns: 1 if email body contains presence of IP masked containsIPUrls
 *          0 if it doesn't
 */
features.urlContainsIP = function(emailBody) {
  // Modified - https://regexr.com/3e6m0
  // Unrestrictive, any resemblance of urls
  var regexp = /((http(s)?|ftp)?(:\/\/.))?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}(\.|\/)[a-z]{0,6}([-a-zA-Z0-9@:%_\+.~#?$&//=]*)/igm;

  var urls = emailBody.match(regexp);

  if(urls == null) return 0;

  if(check_IPv4(urls)) return 1;
  if(check_IPv6(urls)) return 1;
  return 0;
};

/**
 * [All emails]
 * Counts distinct domain names in extracted URLs in an email
 *
 * Params: body, the body of the email in html
 * Returns: count of distinct domain names present
 */
features.numberOfLinkedToDomain = function (emailBody) {
  var domainSet = new Set();

  var urlList = parseUrls(emailBody);
  if (!urlList) {
    return 0;
  }
  
  for (let url of urlList) {
    let dom = parseDomain(url);
    if (dom) {
      domainSet.add(dom);
    }
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
  var regex = /href=".*?"/g;
  var href = urlElement.match(regex) ? urlElement.match(regex)[0] : null;
  if(href == null) return null;
  return href.replace('href="', '').replace('"', '');
}

/*
 * Helper function to extract link text from urlElement
 *
 * Param: the url element including <a href="">...</a>
 * Returns: the text between the tags, a string
 */
function getLinkText(urlElement) {
  if(urlElement.indexOf('">') < 0) return null;
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
 * Returns: 1 if link texts contains presence of any of keywords
 *          0 if it doesn't
 */
features.keywordPresenceInUrls = function(emailBody) {
  var keywords = ["click", "here", "login", "update", "link"];
  var regexp = /<a[^>]*>([^<]+)<\/a>/igm;
  var linkTags = emailBody.match(regexp);

  if(linkTags == null) return 0;

  var i, j, urlText;
  for(i=0; i<linkTags.length; i++) {
    urlText = getLinkText(linkTags[i]);
    if(!urlText) continue;

    for(j=0; j<keywords.length; j++) {
      if(urlText.toLowerCase().includes(keywords[j])) {
        return 1;
      }
    }
  }
  return 0;
};

/**
 * [HTML emails]
 * All the links (containing a URL-based link text) in an email are checked
 * and if there is a disparity between the link text and the href attribute
 *
 * Params: body, the body of the email in html
 * Returns: 1 if email body contains any disparities between href attribute and link text
 *          0 if it doesn't
 */
features.disparitiesBetweenHrefLinkText = function(emailBody) {
  // <a href="">...</a>
  var regexpLinkTags = /<a[^>]*>([^<]+)<\/a>/igm;
  // Will match up to ex. http://www.test.com
  var regexpUrl = /((http(s)?|ftp)?(:\/\/.))?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}(\.|\/)\b[a-z]{0,6}([-a-zA-Z0-9@:%_\+.~#?$&//=]*)/igm;
  // Strips all subdomains, ex. http://www.dummy.com
  var regexpDomain = /^((http[s]?|ftp):\/\/)?[A-Za-z0-9.:-]+(?!.*\|\w*$)/i;
  // Strips all domain prepends, ex. dummy.com
  var regexpProto = /^((http[s]?|ftp):\/\/)?(www.)?/i;

  var linkTags = emailBody.match(regexpLinkTags);
  if(linkTags == null) return 0;

  var i, url, linkText, urlDomain, href, hrefDomain;
  for(i=0; i<linkTags.length; i++) {
    linkText = getLinkText(linkTags[i]);
    href = getHref(linkTags[i]);
    if(!linkText || !href) continue;

    // Find url in link text
    url = linkText.match(regexpUrl) ? linkText.match(regexpUrl)[0] : null;
    href = href.match(regexpUrl) ? href.match(regexpUrl)[0] : null;
    // If anything is not URL-based, skip
    if(!url || !href) {
      continue;
    }

    // Strip subdomains and protocols/prepends
    urlDomain = url.match(regexpDomain) ? url.match(regexpDomain)[0] : null;
    hrefDomain = href.match(regexpDomain) ? href.match(regexpDomain)[0] : null;
    if(!urlDomain || !hrefDomain) {
      console.error("Unexpected behaviour, probably invalid url: ",
                  urlDomain, " href domain: ",hrefDomain);
      continue;
    }

    urlDomain = urlDomain.replace(regexpProto, '');
    hrefDomain = hrefDomain.replace(regexpProto, '');

    if(urlDomain != hrefDomain) {
      return 1;
    }
  }
  return 0;
};


// finding presence of javascript
features.parseJS = function (email) {
  email = email.toLowerCase();
  return email.includes("</script>") ? 1 : 0;
};
/**
 * Takes in a url and parse out a domain.
 * ex1) www.google.co.in/sadfask/ -> google.co.in
 * ex2) http://user:pass@google.com/?a=b#asdd -> @google.com
 * ex3) https://www.compzets.com?asd=10 ->compzets.com
 * ex4) www.compzets.com?asd=10 -> compzets.com
 * @param url: string
 */
function parseDomain(url) {
  const domainNameRegex = /^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/?\n]+)/g;
  var match = domainNameRegex.exec(url);
  if (match) {
    return match[1];
  }
  console.error("Unexpected url when parsing domain, url: " + url);
  return null;
};
/**
 * Returns maximum number of dots in a string or array of strings.
 * @param str [string] or [Array] of strings
 * @returns {number}
 */
features.countDots = function (str) {
  try {
    if (Array.isArray(str)) {
      let max = 0;
      for (let s of str) {
        let temp = s.split(".").length-1;
        if (temp > max) {
          max = temp;
        }
      }
      return max;
    }
    return str ?  str.split(".").length-1 : 0;
  } catch(e) {
    throw e;
  }
};
/**
 * Given an email with plain text (not <a href="">) urls
 * return a list of plain urls.
 * @param email: string
 * @returns array of url
 */
function parseUrls(email) {
  var regex = /(https?:\/\/[^\s>"]+)|(www\.[^\s>"]+)/g;
  var urlList = email.match(regex);
  for (let i in urlList) {
    urlList[i] = urlList[i].trim();
  }
  return urlList;
};

/**
 * Given an email with href and plaintext links,
 * return a list of domains.
 * @param email: string
 * @returns {Array}
 */
function findDomainList(email) {
  let urlList = parseUrls(email);
  if (!urlList) {
    return [];
  }
  let domainSet = new Set();    
  for (var url of urlList) {
    let dom = parseDomain(url);
    if (dom) {
      domainSet.add(dom);
    }
  }
  return Array.from(domainSet);
};
/**
 * Given a list of domains in email and the senders domain,
 * return the number of times the domains in domain list doesn't
 * match the sender's domain.
 * @param domainList: [string]
 * @param senderDomain: [string]
 * @returns number of mismatched domains
 */
function numOfDomainMisMatchHelper(domainList, senderDomain) {
  let count = 0;
  for(let domain of domainList) {
    if(domain !== senderDomain) {
      count++;
    }
  }
  return count;
};
/**
 * @param sender [string] or [Array] sender's email or emails
 * @param email [string] the raw email body
 * @return number of mismatched domains
 */
features.numOfDomainMisMatch = function(email, sender) {
  if (!sender || sender.length === 0) {
    return 0;
  }
  
  let domainList = findDomainList(email);

  function operate(sender) {
    let senderDomain = parseDomain(sender);
    return numOfDomainMisMatchHelper(domainList, senderDomain);
  }
  
  if (Array.isArray(sender)) {
    let senderDomains = new Set();
    for (let s of sender) {
      let dom = parseDomain(s);
      if (dom) {
        senderDomains.add(dom);
      }
    }
    let iter = senderDomains.entries();
    let num = 0;
    for (let entry of iter) {
      num += operate(entry[0]);
    }
    return num;
  }
  return operate(sender);
};
/**
 * Given a email, return the number of links embedded inside as
 * referenced by 'href="..."'.
 * @param email
 * @returns number of links
 */
features.numOfLinks = function (email) {
  let regex = /href=.*?/gi;
  let result = email.match(regex);
  return result ? result.length : 0;
};
/**
 * Returns boolean for whether an email contains "text/html"
 * to indicate it's a html email.
 * @param email
 * @returns {int} 1 for if email is text/html, 0 otherwise
 */
features.isHtmlEmail = function (email) {
  return email.includes("text/html") ? 1 : 0;
};


/*
 * Calculate the word count and normalisation of the features
 *   of six sets of keywords.
 *
 * Params: Email body (type: string)
 * Returns: Normalisations of six keyword sets.
 */

features.keywordNormalizations = function(emailBody) {
  
  var featureNormalization = new Array(6);

  if(!emailBody)
  {
    console.error("The email body string passed in has no content.");
    
    for (let i=0 ; i < 6 ; i++)
    {
	  featureNormalization[i]=0;
    }
  }
  else
  { 
    var keywords = new Array("update", "confirm", "user", "customer", "client", "suspend", "restrict", "hold", "verify",
    		                 "account", "notif", "login", "username", "password", "click", "log", "SSN", "social security", "secur", "inconvenien");
    
    var counts = new Array(20);
    
    emailBody = emailBody.replace("\n", " ");
    
    // Count the word
    var totalWordCount = 0;
    var words = emailBody.split(" ");
    for (let i=0 ; i < words.length ; i++){
      // inner loop -- do the count
      if (words[i] != "")
        totalWordCount += 1; 
    }
    if (totalWordCount === 0) {
      for (let i=0; i<featureNormalization.length; i++) {
        featureNormalization[i] = 0;
      }
      return featureNormalization;
    }
    
    emailBody = emailBody.toLowerCase();
    
    // Count the keywords
    counts[0] = (emailBody.match(/update/g) || []).length;
    
    counts[1] = (emailBody.match(/confirm/g) || []).length;
    
    counts[2] = (emailBody.match(/user/g) || []).length;
    
    counts[3] = (emailBody.match(/customer/g) || []).length;
    
    counts[4] = (emailBody.match(/client/g) || []).length;
    
    counts[5] = (emailBody.match(/suspend/g) || []).length;
    
    counts[6] = (emailBody.match(/restrict/g) || []).length;
    
    counts[7] = (emailBody.match(/hold/g) || []).length;
    
    counts[8] = (emailBody.match(/verify/g) || []).length;
    
    counts[9] = (emailBody.match(/account/g) || []).length;
    
    counts[10] = (emailBody.match(/notif/g) || []).length;
    
    counts[11] = (emailBody.match(/login/g) || []).length;
    
    counts[12] = (emailBody.match(/username/g) || []).length;
    
    counts[13] = (emailBody.match(/password/g) || []).length;
    
    counts[14] = (emailBody.match(/click/g) || []).length;
    
    counts[15] = (emailBody.match(/log/g) || []).length;
    
    counts[16] = (emailBody.match(/ssn/g) || []).length;
    
    counts[17] = (emailBody.match(/social security/g) || []).length;
    
    counts[18] = (emailBody.match(/secur/g) || []).length;
    
    counts[19] = (emailBody.match(/inconvenien/g) || []).length;
    
    for(let i=0; i < 20; i++){
      counts[i] = counts[i]/totalWordCount;
    }  
    
    // Feature 1: Update; Confirm
    featureNormalization[0] = counts[0] + counts[1];
    
    // Feature 2: User; Customer; Client
    featureNormalization[1] = counts[2] + counts[3] + counts[4];
    
    // Feature 3: Suspend; Restrict; Hold
    featureNormalization[2] = counts[5] + counts[6] + counts[7];
    
    // Feature 4: Verify; Account; Notif
    featureNormalization[3] = counts[8] + counts[9] + counts[10];
    
    // Feature 5: Login; Username; Password; Click; Log
    featureNormalization[4] = counts[11] + counts[12] + counts[13] + counts[14] + counts[15];
    
    // Feature 6: SSN; Social Security; Secur; Inconvenient
    featureNormalization[5] = counts[16] + counts[17] + counts[18] + counts[19];
  }
  
  return featureNormalization;
};

/**
 * Extracts the features from a email and returns the corresponding
 * feature vector of values.
 *
 * @param email object containing body and senders,
 *   body is the email body, and sender is the list of sender emails.
 * @return an object containing: {
 *     featureVect: feature vector for the email, all of which are real numbers.
 *     featureObj: object mapping feature names to value.
 *   }
 *   Returns null if a feature value is not a real number.
 */
features.extract = function(email) {
  let numFeatures = 15;
  let featureObj = {};
  let featureVect = [];

  featureObj.containJS = features.parseJS(email.body);
  featureVect.push(featureObj.containJS);
  
  featureObj.numLinks = features.numOfLinks(email.body);
  featureVect.push(featureObj.numLinks);
  
  featureObj.numDomainMisMatch = features.numOfDomainMisMatch(email.body, email.sender);
  featureVect.push(featureObj.numDomainMisMatch);
  
  featureObj.isHtmlEmail = features.isHtmlEmail(email.body);
  featureVect.push(featureObj.isHtmlEmail);
  
  featureObj.numDotsInSender = features.countDots(email.sender);
  featureVect.push(featureObj.numDotsInSender);  

  featureObj.IPAddrInUrl = features.urlContainsIP(email.body);
  featureVect.push(featureObj.IPAddrInUrl);
  
  featureObj.hasKeywordInLinkText = features.keywordPresenceInUrls(email.body);
  featureVect.push(featureObj.hasKeywordInLinkText);
  
  featureObj.numDistinctDomains = features.numberOfLinkedToDomain(email.body);
  featureVect.push(featureObj.numDistinctDomains);
  
  featureObj.disparitiesHrefAndLinkText = features.disparitiesBetweenHrefLinkText(email.body);
  featureVect.push(featureObj.disparitiesHrefAndLinkText);  

  let normVector = features.keywordNormalizations(email.body);
  for (let i = 0; i < normVector.length; i++) {
    featureObj[`keywordNorm${i}`] = normVector[i];
    featureVect.push(normVector[i]);    
  }

  // Invariant check
  for (let key in featureObj) {
    if (isNaN(featureObj[key])) {
      console.error("Unexpected Error: Output feature incorrect!");
      return null;
    }
  }
  
  return {featureVect, featureObj};
};


if (process.env.NODE_ENV == "test") {
  features = Object.assign(features, {
    parseDomain,
    parseUrls,
    findDomainList,
    numOfDomainMisMatchHelper
  });
  // Export more functions during testing.
  module.exports = features;
}
else {
  // Under normal circumstances only extract is required.
  module.exports = {extract: features.extract};
}
