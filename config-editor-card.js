((LitElement) => {

console.info("Config Editor 1");
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

class ConfigEditor extends LitElement {
	
static get properties() {
	return {
		_hass: {},
		code: {type: String},
		fileList: {type: Array},
		openedFile: {type: String},
		infoLine: {type: String},
	}
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
		<code>${this.infoLine}</code>
		<div>
		<button @click="${this.List}">Get List</button>
		<select @change=${this.Load} >
		<option value=""></option>
		${this.fileList.map(value => html`<option ?selected=${value === this.openedFile } value=${value}>${value}</option>`)}
		</select>
		<button @click="${this.Save}">Save</button>
		</div>
		<textarea rows="10" @focusout=${this.updateText} id="code">${this.code}</textarea>
	</ha-card>
`;
}

updateText(e) {
	this.code = e.target.value;
}

async List(){
	this.infoLine = 'List Loading...';
	const e=(await this._hass.callWS({type: "config_editor/ws", action: 'list', data: '', file: ''}));
	this.fileList = e.file;
	this.infoLine = e.msg;
}
async Load(x) {
	this.code = ''; this.renderRoot.querySelector('#code').value='';this.infoLine = ':';
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
	if(!this.openedFile || this.renderRoot.querySelector('#code').value != this.code){
		this.infoLine='Something not right!';
		return;
	}
	if(!this.code){this.infoLine='';this.infoLine = 'Text is empty!'; return;}
	this.infoLine = 'Saving: '+this.openedFile;
	const e=(await this._hass.callWS({type: "config_editor/ws", action: 'save', data: this.code, file: this.openedFile}));
	this.infoLine = e.msg;
	
}

static get styles() {
	return css`
	textarea{width:98%;height:80vh;padding:5px}
	`;
}

getCardSize() {
	return 5;
}

setConfig(config) {
}

set hass(hass) {
	this._hass = hass;
}

shouldUpdate(changedProps) {
	if( changedProps.has('code') || changedProps.has('openedFile') || changedProps.has('fileList') || changedProps.has('infoLine')  ){return true;}
}

} customElements.define('config-editor-card', ConfigEditor);



})(window.LitElement || Object.getPrototypeOf(customElements.get("hui-masonry-view") ));

window.customCards = window.customCards || [];
window.customCards.push({
	type: 'config-editor-card',
	name: 'Config Editor Card',
	preview: false,
	description: 'Basic editor for configuration.yaml'
});

