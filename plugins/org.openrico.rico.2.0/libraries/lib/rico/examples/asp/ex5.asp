<%@ LANGUAGE="VBSCRIPT" %>
<% Response.CacheControl = "no-cache" %>
<% Response.AddHeader "Pragma", "no-cache" %> 
<% Response.Expires = -1 %>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>

<title>Sales Assignments</title>

<!-- #INCLUDE FILE = "applib.vbs" -->
<!-- #INCLUDE FILE = "chklang.vbs" --> 

<script src="../../src/rico.js" type="text/javascript"></script>
<link href="../client/css/demo.css" type="text/css" rel="stylesheet" />
<script type='text/javascript'>
Rico.loadModule('LiveGrid');
Rico.loadModule('CustomMenu');
Rico.include('greenHdg.css');
<% setLang %>

var menu,grid;

Rico.onLoad( function() {
  var gridopts = {  
    highlightElem    : 'selection',
    highlightSection : 2,
    canDragSelect    : true,
    frozenColumns    : 2,
    menuSection      : 2,
    visibleRows      : 'data',
    menuEvent        : 'contextmenu'
  };
  grid=new Rico.LiveGrid ('emptab', new Rico.Buffer.Base($('emptab').tBodies[0]), gridopts);
  menu=new Rico.Menu('7em');
  menu.createDiv();
  createSubMenus();
  grid.menu=menu;
});

function setEmployee(EmpId, Name) {
  menu.cancelmenu();
  grid.FillSelection(Name);
  grid.ShowSelection();
  grid.ClearSelection();
}
</script>

<style type="text/css">
div.container {
float:left;
margin-left:2%;
width:75%;
overflow:hidden; /* this is very important! */
}
</style>
</head>

<body>

<!-- #INCLUDE FILE = "menu.vbs" --> 

<div style='float:left;font-size:9pt;width:18%;color:blue;font-family:Verdana, Arial, Helvetica, sans-serif;'>
<p>In this scenario, you are a sales manager and you must assign your sales staff by customer and product category.
<p>Drag over cells to select them (doesn't work in FF if the cell is empty). You can also select using shift-click and ctrl-click. 
Ctrl-click cannot be used to select in Safari or Opera because this is the combination to invoke the context menu on those browsers.
<p>Once some cells are selected, right-click (ctrl-click in Opera or Safari) to select an employee from the pop-up menu.
<p>The selection will be filled with the selected employee. Notice that the
employee names and selections scroll with the grid.
</div>

<div class="container">

<%
if OpenDB then
  AppHeader "Sales Assignments By Customer &amp; Product Category"
  response.write "<p class='ricoBookmark'><span id='emptab_bookmark' style='font-size:10pt;'>&nbsp;</span></p>"
  DisplayTable
end if
CloseApp


sub DisplayTable()
  dim rsLookup,LastCountry

  response.write "<table id='emptab'>"
  response.write "<thead><tr><th>ID</th><th>Company</th>"
  Set rsLookup = oDB.RunQuery("Select CategoryID, CategoryName From Categories Order By CategoryName")
  while not rsLookup.eof
    response.write "<th style='width:100px;'>" & rsLookUp("CategoryName") & "</th>"
    rsLookup.movenext
  wend
  oDB.rsClose rsLookup
  response.write "</tr></thead><tbody>"
  Set rsLookup = oDB.RunQuery("Select CustomerID, CompanyName From Customers Order By CompanyName")
  while not rsLookup.eof
    response.write "<tr><td>" & rsLookUp("CustomerID") & "</td><td>" & rsLookUp("CompanyName") & "</td></tr>"
    rsLookup.movenext
  wend
  oDB.rsClose rsLookup
  response.write "</tbody></table>"

  response.write vbLf & "<script type='text/javascript'>"
  response.write vbLf & "function createSubMenus() {"
  Set rsLookup = oDB.RunQuery("Select Country, EmployeeID, LastName From Employees Order By Country, LastName")
  while not rsLookup.eof
    if LastCountry <> rsLookUp("Country") then
      LastCountry=rsLookUp("Country")
      response.write vbLf & "  var submenu = new Rico.Menu();"
      response.write vbLf & "  submenu.createDiv();"
      response.write vbLf & "  menu.addSubMenuItem('" & rsLookUp("Country") & "',submenu);"
    end if
    response.write vbLf & "  submenu.addMenuItem('" & rsLookUp("LastName") & "',function() {setEmployee('" & rsLookUp("EmployeeID") & "','" & rsLookUp("LastName") & "');});"
    rsLookup.movenext
  wend
  oDB.rsClose rsLookup
  response.write vbLf & "}"
  response.write vbLf & "</script>"

end sub

%>
</div>
<!--
<textarea id='emptab_debugmsgs' rows='5' cols='80' style='font-size:smaller;'></textarea>
-->

</body>
</html>
