$menu="dblclick";
$style="greenHdg";
$frozen=1;
$sort="true";
$hide="true";
$filter=defined($sqltext) ? "true" : "false";
$resize="true";
$highlt="none";
if (param("menu")) {
  $menu=param("menu");
  $style=param("style");
  $frozen=param('frozen');
  $sort=param('sort') || "false";
  $hide=param('hide') || "false";
  $filter=param('filter') || "false";
  $resize=param('resize') || "false";
  $highlt=param('highlt');
}
return 1;

sub GridSettingsMenu {
  print "{}";
}

sub GridSettingsScript {
  my $js = "menuEvent     : '".$menu."',\n";
  $js .= "frozenColumns : ".$frozen.",\n";
  $js .= "canSortDefault: ".$sort.",\n";
  $js .= "canHideDefault: ".$hide.",\n";
  $js .= "allowColResize: ".$resize.",\n";
  $js .= "canFilterDefault: ".$filter.",\n";
  $js .= "highlightElem: '".$highlt."'";
  return $js;
}

sub GridSettingsTE {
  my(%options)=@_;
  $options{"menuEvent"}=substr($menu,1);
  $options{"canSortDefault"}=($sort eq "true");
  $options{"canHideDefault"}=($hide eq "true");
  $options{"allowColResize"}=($resize eq "true");
  $options{"canFilterDefault"}=($filter eq "true");
  $options{"highlightElem"}=substr($highlt,0,2);
  $options{"highlightSection"}=substr($highlt,3);
  $options{"frozenColumns"}=$frozen;
}

sub GridSettingsForm {
  print "<form id='settings'>";
  print "<table border='0' cellspacing='5' cellpadding='0'>";
  print "\n<tr><td colspan='2'><input type='submit' value='Change Settings' style='font-size:small'></td></tr>";
  print "\n<tr valign=top><td>";
  print "\n<table border='0' cellspacing='0' cellpadding='0'>";

  print "\n<tr><td>Style:</td><td><select name='style' style='margin:0'>";
  SettingOpt("greenHdg", "Green Heading", $style);
  SettingOpt("tanChisel", "Tan chisel", $style);
  SettingOpt("warmfall", "Warm Fall", $style);
  SettingOpt("iegradient", "IE gradient", $style);
  SettingOpt("coffee-with-milk", "Coffee with milk", $style);
  SettingOpt("grayedout", "Grayed out", $style);
  print "</select></td></tr>";

  print "\n<tr><td>Menu&nbsp;event:</td><td><select name='menu' style='margin:0'>";
  SettingOpt("click", "Click", $menu);
  SettingOpt("dblclick", "Double-click", $menu);
  SettingOpt("contextmenu", "Right-click", $menu);
  SettingOpt("none", "None", $menu);
  print "</select></td></tr>";

  print "\n<tr><td>Highlight:</td><td><select name='highlt' style='margin:0'>";
  SettingOpt("cursorCell", "Cursor Cell", $highlt);
  SettingOpt("cursorRow", "Cursor Row", $highlt);
  SettingOpt("menuCell", "Menu Cell", $highlt);
  SettingOpt("menuRow", "Menu Row", $highlt);
  SettingOpt("selection", "Selection", $highlt);
  SettingOpt("none", "None", $highlt);
  print "</select></td></tr>";

  print "\n<tr><td>Frozen columns:</td><td><select name='frozen' style='margin:0'>";
  for ($i=0; $i<=3; $i++) {
    $sel=($frozen == $i) ? " selected" : "";
    print "<option value='".$i."'".$sel.">".$i."</option>";
  }
  print "</select></td></tr>";

  print "</table>";
  print "</td><td>";
  print "<table border='0' cellspacing='0' cellpadding='0'>";
  SettingChkBx("sort", $sort, "Sorting?", 0);
  SettingChkBx("filter", $filter, "Filtering?", !defined($sqltext));
  SettingChkBx("hide", $hide, "Hide/Show?", 0);
  SettingChkBx("resize", $resize, "Resizing?", 0);
  print "</td></tr></table>";
  print "\n</table></form>";
}

sub SettingChkBx {
  my($name, $value, $desc, $disable)=@_;
  $chk=($value eq "true") ? " checked" : "";
  print "<tr><td><input type='checkbox' value='true' name='".$name."'".$chk;
  if ($disable) {
    print " disabled";
  }
  print "></td><td>".$desc."</td></tr>";
}

sub SettingOpt {
  my($value, $desc, $default)=@_;
  $sel=($value eq $default) ? " selected" : "";
  print "\n<option value='".$value."'".$sel.">".$desc."</option>";
}


