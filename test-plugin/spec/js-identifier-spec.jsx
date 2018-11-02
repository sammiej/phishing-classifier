import JSIdentifier from './email-parser/js-identifier';

describe("js parsing", () => {
    before(() => {
       scriptLowerCase = "fkdfa <script fdfs sfd = </script>"; // true
       scriptUpperCase = "fkdfa <SCRIPT fdfs sfd = </SCRIPT>"; // false
       scriptRandom = "ffjdsaf = fdsaf / fdsaf SCRIPT"; // false
       scriptIncomplete= "fkjdsfa = fdsf </SCRIPT faf"; // false
       scriptFirstOnly = "fdsfafd <ScrIPt fdfasfd"; // false
       scriptLastOnly = "fdsfafd </script>"; // true
    });

    it("should detect lower case script tag", () => {
        response = JSIdentifier.parseJS(scriptLowerCase);
        expect(response).toBe(true);
    });
    it("should detect upper case script tag", () => {
        response = JSIdentifier.parseJS(scriptUpperCase);
        expect(response).toBe(true);
    });
    it("should not interpret 'script' alone as js", () => {
        response = JSIdentifier.parseJS(scriptRandom);
        expect(response).toBe(false);
    });
    it("should not interpret incompleted script tag as js", () => {
        response1 = JSIdentifier.parseJS(scriptIncomplete);
        response2 = JSIdentifier.parseJS(scriptFirstOnly);
        expect(response1).toBe(false);
        expect(response2).toBe(false);
    });
    it("should detect just the end script tag", () => () => {
        response = JSIdentifier.parseJS(scriptLastOnly);
        expect(response).toBe(true);
    });

});