<%@ LANGUAGE="VBSCRIPT" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html dir="rtl">
<head>
<title>Rico LiveGrid Plus-Example 1</title>

<!-- #INCLUDE FILE = "chklang.vbs" --> 
<!-- #INCLUDE FILE = "settings.vbs" --> 

<script src="../../../src/rico.js" type="text/javascript"></script>
<link href="../../client/css/demo.css" type="text/css" rel="stylesheet" />
<script type='text/javascript'>
Rico.loadModule('LiveGrid');
Rico.loadModule('LiveGridMenu');
<%
setStyle
setLang
%>

Rico.onLoad( function() {
  var opts = {  
    <% GridSettingsScript %>,
    columnSpecs   : ['specQty']
  };
  var menuopts = <% GridSettingsMenu %>;
  new Rico.LiveGrid ('ex1', new Rico.GridMenu(menuopts), new Rico.Buffer.Base($('ex1').tBodies[0]), opts);
});
</script>

<style type="text/css">
div.ricoLG_col {
  white-space:nowrap;
}
</style>
</head>

<body>

<!-- #INCLUDE FILE = "menu.vbs" --> 
<table id='explanation' border='0' cellpadding='0' cellspacing='5' style='clear:both'><tr valign='top'><td>
<%  GridSettingsForm %>
</td><td>This example demonstrates a pre-filled grid (no AJAX data fetches). 
LiveGrid Plus just provides scrolling, column resizing, and sorting capabilities.
The first column sorts numerically, the others sort in text order.
Filtering is not supported on pre-filled grids.
</td></tr></table>

<p class="ricoBookmark"><span id="ex1_bookmark">&nbsp;</span></p>
<table id="ex1" class="ricoLiveGrid" cellspacing="0" cellpadding="0">
<colgroup>
<%
const numcol=15
for c=1 to numcol
  response.write "<col style='width:80px;' />"
next
%>
</colgroup>
<thead><tr>
<%
for c=1 to numcol
  response.write "<th>Column " & c & "</th>"
next
%>
</tr></thead><tbody>
<%
for r=1 to 100
  response.write vbLf & "<tr>"
  response.write "<td>" & r & "</td>"
  for c=2 to numcol
    response.write "<td>Cell " & r & ":" & c & "</td>"
  next
  response.write "</tr>"
next
%>
</tbody></table>

<!--
<textarea id='debug' rows='5' cols='80'></textarea>
<script type='text/javascript'>
Rico.setDebugArea('debug');
</script>
-->

</body>
</html>

