import React from 'react';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faCheck,
    faCheckDouble,
    faEye,
    faPaperPlane
} from "@fortawesome/free-solid-svg-icons";
import Select from "react-select";

import './ChatComponent.css'
import newConversation from './new_conversation.svg'

class ChatComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            users: [],
            conversationsById: {},
            currentConversation: undefined,
            conversationsLoaded: false,
            usersLoaded: false,
            composedMessage: '',
            socket: undefined
        }
        this.loadUsers = this.loadUsers.bind(this);
        this.loadConversations = this.loadConversations.bind(this);
        this.setCurrentConversation = this.setCurrentConversation.bind(this);
        this.handleComposeMessageChange = this.handleComposeMessageChange.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.connectSocket = this.connectSocket.bind(this);
        this.handleUserSelected = this.handleUserSelected.bind(this)
        this.createConversation = this.createConversation.bind(this);
    }

    componentDidMount() {
        this.loadUsers().then(() => {
            return this.loadUsers();
        }).then(() => {
            return this.loadConversations();
        }).then(() => {
            this.connectSocket();
        })
    }

    componentWillUnmount() {
        this.disconnectSocket();
    }

    connectSocket() {
        let socket = new WebSocket("ws://localhost:3000")
        socket.onopen = () => {
            socket.send(JSON.stringify({
                type: "bind",
                username: this.props.loggedInUsername
            }))

            this.setState({
                socket: socket
            })

            socket.onmessage = (event) => {
                console.log("Received back at client: '" + event.data + "'");
                let messagePayload = JSON.parse(event.data)
                let conversation = this.state.conversationsById[messagePayload.conversationId]
                // Check if it is a new conversation
                if (conversation === undefined) {
                    // If may be possible that user was offline for a while and just came online to receive new message. So be sure and fetch full conversation
                    // Can we improve on this by managing connected/disconnected state in front end. And when we reconnect, we refresh full state, only then bind
                    // the websocket?
                    this.getConversationById(messagePayload.conversationId).then(conversation => {
                        let conversations = this.state.conversationsById
                        conversations[conversation._id] = conversation
                        this.setState({
                            conversationsById: conversations
                        })
                        // scrollToBottom()
                    })
                } else {
                    this.state.conversationsById[messagePayload.conversationId].messages.push(messagePayload.message)
                    this.setState({

                    })
                    // scrollToBottom()
                }
            }
        }
    }

    getConversationById(conversationId) {
        return fetch(`http://localhost:3000/api/conversations/${conversationId}`, {
            cors: true,
            method: "get",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        }).then(res => {
            if (res.status !== 200) {
                throw new Error("Error in fetching conversation")
            }
            return res.json();
        })
    }

    disconnectSocket() {
        this.state.socket.close()
    }

    loadConversations() {
        return fetch(`http://localhost:3000/api/users/${this.props.loggedInUsername}/conversations`, {
            cors: true,
            method: 'get',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        }).then(res => {
            if (res.status !== 200) {
                throw new Error("Error in loading conversations");
            }
            return res.json()
        }).then(res => {
            let conversations = {}
            for (let conversation of res) {
                conversation.members = conversation.members.filter((value, index, arr) => {
                    return value !== this.props.getLoggedInUsername
                })
                conversations[conversation._id] = conversation
            }
            this.setState({
                conversationsLoaded: true,
                conversationsById: conversations,
                currentConversation: Object.values(conversations)[0]
            })
            console.log(this.state)
        })
    }

    loadUsers() {
        return fetch("http://localhost:3000/api/users/", {
            cors: true,
            method: 'get',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        }).then(res => {
            if (res.status !== 200) {
                throw new Error("Unable to load users")
            }
            return res.json()
        }).then(res => {
            let users = [...res.data]
            users = users.filter(user => {
                return user.name !== this.props.loggedInUsername
            })

            this.setState({
                usersLoaded: true,
                users: users
            })
            console.log(this.state)
        }).catch(err => {
            console.log(err)
        })
    }

    membersExcludingMe(members) {
        return members.filter((member, index, arr) => {
            return member !== this.props.loggedInUsername
        })
    }

    latestConversationMessage(conversation) {
        if (conversation._id === "draft") {
            return "(Draft)"
        }
        if (conversation.messages.length === 0) {
            return null;
        }
        return conversation.messages[conversation.messages.length - 1].message
    }

    setCurrentConversation(conversationId) {
        this.setState({
            currentConversation: this.state.conversationsById[conversationId]
        })
    }

    isMessageFromMe(message) {
        return message.fromName === this.props.loggedInUsername;
    }

    handleComposeMessageChange(event) {
        this.setState({
            composedMessage : event.target.value
        })
    }

    sendMessage(event) {
        event.preventDefault()
        if (this.state.currentConversation._id === "draft") {
            this.createConversation().then(() => {
                this.postMessage();
                this.setState({
                    composedMessage: ''
                })
            })
        } else {
            this.postMessage();
            this.setState({
                composedMessage: ''
            })
        }
    }

    createConversation() {
        return fetch("http://localhost:3000/api/conversations", {
            cors: true,
            method: "post",
            body: JSON.stringify({
                members: this.state.conversationsById['draft'].members
            }),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        }).then(res => {
            if (res.status !== 200) {
                throw new Error("Unable to create conversation")
            }
            return res.json()
        }).then(conversation => {
            let newConversations = this.state.conversationsById
            delete newConversations['draft']
            newConversations[conversation._id] = conversation;
            let currentConversation = this.state.currentConversation
            if (currentConversation._id === "draft") {
                currentConversation = conversation
            }
            this.setState({
                conversationsById: newConversations,
                currentConversation: currentConversation
            })
        }).catch(err => {
            console.log(err)
        })
    }

    postMessage() {
        fetch(`http://localhost:3000/api/conversations/${this.state.currentConversation._id}/message`, {
            cors: true,
            method: 'post',
            body: JSON.stringify({
                senderName: this.props.loggedInUsername, message: this.state.composedMessage
            }),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        }).then(res => {
            if (res.status !== 200) {
                throw new Error("Unable to send message")
            }
            return res.json()
        }).then(res => {
            // FIXME need proper solution for this updation of map in state
            this.state.conversationsById[res.conversationId].messages.push(res.message)
            this.setState({})
            console.log(res)
        }).catch(err => {
            console.log(err);
        })
    }

    handleUserSelected(selectedUser) {
        // FIXME if conversation with user does not exist then create it. Add that code from previous client
        // Currently assuming we are talking to fixed people
        let existingConversation
        for (let conversation of Object.values(this.state.conversationsById)) {
            console.log(conversation)
            // FIXME Adding contains check here. But will not work in group context when there can be multiple conversations where the participants are same
            // We will need better thought on this one
            if (conversation.members.includes(selectedUser.value)) {
                existingConversation = conversation
                this.setCurrentConversation(existingConversation._id)
                break
            }
        }
        if (existingConversation === undefined) {
            existingConversation = {
                _id: "draft", // Because this is a draft conversation
                members: [this.props.loggedInUsername, selectedUser.value],
                messages: [],
                isDraft: true
            }
            // FIXME need to find how to update map in react state.
            // Currently there can only be one chat in draft. Can we change this?
            let conversations = this.state.conversationsById
            conversations[existingConversation._id] = existingConversation
            this.setState({
                currentConversation: existingConversation,
                conversationsById: conversations
            })
        }
    }

    render() {
        console.log(this.state);
        const options = []
        this.state.users.forEach((user, index, arr) => {
            options.push({
                value: user.name, label: user.name,
            })
        })

        const customStyles = {
            control: styles => ({...styles, backgroundColor: '#edebe9'}),
            option: (provided, {isFocused, isSelected}) => ({
                ...provided,
                backgroundColor: isSelected ? '#edebe9' : provided['backgroundColor'],
                color: isSelected ? '#000000' : '#000000',
                fontSize: '15px',
                fontFamily: '"Segoe UI",system-ui,"Apple Color Emoji","Segoe UI Emoji",sans-serif'
            }),
            singleValue: (provided, state) => ({
                ...provided,
            })
        }

        // FIXME status of outgoing message should only be present on last message read/received/delivered
        return <div id="outer-shell">
            <div id="header-strip">
                <div id="left-empty"/>
                <div id="search-box">
                    <Select options={options} styles={customStyles} placeholder={'Search'} clearable="true" onChange={this.handleUserSelected}
                            theme={theme => ({
                                ...theme,
                                border: 'none',
                                colors: {
                                    ...theme.colors,
                                    primary25: 'rgba(229,229,241, 0.6)',
                                    primary75: 'rgba(229,229,241, 0.6)',
                                    primary50: 'rgba(229,229,241, 0.6)',
                                    primary: 'rgba(229,229,241, 0.6)'
                                }
                            })}/>
                </div>

                <div id="logged-in-user-user-avatar-container">
                    <img
                        src='https://avataaars.io/?avatarStyle=Circle&topType=ShortHairFrizzle&accessoriesType=Sunglasses&hairColor=Auburn&facialHairType=BeardMedium&facialHairColor=Brown&clotheType=CollarSweater&clotheColor=Blue02&eyeType=Default&eyebrowType=Default&mouthType=Disbelief&skinColor=Brown'
                        className="user-avatar" alt="X"/>
                </div>
            </div>
            <div id="main-content">
                <div id="conversations">

                    {Object.keys(this.state.conversationsById).map((conversationId, id, arr) => (

                        <div className={this.state.currentConversation !== undefined && this.state.currentConversation._id === conversationId ? "conversation active-conversation" : "conversation"} id={conversationId}
                             onClick={() => this.setCurrentConversation(conversationId)}>
                            <img
                                src='https://avataaars.io/?avatarStyle=Circle&topType=ShortHairShortFlat&accessoriesType=Round&hairColor=PastelPink&facialHairType=BeardMagestic&facialHairColor=Auburn&clotheType=ShirtScoopNeck&clotheColor=Heather&eyeType=Happy&eyebrowType=Default&mouthType=Sad&skinColor=Pale'
                                className="user-avatar"/>
                            <div className="conversation-content">
                                <div
                                    className="conversation-content-sender">{this.membersExcludingMe(this.state.conversationsById[conversationId].members)}</div>
                                <div className="conversation-content-text">
                                    <span>{this.latestConversationMessage(this.state.conversationsById[conversationId])}</span>
                                </div>
                            </div>
                            <div className="conversation-timestamp">11:00 PM</div>
                        </div>
                    ))}


                    {/*<div className="conversation active-conversation">
                        <img
                            src='https://avataaars.io/?avatarStyle=Circle&topType=ShortHairShortFlat&accessoriesType=Round&hairColor=PastelPink&facialHairType=BeardMagestic&facialHairColor=Auburn&clotheType=ShirtScoopNeck&clotheColor=Heather&eyeType=Happy&eyebrowType=Default&mouthType=Sad&skinColor=Pale'
                            className="user-avatar"/>
                        <div className="conversation-content">
                            <div className="conversation-content-sender">Harry</div>
                            <div className="conversation-content-text">Hello NCP. There is something happening in Milton
                                park
                                tonight.
                            </div>
                        </div>
                        <div className="conversation-timestamp">11:00 PM</div>
                    </div>
                    <div className="conversation">
                        <img
                            src='https://avataaars.io/?avatarStyle=Circle&topType=WinterHat2&accessoriesType=Kurt&hatColor=Black&facialHairType=Blank&clotheType=Overall&clotheColor=White&eyeType=Surprised&eyebrowType=Default&mouthType=Default&skinColor=Brown'
                            className="user-avatar"/>
                        <div className="conversation-content">
                            <div className="conversation-content-sender">Ron</div>
                            <div className="conversation-content-text">Hola Narendra</div>
                        </div>
                        <div className="conversation-timestamp">01:00 PM</div>
                    </div>
                    <div className="conversation">
                        <img
                            src='https://avataaars.io/?avatarStyle=Circle&topType=WinterHat4&accessoriesType=Prescription01&hatColor=Red&hairColor=PastelPink&facialHairType=Blank&facialHairColor=BrownDark&clotheType=ShirtScoopNeck&clotheColor=Gray02&eyeType=Close&eyebrowType=RaisedExcitedNatural&mouthType=ScreamOpen&skinColor=Yellow'
                            className="user-avatar"/>
                        <div className="conversation-content">
                            <div className="conversation-content-sender">Hermione</div>
                            <div className="conversation-content-text">Hey dude!</div>
                        </div>
                        <div className="conversation-timestamp">06:00 PM</div>
                    </div>*/}
                </div>

                <div id="current-conversation-container">
                    <div className="flex-fill">
                        {!this.state.conversationsLoaded
                            ? <span>Loading conversations...</span>
                            : this.state.currentConversation !== undefined ? <>
                                <div id="conversation-header">
                                    <img
                                        src='https://avataaars.io/?avatarStyle=Circle&topType=ShortHairShortFlat&accessoriesType=Round&hairColor=PastelPink&facialHairType=BeardMagestic&facialHairColor=Auburn&clotheType=ShirtScoopNeck&clotheColor=Heather&eyeType=Happy&eyebrowType=Default&mouthType=Sad&skinColor=Pale'
                                        className="user-avatar"/>
                                    <span
                                        id="current-conversation-title">{this.membersExcludingMe(this.state.currentConversation.members).join(",")}</span>
                                </div>

                                <div id="conversation-messages">

                                    {this.state.currentConversation._id !== "draft" ? this.state.currentConversation.messages.map((message, index, arr) => {
                                        return <>
                                            <div className={this.isMessageFromMe(message) ? "outgoing-message-container" : "incoming-message-container"}>
                                                <div className={this.isMessageFromMe(message) ? "conversation-message outgoing-message" : "conversation-message incoming-message"}>
                                                    <span>{message.message}</span>
                                                </div>
                                                {this.isMessageFromMe(message)
                                                    ? <div className="status-container">
                                                        {/*<FontAwesomeIcon icon={faCheckDouble} size="xs" color="#6264a7"/>*/}
                                                    </div>
                                                    : null
                                                }
                                            </div>
                                        </>
                                    }): <div id="new-conversation-illustration"><img src={newConversation}  alt="new-conversation"/><div><span id="new-conversation-heading">You are starting a new conversation</span></div></div>}
                                </div>
                            </>: <span>Start by having a conversation with any team member.</span>}
                    </div>
                    <div id="add-new-message">
                        <div id="compose-message-container">
                            <div id="compose-box-container">
                                <form id="compose-form" onSubmit={this.sendMessage}>
                                    <input id="compose-box" placeholder="Type a new message" type="text" onChange={this.handleComposeMessageChange} value={this.state.composedMessage}/>
                                </form>
                                <div id="compose-controls-container">
                                    <FontAwesomeIcon icon={faPaperPlane} size="lg" color="#6264a7" onClick={this.sendMessage}/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                {/*<div id="current-conversation-container">*/}
                {/*    <div className="flex-fill">*/}
                {/*        <div id="conversation-header">*/}
                {/*            <img*/}
                {/*                src='https://avataaars.io/?avatarStyle=Circle&topType=ShortHairShortFlat&accessoriesType=Round&hairColor=PastelPink&facialHairType=BeardMagestic&facialHairColor=Auburn&clotheType=ShirtScoopNeck&clotheColor=Heather&eyeType=Happy&eyebrowType=Default&mouthType=Sad&skinColor=Pale'*/}
                {/*                className="user-avatar"/>*/}
                {/*            <span id="current-conversation-title">Harry</span>*/}
                {/*        </div>*/}
                {/*        <div id="conversation-messages">*/}
                {/*            <div className="incoming-message-container">*/}
                {/*                <div className="conversation-message incoming-message">*/}
                {/*                    <span>Hello NCP</span>*/}
                {/*                </div>*/}
                {/*            </div>*/}
                {/*            <div className="incoming-message-container">*/}
                {/*                <div className="conversation-message incoming-message">*/}
                {/*                    <span>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem*/}
                {/*                        Ipsum has been the industry's standard dummy text ever since the 1500s, when an*/}
                {/*                        unknown printer took a galley of type and scrambled it to make a type specimen*/}
                {/*                        book. It has survived not only five centuries, but also the leap into electronic*/}
                {/*                        typesetting, remaining essentially unchanged. It was popularised in the 1960s*/}
                {/*                        with the release of Letraset sheets containing Lorem Ipsum passages, and more*/}
                {/*                        recently with desktop publishing software like Aldus PageMaker including*/}
                {/*                        versions of Lorem Ipsum.</span>*/}
                {/*                </div>*/}
                {/*            </div>*/}
                {/*            <div className="outgoing-message-container">*/}
                {/*                <div className="conversation-message outgoing-message">*/}
                {/*                    <span>I'm good thanks! Lorem Ipsum is simply dummy text of the printing and typesetting*/}
                {/*                        industry. Lorem Ipsum has been the industry's standard dummy text ever since the*/}
                {/*                        1500s, when an unknown printer took a galley of type and scrambled it to make a*/}
                {/*                        type specimen book. It has survived not only five centuries, but also the leap*/}
                {/*                        into electronic typesetting, remaining essentially unchanged. It was popularised*/}
                {/*                        in the 1960s with the release of Letraset sheets containing Lorem Ipsum*/}
                {/*                        passages, and more recently with desktop publishing software like Aldus*/}
                {/*                        PageMaker including versions of Lorem Ipsum.</span>*/}
                {/*                </div>*/}
                {/*                <div className="status-container">*/}
                {/*                    <FontAwesomeIcon icon={faEye} size="xs" color="#6264a7"/>*/}
                {/*                </div>*/}
                {/*            </div>*/}
                {/*            <div className="outgoing-message-container">*/}
                {/*                <div className="conversation-message outgoing-message">*/}
                {/*                    <span>I'm good thanks! Lorem Ipsum is simply dummy text of the printing and typesetting*/}
                {/*                        industry. Lorem Ipsum has been the industry's standard dummy text ever since the*/}
                {/*                        1500s, when an unknown printer took a galley of type and scrambled it to make a*/}
                {/*                        type specimen book. It has survived not only five centuries, but also the leap*/}
                {/*                        into electronic typesetting, remaining essentially unchanged. It was popularised*/}
                {/*                        in the 1960s with the release of Letraset sheets containing Lorem Ipsum*/}
                {/*                        passages, and more recently with desktop publishing software like Aldus*/}
                {/*                        PageMaker including versions of Lorem Ipsum.</span>*/}
                {/*                </div>*/}
                {/*                <div className="status-container">*/}
                {/*                    <FontAwesomeIcon icon={faCheckDouble} size="xs" color="#6264a7"/>*/}
                {/*                </div>*/}
                {/*            </div>*/}

                {/*            <div className="outgoing-message-container">*/}
                {/*                <div className="conversation-message outgoing-message">*/}
                {/*                    <span>I'm good thanks! Lorem Ipsum is simply dummy text of the printing and typesetting*/}
                {/*                        industry. Lorem Ipsum has been the industry's standard dummy text ever since the*/}
                {/*                        1500s, when an unknown printer took a galley of type and scrambled it to make a*/}
                {/*                        type specimen book. It has survived not only five centuries, but also the leap*/}
                {/*                        into electronic typesetting, remaining essentially unchanged. It was popularised*/}
                {/*                        in the 1960s with the release of Letraset sheets containing Lorem Ipsum*/}
                {/*                        passages, and more recently with desktop publishing software like Aldus*/}
                {/*                        PageMaker including versions of Lorem Ipsum.</span>*/}
                {/*                </div>*/}
                {/*                <div className="status-container">*/}
                {/*                    <FontAwesomeIcon icon={faCheck} size="xs" color="#6264a7"/>*/}
                {/*                </div>*/}
                {/*            </div>*/}
                {/*        </div>*/}
                {/*    </div>*/}
                {/*    <div id="add-new-message">*/}
                {/*        <div id="compose-message-container">*/}
                {/*            <div id="compose-box-container">*/}
                {/*                <input id="compose-box" placeholder="Type a new message" type="text"/>*/}
                {/*                <div id="compose-controls-container">*/}
                {/*                    <FontAwesomeIcon icon={faPaperPlane} size="lg" color="#6264a7"/>*/}
                {/*                </div>*/}
                {/*            </div>*/}
                {/*        </div>*/}
                {/*    </div>*/}
                {/*</div>*/}
            </div>
        </div>
    }
}

export default ChatComponent