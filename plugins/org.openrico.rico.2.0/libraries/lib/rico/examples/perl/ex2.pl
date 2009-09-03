#!/usr/local/bin/perl

use CGI qw/:standard default_dtd/;

$sqltext="select OrderID,CustomerID,LastName,ShipCity,ShipCountry,OrderDate,ShippedDate from Orders, Employees where Orders.EmployeeID=Employees.EmployeeID";
#$sqltext="select OrderID,CustomerID,ShipName,ShipCity,ShipCountry,OrderDate,ShippedDate from nworders";
require 'menu.pl';
require 'settings.pl';
$settings=GridSettingsScript();
$menuopts=GridSettingsMenu();

default_dtd('-//W3C//DTD HTML 4.01//EN', 'http://www.w3.org/TR/html4/strict.dtd');
print header();
$LGincludes=<<END;
Rico.loadModule('LiveGridAjax');
Rico.loadModule('LiveGridMenu');
Rico.onLoad( function() {
  var orderGrid,buffer;
  var opts = {  
    $settings,
    columnSpecs   : [,,,,,{type:'date'},{type:'date'}]
  };
  buffer=new Rico.Buffer.AjaxSQL('ricoXMLquery.pl');
  orderGrid=new Rico.LiveGrid ('ex2', buffer, opts);
  orderGrid.menu=new Rico.GridMenu($menuopts);
});
END
if ($style) {
  $LGincludes.="\nRico.include('$style.css');";
}
print start_html(-dtd=>1,
                 -title => 'Rico LiveGrid Plus-Example 2',
                 -style => '../client/css/demo.css',
                 -script=>[
                           { -language => 'JavaScript',
                             -src      => '../../src/rico.js'
                           },
                           { -language => 'JavaScript',
                             -code     => $LGincludes
                           }
                        ]
                 );


demoMenu();
print "<table id='explanation' border='0' cellpadding='0' cellspacing='5' style='clear:both'><tr valign='top'><td>";
GridSettingsForm();
print <<END;
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
  <tr>
	  <th>Order#</th>
	  <th>Customer#</th>
	  <th>Ship Name</th>
	  <th>Ship City</th>
	  <th>Ship Country</th>
	  <th>Order Date</th>
	  <th>Ship Date</th>
  </tr>
</table>
END

#print "<textarea id='ex2_debugmsgs' rows='5' cols='80' style='font-size:smaller;'></textarea>";
print end_html;
