console.info("Config Editor 4.4");
const LitElement = window.LitElement || Object.getPrototypeOf(customElements.get("hui-masonry-view") );
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

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

static get styles() {
	return css`
	textarea{
		width:98%;
		height:80vh;
		padding:5px;
		overflow-wrap:normal;
		white-space:pre}
	.top{
		min-height:calc(95vh - var(--header-height))}
	.pin,.filebar{
		display:flex}
	.pin label{
		cursor:pointer}
	.right{text-align:right;
		flex-grow:1}
	.right button{
		font-family:Times,serif;
		font-weight:bold}
	.pin,.bar{
		position:-webkit-sticky;
		position:sticky;
		z-index:2;}
	.pin{
		top: var(--header-height, 0);
		background:var(--secondary-background-color)}
	.bar{
		bottom:0;
		z-index:2;
		background:var(--app-header-background-color);
		color:var(--app-header-text-color,white);
		white-space:nowrap;
		overflow:hidden;
		text-overflow:ellipsis}
	.bar i{
		background:#ff7a81;
		cursor:pointer}
	.bar select{
		flex-grow:1;
		text-overflow:ellipsis;
		width:100%;
		overflow:hidden}
	`;
}

render(){
	const hver=this._hass ? this._hass.states['config_editor.version']:0;
	if(!hver){return html`<ha-card>Missing 'config_editor:' in configuration.yaml
		for github.com/htmltiger/config-editor</ha-card>`;}
	if(hver.state != '4'){return html`<ha-card>Please upgrade
		github.com/htmltiger/config-editor</ha-card>`;}
	if(this.fileList.length<1){
		this.openedFile = this.localGet('Open')||'';
		this.edit.ext = this.localGet('Ext')||'yaml';
		this.edit.basic = this.localGet('Basic')||'';
		if(this.fileList = JSON.parse(this.localGet('List'+this.edit.ext))){
			if(this.extOk(this.openedFile)){
				setTimeout(this.oldText, 500, this);
			}
		}else{this.List();}
	}
	return html`
	<ha-card>
		<div class="top">
		<div class="pin">
			<div class="left"><button @click="${this.reLoad}">Reload</button></div>
			<div class="right">
			<button @click="${e=>this.txtSize(0)}">-</button>
			<button @click="${e=>this.txtSize(2)}">A</button>
			<button @click="${e=>this.txtSize(1)}">+</button>
			<select @change=${this.extChange}>
			${["yaml","py","json","conf","js","txt","log","all"].map(value =>
			html`<option ?selected=${value === this.edit.ext }
				value=${value}>${value.toUpperCase()}</option>`)}
			</select>
			<label>Basic Editor<input type="checkbox" ?checked=${this.edit.basic=='1'}
			name="basic" value="1" @change=${this.basicChange}></label>
			</div>
		</div>
		${(this.edit.basic || this.edit.coder ) ?
		html`<textarea rows="10" ?readonly=${!0==this.edit.readonly}
			@change=${this.updateText} id="code" @keydown=${this.saveKey}>${this.code}</textarea>`:
		html`<ha-code-editor id="code" mode="yaml" ?readOnly=${!0==this.edit.readonly}
			@keydown=${this.saveKey} .hass=${this._hass} @value-changed=${this.updateText}
			dir="ltr" autocomplete-entities autocomplete-icons></ha-code-editor>`}
		</div>
		${this.edit.hidefooter ? '' : html`
		<div class="bar">
			<div>${this.alertLine}</div>
			<div class="filebar">${!this.edit.readonly ?
			html`<button @click="${this.Save}">Save</button>`:''}
			<select @change=${this.Load}>
			${[''].concat(this.fileList).map(value =>
			html`<option ?selected=${value === this.openedFile}
				value=${value}>${value}</option>`)}
			</select>
			<button @click="${this.List}">Get List</button>
			</div>
			<code>#${this.infoLine}</code>
		</div>`}
	</ha-card>
`;

}

txtSize(e){
	if(e<3){
		if(e>1){
			this.edit.size=100;
		}else if(e>0){
			this.edit.size+=5;
		}else{
			this.edit.size-=5;
		}
		this.localSet('Size', this.edit.size);
		this.infoLine = 'size: '+this.edit.size;
	}
	this.renderRoot.querySelector('#code').style.fontSize=this.edit.size+'%';
}

extChange(e){
	this.edit.ext = e.target.value;
	this.localSet('Ext', this.edit.ext);
	this.openedFile = '';
	this.oldText(this);
	this.List();
}

basicChange(){
	this.edit.basic = this.edit.basic?'':'1';
	this.localSet('Basic', this.edit.basic);
	this.reLoad();
}

updateText(e) {
	e.stopPropagation();
	this.code = this.edit.basic ? e.target.value : e.detail.value;
	if(this.openedFile){this.localSet('Text', this.code);}
}

Unsave(){
	this.code = this.localGet('Unsaved');
	this.renderRoot.querySelector('#code').value=this.code;
	this.localSet('Unsaved','');
	this.alertLine = '';
	this.Toast("Loaded from browser",1500);
}

localGet(e){
	return localStorage.getItem('config_editor'+e);
}

localSet(k,v){
	localStorage.setItem('config_editor'+k,v);
}

cmd(action, data, file){
	return this._hass.callWS({type: "config_editor/ws", action: action,
	data: data, file: file, ext: this.edit.ext, depth: this.edit.depth});
}

saveList(){
	this.localSet('List'+this.edit.ext, JSON.stringify(this.fileList));
}

reLoad(e){
	this.Load({target:{value:this.openedFile},reload:1});
}
oldText(dhis){
	dhis.Load({target:{value:dhis.openedFile}});
}

saveKey(e) {
	if((e.key == 'S' || e.key == 's' ) && (e.ctrlKey || e.metaKey)){
		e.preventDefault();
		this.Save();
		return false;
	}
	return true;
}


Toast(message, duration){
	const e = new Event("hass-notification",
		{bubbles: true, cancelable: false, composed: true});
	e.detail = {message, duration, dismissable: true,
		//action: {text:"Save",action:()=>{this.sureSave();}},
	};
	document.querySelector("home-assistant").dispatchEvent(e);
}
//sureSave(){console.log(this.openedFile);}

async Coder(){
	const c="ha-yaml-editor";
	if(!customElements.get(c)){
		await customElements.whenDefined("partial-panel-resolver");
		const p = document.createElement('partial-panel-resolver');
		p.hass = {panels: [{url_path: "tmp", component_name: "config"}]};
		p._updateRoutes();
		await p.routerOptions.routes.tmp.load();
		const d=document.createElement("ha-panel-config");
		await d.routerOptions.routes.automation.load();
	}
	const a=document.createElement(c);
	this.edit.coder=0;
	if(!a){
		this.localSet('Basic', 1);
		console.log('failed '+c);
	}
	this.render();
}

async List(){
	this.infoLine = 'List Loading...';
	const e=await this.cmd('list','','');
	this.infoLine = e.msg;
	this.fileList = e.file.slice().sort();
	this.saveList();
	if(this.extOk(this.openedFile)){
		setTimeout(this.oldText, 500, this);
	}
}

async Load(x) {
	if(x.target.value == this.openedFile && this.code && !x.hasOwnProperty('reload')){return;}
	if(this.edit.orgCode.trim() != this.code.trim()){
		if(!confirm("Switch without Saving?")){x.target.value = this.openedFile; return;}
	}
	this.code = ''; this.renderRoot.querySelector('#code').value='';this.infoLine = '';
	this.openedFile = x.target.value;
	if(this.openedFile){
		this.infoLine = 'Loading: '+this.openedFile;
		const e=await this.cmd('load','',this.openedFile);
		this.openedFile = e.file;
		this.infoLine = e.msg;
		this.Toast(this.infoLine,1000);
		const uns={f:this.localGet('Open'),
			d:this.localGet('Text')};
		if(uns.f == this.openedFile && uns.d && uns.d != e.data){
			this.localSet('Unsaved', uns.d);
			this.alertLine = html`<i @click="${this.Unsave}"> 
			Load unsaved from browser </i>`;
		}else{
			this.localSet('Text','');this.alertLine = '';
		}
		this.renderRoot.querySelector('#code').value=e.data;
		this.code = e.data;
	}
	this.edit.orgCode = this.code;
	this.localSet('Open', this.openedFile);
	this.txtSize(3);
}

extOk(f){
	if(f.length && (this.edit.ext=='all' || f.endsWith("."+this.edit.ext) )){return 1;}
	return 0;
}

async Save() {
	if(this.renderRoot.querySelector('#code').value != this.code || this.edit.readonly){
		this.infoLine='Something not right!';
		return;
	}
	let savenew=0;
	if(!this.openedFile && this.code){
		this.openedFile=prompt("type abc."+this.edit.ext+" or folder/abc."+this.edit.ext);
		savenew=1;
	}
	if(this.extOk(this.openedFile)){
		if(!confirm("Save?")){if(savenew){this.openedFile='';}return;}
		if(!this.code){this.infoLine=''; this.infoLine = 'Text is empty!'; return;}
		this.infoLine = 'Saving: '+this.openedFile;
		const e=await this.cmd('save', this.code, this.openedFile);
		this.infoLine = e.msg;
		this.Toast(this.infoLine,2000);
		if(e.msg.includes('Saved:')){
			this.localSet('Text','');
			if(savenew){
				this.fileList.unshift(this.openedFile);
				this.saveList();
			}
		}
	}else{this.openedFile='';}
	this.edit.orgCode = this.code;
}

getCardSize() {
	return 5;
}

setConfig(config) {
	this.edit = {file: '', hidefooter: false, readonly: false, basic: false, size: 0, depth: 2, ext: '', orgCode: '', coder:1, ...config};
	if(this.edit.file){
		const f=this.edit.file.split('.')[1];
		if(f){
			this.localSet('Open', this.edit.file);
			this.localSet('Ext', f);
		}
	}
	if(!this.edit.size){
		this.edit.size=Number(this.localGet('Size'))||100;
	}
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
