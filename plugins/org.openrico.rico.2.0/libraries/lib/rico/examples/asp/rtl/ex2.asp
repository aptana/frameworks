<%@ LANGUAGE="VBSCRIPT" %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html dir="rtl">
<head>
<title>Rico LiveGrid Plus-Example 2</title>

<%
Session.Timeout=60
dim id
id=trim(request.querystring("id"))
sqltext="select OrderID,CustomerID,ShipName,ShipCity,ShipCountry,OrderDate,ShippedDate from orders order by OrderID"
if len(id)=5 then sqltext=sqltext & " where CustomerID='" & id & "'"
session.contents("ex2")=sqltext
%>

<!-- #INCLUDE FILE = "chklang.vbs" --> 
<!-- #INCLUDE FILE = "settings.vbs" --> 

<script src="../../../src/rico.js" type="text/javascript"></script>
<link href="../../client/css/demo.css" type="text/css" rel="stylesheet" />
<script type='text/javascript'>
Rico.loadModule('LiveGridAjax');
Rico.loadModule('LiveGridMenu');
<%
setStyle
setLang
%>
var orderGrid,buffer;

Rico.onLoad( function() {
  var opts = {  
    <% GridSettingsScript %>,
    columnSpecs   : [,,,,,{type:'date'},{type:'date'}]
  };
  var menuopts = <% GridSettingsMenu %>;
  buffer=new Rico.Buffer.AjaxSQL('ricoXMLquery.asp', {TimeOut:<%=Session.Timeout%>});
  orderGrid=new Rico.LiveGrid ('ex2', new Rico.GridMenu(menuopts), buffer, opts);
});

</script>

</head>

<body>

<!-- #INCLUDE FILE = "menu.vbs" --> 
<table id='explanation' border='0' cellpadding='0' cellspacing='5' style='clear:both'><tr valign='top'><td>
<%  GridSettingsForm %>
</td><td>This example uses AJAX to fetch order data as required. 
It also demonstrates how the number of rows can be set automatically based
on the size of the window.
</td></tr></table>

<p class="ricoBookmark"><span id='ex2_timer' class='ricoSessionTimer'></span>&nbsp;&nbsp;<span id="ex2_bookmark"></span></p>
<table id="ex2" class="ricoLiveGrid" cellspacing="0" cellpadding="0">
<colgroup>
<col style='width:40px;' >
<col style='width:60px;' >
<col style='width:150px;'>
<col style='width:80px;' >
<col style='width:90px;' >
<col style='width:100px;'>
<col style='width:100px;'>
</colgroup>
  <tr id='ex2_main'>
	  <th>Order#</th>
	  <th>Customer#</th>
	  <th>Ship Name</th>
	  <th>Ship City</th>
	  <th>Ship Country</th>
	  <th>Order Date</th>
	  <th>Ship Date</th>
  </tr>
</table>
<!--
<textarea id='ex2_debugmsgs' rows='5' cols='80'></textarea>
<script type='text/javascript'>
Rico.setDebugArea('ex2_debugmsgs');
</script>
-->
</body>
</html>

