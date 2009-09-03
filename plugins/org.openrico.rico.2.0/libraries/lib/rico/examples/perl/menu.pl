use File::Basename;

@demoScripts=("ex1.pl","ex2.pl");

sub demoMenu() {
  my $curscript=basename($ENV{'SCRIPT_NAME'});
  print "<strong style='color:brown;'>Rico LiveGrid Plus</strong>";
  print "\n<table border='0' cellpadding='5'>\n<tr>";
  print "<td><a href='../'>Release Home</a></td>";
  foreach $v (@demoScripts) {
    $k=substr($v,2,1);
    if ($v eq $curscript) {
      print "<td><strong style='border:1px solid brown;color:brown;'>Ex $k</strong></td>";
    } else {
      print "<td><a href='$v'>Ex $k</a></td>";
    }
  }
  print "</tr>\n</table>";
}
