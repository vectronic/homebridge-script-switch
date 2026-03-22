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
| set_state_off_script       | Script to set state OFF, optional. If not provided, setting switch Off from Home App is not possible.                                                   |
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

## Examples

### Switch that stays ON until a task completes

A common use case is to trigger a long-running task and have the switch remain ON for the duration, automatically switching OFF once the task finishes.

The key mechanism is that `set_state_on_script` **blocks** until the shell command exits. While the command is running the switch appears ON in the Home app. Once the command exits, Homebridge refreshes the switch state by calling `get_state_script`; if that returns something other than `on_state_value`, the switch will be shown as OFF.

```json
"accessories": [
    {
        "accessory": "ScriptSwitch",
        "name": "Run Backup",
        "set_state_on_script": "/usr/local/bin/backup.sh",
        "set_state_off_script": "echo 'OFF'",
        "get_state_script": "echo 'OFF'",
        "on_state_value": "ON"
    }
]
```

How it works:

- **Turning the switch ON** triggers `set_state_on_script`, which runs `backup.sh` and blocks until it finishes. The switch appears ON in the Home app for the entire duration.
- **Once `backup.sh` exits**, Homebridge calls `get_state_script` to refresh the state. Because `get_state_script` outputs `OFF` (which does not match `on_state_value`), the switch automatically returns to OFF.
- **`set_state_off_script`** allows the switch to be turned OFF manually if needed before the task has finished.

## Help

If you have a query or problem, raise an issue in GitHub, or better yet submit a PR!
