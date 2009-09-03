<%@ LANGUAGE="VBSCRIPT" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>
<title>Rico LiveGrid Plus-Example 12</title>

<%
' # of cells in spreadsheet
const numcol=26
const numrow=100
%>

<!-- #INCLUDE FILE = "chklang.vbs" --> 

<script src="../../src/rico.js" type="text/javascript"></script>
<link href="../client/css/demo.css" type="text/css" rel="stylesheet" />
<script type='text/javascript'>
Rico.loadModule('CustomMenu');
Rico.loadModule('SpreadSheet');
Rico.loadModule('ColorPicker');
<%
setLang
%>

var grid,cp;
Rico.onLoad( function() {
  var opts = {  
    highlightElem    : 'selection',
    highlightClass: 'ricoSheet_Selection',
    highlightSection : 2,
    highlightMethod  : 'outline',
    defaultWidth     : 60,
    canDragSelect    : true,
    menuSection      : 2,
    visibleRows      : 'data',
    headingSort      : 'none',
    prefetchBuffer   : false,
    useUnformattedColWidth : false,
    menuEvent        : 'contextmenu',
    columnSpecs      : [ {width:30,Hdg:'',noResize:true} ]
  };
  grid = new Rico.SimpleGrid ('ss', opts);
  grid.menu = new Rico.Menu('7em');
  grid.initSheet();

  var clrmenu=new Rico.Menu('7em');
  grid.registerScrollMenu(clrmenu);
  clrmenu.addMenuItem('All',grid.clearSelection.bind(grid,'all'));
  clrmenu.addMenuItem('Formats',grid.clearSelection.bind(grid,'formats'));
  clrmenu.addMenuItem('Formulas',grid.clearSelection.bind(grid,'formulas'));
  clrmenu.addMenuItem('Values',grid.clearSelection.bind(grid,'values'));
  grid.menu.addSubMenuItem('Clear', clrmenu, false);

  cp=new Rico.ColorPicker('colorpick');
  cp.atLoad();
  cp.returnValue=this.returnColor.bind(this);
  Event.observe(window,'keydown',chkEscape,false);
});

function chkEscape(e) {
  e=e || event;
  if (e.keyCode==27) cp.close();
}

function returnColor(newcolor) {
  grid.updateSelectionStyle(cp.attribute,newcolor);
}

function pickcolor(e,attr) {
  if (cp.container.style.display!='none' && cp.attribute==attr) {
    cp.close();
  } else {
    var elem=Event.element(e);
    cp.attribute=attr;
    cp.open();
    RicoUtil.positionCtlOverIcon(cp.container,elem);
  }
}

function textalign(dir) {
  grid.updateSelectionStyle('text-align',dir);
}

</script>

<style type="text/css">
.ricoLG_top .ricoLG_cell, .ricoLG_top th, .ricoLG_top td {  /* td/th required for IE */
  white-space:nowrap;
  text-align:center;
  font-weight:normal;
  background-color: #cedebd !important;
}
div.ricoLG_cell, div.ricoLG_outerDiv textarea {
  font-size:8pt;
}
div.ricoLG_cell {
  white-space: nowrap;
}
* {
  font-family: Verdana, Arial, Helvetica, sans-serif;
}
div.ss_col0, div.ss_col0 .ricoLG_oddRow, div.ss_col0 .ricoLG_evenRow {
  background-color: #cedebd !important;
  text-align:center;
}
.ricoLG_evenRow {
  background-color: #fff;  /* improves IE */
}
.ricoColorPicker {
  position: absolute;
  background-color: white;
  top:0px;
  left:0px;
  z-index: 10;
}
.ricoColorPicker td {
  width: 12px;
  height: 12px;
  font-size: 10px;
}
div.ricoLG_highlightDiv {
  border-top:2px solid #DDD;
  border-left:2px solid #DDD;
  border-right:2px solid #222;
  border-bottom:2px solid #222;
  overflow: hidden;
  z-index: 1;
}
</style>
</head>

<body>

<!-- #INCLUDE FILE = "menu.vbs" --> 

<table border='0'><tr style='vertical-align:top;'>
<td><img src="../client/images/sheet/bold.gif" onclick="grid.toggleAttr('font-weight', 'normal', Prototype.Browser.Opera ? '700' : 'bold')" title="bold"></td>
<td><img src="../client/images/sheet/italics.gif" onclick="grid.toggleAttr('font-style','normal','italic')" title="italic"></td>
<td><img src="../client/images/sheet/underline.gif" onclick="grid.toggleAttr('text-decoration','none','underline')" title="underline"></td>
<td><img src="../client/images/sheet/alignleft.gif" onclick="textalign('left')" title="align left"></td>
<td><img src="../client/images/sheet/aligncenter.gif" onclick="textalign('center')" title="align center"></td>
<td><img src="../client/images/sheet/alignright.gif" onclick="textalign('right')" title="align right"></td>
<td><img src="../client/images/sheet/backcolor.gif" onclick="pickcolor(event,'background-color')" title="background color"></td>
<td><img src="../client/images/sheet/textcolor.gif" onclick="pickcolor(event,'color')" title="text color"></td>
<td><img src="../client/images/sheet/help.jpg" onclick="grid.showHelp()" title="help"></td>
</tr></table>

<div id="ss_outerDiv">

<div id="ss_frozenTabsDiv">
<table id="ss_tab0h" class="ricoLG_table ricoLG_top ricoLG_left" cellspacing="0" cellpadding="0">
<tr><td><div class='ricoLG_col'><div class='ricoLG_cell'> </div></div></td></tr>
</table>

<table id="ss_tab0" class="ricoLG_table ricoLG_bottom ricoLG_left" cellspacing="0" cellpadding="0">
<tr><td>
<div class="ricoLG_col">
<%
for r=1 to numrow
  response.write "<div class='ricoLG_cell'>" & r & "</div>"
next
%>
</div>
</td></tr>
</table>
</div>

<div id="ss_innerDiv">
<div id="ss_scrollTabsDiv">
<table id="ss_tab1h" class="ricoLG_table ricoLG_top ricoLG_right" cellspacing="0" cellpadding="0">
<tr>
<%
for c=1 to numcol
  response.write "<th><div class='ricoLG_col'><div class='ricoLG_cell'>" & chr(64+c) & "</div></div></th>"
next
%>
</tr>
</table>
</div>
</div>

<div id="ss_scrollDiv">
<table id="ss_tab1" class="ricoLG_table ricoLG_bottom ricoLG_right" cellspacing="0" cellpadding="0">
<tr>
<%
for c=1 to numcol
  response.write "<td><div class='ricoLG_col'>"
  for r=0 to numrow-1
    response.write "<div id='ss_cell_" & r & "_" & c & "' class='ricoLG_cell'></div>"
  next
  response.write "</div></td>"
next
%>
</tr>
</table>
</div>

</div>

<!--
<textarea id='debug' rows='5' cols='80'></textarea>
<script type='text/javascript'>
Rico.setDebugArea('debug');
</script>
-->

</body>
</html>

