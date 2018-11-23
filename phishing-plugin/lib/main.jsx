import {
  React,
  // The ComponentRegistry manages all React components in N1.
  ComponentRegistry,
  // A `Store` is a Flux component which contains all business logic and data
  // models to be consumed by React components to render markup.
  MessageStore,
} from 'mailspring-exports';

const classifier = require("./classifier");
const phishingIndicator = "This email seems to be a phishing email.";
const phishingWarningDetails = "Phishing is the fraudulent attempt to obtain sensitive\ninformation such as usernames, passwords and\ncredit card details.";
const safeIndicator = "This email does not seem to be a phishing email.";
const details = "Details";

// Notice that this file is `main.jsx` rather than `main.es6`. We use the
// `.jsx` filetype because we use the JSX DSL to describe markup for React to
// render. Without the JSX, we could just name this file `main.es6` instead.
class PhishingIndicator extends React.Component {
  // Adding a displayName to a React component helps for debugging.
  static displayName = 'PhishingIndicator';
  constructor() {
    super();
    this.state = {
      message: MessageStore.items()[0],
      warning: phishingIndicator,
      details: details,
      detailedWarning: "",
      expandedTicket: false
    };
    this.togglePhishingTicket = this.togglePhishingTicket.bind(this);
  }
  togglePhishingTicket() {
    var expandedTicket = !this.state.expandedTicket;
    var detailedWarning = "";
    if (expandedTicket) {
      detailedWarning = phishingWarningDetails;
    }
    this.setState({expandedTicket: expandedTicket,
                   detailedWarning: detailedWarning});
  }
  componentDidMount() {
    this._unlisten = MessageStore.listen(this._onMessagesChanged);
  }

  componentWillUnmount() {
    if (this._unlisten) {
      this._unlisten();
    }
  }

  _onMessagesChanged = () => {
    this.setState({
      message: MessageStore.items()[0]
    });
  };

  // A React component's `render` method returns a virtual DOM element described
  // in JSX. `render` is deterministic: with the same input, it will always
  // render the same output. Here, the input is provided by this.isPhishingAttempt.
  // `this.state` and `this.props` are popular inputs as well.
  render() {
    const { message } = this.state;
    if (!message) {
      return <span />;
    }
    let email = {};
    email.body = message.body;
    email.sender = [];
    for (let senderObj of message.from) {
      email.sender.push(senderObj.email);
    }
    let label = null;
    try {
      label = classifier.predict(email);
    } catch(e) {
      console.error(e);
    }
    
    if (label === "phishing") {
      return (
        <div className="phishingIndicator">
          <b>This message looks suspicious!</b>
          <div className="description">
            <div className="warning">
              {this.state.warning}&nbsp;
            </div>
            <div className="details" onClick={this.togglePhishingTicket}>
              {this.state.details}
            </div>
          </div>
          <div className="detailedWarning">
            {this.state.detailedWarning.split("\n").map((i,key) => {
              return <div key={key}><strong>{i}</strong></div>;
            })}
          </div>
        </div>
      );
    }
    else if (label === "non-phishing") {
      return (
        <div className="nonPhishingIndicator">
          <b>This message is safe</b>
          <div className="description">
            {safeIndicator}
          </div>
        </div>
      );        
    }
    else {
      return (
        <div className="errorIndicator">
          <b>Sorry error with classification :(</b>
        </div>
      );
    }
  }
}

export function activate() {
  ComponentRegistry.register(PhishingIndicator, {
    role: 'MessageListHeaders'
  });
}

export function serialize() {}

export function deactivate() {
  ComponentRegistry.unregister(PhishingIndicator);
}
