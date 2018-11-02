export default class JsIdentifier {

    parseJS(email) {
        return email.includes("<\\script>");
    }
}