var React = require('react');
require('./style.css');

class ChatAppComponent extends React.Component {

    constructor() {
        super();
        this.state = {
            user: undefined,
            rec: undefined,
            string: '',
            messages: [],
            allUsers: [],
            exclude: [],
            login: 'on',
            register: 'off',
            signBody: 'sign-body',
            query: '',
            queryRes: [],
            reqCount: 0,
            showReq: 'hide-req',
            friends: []
        };
        this.sendString = this.sendString.bind(this);
        this.testCall = this.testCall.bind(this);
        this.register = this.register.bind(this);
        this.signIn = this.signIn.bind(this);
        this.searchFriends = this.searchFriends.bind(this);
        this.friendRequest = this.friendRequest.bind(this);
        this.reqFind = this.reqFind.bind(this);
        this.confirmFriend = this.confirmFriend.bind(this);
        this.findFriends = this.findFriends.bind(this);
    }

    findFriends(){
        var friends = this.state.allUsers.filter(function(me){
            return me.name === this.state.user;
        }.bind(this)).filter(function(friends){
            return friends.friends;
        });

        var confirmed = friends[0].friends.filter(function(confirmed){
            return confirmed.status === 'confirmed';
        });


        this.setState({ friends: confirmed });
    }

    confirmFriend(req){
        this.setState({showReq: 'hide-req' });
        fetch('/confirm?name='+ this.state.user +'&name2=' + req[0][1], {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'PUT'
        });

        fetch('/confirm?name='+ req[0][1] +'&name2=' + this.state.user, {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'PUT'
        });
    }

    reqFind(){
        setInterval(function(){
            if(this.state.user && this.state.password != undefined ) {

                var x = this.state.allUsers.filter(function(user){
                    return user.name === this.state.user;
                }.bind(this));

                if (x.length > 0 && x[0].friends) {
                    var count = x[0].friends.map(function(value){
                        return Object.entries(value);
                    }).filter(function(count){
                        if(count.length == 2){
                            return count[1][1] === 'pending';
                        }
                    });

                    this.setState({reqCount: count.length,
                        req: count}, this.findFriends);
                }
            }
        }.bind(this), 1000);
    }

    friendRequest(user){

        this.setState({query: '' });

        fetch('/user/' + this.state.user, {
            body: '{"name": "' + user + '", "status": "sent"}',
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'PUT'
        });

        fetch('/user/' + user, {
            body: '{"name": "' + this.state.user + '", "status": "pending"}',
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'PUT'
        });
    }

    searchFriends(event){
        this.setState({query: event.target.value}, function(){

            var myFriends = this.state.allUsers.filter(function(me){
                return me.name === this.state.user;
            }.bind(this)).filter(function(friends){
                return friends.friends;
            });

            var exclude = myFriends[0].friends.filter(function(exclude){
                return exclude.status === 'sent' || exclude.status === 'pending' || exclude.status === 'confirmed';
            });

            var resObj = {};
            this.state.allUsers.map(function(result){
                return resObj[result.name] = '';
            });
            if(exclude != undefined){
                exclude.map(function(ex){
                    return delete resObj[ex.name];
                });
            }

            delete resObj[this.state.user];

            var match = Object.keys(resObj).filter(function (user){
                console.log(user, this.state.query);
                return user.includes(this.state.query);
            }.bind(this));

            this.setState({queryRes: match});

        }.bind(this));
    }

    register(){
        this.setState({user: this.state.newUserInput,
            password: this.state.newPasswordInput }, function(){

            var liam = this.state.allUsers.filter(function(name){
                return name.name == this.state.newUserInput;
            }.bind(this));

            this.state.newUserInput !== undefined && liam.length > 0 ? this.setState({error: <h2>Sorry, username is already taken</h2>}) : this.state.newPasswordInput !== this.state.confirmNewPasswordInput ? this.setState({error: <h2>Passwords does not match</h2>}) :
                fetch('/user', {
                    body: '{"name":"' + this.state.user + '", "password":"' + this.state.password + '"}',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    method: 'POST'
                }).then( this.setState({login: 'off'}));
        });
    }

    signIn(){
        this.setState({user: this.state.userInput,
            password: this.state.passwordInput }, function(){
            var check = this.state.allUsers.filter(function(test){
                return  test.name === this.state.user;
            }.bind(this));

            check.length > 0  && check[0].password === this.state.password ? this.setState({login: 'off' }) : this.setState({pwError: <h2>wrong password or username</h2>});
        });
    }

    sendString() {
        fetch('/string', {
            body: '{"from": "' + this.state.user + '", "to": "' + this.state.rec + '", "string": "' + this.state.string + '"}',
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST'
        }).then(this.testCall.bind(this));
    }

    testCall() {
        this.setState({string: ''});
        document.getElementsByClassName('field')[0].scrollTop = document.getElementsByClassName('field')[0].scrollHeight;

    }

    componentDidMount(){

        setInterval(function(){

            fetch('/user').then(function (response) {
                return response.json();
            }).then(function (result) {
                this.setState({allUsers: result});
            }.bind(this));

            if(this.state.user != undefined && this.state.rec != undefined){
                fetch('/string?from=' + this.state.user + '&to=' + this.state.rec ).then(function (response) {
                    return response.json();
                }).then(function (result) {
                    this.setState({messages: result});
                }.bind(this));
            }
        }.bind(this), 500, this.reqFind());
    }

    render() {

        return <div>
            <div class={this.state.login}>
                <div class="sign-in">
                    <img src="logo.png"/>
                    <div class={this.state.signBody}>
                        <h3>log in</h3>
                        <input placeholder="user name" value={this.state.userInput} onChange={function(event){
                            this.setState({userInput: event.target.value});
                        }.bind(this)}></input><br/>

                        <input type="password" placeholder="password" value={this.state.passwordInput} onChange={function(event){
                            this.setState({passwordInput: event.target.value});
                        }.bind(this)}></input><br/>
                        <button onClick={this.signIn}>log in</button><br/>
                        {this.state.pwError}

                        <p>Not a member? No problem, you can register in just a few clicks!</p>

                        <button onClick={function(){
                            this.setState({register: 'on', signBody: 'off'});
                        }.bind(this)}>Sign Up Now</button>
                    </div>
                    <div class={this.state.register}>
                        <div class="register">
                            <h3>Thank you for choosing chatApp</h3>
                            <p>Just fill out the form and you are good to go!</p>
                            <input placeholder="username" value={this.state.newUserInput} onChange={function(event){
                                this.setState({newUserInput: event.target.value});
                            }.bind(this)}></input><br/>

                            <input type="password" placeholder="password" value={this.state.newPasswordInput} onChange={function(event){
                                this.setState({newPasswordInput: event.target.value});
                            }.bind(this)}></input><br/>

                            <input type="password" placeholder="confirm password" value={this.state.confirmNewPasswordInput} onChange={function(event){
                                this.setState({confirmNewPasswordInput: event.target.value});
                            }.bind(this)}></input><br/>

                            <button onClick={this.register}>register</button>
                        </div>
                        {this.state.error}
                    </div>
                </div>
            </div>

            <div id="header">
                <img src="logo.png"></img>
                <p>logged in as: <b>{this.state.user}</b></p>
                <p class="instruct">send friend request</p>
                <input placeholder="search users" value={this.state.query} onChange={this.searchFriends}/>
                <span>friend requests: <b onMouseOver={function(){
                    this.setState({showReq: 'show-req'});
                }.bind(this)} onMouseLeave={function(){
                    this.setState({showReq: 'hide-req'});
                }.bind(this)}>{this.state.reqCount}</b></span>

                <div class={this.state.showReq} onMouseOver={function(){
                    this.setState({showReq: 'show-req'});
                }.bind(this)} onMouseLeave={function(){
                    this.setState({showReq: 'hide-req'});
                }.bind(this)}>
                    {this.state.req && this.state.req.map(function(req){
                        return <p onClick={this.confirmFriend.bind(this, req)}>{req[0][1]}</p>;
                    }.bind(this))}
                </div>


                <div class="search-result">
                    <ul>
                        {this.state.query !=='' &&
                         this.state.queryRes.map(function(res){
                             return <li key={res} onClick={this.friendRequest.bind(this, res)}>{res}
                             </li>;
                         }.bind(this))}
                    </ul>
                </div>
            </div>

            <select onChange={function(event) {
                this.setState({rec: event.target.value});
            }.bind(this)}>
                {this.state.friends.length > 0 ? <option value="all">your friends</option> : <option value="all">No friends yet</option>}
                {this.state.friends.map(function(user) {
                    return <option key={user.name} value={user.name}>{user.name}</option>;
                })}
            </select>


            {this.state.user == undefined || this.state.rec == undefined ? <div class="field"><h1>welcome to ChatApp!</h1><p>Select a friend from the list to the right and chat away! </p></div> : <div><div class='field'>
                {this.state.messages.map(function(msg) {
                    var marker = msg.from === this.state.user ? 'send': 'rec';
                    var sender = msg.from === this.state.user ? 'you': msg.from;
                    return <p class={marker}><span>{sender}: </span>{msg.string}</p>;
                }.bind(this))}
            </div>
            <div id="post">
                <input value={this.state.string} onChange={function(event){
                    this.setState({string: event.target.value});
                }.bind(this)}></input>
                <button onClick={this.sendString}>send</button>
            </div>
            </div>
            }

        </div>;
    }
}
module.exports = ChatAppComponent;
