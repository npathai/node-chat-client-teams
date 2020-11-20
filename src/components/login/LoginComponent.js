import React from 'react'
import './LoginComponent.css'

class LoginComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            inFlight: false,
            username: ""
        }
        this.handleUsernameChange = this.handleUsernameChange.bind(this);
        this.loginUser = this.loginUser.bind(this);
    }

    componentDidMount() {
        console.log("Component mounted")
    }

    componentWillUnmount() {
        console.log("Component unmounted")
    }

    render() {
        return <div>
            <form onSubmit={this.loginUser}>
                <label>Chatter Login</label>
                <div>
                    <label>Username</label>
                    <input id="username" type="text" placeholder="Enter Username here..." onChange={this.handleUsernameChange} value={this.state.username}/>
                </div>
                <button type="submit" disabled={this.state.inFlight}>Sign In</button>
            </form>
        </div>;
    }

    loginUser(event) {
        event.preventDefault()
        this.setState({
            inFlight: true
        })

        console.log("username: ", this.state.username)
        fetch("http://localhost:3000/api/users/login", {
                mode: "cors",
                method: "post",
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({username: this.state.username})
            }
        ).then(res => {
            if (res.status === 200) {
                this.props.setLoggedInUsername(this.state.username)
            } else {
                throw new Error("Logged in failed")
            }
        }).catch(err => {
            console.log(err)
        }).finally(() => {
            // this.setState({
            //     inFlight: false
            // })
        })
    }

    handleUsernameChange(e) {
        this.setState({
            username: e.target.value
        })
    }
}

export default LoginComponent