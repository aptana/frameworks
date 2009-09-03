<? 
// Coded for PHP4 - requires PHP's XSLT extension to be enabled

$outfile=isset($_GET["name"]) ? $_GET["name"] : "export";
if (!isset($_GET["xml"])) {
  echo "ERROR: expected url for xml source document";
}
elseif (!isset($_GET["xsl"])) {
  echo "ERROR: expected url for xsl transformation";
}
else {
  doTransform($_GET["xml"], $_GET["xsl"]."2xl.xsl");
}



function doTransform($xmlfilename, $xslfilename) {
  $xh = xslt_create();
  if (!$xh) {
    echo "<p>ERROR: unable to invoke php's xslt processor";
    return;
  }
  $root='file://'.$_SERVER['DOCUMENT_ROOT'];
  $result = xslt_process($xh, $root.$xmlfilename, $root.$xslfilename);
  if ($result) {
    header("Content-type: application/ms-excel");
    //header("Content-type: application/vnd.ms-excel");
    header('Content-Disposition: attachment; filename="'.$GLOBALS['outfile'].'.xls";');
    echo $result;
  } else {
    echo "<p>ERROR: unable to transform ".$xmlfilename;
    echo "<br>" . xslt_error($xh); 
  }
  xslt_free($xh);
}

?> 
