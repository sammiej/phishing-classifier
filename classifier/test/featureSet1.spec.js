/*jshint esversion: 6*/

const assert = require('assert');
const fs = require('fs');
var features = require('../lib/features/featureSet1.js');

describe('urlContainsIP', function() {
    it('Should return true for urls containing IPv4', () => {
        var emailBody = 'Hello this is not a phishing email I promise https://192.168.0.2:80/phishing';

        assert.equal(features.urlContainsIP(emailBody), true);
    });

    it('Should return true for urls containing IPv6', () => {
        var emailBody = 'Hello this is not a phishing email I promise https://FEDC:BA98:7654:3210:FEDC:BA98:7654:3210/phishing';

        assert.equal(features.urlContainsIP(emailBody), true);
    });

    it('Should return true for multiple urls containing IPv4 or IPv6', () => {
        var emailBody = 'Hello this is not a phishing email I promise ftp://www.dummy.com:8000/index.html\n and https://FEDC:BA98:7654:3210:FEDC:BA98:7654:3210/phishing';

        assert.equal(features.urlContainsIP(emailBody), true);
    });

    it('Should return false for email body without urls', () => {
        var emailBody = 'Hello this is not a phishing email I promise';

        assert.equal(features.urlContainsIP(emailBody), false);
    });

    it('Should return false for urls without IPv4 or IPv6', () => {
        var emailBody = 'Hello this is not a phishing email I promise ftp://www.dummy.com:8000/index.html';

        assert.equal(features.urlContainsIP(emailBody), false);
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
});

describe('keywordPresenceInUrls', function() {
    it('Should return false if no links in email body', () => {
        var emailBody = 'Hello this is not a phishing email I promise';

        assert.equal(features.keywordPresenceInUrls(emailBody), false);
    });

    it('Should return false if link texts in email body do not contain "Click", "Here", "Login", "Update", or "Link"', () => {
        var emailBody = 'Hello this is not a phishing email I promise <a href="">This does not contain keywords</a>';

        assert.equal(features.keywordPresenceInUrls(emailBody), false);
    });

    it('Should return true if link texts in email body contains "Click", "Here", "Login", "Update", or "Link"', () => {
        var emailBody = 'Hello this is not a phishing email I promise <a href="">Click this!!!!</a>';

        assert.equal(features.keywordPresenceInUrls(emailBody), true);
    });

    it('Should return true if link texts in email body contains "Click", "Here", "Login", "Update", or "Link" with typos', () => {
        var emailBody = 'Hello this is not a phishing email I promise <a href="">blahblahLogin here!!!!</a>';

        assert.equal(features.keywordPresenceInUrls(emailBody), true);
    });

    it('Should return true if link texts in email body contains many of "Click", "Here", "Login", "Update", or "Link"', () => {
        var emailBody = 'Hello this is not a phishing email I promise <a href="">CliCk hErE LOgIn uPDAte liNk</a>';

        assert.equal(features.keywordPresenceInUrls(emailBody), true);
    });
});

describe('disparitiesBetweenHrefLinkText', function() {
    it('Should return false if no link tags in email body', () => {
        var emailBody = 'Hello this is not a phishing email I promise';

        assert.equal(features.disparitiesBetweenHrefLinkText(emailBody), false);
    });

    it('Should return false if no urls in link text or no href attribute in link tag', () => {
        var emailBody1 = 'Hello this is not a phishing email I promise';
        var emailBody2 = 'Hello this is not a <a href="">phishing</a> email I promise';

        assert.equal(features.disparitiesBetweenHrefLinkText(emailBody1), false);
        assert.equal(features.disparitiesBetweenHrefLinkText(emailBody2), false);
    });

    it('Should return false if same href attribute domain as link text domain', () => {
        var emailBody1 = 'Check out <a href="https://play.google.com/store/">this link https://play.google.com/store/</a>';
        var emailBody2 = 'Check out <a href="http://play.google.com/store/">this link play.google.com/store/</a>';
        var emailBody3 = 'Check out <a href="ftp://google.com/store/">this link www.google.com/402983409</a>';

        assert.equal(features.disparitiesBetweenHrefLinkText(emailBody1), false);
        assert.equal(features.disparitiesBetweenHrefLinkText(emailBody2), false);
        assert.equal(features.disparitiesBetweenHrefLinkText(emailBody3), false);
    });

    it('Should return true if disparities between href attribute and link text', () => {
        var emailBody1 = 'Check out <a href="https://play.google.com/store/">this link https://phishing.com/store/</a>';
        var emailBody2 = 'Check out <a href="http://play.google.com/store/">this link www.bogus.com/store/</a>';
        var emailBody3 = 'Check out <a href="ftp://google.bogus.com/store/">this link google.com/402983409</a>';

        assert.equal(features.disparitiesBetweenHrefLinkText(emailBody1), true);
        assert.equal(features.disparitiesBetweenHrefLinkText(emailBody2), true);
        assert.equal(features.disparitiesBetweenHrefLinkText(emailBody3), true);
    });

    it('Should not crash', (done) => {
      fs.readFile(__dirname + "/test-phishing-email-0.txt", (err, data) => {
        if (err) {
          done(err);
        }
        else {
          assert.equal(features.disparitiesBetweenHrefLinkText(data.toString()), false);
        done();
        }
      });
    });
});
