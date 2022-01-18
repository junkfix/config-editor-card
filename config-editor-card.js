console.info("Config Editor 3.2");
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
		alertLine: {type: String},
		edit: {},
	};
}

constructor() {
	super();
	this.code = '';
	this.fileList = [];
	this.openedFile = '';
	this.infoLine = '';
	this.alertLine = '';
}

render() {
	const hver=this._hass.states['config_editor.version']
	if(!hver){return html`<ha-card>Missing 'config_editor:' in configuration.yaml
		for github.com/htmltiger/config-editor</ha-card>`;}
	if(hver.state != '3'){console.log(hver);return html`<ha-card>Please upgrade
		github.com/htmltiger/config-editor</ha-card>`;}
	if(this.fileList.length<1){
		this.openedFile = localStorage.getItem('config_editorOpen');
		this.edit.plainBox = localStorage.getItem('config_editorPlain') ? true : false;
		this.edit.ext = localStorage.getItem('config_editorExt');
		if(!this.edit.ext){this.edit.ext='yaml';}
		if(!this.openedFile){
			this.openedFile = '';
		}
		this.List();
	}
	
	return html`
	<ha-card>
		<div style="min-height: calc(100vh - var(--header-height));">
		<div style="text-align:right">
			<select @change=${this.extChange}>
			${["yaml","py","json","conf","js","txt","log"].map(value =>
			html`<option ?selected=${value === this.edit.ext }
				value=${value}>${value.toUpperCase()}</option>`)}
			</select>
			<label style="cursor:pointer">Plain text <input type="checkbox"
			?checked=${true === this.edit.plainBox }
			name="plain" value="1" @change=${this.plainChange}></label>
		</div>
		${this.edit.plainBox ?
		html`<textarea
		style="width:98%;height:80vh;padding:5px;overflow-wrap:normal;white-space:pre"
		rows="10" @change=${this.updateText} id="code">${this.code}</textarea>` :
		html`<ha-code-editor id="code" mode="yaml"
		@value-changed=${this.updateText}></ha-code-editor>`}
		</div>
		<div style="position:-webkit-sticky;position:sticky;bottom:0;z-index:2;
		background:var(--app-header-background-color);
		color:var(--app-header-text-color,white)">
			<div>${this.alertLine}</div>
			<div>		
			<button @click="${this.List}">Get List</button>
			<select @change=${this.Load}>
			${[''].concat(this.fileList).map(value =>
			html`<option ?selected=${value === this.openedFile}
				value=${value}>${value}</option>`)}
			</select>
			<button @click="${this.Save}">Save</button>
			</div>
			<code>#${this.infoLine}</code>
		</div>
	</ha-card>
`;
}

extChange(e){
	this.edit.ext = e.target.value;
	localStorage.setItem('config_editorExt',this.edit.ext);
	this.openedFile = '';
	this.oldText(this);
	this.List();
}

plainChange(e){
	if(this.edit.plainBox = !this.edit.plainBox){
		localStorage.setItem('config_editorPlain','1');
	}else{
		localStorage.removeItem('config_editorPlain');
	}
	this.List();
}

updateText(e) {
	this.code = this.edit.plainBox ? e.target.value : e.detail.value;
	if(this.openedFile){localStorage.setItem('config_editorText', this.code);}
}

Unsave(){
	this.code = localStorage.getItem('config_editorUnsaved');
	this.renderRoot.querySelector('#code').value=this.code;
	localStorage.removeItem('config_editorUnsaved');
	this.alertLine = '';
}

async oldText(dhis){
	dhis.Load({target:{value:dhis.openedFile}});
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
	const e=(await this._hass.callWS({type: "config_editor/ws", action: 'list',
		data: '', file: '', ext: this.edit.ext}));
	this.infoLine = e.msg;
	this.fileList = e.file.slice().sort();
	if(this.openedFile.endsWith("."+this.edit.ext)){
		setTimeout(this.oldText, 500, this);
	}	
}

async Load(x) {
	this.code = ''; this.renderRoot.querySelector('#code').value='';this.infoLine = '';
	this.openedFile = x.target.value
	if(this.openedFile){
		this.infoLine = 'Loading: '+this.openedFile;
		const e=(await this._hass.callWS({type: "config_editor/ws", action: 'load',
			data: '', file: this.openedFile, ext: this.edit.ext}));
		this.openedFile = e.file;
		this.infoLine = e.msg;
		const uns={f:localStorage.getItem('config_editorOpen'),
			d:localStorage.getItem('config_editorText')};
		if(uns.f == this.openedFile && uns.d && uns.d != e.data){
			localStorage.setItem('config_editorUnsaved', uns.d);
			this.alertLine = html`<i style="background:#ff7a81;cursor:pointer"
				@click="${this.Unsave}"> Load unsaved from browser </i>`;
		}else{
			localStorage.removeItem('config_editorText');this.alertLine = '';
		}
		this.renderRoot.querySelector('#code').value=e.data;
		this.code = e.data;
	}
	localStorage.setItem('config_editorOpen', this.openedFile);
}
async Save() {
	if(this.renderRoot.querySelector('#code').value != this.code){
		this.infoLine='Something not right!';
		return;
	}
	if(!this.openedFile && this.code){
		this.openedFile=prompt("type abc."+this.edit.ext+" or folder/abc."+this.edit.ext);
	}
	if(this.openedFile && this.openedFile.endsWith("."+this.edit.ext)){
		if(!this.code){this.infoLine='';this.infoLine = 'Text is empty!'; return;}
		this.infoLine = 'Saving: '+this.openedFile;
		const e=(await this._hass.callWS({type: "config_editor/ws", action: 'save',
			data: this.code, file: this.openedFile, ext: this.edit.ext}));
		this.infoLine = e.msg;
		localStorage.removeItem('config_editorText');
	}else{this.openedFile='';}
	
}

getCardSize() {
	return 5;
}

setConfig(config) {
	this.edit = {options: config, plainBox: false, ext: ''};
	this.Coder();
}

set hass(hass) {
	this._hass = hass;
}

shouldUpdate(changedProps) {
	for(const e of ['code','openedFile','fileList','infoLine','alertLine','edit']) {
		if(changedProps.has(e)){return true;}
	}
}

} customElements.define('config-editor-card', ConfigEditor);

window.customCards = window.customCards || [];
window.customCards.push({
	type: 'config-editor-card',
	name: 'Config Editor Card',
	preview: false,
	description: 'Basic editor for configuration.yaml'
});
