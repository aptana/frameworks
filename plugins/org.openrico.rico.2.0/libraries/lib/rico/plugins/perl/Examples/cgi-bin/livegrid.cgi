#!/usr/bin/perl -w
use strict;
use DBI;
use lib './';
use DBIx::LiveGrid;

my $dbh        = DBI->connect("dbi:CSV(RaiseError=1,PrintError=0):csv_eol=\n");
my $table_name = q{"../data_files/hdi.csv"};
my @fields     = qw/rank country gdp hdi/;

DBIx::LiveGrid->run( undef, $dbh, $table_name, \@fields );

__END__
This does the same thing as run():

  my $liveGrid   = DBIx::LiveGrid->new;
  my $db_table   = $liveGrid->query_database( $dbh, $table_name, \@fields );
  my $ajax_table = $liveGrid->build_ajax_table( $db_table );
  $liveGrid->send_ajax_response( $ajax_table );

