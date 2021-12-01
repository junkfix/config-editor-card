
Config Editor Card to edit configuration.yaml from dashboard

Automaticly searches for `*.yaml` in the root and subfolders and lists in the dropdown menu.


![screenshot](https://github.com/htmltiger/config-editor-card/raw/main/screenshot.png)

Please backup your files before using as there is no undo.

## Installation

### Step 1
You will also need to install a custom component https://github.com/htmltiger/config-editor

_Manual_
Download and copy `config_editor` directory in `custom_components`

_OR_ [HACS](https://hacs.xyz/) > Integration > `Config Editor`  

edit configuration.yaml and add the following so it can load
```
config_editor:
```

### Step 2
Manually add config-editor-card.js
to your `<config>/www/` folder and add the following to the `configuration.yaml` file:
```yaml
lovelace:
  resources:
    - url: /local/config-editor-card.js?v=1
      type: module
```

_OR_ install using [HACS](https://hacs.xyz/) and add this (if in YAML mode):
```yaml
lovelace:
  resources:
    - url: /hacsfiles/config-editor-card/config-editor-card.js
      type: module
```

The above configuration can be managed directly in the Configuration -> Lovelace Dashboards -> Resources panel when not using YAML mode,
or added by clicking the "Add to lovelace" button on the HACS dashboard after installing the plugin.




For the dashboard, create a new tab in panel mode and add a card
```
type: custom:config-editor-card
```

It is also possible to add this using `+ Add Card` UI and choose `Custom: Config Editor Card`
