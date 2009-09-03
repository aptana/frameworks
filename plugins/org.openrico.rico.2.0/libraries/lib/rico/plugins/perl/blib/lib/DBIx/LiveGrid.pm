#######################
package DBIx::LiveGrid;
#######################
use CGI;
use vars qw/$vars $VERSION/;

$VERSION = '0.01';

sub run {
    my( $self, $cfg, @query_params ) = @_;
    my $liveGrid   = $self->new( %$cfg );
    my $db_table   = $liveGrid->query_database( @query_params );
    my $ajax_table = $liveGrid->build_ajax_table( $db_table );
    $liveGrid->send_ajax_response( $ajax_table );
}

sub new {
    my($class,%cfg) = @_;
    my $self = bless \(do{my $anon}), $class;
    my $cgi  = delete $cfg{cgi};
    $cgi ||= CGI->new;
    $vars      = \%cfg;
    for my $param( qw/id offset page_size sort_col sort_dir/ ) {
        my $val =  $self->clean_param( $param, $cgi->param($param) );
        $self->set("ajax_$param", $val );
    }
    return $self;
}

sub clean_param {
    my($self,$key,$val,$fields)=@_;

    # OFFSET MUST BE ZERO OR GREATER ... DEFAULT = 0
    if ($key eq 'offset') {
        $val = 0 unless $val and $val =~ /^\d+$/ and $val > 0;
    }
    # PAGE_SIZE MUST BE A POSITIVE INTEGER LESS THAN 200 ... DEFAULT = 70
    if ($key eq 'page_size') {
        $val = 70 unless $val and $val =~ /^\d+$/ and $val > 0 and $val < 200;
    }
    # SORT_DIR MUST BE 'ASC' OR 'DESC' ... DEFAULT = ASC
    if ($key eq 'sort_dir') {
        $val = 'ASC' unless $val and $val =~ /^(ASC|DESC)$/i;
    }
    # SORT_COL MUST BE A SPECIFIED COLUMN
    if ($key eq 'sort_col' and $fields) {
        my %is_column = map {lc $_=>1} @$fields;
        $val = '' unless $val and $is_column{lc $val};
    }
    return $val;
}

sub query_database {
    my($self,$dbh,$table_name,$fields,$where)=@_;
    my $rows     = $self->get('ajax_page_size');
    my $offset   = $self->get('ajax_offset');
    my $sort_dir = $self->get('ajax_sort_dir');
    my $sort_col = $self->get('ajax_sort_col');
       $sort_col = $self->clean_param('sort_col',$sort_col);
    my @order    = ();
    if ($sort_col) {
        @order   = ("$sort_col $sort_dir");
    }
    require SQL::Abstract::Limit;
    my $abstract = SQL::Abstract::Limit->new( limit_dialect => $dbh );
    my( $stmt, @bind ) = $abstract->select( $table_name
                                          , $fields
                                          , $where
                                          , \@order
                                          , $rows
                                          , $offset
                                          );
    return $dbh->selectall_arrayref( $stmt, {}, @bind );
}

sub build_ajax_table {
    my($self,$table_aoa) = @_;
    my $table_data = '';
    for my $row(@$table_aoa) {
        $table_data .= '<tr>';
        $table_data .= '<td>' . $_ . '</td>' for map {
            defined $_ ? $self->clean_xml($_) : ''
        } @$row;
        $table_data .= "</tr>\n";
    }
    return $table_data;
}

sub clean_xml {
    my($self,$str)=@_;
    $str =~ s/&/&amp;/g;
    $str =~ s/</&lt;/g;
    $str =~ s/>/&gt;/g;
    $str =~ s/"/&quote;/g;
    return $str;
}
sub send_ajax_response {
    my($self,$table_data)=@_;
    my $ajax_id      = ( $self->get('ajax_id') || 'data_grid' ) . '_updater';
    my $xml_encoding = $self->get('xml_encoding') || 'ISO-8859-1';
    print CGI::header('text/xml');
    printf <<'EOT', $xml_encoding,$ajax_id,$table_data;
<?xml version="1.0" encoding="%s" standalone="yes"?>
    <ajax-response>
        <response type="object" id="%s">
            <rows update_ui="true">
                %s
            </rows>
        </response>
    </ajax-response>
EOT
}
sub set {
    my($self,$key,$val) = @_;
    $vars->{$self}->{$key}=$val;
}
sub get {
    my($self,$key) = @_;
    return $vars->{$self}->{$key};
}
sub DESTROY {
    my $self = shift;
    $dbh->disconnect if $dbh;
    delete $vars->{$self};
}
1;
__END__

=pod

=head1 NAME

DBIx::LiveGrid -- Ajax LiveGrid tables from any DBI data source

=head1 SYNOPSIS

B<Automatically generate a basic sortable and scrollable liveGrid table>

This will read an Ajax request; auto-generate a SQL query with
ORDER BY, LIMIT and WHERE clauses; then send the results of the
query as an Ajax response composed of rows in an XHTML table.

 use DBI;
 my $dbh        = DBI->connect( ... any DBI datasource ... );
 my $table_name = 'countries'
 my @fields     = qw/name population human_development_index/;
 my @where      = ('population > 100000000');

 DBIx::LiveGrid->run( $dbh, $table_name, \@fields, \@where );


B<Or fine-tune the SQL and/or the XHTML yourself>

This does the same, as the above, but breaks it into steps.  You can
substitute your own methods for the SQL building stage and/or the
HTML building stage.

 use DBI;
 my $dbh        = DBI->connect( ... any DBI datasource ... );
 my $table_name = 'countries'
 my @fields     = qw/name population human_development_index/;

 # create a liveGrid object
 #
 my $liveGrid   = DBIx::LiveGrid->new;

 # let LiveGrid and SQL::Abstract construct your query
 #
 # or substitute your own routine that builds a results table
 # (an AoA such as would be returned by $dbh->selectall_arrayref)
 #
 my $db_table   = $liveGrid->query_database( $dbh
                                           , $table_name
                                           , \@fields
                                           , \%where
                                           );

 # let LiveGrid build your HTML table
 #
 # or substiture your own routine that builds an XHTML table
 # (must be valid XHTML)
 #
 my $ajax_table = $liveGrid->build_ajax_table( $db_table );

 # send the resulting XHTML table as an Ajax response
 #
 $liveGrid->send_ajax_response( $ajax_table );


=head1 DESCRIPTION

This module provides a link between Rico LiveGrids (dynamically scrollable database tables within web pages) and DBI (Perl's database interface).  With a half dozen lines of perl script and a short HTML section, you can create AJAX web windows into any DBI accessible database.

DBIx::LiveGrid lets you build web pages containing tables which
are dynamically sortable and scrollable.  From the user's perspective,
live grids work like google maps -- as you scroll through the grid,
the data is dynamically refreshed from the database.  Users can also sort
on any  column, simply by clicking on the column's header.

From the programmer's perspective, DBIx::LiveGrid is an Ajax handler - it supplies XML data to XmlHttpRequests which dynamically update web pages.  It requires a server (a short CGI or mod_perl script you write to create and use a DBIx::LiveGrid object) and an HTML client (a short HTML page which you create based on supplied templates).

On the client-side, DBIx::LiveGrid works in conjunction with two open source, easily available AJAX libraries (rico.js and prototype.js).  Rico developed the LiveGrid portion of these libraries from work on very large databases (at Sabre Airline Solutions) and have optimized the client end to request only the data it needs at any one time, and to buffer and cache data as needed.

On the server-side, DBIx::LiveGrid works in conjunction with L<SQL::Abstract> and especially with L<SQL::Abstract::Limit> to translate Rico's requests for specific chunks of data into SQL clauses appropriate for any DBI data source. Or, if you prefer, you can skip the auto-generation and build your own SQL.

With Rico's optimzed AJAX on the frontend, DBIx::LiveGrid and SQL::Abstract::Limit in the middle, and DBI at the backend, you can serve very large databases and never query or send more than small chunks of data at any one time.

=head1 INSTALLATION

See the attached README file for installation instructions.  The installation requires manually downloading and copying some of the needed AJAX libraries so please do read the README before proceeding.

=head1 CREATING A LIVE GRID


A live grid is made up of two parts: a) the server - a CGI or mod_perl script that creates a DBIx::LiveGrid object. and b) the client - an HTML page that includes one or more live grid areas and optionaly CSS to format the grids.

=head2 The LiveGrid Server Script

A basic server script defines a data source, a table to query, and the fields in the table to be included in the output of the query.  For example, if we want to query a table called "country" and we want to select the fields "name", "population", and "hd_index", this would be the entire script:

 use DBI;
 use DBIx::LiveGrid;
 
 my $dbh        = DBI->connect( ... any DBI datasource ... );
 my $table_name = 'country'
 my @fields     = qw/name population hd_index/;
 
 DBIx::LiveGrid->run( $dbh, $table_name, \@fields );
 
 __END__

The run() command will read an Ajax request that specifies an offset into the database and a limit of the rows to query and optionally other information (these will all be sent automatically by the client as described in the next section).  The run() command  will then construct a SQL query based on the data source, table and fields supplied in the script and on the offset and limit information from the client.  For example, if the client sends an offset of 20 a limit of 70, and the data source is MySQL, this query would be generated:

    SELECT name, population, hd_index
      FROM country
     LIMIT 20, 70

If the data source has a different syntax to limit the rows queried, then that syntax will be used instead (thanks to the magic of SQL::Abstract::Limit).

The run() command will take the generated SQL, query the specified database handle ($dbh), and return the results as an Ajax response to the client.

ORDER BY clauses are also handled automatically by run().  It's possible to handle WHERE clauses in a similar manner or to construct your own SQL in the script, see below for details.

=head2 The LiveGrid HTML file

HTML files that contain one or more LiveGrids can contain anything you want.  There are three steps to including grids in a page: 1) In the I<head> section, include the rico, prototype, and dbix javascirpt files and, optionally a CSS file.  2) Also in the head, declare how many grids you will have on the page.  3) In the I<body>, at the place you want each LiveGrid to appear, include a script section shown below which defines the charactersistics of the gird.

=head3 Including the CSS and JavaScript libraries

In the I<head> section of the HTML file, you should include some css and javascript files created during installation:

 <link   href="css/dbix.livegrid.css" rel="stylesheet" type="text/css">
 <script src ="scripts/prototype.js"  ></script>
 <script src ="scripts/rico.js"       ></script>
 <script src ="scripts/dbix.livegrid.js"></script>

You can modify or replace the supplied dbix.livegrid.css if you want to change colors, fonts, sizes, etc.

The javascript files should not need any modifications.  If you move them to locations other than where they were originally installed, make sure to change their locations in the HTML file.

=head3 Setting the number of Grids

Also in the head section of the HTML file, you'll define the number of grids on the page (often you'll want only one, but you can have as many as you'd like.  For three grids you'd do this:

 <script>var grid = new Array(3);</script>

=head3 Setting Grid Options

In the I<body> of the HTML page, at the place where you want a grid to appear, put a section like this:


<div id="data_grid_section"> </div>
<script>
var col_names  = new Array('Rank','Country','GDP','HDI');
var col_widths = new Array(70,180,70,50);
make_grid(
    'data_grid',                       // ID
     10,                               // ROWS TO DISPLAY
     177,                              // TOTAL ROWS IN TABLE
     col_widths,                       // COLUMN WIDTHS
     col_names,                        // COLUMN NAMES
    'cgi-bin/livegrid.cgi',            // AJAX HANDLER
    {                                  // LIVEGRID OPTIONS
      prefetchBuffer : true ,
      onscroll       : updateHeader,
      pageSize       : 70
    }
);
</script>

The first line defines the div section for this grid.  It should have a unique id, 'data_grid' in the example.  This div will be filled with a table based on the information in the script that follows.  The script first defines the column names for the gird - these should match the columns in the table you want to query. 

The next line defines the column widths (in pixels) for each column.

The make_grid() call starts with the same unique id used in the div section, 'data_grid' in the example.  This is followed by these variables

  Rows to display     : the "height" of the gird in rows, usually around 10
  Total rows in table : the total number of rows in the table to be queried
  Column Widths       : column width as defined earlier
  Column Names        : column names as defined earlier
  Ajax Handler        : the URL of your LiveGrid Server CGI script

Note: the grid scrolling works best if you specify the exact number of rows in the table, however, if you don't know the exact number of rows, you may be able to put a number higher than what you guess is the number of rows.

And finally, the Rico LiveGrid options are given as a hash.  See the Rico documentation for the effect of these options.  The prefetchBuffer option is useful if you want the table populated as soon as the page is loaded.  An onscroll options can point to your own subroutine to display listings of the numbers of rows being displayed.

See the Rico documentation at http://openrico.org/ for details of the available table options.

B<Please Note> : The script above creates a grid area composed of div and table tags ready to recieve output from DBIx::LiveGrid.  You can also construct the divs and tables yourself if you prefer.  See the example divs and tables on the Rico site.

=head1 Methods

In many cases, you can simply call DBIX::LiveGrid->run(), but for finer tuning, you can create a LiveGrid object with new() and use the other methods shown below.

=head2 run()

The run() method runs the LiveGrid server, i.e. it reads an AJAX request from the client, checks that the request is valid, transforms it into a SQL::Abstract query, sends the query to the database, makes the database results XML clean, and wraps the results in AJAX tags, and sends the AJAX response back to the client.

 use DBIx::LiveGrid;
 DBIx::LiveGrid->run( \%config, $dbh, $table_name, \@fields, \%where );

The required config parameter is the same as in the call to new(), see below for details.  It may be defined or undefied.  The required $dbh parameter is any DBI database handle.  The requried table_name parameter is a string, the table to be queried.  The required fields parameter is an arrayref, the names of the columns to be included in the query.  The optional where parameter is a where clause as represented by SQL::Abstract and may be either a hashref or an arrayref (see SQL::Abstract for details).

=head2 new()

For finer-tuned control over the SQL and/or the XHTML, you will want to create a DBIX::LiveGrid object, like this:

 use DBIx::LiveGrid;
 my $liveGrid = DBIx::LiveGrid->new( %config );

The optional config parameter is a hash which can include these keys:

 cgi          => $cgi_object,
 xml_encoding => $xml_encoding_string,
 page_size    => $integer

The optional cgi parameter is a CGI.pm object.  If you don't need a CGI.pm object in your script, you can omit this and DBIx::LiveGrid will create a new CGI.pm object on its own.

The optional xml_encoding parameter defines the XML encoding to be placed in the XML declaration at the top of the AJAX response.  The default value is 'ISO-8859-1' which produces a declaration like this:

  <?xml version="1.0" encoding="ISO-8859-1" standalone="yes"?>

The optional page_size parameter is the maximum number of rows the script is allowed to send in response to a single request.  If omitted, the default is 200 rows.  The client may also be sending a page_size setting, which can be less than the page_size you set here on the server, but can never exceed the page_size set on the server (to prevent clients from making excessive demands on the server).  The page_size (whether set by the client, or set on the server, or set by default) is used by LiveGrid as a buffer.  For exmaple, if your grid shows 10 rows and your page_size is 70, the user will see the first 10 rows, then, as they scroll, they will be getting rows from the buffer up to row 70 and after that a request for another 70 rows will automatically be sent.

=head2 query_database()

The query_database() method uses SQL::Abstract and SQL::Abstract::Limit to build a query based on the original AJAX request and on parameters you pass to the method.  It returns the results of a selectall_arrayref(), i.e. an AoA of the results.

 my $table_aoa = $liveGrid->query_database($dbh,$table_name,\@fields,\%where);

The required $dbh parameter is any DBI database handle. The required \@fields pareter is an arrayref of field names to be used in the SELECT clause of the query.  The optional \%where parameter is a WHERE clause as expected by SQL::Abstract.

If you want to construct your own SQL query rather than using SQL::Abstract, you can do anything that returns an AoA.  Keep in mind though that query_database() performs several kinds of construction and validation that you'll have to handle yourself:  it validates that ajax_offset and ajax_page_size are in the correct range, that ajax_sort_col is one of the columns listed in your \@fields, that ajax_sort_dir is either 'ASC' or 'DESC'.  This prevents values from user forms from being entered unvalidated into the SQL query.  It also automatically constructs ORDER BY, LIMIT and OFFSET clauses based on the values of ajax_offset, ajax_page_size, ajax_sort_col, and ajax_sort_dir which are all sent automatically by the client.

=head2 build_ajax_table()

The build_ajax_table takes a result set as an AoA as returned by query_databse() or by $dbh->selectall_arrayref().  It loops through the AoA putting each row inside "<tr>" tags and each column inside "<td>" tags.  

 my $ajax_table = $liveGrid->build_ajax_table($table_aoa);

If you wish to build the table yourself (for example if you want each column to have a unique class or text other than what comes from the database), you should return a string of rows, I<without> the "<table>" tags, like this:

  <tr> <td> row1col1 </td> <td>row1col2 </td> ... </tr>
  <tr> <td> row2col1 </td> <td>row2col2 </td> ... </tr>
  ...

The values inside the <td> tags B<must> be valid XML (for this purpose valid XHTML is a form of valid XML).  The build_ajax_table() uses the clean_xml() method to turn < > " & into XML entities.  If you need any other form of XML cleaning, you'll have to do it yourself by making your own build_ajax_table() method.  See the source of the method for an example, it's pretty simple.

=head2 send_ajax_response()

This method wraps the XHTML table rows in the ajax-response tags expected by the Rico LiveGrid client and sends them along with a text/xml content-type to the client.

 $liveGrid->send_ajax_response( $xhtml_table_string );

=head2 clean_param()

A utility method called during new() and also during query_database() that makes sure that all values from the AJAX request are valid to send to a database.  It checks that

 * offset is an integer, 0 or greater, defaults to 0 otherwise
 * page_size is an integer greater than 0 and less than server's page_size
 * sort_col is a column in the database (as defined by you with \@fields)
 * sort_dir is either 'ASC' or 'DESC'

Thus none of the AJAX request parameters will be passed raw to the database without validation.
 

=head2 clean_xml()

A utility method called during build_ajax_table().  It takes each value retrieved from the database and turns < > & " into &lt;, &gt;, &amp;, and &quot;.  The values must be valid XML so if this simple clean routine isn't enough to produce valid XML from your database data, you'll need clean it yourself.

 my $clean_xml = $liveGrid->clean( $value_from_database );

=head2 get()

 An accessor method for the AJAX request variables.

   my $id        = $liveGrid->get('ajax_id');
   my $offset    = $liveGrid->get('ajax_offset');
   my $page_size = $liveGrid->get('ajax_page_size');
   my $sort_col  = $liveGrid->get('ajax_sort_col');
   my $sort_dir  = $liveGrid->get('ajax_sort_dir');

=head2 set()

 The mutator equivalent of get().

=head1 GETTING FURTHER HELP

Please B<don't> contact me with questions on AJAX or on the Rico LiveGrid itself.  Rico has a site with documentation, examples, and a help forum.  Please go to L<http://openrico.org/> if you need help with the client side.

Please B<do> contact me with bug reports, suggestions etc. about the Perl end of the module.  If you are having trouble getting it installed or working, L<http://www.perlmonks.org> is a good source of help.

=head1 AUTHOR & COPYRIGHT

This module is copyright (c), Jeff Zucker jzuckerATcpan.org, 2005, all rights reserved.

It may be freely modified and distributed under the same terms as Perl itself.

=cut

BROWSER ---ajaxRequest--> SERVER ---dbRequest--> DATABASE
BROWSER <--ajaxResponse-- SERVER <--dbResponse-- DATABASE
