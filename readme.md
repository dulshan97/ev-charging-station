# Ev Charging Station State Machine

## instruction for running the application 

### clone the repository

git clone ``<repo-url>``
cd <repo-directory>

### install dependencies

npm install

### run the application 

node index.js
or 
npm start

### Test

npm test

(for unit testing - jest framework is used)

## Description

this project is about state machine for an EV Charging Station using Xstate.\
The State machine will handle various states of the charging processess and transition based on Keyboard Events.\
Every state transition and entry will be logged in the terminal.

# states

1. idle : initial state.\

Actions: 

a -> Attempt authorization (if success then authorized, otherwise it will be authorizationFailed)

f -> Simulate failed Authrization

2. Authorized : authorization succeeded.

Actions:

s -> Start charging 
r -> reset to idle

3. authorizationFailed: Authorization failed.

Actions:

r-> reset to idel.

4. starting:Preparing to charge.

Actions: 

c-> Beging charging(transition to charging)
r->  reset to idle.

5. charging: Vehicle is charging.

actions: 
t-> stop charging (transition to stopped).
r-> reset to idle.

6. stopped:Charging stopped.

Actions:

r-> Reset to idle

## Authorized Condion

isAuthorized: sumulates authorizaton succes or failure based on random logic

## Actions 

logStateEntry : logs a message when a new state is entered.
logTransition : logs a message informing the transition from the previouse state to the next state.

