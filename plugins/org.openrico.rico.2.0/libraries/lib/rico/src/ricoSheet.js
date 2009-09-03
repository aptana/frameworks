Object.extend(Rico.SimpleGrid.prototype, {

initSheet: function() {
  this.highlightDiv=[];
  for (var i=0; i<4; i++) {
    this.highlightDiv[i] = this.createDiv("highlight",this.scrollDiv);
    this.highlightDiv[i].style.display="none";
    this.highlightDiv[i].id+=i;
    this.highlightDiv[i].style[i % 2==0 ? 'height' : 'width']="0px";
  }
  for (var c=1; c<this.columns.length; c++) {
    var col=this.columns[c];
    for (var r=0; r<col.numRows(); r++) {
      var cell=col.cell(r);
      cell.RicoRow=r+1;
      cell.RicoCol=c;
      cell.RicoValue=null;
    }
  }
  if (this.menu) {
    if (!this.menu.grid) this.registerScrollMenu(this.menu);
    this.menu.showmenu=this.menu.showSheetMenu;
  }
  this.inputArea=RicoUtil.createFormField(this.scrollDiv,'textarea',null,'inputArea');
  this.inputArea.style.position='absolute';
  this.inputArea.style.display='none';
  this.inputArea.style.zIndex=2;
  this.inputArea.cols=30;
  this.inputArea.rows=4;
  this.inputArea.blur();
  this.clipBox=RicoUtil.createFormField(this.innerDiv,'textarea',null,'clipBox');
  this.clipBox.style.position='absolute';
  this.clipBox.style.display='none';
  this.clipBox.cols=80;
  this.clipBox.rows=10;
  this.clipBox.style.top='0px';
  this.clipBox.style.left='0px';
  this.selectCellRC(0,1);
  this.mouseOverHandler = this.selectMouseOver.bindAsEventListener(this);
  this.mouseUpHandler  = this.selectMouseUp.bindAsEventListener(this);
  Event.observe(this.inputArea,'keydown',this.inputKeydown.bindAsEventListener(this),false);
  Event.observe(Prototype.Browser.IE ? document.body : window,'keydown',this.gridKeydown.bindAsEventListener(this),false);
  Event.observe(this.tbody[1],"mousedown", this.selectMouseDown.bindAsEventListener(this), false);

  // disable drag & select events in IE
  this.outerDiv.ondrag = this.disableEvent;
  this.outerDiv.onselectstart = this.disableEvent;
  this.tbody[1].ondrag = this.disableEvent;
  this.tbody[1].onselectstart = this.disableEvent;
},

disableEvent: function(e) {
  e=e || event;
  Event.stop(e);
  return false;
},

cellIndex: function(cell) {
  var a=cell.id.split(/_/);
  var l=a.length;
  var r=parseInt(a[l-2]);
  var c=parseInt(a[l-1]);
  return {row:r, column:c, tabIdx:this.columns[c].tabIdx, cell:cell};
},

AdjustSelection: function(cell) {
  var newIdx=this.cellIndex(cell);
  if (this.SelectIdxStart.tabIdx != newIdx.tabIdx) return;
  this.HideSelection();
  this.SelectIdxEnd=newIdx;
  this.ShowSelection();
},

selectMouseDown: function(e) {
  if (this.highlightEnabled==false) return true;
  this.cancelMenu();
  var cell=Event.element(e);
  Event.stop(e);
  if (!Event.isLeftClick(e)) return;
  cell=RicoUtil.getParentByTagName(cell,'div','ricoLG_cell');
  if (!cell) return;
  var newIdx=this.cellIndex(cell);
  if (e.shiftKey) {
    if (!this.SelectIdxStart) return;
    this.selectCellRC(newIdx.row,newIdx.column,true);
  } else {
    this.selectCellRC(newIdx.row,newIdx.column,false);
    this.pluginSelect();
  }
},

pluginSelect: function() {
  if (this.selectPluggedIn) return;
  var tBody=this.tbody[this.SelectIdxStart.tabIdx];
  Event.observe(tBody,"mouseover", this.mouseOverHandler, false);
  Event.observe(this.outerDiv,"mouseup",  this.mouseUpHandler,  false);
  this.selectPluggedIn=true;
},

unplugSelect: function() {
  var tBody=this.tbody[this.SelectIdxStart.tabIdx];
  Event.stopObserving(tBody,"mouseover", this.mouseOverHandler , false);
  Event.stopObserving(this.outerDiv,"mouseup", this.mouseUpHandler , false);
  this.selectPluggedIn=false;
},

selectMouseUp: function(e) {
  this.unplugSelect();
  var cell=Event.element(e);
  cell=RicoUtil.getParentByTagName(cell,'div','ricoLG_cell');
  if (!cell) return;
  this.AdjustSelection(cell);
},

selectMouseOver: function(e) {
  var cell=Event.element(e);
  cell=RicoUtil.getParentByTagName(cell,'div','ricoLG_cell');
  if (!cell) return;
  this.AdjustSelection(cell);
  Event.stop(e);
},

getSelection: function() {
  if (!this.SelectIdxStart || !this.SelectIdxEnd) return false;
  var r1=Math.min(this.SelectIdxEnd.row,this.SelectIdxStart.row);
  var r2=Math.max(this.SelectIdxEnd.row,this.SelectIdxStart.row);
  var c1=Math.min(this.SelectIdxEnd.column,this.SelectIdxStart.column);
  var c2=Math.max(this.SelectIdxEnd.column,this.SelectIdxStart.column);
  return {r1:r1,c1:c1,r2:r2,c2:c2};
},

updateSelectOutline: function() {
  var s=this.getSelection();
  if (!s || s.r1 > s.r2) {
    this.HideSelection();
    return;
  }
  var top1=this.columns[s.c1].cell(s.r1).offsetTop;
  var cell2=this.columns[s.c1].cell(s.r2);
  var bottom2=cell2.offsetTop+cell2.offsetHeight;
  var left1=this.columns[s.c1].dataCell.offsetLeft;
  var left2=this.columns[s.c2].dataCell.offsetLeft;
  var right2=left2+this.columns[s.c2].dataCell.offsetWidth;
  //window.status='updateSelectOutline: '+s.r1+' '+s.r2+' top='+top1+' bot='+bottom2;
  this.highlightDiv[0].style.top=this.highlightDiv[3].style.top=this.highlightDiv[1].style.top=(top1-3) + 'px';
  this.highlightDiv[2].style.top=(bottom2-2)+'px';
  this.highlightDiv[3].style.left=(left1-2)+'px';
  this.highlightDiv[0].style.left=this.highlightDiv[2].style.left=(left1-1)+'px';
  this.highlightDiv[1].style.left=(right2-1)+'px';
  this.highlightDiv[0].style.width=this.highlightDiv[2].style.width=(right2-left1-1) + 'px';
  this.highlightDiv[1].style.height=this.highlightDiv[3].style.height=(bottom2-top1) + 'px';
  for (var i=0; i<4; i++)
    this.highlightDiv[i].style.display='';
},

isSelected: function(r,c) {
  var s=this.getSelection();
  return s ? (s.r1 <= r) && (r <= s.r2) && (s.c1 <= c) && (c <= s.c2) : false;
},

HideSelection: function(cellList) {
  for (var i=0; i<4; i++)
    this.highlightDiv[i].style.display='none';
},

ShowSelection: function() {
  this.updateSelectOutline();
},

/*
 * @param what valid values are: null, 'all', 'formats', 'formulas', 'values'
 */
clearSelection: function() {
  var s=this.getSelection();
  if (!s) return;
  var args=$A(arguments);
  var what=args.shift();
  if (typeof what=='object') what=args.shift();  // in case first arg is an event object
  var v=(!what || what=='all') ? 1 : 0;
  var whatobj={formats:v,formulas:v,values:v};
  if (typeof what=='string') whatobj[what]=1;
  if (whatobj.values) whatobj.formulas=1;
  for (var r=s.r1; r<=s.r2; r++) {
    for (var c=s.c1; c<=s.c2; c++) {
      var gridcell=this.columns[c].cell(r);
      if (whatobj.formats) {
        gridcell.style.cssText='';
        gridcell.RicoFormat={};
      }
      if (whatobj.formulas) gridcell.RicoFormula=null;
      if (whatobj.values) gridcell.RicoValue=null;
      this.formatCell(gridcell);
    }
  }
},

selectCellRC: function(r,c,adjFlag) {
  if (r < 0 || r >= this.columns[0].numRows()) return;
  this.HideSelection();
  if (adjFlag) {
    if (this.SelectIdxStart.tabIdx == this.columns[c].tabIdx)
      this.SelectIdxEnd={row:r, column:c, tabIdx:this.columns[c].tabIdx};
  } else {
    this.SelectIdxStart=this.SelectIdxEnd={row:r, column:c, tabIdx:this.columns[c].tabIdx};
    this.columns[c].cell(r).focus(); // causes IE to scroll cell into view (but not FF)
  }
  this.ShowSelection();
},

moveSelection: function(dr,dc,adjFlag,e) {
  var selIdx=adjFlag ? this.SelectIdxEnd : this.SelectIdxStart;
  var newr=selIdx.row+dr;
  var newc=selIdx.column+dc;
  if (newr>=0 && newr<this.columns[0].numRows() && newc>=1 && newc<this.columns.length)
    this.selectCellRC(newr,newc,adjFlag);
  if (e) Event.stop(e);
},

formatCell: function(cell) {
  // TO DO: add currency/date formatting here
  var v=cell.RicoValue;
  if (v==null)
    v='';
  else if (typeof(v)=='number')
    v = isNaN(v) ? '#VALUE' : cell.RicoFormat ? v.formatNumber(cell.RicoFormat) : v.toString();
  else if (typeof v!='string')
    v=v.toString();
  v=v.replace(/^(\s*)/, '');
  cell.style.paddingLeft=(RegExp.$1.length/2)+'em';
  cell.innerHTML = v;
},

// action='add' or 'remove'
updateDependencies: function(formulaCell,action) {
  if (!formulaCell.RicoFormula) return;
  //alert('updateDependencies '+action+': '+formulaCell.RicoRow+','+formulaCell.RicoCol);
  var ranges=formulaCell.RicoFormula.getRanges();
  for (var i=0; i<ranges.length; i++) {
    if (!ranges[i]) continue;
    var r1=Math.min(ranges[i][0],ranges[i][2]);
    var r2=Math.max(ranges[i][0],ranges[i][2]);
    var c1=Math.min(ranges[i][1],ranges[i][3]);
    var c2=Math.max(ranges[i][1],ranges[i][3]);
    for (var c=c1; c<=c2; c++) {
      var col=this.columns[c];
      for (var r=r1; r<=r2; r++) {
        var cell=col.cell(r-1);
        if (!cell.RicoDependencies) cell.RicoDependencies=new Rico.Formula.f_dependencies();
        //alert('updateDependencies '+action+': '+formulaCell.RicoRow+','+formulaCell.RicoCol+' is dependent on '+cell.RicoRow+','+cell.RicoCol);
        cell.RicoDependencies[action](formulaCell);
      }
    }
  }
},

checkDependencies: function(cell) {
  if (!cell.RicoDependencies) return;
  var depcells=cell.RicoDependencies.items;
  for (var i=0; i<depcells.length; i++) {
    depcells[i].RicoValue=depcells[i].RicoFormula.eval();
    this.formatCell(depcells[i]);
    this.checkDependencies(depcells[i]);
  }
},

showInputArea: function(clear,e) {
  this.unplugScroll();
  this.inputIdx=this.SelectIdxStart;
  var col=this.columns[this.inputIdx.column];
  this.inputIdx.cell=col.cell(this.inputIdx.row);
  this.inputArea.style.top=(this.inputIdx.cell.offsetTop+col.dataCell.offsetTop)+'px';
  this.inputArea.style.left=col.dataCell.offsetLeft+'px';
  this.inputArea.style.display='';
  this.inputArea.focus();
  if (clear) {
    if (Prototype.Browser.WebKit) {
      // Safari does not bubble the event to the inputArea, so force it
      this.inputArea.value=String.fromCharCode(e.charCode);
      this.inputArea.setSelectionRange(1,1);
      Event.stop(e);
    } else this.inputArea.value='';
  } else {
    if (this.inputIdx.cell.RicoFormula)
      this.inputArea.value=this.inputIdx.cell.RicoFormula.toEditString();
    else
      this.inputArea.value=this.inputIdx.cell.RicoValue || '';
  }
},

closeInputArea: function(dr,dc,e) {
  var newVal=this.inputArea.value;
  var cell=this.inputIdx.cell;
  if (this.options.checkEntry)
    newVal=this.options.checkEntry(newVal,this.inputIdx.cell);
  this.updateDependencies(cell,'remove');
  cell.RicoFormula=null;
  if (!this.options.noFormulas && newVal.charAt(0) == '=') {
    // parse formula
    cell.RicoFormula = new Rico.Formula(grid,cell);
    cell.RicoFormula.parse(newVal);
    cell.RicoValue = cell.RicoFormula.eval();
    this.updateDependencies(cell,'add');
  } else if (newVal=='') {
    cell.RicoValue = null;
  } else if (newVal.match(/^(true|false)$/i)) {
    cell.RicoValue = eval(newVal.toLowerCase());
  } else if (newVal.match(/^-?\d+(.\d*)?$/)) {
    // parse number
    cell.RicoValue = parseFloat(newVal);
  } else {
    cell.RicoValue=newVal;
  }
  this.formatCell(cell);
  this.inputArea.blur();
  this.inputArea.style.display='none';
  this.checkDependencies(cell);
  this.pluginScroll();
  this.moveSelection(dr,dc,false,e);
},

inputKeydown: function(e) {
  //window.status='inputKeydown keyCode='+e.keyCode;
  switch (e.keyCode) {
    case 13:
      Event.stop(e);
      this.closeInputArea(1,0,e);
      return false;
    case 9:
      Event.stop(e);
      this.closeInputArea(0,e.shiftKey ? -1 : 1,e);
      return false;
    case 27:
      Event.stop(e);
      this.inputArea.blur();
      this.inputArea.style.display='none';
      return false;
  }
  return true;
},

copyToClipbox: function() {
  var s=this.getSelection();
  if (!s) return;
  var clipstr='';
  for (var r=s.r1; r<=s.r2; r++) {
    for (var c=s.c1; c<=s.c2; c++) {
      if (c>s.c1) clipstr+="\t";
      clipstr+=this.columns[c].cell(r).RicoValue;
    }
    clipstr+="\r\n";
  }
  this.clipBox.style.display='block';
  this.clipBox.value=clipstr;
  this.clipBox.select();
},

copySelection: function() {
  var s=this.getSelection();
  if (!s) return;
  var clipArray=[];
  for (var r=s.r1; r<=s.r2; r++) {
    var cliprow=[];
    for (var c=s.c1; c<=s.c2; c++) {
      var clipcell={};
      var gridcell=this.columns[c].cell(r);
      clipcell.value=gridcell.RicoValue;
      clipcell.style=gridcell.style.cssText;
      if (gridcell.RicoFormat)
        clipcell.format=Object.extend({}, gridcell.RicoFormat || {});
      if (gridcell.RicoFormula)
        clipcell.formula=Object.extend({}, gridcell.RicoFormula);
      cliprow[c-s.c1]=clipcell;
    }
    clipArray[r-s.r1]=cliprow;
  }
  return clipArray;
},

pasteSelection: function(clipArray,pasteType) {
  var s=this.getSelection();
  if (!s || !clipArray) return;
  pasteType=pasteType || 'all';
  var clipclen=clipArray[0].length;
  if (s.r1==s.r2 && s.c1==s.c2) {
    s.r2=Math.min(s.r1+clipArray.length,this.columns[0].numRows())-1;
    s.c2=Math.min(s.c1+clipclen,this.columns.length)-1;
  }
  for (var r=s.r1,clipr=0; r<=s.r2; r++) {
    var arow=clipArray[clipr];
    for (var c=s.c1,clipc=0; c<=s.c2; c++) {
      var clipcell=arow[clipc];
      var gridcell=this.columns[c].cell(r);
      this.updateDependencies(gridcell,'remove');
      gridcell.RicoFormula=null;
      if (clipcell.formula) {
        gridcell.RicoFormula=Object.extend({}, clipcell.formula);
        gridcell.RicoFormula.cell=gridcell;
        gridcell.RicoValue = gridcell.RicoFormula.eval();
        this.updateDependencies(gridcell,'add');
      } else {
        gridcell.RicoValue=clipcell.value;
      }
      gridcell.style.cssText=clipcell.style;
      if (clipcell.format)
        gridcell.RicoFormat=Object.extend({}, clipcell.format);
      this.formatCell(gridcell);
      this.checkDependencies(gridcell);
      clipc=(clipc+1) % clipclen;
    }
    clipr=(clipr+1) % clipArray.length;
  }
},

formatSelection: function(newFormat) {
  var s=this.getSelection();
  if (!s) return;
  for (var r=s.r1; r<=s.r2; r++) {
    for (var c=s.c1; c<=s.c2; c++) {
      var gridcell=this.cell(r,c);
      gridcell.RicoFormat=newFormat;
      this.formatCell(gridcell);
    }
  }
},

handleCtrlKey: function(e) {
  switch (e.keyCode) {
    // Ctrl-C
    case 67:
      this.clip=this.copySelection();
      window.status='copy: '+this.clip.length;
      Event.stop(e);
      break;

    // Ctrl-X
    case 88:
      this.clip=this.copySelection();
      this.clearSelection();
      Event.stop(e);
      break;

    // Ctrl-V
    case 86:
      window.status='paste: '+this.clip.length;
      this.pasteSelection(this.clip);
      Event.stop(e);
      break;

    // Ctrl-B
    case 66:
      this.toggleAttr('font-weight','normal','bold');
      Event.stop(e);
      break;

    // Ctrl-I
    case 73:
      this.toggleAttr('font-style','normal','italic');
      Event.stop(e);
      break;
  }
},

handleNormalKey: function(e) {
  switch (e.keyCode) {
    case 91:
    case 16:
    case 17:
    case 18:
    case 20:
    case 27: return;

    // tab
    case 9:  this.moveSelection(0,e.shiftKey ? -1 : 1,false,e); break;
    // enter/return
    case 13: this.moveSelection(1,0,false,e); break;
    // arrow keys
    case 37: this.moveSelection(0,-1,e.shiftKey,e); break;
    case 38: this.moveSelection(-1,0,e.shiftKey,e); break;
    case 39: this.moveSelection(0,1,e.shiftKey,e); break;
    case 40: this.moveSelection(1,0,e.shiftKey,e); break;
    // home
    case 36: this.selectCellRC(this.SelectIdxStart.row,1); Event.stop(e); break;
    // F2
    case 113: this.showInputArea(false,e); break;

    default: this.showInputArea(true,e); break;
  }
  return false;
},

gridKeydown: function(e) {
  if (e.altKey) return;
  var elem=Event.element(e);
  if (elem.id=='inputArea') return true;
  //window.status='gridKeydown keyCode='+e.keyCode;
  if (e.ctrlKey)
    this.handleCtrlKey(e);
  else
    this.handleNormalKey(e);
},

toggleAttr: function(attr,v1,v2) {
  var v=this.getStyle(this.SelectIdxStart.row,this.SelectIdxStart.column,attr);
  v=v==v2 ? v1 : v2;
  this.updateSelectionStyle(attr,v);
},

getStyle: function(row,col,attr) {
  var csstxt=this.columns[col].cell(row).style.cssText;
  if (!csstxt) return;
  if (csstxt.charAt(csstxt.length-1)!=';') csstxt+=';';   // opera
  csstxt=' '+csstxt;
  var re=new RegExp("[ ;]"+attr+"\\s*:\\s*([^ ;]*)\\s*;","i");
  if (re.test(csstxt))
    return RegExp.$1;
  else
    return;
},

updateStyleText: function(csstxt,attr,value) {
  var newval=attr+':'+value+';';
  if (!csstxt) return newval;
  csstxt=' '+csstxt.strip();
  if (csstxt.charAt(csstxt.length-1)!=';') csstxt+=';';   // opera
  var re=new RegExp("([ ;])"+attr+"\\s*:\\s*([^ ;]*)\\s*;","i");
  // safari must process the regexp twice, everyone else can run it once
  if (re.test(csstxt))
    return Prototype.Browser.WebKit ? csstxt.replace(re,"$1"+newval) : RegExp.leftContext+RegExp.$1+newval+RegExp.rightContext;
  else
    return csstxt+newval;
},

updateSelectionStyle: function(attr,newVal) {
  var s=this.getSelection();
  if (!s) return;
  for (var c=s.c1; c<=s.c2; c++) {
    var col=this.columns[c];
    for (var r=s.r1; r<=s.r2; r++)
      col.cell(r).style.cssText=this.updateStyleText(col.cell(r).style.cssText,attr,newVal);
  }
},

showHelp: function() {
  var msg="Rico Spreadsheet\n\n";
  msg+="Ctrl-C = copy, Ctrl-X = cut, Ctrl-V = paste (only from/to cells on this grid)\n\n";
  msg+="Formulas starting with '=' are supported\n";
  msg+="Formulas may contain parentheses and the following operators: + - * / & % = > < <= >= <>\n";
  msg+="'+' follows javascript rules regarding type conversion (which are slightly different from Excel)\n";
  msg+="Formulas may refer to cells using 'A1' notation (and 'A1:B2' for ranges).\n";
  msg+="The following functions are supported in formulas:\n\n";
  var funclist=[];
  for (var funcname in Rico.Formula.prototype)
    if (funcname.substring(0,5)=='eval_') funclist.push(funcname.substring(5));
  funclist.sort();
  var funcstr=funclist.join(', ');
  var i=funcstr.indexOf(' ',Math.floor(funcstr.length/2));
  msg+=funcstr.substring(0,i)+"\n"+funcstr.substring(i+1);
  msg+="\n\nFormula parsing based on code originally published by E. W. Bachtal at http://ewbi.blogs.com/develops/";
  msg+="\nFuture functionality may include copy/paste from external applications, load/save, number & date formatting, and support for additional functions.";
  alert(msg);
}

});


Rico.Formula = Class.create();

Rico.Formula.TOK_TYPE_NOOP      = "noop";
Rico.Formula.TOK_TYPE_OPERAND   = "operand";
Rico.Formula.TOK_TYPE_FUNCTION  = "function";
Rico.Formula.TOK_TYPE_SUBEXPR   = "subexpression";
Rico.Formula.TOK_TYPE_ARGUMENT  = "argument";
Rico.Formula.TOK_TYPE_OP_PRE    = "operator-prefix";
Rico.Formula.TOK_TYPE_OP_IN     = "operator-infix";
Rico.Formula.TOK_TYPE_OP_POST   = "operator-postfix";
Rico.Formula.TOK_TYPE_WSPACE    = "white-space";
Rico.Formula.TOK_TYPE_UNKNOWN   = "unknown";

Rico.Formula.TOK_SUBTYPE_START       = "start";
Rico.Formula.TOK_SUBTYPE_STOP        = "stop";

Rico.Formula.TOK_SUBTYPE_TEXT        = "text";
Rico.Formula.TOK_SUBTYPE_NUMBER      = "number";
Rico.Formula.TOK_SUBTYPE_LOGICAL     = "logical";
Rico.Formula.TOK_SUBTYPE_ERROR       = "error";
Rico.Formula.TOK_SUBTYPE_RANGE       = "range";

Rico.Formula.TOK_SUBTYPE_MATH        = "math";
Rico.Formula.TOK_SUBTYPE_CONCAT      = "concatenate";
Rico.Formula.TOK_SUBTYPE_INTERSECT   = "intersect";
Rico.Formula.TOK_SUBTYPE_UNION       = "union";

Rico.Formula.prototype = {

initialize: function(grid,cell) {
  this.grid=grid;
  this.cell=cell;
},

// 'A' -> 1, 'AA' -> 27
colLetter2Num: function(colstr) {
  colstr=colstr.toUpperCase();
  switch (colstr.length) {
    case 1: return colstr.charCodeAt(0)-64;
    case 2: return (colstr.charCodeAt(0)-64) * 26 + colstr.charCodeAt(1)-64;
    default: return -1;
  }
},

// 1 -> 'A', 27 -> 'AA'
colNum2Letter: function(colnum) {
  if (colnum <= 26) return String.fromCharCode(64+colnum);
  colnum-=1;
  return String.fromCharCode(64+Math.floor(colnum / 26),65+(colnum % 26));
},


toHTML: function() {
  var indentCount = 0;

  var indent = function() {
    var s = "|";
    for (var i = 0; i < indentCount; i++) {
      s += "&nbsp;&nbsp;&nbsp;|";
    }
    return s;
  };

  var tokensHtml = "<table cellspacing='0'>";
  tokensHtml += "<tr>";
  tokensHtml += "<td class='token' style='font-weight: bold; width: 50px'>index</td>";
  tokensHtml += "<td class='token' style='font-weight: bold; width: 125px'>type</td>";
  tokensHtml += "<td class='token' style='font-weight: bold; width: 125px'>subtype</td>";
  tokensHtml += "<td class='token' style='font-weight: bold; width: 150px'>token</td>";
  tokensHtml += "<td class='token' style='font-weight: bold; width: 300px'>token tree</td></tr>";

  this.tokens.reset();
  while (this.tokens.moveNext()) {

    var token = this.tokens.current();

    if (token.subtype == Rico.Formula.TOK_SUBTYPE_STOP)
      indentCount -= ((indentCount > 0) ? 1 : 0);

    tokensHtml += "<tr>";

    tokensHtml += "<td class='token'>" + (this.tokens.index + 1) + "</td>";
    tokensHtml += "<td class='token'>" + token.type + "</td>";
    tokensHtml += "<td class='token'>" + ((token.subtype.length == 0) ? "&nbsp;" : token.subtype) + "</td>";
    tokensHtml += "<td class='token'>" + ((token.value.length == 0) ? "&nbsp;" : token.value).split(" ").join("&nbsp;") + "</td>";
    tokensHtml += "<td class='token'>" + indent() + ((token.value.length == 0) ? "&nbsp;" : token.value).split(" ").join("&nbsp;") + "</td>";

    tokensHtml += "</tr>";

    if (token.subtype == Rico.Formula.TOK_SUBTYPE_START) indentCount++;
  }
  tokensHtml += "</table>";
  return tokensHtml;
},


parseCellRef: function(refString) {
  if (!refString) return null;
  if (!refString.match(/^(\$?)([a-z]*)(\$?)(\d*)$/i)) return null;
  var abscol=(RegExp.$1=='$');
  var absrow=(RegExp.$3=='$');
  var r=null,c=null;
  if (RegExp.$2) {
    c=this.colLetter2Num(RegExp.$2);
    if (c<0 || c>=this.grid.columns.length) return null;
    if (!abscol) c-=this.cell.RicoCol;
  }
  if (RegExp.$4) {
    r=parseInt(RegExp.$4);
    if (!absrow) r-=this.cell.RicoRow;
  }
  //alert('parseCellRef: '+refString+"\n"+'r='+r+' c='+c+' absrow='+absrow+' abscol='+abscol);
  return {row:r, col:c, absRow:absrow, absCol:abscol};
},


resolveCellRef: function(cellRef) {
  var r=cellRef.row;
  var c=cellRef.col;
  if (!cellRef.absRow) r+=this.cell.RicoRow;
  if (!cellRef.absCol) c+=this.cell.RicoCol;
  return {row:r, col:c};
},


resolveRange: function(token) {
  if (!token.rangeStart) return null;
  var a1=this.resolveCellRef(token.rangeStart);
  var a2=this.resolveCellRef(token.rangeEnd);
  //alert('resolveRange: '+a1.row+','+a1.col+' '+a2.row+','+a2.col);
  var r1=Math.min(a1.row,a2.row);
  var r2=Math.max(a1.row,a2.row);
  var c1=Math.min(a1.col,a2.col) || 0;
  var c2=Math.max(a1.col,a2.col) || this.grid.columns.length-1;
  return [r1,c1,r2,c2];
},


range2evalstr: function(token) {
  var rng=this.resolveRange(token);
  return rng ? rng.join(',') : '';
},


cellref2str: function(cellRef) {
  var ref=this.resolveCellRef(cellRef);
  var c=this.colNum2Letter(ref.col);
  if (cellRef.absCol) c='$'+c;
  var r=ref.row.toString();
  if (cellRef.absRow) r='$'+r;
  return c+r;
},


range2str: function(token) {
  var s1=this.cellref2str(token.rangeStart);
  var s2=this.cellref2str(token.rangeEnd);
  return (s1==s2) ? s1 : s1+':'+s2;
},


GetRange: function(r1,c1,r2,c2) {
  if (typeof r1=='undefined' || typeof c1=='undefined') return NaN;
  if (r1==r2 && c1==c2) return this.grid.columns[c1].cell(r1-1).RicoValue;
  var result=[];
  for (var r=r1; r<=r2; r++) {
    var newRow=[];
    for (var c=c1; c<=c2; c++)
      newRow.push(this.grid.columns[c].cell(r-1).RicoValue);
    result.push(newRow);
  }
  return result;
},


getRanges: function() {
  var result=[];
  this.tokens.reset();
  while (this.tokens.moveNext()) {
    var token = this.tokens.current();
    if (token.subtype=='range') result.push(this.resolveRange(token));
  }
  return result;
},


eval_sum: function() {
  var result=0;
  for (var i=0; i<arguments.length; i++) {
    arg=arguments[i];
    if (arg==null) continue;
    switch (typeof arg) {
      case 'number':
        result+=arg;
        break;
      case 'object':
        for (var r=0; r<arg.length; r++)
          for (var c=0; c<arg[r].length; c++)
            if (typeof arg[r][c]=='number') result+=arg[r][c];
        break;
    }
  }
  return result;
},


eval_count: function() {
  var result=0;
  for (var i=0; i<arguments.length; i++) {
    arg=arguments[i];
    if (arg==null) continue;
    switch (typeof arg) {
      case 'object':
        for (var r=0; r<arg.length; r++)
          for (var c=0; c<arg[r].length; c++)
            if (arg[r][c] || typeof arg[r][c]=='number') result++;
        break;
      default:
        if (arg || typeof arg=='number') result++;
        break;
    }
  }
  return result;
},


eval_t: function(arg) {
  return (typeof arg=='string') ? arg : '';
},


eval_trim: function(arg) {
  arg=this.argString(arg);
  return arg.strip();
},


eval_lower: function(arg) {
  arg=this.argString(arg);
  return arg.toLowerCase();
},


eval_upper: function(arg) {
  arg=this.argString(arg);
  return arg.toUpperCase();
},


eval_len: function(arg) {
  arg=this.argString(arg);
  return arg.length;
},


eval_value: function(arg) {
  arg=this.argString(arg);
  return parseFloat(arg);
},


eval_left: function(arg,numchars) {
  arg=this.argString(arg);
  if (typeof numchars!='number') numchars=1;
  if (numchars<0) return NaN;
  return arg.slice(0,numchars);
},


eval_right: function(arg,numchars) {
  arg=this.argString(arg);
  if (typeof numchars!='number') numchars=1;
  if (numchars<0) return NaN;
  if (numchars==0) return '';
  return arg.slice(-numchars);
},


eval_mid: function(arg,start,numchars) {
  arg=this.argString(arg);
  if (typeof start!='number' || start<1) return NaN;
  if (typeof numchars!='number' || numchars<0) return NaN;
  return arg.substr(start-1,numchars);
},


eval_if: function(logical_test, value_true, value_false) {
  var v=this.argBool(logical_test);
  if (v==null) return NaN;
  return v ? value_true : value_false;
},


eval_not: function(arg) {
  var v=this.argBool(arg);
  return (v==null) ? NaN : !v;
},


eval_and: function() {
  var args = $A(arguments);
  args.unshift(function(a,b) { return a&&b; });
  return this.or_and.apply(this, args);
},


eval_or: function() {
  var args = $A(arguments);
  args.unshift(function(a,b) { return a||b; });
  return this.or_and.apply(this, args);
},


or_and: function() {
  var result;
  var func=arguments[0];
  for (var i=1; i<arguments.length; i++) {
    arg=arguments[i];
    if (arg==null) continue;
    switch (typeof arg) {
      case 'object':
        for (var r=0; r<arg.length; r++)
          for (var c=0; c<arg[r].length; c++) {
            var v=this.argBool(arg[r][c])
            if (v!=null) result=(typeof result=='undefined') ? v : func(result,v);
          }
        break;
      default:
        var v=this.argBool(arg)
        if (v!=null) result=(typeof result=='undefined') ? v : func(result,v);
        break;
    }
  }
  return (typeof result=='undefined') ? NaN : result;
},


eval_abs:     function(arg) { return Math.abs(this.argNumber(arg)); },
eval_acos:    function(arg) { return Math.acos(this.argNumber(arg)); },
eval_asin:    function(arg) { return Math.asin(this.argNumber(arg)); },
eval_atan:    function(arg) { return Math.atan(this.argNumber(arg)); },
eval_atan2:   function(argx,argy) { return Math.atan2(this.argNumber(argy),this.argNumber(argx)); },
eval_ceiling: function(arg) { return Math.ceil(this.argNumber(arg)); },
eval_cos:     function(arg) { return Math.cos(this.argNumber(arg)); },
eval_exp:     function(arg) { return Math.exp(this.argNumber(arg)); },
eval_floor:   function(arg) { return Math.floor(this.argNumber(arg)); },
eval_ln:      function(arg) { return Math.log(this.argNumber(arg)); },
eval_mod:     function(num,divisor) { return this.argNumber(num) % this.argNumber(divisor); },
eval_pi:      function() { return Math.PI; },
eval_power:   function(argx,argy) { return Math.pow(this.argNumber(argx),this.argNumber(argy)); },
eval_rand:    function() { return Math.random(); },
eval_round:   function(arg) { return Math.round(this.argNumber(arg)); },
eval_sin:     function(arg) { return Math.sin(this.argNumber(arg)); },
eval_sqrt:    function(arg) { return Math.sqrt(this.argNumber(arg)); },
eval_tan:     function(arg) { return Math.tan(this.argNumber(arg)); },


argNumber: function(arg) {
  switch (typeof arg) {
    case 'boolean': return arg;
    case 'number': return arg;
    case 'string': return parseFloat(arg);
    default: return null;
  }
},


argBool: function(arg) {
  switch (typeof arg) {
    case 'boolean': return arg;
    case 'number': return arg!=0;
    default: return null;
  }
},


argString: function(arg) {
  switch (typeof arg) {
    case 'string': return arg;
    case 'boolean':
    case 'number': return arg.toString();
    default: return '';
  }
},


eval: function() {
  var evalstr='';
  this.tokens.reset();
  while (this.tokens.moveNext()) {
    var token = this.tokens.current();
    switch (token.type) {
      case 'function':
        if (token.subtype=='start') {
          var funcname='eval_'+token.value.toLowerCase();
          if (typeof this[funcname]!='function') {
            alert('Unknown function: '+token.value);
            return '#ERROR';
          }
          evalstr+='this.'+funcname+'(';
        } else
          evalstr+=')';
        break;
      case 'subexpression':
        if (token.subtype=='start')
          evalstr+='(';
        else
          evalstr+=')';
        break;
      case 'operator-infix':
        if (token.value=='&')
          evalstr+='+';
        else if (token.value=='=')
          evalstr+='==';
        else if (token.value=='<>')
          evalstr+='!=';
        else
          evalstr+=token.value;
        break;
      case 'operator-postfix':
        if (token.value=='%')
          evalstr+='/100';
        else
          evalstr+=token.value;
        break;
      case 'operand':
        if (token.subtype=='range')
          evalstr+='this.GetRange('+this.range2evalstr(token)+')';
        else if (token.subtype=='text')
          evalstr+='"'+token.value+'"';
        else
          evalstr+=token.value;
        break;
      default:
        evalstr+=token.value;
        break;
    }
  }
  this.lastEval=evalstr;
  //window.status=evalstr;
  try {
    var result=eval(evalstr)
    return result;
  } catch(e) { alert(e.message); return '#ERROR'; }
},


toEditString: function() {
  var s='=';
  this.tokens.reset();
  while (this.tokens.moveNext()) {
    var token = this.tokens.current();
    switch (token.type) {
      case 'function':
        if (token.subtype=='start')
          s+=token.value+'(';
        else
          s+=')';
        break;
      case 'subexpression':
        if (token.subtype=='start')
          s+='(';
        else
          s+=')';
        break;
      case 'operand':
        if (token.subtype=='range')
          s+=this.range2str(token);
        else if (token.subtype=='text')
          s+='"'+token.value+'"';
        else
          s+=token.value;
        break;
      default:
        s+=token.value;
    }
  }
  return s;
},


// Excel formula parser
// from http://ewbi.blogs.com/develops/2004/12/excel_formula_p.html
parse: function(formula) {
  var tokens = new Rico.Formula.f_tokens();
  var tokenStack = new Rico.Formula.f_tokenStack();

  var offset = 0;

  var currentChar = function() { return formula.substr(offset, 1); };
  var doubleChar  = function() { return formula.substr(offset, 2); };
  var nextChar    = function() { return formula.substr(offset + 1, 1); };
  var EOF         = function() { return (offset >= formula.length); };

  var token = "";

  var inString = false;
  var inPath = false;
  var inRange = false;
  var inError = false;

  while (formula.length > 0) {
    if (formula.substr(0, 1) == " ")
      formula = formula.substr(1);
    else {
      if (formula.substr(0, 1) == "=")
        formula = formula.substr(1);
      break;
    }
  }

  while (!EOF()) {

    // state-dependent character evaluation (order is important)

    // double-quoted strings
    // embeds are doubled
    // end marks token

    if (inString) {
      if (currentChar() == "\"") {
        if (nextChar() == "\"") {
          token += "\"";
          offset += 1;
        } else {
          inString = false;
          tokens.add(token, Rico.Formula.TOK_TYPE_OPERAND, Rico.Formula.TOK_SUBTYPE_TEXT);
          token = "";
        }
      } else {
        token += currentChar();
      }
      offset += 1;
      continue;
    }

    // single-quoted strings (links)
    // embeds are double
    // end does not mark a token

    if (inPath) {
      if (currentChar() == "'") {
        if (nextChar() == "'") {
          token += "'";
          offset += 1;
        } else {
          inPath = false;
        }
      } else {
        token += currentChar();
      }
      offset += 1;
      continue;
    }

    // bracked strings (range offset or linked workbook name)
    // no embeds (changed to "()" by Excel)
    // end does not mark a token

    if (inRange) {
      if (currentChar() == "]") {
        inRange = false;
      }
      token += currentChar();
      offset += 1;
      continue;
    }

    // error values
    // end marks a token, determined from absolute list of values

    if (inError) {
      token += currentChar();
      offset += 1;
      if ((",#NULL!,#DIV/0!,#VALUE!,#REF!,#NAME?,#NUM!,#N/A,").indexOf("," + token + ",") != -1) {
        inError = false;
        tokens.add(token, Rico.Formula.TOK_TYPE_OPERAND, Rico.Formula.TOK_SUBTYPE_ERROR);
        token = "";
      }
      continue;
    }

    // independent character evaulation (order not important)

    // establish state-dependent character evaluations

    if (currentChar() == "\"") {
      if (token.length > 0) {
        // not expected
        tokens.add(token, Rico.Formula.TOK_TYPE_UNKNOWN);
        token = "";
      }
      inString = true;
      offset += 1;
      continue;
    }

    if (currentChar() == "'") {
      if (token.length > 0) {
        // not expected
        tokens.add(token, Rico.Formula.TOK_TYPE_UNKNOWN);
        token = "";
      }
      inPath = true;
      offset += 1;
      continue;
    }

    if (currentChar() == "[") {
      inRange = true;
      token += currentChar();
      offset += 1;
      continue;
    }

    if (currentChar() == "#") {
      if (token.length > 0) {
        // not expected
        tokens.add(token, Rico.Formula.TOK_TYPE_UNKNOWN);
        token = "";
      }
      inError = true;
      token += currentChar();
      offset += 1;
      continue;
    }

    // mark start and end of arrays and array rows

    if (currentChar() == "{") {
      if (token.length > 0) {
        // not expected
        tokens.add(token, Rico.Formula.TOK_TYPE_UNKNOWN);
        token = "";
      }
      tokenStack.push(tokens.add("ARRAY", Rico.Formula.TOK_TYPE_FUNCTION, Rico.Formula.TOK_SUBTYPE_START));
      tokenStack.push(tokens.add("ARRAYROW", Rico.Formula.TOK_TYPE_FUNCTION, Rico.Formula.TOK_SUBTYPE_START));
      offset += 1;
      continue;
    }

    if (currentChar() == ";") {
      if (token.length > 0) {
        tokens.add(token, Rico.Formula.TOK_TYPE_OPERAND);
        token = "";
      }
      tokens.addRef(tokenStack.pop());
      tokens.add(",", Rico.Formula.TOK_TYPE_ARGUMENT);
      tokenStack.push(tokens.add("ARRAYROW", Rico.Formula.TOK_TYPE_FUNCTION, Rico.Formula.TOK_SUBTYPE_START));
      offset += 1;
      continue;
    }

    if (currentChar() == "}") {
      if (token.length > 0) {
        tokens.add(token, Rico.Formula.TOK_TYPE_OPERAND);
        token = "";
      }
      tokens.addRef(tokenStack.pop());
      tokens.addRef(tokenStack.pop());
      offset += 1;
      continue;
    }

    // trim white-space

    if (currentChar() == " ") {
      if (token.length > 0) {
        tokens.add(token, Rico.Formula.TOK_TYPE_OPERAND);
        token = "";
      }
      tokens.add("", Rico.Formula.TOK_TYPE_WSPACE);
      offset += 1;
      while ((currentChar() == " ") && (!EOF())) {
        offset += 1;
      }
      continue;
    }

    // multi-character comparators

    if ((",>=,<=,<>,").indexOf("," + doubleChar() + ",") != -1) {
      if (token.length > 0) {
        tokens.add(token, Rico.Formula.TOK_TYPE_OPERAND);
        token = "";
      }
      tokens.add(doubleChar(), Rico.Formula.TOK_TYPE_OP_IN, Rico.Formula.TOK_SUBTYPE_LOGICAL);
      offset += 2;
      continue;
    }

    // standard infix operators

    if (("+-*/^&=><").indexOf(currentChar()) != -1) {
      if (token.length > 0) {
        tokens.add(token, Rico.Formula.TOK_TYPE_OPERAND);
        token = "";
      }
      tokens.add(currentChar(), Rico.Formula.TOK_TYPE_OP_IN);
      offset += 1;
      continue;
    }

    // standard postfix operators

    if (("%").indexOf(currentChar()) != -1) {
      if (token.length > 0) {
        tokens.add(token, Rico.Formula.TOK_TYPE_OPERAND);
        token = "";
      }
      tokens.add(currentChar(), Rico.Formula.TOK_TYPE_OP_POST);
      offset += 1;
      continue;
    }

    // start subexpression or function

    if (currentChar() == "(") {
      if (token.length > 0) {
        tokenStack.push(tokens.add(token, Rico.Formula.TOK_TYPE_FUNCTION, Rico.Formula.TOK_SUBTYPE_START));
        token = "";
      } else {
        tokenStack.push(tokens.add("", Rico.Formula.TOK_TYPE_SUBEXPR, Rico.Formula.TOK_SUBTYPE_START));
      }
      offset += 1;
      continue;
    }

    // function, subexpression, array parameters

    if (currentChar() == ",") {
      if (token.length > 0) {
        tokens.add(token, Rico.Formula.TOK_TYPE_OPERAND);
        token = "";
      }
      if (!(tokenStack.type() == Rico.Formula.TOK_TYPE_FUNCTION)) {
        tokens.add(currentChar(), Rico.Formula.TOK_TYPE_OP_IN, Rico.Formula.TOK_SUBTYPE_UNION);
      } else {
        tokens.add(currentChar(), Rico.Formula.TOK_TYPE_ARGUMENT);
      }
      offset += 1;
      continue;
    }

    // stop subexpression

    if (currentChar() == ")") {
      if (token.length > 0) {
        tokens.add(token, Rico.Formula.TOK_TYPE_OPERAND);
        token = "";
      }
      tokens.addRef(tokenStack.pop());
      offset += 1;
      continue;
    }

    // token accumulation

    token += currentChar();
    offset += 1;

  }

  // dump remaining accumulation

  if (token.length > 0) tokens.add(token, Rico.Formula.TOK_TYPE_OPERAND);

  // move all tokens to a new collection, excluding all unnecessary white-space tokens

  var tokens2 = new Rico.Formula.f_tokens();

  while (tokens.moveNext()) {

    token = tokens.current();

    if (token.type == Rico.Formula.TOK_TYPE_WSPACE) {
      if ((tokens.BOF()) || (tokens.EOF())) {}
      else if (!(
                 ((tokens.previous().type == Rico.Formula.TOK_TYPE_FUNCTION) && (tokens.previous().subtype == Rico.Formula.TOK_SUBTYPE_STOP)) ||
                 ((tokens.previous().type == Rico.Formula.TOK_TYPE_SUBEXPR) && (tokens.previous().subtype == Rico.Formula.TOK_SUBTYPE_STOP)) ||
                 (tokens.previous().type == Rico.Formula.TOK_TYPE_OPERAND)
                )
              ) {}
      else if (!(
                 ((tokens.next().type == Rico.Formula.TOK_TYPE_FUNCTION) && (tokens.next().subtype == Rico.Formula.TOK_SUBTYPE_START)) ||
                 ((tokens.next().type == Rico.Formula.TOK_TYPE_SUBEXPR) && (tokens.next().subtype == Rico.Formula.TOK_SUBTYPE_START)) ||
                 (tokens.next().type == Rico.Formula.TOK_TYPE_OPERAND)
                 )
               ) {}
      else
        tokens2.add(token.value, Rico.Formula.TOK_TYPE_OP_IN, Rico.Formula.TOK_SUBTYPE_INTERSECT);
      continue;
    }

    tokens2.addRef(token);

  }

  // switch infix "-" operator to prefix when appropriate, switch infix "+" operator to noop when appropriate, identify operand
  // and infix-operator subtypes, pull "@" from in front of function names

  while (tokens2.moveNext()) {

    token = tokens2.current();

    if ((token.type == Rico.Formula.TOK_TYPE_OP_IN) && (token.value == "-")) {
      if (tokens2.BOF())
        token.type = Rico.Formula.TOK_TYPE_OP_PRE;
      else if (
               ((tokens2.previous().type == Rico.Formula.TOK_TYPE_FUNCTION) && (tokens2.previous().subtype == Rico.Formula.TOK_SUBTYPE_STOP)) ||
               ((tokens2.previous().type == Rico.Formula.TOK_TYPE_SUBEXPR) && (tokens2.previous().subtype == Rico.Formula.TOK_SUBTYPE_STOP)) ||
               (tokens2.previous().type == Rico.Formula.TOK_TYPE_OP_POST) ||
               (tokens2.previous().type == Rico.Formula.TOK_TYPE_OPERAND)
              )
        token.subtype = Rico.Formula.TOK_SUBTYPE_MATH;
      else
        token.type = Rico.Formula.TOK_TYPE_OP_PRE;
      continue;
    }

    if ((token.type == Rico.Formula.TOK_TYPE_OP_IN) && (token.value == "+")) {
      if (tokens2.BOF())
        token.type = Rico.Formula.TOK_TYPE_NOOP;
      else if (
               ((tokens2.previous().type == Rico.Formula.TOK_TYPE_FUNCTION) && (tokens2.previous().subtype == Rico.Formula.TOK_SUBTYPE_STOP)) ||
               ((tokens2.previous().type == Rico.Formula.TOK_TYPE_SUBEXPR) && (tokens2.previous().subtype == Rico.Formula.TOK_SUBTYPE_STOP)) ||
               (tokens2.previous().type == Rico.Formula.TOK_TYPE_OP_POST) ||
               (tokens2.previous().type == Rico.Formula.TOK_TYPE_OPERAND)
              )
        token.subtype = Rico.Formula.TOK_SUBTYPE_MATH;
      else
        token.type = Rico.Formula.TOK_TYPE_NOOP;
      continue;
    }

    if ((token.type == Rico.Formula.TOK_TYPE_OP_IN) && (token.subtype.length == 0)) {
      if (("<>=").indexOf(token.value.substr(0, 1)) != -1)
        token.subtype = Rico.Formula.TOK_SUBTYPE_LOGICAL;
      else if (token.value == "&")
        token.subtype = Rico.Formula.TOK_SUBTYPE_CONCAT;
      else
        token.subtype = Rico.Formula.TOK_SUBTYPE_MATH;
      continue;
    }

    if ((token.type == Rico.Formula.TOK_TYPE_OPERAND) && (token.subtype.length == 0)) {
      if (isNaN(parseFloat(token.value)))
        if ((token.value == 'TRUE') || (token.value == 'FALSE'))
          token.subtype = Rico.Formula.TOK_SUBTYPE_LOGICAL;
        else {
          token.subtype = Rico.Formula.TOK_SUBTYPE_RANGE;
          var a=token.value.split(':');
          token.rangeStart=this.parseCellRef(a[0]);
          token.rangeEnd=a.length>1 ? this.parseCellRef(a[1]) : token.rangeStart;
        }
      else
        token.subtype = Rico.Formula.TOK_SUBTYPE_NUMBER;
      continue;
    }

    if (token.type == Rico.Formula.TOK_TYPE_FUNCTION) {
      if (token.value.substr(0, 1) == "@")
        token.value = token.value.substr(1);
      continue;
    }

  }

  tokens2.reset();

  // move all tokens to a new collection, excluding all noops

  this.tokens = new Rico.Formula.f_tokens();

  while (tokens2.moveNext()) {
    if (tokens2.current().type != Rico.Formula.TOK_TYPE_NOOP)
      this.tokens.addRef(tokens2.current());
  }
}

}


Rico.Formula.f_token = Class.create();
Rico.Formula.f_token.prototype = {
  initialize: function(value, type, subtype) {
    this.value = value;
    this.type = type;
    this.subtype = subtype;
  }
}


Rico.Formula.f_tokens = Class.create();
Rico.Formula.f_tokens.prototype = {
  initialize: function() {
    this.items = new Array();
    this.index = -1;
  },

  addRef: function(token) {
    this.items.push(token);
  },

  add: function(value, type, subtype) {
    if (!subtype) subtype = "";
    var token = new Rico.Formula.f_token(value, type, subtype);
    this.addRef(token);
    return token;
  },

  reset: function() {
    this.index = -1;
  },

  BOF: function() {
    return (this.index <= 0);
  },

  EOF: function() {
    return (this.index >= (this.items.length - 1));
  },

  moveNext: function() {
    if (this.EOF()) return false; this.index++; return true;
  },

  current: function() {
    if (this.index == -1) return null; return (this.items[this.index]);
  },

  next: function() {
    if (this.EOF()) return null; return (this.items[this.index + 1]);
  },

  previous: function() {
    if (this.index < 1) return null; return (this.items[this.index - 1]);
  }
}


Rico.Formula.f_tokenStack = Class.create();
Rico.Formula.f_tokenStack.prototype = {
  initialize: function() {
    this.items = new Array();
  },

  push: function(token) {
    this.items.push(token);
  },

  pop: function() {
    var token = this.items.pop();
    return (new Rico.Formula.f_token("", token.type, Rico.Formula.TOK_SUBTYPE_STOP));
  },

  token: function() {
    return ((this.items.length > 0) ? this.items[this.items.length - 1] : null);
  },

  value: function() {
    return ((this.token()) ? this.token().value : "");
  },

  type: function() {
    return ((this.token()) ? this.token().type : "");
  },

  subtype: function() {
    return ((this.token()) ? this.token().subtype : "");
  }
}


Rico.Formula.f_dependencies = Class.create();
Rico.Formula.f_dependencies.prototype = {
  initialize: function() {
    this.items = [];
  },

  add: function(cell) {
    if (!this.items.include(cell)) this.items.push(cell);
  },

  remove: function(cell) {
    this.items=this.items.select(function(item) { return (item != cell); });
  },

  find: function(cell) {
    return this.items.detect(function(item) { return (item==cell); });
  },

  clear: function() {
    this.items.clear();
  }
}


Object.extend(Rico.Menu.prototype, {

showSheetMenu: function(e,hideFunc) {
  var elem=this.showSimpleMenu(e,hideFunc);
  if (!this.grid) return;
  var newIdx=this.grid.cellIndex(elem);
  if (!this.grid.isSelected(newIdx.row,newIdx.column))
    this.grid.selectCellRC(newIdx.row,newIdx.column,false);
}

});


Rico.includeLoaded('ricoSheet.js');
