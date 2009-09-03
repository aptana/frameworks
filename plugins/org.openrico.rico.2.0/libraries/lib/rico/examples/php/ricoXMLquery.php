<?
if (!isset ($_SESSION)) session_start();
header("Cache-Control: no-cache");
header("Pragma: no-cache");
header("Expires: ".gmdate("D, d M Y H:i:s",time()+(-1*60))." GMT");
header("Content-type: text/xml");
echo "<?xml version='1.0' encoding='iso-8859-1'?".">\n";

require "applib.php";
require "../../plugins/php/ricoXmlResponse.php";

$id=isset($_GET["id"]) ? $_GET["id"] : "";
$offset=isset($_GET["offset"]) ? $_GET["offset"] : "0";
$size=isset($_GET["page_size"]) ? $_GET["page_size"] : "";
$total=isset($_GET["get_total"]) ? strtolower($_GET["get_total"]) : "false";

echo "\n<ajax-response><response type='object' id='".$id."_updater'>";
if (empty($id)) {
  ErrorResponse("No ID provided!");
} elseif (!is_numeric($offset)) {
  ErrorResponse("Invalid offset!");
} elseif (!is_numeric($size)) {
  ErrorResponse("Invalid size!");
} elseif (!isset($_SESSION[$id])) {
  ErrorResponse("Your connection with the server was idle for too long and timed out. Please refresh this page and try again.");
} elseif (!OpenDB()) {
  ErrorResponse(htmlspecialchars($oDB->LastErrorMsg));
} else {
  $oDB->DisplayErrors=false;
  $oDB->ErrMsgFmt="MULTILINE";
  $oXmlResp= new ricoXmlResponse();
  $oXmlResp->sendDebugMsgs=true;
  $oXmlResp->Query2xml($_SESSION[$id], intval($offset), intval($size), $total!="false", $_SESSION[$id . ".filters"]);
  if (!empty($oDB->LastErrorMsg)) {
    echo "\n<error>";
    echo "\n".htmlspecialchars($oDB->LastErrorMsg);
    echo "\n</error>";
  }
  $oXmlResp=NULL;
  CloseApp();
}
echo "\n</response></ajax-response>";


function ErrorResponse($msg) {
  echo "\n<rows update_ui='false' /><error>" . $msg . "</error>";
}

?>