const {expect} = require('chai');
const {JsIdentifier} = require("../../email-parser/js-iden.js");

describe("JS Parser", () => {
    it("should detect lower case script tag", () => {
        const scriptLowerCase = "fkdfa <script fdfs sfd = </script>";
        const response = JsIdentifier.parseJS(scriptLowerCase); // true
        expect(response).to.equal(true);
    });
    it("should detect upper case script tag", () => {
        const scriptUpperCase = "fkdfa <SCRIPT fdfs sfd = </SCRIPT>"; // true
        let response = JsIdentifier.parseJS(scriptUpperCase);
        expect(response).to.equal(true);
    });
    it("should not interpret 'script' alone as js", () => {
        const scriptRandom = "ffjdsaf = fdsaf / fdsaf SCRIPT"; // false
        let response = JsIdentifier.parseJS(scriptRandom);
        expect(response).to.equal(false);
    });
    it("should not interpret incompleted script tag as js", () => {
        const scriptIncomplete= "fkjdsfa = fdsf </SCRIPT faf"; // false
        const scriptFirstOnly = "fdsfafd <ScrIPt fdfasfd"; // false
        let response1 = JsIdentifier.parseJS(scriptIncomplete);
        let response2 = JsIdentifier.parseJS(scriptFirstOnly);
        expect(response1).to.equal(false);
        expect(response2).to.equal(false);
    });
    it("should detect just the end script tag", () => {
        const scriptLastOnly = "fdsfafd </script>"; // true
        let response = JsIdentifier.parseJS(scriptLastOnly);
        expect(response).to.equal(true);
    });

});

describe("Domain Parser", () => {
    it("should get domains from links that start with http://", () => {
        const httpLink = "http://user:pass@google.com/?a=b#asdd";
        const actualHttpLink = "google.com";
        let response = JsIdentifier.parseDomain(httpLink);
        expect(response).to.equal(actualHttpLink);
    });
    it("should get domains from links that start with https://", () => {
        const httpsLink = "https://www.compzets.com?asd=10";
        const acutalHttpsLink = "compzets.com";
        let response = JsIdentifier.parseDomain(httpsLink);
        expect(response).to.equal(acutalHttpsLink);
    });
    it("should get domains from links that start with www.", () => {
        const wwwLink = "www.google.co.in/sadfask/";
        const actualwwwLink = "google.co.in";
        let response = JsIdentifier.parseDomain(wwwLink);
        expect(response).to.equal(actualwwwLink);
    });
    it("should get domains from emails", () => {
        const emailAddress = "happydoggog@gmail.com";
        const actual = "gmail.com";
        let response = JsIdentifier.parseDomain(emailAddress);
        expect(response).to.equal(actual);
    });
});

describe("Href Parser", () => {
   it("should parse a list of urls out of '<a href='", () => {
       const email = 'fake email with http://text.base.url and https://www.text.base.url' +
           'and <a href="www.links.com">test</a>' +
           'with different formats such as ' +
           '<a href="www.formatwithapppend.ca?dsd=fdsad/gsda">test</a>' +
           'and <a href="http://based.io">test</a>';
       let response = JsIdentifier.parseHrefs(email);
       let hrefList =  [
           'href="www.links.com"',
           'href="www.formatwithapppend.ca?dsd=fdsad/gsda"',
           'href="http://based.io"'
       ];
       expect(response).to.deep.equal(hrefList);
       expect(response).to.deep.contains(hrefList[0]);
       expect(response.length).to.equal(3);
   });

   it("should parse the urls out even if href is not the first element in the tag", () => {
       const email = '<a title="Resolve" class="aapl-link" style="TEXT-DECORATION: none; FONT-WEIGHT: bold; COLOR: #ffffff; TEXT-ALIGN: center; LETTER-SPACING: normal; LINE-HEIGHT: 100%" href="http://ow.ly/KahG30mqCQX" target="_blank"><font style="FONT-SIZE: 0px; COLOR: transparent; DISPLAY: inline">8sy</font>Verify your Account</a>';
       let response = JsIdentifier.parseHrefs(email);
       let hrefList = ['href="http://ow.ly/KahG30mqCQX"'];
       expect(response).to.deep.equal(hrefList);
       expect(response.length).to.equal(1);
   });

});

describe("Url Parser", () => {
   it("should parse a url out of a href tag", () =>{
       const href = '<a href="www.formatwithapppend.ca?dsd=fdsad/gsda">';
       let response = JsIdentifier.parseUrl(href);
       let actual = "www.formatwithapppend.ca?dsd=fdsad/gsda";
       expect(response).to.deep.equal(actual);
   });

   it("should parse a url out of href tag with href not being the first element", () => {
       const href = '<a title="Resolve" class="aapl-link" style="TEXT-DECORATION: none; FONT-WEIGHT: bold; COLOR: #ffffff; TEXT-ALIGN: center; LETTER-SPACING: normal; LINE-HEIGHT: 100%" href="http://ow.ly/KahG30mqCQX" target="_blank"><font style="FONT-SIZE: 0px; COLOR: transparent; DISPLAY: inline">';
       let response = JsIdentifier.parseUrl(href);
       let actual = "ow.ly";
       expect(response).to.equal(actual);
   });
});

describe("Dots Parser", () => {
    it("should return the number of dots inside domain", () =>{
        const oneDot = "google.co";
        const twoDots = "google.co.in";
        const fiveDots = "vase.io.hp.sth.co.ix";
        let responseOne = JsIdentifier.countDots(oneDot);
        let responseTwo = JsIdentifier.countDots(twoDots);
        let responseFive = JsIdentifier.countDots(fiveDots);
        expect(responseOne).to.equal(1);
        expect(responseTwo).to.equal(2);
        expect(responseFive).to.equal(5);
    });
});

describe("Plain Url Parser", () => {
   it("should return a list of plaintext url with href appended from an email", () => {
       const email = 'fake email with http://text.base.url/fdsf and https://www.dsadb.f.url?f www.sthsth.com and <a href="www.links.com">test</a>';
       let urlList = [
           '<a href="http://text.base.url/fdsf">',
           '<a href="https://www.dsadb.f.url?f">',
           '<a href="www.sthsth.com">',
       ];
       let response = JsIdentifier.parsePlainUrls(email);
       expect(response).to.deep.equal(urlList);
   });
});

describe("Find Domain List", () => {
   it("should find a list of domains from an email", () => {
       const email = 'fake email with http://text.base.url and https://www.dsadb.f.url' +
           'and <a href="www.links.com">test</a>' +
           'with different formats such as ' +
           '<a href="www.formatwithapppend.ca?dsd=fdsad/gsda">test</a>' +
           'and <a href="http://based.io">test</a>' +
           'and <a href="https://basedsdd.ca">test</a>' +
           'and <a href="https://www.324-fdsfa.dd.ca">test</a>';
       let domainList = [
           "text.base.url",
           "www.dsadb.f.url",
           "links.com",
           "formatwithapppend.ca",
           "based.io",
           "basedsdd.ca",
           "324-fdsfa.dd.ca"
       ];
       let response = JsIdentifier.findDomainList(email);
       expect(response).to.include("formatwithapppend.ca");
       expect(response.length).to.equal(7);
   });
});

describe("numOfDomainMisMatch", () => {
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
        let response = JsIdentifier.numOfDomainMisMatch(domainList, senderDomain);
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
        let response = JsIdentifier.numOfLinks(email);
        expect(response).to.equal(5);
    });

    it("href not the first element in <a ...> tag should still find link correctly", () => {
        const email = '<a title="Resolve" class="aapl-link" style="TEXT-DECORATION: none; FONT-WEIGHT: bold; COLOR: #ffffff; TEXT-ALIGN: center; LETTER-SPACING: normal; LINE-HEIGHT: 100%" href="http://ow.ly/KahG30mqCQX" target="_blank"><font style="FONT-SIZE: 0px; COLOR: transparent; DISPLAY: inline">';
        let response = JsIdentifier.numOfLinks(email);
        expect(response).to.equal(1);
    });
});

describe("isHtmlEmail", () => {
    it("should return true if email is html", () => {
       const htmlMail = '<meta http-equiv="Content-Type" content="text/html; charset=Windows-1252"><';
       const plainMail = '<meta http-equiv="Content-Type" content="text/plain; charset=Windows-1252"><';
       let tResponse = JsIdentifier.isHtmlEmail(htmlMail);
       let fResponse = JsIdentifier.isHtmlEmail(plainMail);
       expect(tResponse).to.equal(true);
       expect(fResponse).to.equal(false);
    });
});
