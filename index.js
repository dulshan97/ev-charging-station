
const { interpret } = require('xstate');
const { evChargingMachine } = require('./machine');




function getStateActions(state) {
  const actions = {
    idle: ['a - Attempt authorization', 'f - Simulate failed authorization'],
    authorized: ['s - Start charging', 'r - Reset to idle'],
    authorizationFailed: ['r - Reset to idle'],
    starting: ['c - Begin charging', 'r - Reset to idle'],
    charging: ['t - Stop charging', 'r - Reset to idle'],
    stopped: ['r - Reset to idle']
  };

  return actions[state] || ['r - Reset to idle'];
}


function displayActions(stateValue) {
  console.log(`\nCurrent state: ${stateValue}`);
  console.log('Available actions:');
  getStateActions(stateValue).forEach(action => console.log(action));
  console.log('q - Quit application\n');
}


function displayInstructions() {
  console.log('\n=== EV Charging Station Controls ===');
  console.log('Available commands:');
  console.log('a - Attempt authorization');
  console.log('f - Simulate failed authorization');
  console.log('s - Start charging (from Authorized)');
  console.log('c - Begin charging (from Starting)');
  console.log('t - Stop charging (from Charging)');
  console.log('r - Reset to Idle state');
  console.log('q - Quit application');
  console.log('============================\n');
}


const service = interpret(evChargingMachine);


service.subscribe(state => {
  if (state.changed !== false) {
    displayActions(state.value);
  }
});


service.start();


displayInstructions();
displayActions('idle');


process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (key) => {
  const keyPressed = key.toString().toLowerCase();

  if (keyPressed === 'q') {
    console.log('\nExiting application...');
    process.exit(0);
  }

  const validKeys = ['a', 'f', 's', 'c', 't', 'r'];

  if (validKeys.includes(keyPressed)) {
    try {
      service.send(keyPressed);
    } catch (error) {
      console.log('\nInvalid transition for current state');
      displayActions(service.getSnapshot.value);
    }
  } else {
    console.log('\nInvalid key pressed. Try again.');
    displayActions(service.getSnapshot.value);
  }
});


process.on('SIGINT', () => {
  console.log('\nExiting application...');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('An error occurred:', error);
  console.log('Current state:', service.getSnapshot?.value);
  process.exit(1);
});