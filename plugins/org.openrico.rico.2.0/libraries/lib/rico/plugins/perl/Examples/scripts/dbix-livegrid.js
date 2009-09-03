var onloads      = new Array();

function make_grid(
  id, num_rows, max_rows, col_widths, col_names, ajax_handler, opts
){
    var row1a = '<th class="first tableCellHeader" style="width:';
    var row1b = '<th class="tableCellHeader" style="width:';
    var row2  = 'px;">';
    var row3  = '</th>';
    var tbl  = '<table id="'+id+'_header" class="fixedTable" cellspacing="0">'
              + '<tr>' + row1a + col_widths[0] + row2 + col_names[0] + row3;
    for(var i=1;i<col_names.length;i++){
        tbl +=  row1b + col_widths[i] + row2 + col_names[i] + row3;
    }
    tbl += '</tr></table>';
    tbl += '<div id="' + id + '_container" style="margin:0px;padding:0px">'
        +  '<div id="viewPort" style="float:left">'
        +  '<table id="' + id + '"  class="fixedTable" cellspacing="0">';
    for(var r=0;r<num_rows+1;r++){
        tbl += '<tr>';
        for(var i=0;i<col_names.length;i++){
            tbl += '<td class="cell" style="width:' + col_widths[i] + 'px">'
                +  '&nbsp;</td>';
        }
        tbl += '</tr>';
    }
    tbl += '</table></div></div>';       
    document.getElementById( id + "_section").innerHTML = tbl;
    onloads.push(
        function() {
            grid[id]=new Rico.LiveGrid(id,num_rows,max_rows,ajax_handler,opts);
        }
    );
}


function updateHeader( liveGrid, offset ) {
    $('bookmark').innerHTML = "Listing records "
                            + (offset+1) 
                            + " - " 
                            + (offset+liveGrid.metaData.getPageSize())
                            + " of "
                            + liveGrid.metaData.getTotalRows();
    var sortInfo = "";
    if (liveGrid.sortCol) {
          sortInfo = "&data_grid_sort_col="
                   + liveGrid.sortCol
                   + "&data_grid_sort_dir="
                   + liveGrid.sortDir;
    }
    $('bookmark').href = "?data_grid_index="
                       + offset
                       + sortInfo;
}

function bodyOnLoad() {
    for ( var i = 0 ; i < onloads.length ; i++ ) onloads[i]();
}
