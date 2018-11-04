/*jshint esversion: 6*/

const assert = require('assert');
var features = require('../urlContainsIP.js');

describe('urlContainsIP', function() {
    it('Should return true for urls containing IPv4', () => {
        var emailBody = "Hello this is not a phishing email I promise https://192.168.0.2:80/phishing";

        assert.equal(features.urlContainsIP(emailBody), true);
    });

    it('Should return true for urls containing IPv6', () => {
        var emailBody = "Hello this is not a phishing email I promise https://FEDC:BA98:7654:3210:FEDC:BA98:7654:3210/phishing";

        assert.equal(features.urlContainsIP(emailBody), true);
    });

    it('Should return true for multiple urls containing IPv4 or IPv6', () => {
        var emailBody = "Hello this is not a phishing email I promise ftp://www.dummy.com:8000/index.html\n and https://FEDC:BA98:7654:3210:FEDC:BA98:7654:3210/phishing";

        assert.equal(features.urlContainsIP(emailBody), true);
    });

    it('Should return false for email body without urls', () => {
        var emailBody = "Hello this is not a phishing email I promise";

        assert.equal(features.urlContainsIP(emailBody), false);
    });

    it('Should return false for urls without IPv4 or IPv6', () => {
        var emailBody = "Hello this is not a phishing email I promise ftp://www.dummy.com:8000/index.html";

        assert.equal(features.urlContainsIP(emailBody), false);
    });
});

describe('numberofLinkedToDomain', function() {
    it('Should return 0 for no links', () => {
        var emailBody = "Hello this is not a phishing email I promise";

        assert.equal(features.numberOfLinkedToDomain(emailBody), 0);
    });

    it('Should return 1 for one distinct domain', () => {
        var emailBody = "Hello this is not a phishing email I promise ftp://www.dummy.com:8000/index.html";

        assert.equal(features.numberOfLinkedToDomain(emailBody), 1);
    });

    it('Should return 2 for two distinct domains', () => {
        var emailBody = "Hello this is not a phishing email I promise https://dummy.com/phishing, ftp://www.someotherdomain.com/phishing";

        assert.equal(features.numberOfLinkedToDomain(emailBody), 2);
    });

    it('Should return 2 for two distinct domains and more than two links', () => {
        var emailBody = "Hello this is not a phishing email I promise https://dummy.com/phishing, http://www.dummy.com/c=$3phishing, https://someotherdomain.com/phishing";

        assert.equal(features.numberOfLinkedToDomain(emailBody), 2);
    });
});
