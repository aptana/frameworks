if(typeof Rico=='undefined') throw("LiveGridForms requires the Rico JavaScript framework");
if(typeof RicoUtil=='undefined') throw("LiveGridForms requires the RicoUtil object");
if(typeof RicoTranslate=='undefined') throw("LiveGridForms requires the RicoTranslate object");


Rico.TableEdit = Class.create();

Rico.TableEdit.prototype = {

  initialize: function(liveGrid) {
    Rico.writeDebugMsg('Rico.TableEdit initialize: '+liveGrid.tableId);
    this.grid=liveGrid;
    this.options = {
      maxDisplayLen    : 20,    // max displayed text field length
      panelHeight      : 200,   // size of tabbed panels
      panelWidth       : 500,
      hoverClass       : 'tabHover',
      selectedClass    : 'tabSelected',
      compact          : false,    // compact corners
      RecordName       : 'record',
      readOnlyColor    : '#AAA',   // read-only fields displayed using this color
      showSaveMsg      : 'errors'  // disposition of database update responses (full - show full response, errors - show full response for errors and short response otherwise)
    }
    Object.extend(this.options, liveGrid.options);
    this.menu=liveGrid.menu;
    this.menu.options.dataMenuHandler=this.editMenu.bind(this);
    this.menu.ignoreClicks();
    RicoEditControls.atLoad();
    this.createEditDiv();
    this.saveMsg=$(liveGrid.tableId+'_savemsg');
    Event.observe(document,"click", this.clearSaveMsg.bindAsEventListener(this), false);
    this.TEerror=false;
    this.extraMenuItems=new Array();
    this.responseHandler=this.processResponse.bind(this);
  },
  
  createEditDiv: function() {

    // create editDiv (form)
    
    this.requestCount=1;
    this.editDiv = this.grid.createDiv('edit',document.body);
    this.editDiv.style.display='none';
    if (this.options.canEdit || this.options.canAdd) {
      this.startForm();
      this.createForm(this.form);
    } else {
      var button=this.createButton("Close");
      Event.observe(button,"click", this.cancelEdit.bindAsEventListener(this), false);
      this.createForm(this.editDiv);
    }
    this.editDivCreated=true;
    this.formPopup=new Rico.Popup({ignoreClicks:true},this.editDiv);

    // create responseDialog
    
    this.responseDialog = this.grid.createDiv('editResponse',document.body);
    this.responseDialog.style.display='none';
    
    var button = document.createElement('button');
  	button.appendChild(document.createTextNode('OK'));
    button.onclick=this.ackResponse.bindAsEventListener(this);
    this.responseDialog.appendChild(button);

    this.responseDiv = this.grid.createDiv('editResponseText',this.responseDialog);

    if (this.panelGroup) {
      Rico.writeDebugMsg("createEditDiv complete, requestCount="+this.requestCount);
      setTimeout(this.initPanelGroup.bind(this),50);
    }
  },
  
  initPanelGroup: function() {
    this.requestCount--;
    Rico.writeDebugMsg("initPanelGroup: "+this.requestCount);
    if (this.requestCount>0) return;
    var wi=parseInt(this.options.panelWidth);
    this.form.style.width=(wi+10)+'px';
    if (Prototype.Browser.WebKit) this.editDiv.style.display='block';  // this causes display to flash briefly
    this.options.bgColor = Rico.Color.createColorFromBackground(this.form);
    this.editDiv.style.display='none';
    this.options.panelHdrWidth=(Math.floor(wi / this.options.panels.length)-4)+'px';
    this.Accordion=new Rico.TabbedPanel(this.panelHdr.findAll(this.notEmpty), this.panelContent.findAll(this.notEmpty), this.options);
  },
  
  notEmpty: function(v) {
    return typeof(v)!='undefined';
  },
  
  startForm: function() {
    this.form = document.createElement('form');
    this.form.onsubmit=function() {return false;};
    this.editDiv.appendChild(this.form);

    var tab = document.createElement('table');
    var row = tab.insertRow(-1);
    var cell = row.insertCell(-1);
    var button=cell.appendChild(this.createButton("Save \t"+this.options.RecordName));
    Event.observe(button,"click", this.TESubmit.bindAsEventListener(this), false);
    var cell = row.insertCell(-1);
    var button=cell.appendChild(this.createButton("Cancel"));
    Event.observe(button,"click", this.cancelEdit.bindAsEventListener(this), false);
    this.form.appendChild(tab);

    // hidden fields
    this.hiddenFields = document.createElement('div');
    this.hiddenFields.style.display='none';
    this.action = this.appendHiddenField(this.grid.tableId+'__action','');
    for (var i=0; i<this.grid.columns.length; i++) {
      var fldSpec=this.grid.columns[i].format;
      if (fldSpec && fldSpec.FormView && fldSpec.FormView=="hidden")
        this.appendHiddenField(fldSpec.FieldName,fldSpec.ColData);
    }
    this.form.appendChild(this.hiddenFields);
  },
  
  createButton: function(buttonLabel) {
    var button = document.createElement('button');
    buttonLabel=RicoTranslate.getPhrase(buttonLabel);
  	button.innerHTML="<span style='text-decoration:underline;'>"+buttonLabel.charAt(0)+"</span>"+buttonLabel.substr(1);
    button.accessKey=buttonLabel.charAt(0);
    return button;
  },
  
  createPanel: function(i) {
    var hasFields=false;
    for (var j=0; j<this.grid.columns.length; j++) {
      var fldSpec=this.grid.columns[j].format;
      if (!fldSpec) continue;
      if (!fldSpec.EntryType) continue
      if (fldSpec.EntryType=='H') continue;
      var panelIdx=fldSpec.panelIdx || 0;
      if (panelIdx==i) {
        hasFields=true;
        break;
      }
    }
    if (!hasFields) return false;
    this.panelHdr[i] = document.createElement('div');
    this.panelHdr[i].className='tabHeader';
    this.panelHdr[i].innerHTML=this.options.panels[i];
    this.panelHdrs.appendChild(this.panelHdr[i]);
    this.panelContent[i] = document.createElement('div');
    this.panelContent[i].className='tabContent';
    this.panelContents.appendChild(this.panelContent[i]);
    return true;
  },
  
  createForm: function(parentDiv) {
    var tables=[];
    this.panelHdr=[];
    this.panelContent=[];
    if (this.options.panels) {
      this.panelGroup = document.createElement('div');
      this.panelGroup.className='tabPanelGroup';
      this.panelHdrs = document.createElement('div');
      this.panelGroup.appendChild(this.panelHdrs);
      this.panelContents = document.createElement('div');
      this.panelContents.className='tabContentContainer';
      this.panelGroup.appendChild(this.panelContents);
      parentDiv.appendChild(this.panelGroup);
      if (this.grid.direction=='rtl') {
        for (var i=this.options.panels.length-1; i>=0; i--)
          if (this.createPanel(i))
            tables[i]=this.createFormTable(this.panelContent[i],'tabContent');
      } else {
        for (var i=0; i<this.options.panels.length; i++)
          if (this.createPanel(i))
            tables[i]=this.createFormTable(this.panelContent[i],'tabContent');
      }
      parentDiv.appendChild(this.panelGroup);
    } else {
      var div=document.createElement('div');
      div.className='noTabContent';
      tables[0]=this.createFormTable(div);
      parentDiv.appendChild(div);
    }
    for (var i=0; i<this.grid.columns.length; i++) {
      var fldSpec=this.grid.columns[i].format;
      if (!fldSpec) continue;
      var panelIdx=fldSpec.panelIdx || 0;
      if (tables[panelIdx]) this.appendFormField(this.grid.columns[i],tables[panelIdx]);
    }
  },
  
  createFormTable: function(div) {
    var tab=document.createElement('table');
    tab.border=0;
    div.appendChild(tab);
    return tab;
  },
  
  appendHiddenField: function(name,value) {
    var field=RicoUtil.createFormField(this.hiddenFields,'input','hidden',name,name);
    field.value=value;
    return field;
  },
  
  appendFormField: function(column, table) {
    if (!column.format.EntryType) return;
    if (column.format.EntryType=="H") return;
    if (column.format.FormView) return;
    Rico.writeDebugMsg('appendFormField: '+column.format.Hdg+' - '+column.format.EntryType);
    var row = table.insertRow(-1);
    var hdr = row.insertCell(-1);
    column.formLabel=hdr;
    if (hdr.noWrap) hdr.noWrap=true;
    var entry = row.insertCell(-1);
    if (entry.noWrap) entry.noWrap=true;
    hdr.innerHTML=column.format.Hdg;
    hdr.className='ricoEditLabel';
    if (column.format.Help) {
      hdr.title=column.format.Help;
      hdr.className='ricoEditLabelWithHelp';
    }
    var field, name=column.format.FieldName;
    switch (column.format.EntryType) {
      case 'TA','tinyMCE':
        field=RicoUtil.createFormField(entry,'textarea',null,name);
        field.cols=column.format.TxtAreaCols;
        field.rows=column.format.TxtAreaRows;
        field.innerHTML=column.format.ColData;
        hdr.style.verticalAlign='top';
        break;
      case 'R':
      case 'RL':
        field=RicoUtil.createFormField(entry,'div',null,name);
        if (column.format.isNullable)
          this.addSelectOption(field,this.options.TableSelectNone,"(none)");
        this.selectValuesRequest(field,column.format);
        break;
      case 'N':
        field=RicoUtil.createFormField(entry,'select',null,name);
        if (column.format.isNullable)
          this.addSelectOption(field,this.options.TableSelectNone,"(none)");
        field.onchange=this.checkSelectNew.bindAsEventListener(this);
        this.selectValuesRequest(field,column.format);
        field=document.createElement('span');
        field.className='ricoEditLabel';
        field.id='labelnew__'+column.format.FieldName;
        field.innerHTML='&nbsp;&nbsp;&nbsp;New&nbsp;value:';
        entry.appendChild(field);
        name='textnew__'+column.format.FieldName;
        field=RicoUtil.createFormField(entry,'input','text',name,name);
        break;
      case 'S':
      case 'SL':
        field=RicoUtil.createFormField(entry,'select',null,name);
        if (column.format.isNullable)
          this.addSelectOption(field,this.options.TableSelectNone,"(none)");
        this.selectValuesRequest(field,column.format);
        break;
      default:
        field=RicoUtil.createFormField(entry,'input','text',name,name);
        if (column.format.Length) {
          field.maxLength=column.format.Length;
          field.size=Math.min(column.format.Length, this.options.maxDisplayLen);
        }
        field.value=column.format.ColData;
        break;
    }
    if (field) {
      if (column.format.SelectCtl)
        RicoEditControls.applyTo(column,field);
    }
  },
  
  checkSelectNew: function(e) {
    this.updateSelectNew(Event.element(e));
  },
  
  updateSelectNew: function(SelObj) {
    var vis=(SelObj.value==this.options.TableSelectNew) ? "" : "hidden";
    $("labelnew__" + SelObj.id).style.visibility=vis
    $("textnew__" + SelObj.id).style.visibility=vis
  },

  selectValuesRequest: function(elem,fldSpec) {
    if (fldSpec.SelectValues) {
      var valueList=fldSpec.SelectValues.split(',');
      for (var i=0; i<valueList.length; i++)
        this.addSelectOption(elem,valueList[i],valueList[i],i);
    } else {
      this.requestCount++;
      var options={};
      Object.extend(options, this.grid.buffer.ajaxOptions);
      options.parameters = 'id='+fldSpec.FieldName+'&offset=0&page_size=-1';
      options.onComplete = this.selectValuesUpdate.bind(this);
      new Ajax.Request(this.grid.buffer.dataSource, options);
      Rico.writeDebugMsg("selectValuesRequest: "+options.parameters);
    }
  },
  
  selectValuesUpdate: function(request) {
    var response = request.responseXML.getElementsByTagName("ajax-response");
    Rico.writeDebugMsg("selectValuesUpdate: "+request.status);
    if (response == null || response.length != 1) return;
    response=response[0];
    var error = response.getElementsByTagName('error');
    if (error.length > 0) {
      Rico.writeDebugMsg("Data provider returned an error:\n"+RicoUtil.getContentAsString(error[0],this.grid.buffer.isEncoded));
      alert(RicoTranslate.getPhrase("The request returned an error")+":\n"+RicoUtil.getContentAsString(error[0],this.grid.buffer.isEncoded));
      return null;
    }
    response=response.getElementsByTagName('response')[0];
    var id = response.getAttribute("id").slice(0,-8);
    var rowsElement = response.getElementsByTagName('rows')[0];
    var rows = this.grid.buffer.dom2jstable(rowsElement);
    var elem=$(id);
    //alert('selectValuesUpdate:'+id+' '+elem.tagName);
    Rico.writeDebugMsg("selectValuesUpdate: id="+id+' rows='+rows.length);
    for (var i=0; i<rows.length; i++) {
      if (rows[i].length>0) {
        var c0=rows[i][0].content;
        var c1=(rows[i].length>1) ? rows[i][1].content : c0;
        this.addSelectOption(elem,c0,c1,i);
      }
    }
    if ($('textnew__'+id))
      this.addSelectOption(elem,this.options.TableSelectNew,"(new value)");
    if (this.panelGroup)
      setTimeout(this.initPanelGroup.bind(this),50);
  },
  
  addSelectOption: function(elem,value,text,idx) {
    switch (elem.tagName.toLowerCase()) {
      case 'div':
        var opt=RicoUtil.createFormField(elem,'input','radio',elem.id+'_'+idx,elem.id);
        opt.value=value;
        var lbl=document.createElement('label');
        lbl.innerHTML=text;
        lbl.htmlFor=opt.id;
        elem.appendChild(lbl);
        break;
      case 'select':
        var opt=document.createElement('option');
        opt.value=value;
        opt.text=text;
        //elem.options.add(opt);
        if (Prototype.Browser.IE)
          elem.add(opt);
        else
          elem.add(opt,null);
        break;
    }
  },
  
  clearSaveMsg: function() {
    if (this.saveMsg) this.saveMsg.innerHTML="";
  },
  
  addMenuItem: function(menuText,menuAction,enabled) {
    this.extraMenuItems.push({menuText:menuText,menuAction:menuAction,enabled:enabled});
  },

  editMenu: function(grid,r,c,onBlankRow) {
    this.clearSaveMsg();
    if (this.grid.buffer.sessionExpired==true || this.grid.buffer.startPos<0) return;
    this.rowIdx=r;
    var elemTitle=$('pageTitle');
    var pageTitle=elemTitle ? elemTitle.innerHTML : document.title;
    this.menu.addMenuHeading(pageTitle);
    for (var i=0; i<this.extraMenuItems.length; i++) {
      this.menu.addMenuItem(this.extraMenuItems[i].menuText,this.extraMenuItems[i].menuAction,this.extraMenuItems[i].enabled);
    }
    if (onBlankRow==false) {
      this.menu.addMenuItem("Edit\t this "+this.options.RecordName,this.editRecord.bindAsEventListener(this),this.options.canEdit);
      this.menu.addMenuItem("Delete\t this "+this.options.RecordName,this.deleteRecord.bindAsEventListener(this),this.options.canDelete);
    }
    this.menu.addMenuItem("Add\t new "+this.options.RecordName,this.addRecord.bindAsEventListener(this),this.options.canAdd);
    return true;
  },

  cancelEdit: function(e) {
    Event.stop(e);
    for (var i=0; i<this.grid.columns.length; i++)
      if (this.grid.columns[i].format && this.grid.columns[i].format.SelectCtl)
        RicoEditControls.close(this.grid.columns[i].format.SelectCtl);
    this.makeFormInvisible();
    this.grid.highlightEnabled=true;
    this.menu.cancelmenu();
    return false;
  },

  setField: function(fldSpec,fldvalue) {
    var e=$(fldSpec.FieldName);
    if (!e) return;
    //alert('setField: '+fldSpec.FieldName+'='+fldvalue);
    switch (e.tagName.toUpperCase()) {
      case 'DIV':
        var elems=e.getElementsByTagName('INPUT');
        var fldcode=this.getLookupValue(fldvalue)[0];
        for (var i=0; i<elems.length; i++)
          elems[i].checked=(elems[i].value==fldcode);
        break;
      case 'INPUT':
        if (fldSpec.SelectCtl)
          fldvalue=this.getLookupValue(fldvalue)[0];
        switch (e.type.toUpperCase()) {
          case 'HIDDEN':
          case 'TEXT':
            e.value=fldvalue;
            break;
        }
        break;
      case 'SELECT':
        var opts=e.options;
        var fldcode=this.getLookupValue(fldvalue)[0];
        //alert('setField SELECT: id='+e.id+'\nvalue='+fldcode+'\nopt cnt='+opts.length)
        for (var i=0; i<opts.length; i++) {
          if (opts[i].value==fldcode) {
            e.selectedIndex=i;
            break;
          }
        }
        if (fldSpec.EntryType=='N') {
          var txt=$('textnew__'+e.id);
          if (!txt) alert('Warning: unable to find id "textnew__'+e.id+'"');
          txt.value=fldvalue;
          if (e.selectedIndex!=i) e.selectedIndex=opts.length-1;
          this.updateSelectNew(e);
        }
        return;
      case 'TEXTAREA':
        e.value=fldvalue;
        if (fldSpec.EntryType=='tinyMCE' && typeof(tinyMCE)!='undefined' && this.initialized)
          tinyMCE.updateContent(e.id);
        return;
    }
  },
  
  getLookupValue: function(value) {
    if (typeof value!='string')
      return ['',''];
    else if (value.match(/<span\s+class=(['"]?)ricolookup\1>(.*)<\/span>/i))
      return [RegExp.$2,RegExp.leftContext];
    else
      return [value,value];
  },
  
  // use with care: Prototype 1.5 does not include disabled fields in the post-back
  setReadOnly: function(addFlag) {
    for (var i=0; i<this.grid.columns.length; i++) {
      var fldSpec=this.grid.columns[i].format;
      if (!fldSpec) continue;
      var e=$(fldSpec.FieldName);
      if (!e) continue;
      var ro=!fldSpec.Writeable || fldSpec.ReadOnly || (fldSpec.InsertOnly && !addFlag) || (fldSpec.UpdateOnly && addFlag);
      var color=ro ? this.options.readOnlyColor : '';
      switch (e.tagName.toUpperCase()) {
        case 'DIV':
          var elems=e.getElementsByTagName('INPUT');
          for (var j=0; j<elems.length; j++)
            elems[j].disabled=ro;
          break;
        case 'SELECT':
          if (fldSpec.EntryType=='N') {
            var txt=$('textnew__'+e.id);
            txt.disabled=ro;
          }
          e.disabled=ro;
          break;
        case 'TEXTAREA':
        case 'INPUT':
          e.readOnly=ro;
          e.style.color=color;
          if (fldSpec.selectIcon) fldSpec.selectIcon.style.display=ro ? 'none' : '';
          break;
      }
    }
  },
  
  hideResponse: function(msg) {
    this.responseDiv.innerHTML=msg;
    this.responseDialog.style.display='none';
  },
  
  showResponse: function() {
    var offset=Position.page(this.grid.outerDiv);
    offset[1]+=RicoUtil.docScrollTop();
    this.responseDialog.style.top=offset[1]+"px";
    this.responseDialog.style.display='';
  },
  
  processResponse: function() {
    var ch=this.responseDiv.childNodes;
    for (var i=ch.length-1; i>=0; i--) {
      if (ch[i].nodeType==1 && ch[i].nodeName!='P' && ch[i].nodeName!='DIV' && ch[i].nodeName!='BR')
        this.responseDiv.removeChild(ch[i]);
    }
    var responseText=this.responseDiv.innerHTML;
    if (responseText.toLowerCase().indexOf('error')==-1 && this.options.showSaveMsg!='full') {
      this.hideResponse('');
      this.grid.resetContents();
      this.grid.buffer.foundRowCount = false;
      this.grid.buffer.fetch(this.grid.lastRowPos || 0);
      if (this.saveMsg) this.saveMsg.innerHTML='&nbsp;'+responseText.stripTags()+'&nbsp;';
    }
    this.processCallback(this.options.onSubmitResponse);
  },
  
  processCallback: function(callback) {
    switch (typeof callback) {
      case 'string': eval(callback); break;
      case 'function': callback(); break;
    }
  },
  
  // called when ok pressed on error response message
  ackResponse: function() {
    this.hideResponse('');
    this.grid.highlightEnabled=true;
  },

  editRecord: function(e) {
    this.grid.highlightEnabled=false;
    this.menu.hidemenu();
    this.hideResponse('Saving...');
    this.grid.outerDiv.style.cursor = 'auto';
    this.action.value="upd";
    for (var i=0; i<this.grid.columns.length; i++) {
      if (this.grid.columns[i].format) {
        var v=this.grid.columns[i].getValue(this.rowIdx);
        this.setField(this.grid.columns[i].format,v);
        if (this.grid.columns[i].format.selectDesc)
          this.grid.columns[i].format.selectDesc.innerHTML=this.grid.columns[i]._format(v);
      }
    }
    this.setReadOnly(false);
    this.key=this.getKey();
    this.makeFormVisible(this.rowIdx);
  },

  addRecord: function() {
    this.menu.hidemenu();
    this.hideResponse('Saving...');
    this.setReadOnly(true);
    this.form.reset();
    this.action.value="ins";
    for (var i=0; i<this.grid.columns.length; i++) {
      if (this.grid.columns[i].format) {
        this.setField(this.grid.columns[i].format,this.grid.columns[i].format.ColData);
        if (this.grid.columns[i].format.SelectCtl)
          RicoEditControls.resetValue(this.grid.columns[i]);
      }
    }
    this.key='';
    this.makeFormVisible(-1);
    if (this.Accordion) this.Accordion.selectionSet.selectIndex(0);
  },
  
  drillDown: function(e,masterColNum,detailColNum) {
    var cell=Event.element(e || window.event);
    cell=RicoUtil.getParentByTagName(cell,'div','ricoLG_cell');
    if (!cell) return;
    this.grid.unhighlight();
    var idx=this.grid.winCellIndex(cell);
    this.grid.menuIdx=idx;  // ensures selection gets cleared when menu is displayed
    this.grid.highlight(idx);
    var drillValue=this.grid.columns[masterColNum].getValue(idx.row);
    for (var i=3; i<arguments.length; i++)
      arguments[i].setDetailFilter(detailColNum,drillValue);
    return idx.row;
  },
  
  // set filter on a detail grid that is in a master-detail relationship
  setDetailFilter: function(colNumber,filterValue) {
    var c=this.grid.columns[colNumber];
    c.format.ColData=filterValue;
    c.setSystemFilter('EQ',filterValue);
  },
  
  makeFormVisible: function(row) {
    this.editDiv.style.display='block';

    // set left position
    var editWi=this.editDiv.offsetWidth;
    var odOffset=Position.page(this.grid.outerDiv);
    var winWi=RicoUtil.windowWidth();
    if (editWi+odOffset[0] > winWi)
      this.editDiv.style.left=(winWi-editWi)+'px';
    else
      this.editDiv.style.left=(odOffset[0]+1)+'px';

    // set top position
    var scrTop=RicoUtil.docScrollTop();
    var editHt=this.editDiv.offsetHeight;
    var newTop=odOffset[1]+this.grid.hdrHt+scrTop;
    var bottom=RicoUtil.windowHeight()+scrTop;
    if (row >= 0) {
      newTop+=(row+1)*this.grid.rowHeight;
      if (newTop+editHt>bottom) newTop-=(editHt+this.grid.rowHeight);
    } else {
      if (newTop+editHt>bottom) newTop=bottom-editHt;
    }
    this.processCallback(this.options.formOpen);
    this.formPopup.openPopup(null,Math.max(newTop,scrTop));
    this.editDiv.style.visibility='visible';
    if (this.initialized) return;
    for (i = 0; i < this.grid.columns.length; i++) {
      spec=this.grid.columns[i].format;
      if (!spec || !spec.EntryType || !spec.FieldName) continue;
      switch (spec.EntryType) {
        case 'tinyMCE':
          if (typeof tinyMCE!='undefined') tinyMCE.execCommand('mceAddControl', true, spec.FieldName);
          break;
      }
    }
    this.formPopup.openPopup();  // tinyMCE may have changed the dimensions of the form
    this.initialized=true;
  },

  makeFormInvisible: function() {
    this.editDiv.style.visibility='hidden';
    this.formPopup.closePopup();
    this.processCallback(this.options.formClose);
  },
  
  getConfirmDesc: function(rowIdx) {
    var desc=this.grid.columns[this.options.ConfirmDeleteCol].cell(rowIdx).innerHTML;
    desc=this.getLookupValue(desc)[1];
    return desc.stripTags();
  },

  deleteRecord: function() {
    this.menu.hidemenu();
    var desc;
    if (this.options.ConfirmDeleteCol < 0) {
      desc=RicoTranslate.getPhrase("this "+this.options.RecordName);
    } else {
      desc=this.getConfirmDesc(this.rowIdx);
      if (desc.length>50) desc=desc.substring(0,50)+'...';
      desc='\"' + desc + '\"'
    }
    if (!this.options.ConfirmDelete.valueOf || confirm(RicoTranslate.getPhrase("Are you sure you want to delete ") + desc + " ?")) {
      this.hideResponse('Deleting...');
      this.showResponse();
      var parms=this.action.name+"=del"+this.getKey();
      //alert(parms);
      new Ajax.Updater(this.responseDiv, window.location.pathname, {parameters:parms,onComplete:this.processResponse.bind(this)});
    }
    this.menu.cancelmenu();
  },
  
  getKey: function() {
    var key='';
    for (var i=0; i<this.grid.columns.length; i++) {
      if (this.grid.columns[i].format && this.grid.columns[i].format.isKey) {
        var value=this.grid.columns[i].getValue(this.rowIdx);
        value=this.getLookupValue(value)[0];
        key+='&_k'+i+'='+value;
      }
    }
    return key;
  },

  TESubmit: function(e) {
    var i,lbl,spec,elem,entrytype;
    
    if (!e) e=window.event;
    Event.stop(e);

    // check fields that are supposed to be non-blank

    for (i = 0; i < this.grid.columns.length; i++) {
      spec=this.grid.columns[i].format;
      if (!spec || !spec.EntryType || !spec.FieldName) continue;
      entrytype=spec.EntryType.charAt(0).toLowerCase();
      if (!entrytype.match(/d|i|b/)) continue;
      if (spec.isNullable==true && entrytype!='b') continue;
      elem=$(spec.FieldName);
      if (!elem) continue;
      //alert("nonblank check: " + spec.FieldName);
      if (elem.tagName.toLowerCase()!='input') continue;
      if (elem.type.toLowerCase()!='text') continue;
      if (elem.value.length == 0) {
        alert(RicoTranslate.getPhrase("Please enter\t a value for")+" \"" + this.grid.columns[i].formLabel.innerHTML + "\"");
        //setTimeout("FocusField(document." + this.form.name + "." + this.options.NonBlanks[i] + ")",2000);
        return false;
      }
    }

    // recheck any elements on the form with an onchange event

    var InputFields = this.form.getElementsByTagName("input");
    this.TEerror=false;
    for (i=0; i < InputFields.length; i++) {
      if (InputFields[i].type=="text" && InputFields[i].onchange) {
        InputFields[i].onchange();
        if (this.TEerror) return false;
      }
    }
    if (typeof tinyMCE!='undefined') tinyMCE.triggerSave();
    this.makeFormInvisible();
    this.showResponse();
    var parms=Form.serialize(this.form)+this.key
    Rico.writeDebugMsg("TESubmit:"+parms);
    new Ajax.Updater(this.responseDiv, window.location.pathname, {parameters:parms,onComplete:this.responseHandler});
    this.menu.cancelmenu();
    return false;
  },
  
  FocusField: function(elem) {
    elem.focus();
    elem.select();
  },

  TableEditCheckInt: function(TxtObj) {
    var val=TxtObj.value;
    if (val=='') return;
    if (val!=parseInt(val)) {
      alert(RicoTranslate.getPhrase("Please enter\t an integer value for")+" \"" + $("lbl_"+TxtObj.id).innerHTML + "\"");
      setTimeout(this.FocusField.bind(this,TxtObj),0);
      this.TEerror=true;
    }
  },

  TableEditCheckPosInt: function(TxtObj) {
    var val=TxtObj.value;
    if (val=='') return;
    if (val!=parseInt(val) || val<0) {
      alert(RicoTranslate.getPhrase("Please enter\t a positive integer value for")+" \"" + $("lbl_"+TxtObj.id).innerHTML + "\"");
      setTimeout(this.FocusField.bind(this,TxtObj),0);
      this.TEerror=true;
    }
  }
}


// Registers custom popup widgets to fill in a text box (e.g. ricoCalendar and ricoTree)
//
// Custom widget must implement:
//   open() method (make control visible)
//   close() method (hide control)
//   container property (div element that contains the control)
//   id property (uniquely identifies the widget class)
//
// widget calls returnValue method to return a value to the caller
//
// this object handles clicks on the control's icon and positions the control appropriately.
var RicoEditControls = {
  widgetList:$H(),
  elemList:$H(),
  
  register: function(widget, imgsrc) {
    var tmp={};
    tmp[widget.id]={imgsrc:imgsrc, widget:widget, currentEl:''};
    this.widgetList=this.widgetList.merge(tmp);
    widget.returnValue=this.setValue.bind(this,widget);
    Rico.writeDebugMsg("RicoEditControls.register:"+widget.id);
  },
  
  atLoad: function() {
    var k=this.widgetList.keys();
    for (var i=0; i<k.length; i++) {
      var w=this.widgetList[k[i]].widget;
      if (w.atLoad) w.atLoad();
    }
  },
  
  applyTo: function(column,inputCtl) {
    var wInfo=this.widgetList[column.format.SelectCtl];
    if (!wInfo) return null;
    Rico.writeDebugMsg('RicoEditControls.applyTo: '+column.displayName+' : '+column.format.SelectCtl);
    var descSpan = document.createElement('span');
    var newimg = document.createElement('img');
    newimg.style.paddingLeft='4px';
    newimg.style.cursor='pointer';
    newimg.align='top';
    newimg.src=wInfo.imgsrc;
    newimg.id=this.imgId(column.format.FieldName);
    newimg.onclick=this.processClick.bindAsEventListener(this);
    inputCtl.parentNode.appendChild(descSpan);
    inputCtl.parentNode.appendChild(newimg);
    inputCtl.style.display='none';    // comment out this line for debugging
    var tmp=new Object();
    tmp[newimg.id]={descSpan:descSpan, inputCtl:inputCtl, widget:wInfo.widget, listObj:wInfo, column:column};
    this.elemList=this.elemList.merge(tmp);
    column.format.selectIcon=newimg;
    column.format.selectDesc=descSpan;
  },

  processClick: function(e) {
    var elem=Event.element(e);
    var el=this.elemList[elem.id];
    if (!el) return;
    if (el.listObj.currentEl==elem.id && el.widget.container.style.display!='none') {
      el.widget.close();
      el.listObj.currentEl='';
    } else {
      el.listObj.currentEl=elem.id;
      Rico.writeDebugMsg('RicoEditControls.processClick: '+el.widget.id+' : '+el.inputCtl.value);
      RicoUtil.positionCtlOverIcon(el.widget.container,elem);
      el.widget.open(el.inputCtl.value);
    }
  },
  
  imgId: function(fieldname) {
    return 'icon_'+fieldname;
  },
  
  resetValue: function(column) {
    var el=this.elemList[this.imgId(column.format.FieldName)];
    if (!el) return;
    el.inputCtl.value=column.format.ColData;
    el.descSpan.innerHTML=column._format(column.format.ColData);
  },
  
  setValue: function(widget,newVal,newDesc) {
    var wInfo=this.widgetList[widget.id];
    if (!wInfo) return null;
    var id=wInfo.currentEl;
    if (!id) return null;
    var el=this.elemList[id];
    if (!el) return null;
    el.inputCtl.value=newVal;
    if (!newDesc) newDesc=el.column._format(newVal);
    el.descSpan.innerHTML=newDesc;
    //alert(widget.id+':'+id+':'+el.inputCtl.id+':'+el.inputCtl.value+':'+newDesc);
  },
  
  close: function(id) {
    var wInfo=this.widgetList[id];
    if (!wInfo) return;
    if (wInfo.widget.container.style.display!='none')
      wInfo.widget.close();
  }
}

Rico.includeLoaded('ricoLiveGridForms.js');
