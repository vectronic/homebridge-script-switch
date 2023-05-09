# homebridge-script-switch

> A switch plugin for [Homebridge](https://homebridge.io) which integrates with shell scripts

## Installation

1. Install this plugin using the Homebridge Config UI X or via commandline `npm install -g @vectronic/homebridge-script-switch`
1. Setup the plugin's configuration

## Configuration

| Property                  | Description                                                                                                                                             |
|---------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|
| name                      | The name for the accessory instance.                                                                                                                    |
| set_state_on_script       | Script to set state ON, optional. If not provided, setting switch On from Home App is not possible.                                                     |
| set_state_on_script       | Script to set state OFF, optional. If not provided, setting switch Off from Home App is not possible.                                                   |
| get_state_script          | Script to get the current switch state. Should output on stdout text signifying "On" which matches `on_state_value` and anything else ot signify "Off". |
| on_state_value            | Return value from get_state_script which corresponds to ON state.                                                                                       |

Example `config.json` entry:

```json
"accessories": [
    {
        "accessory": "ScriptSwitch",
        "name": "mySwitch",
        "set_state_on_script": "/usr/local/bin/setMySwitchOn.sh",
        "set_state_off_script": "/usr/local/bin/setMySwitchOff.sh",
        "get_state_script": "/usr/local/bin/getMySwitchState.sh",
        "on_state_value": "ON"
    }
]
```

## Help

If you have a query or problem, raise an issue in GitHub, or better yet submit a PR!
