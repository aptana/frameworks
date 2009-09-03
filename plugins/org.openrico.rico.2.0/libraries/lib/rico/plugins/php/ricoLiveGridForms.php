<?
//**********************************
// Rico: GENERIC TABLE/VIEW EDITOR
//  By Matt Brown
//**********************************

class TableEditTable {
  var $TblName;
  var $alias;
  var $arFields;
  var $arData;
  var $arColInfo;
}

class TableEditClass {

  // public properties
  var $action;
  var $TableFilter;
  var $options;
  var $AutoInit;
  var $CurrentField;
  var $SvrOnly;
  var $gridID;
  var $formVar;
  var $gridVar;
  var $bufferVar;
  var $optionsVar;
  var $DefaultSort;

  // private properties
  var $Panels=array();
  var $objDB;
  var $CurrentPanel;
  var $xhtmlcloser;
  var $ErrorFlag;
  var $ErrorMsg;
  var $MainTbl;
  var $Tables=array();
  var $TableCnt;
  var $Fields=array();
  var $FieldCnt;

  // returns field number if successful, false if error
  function AddEntryField($ColumnName, $Heading, $EntryTypeCode, $DefaultValue) {
    if (!in_array($EntryTypeCode, array("S", "N", "R", "H", "D", "DT", "I", "B", "T", "TA", "SL", "RL", "CL", "tinyMCE"))) {
      $this->TableEditError("invalid EntryTypeCode in TableEditClass");
      return false;
    }
    $this->IncrCurrentField();
    $this->CurrentField["ColName"]=$ColumnName;
    $this->CurrentField["Hdg"]=$Heading;
    $this->CurrentField["EntryType"]=$EntryTypeCode;
    $this->CurrentField["ColData"]=$DefaultValue;
    switch ($EntryTypeCode) {

      case "I":
        $this->CurrentField["OnChange"]="TableEditCheckInt";
        break;

      case "D":
        $this->CurrentField["type"]="date";
        break;

      case "DT":
        $this->CurrentField["type"]="datetime";
        break;

      case "TA":
      case "tinyMCE":
        $this->CurrentField["TxtAreaRows"]=4;
        $this->CurrentField["TxtAreaCols"]=80;
        break;

      case "R":
      case "RL":
        $this->CurrentField["RadioBreak"]="<br".$this->xhtmlcloser;
        break;

      case "H":
        $this->CurrentField["visible"]=false;
        break;
    }
    return $this->FieldCnt;
  }

  // returns field number if successful, false if error
  function AddEntryFieldW($ColumnName, $Heading, $EntryTypeCode, $DefaultValue, $Width) {
    $retval=$this->AddEntryField($ColumnName, $Heading, $EntryTypeCode, $DefaultValue);
    if ($retval!==false) $this->CurrentField["width"]=$Width;
    return $retval;
  }

  // returns field number if successful, false if error
  function AddCalculatedField($ColumnFormula, $Heading) {
    $this->IncrCurrentField();
    if (substr($ColumnFormula,0,1) != "(") {
      $ColumnFormula="(".$ColumnFormula.")";
    }
    $this->CurrentField["ColName"]="Calc_".$this->FieldCnt;
    $this->CurrentField["Formula"]=$ColumnFormula;
    $this->CurrentField["Hdg"]=$Heading;
    return $this->FieldCnt;
  }

  function AddPanel($PanelHeading) {
    $this->CurrentPanel++;
    $this->Panels[$this->CurrentPanel]=$PanelHeading;
  }

  function DefineAltTable($AltTabName, $arFieldList, $arFieldData) {
    $this->TableCnt++;
    $this->Tables[$this->TableCnt]= new TableEditTable();
    $_withval=$this->Tables[$this->TableCnt];
    $_withval->TblName=$AltTabName;
    $_withval->alias="a" . $this->TableCnt;
    $_withval->arFields=$arFieldList;
    $_withval->arData=$arFieldData;
    if (count($_withval->arFields) != count($_withval->arData)) {
      $this->TableEditError("# of fields does not match # of data entries supplied for table ".$AltTabName);
      return false;
    }
    return $this->TableCnt;
  }

  function IncrCurrentField() {
    $this->FieldCnt++;
    $this->Fields[$this->FieldCnt]= array();
    $this->CurrentField= &$this->Fields[$this->FieldCnt];
    $this->CurrentField["panelIdx"]=($this->CurrentPanel >= 0) ? $this->CurrentPanel : 0;
    $this->CurrentField["AddQuotes"]=true;
    $this->CurrentField["ReadOnly"]=false;
    $this->CurrentField["TableIdx"]=$this->MainTbl;
  }

  function SetTableName($s) {
    $this->TableCnt++;
    $this->MainTbl=$this->TableCnt;
    $this->Tables[$this->TableCnt]= new TableEditTable();
    $this->Tables[$this->MainTbl]->TblName=$s;
    $this->Tables[$this->MainTbl]->alias="t";
    $this->gridID=strtolower(str_replace(" ","_",str_replace(".","_",$s)));
    $this->formVar=$this->gridID . "['edit']";
    $this->gridVar=$this->gridID . "['grid']";
    $this->bufferVar=$this->gridID . "['buffer']";
    $this->optionsVar=$this->gridID . "['options']";
    $actionparm=$this->gridID."__action";
    $this->action=isset($_REQUEST[$actionparm]) ? trim($_REQUEST[$actionparm]) : "";
    $this->action=($this->action == "") ? "table" : strtolower($this->action);
  }

  function AddSort($field,$direction) {
    if (!empty($this->DefaultSort)) $this->DefaultSort.=",";
    $this->DefaultSort.=$field . " " . $direction;
  }

  function SortCurrent($direction) {
    if (array_key_exists("Formula",$this->CurrentField))
      $this->AddSort($this->CurrentField["Formula"],$direction);
    elseif (array_key_exists("ColName",$this->CurrentField))
      $this->AddSort($this->Tables[$this->CurrentField["TableIdx"]]->alias . "." . $this->CurrentField["ColName"],$direction);
  }

  function SortAsc() {
    $this->SortCurrent("ASC");
  }

  function SortDesc() {
    $this->SortCurrent("DESC");
  }

  function ConfirmDeleteColumn() {
    $this->options["ConfirmDeleteCol"]=$this->FieldCnt;
  }

  function genXHTML() {
    $this->xhtmlcloser=" />";
  }

  function SetDbConn(&$dbcls) {
    $this->objDB=&$dbcls;
  }

  //*************************************************************************************
  // Take appropriate action
  //*************************************************************************************
  function DisplayPage() {
    if (count($this->Fields) == 0) {
      return;
    }
    if (!$this->ErrorFlag) {
      $this->GetColumnInfo();
    }
    if (!$this->ErrorFlag) {
      switch ($this->action) {

        case "del":
          if ($this->options["canDelete"]) {
            $this->TableDeleteRecord();
          }
          break;

        case "ins":
          if ($this->options["canAdd"]) {
            $this->TableInsertRecord();
          }
          break;

        case "upd":
          if ($this->options["canEdit"]) {
            $this->TableUpdateRecord();
          }
          break;

        default:
          $this->TableDisplay();
          break;
      }
    }
    if ($this->ErrorFlag) {
      echo "\n<p style='color:red;'><span style='text-decoration:underline;'>ERROR ENCOUNTERED</span><br".$this->xhtmlcloser.$this->ErrorMsg;
    }
  }

  //*************************************************************************************
  // Class Constructor
  //*************************************************************************************
  function TableEditClass() {
    if (is_object($GLOBALS['oDB'])) {
      $this->objDB=&$GLOBALS['oDB'];    // use oDB global as database connection, if it exists
    }
    $this->options=array();
    $this->options["TableSelectNew"]="___new___";
    $this->options["TableSelectNone"]="";
    $this->options["canAdd"]=true;
    $this->options["canEdit"]=true;
    $this->options["canView"]=true;
    $this->options["canDelete"]=true;
    $this->options["ConfirmDelete"]=true;
    $this->options["ConfirmDeleteCol"]=-1;
    $this->options["DebugFlag"]=isset($_GET["debug"]);
    $this->options["RecordName"]="record";
    $this->options["prefetchBuffer"]=true;
    $this->options["PanelNamesOnTabHdr"]=true;
    $this->options["highlightElem"]="menuRow";

    $this->SvrOnly=array();
    $this->SvrOnly["SelectSql"]=1;
    $this->SvrOnly["SelectFilter"]=1;
    $this->SvrOnly["Formula"]=1;
    $this->SvrOnly["TableIdx"]=1;
    $this->SvrOnly["AddQuotes"]=1;
    $this->SvrOnly["FilterFlag"]=1;
    $this->SvrOnly["XMLprovider"]=1;

    $this->xhtmlcloser=">";
    $this->FieldCnt=-1;
    $this->CurrentPanel=-1;
    $this->TableCnt=-1;
    $this->AutoInit=true;
    $this->ErrorFlag=false;
    $this->ErrorMsg="";
    $PopUpFlag=false;
  }

  // -------------------------------------------------------------
  // Class Destructor (only called if php5)
  // -------------------------------------------------------------
  function __destruct() {
    for ($i=0; $i<count($this->Fields); $i++) {
      $this->Fields[$i]=NULL;
    }
    $this->options=NULL;
    $this->SvrOnly=NULL;
  }

  // if AltTable has a multi-column key, then add those additional constraints
  function AltTableKeyWhereClause($AltTabIdx) {
    for ($i=0; $i<count($this->Tables[$AltTabIdx]->arFields); $i++) {
      if ($this->Tables[$AltTabIdx]->arColInfo[$i]->IsPKey) {
        $w.=" and ".$this->Tables[$AltTabIdx]->arFields[$i]."=".$this->Tables[$AltTabIdx]->arData[$i];
      }
    }
    return $w;
  }

  function AltTableJoinClause($alias) {
    for ($i=0; $i<count($this->Fields); $i++) {
      if ($this->Fields[$i]["TableIdx"] == $this->MainTbl && !$this->IsCalculatedField($i)) {
        if ($this->Fields[$i]["ColInfo"]->IsPKey) {
          $this->objDB->AddCondition($w, $this->Fields[$i]["ColName"]."=".$alias.".".$this->Fields[$i]["ColName"]);
        }
      }
    }
    return $w;
  }

  // form where clause based on table's primary key
  function TableKeyWhereClause() {
    for ($i=0; $i<count($this->Fields); $i++) {
      if ($this->Fields[$i]["TableIdx"] == $this->MainTbl && !$this->IsCalculatedField($i)) {
        if ($this->Fields[$i]["ColInfo"]->IsPKey) {
          $this->objDB->AddCondition($w, $this->Fields[$i]["ColName"]."=".$this->FormatValue($_POST["_k".$i],$i));
        }
      }
    }
    if (empty($w)) {
      $this->TableEditError("no key value");
    }
    else {
      return " WHERE ".$w;
    }
  }

  // name used external to this script
  function ExtFieldId($i) {
    return $this->gridID."_".$i;
  }

  function FieldName() {
    return $this->ExtFieldId($this->FieldCnt);
  }

  function IsCalculatedField($i) {
    return array_key_exists("Formula",$this->Fields[$i]);
  }

  //*************************************************************************************
  // Retrieves column info from database for main table and any alternate tables
  //*************************************************************************************
  function GetColumnInfo() {
    $Columns=array();
    $dicColIdx=array();
    for ($FieldNum=0; $FieldNum<count($this->Fields); $FieldNum++) {
      $dicColIdx[$this->Fields[$FieldNum]["TableIdx"].".".strtoupper($this->Fields[$FieldNum]["ColName"])]= $FieldNum;
      if ($this->options["canEdit"] == false && $this->options["canAdd"] == false) {
        $this->Fields[$FieldNum]["ReadOnly"]=true;
      }
    }
    //print_r($dicColIdx);
    for ($i=0; $i<=$this->TableCnt; $i++) {
      $Columns=$this->objDB->GetColumnInfo($this->Tables[$i]->TblName);
      if (!is_array($Columns)) {
        $this->TableEditError("unable to retrieve column info for ".$this->Tables[$i]->TblName."<br>".$this->objDB->LastErrorMsg);
        return;
      }
      //print_r($Columns);
      for ($c=0; $c < count($Columns); $c++) {
        $colname=strtoupper($Columns[$c]->ColName);
        if (array_key_exists($i.".".$colname,$dicColIdx)) {
          $FieldNum=$dicColIdx[$i.".".$colname];
          $this->Fields[$FieldNum]["ColInfo"]=$Columns[$c];
        }
        elseif ($i != $this->MainTbl) {
          for ($j=0; $j < count($this->Tables[$i]->arFields); $j++) {
            if ($colname == $this->Tables[$i]->arFields[$j]) {
              $this->Tables[$i]->arColInfo[$j]=$Columns[$c];
            }
          }
        }
        elseif ($Columns[$c]->IsPKey) {
          $this->TableEditError("primary key field is not defined (".$this->Tables[$i]->TblName.".".$colname.")");
          $dicColIdx=NULL;
          return;
        }
      }
    }
    $dicColIdx=NULL;
  }

  function TableUpdateDatabase($sqltext, $actiontxt) {
    if ($this->ErrorFlag) {
      return;
    }
    $cnt=$this->objDB->RunActionQueryReturnMsg($sqltext, $errmsg);
    if ($this->options["DebugFlag"])
      echo "<p class='debug'>".$sqltext."<br".$this->xhtmlcloser."Records affected: ".$cnt;
    if (!empty($errmsg))
      $this->TableEditError("unable to update database!<br".$this->xhtmlcloser.$errmsg);
    else if ($cnt == 1)
      echo "<p>".$this->options["RecordName"]." ".$actiontxt." successfully</p>";
    else
      $this->TableEditError("no data changed - update skipped");
  }

  function FormatValue($v, $idx) {
    $fld=$this->Fields[$idx];
    $addquotes=$fld["AddQuotes"];
    if (substr($fld["EntryType"],0,1) == "D") {
      if ($v == "") {
        $addquotes=false;
        $v="NULL";
      }
    }
    elseif ($fld["EntryType"] == "I") {
      $addquotes=false;
      if ($v == "" || !is_numeric($v)) {
        $v="NULL";
      }
    }
    elseif ($fld["EntryType"] == "N" && $v == $this->options["TableSelectNew"]) {
      $v=trim($_POST["textnew__".$this->ExtFieldId($idx)]);
    }
    elseif (strpos("SNR",substr($fld["EntryType"],0,1)) !== false && $v == $this->options["TableSelectNone"]) {
      $addquotes=false;
      $v="NULL";
    }
    if ($addquotes) $v=$this->objDB->addQuotes($v);
    return $v;
  }

  function FormatFormValue($idx) {
    if (!array_key_exists("EntryType",$this->Fields[$idx])) return "";
    $fldname=$this->ExtFieldId($idx);
    if ($this->Fields[$idx]["EntryType"] == "H" || (array_key_exists("FormView",$this->Fields[$idx]) && $this->Fields[$idx]["FormView"] == "exclude"))
      $v=$this->Fields[$idx]["ColData"];
    elseif (isset($_POST[$fldname]))
      $v=trim($_POST[$fldname]);
    return $this->FormatValue($v, $idx);
  }

  //*************************************************************************************
  // Deletes the specified record
  //*************************************************************************************
  function TableDeleteRecord() {
    $this->TableUpdateDatabase("DELETE FROM ".$this->Tables[$this->MainTbl]->TblName.$this->TableKeyWhereClause(), "deleted");
  }

  function UpdateRecord($sqltext) {
    $this->objDB->RunActionQueryReturnMsg($sqltext, $errmsg);
    if (!empty($errmsg)) {
      $errmsg="unable to update database!<br".$this->xhtmlcloser.$errmsg;
      if ($this->options["DebugFlag"]) {
        $errmsg.="<p>SQL: ".$sqltext;
      }
      $this->TableEditError($errmsg);
    }
    elseif ($this->options["DebugFlag"]) {
      echo "<BR class='debug'>".$sqltext;
    }
  }

  function UpdateAltTableRecords($i) {
    if ($this->ErrorFlag) {
      return;
    }
    // delete existing record
    $sqltext="delete from ".$this->Tables[$i]->TblName;
    $sqltext.=$this->TableKeyWhereClause();
    $sqltext.=$this->AltTableKeyWhereClause($i);
    $this->UpdateRecord($sqltext);
    // insert new record
    $colnames="";
    $coldata="";
    for ($j=0; $j<count($this->Fields); $j++) {
      if (!array_key_exists("ColInfo",$this->Fields[$j])) continue;
      if ($this->Fields[$j]["TableIdx"] == $i || $this->Fields[$j]["ColInfo"]->IsPKey) {
        $colnames.=",".$this->Fields[$j]["ColName"];
        $coldata.=",".$this->FormatValue(trim($_POST[$this->ExtFieldId($j)]), $j);
      }
    }
    for ($j=0; $j<count($this->Tables[$i]->arFields); $j++) {
      $c=$this->Tables[$i]->arFields[$j];
      $colnames.=",".$c;
      $coldata.=",".$this->Tables[$i]->arData[$j];
    }
    $sqltext="insert into ".$this->Tables[$i]->TblName." (".substr($colnames,1).") values (".substr($coldata,1).")";
    $this->UpdateRecord($sqltext);
  }

  //*************************************************************************************
  // Updates an existing record in the db
  //*************************************************************************************
  function TableUpdateRecord() {
    for ($i=0; $i<=$this->TableCnt; $i++) {
      if ($i != $this->MainTbl) {
        $this->UpdateAltTableRecords($i);
      }
    }
    for ($i=0,$sqltext=''; $i<count($this->Fields); $i++) {
      if (!$this->IsCalculatedField($i)) {
        if ($this->Fields[$i]["TableIdx"] == $this->MainTbl && $this->Fields[$i]["ColInfo"]->Writeable && !array_key_exists("InsertOnly",$this->Fields[$i])) {
          $sqltext.=",".$this->Fields[$i]["ColName"]."=".$this->FormatFormValue($i);
        }
      }
    }
    $sqltext="UPDATE ".$this->Tables[$this->MainTbl]->TblName." SET ".substr($sqltext,1);
    $sqltext.=$this->TableKeyWhereClause();
    $this->TableUpdateDatabase($sqltext, "updated");
  }
  //*************************************************************************************
  // Inserts a new record into the db
  //*************************************************************************************

  function TableInsertRecord() {
    $keyCnt=0;
    $sqlcol="";
    $sqlval="";
    for ($i=0; $i<count($this->Fields); $i++) {
      if (!$this->IsCalculatedField($i) && $this->Fields[$i]["TableIdx"] == $this->MainTbl && !array_key_exists("UpdateOnly",$this->Fields[$i])) {
        if ($this->Fields[$i]["ColInfo"]->IsPKey) {
          $keyCnt++;
          $keyIdx=$i;
        }
        if ($this->Fields[$i]["ColInfo"]->Writeable) {
          $sqlcol.=",".$this->Fields[$i]["ColName"];
          $sqlval.=",".$this->FormatFormValue($i);
        }
      }
    }
    $sqltext="insert into ".$this->Tables[$this->MainTbl]->TblName." (".substr($sqlcol,1).") values (".substr($sqlval,1).")";
    $this->TableUpdateDatabase($sqltext, "added");
    if ($this->TableCnt > 0 && $keyCnt == 1 && !$this->Fields[$keyIdx]["ColInfo"]->Writeable) {
      if (!$this->objDB->SingleRecordQuery("SELECT SCOPE_IDENTITY()", $a)) {
        $this->TableEditError("unable to retrieve new identity value");
        return;
      }
      $this->Fields[$keyIdx]["ColData"]=$a[0];
    }
    for ($i=0; $i<=$this->TableCnt; $i++) {
      if ($i != $this->MainTbl) {
        $this->UpdateAltTableRecords($i);
      }
    }
  }

  function TableEditError($msg) {
    $this->ErrorFlag=true;
    $this->ErrorMsg=$msg;
  }
  //*************************************************************************************
  // Displays a table
  //*************************************************************************************

  function TableDisplay() {
    // -------------------------------------
    // form sql query
    // -------------------------------------
    $oParseMain= new sqlParse();
    $oParseLookup= new sqlParse();
    $oParseMain->Init();
    $oParseMain->FromClause=$this->Tables[$this->MainTbl]->TblName." t";
    $oParseMain->AddWhereCondition($this->TableFilter);
    for ($i=0; $i<count($this->Fields); $i++) {
      if (array_key_exists("FilterFlag",$this->Fields[$i])) {
        // add any column filters to where clause
        $oParseMain->AddWhereCondition($this->Fields[$i]["ColName"]."='".$this->Fields[$i]["ColData"]."'");
      }
      if (array_key_exists("EntryType",$this->Fields[$i])) {
        if (strpos("CSNR",substr($this->Fields[$i]["EntryType"],0,1)) !== false) {
          if (array_key_exists("SelectSql",$this->Fields[$i])) {
            $s=$this->Fields[$i]["SelectSql"];
            if (array_key_exists("SelectFilter",$this->Fields[$i])) {
              $oParseLookup->ParseSelect($s);
              $oParseLookup->AddWhereCondition($this->Fields[$i]["SelectFilter"]);
              $s=$oParseLookup->UnparseSelect();
            }
            $_SESSION[$this->ExtFieldId($i)]=str_replace("%alias%","",$s);
          }
          else {
            $_SESSION[$this->ExtFieldId($i)]="select distinct ".$this->Fields[$i]["ColName"]." from ".$this->Tables[$this->Fields[$i]["TableIdx"]]->TblName." where ".$this->Fields[$i]["ColName"]." is not null";
          }
        }
      }
      if ($this->IsCalculatedField($i)) {

        // computed column

        $oParseMain->arSelList[$i]=$this->Fields[$i]["Formula"] . " as rico_col".$i;
      }
      elseif ($this->Fields[$i]["TableIdx"] == $this->MainTbl) {

        // column from main table - avoid subqueries to make it compatible with MS Access & MySQL < v4.1

        if (substr($this->Fields[$i]["EntryType"],1) == "L" && array_key_exists("SelectSql",$this->Fields[$i])) {
          $alias="t" . $i;
          $s=str_replace("%alias%",$alias . ".",$this->Fields[$i]["SelectSql"]);
          $oParseLookup->ParseSelect($s);
          if (count($oParseLookup->arSelList) == 2) {
            $codeField=$oParseLookup->arSelList[0];
            $descField=$oParseLookup->arSelList[1];
            if (preg_match("/^\\w+$/",$descField)) $descField=$alias.".".$descField;
            $oParseMain->AddJoin("left join ".$oParseLookup->FromClause." ".$alias." on t.".$this->Fields[$i]["ColName"]."=".$alias.".".$codeField);
            $oParseMain->arSelList[$i]=$this->objDB->concat(array($descField, "'<span class=\"ricoLookup\">'", $this->objDB->Convert2Char($this->Tables[$this->MainTbl]->alias.".".$this->Fields[$i]["ColName"]), "'</span>'"), false) . " as rico_col".$i;
          }
          else {
            $this->TableEditError("Invalid lookup query (".$this->Fields[$i]["SelectSql"].")");
            return;
          }
        }
        else {
          $oParseMain->arSelList[$i]=$this->Tables[$this->MainTbl]->alias.".".$this->Fields[$i]["ColName"];
        }
      }
      else {

        // column from alt table - no avoiding subqueries here

        $s="(select " . $this->Fields[$i]["ColName"] . " from " . $this->Tables[$this->Fields[$i]["TableIdx"]]->TblName . " a" . $i . " where " . $this->AltTableJoinClause("t") . $this->AltTableKeyWhereClause($this->Fields[$i]["TableIdx"]) . ")";
        if (substr($this->Fields[$i]["EntryType"],1) == "L" && array_key_exists("SelectSql",$this->Fields[$i])) {
          $oParseLookup->ParseSelect($this->Fields[$i]["SelectSql"]);
          if (count($oParseLookup->arSelList) == 2) {
            $codeField=$oParseLookup->arSelList[0];
            $descField=$oParseLookup->arSelList[1];
            $descQuery="select " . $descField . " from " . $oParseLookup->FromClause . " where " . $codeField . "=" . $s;
            if (!empty($oParseLookup->WhereClause)) $descQuery.=" and " . $oParseLookup->WhereClause;
            $oParseMain->arSelList[$i]="(" . $this->objDB->concat(array("(" . $descQuery . ")", "'<span class=\"ricoLookup\">'", $this->objDB->Convert2Char($s), "'</span>'"), false) . ") as rico_col" . $i;
          } else {
            $this->TableEditError("Invalid lookup query (".$this->Fields[$i]["SelectSql"].")");
            return;
          }
        } else {
          $oParseMain->arSelList[$i]=$s . " as rico_col" . $i;
        }
      }
    }
    if (empty($this->DefaultSort)) {
      $this->DefaultSort=$this->objDB->PrimaryKey($this->Tables[$this->MainTbl]->TblName);
    }
    $oParseMain->AddSort($this->DefaultSort);
    $_SESSION[$this->gridID]=$oParseMain->UnparseSelect();
    $_SESSION[$this->gridID.".db"]=$this->objDB->DefaultDB();
    echo "\n<p class='ricoBookmark'>";
    echo "\n<span id='".$this->gridID."_timer' class='ricoSessionTimer'></span>";
    echo "&nbsp;&nbsp;<span id='".$this->gridID."_bookmark' class='ricoBookmark'></span>";
    echo "&nbsp;&nbsp;<span id='".$this->gridID."_savemsg' class='ricoSaveMsg'></span>";
    echo "\n</p>";
    echo "\n<div id='".$this->gridID."'></div>";
    echo "\n<script type='text/javascript'>";
    echo "\nvar ".$this->gridID." = {};";
    echo "\n".$this->optionsVar." = {";
    foreach ($this->options as $o => $value) {
      if (!is_object($value) && !array_key_exists($o,$this->SvrOnly)) {
        echo "\n  ".$o.": ".$this->FormatOption($value).",";
      }
    }
    if ($this->CurrentPanel >= 0) {
      echo "\n  panels: [";
      for ($i=0; $i<=$this->CurrentPanel; $i++) {
        if ($i > 0) {
          echo ",";
        }
        echo "'".$this->Panels[$i]."'";
      }
      echo "],";
    }
    echo "\n  columnSpecs : [";
    for ($i=0; $i<count($this->Fields); $i++) {
      if ($i > 0) {
        echo ",";
      }
      echo "\n    {";
      echo " FieldName:'".$this->ExtFieldId($i)."'";
      foreach ($this->Fields[$i] as $o => $value) {
        if (!is_object($value) && !array_key_exists($o,$this->SvrOnly)) {
          echo ",\n      ".$o.": ".$this->FormatOption($value);
        }
      }
      if (array_key_exists("ColInfo",$this->Fields[$i])) {
        echo ",\n      isNullable:".$this->FormatOption($this->Fields[$i]["ColInfo"]->Nullable);
        echo ",\n      Writeable:".$this->FormatOption($this->Fields[$i]["ColInfo"]->Writeable);
        echo ",\n      isKey:".$this->FormatOption($this->Fields[$i]["ColInfo"]->IsPKey);
        if ($this->Fields[$i]["ColInfo"]->ColLength) {
          echo ",\n      Length:".$this->Fields[$i]["ColInfo"]->ColLength;
        }
      }
      echo " }";
    }
    echo "\n  ]";
    echo "\n};";
    if ($this->AutoInit) {
      echo "\nRico.onLoad(function() {";
      //echo "\n  try {";
      echo "\n  if(typeof RicoUtil=='undefined') throw('LiveGridForms requires the RicoUtil Library');";
      echo "\n  if(typeof RicoTranslate=='undefined') throw('LiveGridForms requires the RicoTranslate Library');";
      echo "\n  if(typeof Rico.LiveGrid=='undefined') throw('LiveGridForms requires the Rico.LiveGrid Library');";
      echo "\n  if(typeof Rico.GridMenu=='undefined') throw('LiveGridForms requires the Rico.GridMenu Library');";
      echo "\n  if(typeof Rico.Buffer=='undefined') throw('LiveGridForms requires the Rico.Buffer Library');";
      echo "\n  if(typeof Rico.Buffer.AjaxSQL=='undefined') throw('LiveGridForms requires the Rico.Buffer.AjaxSQL Library');";
      echo $this->InitScript();
      //echo "\n  } catch(e) { alert(e.message); };";
      echo "\n});";
    }
    echo "\n</script>";
  }

  function FormatOption($s) {
    if (is_array($s)) return "{" . implode(",",$s) . "}";
    switch (gettype($s)) {
      case 'string':  return "\"".addslashes($s)."\"";
      case 'boolean': return $s ? 'true' : 'false';
      default:        return $s;
    }
  }

  function InitScript() {
    $s="\n".$this->bufferVar."=new Rico.Buffer.AjaxSQL('" . $this->options["XMLprovider"] . "', {TimeOut:" . (array_shift(session_get_cookie_params())/60) . "});";
    $s.="\nif(typeof ".$this->gridID."_GridInit=='function') ".$this->gridID."_GridInit();";
    $s.="\n".$this->gridVar."=new Rico.LiveGrid('".$this->gridID."',".$this->bufferVar.",".$this->optionsVar.");";
    $s.="\n".$this->gridVar.".menu=new Rico.GridMenu();";
    $s.="\nif(typeof ".$this->gridID."_FormInit=='function') ".$this->gridID."_FormInit();";
    $s.="\n".$this->formVar."=new Rico.TableEdit(".$this->gridVar.");";
    $s.="\nif(typeof ".$this->gridID."_InitComplete=='function') ".$this->gridID."_InitComplete();";
    return $s;
  }
}

?>
