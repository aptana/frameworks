<%

' ----------------------------------------------------------------------
'
' dbClass2.vbs
'
' Routines to access SQL database
' Implemented as a vb class
'
' By Matt Brown
'
' ----------------------------------------------------------------------

'********************************************************************************************************
' Parse SQL a statement
'********************************************************************************************************
class sqlParse

public arSelList,arSelListAs,FromClause,WhereClause,arGroupBy,HavingClause,arOrderBy

' -------------------------------------------------------------
' Rebuilds a SQL select statement that was parsed by ParseSelect
' -------------------------------------------------------------
Public function UnparseSelect()
  dim sqltext
  sqltext="SELECT " & UnparseColumnList & " FROM " & FromClause
  if not IsEmpty(WhereClause) then sqltext=sqltext & " WHERE " & WhereClause
  if IsArray(arGroupBy) then
    if UBound(arGroupBy)>=0 then sqltext=sqltext & " GROUP BY " & join(arGroupBy,",")
  end if
  if not IsEmpty(HavingClause) then sqltext=sqltext & " HAVING " & HavingClause
  if IsArray(arOrderBy) then
    if UBound(arOrderBy)>=0 then sqltext=sqltext & " ORDER BY " & join(arOrderBy,",")
  end If
  UnparseSelect=sqltext
end Function


Public function UnparseColumn(ByVal i)
  dim s
  s=arSelList(i)
  if not IsEmpty(arSelListAs(i)) then s=s & " AS " & arSelListAs(i)
  UnparseColumn=s
end Function


Public function UnparseColumnList()
  dim sqltext,i
  if ubound(arSelList) < 0 then exit function
  sqltext=UnparseColumn(0)
  for i=1 to ubound(arSelList)
    sqltext=sqltext & "," & UnparseColumn(i)
  next
  UnparseColumnList=sqltext
end Function


Public sub Init(ub)
  redim arSelList(ub),arSelListAs(ub),arGroupBy(-1),arOrderBy(-1)
  FromClause=empty
  WhereClause=empty
  HavingClause=empty
end sub


' -------------------------------------------------------------
' Parse a SQL select statement into its major components
' Does not handle:
' 1) union queries
' 2) select into
' 3) more than one space between "group" and "by", or "order" and "by"
' If distinct is specified, it will be part of the first item in arSelList
' -------------------------------------------------------------
Public function ParseSelect(ByVal sqltext)
  dim i,j,l,idx,clause,parencnt,inquote,ch,curfield,nexttoken
  Init(-1)
  ParseSelect=false
  sqltext=replace(sqltext,vbLf," ")
  sqltext=" " & replace(sqltext,vbCr," ") & " SELECT "   ' SELECT suffix forces last curfield to be saved
  'response.write "<p>ParseSelect: " & sqltext & "</p>"
  l=len(sqltext)
  parencnt=0
  inquote=false
  i=1
  curfield=""
  while i<l
    ch=mid(sqltext,i,1)
    if inquote then
      if ch="'" then
        if mid(sqltext,i,2)="''" then
          curfield=curfield & "'"
          i=i+1
        else
          inquote=false
        end if
      end if
      curfield=curfield & ch
    elseif ch="'" then
      inquote=true
      curfield=curfield & ch
    elseif ch="(" then
      parencnt=parencnt+1
      curfield=curfield & ch
    elseif ch=")" then
      if parencnt=0 then exit function  ' sql statement has a syntax error
      parencnt=parencnt-1
      curfield=curfield & ch
    elseif parencnt > 0 then
      curfield=curfield & ch
    elseif ch="," then
      'response.write "<p>" & clause & ": " & server.htmlencode(curfield) & "</p>"
      select case clause
        case "SELECT":
          SetParseField arSelList,curfield
          Push arSelListAs,Empty
        case "AS":
          arSelListAs(ubound(arSelList))=curfield
          curfield=""
          clause="SELECT"
        case "GROUP BY": SetParseField arGroupBy,curfield
        case "ORDER BY": SetParseField arOrderBy,curfield
        case else: curfield=curfield & ch
      end select
    elseif ch=" " then
      j=InStr(i+1,sqltext," ")
      if j<1 then
        curfield=curfield & ch
      else
        if ucase(mid(sqltext,j+1,3))="BY " then j=j+3
        nexttoken=ucase(mid(sqltext,i+1,j-i-1))
        'wscript.echo "'" & nexttoken & "'"
        'response.write "<p>" & clause & " : " & nexttoken & " : " & server.htmlencode(curfield) & "</p>"
        select case nexttoken
          case "SELECT","AS","INTO","FROM","WHERE","GROUP BY","HAVING","ORDER BY":
            select case clause
              case "SELECT":
                SetParseField arSelList,curfield
                Push arSelListAs,Empty
              case "AS":
                arSelListAs(ubound(arSelList))=curfield
                curfield=""
              case "FROM":     SetParseField FromClause,curfield
              case "WHERE":    SetParseField WhereClause,curfield
              case "GROUP BY": SetParseField arGroupBy,curfield
              case "HAVING":   SetParseField HavingClause,curfield
              case "ORDER BY": SetParseField arOrderBy,curfield
            end select
            clause=nexttoken
            i=j
          case else: if curfield<>"" then curfield=curfield & ch
        end select
      end if
    else
      curfield=curfield & ch
    end if
    i=i+1
  wend
  ParseSelect=true
end function


Private sub Push(f, ByVal newvalue)
  ReDim Preserve f(ubound(f)+1)
  f(ubound(f))=newvalue
end sub

Private sub SetParseField(f, ByRef newvalue)
  if IsArray(f) then
    Push f,newvalue
  else
    f=newvalue
  end if
  newvalue=""
end sub

' -------------------------------------------------------------
' Add a join to the from clause
' -------------------------------------------------------------
Public Sub AddJoin(ByVal JoinClause)
  if InStr(FromClause," join ")>0 then FromClause="(" & FromClause & ")"  ' required by Access
  FromClause=FromClause & " " & JoinClause
end sub

' -------------------------------------------------------------
' Add sort criteria to the order by clause
' -------------------------------------------------------------
Public Sub AddSort(ByVal NewSort)
  ReDim Preserve arOrderBy(ubound(arOrderBy)+1)
  dim i
  for i=ubound(arOrderBy) to 1 step -1
    arOrderBy(i)=arOrderBy(i-1)
  next
  arOrderBy(0)=NewSort
end sub

' -------------------------------------------------------------
' Add a condition to the where clause
' -------------------------------------------------------------
Public Sub AddWhereCondition(ByVal NewCondition)
  AddCondition WhereClause,NewCondition
end sub

' -------------------------------------------------------------
' Add a condition to the having clause
' -------------------------------------------------------------
Public Sub AddHavingCondition(ByVal NewCondition)
  AddCondition HavingClause,NewCondition
end sub

Private Sub AddCondition(ByRef Clause, ByVal NewCondition)
  if IsEmpty(NewCondition) then exit sub
  If IsEmpty(Clause) Then
    Clause="(" & NewCondition & ")"
  Else
    Clause=Clause & " AND (" & NewCondition & ")"
  End If
End Sub

end class


'********************************************************************************************************
' created by dbClass.GetColumnInfo()
'********************************************************************************************************
class dbColumn
  Public ColName,Nullable,ColType,ColLength,Writeable,IsPKey
end class


'********************************************************************************************************
' Manage a database connection
'********************************************************************************************************
class dbClass

Public SqlSvr,debug,ConnTimeout,CmdTimeout,LockTimeout,Provider,OdbcDriver
Public ErrMsgFmt     ' empty=errors not shown, otherwise "HTML" or "MULTILINE" or "1LINE"
Public DisplayErrors ' true/false
Public LastErrorMsg,Dialect

Private dbMain,DisplayFunc,dbDefault

' -------------------------------------------------------------
' Class Constructor
' -------------------------------------------------------------
Private Sub Class_Initialize   ' Setup Initialize event.
  dim tw,tr
  SqlSvr = "localhost"
  Use_TSQL
  debug=false
  ConnTimeout=30        ' seconds
  LockTimeout=5000      ' milliseconds
  DisplayErrors=true
  on error resume next  ' if running with option explicit, then the next lines cause an error
  tw=TypeName(wscript)
  tr=TypeName(response)
  if tw<>"Empty" then
    if IsObject(wscript) then
      ErrMsgFmt="1LINE"
      CmdTimeout = 3600   ' 60 minutes for wsh/cscript
      DisplayFunc="wscript.echo "
    end if
  elseif tr<>"Empty" then
    if IsObject(response) then
      ErrMsgFmt="HTML"
      CmdTimeout = 120    ' 2 minutes for asp pages
      DisplayFunc="response.write "
    end if
  else
    ErrMsgFmt="MULTILINE"
    CmdTimeout = 30
    DisplayFunc="msgbox "
  End If
  'DisplayMsg "Message format set to " & ErrMsgFmt
End Sub

Public function Connection()
  set Connection=dbMain
end function

Public Sub Use_TSQL()
  Dialect="TSQL"
  Provider="SQLOLEDB"
End Sub

Public Sub Use_Access(FileName)
  Dialect="Access"
  Provider="Microsoft.Jet.OLEDB.4.0"
  SqlSvr=FileName
End Sub

Public Sub Use_MySQL()
  Dialect="MySQL"
  OdbcDriver="{MySQL ODBC 3.51 Driver}"
End Sub

Public Sub Use_Oracle(SIM)
  Dialect="Oracle"
  'Provider="MSDAORA"
  Provider="OraOLEDB.Oracle"
  SqlSvr=SIM
End Sub

Public function CurrentTime()
  select case Dialect
    case "TSQL": CurrentTime="CURRENT_TIMESTAMP"
    case "Access": CurrentTime="Now()"
    case else: CurrentTime="LOCALTIMESTAMP"
  end select
end function

Public function Convert2Char(s)
  select case Dialect
    case "TSQL"  : Convert2Char="cast(" & s & " as varchar)"
    case "Access": Convert2Char="CStr(" & s & ")"
    case "Oracle": Convert2Char="cast(" & s & " as varchar2(20))"
    case else: Convert2Char=s   ' implicit conversion (MySQL)
  end select
end function

Public function SqlYear(s)
  select case Dialect
    case "Oracle": SqlYear="to_char(" & s & ",'YYYY')"
    case else: SqlYear="year(" & s & ")"
  end select
end function

Public function Wildcard()
  Wildcard="%"
end function

Public function addQuotes(s)
  if IsNumeric(s) then
    addQuotes=s
    exit function
  end if
  select case Dialect
    case "Access":
      if IsDate(s) then
        addQuotes="#" & s & "#"
      else
        addQuotes="""" & replace(s,"""","""""") & """"
      end if
    case "MySQL":  addQuotes="'" & replace(replace(s,"\","\\"),"'","\'") & "'"
    case else:     addQuotes="'" & replace(s,"'","''") & "'"
  end select
end function

Public function Concat(arStrings,addQuotes)
  dim i,quote
  if addQuotes then
    for i=0 to ubound(arStrings)
      arStrings(i)=addQuotes(arStrings(i))
    next
  end if
  select case Dialect
    case "TSQL": Concat=join(arStrings,"+")
    case "Access": Concat=join(arStrings," & ")
    case "MySQL": Concat="concat(" & join(arStrings,",") & ")"
    case else: Concat=join(arStrings," || ")
  end select
end function

' -------------------------------------------------------------
' Class Destructor
' -------------------------------------------------------------
Private Sub Class_Terminate   ' Setup Terminate event.
  dbClose
End Sub

' -------------------------------------------------------------
' If the database is down, then an explanation can be placed here
' -------------------------------------------------------------
Public function MaintenanceMsg()
  MaintenanceMsg=""
end function

Public function DefaultDB()
  DefaultDB=dbDefault
end function

' -------------------------------------------------------------
' Attempts to connect to the database using Windows security. 
' Returns true on success.
' For use with MS SQL Server
' -------------------------------------------------------------
Public function WinLogon(ByVal DefDB)
  dbDefault=DefDB
  WinLogon=dbConnect("Provider=" & Provider & ";Data Source=" & SqlSvr & ";Initial Catalog=" & DefDB & ";Integrated Security=SSPI;")
end function

' -------------------------------------------------------------
' Attempts to connect to the database using sql security model. 
' Returns true on success.
' -------------------------------------------------------------
Public function SqlLogon(ByVal DefDB, ByVal userid, ByVal pw)
  dim connstr
  dbDefault=DefDB
  if IsEmpty(OdbcDriver) then
    connstr="Provider=" & Provider & ";Data Source=" & SqlSvr & ";"
    if userid<>"" then connstr=connstr & "User Id=" & userid & ";Password=" & pw & ";"
    if DefDB<>"" then connstr=connstr & "Initial Catalog=" & DefDB & ";"
  else
    connstr="DRIVER=" & OdbcDriver & ";SERVER=" & SqlSvr & ";"
    if userid<>"" then connstr=connstr & "USER=" & userid & ";PASSWORD=" & pw & ";"
    if DefDB<>"" then connstr=connstr & "DATABASE=" & DefDB & ";"
  end if
  SqlLogon=dbConnect(connstr)
end function

' -------------------------------------------------------------
' Attempts to connect to the Database. Returns true on success.
' -------------------------------------------------------------
Public function dbConnect(ByVal ConnStr)
  if MaintenanceMsg<>"" then
  	HandleError MaintenanceMsg
  	exit function
  end if
  On Error Resume Next
  dbConnect=false
  if not IsObject(dbMain) then
    set dbMain = CreateObject("ADODB.Connection")
    if CheckForError("creating ADODB object") then exit function
  end if
  if debug then DisplayMsg "Connect String: " & ConnStr
  dbMain.ConnectionTimeout = ConnTimeout
  dbMain.Open ConnStr
  if CheckForError("opening connection: " & ConnStr) then exit function
  dbMain.CommandTimeout = CmdTimeout
  if Dialect="TSQL" then RunActionQuery "SET LOCK_TIMEOUT " & LockTimeout
  dbConnect=true
end function

' -------------------------------------------------------------
' Close database connection
' -------------------------------------------------------------
Public sub dbClose
  if IsObject(dbMain) then
    if dbMain.state <> 0 then dbMain.Close
    set dbMain = Nothing    ' releases memory, but still an object
    dbMain = Empty          ' cause IsObject to return false
  end if
end sub

' -------------------------------------------------------------
' Return a string containing an error message
' String format is based on ErrMsgFmt
' -------------------------------------------------------------
Private Function FormatErrorMsg(ByVal ContextMsg)
  select case ErrMsgFmt
    case "HTML": FormatErrorMsg = "<p class='dberror' id='dbError'>Error # " & Hex(err.number) & " was generated by " & err.Source & "<br />" & FixHtmlStr(err.Description) & "</p>" & _
                                  "<p class='dberror' id='dbErrorDetail'><u>Operation that caused the error:</u><br />" & FixHtmlStr(ContextMsg) & "</p>"
    case "MULTILINE": FormatErrorMsg = "Error # " & Hex(err.number) & " was generated by " & err.Source & vbLf & err.Description & vbLf & vbLf & _
                                       "Operation that caused the error:" & vbLf & ContextMsg
    case "1LINE": FormatErrorMsg = "Error # " & hex(Err.Number) & " was generated by " & Err.Source & ":  " & Err.Description & "  (" & ContextMsg & ")"
  end select
End Function

Private Function FixHtmlStr(s)
  FixHtmlStr=replace(replace(replace(s,"&","&amp;"),"<","&lt;"),"""","&quot;")
End Function

Private sub DisplayMsg(msg)
  if not IsEmpty(DisplayFunc) then
    if ErrMsgFmt="HTML" and left(msg,1)<>"<" then
      msg="<p>" & Server.HTMLEncode(replace(msg,vbLf,"<br>"))
    else
      msg=replace(msg,vbLf," ")
    end if
    execute DisplayFunc & """" & replace(msg,"""","""""") & """"
  End If
end sub

Private sub HandleError(msg)
  LastErrorMsg=msg
  if DisplayErrors then DisplayMsg LastErrorMsg
End sub

' -------------------------------------------------------------
' Checks if an error has occurred, and if so, displays a message & returns true
' -------------------------------------------------------------
Private function CheckForError(msg)
  CheckForError=false
  If err.number = 0 Then exit function
  CheckForError=true
  if IsEmpty(ErrMsgFmt) Then exit function
  HandleError FormatErrorMsg(msg)
End function

' -------------------------------------------------------------
' Runs a query and moves to the first record.
' Use only for queries that return records (no updates or deletes).
' If the query generated an error then Nothing is returned, otherwise it returns a new recordset object.
' -------------------------------------------------------------
Public Function RunQuery(sqltext)
  Dim rsLookUp
  On Error Resume Next
  Set rsLookUp = dbMain.Execute(sqltext)
  If CheckForError(sqltext) Then
    Set RunQuery = Nothing
    Exit Function
  End If
  If debug then DisplayMsg sqltext
  If Not rsLookUp.EOF Then rsLookUp.MoveFirst
  Set RunQuery = rsLookUp
End Function


' -------------------------------------------------------------
' Runs a parameterized query (put ? in sqltext to indicate where parameters should be inserted)
' Use only for queries that return records (no updates or deletes).
' If the query generated an error then Nothing is returned, otherwise it returns a new recordset object.
' -------------------------------------------------------------
Public Function RunParamQuery(sqltext, arParams)
  Dim rsLookUp,cmd,RecordsAffected
  On Error Resume Next
  set objCmd = CreateObject("ADODB.Command")
  Set objCmd.ActiveConnection = dbMain
  objCmd.CommandText = sqltext
  objCmd.CommandType = 1 ' adCmdText 
  Set rsLookUp = objCmd.Execute(RecordsAffected,arParams)
  If CheckForError(sqltext) Then
    Set RunParamQuery = Nothing
    Exit Function
  End If
  If debug then DisplayMsg sqltext
  set objCmd = Nothing
  Set RunParamQuery = rsLookUp
End Function


' -------------------------------------------------------------
' Safely close a recordset
' -------------------------------------------------------------
Public Sub rsClose(ByRef rsLookUp)
  If IsObject(rsLookUp) Then
    If Not (rsLookUp Is Nothing) Then
      If rsLookUp.State <> 0 Then      ' adStateClosed=0
        rsLookUp.Close
      End If
      Set rsLookUp = Nothing
    End If
  End If
End Sub

' -------------------------------------------------------------
' Runs a query and returns results from the first record in dicData.
' Returns true if dicData is modified (ie. a record exists).
' If the query generates an error then dicData is left unchanged
' dicData can be a dictionary object, an array, or a scalar
' If dicData is a scalar, it will be assigned the value of the first field in the first row.
' -------------------------------------------------------------
Public Function SingleRecordQuery(ByVal sqltext, ByRef dicData)
  Dim rsMain, i
  SingleRecordQuery = False
  Set rsMain = RunQuery(sqltext)
  If rsMain Is Nothing Then Exit Function
  If Not rsMain.EOF Then
    If IsObject(dicData) Then
      For i = 0 To rsMain.Fields.Count - 1
        dicData(rsMain.Fields(i).name) = rsMain.Fields(i).Value
      Next
    ElseIf IsArray(dicData) Then
      For i = 0 To rsMain.Fields.Count - 1
        dicData(i) = rsMain.Fields(i).Value
      Next
    Else
      dicData = rsMain.Fields(0).Value
    End If
    SingleRecordQuery = True
  End If
  rsClose rsMain
End Function


' -------------------------------------------------------------
' Runs a query where no result set is expected (updates, deletes, etc)
'   - returns the number of records affected by the action query
' -------------------------------------------------------------
Public Function RunActionQuery(ByVal sqltext)
  Dim RecordsAffected, spflag
  On Error Resume Next
  RunActionQuery = 0
  spflag = (UCase(Left(sqltext, 4)) = "EXEC")
  If spflag Then dbMain.Execute "SET NOCOUNT ON"
  dbMain.Execute sqltext, RecordsAffected, &H80     ' adExecuteNoRecords (hard coded so that adovbs.inc is not required)
  If CheckForError(sqltext) Then
    Exit Function
  ElseIf debug then
    DisplayMsg sqltext
    if not IsEmpty(RecordsAffected) and not IsNull(RecordsAffected) then
      DisplayMsg RecordsAffected & " records affected"
    end if
  End If
  RunActionQuery = RecordsAffected
End Function


' -------------------------------------------------------------
' Runs a query where no result set is expected (updates, deletes, etc) 
'   - if an error occurs, then the message is returned in errmsg
' -------------------------------------------------------------
Public function RunActionQueryReturnMsg (ByVal sqltext, ByRef errmsg)
  dim tmpDisplayErrors
  tmpDisplayErrors=DisplayErrors
  DisplayErrors=false
  LastErrorMsg=Empty
  RunActionQueryReturnMsg=RunActionQuery(sqltext)
  if not IsEmpty(LastErrorMsg) then errmsg=LastErrorMsg
  DisplayErrors=tmpDisplayErrors
end function


' -------------------------------------------------------------
' Takes a sql create (table or view) statement and performs:
'   1) a conditional drop (if it already exists)
'   2) the create
'   3) grants select access to public (if not a temp table)
'
' for views, all actions must occur on the default database for the connection
' -------------------------------------------------------------
Public sub DropCreate (sqlcreate)
  dim sqltext,shortname,parsed,arName,db
  parsed=split(sqlcreate," ",4)
  arName=split(parsed(2),".")
  shortname=arName(ubound(arName))
  if ubound(arName)=2 then db=arName(0) else db=dbDefault
  sqltext="IF EXISTS (SELECT * from " & db & ".dbo.sysobjects WHERE name='" & shortname & "') DROP " & parsed(1) & " " & parsed(2)
  RunActionQuery sqltext
  RunActionQuery sqlcreate
  if left(shortname,1) <> "#" and db=dbDefault then
    sqltext="GRANT SELECT ON " & parsed(2) & " TO public"
    RunActionQuery sqltext
  end if
end sub

' -------------------------------------------------------------
' Returns a recordset that will enumerate the columns in a table or view
' objname may be a fully qualified object name
' -------------------------------------------------------------
Public function EnumColumns (ByVal objname)
  select case Dialect
    case "TSQL":   set EnumColumns=RunQuery("exec sp_columns " & TabName2SpParms(objname))
    case "Access": set EnumColumns=empty
    case "MySQL":  set EnumColumns=RunQuery("show full columns from " & objname)
    case else:     set EnumColumns=RunQuery("describe " & objname)
  end select
end function

' -------------------------------------------------------------
' Convert the numeric value returned by DB to Enum, so
' that at least the user could have a guess of what it is.
' -------------------------------------------------------------
Public Function ConvType(ByVal TypeVal)
  Select Case TypeVal
      Case 20    ConvType = "adBigInt"
      Case 128   ConvType = "adBinary"
      Case 11    ConvType = "adBoolean"
      Case 8     ConvType = "adBSTR"    '  i.e. null terminated string
      Case 129   ConvType = "adChar"
      Case 6     ConvType = "adCurrency"
      Case 7     ConvType = "adDate"
      Case 133   ConvType = "adDBDate"
      Case 134   ConvType = "adDBTime"
      Case 135   ConvType = "adDBTimeStamp"
      Case 14    ConvType = "adDecimal"
      Case 5     ConvType = "adDouble"
      Case 0     ConvType = "adEmpty"
      Case 10    ConvType = "adError"
      Case 72    ConvType = "adGUID"
      Case 9     ConvType = "adIDispatch"
      Case 3     ConvType = "adInteger"
      Case 13    ConvType = "adIUnknown"
      Case 205   ConvType = "adLongVarBinary"
      Case 201   ConvType = "adLongVarChar"
      Case 203   ConvType = "adLongVarWChar"
      Case 131   ConvType = "adNumeric"
      Case 4     ConvType = "adSingle"
      Case 2     ConvType = "adSmallInt"
      Case 16    ConvType = "adTinyInt"
      Case 21    ConvType = "adUnsignedBigInt"
      Case 19    ConvType = "adUnsignedInt"
      Case 18    ConvType = "adUnsignedSmallInt"
      Case 17    ConvType = "adUnsignedTinyInt"
      Case 132   ConvType = "adUserDefined"
      Case 204   ConvType = "adVarBinary"
      Case 200   ConvType = "adVarChar"
      Case 12    ConvType = "adVariant"
      Case 202   ConvType = "adVarWChar"
      Case 130   ConvType = "adWChar"
   End Select
End Function

' -------------------------------------------------------------
' Refresh View - in case the tables on which the view is based have changed
' -------------------------------------------------------------
Public sub RefreshView (ByVal viewname)
  dim sqltext,rsLookUp
  sqltext="SELECT * FROM " & dbDefault & ".dbo.sysobjects o " & vbLf & _
          "WHERE (o.xtype='V') AND (o.name='" & viewname & "')"
  set rsLookUp = RunQuery(sqltext)
  if rsLookUp.EOF then
    rsClose rsLookUp
  else
    rsClose rsLookUp
    sqltext="sp_helptext '" & viewname & "'"
    set rsLookUp = RunQuery(sqltext)
    sqltext=""
    Do while not rsLookUp.EOF
      sqltext=sqltext & rsLookUp("Text")
    	rsLookUp.movenext
    Loop
    rsClose rsLookUp
    sqltext=replace(sqltext,"CREATE VIEW ","ALTER VIEW ",1,-1,1)
    RunActionQuery sqltext
  end if
end sub

' -------------------------------------------------------------
' Split a fully or partially qualified table name into
' its component parts (db,owner,table)
' -------------------------------------------------------------
Public sub SplitTabName (ByVal objname, ByRef dbname, ByRef owner, ByRef table)
  dim arNames,last

  arNames=split(objname,".")
  last=ubound(arNames)
  table=arNames(last)
  if Dialect="Access" or Dialect="Oracle" then
    owner=empty
    dbname=empty
    table=ucase(table)
    exit sub
  end if
  if last>0 then
    owner=arNames(last-1)
  else
    owner="dbo"
  end if
  if last>1 then
    dbname=arNames(last-2)
  else
    dbname=dbDefault
  end if
end sub

' -------------------------------------------------------------
' Converts objname (db.owner.table) to format used by
' stored procedures ('table','owner','db')
' -------------------------------------------------------------
Public function TabName2SpParms (ByVal objname)
  dim table,owner,dbname
  SplitTabName objname,dbname,owner,table
  TabName2SpParms="'" & table & "','" & owner & "','" & dbname & "'"
end function


' -------------------------------------------------------------
' Safely add a column to a table
' -------------------------------------------------------------
Public sub AddColumnIfMissing(TableName,ColumnName,ColumnType)
  dim sqltext,db,ShortName,arTableName
  db=dbDefault
  arTableName=split(TableName,".")
  ShortName=arTableName(ubound(arTableName))       ' the last element is the unqualified table name
  if ubound(arTableName)=2 then db=arTableName(0)  ' if TableName was a fully qualified name, then use the db name that came with it
  sqltext="IF NOT EXISTS (SELECT c.name FROM " & db & ".dbo.syscolumns c, " & db & ".dbo.sysobjects o " & vbLf & _
          "WHERE c.id = o.id AND (o.xtype='U') AND (o.name='" & ShortName & "') AND (c.name='" & ColumnName & "')) " & vbLf & _
          "ALTER TABLE " & TableName & " ADD " & ColumnName & " " & ColumnType
  RunActionQuery sqltext
end sub


Private function ADOColType(typenum)
  select case typenum
    case 2,3,16,17,18,19,20,21,139: ADOColType="INT"
    case 7,133,134,135: ADOColType="DATETIME"
    case 129,130: ADOColType="CHAR"
    case 8,200,202: ADOColType="VARCHAR"
    case 201,203: ADOColType="TEXT"
    case else:    ADOColType="???" & typenum
  end select
end function

' -------------------------------------------------------------
' Returns a recordset that will enumerate the columns in a table or view
' objname may be a fully qualified object name
' querytype: 4=adSchemaColumns, 27=adSchemaForeignKeys, 28=adSchemaPrimaryKeys
' -------------------------------------------------------------
Public function EnumColumnsADO (ByVal querytype, ByVal objname)
  dim table,owner,dbname,reval
  on error resume next
  SplitTabName objname,dbname,owner,table
  If debug then DisplayMsg "Getting ADO column info for: " & querytype & ", " & objname
  Set reval = dbMain.OpenSchema (querytype, Array(dbname, owner, table))
  if CheckForError("OpenSchema: " & querytype & "," & dbname & "," & owner & "," & table) then
    Set reval = Nothing
  end if
  Set EnumColumnsADO = reval
end function


'********************************************************************************************************
' Returns a comma-separated list of column names that make up the primary key
' Returns empty if no primary key has been defined
'********************************************************************************************************
Public function PrimaryKey(TableName)
  Dim rs,colnames
  If debug then DisplayMsg "Getting primary key for: " & TableName
  Set rs = EnumColumnsADO(28,TableName)
  if rs is Nothing Then exit function
  While Not rs.EOF
    if IsEmpty(colnames) then colnames=rs("COLUMN_NAME") else colnames=colnames & "," & rs("COLUMN_NAME")
    rs.MoveNext
  Wend
  rs.Close
  PrimaryKey=colnames
end function


' returns number of columns, or -1 if there was en error
Public function GetColumnInfo (ByVal TableName, ByRef arColumns)
  dim rs,cnt,i
  GetColumnInfo=-1
  If debug then DisplayMsg "Getting column info for: " & TableName
  SplitTabName TableName,dbname,owner,table
  cnt=0
  Set rs = EnumColumnsADO(4,TableName)
  if rs is Nothing Then exit function
  If debug and rs.EOF then DisplayMsg "EOF column info"
  While Not rs.EOF
    if not IsEmpty(arColumns(cnt)) then set arColumns(cnt)=Nothing
    'If debug then DisplayMsg "Loading column #" & cnt & " " & rs("TABLE_CATALOG") & "." & rs("TABLE_NAME") & "." & rs("COLUMN_NAME") & " " & rs("DATA_TYPE")
    set arColumns(cnt)=new dbColumn
    with arColumns(cnt)
      .ColName=rs("COLUMN_NAME")
      .ColType=ADOColType(clng(rs("DATA_TYPE")))
      if .ColType="INT" then
        .ColLength=rs("NUMERIC_PRECISION")
      else
        .ColLength=rs("CHARACTER_MAXIMUM_LENGTH")
      end if
      .Nullable=rs("IS_NULLABLE")
      .Writeable=((rs("COLUMN_FLAGS") and &H0000004) <> 0)
      .IsPKey=false
    end with
    cnt=cnt+1
    rs.MoveNext
  Wend
  rs.Close

  Set rs = EnumColumnsADO(28,TableName)
  if rs is Nothing Then exit function
  While Not rs.EOF
    for i=0 to cnt-1
      if arColumns(i).ColName=rs("COLUMN_NAME") then
        arColumns(i).IsPKey=true
        exit for
      end if
    next
    rs.MoveNext
  Wend
  rs.Close
  GetColumnInfo=cnt
end function


' -------------------------------------------------------------
' Returns a SQL create statement based on the structure of an existing table
' but with a new table name substituted on the create line.
' Returns an empty string if there is an error (e.g. OldTableName doesn't exist)
' -------------------------------------------------------------
Public function GenCreateFromTable (ByVal OldTableName, ByVal NewTableName)
  dim rsLookUp,sqltext,coltype
  
  GenCreateFromTable=""
  sqltext=""
  set rsLookUp = EnumColumns(OldTableName)
  if rsLookUp is Nothing then exit function
  if rsLookUp.EOF then exit function
  Do while not rsLookUp.EOF
    coltype=ucase(trim(rsLookUp("TYPE_NAME")))
    if sqltext = "" then
      sqltext="create table " & NewTableName & " (" & vbLf
    else
      sqltext=sqltext & "," & vbLf
    end if
    sqltext=sqltext & "  [" & trim(rsLookUp("COLUMN_NAME")) & "] " & coltype
    if InStr(coltype,"CHAR") > 0 or InStr(coltype,"BINARY") > 0 then
      sqltext=sqltext & "(" & rsLookUp("LENGTH") & ")"
    elseif coltype="DECIMAL" or coltype="NUMERIC" then
      sqltext=sqltext & "(" & rsLookUp("PRECISION") & "," & rsLookUp("SCALE") & ")"
    end if
    if rsLookUp("NULLABLE") = 0 then
      sqltext=sqltext & " NOT NULL"
    else
      sqltext=sqltext & " NULL"
    end if
  	rsLookUp.movenext
  Loop
  sqltext=sqltext & vbLf & ")"
  rsClose rsLookUp
  GenCreateFromTable=sqltext
end function


' -------------------------------------------------------------
' Add a condition to a where or having clause
' -------------------------------------------------------------
Public Sub AddCondition(ByRef WhereClause, ByVal NewCondition)
  if IsEmpty(NewCondition) then exit sub
  If IsEmpty(WhereClause) Then
    WhereClause="(" & NewCondition & ")"
  Else
    WhereClause=WhereClause & " AND (" & NewCondition & ")"
  End If
End Sub


end class

%>
