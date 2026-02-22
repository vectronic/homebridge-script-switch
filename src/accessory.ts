import type {
    AccessoryConfig,
    AccessoryPlugin,
    API,
    CharacteristicValue,
    HAP,
    Logging,
    Service
} from 'homebridge';
import { exec } from 'child_process';

let hap: HAP;

class ScriptSwitch implements AccessoryPlugin {

    private readonly log: Logging;
    private readonly name: string;

    private readonly setOnStateScript: string | undefined;
    private readonly setOffStateScript: string | undefined;
    private readonly getStateScript: string;
    private readonly onStateValue: string;

    private readonly switchService: Service;
    private readonly informationService: Service;

    constructor(log: Logging, config: AccessoryConfig) {
        this.log = log;
        this.name = config.name;

        this.setOnStateScript = config.set_state_on_script;
        this.setOffStateScript = config.set_state_off_script;
        this.getStateScript = config.get_state_script || '/usr/bin/python';
        this.onStateValue = config.on_state_value;

        if (this.setOnStateScript !== undefined) {
            this.log(`setOnStateScript: ${this.setOnStateScript}`);
        }
        if (this.setOffStateScript !== undefined) {
            this.log(`setOffStateScript: ${this.setOffStateScript}`);
        }
        this.log(`getStateScript: ${this.getStateScript}`);
        this.log(`onStateValue: ${this.onStateValue}`);

        this.switchService = new hap.Service.Switch(this.name);
        this.switchService.getCharacteristic(hap.Characteristic.On)
            .onGet(async (): Promise<CharacteristicValue> => {
                try {
                    const stdout: string = await new Promise((resolve, reject) => {
                        exec(this.getStateScript, {},
                            (error, stdout) => {
                                if (error) {
                                    reject(error);
                                    return;
                                }
                                resolve(stdout);
                            });
                    });
                    log.debug('get state script returned: ' + stdout);
                    const on = (stdout.trim() === this.onStateValue);
                    log.debug('Returning switch state: ' + (on ? 'ON' : 'OFF'));
                    return on;
                } catch (err: unknown) {
                    log.error(`get state exec error: ${err}`);
                    throw err;
                }
            })
            .onSet(async (value: CharacteristicValue): Promise<void> => {
                const newOn = value as boolean;

                if (newOn && (this.setOnStateScript === undefined)) {
                    log.debug('Ignoring switch state ON as set_state_on_script is not configured');
                    return;
                }

                if (!newOn && (this.setOffStateScript === undefined)) {
                    log.debug('Ignoring switch state OFF as set_state_off_script is not configured');
                    return;
                }
                log.debug('Setting switch state: ' + (newOn ? 'ON' : 'OFF'));

                const setStateScript = (newOn ? this.setOnStateScript : this.setOffStateScript) as string;

                try {
                    const stdout = await new Promise((resolve, reject) => {
                        exec(setStateScript, {},
                            (error, stdout) => {
                                if (error) {
                                    reject(error);
                                    return;
                                }
                                resolve(stdout);
                            });
                    });
                    log.debug('set state script returned: ' + stdout);
                } catch (err: unknown) {
                    log.error(`set state exec error: ${err}`);
                    throw err;
                }

                log.debug('Switch state set to: ' + (newOn ? 'ON' : 'OFF'));
            });

        this.informationService = new hap.Service.AccessoryInformation()
            .setCharacteristic(hap.Characteristic.Manufacturer, 'Vectronic');

        log.info('Script switch finished initializing!');
    }

    identify(): void {
        this.log('Identify!');
    }

    getServices(): Service[] {
        return [
            this.informationService,
            this.switchService
        ];
    }
}

export default (api: API) => {
    hap = api.hap;
    api.registerAccessory('ScriptSwitch', ScriptSwitch);
};
