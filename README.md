
Config Editor Card to edit configuration.yaml from dashboard

Automaticly searches for `*.yaml` in the root and subfolders and lists in the dropdown menu.


![screenshot](https://github.com/junkfix/config-editor-card/raw/main/screenshot.png)



## Installation

### Step 1
You will **also** need to install a custom component https://github.com/junkfix/config-editor to reads/writes files

* **[HACS](https://hacs.xyz/)**

  Integration > `Config Editor`  


* **Manual**

  Download and copy `config_editor` directory in `custom_components` 

Restart home assistant.

Do one of the following:

* Settings > Devices > + Add Integration > Config Editor
* Edit configuration.yaml and add the following so it can load
   ```
   config_editor:
   ```


Restart home assistant.

### Step 2


* **[HACS](https://hacs.xyz/)**

  Frontend > `Config Editor Card`  

* **Manual** 
  
  Enable "Advanced Mode" from your user profile page
  
  add config-editor-card.js to your `<config>/www/` folder
  
  add url `/local/config-editor-card.js?v=1` from Configuration -> Lovelace Dashboards -> Resources panel when not using YAML mode




## Add in the sidebar 

Configuration > Dashboards > + Add dashboard
 
create a new tab in panel mode and add the card [more info](https://github.com/junkfix/config-editor-card/issues/29)
```yaml
type: custom:config-editor-card
```


It is also possible to add this using `+ Add Card` UI and choose `Custom: Config Editor Card`

#### To create a new file 
choose the first blank in dropdown menu and type some text and hit Save or ctrl+s

#### Advanced Config

| Name | Default | Description
| ---- | ------- | -----------
| file |  | autoload file eg. `home-assistant.log`
| readonly | `false` | read only
| hidefooter | `false` | 
| basic | `false` | Force basic editor
| size | `100` | font size
| depth | `2` | subfolder depth 0 or more

Please backup your files before using as there is no undo.
---

<a href="https://www.buymeacoffee.com/htmltiger" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/white_img.png" alt="Buy Me A Coffee"></a>
