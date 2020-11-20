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

class ChatComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            users: [],
            conversationsById: {},
            currentConversationId: undefined
        }
        this.loadUsers = this.loadUsers.bind(this);
    }

    componentDidMount() {
        this.loadUsers();
    }

    loadUsers() {
        fetch("http://localhost:3000/api/users/", {
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
            users = users.filter(user => { return user.name !== this.props.loggedInUsername })

            this.setState({
                users: users
            })
        }).catch(err => {
            console.log(err)
        })
    }

    render() {
        const options = []
        this.state.users.forEach((user, index, arr) => {
            options.push({
                value: user.name, label: user.name,
            })
        })

        const customStyles = {
            control: styles => ({ ...styles, backgroundColor: '#edebe9' }),
            option: (provided, {isFocused, isSelected}) => ({
                ...provided,
                backgroundColor: isSelected ? '#edebe9': provided['backgroundColor'],
                color: isSelected ? '#000000': '#000000',
            }),
            singleValue: (provided, state) => ({
                ...provided,
            })
        }

        return <div id="outer-shell">
            <div id="header-strip">
                <div id="left-empty"/>
                <div id="search-box">
                    <Select options={options} styles={customStyles} placeholder={'Search'} clearable="true" theme={theme => ({
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
                    <div className="conversation active-conversation">
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
                    </div>
                </div>

                <div id="current-conversation-container">
                    <div className="flex-fill">
                        <div id="conversation-header">
                            <img
                                src='https://avataaars.io/?avatarStyle=Circle&topType=ShortHairShortFlat&accessoriesType=Round&hairColor=PastelPink&facialHairType=BeardMagestic&facialHairColor=Auburn&clotheType=ShirtScoopNeck&clotheColor=Heather&eyeType=Happy&eyebrowType=Default&mouthType=Sad&skinColor=Pale'
                                className="user-avatar"/>
                            <span id="current-conversation-title">Harry</span>
                        </div>
                        <div id="conversation-messages">
                            <div className="incoming-message-container">
                                <div className="conversation-message incoming-message">
                                    <span>Hello NCP</span>
                                </div>
                            </div>
                            <div className="incoming-message-container">
                                <div className="conversation-message incoming-message">
                                    <span>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem
                                        Ipsum has been the industry's standard dummy text ever since the 1500s, when an
                                        unknown printer took a galley of type and scrambled it to make a type specimen
                                        book. It has survived not only five centuries, but also the leap into electronic
                                        typesetting, remaining essentially unchanged. It was popularised in the 1960s
                                        with the release of Letraset sheets containing Lorem Ipsum passages, and more
                                        recently with desktop publishing software like Aldus PageMaker including
                                        versions of Lorem Ipsum.</span>
                                </div>
                            </div>
                            <div className="outgoing-message-container">
                                <div className="conversation-message outgoing-message">
                                    <span>I'm good thanks! Lorem Ipsum is simply dummy text of the printing and typesetting
                                        industry. Lorem Ipsum has been the industry's standard dummy text ever since the
                                        1500s, when an unknown printer took a galley of type and scrambled it to make a
                                        type specimen book. It has survived not only five centuries, but also the leap
                                        into electronic typesetting, remaining essentially unchanged. It was popularised
                                        in the 1960s with the release of Letraset sheets containing Lorem Ipsum
                                        passages, and more recently with desktop publishing software like Aldus
                                        PageMaker including versions of Lorem Ipsum.</span>
                                </div>
                                <div className="status-container">
                                    <FontAwesomeIcon icon={faEye} size="xs" color="#6264a7"/>
                                </div>
                            </div>
                            <div className="outgoing-message-container">
                                <div className="conversation-message outgoing-message">
                                    <span>I'm good thanks! Lorem Ipsum is simply dummy text of the printing and typesetting
                                        industry. Lorem Ipsum has been the industry's standard dummy text ever since the
                                        1500s, when an unknown printer took a galley of type and scrambled it to make a
                                        type specimen book. It has survived not only five centuries, but also the leap
                                        into electronic typesetting, remaining essentially unchanged. It was popularised
                                        in the 1960s with the release of Letraset sheets containing Lorem Ipsum
                                        passages, and more recently with desktop publishing software like Aldus
                                        PageMaker including versions of Lorem Ipsum.</span>
                                </div>
                                <div className="status-container">
                                    <FontAwesomeIcon icon={faCheckDouble} size="xs" color="#6264a7"/>
                                </div>
                            </div>

                            <div className="outgoing-message-container">
                                <div className="conversation-message outgoing-message">
                                    <span>I'm good thanks! Lorem Ipsum is simply dummy text of the printing and typesetting
                                        industry. Lorem Ipsum has been the industry's standard dummy text ever since the
                                        1500s, when an unknown printer took a galley of type and scrambled it to make a
                                        type specimen book. It has survived not only five centuries, but also the leap
                                        into electronic typesetting, remaining essentially unchanged. It was popularised
                                        in the 1960s with the release of Letraset sheets containing Lorem Ipsum
                                        passages, and more recently with desktop publishing software like Aldus
                                        PageMaker including versions of Lorem Ipsum.</span>
                                </div>
                                <div className="status-container">
                                    <FontAwesomeIcon icon={faCheck} size="xs" color="#6264a7"/>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="add-new-message">
                        <div id="compose-message-container">
                            <div id="compose-box-container">
                                <input id="compose-box" placeholder="Type a new message" type="text"/>
                                <div id="compose-controls-container">
                                    <FontAwesomeIcon icon={faPaperPlane} size="lg" color="#6264a7"/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    }
}

export default ChatComponent