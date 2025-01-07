const { createMachine, interpret } = require('xstate');

const evChargingMachine = createMachine({
  id: 'evCharging',
  initial: 'idle',
  states: {
    idle: {
      entry: ['logStateEntry'],
      on: {
        a: [
          {
            target: 'authorized',
            cond: 'isAuthorized', 
            actions: ['logTransition']
          },
          {
            target: 'authorizationFailed', 
            actions: ['logTransition']
          }
        ],
        f: {
          target: 'authorizationFailed',
          actions: ['logTransition']
        }
      }
    },
    authorized: {
      entry: ['logStateEntry'],
      on: {
        s: {
          target: 'starting',
          actions: ['logTransition']
        },
        r: {
          target: 'idle',
          actions: ['logTransition']
        }
      }
    },
    authorizationFailed: {
      entry: ['logStateEntry'],
      on: {
        r: {
          target: 'idle',
          actions: ['logTransition']
        }
      }
    },
    starting: {
      entry: ['logStateEntry'],
      on: {
        c: {
          target: 'charging',
          actions: ['logTransition']
        },
        r: {
          target: 'idle',
          actions: ['logTransition']
        }
      }
    },
    charging: {
      entry: ['logStateEntry'],
      on: {
        t: {
          target: 'stopped',
          actions: ['logTransition']
        },
        r: {
          target: 'idle',
          actions: ['logTransition']
        }
      }
    },
    stopped: {
      entry: ['logStateEntry'],
      on: {
        r: {
          target: 'idle',
          actions: ['logTransition']
        }
      }
    }
  }
}, {
  actions: {
    logStateEntry: (context, event, { state }) => {
      console.log(`\nEntered ${state.value} state`);
    },
    logTransition: (context, event, { state }) => {
      const previousState = state.history?.value || idle;
      const currentState = state.value
      console.log(`Transitioned from ${previousState} to ${currentState} on ${event.type}`);
    }
  },
  guards: {
    isAuthorized: () => Math.random() > 0.5 
  }
});

module.exports = { evChargingMachine };
