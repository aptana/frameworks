<?
if (!isset ($_SESSION)) session_start();
?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>
<title>Rico LiveGrid Plus-Example 6</title>

<? 
require "applib.php";

OpenDB();
$sqltext="select CustomerID,ShipName," . $GLOBALS['oDB']->SqlYear("ShippedDate") . " as yr,count(*) as cnt from orders group by CustomerID,ShipName," . $GLOBALS['oDB']->SqlYear("ShippedDate") . " order by CustomerID";
$_SESSION['ex6']=$sqltext;
CloseApp();

require "chklang.php";
require "settings.php";
?>

<script src="../../src/rico.js" type="text/javascript"></script>
<link href="../client/css/demo.css" type="text/css" rel="stylesheet" />
<script type='text/javascript'>
Rico.loadModule('LiveGridAjax');
Rico.loadModule('LiveGridMenu');
<?
setStyle();
setLang();
?>

var ex6;

function setFilter() {
  for (var i=0; i<yrboxes.length; i++) {
    if (yrboxes[i].checked==true) {
      var yr=yrboxes[i].value;
      ex6.columns[2].setSystemFilter('EQ',yr);
      return;
    }
  }
}

Rico.onLoad( function() {
  yrboxes=document.getElementsByName('year');
  var opts = {  
    <? GridSettingsScript(); ?>,
    prefetchBuffer: false,
    headingSort   : 'hover',
    columnSpecs   : [,{type:'control',control:new Rico.TableColumn.link('ex2.php?id={0}','_blank'),width:250},,'specQty']
  };
  var buffer=new Rico.Buffer.AjaxSQL('ricoXMLquery.php', {TimeOut:<? print array_shift(session_get_cookie_params())/60 ?>});
  ex6=new Rico.LiveGrid ('ex6', buffer, opts);
  ex6.menu=new Rico.GridMenu(<? GridSettingsMenu(); ?>);
  setFilter();
});
</script>

<style type="text/css">
.ricoLG_top div.ricoLG_col {
  white-space:nowrap;
}
.ricoLG_top div.hover {
  background-color: #dee8cd !important;
}
</style>

</head>

<body>

<?
require "menu.php";
print "<table id='explanation' border='0' cellpadding='0' cellspacing='5' style='clear:both'><tr valign='top'><td>";
GridSettingsForm();
?>
</td>
<td>This example shows how to apply a filter to the initial data set - even though that filter may change later.
It also demonstrates an alternative way of formatting the headings and handling click events on them.
</td></tr></table>

<p>Count orders for: 
<input type='radio' name='year' onclick='setFilter()' value='1996' checked>&nbsp;1996
<input type='radio' name='year' onclick='setFilter()' value='1997'>&nbsp;1997
</p>

<p class="ricoBookmark"><span id="ex6_bookmark">&nbsp;</span></p>
<table id="ex6" class="ricoLiveGrid" cellspacing="0" cellpadding="0">
<colgroup>
<col style='width:40px;' >
<col style='width:60px;' >
<col style='width:40px;' >
<col style='width:40px;' >
</colgroup>
  <tr>
	  <th>Cust#</th>
	  <th>Ship Name</th>
	  <th>Year</th>
	  <th>Orders</th>
  </tr>
</table>
<!--
<textarea id='ex6_debugmsgs' rows='5' cols='80'>
-->
</body>
</html>

