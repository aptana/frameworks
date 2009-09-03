# -*- perl -*-

use strict;
require ExtUtils::MakeMaker;

my %opts =
    ('NAME'         => 'DBIx::LiveGrid',
     'VERSION_FROM' => './lib/DBIx/LiveGrid.pm',
     'dist'         => { 'SUFFIX'       => ".gz",
			 'DIST_DEFAULT' => 'all tardist',
			 'COMPRESS'     => "gzip -9vf" }
     );
if ($ExtUtils::MakeMaker::VERSION >= 5.43) {
    $opts{'AUTHOR'} = 'Jeff Zucker (jzucker@cpan.org)';
}
ExtUtils::MakeMaker::WriteMakefile(%opts);
