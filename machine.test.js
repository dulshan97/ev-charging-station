const { interpret } = require('xstate');
const { evChargingMachine } = require('./machine');

describe('EV Charging Station State Machine', () => {
    let service;

    beforeEach(() => {
        service = interpret(evChargingMachine).start();
    });

    afterEach(() => {
        service.stop();
    });

    test('checking whether start in idle state', () => {
        expect(service.state.value).toBe('idle');
    });

    test('with guard success, testing transition changing idle to the authorized with event "a" ', () => {
        // Mocking guard behavior to force success
        const machine = evChargingMachine.withConfig({
            guards: {
                isAuthorized: () => true, // Force success
            },
        });
        service = interpret(machine).start();

        service.send('a');
        expect(service.state.value).toBe('authorized');
    });

    test('test trasition from idle to authFailed with event "a" whith guard failure ', () => {
        // Mocking guard behavior to force failure
        const machine = evChargingMachine.withConfig({
            guards: {
                isAuthorized: () => false, // Force failure
            },
        });
        service = interpret(machine).start();

        service.send('a');
        expect(service.state.value).toBe('authorizationFailed');
    });

    test('testing transition from idle to authorizationFailed on "f" event', () => {
        service.send('f');
        expect(service.state.value).toBe('authorizationFailed');
    });

    test('testing whether any state can be reset to idle state', () => {
        // Test from authorized state
        const machine = evChargingMachine.withConfig({
            guards: {
                isAuthorized: () => true, // Force success
            },
        });
        service = interpret(machine).start();

        service.send('a');
        service.send('r');
        expect(service.state.value).toBe('idle');

        // Test from charging state
        service.send('a'); // To authorized
        service.send('s'); // To starting
        service.send('c'); // To charging
        service.send('r'); // Reset to idle
        expect(service.state.value).toBe('idle');
    });

    test('should follow complete charging flow', () => {
        const machine = evChargingMachine.withConfig({
            guards: {
                isAuthorized: () => true, // Force success
            },
        });
        service = interpret(machine).start();

        service.send('a'); // Authorized
        expect(service.getSnapshot().value).toBe('authorized');

        service.send('s'); // Starting
        expect(service.getSnapshot().value).toBe('starting');

        service.send('c'); // Charging
        expect(service.getSnapshot().value).toBe('charging');

        service.send('t'); // Stopped
        expect(service.getSnapshot().value).toBe('stopped');
    });

    test('should not transition on invalid events', () => {
        service.send('s'); // Invalid in idle state
        expect(service.state.value).toBe('idle'); // State should remain idle
    });
});
