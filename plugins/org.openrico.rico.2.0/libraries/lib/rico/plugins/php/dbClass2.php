<?
/*****************************************************************
 Page        : dbClass.php
 Description : Routines to access MySQL database  
 Date        : 25 May 2006
 Authors     : Matt Brown (dowdybrown@yahoo.com)
 Copyright (C) 2006 Matt Brown

dbClass.php is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public
License as published by the Free Software Foundation; either
version 2.1 of the License, or (at your option) any later version.

dbClass.php is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
General Public License for more details.

You should have received a copy of the GNU General Public
License along with this library; if not, write to the Free Software
Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
******************************************************************/


//********************************************************************************************************
// Parse SQL a statement
//********************************************************************************************************

class sqlParse {
  var $arSelList;
  var $arSelListAs;
  var $FromClause;
  var $WhereClause;
  var $arGroupBy;
  var $HavingClause;
  var $arOrderBy;
  // -------------------------------------------------------------
  // Rebuilds a SQL select statement that was parsed by ParseSelect
  // -------------------------------------------------------------

  function UnparseSelect() {
    $sqltext="SELECT ".$this->UnparseColumnList()." FROM ".$this->FromClause;
    if (!empty($this->WhereClause)) {
      $sqltext.=" WHERE ".$this->WhereClause;
    }
    if (is_array($this->arGroupBy)) {
      if (count($this->arGroupBy) >  0) {
        $sqltext.=" GROUP BY ".implode(",",$this->arGroupBy);
      }
    }
    if (!empty($this->HavingClause)) {
      $sqltext.=" HAVING ".$this->HavingClause;
    }
    if (is_array($this->arOrderBy)) {
      if (count($this->arOrderBy) >  0) {
        $sqltext.=" ORDER BY ".implode(",",$this->arOrderBy);
      }
    }
    return $sqltext;
  }

  function UnparseColumn($i) {
    $s=$this->arSelList[$i];
    if (!empty($this->arSelListAs[$i])) {
      $s.=" AS ".$this->arSelListAs[$i];
    }
    return $s;
  }

  function UnparseColumnList() {
    if (empty($this->arSelList)) return "";
    $sqltext=$this->UnparseColumn(0);
    for ($i=1; $i<count($this->arSelList); $i++) {
      $sqltext.=",".$this->UnparseColumn($i);
    }
    return $sqltext;
  }

  function Init() {
    $this->arSelList=array();
    $this->arSelListAs=array();
    $this->arGroupBy=array();
    $this->arOrderBy=array();
    $this->FromClause=NULL;
    $this->WhereClause=NULL;
    $this->HavingClause=NULL;
  }
  // -------------------------------------------------------------
  // Parse a SQL select statement into its major components
  // Does not handle:
  // 1) union queries
  // 2) select into
  // 3) more than one space between "group" and "by", or "order" and "by"
  // If distinct is specified, it will be part of the first item in arSelList
  // -------------------------------------------------------------

  function ParseSelect($sqltext) {
    $this->Init();
    $clause='';
    $_retval=false;
    $sqltext=str_replace("\n"," ",$sqltext);
    $sqltext=" ".str_replace("\r"," ",$sqltext)." SELECT ";
    // SELECT suffix forces last curfield to be saved
    $l=strlen($sqltext);
    $parencnt=0;
    $inquote=false;
    $curfield="";
    for ($i=0; $i<$l; $i++) {
      $ch=substr($sqltext,$i,1);
      if ($inquote) {
        if ($ch == "'") {
          if (substr($sqltext,$i,2) == "''") {
            $curfield.="'";
            $i++;
          }
          else {
            $inquote=false;
          }
        }
        $curfield.=$ch;
      }
      elseif ($ch == "'") {
        $inquote=true;
        $curfield.=$ch;
      }
      elseif ($ch == "(") {
        $parencnt++;
        $curfield.=$ch;
      }
      elseif ($ch == ")") {
        if ($parencnt == 0) {
          return $_retval;
          // sql statement has a syntax error
        }
        $parencnt--;
        $curfield.=$ch;
      }
      elseif ($parencnt > 0) {
        $curfield.=$ch;
      }
      elseif ($ch == ",") {
        switch ($clause) {
          case "SELECT":
            array_push($this->arSelList, $curfield);
            array_push($this->arSelListAs, NULL);
            $curfield='';
            break;
          case "AS":
            $this->arSelListAs[count($this->arSelList)-1]=$curfield;
            $curfield='';
            $clause="SELECT";
            break;
          case "GROUP BY":
            array_push($this->arGroupBy, $curfield);
            $curfield='';
            break;
          case "ORDER BY":
            array_push($this->arOrderBy, $curfield);
            $curfield='';
            break;
          default:
            $curfield.=$ch;
            break;
        }
      }
      elseif ($ch == " ") {
        $j=strpos($sqltext," ",$i+1);
        if ($j===false)
        {
          $curfield.=$ch;
        }
          else
        {
          if (strtoupper(substr($sqltext,$j+1,3))=="BY ") $j+=3;
          $nexttoken=strtoupper(substr($sqltext,$i+1,$j-$i-1));
          //echo '<br>'.$nexttoken;
          switch ($nexttoken) {

            case "SELECT":
            case "AS":
            case "INTO":
            case "FROM":
            case "WHERE":
            case "GROUP BY":
            case "HAVING":
            case "ORDER BY":
              switch ($clause) {
                case "SELECT":
                  array_push($this->arSelList, $curfield);
                  array_push($this->arSelListAs, NULL);
                  $curfield='';
                  break;
                case "AS":
                  $this->arSelListAs[count($this->arSelList)-1]=$curfield;
                  $curfield='';
                  break;
                case "FROM":     $this->FromClause=$curfield;             $curfield=''; break;
                case "WHERE":    $this->WhereClause=$curfield;            $curfield=''; break;
                case "GROUP BY": array_push($this->arGroupBy, $curfield); $curfield=''; break;
                case "HAVING":   $this->HavingClause=$curfield;           $curfield=''; break;
                case "ORDER BY": array_push($this->arOrderBy, $curfield); $curfield=''; break;
              }
              $clause=$nexttoken;
              $i=$j;
              break;

            default:
              if ($curfield != "") {
                $curfield.=$ch;
              }
              break;
          }
        }
      }
      else {
        $curfield.=$ch;
      }
    }
    return true;
  }

  // -------------------------------------------------------------
  // Add a join to the from clause
  // -------------------------------------------------------------

  function AddJoin($JoinClause) {
    if (preg_match("/ join /i",$this->FromClause)) {
      $this->FromClause="(".$this->FromClause.")";
      // required by Access
    }
    $this->FromClause.=" ".$JoinClause;
  }
  // -------------------------------------------------------------
  // Add sort criteria to the order by clause
  // -------------------------------------------------------------

  function AddSort($NewSort) {
    array_unshift($this->arOrderBy, $NewSort);
  }
  // -------------------------------------------------------------
  // Add a condition to the where clause
  // -------------------------------------------------------------

  function AddWhereCondition($NewCondition) {
    $this->AddCondition($this->WhereClause, $NewCondition);
  }
  // -------------------------------------------------------------
  // Add a condition to the having clause
  // -------------------------------------------------------------

  function AddHavingCondition($NewCondition) {
    $this->AddCondition($this->HavingClause, $NewCondition);
  }

  function AddCondition(&$Clause, $NewCondition) {
    if (empty($NewCondition)) {
      return;
    }
    if (empty($Clause)) {
      $Clause="(".$NewCondition.")";
    }
    else {
      $Clause.=" AND (".$NewCondition.")";
    }
  }
}


// -------------------------------------------------------------
// created by dbClass.GetColumnInfo()
// -------------------------------------------------------------
class dbColumn
{
  var $ColName,$Nullable,$ColType,$ColLength,$Writeable,$IsPKey;
}

// tested ok with MySQL 4
class dbClass_mysql
{
  var $lastQuery;
  function dbClass_mysql($conn) { $this->conn=$conn; }
  function HasError() { return mysql_errno()!=0; }
  function ErrorMsg() { return mysql_error(); }
  function Close() { return mysql_close($this->conn); }
  function FreeResult($rsLookUp) { return mysql_free_result($rsLookUp); }
  function RunQuery($sqltext) { $this->lastQuery=$sqltext; return mysql_query($sqltext,$this->conn); }
  function NumFields($rsMain) { return mysql_num_fields($rsMain); }
  function NumRows($rsMain) { return mysql_num_rows($rsMain); }
  function FieldType($rsMain,$i) { return mysql_field_type($rsMain,$i); }
  function FetchRow($rsMain,&$result) { $result=mysql_fetch_row($rsMain); return ($result==false) ? false : true; }
  function FetchAssoc($rsMain,&$result) { $result=mysql_fetch_assoc($rsMain); return ($result==false) ? false : true; }
  function FetchArray($rsMain,&$result) { $result=mysql_fetch_array($rsMain,MYSQL_NUM); return ($result==false) ? false : true; }
  function AffectedRows($rsMain) { return mysql_affected_rows($this->conn); }
  function Seek($rsMain,$offset) { return mysql_data_seek($rsMain,$offset); }
  function RunParamQuery($query, $phs = array()) {
    foreach ($phs as $ph) {   // from php.net
      if ( isset($ph) ) {
        $ph = "'" . mysql_real_escape_string($ph) . "'";
      } else {
        $ph = "NULL" ;
      }
      $query = substr_replace($query, $ph, strpos($query, '?'), 1);
    }
    $this->lastQuery=$query;
    return mysql_query($query,$this->conn);
  }
  function GetColumnInfo($TableName) {
    $rsMain=$this->RunQuery("SHOW COLUMNS FROM ".$TableName);
    if (!$rsMain) return null;
    $arColumns=array();
    while($this->FetchAssoc($rsMain,$row)) {
      $colinfo=new dbColumn;
      $colinfo->IsPKey=($row["Key"]=="PRI");
      $colinfo->ColName=$row["Field"];
      $colinfo->ColType=$row["Type"];
      $colinfo->Nullable=($row["Null"]=="YES");
      if (preg_match("/\((\d+)\)/", $row["Type"], $matches))
        $colinfo->ColLength=$matches[1];
      else
        $colinfo->ColLength=0;
      $colinfo->Writeable=($row["Extra"] != 'auto_increment');
      array_push($arColumns, $colinfo);
    } 
    $this->FreeResult($rsMain);
    return $arColumns;
  }
  function Concat($arStrings) {
    return "concat(".implode(",",$arStrings).")";
  }
  function Convert2Char($s) {
    return $s; // implicit conversion
  }
  function SqlMonth($s) {
    return "month(".$s.")";
  }
  function SqlYear($s) {
    return "year(".$s.")";
  }
  function CurrentTime() {
    return "LOCALTIMESTAMP";
  }
}


// tested ok with Oracle XE
class dbClass_oci
{
  var $lastQuery;
  function dbClass_oci($conn) { $this->conn=$conn; }
  function HasError() { return is_array(ocierror()); }
  function ErrorMsg() { $e=ocierror(); return is_array($e) ? $e['message'] : ''; }
  function Close() { return ocilogoff($this->conn); }
  function FreeResult($rsLookUp) { return ocifreestatement($rsLookUp); }
  function RunQuery($sqltext) { $this->lastQuery=$sqltext; $stmt=ociparse($this->conn, $sqltext); ociexecute($stmt); return $stmt; }
  function NumFields($rsMain) { return ocinumcols($rsMain); }
  function NumRows($rsMain) { return -1; }
  function FieldType($rsMain,$i) { return ocicolumntype($rsMain,$i+1); }
  function FetchRow($rsMain,&$result) { return ocifetchinto($rsMain,$result,OCI_NUM); }
  function FetchAssoc($rsMain,&$result) { return ocifetchinto($rsMain,$result,OCI_ASSOC); }
  function FetchArray($rsMain,&$result) { return ocifetchinto($rsMain,$result,OCI_NUM); }
  function AffectedRows($rsMain) { return (is_resource($rsMain) ? ocirowcount($rsMain) : false); }
  function Seek($rsMain,$offset) { return mysql_data_seek($rsMain,$offset); }
  function RunParamQuery($query, $phs = array()) {
    foreach ($phs as $ph) {   // from php.net
      $ph = isset($ph) ? "'" . str_replace("'","''",$ph) . "'" : "NULL";
      $query = substr_replace($query, $ph, strpos($query, '?'), 1);
    }
    $this->lastQuery=$query;
    return $this->RunQuery($query);
  }
  function GetColumnInfo($TableName) {
    $TableName=strtoupper($TableName);
    $rsMain=$this->RunQuery("select * from col WHERE tname='$TableName' order by colno");
    if (!$rsMain) return null;
    $arColumns=array();
    while($this->FetchAssoc($rsMain,$row)) {
      $colinfo=new dbColumn;
      $colinfo->IsPKey=false;
      $colinfo->ColName=$row["CNAME"];
      $colinfo->ColType=$row["COLTYPE"];
      $colinfo->Nullable=($row["NULLS"]=="NULL");
      $colinfo->ColLength=$row["WIDTH"];
      $colinfo->Writeable=true;   // need to figure out where to find this
      array_push($arColumns, $colinfo);
      //echo "<p>GetColumnInfo: ".$row["CNAME"].' - '.$row["COLTYPE"]."</p>";
    } 
    $this->FreeResult($rsMain);
    $sql = "SELECT b.column_name FROM USER_CONSTRAINTS a, USER_CONS_COLUMNS b WHERE (b.table_name='$TableName') AND (a.table_name='$TableName') AND (a.constraint_type = 'P') AND (a.constraint_name = b.constraint_name)";
    $rsMain = $this->RunQuery($sql);
    if ($rsMain) {
      while($this->FetchRow($rsMain,$row)) {
        $colname=$row[0];
        //echo "<p>GetColumnInfo pk: ".$colname."</p>";
        for($i=0; $i<count($arColumns); $i++) {
          if ($arColumns[$i]->ColName==$colname) {
            $arColumns[$i]->IsPKey=true;
            break;
          }
        }
      } 
      $this->FreeResult($rsMain);
    }
    return $arColumns;
  }
  function Concat($arStrings) {
    return implode(" || ",$arStrings);
  }
  function Convert2Char($s) {
    return "cast(".$s." as varchar2(20))";
  }
  function SqlMonth($s) {
    return "to_char(".$s.",'MM')";
  }
  function SqlYear($s) {
    return "to_char(".$s.",'YYYY')";
  }
  function CurrentTime() {
    return "LOCALTIMESTAMP";
  }
}


// tested ok with MS SQL Server & MS Access
// Oracle works ok except for GetColumnInfo
class dbClass_odbc
{
  var $lastQuery,$dbc;
  function dbClass_odbc(&$dbc) { $this->dbc=$dbc; }
  function HasError() { return odbc_error()!=''; }
  function ErrorMsg() { return @odbc_error() . ' ' . @odbc_errormsg(); }
  function Close() { return odbc_close(); }
  function FreeResult($rsLookUp) { return odbc_free_result($rsLookUp); }
  function RunQuery($sqltext) { $this->lastQuery=$sqltext; return odbc_exec($this->dbc->dbMain,$sqltext); }
  function NumFields($rsMain) { return odbc_num_fields($rsMain); }
  function NumRows($rsMain) { return odbc_num_rows($rsMain); }
  function FieldType($rsMain,$i) { return odbc_field_type($rsMain,$i+1); }
  function FetchRow($rsMain,&$result) { $rc=odbc_fetch_into($rsMain,$result); return ($rc==false) ? false : true; }
  function FetchAssoc($rsMain,&$result) { $result=odbc_fetch_array($rsMain); return ($result==false) ? false : true; }
  function FetchArray($rsMain,&$result) { $rc=odbc_fetch_into($rsMain,$result); return ($rc==false) ? false : true; }
  function AffectedRows($rsMain) { return odbc_num_rows($rsMain); }
  function Seek($rsMain,$offset) { 
    for($i=0; $i<$offset; $i++) odbc_fetch_row($rsMain);
  }
  function RunParamQuery($query, $phs = array()) {
    // odbc_prepare/odbc_execute chokes on this: SELECT * FROM (SELECT * FROM orders WHERE ShipCountry=?) AS rico_Main
    // so that approach cannot be used
    foreach ($phs as $ph) {
      if ( isset($ph) ) {
        if (preg_match("/^(\d\d\d\d)(?:-?(\d\d)(?:-?(\d\d)(?:[T ](\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d+))?)?)?(Z|(?:([-+])(\d\d)(?::?(\d\d))?)?)?)?)?)?$/",$ph)) {
          $ph = "{ts '".$ph."'}";
        } else {
          $ph = "'" . str_replace("'","''",$ph) . "'";
        }
      } else {
        $ph = "NULL" ;
      }
      $query = substr_replace($query, $ph, strpos($query, '?'), 1);
    }
    $this->lastQuery=$query;
    return odbc_exec($this->dbc->dbMain,$query);
  }
  function GetColumnInfo($TableName) {
    switch ($this->dbc->Dialect) {
      case "TSQL":
        $qualifier=$this->dbc->dbDefault;
        $schema="%";
        break;
      case "Access":
        $qualifier=$this->dbc->dsn;
        $schema="";
        break;
      default:
        return null;
    }
    echo "<p>GetColumnInfo: ".$qualifier.".".$schema.".".$TableName."</p>";
    $rsMain=odbc_columns($this->dbc->dbMain, $qualifier, $schema, $TableName);
    //odbc_result_all($rsMain);
    if (!$rsMain) return null;
    $arColumns=array();
    while($this->FetchAssoc($rsMain,$row)) {
      if ($row["TABLE_NAME"]!=$TableName) continue;
      $colinfo=new dbColumn;
      //echo "<p>GetColumnInfo: ".$row["COLUMN_NAME"].':'.$row["TYPE_NAME"]."</p>";
      $colinfo->ColName=$row["COLUMN_NAME"];
      $colinfo->ColType=$row["TYPE_NAME"];
      if (array_key_exists("PRECISION",$row)) {
        $colinfo->ColLength=$row["PRECISION"];
      } else if (array_key_exists("COLUMN_SIZE",$row)) {
        $colinfo->ColLength=$row["COLUMN_SIZE"];
      }
      $colinfo->Nullable=($row["NULLABLE"]=="YES");
      $colinfo->IsPKey=false;
      $colinfo->Writeable=($row["TYPE_NAME"] != 'int identity');
      array_push($arColumns, $colinfo);
    } 
    $this->FreeResult($rsMain);
    //$rsMain=odbc_columnprivileges($this->dbc->dbMain, $qualifier, $schema, $TableName,"%");
    //odbc_result_all($rsMain);
    //$this->FreeResult($rsMain);
    $rsMain=odbc_primarykeys($this->dbc->dbMain, $qualifier, $schema, $TableName);
    if ($rsMain) {
      while($this->FetchAssoc($rsMain,$row)) {
        $colname=$row["COLUMN_NAME"];
        //echo "<p>GetColumnInfo pk: ".$colname."</p>";
        for($i=0; $i<count($arColumns); $i++) {
          if ($arColumns[$i]->ColName==$colname) {
            $arColumns[$i]->IsPKey=true;
            break;
          }
        }
      } 
      $this->FreeResult($rsMain);
    }
    return $arColumns;
  }
  function Concat($arStrings) {
    $cnt=count($arStrings);
    switch ($cnt) {
      case 0: return '';
      case 1: return $arStrings[0];
      default:
        $result="{fn concat(".$arStrings[0].",".$arStrings[1].")}";
        for ($i=2; $i<$cnt; $i++) {
          $result="{fn concat(".$result.",".$arStrings[$i].")}";
        }
    }
    return $result;
  }
  function Convert2Char($s) {
    return "{fn CONVERT(" . $s . ",SQL_VARCHAR)}";
  }
  function SqlMonth($s) {
    return "{fn MONTH(" . $s . ")}";
  }
  function SqlYear($s) {
    return "{fn YEAR(" . $s . ")}";
  }
  function CurrentTime() {
    return "{fn CURDATE()}";
  }
}

// For MS SQL Server
class dbClass_mssql
{
  var $lastQuery,$dbc;
  function dbClass_mssql($conn) { $this->conn=$conn; }
  function HasError() { return mssql_get_last_message()!=0; }
  function ErrorMsg() { return mssql_get_last_message(); }
  function Close() { return mssql_close($this->conn); }
  function FreeResult($rsLookUp) { return mssql_free_result($rsLookUp); }
  function RunQuery($sqltext) { $this->lastQuery=$sqltext; return mssql_query($sqltext,$this->conn); }
  function NumFields($rsMain) { return mssql_num_fields($rsMain); }
  function NumRows($rsMain) { return mssql_num_rows($rsMain); }
  function FieldType($rsMain,$i) { return mssql_field_type($rsMain,$i); }
  function FetchRow($rsMain,&$result) { $result=mssql_fetch_row($rsMain); return ($result==false) ? false : true; }
  function FetchAssoc($rsMain,&$result) { $result=mssql_fetch_assoc($rsMain); return ($result==false) ? false : true; }
  function FetchArray($rsMain,&$result) { $result=mssql_fetch_array($rsMain,MSSQL_NUM); return ($result==false) ? false : true; }
  function AffectedRows($rsMain) { return mssql_rows_affected($rsMain); }
  function Seek($rsMain,$offset) { return mssql_data_seek($rsMain,$offset); }
  function RunParamQuery($query, $phs = array()) {
    foreach ($phs as $ph) {
      if ( isset($ph) ) {
        $ph = "'" . str_replace("'","''",$ph) . "'";
      } else {
        $ph = "NULL" ;
      }
      $query = substr_replace($query, $ph, strpos($query, '?'), 1);
    }
    $this->lastQuery=$query;
    return mssql_query($query,$this->conn);
  }
  
  function GetColumnInfo($TableName) {
    $TableName=strtoupper($TableName);
    $rsMain=$this->RunQuery("exec sp_columns '$TableName'");
    if (!$rsMain) return null;
    $arColumns=array();

    while($this->FetchAssoc($rsMain,$row)) {
      $colinfo=new dbColumn;
      $colinfo->ColName=$row["COLUMN_NAME"];
      $colinfo->ColType=$row["TYPE_NAME"];
      if (array_key_exists("PRECISION",$row)) {
        $colinfo->ColLength=$row["PRECISION"];
      } else if (array_key_exists("LENGTH",$row)) {
        $colinfo->ColLength=$row["LENGTH"];
      }
      $colinfo->Nullable=($row["NULLABLE"]==1);
      $colinfo->IsPKey=false;
      $colinfo->Writeable=(strtoupper($row["TYPE_NAME"]) != "INT IDENTITY");
      array_push($arColumns, $colinfo);
    $tableid = $row["Id_table"];
    } 
    $this->FreeResult($rsMain);
    // Get Primary Keys
    $rsMain=$this->RunQuery("exec sp_pkeys '$TableName'");
    if ($rsMain) {
      while($this->FetchAssoc($rsMain,$row)) {
        $colname=$row["COLUMN_NAME"];
        for($i=0; $i<count($arColumns); $i++) {
          if ($arColumns[$i]->ColName==$colname) {
            $arColumns[$i]->IsPKey=true;
            break;
          }
        }
      } 
      $this->FreeResult($rsMain);
    }
    return $arColumns;
  }
  
  function Concat($arStrings) {
    return implode("+",$arStrings);
  }
  function Convert2Char($s) {
    return "CAST(" . $s . " AS VARCHAR)";
  }
  function SqlMonth($s) {
    return "MONTH(" . $s . ")";
  }
  function SqlYear($s) {
    return "YEAR(" . $s . ")";
  }
  function CurrentTime() {
    return "CURRENT_TIMESTAMP";
  }
}



class dbClass
{

  var $debug,$ConnTimeout,$CmdTimeout,$LockTimeout,$Provider;
  var $ErrMsgFmt;
  var $DisplayErrors;
  var $LastErrorMsg;
  var $Dialect;
  var $Wildcard;
  // these are private:
  var $dbMain,$DisplayFunc,$dbDefault;

// -------------------------------------------------------------
// Class Constructor
// -------------------------------------------------------------
  function dbClass()
  {
    $this->Provider="localhost";
    $this->debug=false;
    $this->ConnTimeout=30; // seconds
    $this->LockTimeout=5000; // milliseconds
    $this->DisplayErrors=true;
    $this->CmdTimeout=120; // 2 minutes
    $this->ErrMsgFmt="HTML";
    $this->DisplayFunc="echo";
    $this->Dialect="MySQL";
    $this->Wildcard="%";
  }

// -------------------------------------------------------------
// Class Destructor (only called if php5)
// -------------------------------------------------------------
  function __destruct()
  {
    $this->dbClose();
  }

  function DefaultDB()
  {
    return $this->dbDefault;
  }

//********************************************************************************************************
// If the database is down, then an explanation can be placed here
//********************************************************************************************************
  function MaintenanceMsg()
  {
    return "";
  }

  function DisplayMsg($msg)
  {
    if (!empty($this->DisplayFunc))
    {
      if ($this->ErrMsgFmt=="HTML" && substr($msg,0,1)!="<")
      {
        $msg="<p>".htmlspecialchars(str_replace("\n","<br>",$msg))."</p>";
      }
        else
      {
        $msg=str_replace("\n"," ",$msg);
      }
      eval($this->DisplayFunc."(\"".$msg."\");");
    }
  }

  function HandleError($msg)
  {
    if ($this->DisplayErrors)
    {
      $this->DisplayMsg($this->LastErrorMsg);
    }
  }

//********************************************************************************************************
// Checks if an error has occurred, and if so, displays a message & returns true
//********************************************************************************************************
  function CheckForError($msg)
  {
    if (!$this->db->HasError()) return false;
    $this->LastErrorMsg=$msg;
    if (empty($this->ErrMsgFmt)) return true;
    $this->HandleError($this->FormatErrorMsg($msg));
    return true;
  }

//********************************************************************************************************
// Attempts to connect to the Database. Returns true on success.
//********************************************************************************************************
  function MySqlLogon($DefDB,$userid,$pw)
  {
    $this->Dialect="MySQL";
    $this->dbDefault = $DefDB;
    $this->dbMain = mysql_connect($this->Provider,$userid,$pw);
    mysql_select_db($DefDB,$this->dbMain);
    $this->db =& new dbClass_mysql($this->dbMain);
    if ($this->CheckForError("opening connection")) return false;
    return true;
  }

//********************************************************************************************************
// Attempts to connect to the Database. Returns true on success.
//********************************************************************************************************
  function OracleLogon($sim,$user,$pw)
  {
    $this->Dialect="Oracle";
    $this->dbDefault = $user;
    $this->dbMain = ocilogon($user,$pw,$sim);
    $this->db =& new dbClass_oci($this->dbMain);
    if ($this->CheckForError("opening connection")) return false;
    $this->RunActionQuery("alter session set nls_date_format = 'YYYY-MM-DD HH24:MI:SS'");
    return true;
  }

//********************************************************************************************************
// Attempts to connect to the Database. Returns true on success.
//********************************************************************************************************
  function MSSqlLogon($servername,$DefDB,$user,$pw)
  {
    $this->Dialect="TSQL";
    $this->dbDefault = $DefDB;
    ini_set("mssql.datetimeconvert","Off");
    $this->dbMain = mssql_connect($servername,$user,$pw);
    if (!is_resource($this->dbMain)) {
      $this->LastErrorMsg="Error while connecting to ".$servername;
      return false;
    }
    $this->db =& new dbClass_mssql($this->dbMain);
    mssql_select_db($DefDB,$this->dbMain);
    return true;
  }

//********************************************************************************************************
// Attempts to connect to the Database. Returns true on success.
//********************************************************************************************************
  function OdbcLogon($dsn,$DefDB,$userid,$pw)
  {
    $this->dsn = $dsn;
    $this->dbDefault = $DefDB;
    $this->dbMain = odbc_connect($dsn,$userid,$pw,SQL_CUR_USE_ODBC);
    if (!is_resource($this->dbMain)) {
      $this->LastErrorMsg="Error while opening ODBC connection: " . odbc_error();
      return false;
    } else {
      $this->db = new dbClass_odbc($this);
      return true;
    }
  }

//********************************************************************************************************
// Close database connection
//********************************************************************************************************
  function dbClose() {
    if (is_resource($this->dbMain)) $this->db->Close();
    $this->dbMain = NULL;
    return true;
  }

  function CurrentTime() {
    return $this->db->CurrentTime();
  }

  function Convert2Char($s) {
    return $this->db->Convert2Char($s);
  }

  function SqlMonth($s) {
    return $this->db->SqlMonth($s);
  }

  function SqlYear($s) {
    return $this->db->SqlYear($s);
  }

  // requires an active db connection when using MySQL
  function addQuotes($s) {
    // Stripslashes
    if (get_magic_quotes_gpc())
      $s = stripslashes($s);
    if (is_numeric($s)) return $s;
    
    switch ($this->Dialect) {
      case "MySQL": return "'" . mysql_real_escape_string($s) . "'";
      default:      return "'".str_replace("'","''",$s)."'";
    }
  }

  function Concat($arStrings, $addQuotes) {
    if ($addQuotes) {
      for ($i=0; $i<count($arStrings); $i++)
        $arStrings[$i]=$this->addQuotes($arStrings[$i]);
    }
    return $this->db->Concat($arStrings);
  }

//********************************************************************************************************
// Return a string containing an error message
// String format is based on ErrMsgFmt
//********************************************************************************************************
  function FormatErrorMsg($ContextMsg)
  {
    switch ($this->ErrMsgFmt)
    {
      case "HTML":
        $function_ret="<p class=dberror id=dbError>Error! " . $this->db->ErrorMsg() ."</p>".
          "<p class=dberror id=dbErrorDetail><u>Operation that caused the error:</u><br>".$ContextMsg."</p>";
        break;
      case "MULTILINE":
        $function_ret="Error! " . $this->db->ErrorMsg() ."\n\nOperation that caused the error:\n".$ContextMsg;
        break;
      case "1LINE":
        $function_ret="Error! " . $this->db->ErrorMsg() ."  (".$ContextMsg.")";
        break;
    }
    return $function_ret;
  }

//********************************************************************************************************
// Runs a query and moves to the first record.
// Use only for queries that return records (no updates or deletes).
// If the query generated an error then Nothing is returned, otherwise it returns a new recordset object.
//********************************************************************************************************
  function RunQuery($sqltext) {
    $rsLookUp=$this->db->RunQuery($sqltext);
    if ($this->CheckForError($sqltext)) return null;
    if ($this->debug) $this->DisplayMsg($sqltext);
    return $rsLookUp;
  }


//********************************************************************************************************
// Runs a parameterized query (put ? in $sqltext to indicate where parameters should be inserted)
// Use only for queries that return records (no updates or deletes).
// If the query generated an error then Nothing is returned, otherwise it returns a new recordset object.
//********************************************************************************************************
  function RunParamQuery($sqltext, $arParams) {
    $rsLookUp=$this->db->RunParamQuery($sqltext, $arParams);
    if ($this->CheckForError($sqltext)) return null;
    if ($this->debug) $this->DisplayMsg($sqltext);
    return $rsLookUp;
  }


//********************************************************************************************************
// Safely close a recordset
//********************************************************************************************************
  function rsClose($rsLookUp) {
    if (is_resource($rsLookUp)) $this->db->FreeResult($rsLookUp);
    $rsLookUp = NULL;
  }

//********************************************************************************************************
// Runs a query and returns results from the first record in arData.
// Returns true if arData is modified (ie. a record exists).
// If the query generates an error then arData is left unchanged
// returns arData as an array, fields indexed numerically
//********************************************************************************************************
  function SingleRecordQuery($sqltext,&$arData)
  {
    $rsMain=$this->RunQuery($sqltext);
    if (!$rsMain) return false;
    $success=$this->db->FetchArray($rsMain,$arData);
    $this->rsClose($rsMain);
    return $success;
  }


//********************************************************************************************************
// Runs a query where no result set is expected (updates, deletes, etc)
//   - returns the number of records affected by the action query
//********************************************************************************************************
  function RunActionQuery($sqltext)
  {
    $rsMain=$this->db->RunQuery($sqltext);
    if ($this->CheckForError($sqltext)) {
      return 0;
    }
    else if ($this->debug) {
      $this->DisplayMsg($sqltext);
    }
    return $this->db->AffectedRows($rsMain);
  }


//********************************************************************************************************
// Runs a query where no result set is expected (updates, deletes, etc)
//   - if an error occurs, then the message is returned in errmsg
//********************************************************************************************************
  function RunActionQueryReturnMsg($sqltext,&$errmsg)
  {
    $tmpDisplayErrors=$this->DisplayErrors;
    $this->DisplayErrors=false;
    $this->LastErrorMsg="";
    $function_ret=$this->RunActionQuery($sqltext);
    if (!empty($this->LastErrorMsg))
    {
      $errmsg=$this->LastErrorMsg;
    }
    $this->DisplayErrors=$tmpDisplayErrors;
    return $function_ret;
  }


//********************************************************************************************************
// Takes a sql create (table or view) statement and performs:
//   1) a conditional drop (if it already exists)
//   2) the create
//   3) grants select access to public (if not a temp table)
//
// for views, all actions must occur on the default database for the connection
//********************************************************************************************************
  function DropCreate($sqlcreate)
  {
    $parsed=explode(" ",$sqlcreate);
    if (count($parsed) < 3) return;  // error
    $sqltext="DROP ".$parsed[1]." ".$parsed[2];
    $this->RunActionQueryReturnMsg($sqltext,$dropmsg);
    $this->RunActionQuery($sqlcreate);
    //$arName=explode(".",$parsed[2]);
    //$shortname=$arName[count($arName)-1];
    //if (substr($shortname,0,1)!="#")
    //  RunActionQuery("GRANT SELECT ON ".$parsed[2]." TO public");
  }

//********************************************************************************************************
// Returns a comma-separated list of column names that make up the primary key
// Returns empty string if no primary key has been defined
//********************************************************************************************************
  function PrimaryKey($TableName) {
    $keys='';
    $arColumns=$this->GetColumnInfo($TableName);
    if (!is_array($arColumns)) return '';
    foreach ($arColumns as $colinfo) {
      if ($colinfo->IsPKey) {
        if ($keys!='') $keys.=',';
        $keys.=$colinfo->ColName;
      }
    }
    return $keys;
  }


//********************************************************************************************************
// Returns array of column info - one entry for each column in $TableName
//********************************************************************************************************
  function GetColumnInfo($TableName) {
    return $this->db->GetColumnInfo($TableName);
  }


//********************************************************************************************************
// Add a condition to a where or having clause
//********************************************************************************************************
  function AddCondition(&$WhereClause,$NewCondition)
  {
    if (empty($WhereClause))
      $WhereClause="(".$NewCondition.")";
    else
      $WhereClause.=" AND (".$NewCondition.")";
  }

}
?>

