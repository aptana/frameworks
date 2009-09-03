use DBI;
use DBIx::LiveGrid2;
use CGI::Session;
use CGI qw/:standard/;

$session = new CGI::Session();
$dbh = DBI->connect("dbi:mysql:northwind","userid","password");

my $table_name = 'orders';
my @fields     = qw/OrderID CustomerID ShipName ShipCity ShipCountry OrderDate ShippedDate/;
my $liveGrid   = DBIx::LiveGrid2->new;

@names=param();
#@notin=();
foreach $qs (@names) {
  $value=param($qs);
  #print "<qs>$qs : $value</qs>";
  $qs1=substr($qs,0,1);
  if ($qs1 eq "s") {
    $i=substr($qs,1);
    $liveGrid->set('ajax_sort_col',$i+1);
    $liveGrid->set('ajax_sort_dir',$value);
  } elsif ($qs1 eq "f") {
    next unless ($qs=~/^f\[(\d+)\]\[op\]$/);
    $i=$1;
    if ($value eq "EQ") {
      $where{$fields[$i]}=param("f[$i][0]");
    } elsif ($value eq "LE") {
      $where{$fields[$i]}{'<='}=param("f[$i][0]");
    } elsif ($value eq "GE") {
      $where{$fields[$i]}{'>='}=param("f[$i][0]");
    } elsif ($value eq "NULL") {
      $where{$fields[$i]}=undef;
    } elsif ($value eq "NOTNULL") {
      $where{$fields[$i]}{'!='}=undef;
    } elsif ($value eq "LIKE") {
      $filter=param("f[$i][0]");
      $filter=~tr/*/%/;
      $where{$fields[$i]}{-like}=$filter;
    } elsif ($value eq "NE") {
      $flen=param("f[$i][len]");
      @notin[$i]=();
      for ($j=0; $j<$flen; $j++) {
        push @{$notin[$i]},param("f[$i][$j]")
      }
      $where{$fields[$i]}{-not_in}=\@{$notin[$i]};
    }
  }
}
#print '<p>'.join(':',@v).'</p>';

 my $db_table   = $liveGrid->query_database( $dbh
                                           , $table_name
                                           , \@fields
                                           , \%where
                                           );

my $ajax_table = $liveGrid->build_ajax_table( $db_table );
$liveGrid->send_ajax_response( $ajax_table );

