/*jshint esversion: 6*/
const {expect} = require('chai');
const assert = require('assert');
const features = require("../lib/features.js");
const fs = require('fs');

describe("JS Parser", () => {
  it("should detect lower case script tag", () => {
    const scriptLowerCase = "fkdfa <script fdfs sfd = </script>";
    const response = features.parseJS(scriptLowerCase); // true
    expect(response).to.equal(1);
  });
  it("should detect upper case script tag", () => {
    const scriptUpperCase = "fkdfa <SCRIPT fdfs sfd = </SCRIPT>"; // true
    let response = features.parseJS(scriptUpperCase);
    expect(response).to.equal(1);
  });
  it("should not interpret 'script' alone as js", () => {
    const scriptRandom = "ffjdsaf = fdsaf / fdsaf SCRIPT"; // false
    let response = features.parseJS(scriptRandom);
    expect(response).to.equal(0);
  });
  it("should not interpret incompleted script tag as js", () => {
    const scriptIncomplete= "fkjdsfa = fdsf </SCRIPT faf"; // false
    const scriptFirstOnly = "fdsfafd <ScrIPt fdfasfd"; // false
    let response1 = features.parseJS(scriptIncomplete);
    let response2 = features.parseJS(scriptFirstOnly);
    expect(response1).to.equal(0);
    expect(response2).to.equal(0);
  });
  it("should detect just the end script tag", () => {
    const scriptLastOnly = "fdsfafd </script>"; // true
    let response = features.parseJS(scriptLastOnly);
    expect(response).to.equal(1);
  });

});

describe("Dots Parser", () => {
  it("should return the number of dots inside domain", () =>{
    const oneDot = "google.co";
    const twoDots = "google.co.in";
    const fiveDots = "vase.io.hp.sth.co.ix";
    let responseOne = features.countDots(oneDot);
    let responseTwo = features.countDots(twoDots);
    let responseFive = features.countDots(fiveDots);
    expect(responseOne).to.equal(1);
    expect(responseTwo).to.equal(2);
    expect(responseFive).to.equal(5);
  });
});

describe("numOfDomainMisMatch", () => {
  describe("Domain Parser", () => {
    it("should get domains from links that start with http://", () => {
      const httpLink = "http://user:pass@google.com/?a=b#asdd";
      const actualHttpLink = "google.com";
      let response = features.parseDomain(httpLink);
      expect(response).to.equal(actualHttpLink);
    });
    it("should get domains from links that start with https://", () => {
      const httpsLink = "https://www.compzets.com?asd=10";
      const acutalHttpsLink = "compzets.com";
      let response = features.parseDomain(httpsLink);
      expect(response).to.equal(acutalHttpsLink);
    });
    it("should get domains from links that start with www.", () => {
      const wwwLink = "www.google.co.in/sadfask/";
      const actualwwwLink = "google.co.in";
      let response = features.parseDomain(wwwLink);
      expect(response).to.equal(actualwwwLink);
    });
    it("should get domains from emails", () => {
      const emailAddress = "happydoggog@gmail.com";
      const actual = "gmail.com";
      let response = features.parseDomain(emailAddress);
      expect(response).to.equal(actual);
    });
  });
  
  describe("Parse Urls", () => {
    it("should return a list of plaintext url with href appended from an email", () => {
      const email = 'fake email with http://text.base.url/fdsf and https://www.dsadb.f.url?f www.sthsth.com and <a href="www.links.com">test</a>';
      let urlList = [
        'http://text.base.url/fdsf',
        'https://www.dsadb.f.url?f',
        'www.sthsth.com',
        'www.links.com'
      ];
      let response = features.parseUrls(email);
      expect(response).to.deep.equal(urlList);
    });

    it("should parse a list of urls out of '<a href='", () => {
      const email = 'fake email with http://text.base.url and https://www.text.base.url ' +
            'and <a href="www.links.com">test</a>' +
            'with different formats such as ' +
            '<a href="www.formatwithapppend.ca?dsd=fdsad/gsda">test</a>' +
            'and <a href="http://based.io">test</a>';
      let response = features.parseUrls(email);
      let hrefList =  [
        'http://text.base.url',
        'https://www.text.base.url',
        'www.links.com',
        'www.formatwithapppend.ca?dsd=fdsad/gsda',
        'http://based.io',
      ];
      expect(response).to.deep.equal(hrefList);
      expect(response.length).to.equal(5);
    });

    it("should parse the urls out even if href is not the first element in the tag", () => {
      const email = '<a title="Resolve" class="aapl-link" style="TEXT-DECORATION: none; FONT-WEIGHT: bold; COLOR: #ffffff; TEXT-ALIGN: center; LETTER-SPACING: normal; LINE-HEIGHT: 100%" href="http://ow.ly/KahG30mqCQX" target="_blank"><font style="FONT-SIZE: 0px; COLOR: transparent; DISPLAY: inline">8sy</font>Verify your Account</a>';
      let response = features.parseUrls(email);
      let hrefList = ['http://ow.ly/KahG30mqCQX'];
      expect(response).to.deep.equal(hrefList);
      expect(response.length).to.equal(1);
    });
    
  });
  
  describe("Find Domain List", () => {
    it("find domain list in email with no url", () => {
      const email = "Honey apple pie";
      let response = features.findDomainList(email);
      expect(response.length).to.equal(0);
    });
    it("should find a list of domains from an email", () => {
      const email = 'fake email with http://text.base.url and https://www.dsadb.f.url' +
            ' and <a href="www.links.com">test</a>' +
            ' with different formats such as ' +
            ' <a href="www.formatwithapppend.ca?dsd=fdsad/gsda">test</a>' +
            ' and <a href="http://based.io">test</a>' +
            ' and <a href="https://basedsdd.ca">test</a>' +
            ' and <a href="https://www.324-fdsfa.dd.ca">test</a>';
      let domainList = [
        "text.base.url",
        "www.dsadb.f.url",
        "links.com",
        "formatwithapppend.ca",
        "based.io",
        "basedsdd.ca",
        "324-fdsfa.dd.ca"
      ];
      let response = features.findDomainList(email);
      expect(response).to.include("formatwithapppend.ca");
      expect(response.length).to.equal(7);
    });
  });
  it("should return the number of mismatched domains", () => {
    let domainList = [
      "text.base.url",
      "www.dsadb.f.url",
      "links.com",
      "formatwithapppend.ca",
      "based.io",
      "basedsdd.ca",
      "324-fdsfa.dd.ca"
    ];
    let senderDomain = "based.io";
    let response = features.numOfDomainMisMatchHelper(domainList, senderDomain);
    expect(response).to.equal(6);
  });
});

describe("numOfLinks", () => {
  it("should return the number of links in the email", () => {
    const email = 'fake email with http://text.base.url and https://www.dsadb.f.url' +
          'and <a href="www.links.com">test</a>' +
          'with different formats such as ' +
          '<a href="www.formatwithapppend.ca?dsd=fdsad/gsda">test</a>' +
          'and <a href="http://based.io">test</a>' +
          'and <a href="https://basedsdd.ca">test</a>' +
          'and <a href="https://www.324-fdsfa.dd.ca">test</a>';
    let response = features.numOfLinks(email);
    expect(response).to.equal(5);
  });

  it("href not the first element in <a ...> tag should still find link correctly", () => {
    const email = '<a title="Resolve" class="aapl-link" style="TEXT-DECORATION: none; FONT-WEIGHT: bold; COLOR: #ffffff; TEXT-ALIGN: center; LETTER-SPACING: normal; LINE-HEIGHT: 100%" href="http://ow.ly/KahG30mqCQX" target="_blank"><font style="FONT-SIZE: 0px; COLOR: transparent; DISPLAY: inline">';
    let response = features.numOfLinks(email);
    expect(response).to.equal(1);
  });

  it("No links should return 0", () => {
    const email = "abc and 123";
    let response = features.numOfLinks(email);
    expect(response).to.equal(0);
  });
});

describe("isHtmlEmail", () => {
  it("should return 1 if email is html, otherwise 0", () => {
    const htmlMail = '<meta http-equiv="Content-Type" content="text/html; charset=Windows-1252"><';
    const plainMail = '<meta http-equiv="Content-Type" content="text/plain; charset=Windows-1252"><';
    let tResponse = features.isHtmlEmail(htmlMail);
    let fResponse = features.isHtmlEmail(plainMail);
    expect(tResponse).to.equal(1);
    expect(fResponse).to.equal(0);
  });
});

describe('urlContainsIP', function() {
  it('Should return 1 for urls containing IPv4', () => {
    var emailBody = 'Hello this is not a phishing email I promise https://192.168.0.2:80/phishing';

    assert.equal(features.urlContainsIP(emailBody), 1);
  });

  it('Should return 1 for urls containing IPv6', () => {
    var emailBody = 'Hello this is not a phishing email I promise https://FEDC:BA98:7654:3210:FEDC:BA98:7654:3210/phishing';

    assert.equal(features.urlContainsIP(emailBody), 1);
  });

  it('Should return 1 for multiple urls containing IPv4 or IPv6', () => {
    var emailBody = 'Hello this is not a phishing email I promise ftp://www.dummy.com:8000/index.html\n and https://FEDC:BA98:7654:3210:FEDC:BA98:7654:3210/phishing';

    assert.equal(features.urlContainsIP(emailBody), 1);
  });

  it('Should return 0 for email body without urls', () => {
    var emailBody = 'Hello this is not a phishing email I promise';

    assert.equal(features.urlContainsIP(emailBody), 0);
  });

  it('Should return 0 for urls without IPv4 or IPv6', () => {
    var emailBody = 'Hello this is not a phishing email I promise ftp://www.dummy.com:8000/index.html';

    assert.equal(features.urlContainsIP(emailBody), 0);
  });
});

describe('numberofLinkedToDomain', function() {
  it('Should return 0 for no links', () => {
    var emailBody = 'Hello this is not a phishing email I promise';

    assert.equal(features.numberOfLinkedToDomain(emailBody), 0);
  });

  it('Should return 1 for one distinct domain', () => {
    var emailBody = 'Hello this is not a phishing email I promise ftp://www.dummy.com:8000/index.html';

    assert.equal(features.numberOfLinkedToDomain(emailBody), 1);
  });

  it('Should return 2 for two distinct domains', () => {
    var emailBody = 'Hello this is not a phishing email I promise https://dummy.com/phishing, ftp://www.someotherdomain.com/phishing';

    assert.equal(features.numberOfLinkedToDomain(emailBody), 2);
  });

  it('Should return 2 for two distinct domains and more than two links', () => {
    var emailBody = 'Hello this is not a phishing email I promise https://dummy.com/phishing, http://www.dummy.com/c=$3phishing, https://someotherdomain.com/phishing';

    assert.equal(features.numberOfLinkedToDomain(emailBody), 2);
  });

  it('Should not include email domains, and other artifacts', () => {
    var emailBody = '<meta http-equiv="ContentType" content="text/html; charset=utf-8"><br>Dear somebody@hotmail.com</br><img id="009" src="cid:0909@phpmailer.0">';
    assert.equal(features.numberOfLinkedToDomain(emailBody), 0);
  });

  it('Email with a lot of numbers wrong regex will overcount', (done) => {
    fs.readFile(__dirname + "/test-ham-email-body-0.txt", (err, data) => {
      if (err) {
        done(err);
      }
      else {
        assert.equal(features.numberOfLinkedToDomain(data.toString()), 3);
        done();
      }
    });
    
  });
});

describe('keywordPresenceInUrls', function() {
  it('Should return 0 if no links in email body', () => {
    var emailBody = 'Hello this is not a phishing email I promise';

    assert.equal(features.keywordPresenceInUrls(emailBody), 0);
  });

  it('Should return 0 if link texts in email body do not contain "Click", "Here", "Login", "Update", or "Link"', () => {
    var emailBody = 'Hello this is not a phishing email I promise <a href="">This does not contain keywords</a>';

    assert.equal(features.keywordPresenceInUrls(emailBody), 0);
  });

  it('Should return 1 if link texts in email body contains "Click", "Here", "Login", "Update", or "Link"', () => {
    var emailBody = 'Hello this is not a phishing email I promise <a href="">Click this!!!!</a>';

    assert.equal(features.keywordPresenceInUrls(emailBody), 1);
  });

  it('Should return 1 if link texts in email body contains "Click", "Here", "Login", "Update", or "Link" with typos', () => {
    var emailBody = 'Hello this is not a phishing email I promise <a href="">blahblahLogin here!!!!</a>';

    assert.equal(features.keywordPresenceInUrls(emailBody), 1);
  });

  it('Should return 1 if link texts in email body contains many of "Click", "Here", "Login", "Update", or "Link"', () => {
    var emailBody = 'Hello this is not a phishing email I promise <a href="">CliCk hErE LOgIn uPDAte liNk</a>';

    assert.equal(features.keywordPresenceInUrls(emailBody), 1);
  });
});

describe('disparitiesBetweenHrefLinkText', function() {
  it('Should return 0 if no link tags in email body', () => {
    var emailBody = 'Hello this is not a phishing email I promise';

    assert.equal(features.disparitiesBetweenHrefLinkText(emailBody), 0);
  });

  it('Should return 0 if no urls in link text or no href attribute in link tag', () => {
    var emailBody1 = 'Hello this is not a phishing email I promise';
    var emailBody2 = 'Hello this is not a <a href="">phishing</a> email I promise';

    assert.equal(features.disparitiesBetweenHrefLinkText(emailBody1), 0);
    assert.equal(features.disparitiesBetweenHrefLinkText(emailBody2), 0);
  });

  it('Should return 0 if same href attribute domain as link text domain', () => {
    var emailBody1 = 'Check out <a href="https://play.google.com/store/">this link https://play.google.com/store/</a>';
    var emailBody2 = 'Check out <a href="http://play.google.com/store/">this link play.google.com/store/</a>';
    var emailBody3 = 'Check out <a href="ftp://google.com/store/">this link www.google.com/402983409</a>';

    assert.equal(features.disparitiesBetweenHrefLinkText(emailBody1), 0);
    assert.equal(features.disparitiesBetweenHrefLinkText(emailBody2), 0);
    assert.equal(features.disparitiesBetweenHrefLinkText(emailBody3), 0);
  });

  it('Should return 1 if disparities between href attribute and link text', () => {
    var emailBody1 = 'Check out <a href="https://play.google.com/store/">this link https://phishing.com/store/</a>';
    var emailBody2 = 'Check out <a href="http://play.google.com/store/">this link www.bogus.com/store/</a>';
    var emailBody3 = 'Check out <a href="ftp://google.bogus.com/store/">this link google.com/402983409</a>';

    assert.equal(features.disparitiesBetweenHrefLinkText(emailBody1), 1);
    assert.equal(features.disparitiesBetweenHrefLinkText(emailBody2), 1);
    assert.equal(features.disparitiesBetweenHrefLinkText(emailBody3), 1);
  });

  it('Should return 0 if same href attribute domain as link text domain and href is not first in <a> tag', () => {
    var emailBody1 = 'Hello this is not a phishing email I promise';
    var emailBody2 = 'Hello this is not a <a title="Resolve" class="aapl-link" style="TEXT-DECORATION: none; FONT-WEIGHT: bold; COLOR: #ffffff; TEXT-ALIGN: center; LETTER-SPACING: normal; LINE-HEIGHT: 100%" href="http://ow.ly/KahG30mqCQX" target="_blank"><font style="FONT-SIZE: 0px; COLOR: transparent; DISPLAY: inline">http://ow.ly/KahG30mqCQX</font> Verify your Account</a> email I promise';

    assert.equal(features.disparitiesBetweenHrefLinkText(emailBody1), 0);
    assert.equal(features.disparitiesBetweenHrefLinkText(emailBody2), 0);
  });

  it('Should not crash', (done) => {
    fs.readFile(__dirname + "/test-phishing-email-0.txt", (err, data) => {
      if (err) {
        done(err);
      }
      else {
        assert.equal(features.disparitiesBetweenHrefLinkText(data.toString()), 0);
        done();
      }
    });
  });
});

describe('keywordNormalizations Test', function() {
  var emailBody = "This is confirmation request email to update your account's username and password.\n Please click on the link, login and update as soon as possible by verifying your identification.\n If you don't click, our customer/client service representatives will suspend or restrict your account without notifying you!!\n Remember, we are controlling your account' username and password. If you don't want us to suspend your account, provide us with your SSN (social security number) as well.\n To do that, please log in into your account.\n However, you still need to confirm that you authorize us to hold your hands.\n Sorry for any inconvenience, but it will make you more secure in this world. Although it is inconvenient, please provide us with your confirmation!!! We will update your information without sending you any notification.\n Further more, we won't hold your hands anymore, because you don't confirm it.\n\n";
  
  it('Should return the normalization for feature (1)', function () {
    assert.equal(features.keywordNormalizations(emailBody)[0], 7/143);
  });
  
  it('Should return the normalization for feature (2)', function () {
    assert.equal(features.keywordNormalizations(emailBody)[1], 4/143);
  });
  
  it('Should return the normalization for feature (3)', function () {
    assert.equal(features.keywordNormalizations(emailBody)[2], 5/143);
  });
  
  it('Should return the normalization for feature (4)', function () {
    assert.equal(features.keywordNormalizations(emailBody)[3], 8/143);
  });
  
  it('Should return the normalization for feature (5)', function () {
    assert.equal(features.keywordNormalizations(emailBody)[4], 9/143);
  });
  
  it('Should return the normalization for feature (6)', function () {
    assert.equal(features.keywordNormalizations(emailBody)[5], 6/143);
  });

});
