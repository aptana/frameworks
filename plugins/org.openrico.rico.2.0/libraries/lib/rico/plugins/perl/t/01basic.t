#!/usr/bin/perl -w
use strict;
use lib '../lib';
use Test::Simple tests=>2;
my $liveGrid;

ok( eval{ require DBIx::LiveGrid; 1; }, 'module load'  );
ok( $liveGrid = DBIx::LiveGrid->new   , 'object create');

