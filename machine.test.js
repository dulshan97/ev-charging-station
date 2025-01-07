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
        
        const machine = evChargingMachine.withConfig({
            guards: {
                isAuthorized: () => true, 
            },
        });
        service = interpret(machine).start();

        service.send('a');
        expect(service.state.value).toBe('authorized');
    });

    test('test trasition from idle to authFailed with event "a" whith guard failure ', () => {
        
        const machine = evChargingMachine.withConfig({
            guards: {
                isAuthorized: () => false, 
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
        
        const machine = evChargingMachine.withConfig({
            guards: {
                isAuthorized: () => true, 
            },
        });
        service = interpret(machine).start();

        service.send('a');
        service.send('r');
        expect(service.state.value).toBe('idle');

        
        service.send('a'); 
        service.send('s'); 
        service.send('c'); 
        service.send('r'); 
        expect(service.state.value).toBe('idle');
    });

    test('should follow complete charging flow', () => {
        const machine = evChargingMachine.withConfig({
            guards: {
                isAuthorized: () => true, 
            },
        });
        service = interpret(machine).start();

        service.send('a'); 
        expect(service.getSnapshot().value).toBe('authorized');

        service.send('s'); 
        expect(service.getSnapshot().value).toBe('starting');

        service.send('c');
        expect(service.getSnapshot().value).toBe('charging');

        service.send('t'); 
        expect(service.getSnapshot().value).toBe('stopped');
    });

    test('should not transition on invalid events', () => {
        service.send('s'); 
        expect(service.state.value).toBe('idle'); 
    });
});
