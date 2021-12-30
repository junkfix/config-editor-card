
Config Editor Card to edit configuration.yaml from dashboard

Automaticly searches for `*.yaml` in the root and subfolders and lists in the dropdown menu.


![screenshot](https://github.com/htmltiger/config-editor-card/raw/main/screenshot.png)

To create a new file choose the first blank in dropdown menu and type some text and hit Save

Please backup your files before using as there is no undo.

## Installation

### Step 1
You will also need to install a custom component https://github.com/htmltiger/config-editor

* **Manual**

  Download and copy `config_editor` directory in `custom_components` 


* **[HACS](https://hacs.xyz/)**

  Integration > `Config Editor`  


Restart home assistant.

Edit configuration.yaml and add the following so it can load
```
config_editor:
```
Restart home assistant.

### Step 2
* **Manual** 
 
  add config-editor-card.js to your `<config>/www/` folder
  
  add url `/local/config-editor-card.js?v=1` from Configuration -> Lovelace Dashboards -> Resources panel when not using YAML mode
  
  for YAML mode add the following to the `configuration.yaml` file:
  ```yaml
  lovelace:
    resources:
      - url: /local/config-editor-card.js?v=1
        type: module
  ```
  

* **[HACS](https://hacs.xyz/)**

  Frontend > `Config Editor Card`  
  add this (if in YAML mode):
  ```yaml
  lovelace:
    resources:
      - url: /hacsfiles/config-editor-card/config-editor-card.js
        type: module
  ```


## Add in the sidebar 

Configuration > Dashboards > + Add dashboard
 
create a new tab in panel mode and add the card
```yaml
type: custom:config-editor-card
```

It is also possible to add this using `+ Add Card` UI and choose `Custom: Config Editor Card`
