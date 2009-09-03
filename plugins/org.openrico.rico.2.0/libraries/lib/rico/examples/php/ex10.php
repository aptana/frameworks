<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>
<title>Rico LiveGrid Plus-Example 12</title>


<?
$numcol=26;
$numrow=100;

require "chklang.php";
?>
 

<script src="../../src/rico.js" type="text/javascript"></script>
<link href="../client/css/demo.css" type="text/css" rel="stylesheet" />
<script type='text/javascript'>
Rico.loadModule('CustomMenu');
Rico.loadModule('SpreadSheet');
Rico.loadModule('ColorPicker');

<? 
setLang();
?>

var grid,cp,fmtNumberObj;
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
  fmtNumberObj=new Rico.Popup({ignoreClicks:true}, 'formatNumberDiv');
  Event.observe(fmtNumberObj.divPopup,"keydown", checkKey);
  

  var fmtmenu=new Rico.Menu('7em');
  grid.registerScrollMenu(fmtmenu);
  fmtmenu.addMenuItem('Number...',openFormatNumber);
  //fmtmenu.addMenuItem('Date/Time...',formatDate);
  //fmtmenu.addMenuItem('Text...',formatText);
  //fmtmenu.addMenuItem('Boolean...',formatBoolean);
  grid.menu.addSubMenuItem('Format as', fmtmenu);

  var alignmenu=new Rico.Menu('7em');
  grid.registerScrollMenu(alignmenu);
  alignmenu.addMenuItem('Left',textalign.bind(grid,'left'));
  alignmenu.addMenuItem('Center',textalign.bind(grid,'center'));
  alignmenu.addMenuItem('Right',textalign.bind(grid,'right'));
  alignmenu.addMenuItem('Word Wrap',textwrap);
  grid.menu.addSubMenuItem('Align', alignmenu);

  var clrmenu=new Rico.Menu('7em');
  grid.registerScrollMenu(clrmenu);
  clrmenu.addMenuItem('All',grid.clearSelection.bind(grid,'all'));
  clrmenu.addMenuItem('Formats',grid.clearSelection.bind(grid,'formats'));
  clrmenu.addMenuItem('Formulas',grid.clearSelection.bind(grid,'formulas'));
  clrmenu.addMenuItem('Values',grid.clearSelection.bind(grid,'values'));
  grid.menu.addSubMenuItem('Clear', clrmenu);

  cp=new Rico.ColorPicker('colorpick');
  cp.atLoad();
  cp.returnValue=this.returnColor.bind(this);
  Event.observe(window,'keydown',chkEscape,false);
});

// prevent keystrokes (other than escape) from bubbling to sheet/document
function checkKey(e) {
  e=e || event;
  if (RicoUtil.eventKey(e)==27) return;
  if ( e.stopPropagation != undefined )
     e.stopPropagation();
  else if ( e.cancelBubble != undefined )
     e.cancelBubble = true;
}

function openFormatNumber(e) {
  Event.stop(e || event);
  grid.menu.cancelmenu();
  var cell=grid.cell(grid.SelectIdxStart.row,grid.SelectIdxStart.column);
  if (cell && cell.RicoFormat) {
    for (var p in cell.RicoFormat) {
      var elem=$(p);
      if (!elem || !elem.tagName) continue;
      var v=cell.RicoFormat[p].toString();
      switch (elem.tagName.toLowerCase()) {
        case 'input':
          elem.value=v;
          break;
        case 'select':
          var opts=elem.options;
          for (var i=0; i<opts.length; i++) {
            if (opts[i].value==v) {
              elem.selectedIndex=i;
              break;
            }
          }
          break;
      }
    }
  }
  fmtNumberObj.openPopup(grid.menu.clientX,grid.menu.clientY);
}

function setNumberFormat() {
  var selects=$A(fmtNumberObj.divPopup.getElementsByTagName('select'));
  var inputs=$A(fmtNumberObj.divPopup.getElementsByTagName('input'));
  var newFormat={type:'number'};
  selects.each(function(e) { newFormat[e.id]=$F(e.id); });
  inputs.each(function(e) { newFormat[e.id]=$F(e.id); });
  if (newFormat.multiplier.match(/^\d+$/)) newFormat.multiplier=parseInt(newFormat.multiplier);
  if (newFormat.decPlaces.match(/^\d+$/)) newFormat.decPlaces=parseInt(newFormat.decPlaces);
  grid.formatSelection(newFormat);
  fmtNumberObj.closePopup();
}

function formatDate() {
}

function formatText() {
}

function formatBoolean() {
}

function hideDialog(e) {
  fmtNumberObj.closePopup();
}

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
    RicoUtil.positionCtlOverIcon(cp.container,elem);
    cp.open();
  }
  Event.stop(e);
}

function textalign(dir) {
  grid.updateSelectionStyle('text-align',dir);
}

function textwrap() {
  grid.toggleAttr('white-space', 'normal', 'nowrap');
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
.toolbar tr {
  vertical-align:top;
}
.toolbar * {
  font-size: x-small;
}
.formatDialog {
  background-color:#EEEEFF;
  border: 1px solid black;
  font-size: x-small;
  position:absolute;
  display:none;
  z-index:10;
  padding:5px;
}
.formatDialog * {
  font-size: x-small;
}
.formatDialog table {
  margin-bottom: 5px;
}
</style>
</head>

<body>


<?
require "menu.php";
?>


<div id='formatNumberDiv' class='formatDialog'>
<table border='0'>
<tr><td title='Number of places to the right of the decimal point'>Decimal Places</td>
<td>
<select id='decPlaces'>
<option value='0'>0</option>
<option value='1'>1</option>
<option value='2'>2</option>
<option value='3'>3</option>
<option value='4'>4</option>
<option value='5'>5</option>
<option value='6'>6</option>
<option value='7'>7</option>
<option value='8'>8</option>
<option value='9'>9</option>
</select>
</td></tr>
<tr><td>Negative Values</td>
<td>
<select id='negSign'>
<option value='L'>Leading minus</option>
<option value='T'>Trailing minus</option>
<option value='P'>Parentheses</option>
</select>
</td></tr>
<tr><td title='Typically a currency symbol ($ or &amp;euro; or &amp;yen;)'>Prefix</td>
<td><input type='text' size='10' id='prefix'></td></tr>
<tr><td title='If displaying percentages then set this to %'>Suffix</td>
<td><input type='text' size='10' id='suffix'></td></tr>
<tr><td title='If displaying percentages then set this to 100'>Multiplier</td>
<td><input type='text' size='10' id='multiplier'></td></tr>
<tr><td>Decimal Point</td>
<td>
<select id='decPoint'>
<option value='.'>.</option>
<option value=','>,</option>
</select>
</td></tr>
<tr><td title='Thousands grouping symbol'>Thousands Sep.</td>
<td>
<select id='thouSep'>
<option value=','>,</option>
<option value='.'>.</option>
<option value='&nbsp;'>space</option>
<option value=''>none</option>
</select>
</td></tr>
</table>
<center><button onclick='setNumberFormat()'>OK</button>&nbsp;&nbsp;<button onclick='hideDialog()'>Cancel</button></center>
</div>
 

<table border='0' class='toolbar'><tr>
<td><img src="../client/images/sheet/bold.gif" onclick="grid.toggleAttr('font-weight', 'normal', Prototype.Browser.Opera ? '700' : 'bold')" title="bold"></td>
<td><img src="../client/images/sheet/italics.gif" onclick="grid.toggleAttr('font-style','normal','italic')" title="italic"></td>
<td><img src="../client/images/sheet/underline.gif" onclick="grid.toggleAttr('text-decoration','none','underline')" title="underline"></td>
<td><img src="../client/images/sheet/alignleft.gif" onclick="textalign('left')" title="align left"></td>
<td><img src="../client/images/sheet/aligncenter.gif" onclick="textalign('center')" title="align center"></td>
<td><img src="../client/images/sheet/alignright.gif" onclick="textalign('right')" title="align right"></td>
<td><img src="../client/images/sheet/backcolor.gif" onclick="pickcolor(event,'background-color')" title="background color"></td>
<td><img src="../client/images/sheet/textcolor.gif" onclick="pickcolor(event,'color')" title="text color"></td>
<!-- <td><input type='button' onclick='textwrap()' value='Word Wrap'></td> -->
<td><img src="../client/images/sheet/help.jpg" onclick="grid.showHelp()" title="help" style='padding-left:1em;'></td>
</tr></table>

<div id="ss_outerDiv">

<div id="ss_frozenTabsDiv">
<table id="ss_tab0h" class="ricoLG_table ricoLG_top ricoLG_left" cellspacing="0" cellpadding="0">
<tr><td><div class='ricoLG_col'><div class='ricoLG_cell'> </div></div></td></tr>
</table>

<table id="ss_tab0" class="ricoLG_table ricoLG_bottom ricoLG_left" cellspacing="0" cellpadding="0">
<tr><td>
<div class="ricoLG_col">

<? 
for ($r=1; $r<=$numrow; $r++) {
  echo "<div class='ricoLG_cell'>".$r."</div>";
}
?>

</div>
</td></tr>
</table>
</div>

<div id="ss_innerDiv">
<div id="ss_scrollTabsDiv">
<table id="ss_tab1h" class="ricoLG_table ricoLG_top ricoLG_right" cellspacing="0" cellpadding="0">
<tr>

<? 
for ($c=1; $c<=$numcol; $c++) {
  echo "<th><div class='ricoLG_col'><div class='ricoLG_cell'>".chr(64 + $c)."</div></div></th>";
}
?>

</tr>
</table>
</div>
</div>

<div id="ss_scrollDiv">
<table id="ss_tab1" class="ricoLG_table ricoLG_bottom ricoLG_right" cellspacing="0" cellpadding="0">
<tr>

<? 
for ($c=1; $c<=$numcol; $c++) {
  echo "<td><div class='ricoLG_col'>";
  for ($r=0; $r<=$numrow-1; $r++) {
    echo "<div id='ss_cell_".$r."_".$c."' class='ricoLG_cell'></div>";
  }
  echo "</div></td>";
}
?>

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

