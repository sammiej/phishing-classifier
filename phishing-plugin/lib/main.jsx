import {
  React,
  // The ComponentRegistry manages all React components in N1.
  ComponentRegistry,
  // A `Store` is a Flux component which contains all business logic and data
  // models to be consumed by React components to render markup.
  MessageStore,
} from 'mailspring-exports';

const classifier = require("./classifier");

// Notice that this file is `main.jsx` rather than `main.es6`. We use the
// `.jsx` filetype because we use the JSX DSL to describe markup for React to
// render. Without the JSX, we could just name this file `main.es6` instead.
class PhishingIndicator extends React.Component {
  // Adding a displayName to a React component helps for debugging.
  static displayName = 'PhishingIndicator';

  constructor() {
    super();
    this.state = {
      message: MessageStore.items()[0]
    };
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
            Classifier indicates that this email is most likely a phishing email
          </div>
        </div>
      );
    }
    else if (label === "non-phishing") {
      return (
        <div className="nonPhishingIndicator">
          <b>This message is safe</b>
          <div className="description">
            Classifier indicates that this email is most likely not a phishing email
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
