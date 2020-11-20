import './App.css';
import React from 'react';

import LoginComponent from "./components/login/LoginComponent";
import ChatComponent from "./components/chat/ChatComponent";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: false,
      loggedInUsername: undefined
    }
    this.getLoggedInUsername = this.getLoggedInUsername.bind(this);
    this.setLoggedInUsername = this.setLoggedInUsername.bind(this);
  }

  getLoggedInUsername() {
    return this.state.loggedInUsername;
  }

  setLoggedInUsername(username) {
    this.setState({
      isLoggedIn: true,
      loggedInUsername: username
    })
  }

  componentDidMount() {
    console.log("Component mounted")
  }

  componentWillUnmount() {
    console.log("Component unmounted")
  }

  render() {
      return (
          <div id="app">
            {!this.state.isLoggedIn ? <LoginComponent setLoggedInUsername={this.setLoggedInUsername}/> : <ChatComponent loggedInUsername={this.state.loggedInUsername}/>}
          </div>
      );
  }
}

export default App;
