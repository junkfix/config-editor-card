console.info("Config Editor 1.4");
const LitElement = window.LitElement || Object.getPrototypeOf(customElements.get("hui-masonry-view") );
const html = LitElement.prototype.html;

class ConfigEditor extends LitElement {
	
static get properties() {
	return {
		_hass: {type: Object},
		code: {type: String},
		fileList: {type: Array},
		openedFile: {type: String},
		infoLine: {type: String},
	};
}

constructor() {
	super();
	this.code = '';
	this.fileList = [];
	this.openedFile = '';
	this.infoLine = '';
}

render() {
	if(!this._hass.states['config_editor.version']){return html`<ha-card>Missing 'config_editor:' in configuration.yaml for github.com/htmltiger/config-editor</ha-card>`;}
	if(this.fileList.length<1){
		this.List()
	}
	return html`
	<ha-card>
		<ha-code-editor id="code" mode="yaml" @value-changed=${this.updateText}></ha-code-editor>
		<div style="position: -webkit-sticky; position: sticky; bottom: 0; z-index:2; background: var( --ha-card-background, var(--card-background-color, white) )">
		<code>#${this.infoLine}</code>
		<div>		
		<button @click="${this.List}">Get List</button>
		<select @change=${this.Load}>
		${[''].concat(this.fileList).map(value => html`<option ?selected=${value === this.openedFile } value=${value}>${value}</option>`)}
		</select>
		<button @click="${this.Save}">Save</button>
		</div>
		</div>
	</ha-card>
`;
}

updateText(e) {
	this.code = e.detail.value;
}

async Coder(){
	if(customElements.get("developer-tools-event")){return;}
	await customElements.whenDefined("partial-panel-resolver");
	const p = document.createElement('partial-panel-resolver');
	p.hass = {panels: [{url_path: "tmp", component_name: "developer-tools"}]};
	p._updateRoutes();
	await p.routerOptions.routes.tmp.load()
	await customElements.whenDefined("developer-tools-router");
	const d = document.createElement("developer-tools-router");
	await d.routerOptions.routes.event.load();
}
async List(){
	this.infoLine = 'List Loading...';
	const e=(await this._hass.callWS({type: "config_editor/ws", action: 'list', data: '', file: ''}));
	this.fileList = e.file.slice().sort();
	this.infoLine = e.msg;
}
async Load(x) {
	this.code = ''; this.renderRoot.querySelector('#code').value='';this.infoLine = '';
	this.openedFile = x.target.value
	if(!this.openedFile){return;}
	this.infoLine = 'Loading: '+this.openedFile;
	const e=(await this._hass.callWS({type: "config_editor/ws", action: 'load', data: '', file: this.openedFile}));
	this.openedFile = e.file;
	this.infoLine = e.msg;
	this.renderRoot.querySelector('#code').value=e.data;
	this.code = e.data;
}
async Save() {
	if(this.renderRoot.querySelector('#code').value != this.code){
		this.infoLine='Something not right!';
		return;
	}
	if(!this.openedFile && this.code){
		this.openedFile=prompt("type abc.yaml or folder/abc.yaml");
	}
	if(this.openedFile && this.openedFile.endsWith(".yaml")){
		if(!this.code){this.infoLine='';this.infoLine = 'Text is empty!'; return;}
		this.infoLine = 'Saving: '+this.openedFile;
		const e=(await this._hass.callWS({type: "config_editor/ws", action: 'save', data: this.code, file: this.openedFile}));
		this.infoLine = e.msg;
	}else{this.openedFile='';}
}

getCardSize() {
	return 5;
}

setConfig(config) {
	this.Coder();
}

set hass(hass) {
	this._hass = hass;
}

shouldUpdate(changedProps) {
	if( changedProps.has('code') || changedProps.has('openedFile') || changedProps.has('fileList') || changedProps.has('infoLine') ){return true;}
}

} customElements.define('config-editor-card', ConfigEditor);

window.customCards = window.customCards || [];
window.customCards.push({
	type: 'config-editor-card',
	name: 'Config Editor Card',
	preview: false,
	description: 'Basic editor for configuration.yaml'
});
