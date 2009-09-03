<%
'**********************************
' Rico: GENERIC TABLE/VIEW EDITOR
'  By Matt Brown
'**********************************

class TableEditTable
  Public TblName,alias,arFields,arData,arColInfo(100)
end class


class TableEditClass

Public action,TableFilter,options,AutoInit,CurrentField,SvrOnly,gridID,formVar,gridVar,bufferVar,optionsVar,DefaultSort

Private Panels(20)
Private objDB,CurrentPanel
Private xhtmlcloser
Private ErrorFlag,ErrorMsg,MainTbl
Private Tables(30),TableCnt
Private Fields(50),FieldCnt

' returns field number if successful, empty if error
Public Function AddEntryField(ColumnName,Heading,EntryTypeCode,DefaultValue)
  if InStr("/S/N/R/H/D/DT/I/B/T/TA/SL/RL/CL/tinyMCE/","/" & EntryTypeCode & "/") < 1 then
    TableEditError "invalid EntryTypeCode in TableEditClass"
    exit Function
  end if
  if not IncrCurrentField then exit Function
  CurrentField("ColName")=ColumnName
  CurrentField("Hdg")=Heading
  CurrentField("EntryType")=EntryTypeCode
  CurrentField("ColData")=DefaultValue
  select case EntryTypeCode
    case "I": CurrentField("OnChange")="TableEditCheckInt"
    case "D": CurrentField("type")="date"
    case "DT": CurrentField("type")="datetime"
    case "TA","tinyMCE" : CurrentField("TxtAreaRows")=4 : CurrentField("TxtAreaCols")=80
    case "R","RL": CurrentField("RadioBreak")="<br" & xhtmlcloser
    case "H": CurrentField("visible")=false
  end select
  AddEntryField=FieldCnt
end Function


' returns field number if successful, empty if error
Public Function AddEntryFieldW(ColumnName,Heading,EntryTypeCode,DefaultValue,Width)
  dim retval
  retval=AddEntryField(ColumnName,Heading,EntryTypeCode,DefaultValue)
  if not IsEmpty(retval) then CurrentField("width")=Width
  AddEntryFieldW=retval
end Function


' returns field number if successful, empty if error
Public Function AddCalculatedField(ByVal ColumnFormula, ByVal Heading)
  if not IncrCurrentField then exit Function
  if left(ColumnFormula,1) <> "(" then ColumnFormula="(" & ColumnFormula & ")"
  CurrentField("ColName")="Calc_" & FieldCnt
  CurrentField("Formula")=ColumnFormula
  CurrentField("Hdg")=Heading
  AddCalculatedField=FieldCnt
end Function


Public Sub AddPanel(ByVal PanelHeading)
  if CurrentPanel >= ubound(Panels) then
    TableEditError "exceeded max # of panels in TableEditClass"
    exit sub
  end if
  CurrentPanel=CurrentPanel+1
  Panels(CurrentPanel)=PanelHeading
end Sub


Public Function DefineAltTable(ByVal AltTabName, arFieldList, arFieldData)
  if TableCnt >= ubound(Tables) then
    TableEditError "exceeded max # of alternate tables in TableEditClass"
    exit Function
  end if
  TableCnt=TableCnt+1
  set Tables(TableCnt)=new TableEditTable
  with Tables(TableCnt)
    .TblName=AltTabName
    .alias="a" & TableCnt
    .arFields=arFieldList
    .arData=arFieldData
    if ubound(.arFields) <> ubound(.arData) then
      TableEditError "# of fields does not match # of data entries supplied for table " & AltTabName
      exit Function
    end if
  end with
  DefineAltTable=TableCnt
end Function


' returns true if FieldCnt successfully incremented
Private Function IncrCurrentField
  if FieldCnt >= ubound(Fields) then
    TableEditError "exceeded max # of columns in TableEditClass"
    IncrCurrentField=false
    exit Function
  end if
  FieldCnt=FieldCnt+1
  set CurrentField = CreateObject("Scripting.Dictionary")
  set Fields(FieldCnt)=CurrentField
  if CurrentPanel>=0 then CurrentField("panelIdx")=CurrentPanel else CurrentField("panelIdx")=0
  CurrentField("AddQuotes")=true
  CurrentField("ReadOnly")=false
  CurrentField("TableIdx")=MainTbl
  IncrCurrentField=true
end Function


Public Sub SetTableName(ByVal s)
  dim actionparm
  TableCnt=TableCnt+1
  MainTbl=TableCnt
  set Tables(TableCnt)=new TableEditTable
  with Tables(TableCnt)
    .TblName=s
    .alias="t"
  end with
  gridID=LCase(replace(replace(s,".","_")," ","_"))
  formVar=gridID & "['edit']"
  gridVar=gridID & "['grid']"
  bufferVar=gridID & "['buffer']"
  optionsVar=gridID & "['options']"
  actionparm=gridID & "__action"
  action=trim(Request.QueryString(actionparm))
  if action="" then action=trim(Request.Form(actionparm))
  if action="" then action="table" else action=lcase(action)
end Sub


Private Sub AddSort(field,direction)
  if not IsEmpty(DefaultSort) then DefaultSort=DefaultSort & ","
  DefaultSort=DefaultSort & field & " " & direction
end Sub


Public Sub SortCurrent(direction)
  if CurrentField.exists("Formula") then
    AddSort CurrentField("Formula"),direction
  elseif CurrentField.exists("ColName") then
    AddSort Tables(CurrentField("TableIdx")).alias & "." & CurrentField("ColName"),direction
  end if
end Sub


Public Sub SortAsc()
  SortCurrent "ASC"
end Sub


Public Sub SortDesc()
  SortCurrent "DESC"
end Sub


Public Sub ConfirmDeleteColumn()
  options("ConfirmDeleteCol")=FieldCnt
end Sub


Public Sub genXHTML()
  xhtmlcloser=" />"
end Sub


Public Sub SetDbConn(ByRef dbcls)
  set objDB=dbcls
end Sub


'*************************************************************************************
' Take appropriate action
'*************************************************************************************
Public Sub DisplayPage()
  if FieldCnt < 0 then exit sub
  if not ErrorFlag then GetColumnInfo
  if not ErrorFlag then
    select case action
      case "del"  if options("canDelete") then TableDeleteRecord
      case "ins"  if options("canAdd") then TableInsertRecord
      case "upd"  if options("canEdit") then TableUpdateRecord
      case else   TableDisplay
    end select
  end if
  if ErrorFlag then
    response.write vbLf & "<p style='color:red;'><span style='text-decoration:underline;'>ERROR ENCOUNTERED</span><br" & xhtmlcloser & ErrorMsg
  end if
end Sub

'*************************************************************************************
' Class Constructor
'*************************************************************************************
Private Sub Class_Initialize
  dim a,resize,i
  if IsObject(oDB) then set objDB=oDB  ' use oDB global as database connection, if it exists

  set options = CreateObject("Scripting.Dictionary")
  options("TableSelectNew")="___new___"
  options("TableSelectNone")=""
  options("canAdd")=true
  options("canEdit")=true
  options("canView")=true
  options("canDelete")=true
  options("ConfirmDelete")=true
  options("ConfirmDeleteCol")=-1
  options("DebugFlag")=(trim(Request.QueryString("debug"))<>"")
  options("RecordName")="record"
  options("prefetchBuffer")=true
  options("PanelNamesOnTabHdr")=true
  options("highlightElem")="menuRow"

  set SvrOnly = CreateObject("Scripting.Dictionary")
  SvrOnly("SelectSql")=1
  SvrOnly("SelectFilter")=1
  SvrOnly("Formula")=1
  SvrOnly("TableIdx")=1
  SvrOnly("AddQuotes")=1
  SvrOnly("FilterFlag")=1
  SvrOnly("XMLprovider")=1

  xhtmlcloser=">"
  FieldCnt=-1
  CurrentPanel=-1
  TableCnt=-1
  AutoInit=true
  ErrorFlag=false
  ErrorMsg=""
  PopUpFlag=false
end Sub


'*************************************************************************************
' Class Destructor
'*************************************************************************************
Private Sub Class_Terminate   ' Setup Terminate event.
  for i=0 to FieldCnt
    set Fields(i)=Nothing
  next
  set options = Nothing
  set SvrOnly = Nothing
end Sub

' if AltTable has a multi-column key, then add those additional constraints
Private function AltTableKeyWhereClause(AltTabIdx)
  dim w,i
  for i=0 to ubound(Tables(AltTabIdx).arFields)
    if Tables(AltTabIdx).arColInfo(i).IsPKey then
      w=w & " and " & Tables(AltTabIdx).arFields(i) & "=" & Tables(AltTabIdx).arData(i)
    end if
  next
  AltTableKeyWhereClause=w
end function

Private function AltTableJoinClause(alias)
  dim i,w
  for i=0 to FieldCnt
    if Fields(i)("TableIdx")=MainTbl and not IsCalculatedField(i) then
      if Fields(i)("ColInfo").IsPKey then objDB.AddCondition w,Fields(i)("ColName") & "=" & alias & "." & Fields(i)("ColName")
    end if
  next
  AltTableJoinClause=w
end function

' form where clause based on table's primary key
Private function TableKeyWhereClause()
  dim i,w
  for i=0 to FieldCnt
    if Fields(i)("TableIdx")=MainTbl and not IsCalculatedField(i) then
      if Fields(i)("ColInfo").IsPKey then objDB.AddCondition w,Fields(i)("ColName") & "=" & FormatValue(trim(Request.Form("_k" & i)),i)
    end if
  next
  if IsEmpty(w) then
    TableEditError "no key value"
  else
    TableKeyWhereClause=" WHERE " & w
  end if
end function

' name used external to this script
Private function ExtFieldId(i)
  ExtFieldId=gridID & "_" & i
end function


Public function FieldName()
  FieldName=ExtFieldId(FieldCnt)
end function


Private function IsCalculatedField(i)
  IsCalculatedField=Fields(i).exists("Formula")
end function


'*************************************************************************************
' Retrieves column info from database for main table and any alternate tables
'*************************************************************************************
Private sub GetColumnInfo()
  dim c,i,j,FieldNum,cnt,colname,Columns(250),dicColIdx
  set dicColIdx = CreateObject("Scripting.Dictionary")
  dicColIdx.CompareMode=1
  for FieldNum=0 to FieldCnt
    dicColIdx.Add Fields(FieldNum)("TableIdx") & "." & Fields(FieldNum)("ColName"),FieldNum
    if options("canEdit")=false and options("canAdd")=false then Fields(FieldNum)("ReadOnly")=true
  next
  for i=0 to TableCnt
    cnt=objDB.GetColumnInfo(Tables(i).TblName,Columns)
    if cnt<1 then
      TableEditError "unable to retrieve column info for " & Tables(i).TblName & "<br>" & objDB.LastErrorMsg
      exit sub
    end if
    for c=0 to cnt-1
      colname=trim(Columns(c).ColName)
      if dicColIdx.exists(i & "." & colname) then
        FieldNum=dicColIdx(i & "." & colname)
        set Fields(FieldNum)("ColInfo")=Columns(c)
      elseif i<>MainTbl then
        for j=0 to ubound(Tables(i).arFields)
          if colname=Tables(i).arFields(j) then set Tables(i).arColInfo(j)=Columns(c)
        next
      elseif Columns(c).IsPKey then
        TableEditError "primary key field is not defined (" & Tables(i).TblName & "." & colname & ")"
        set dicColIdx = Nothing
        exit sub
      end if
    next
  next
  set dicColIdx = Nothing
end sub

Private sub TableUpdateDatabase(ByVal sqltext, ByVal actiontxt)
  dim errmsg,cnt
  if ErrorFlag then exit sub
  cnt=objDB.RunActionQueryReturnMsg(sqltext,errmsg)
  if IsEmpty(errmsg) and cnt=1 then
    response.write "<p>" & options("RecordName") & " " & actiontxt & " successfully</p>"
    if options("DebugFlag") then response.write "<p class='debug'>" & sqltext & "<br" & xhtmlcloser & "Records affected: " & cnt
  else
    TableEditError "unable to update database!<br" & xhtmlcloser & errmsg
  end if
end sub


Private function FormatValue(ByVal v, ByVal idx)
  dim fld,addquotes
  set fld=Fields(idx)
  addquotes=fld("AddQuotes")
  if left(fld("EntryType"),1)="D" then
    if v="" then
      addquotes=false
      v="NULL"
    end if
  elseif fld("EntryType")="I" then
    addquotes=false
    if v="" or not IsNumeric(v) then v="NULL"
  elseif fld("EntryType")="N" and v=options("TableSelectNew") then
    v=trim(Request.Form("textnew__" & ExtFieldId(idx)))
  elseif InStr("SNR",left(fld("EntryType"),1)) > 0 and v=options("TableSelectNone") then
    addquotes=false
    v="NULL"
  end if
  if addquotes then v=objDB.addQuotes(v)
  FormatValue=v
end function


Private function FormatFormValue(idx)
  dim v
  if not Fields(idx).exists("EntryType") then exit function
  if Fields(idx)("EntryType")="H" or Fields(idx)("FormView")="exclude" then
    v=Fields(idx)("ColData")
  else
    v=trim(Request.Form(ExtFieldId(idx)))
  end if
  FormatFormValue=FormatValue(v,idx)
end function


'*************************************************************************************
' Deletes the specified record
'*************************************************************************************
Private sub TableDeleteRecord()
  TableUpdateDatabase "DELETE FROM " & Tables(MainTbl).TblName & TableKeyWhereClause(), "deleted"
end sub

Private sub UpdateRecord(sqltext)
  dim errmsg
  objDB.RunActionQueryReturnMsg sqltext,errmsg
  if not IsEmpty(errmsg) then
    errmsg="unable to update database!<br" & xhtmlcloser & errmsg
    if options("DebugFlag") then errmsg=errmsg & "<p>SQL: " & sqltext
    TableEditError errmsg
  elseif options("DebugFlag") then
    response.write "<BR class='debug'>" & sqltext
  end if
end sub

Private sub UpdateAltTableRecords(i)
  dim j,sqltext,colnames,coldata,c
  if ErrorFlag then exit sub

  ' delete existing record

  sqltext="delete from " & Tables(i).TblName
  sqltext=sqltext & TableKeyWhereClause()
  sqltext=sqltext & AltTableKeyWhereClause(i)
  UpdateRecord(sqltext)

  ' insert new record

  colnames=""
  coldata=""
  for j=0 to FieldCnt
    if Fields(j).exists("ColInfo") then
      if Fields(j)("TableIdx")=i or Fields(j)("ColInfo").IsPKey then
        colnames=colnames & "," & Fields(j)("ColName")
        coldata=coldata & "," & FormatValue(trim(Request.Form(ExtFieldId(j))),j)
      end if
    end if
  next
  for j=0 to ubound(Tables(i).arFields)
    c=Tables(i).arFields(j)
    colnames=colnames & "," & c
    coldata=coldata & "," & Tables(i).arData(j)
  next
  sqltext="insert into " & Tables(i).TblName & " (" & mid(colnames,2) & ") values (" & mid(coldata,2) & ")"
  UpdateRecord(sqltext)
end sub


'*************************************************************************************
' Updates an existing record in the db
'*************************************************************************************
Private sub TableUpdateRecord()
  dim i,sqltext
  for i=0 to TableCnt
    if i<>MainTbl then UpdateAltTableRecords i
  next
  for i=0 to FieldCnt
    if not IsCalculatedField(i) then
      if Fields(i)("TableIdx")=MainTbl and Fields(i)("ColInfo").Writeable and not Fields(i).exists("InsertOnly") then
        sqltext=sqltext & "," & Fields(i)("ColName") & "=" & FormatFormValue(i)
      end if
    end if
  next
  sqltext="UPDATE " & Tables(MainTbl).TblName & " SET " & mid(sqltext,2)
  sqltext=sqltext & TableKeyWhereClause()
  TableUpdateDatabase sqltext, "updated"
end sub

'*************************************************************************************
' Inserts a new record into the db
'*************************************************************************************
Private sub TableInsertRecord()
  dim i,sqltext,sqlcol,sqlval,keyCnt,keyIdx
  keyCnt=0
  sqlcol=""
  sqlval=""
  for i=0 to FieldCnt
    if not IsCalculatedField(i) and Fields(i)("TableIdx")=MainTbl and not Fields(i).exists("UpdateOnly") then
      if Fields(i)("ColInfo").IsPKey then
        keyCnt=keyCnt+1
        keyIdx=i
      end if
      if Fields(i)("ColInfo").Writeable then
        sqlcol=sqlcol & "," & Fields(i)("ColName")
        sqlval=sqlval & "," & FormatFormValue(i)
      end if
    end if
  next
  sqltext="insert into " & Tables(MainTbl).TblName & " (" & mid(sqlcol,2) & ") values (" & mid(sqlval,2) & ")"
  TableUpdateDatabase sqltext, "added"
  if TableCnt>0 and keyCnt=1 and not Fields(keyIdx)("ColInfo").Writeable then
    if not objDB.SingleRecordQuery("SELECT SCOPE_IDENTITY()",Fields(keyIdx)("ColData")) then
      TableEditError "unable to retrieve new identity value"
      exit sub
    end if
  end if
  for i=0 to TableCnt
    if i<>MainTbl then UpdateAltTableRecords i
  next
end sub


Private Sub TableEditError(msg)
  ErrorFlag=true
  ErrorMsg=msg
End Sub


Private Function IsFieldName(s)
  dim i,c
  i=1
  IsFieldName=false
  while i <= len(s)
    c=mid(s,i,1)
    if (c >= "0" and c <= "9" and i > 1) or (c >= "A" and c <= "Z") or (c >= "a" and c <= "z") or (c = "_") then
      i=i+1
    else
      exit function
    end if
  wend
  IsFieldName=(i > 1)
End Function


'*************************************************************************************
' Displays a table
'*************************************************************************************
Private sub TableDisplay()
  dim oParseLookup,oParseMain
  dim i,reccnt,ShowActionCol
  dim rsMain,DeleteURL,style,NonBlanks,lastPanel,o,p
  dim idx,idx2,s,a,w,codeField,descField,descQuery,alias,tabidx

  ' -------------------------------------
  ' form sql query
  ' -------------------------------------
  set oParseMain=new sqlParse
  set oParseLookup=new sqlParse
  oParseMain.Init(FieldCnt)
  oParseMain.FromClause=Tables(MainTbl).TblName & " t"
  oParseMain.AddWhereCondition TableFilter
  for i=0 to FieldCnt
    if Fields(i).exists("TableIdx") then tabidx=Fields(i)("TableIdx")
    if Fields(i).exists("FilterFlag") then
      ' add any column filters to where clause
      oParseMain.AddWhereCondition Fields(i)("ColName") & "='" & Fields(i)("ColData") & "'"
    end if
    if Fields(i).exists("EntryType") then
      if InStr("CSNR",left(Fields(i)("EntryType"),1)) > 0 then
        if Fields(i).exists("SelectSql") then
          s=Fields(i)("SelectSql")
          if Fields(i).exists("SelectFilter") then
            oParseLookup.ParseSelect s
            oParseLookup.AddWhereCondition Fields(i)("SelectFilter")
            s=oParseLookup.UnparseSelect
          end if
          session.contents(ExtFieldId(i))=replace(s,"%alias%","")
        else
          session.contents(ExtFieldId(i))="select distinct " & Fields(i)("ColName") & " from " & Tables(tabidx).TblName & " where " & Fields(i)("ColName") & " is not null"
        end if
      end if
    end if

    if IsCalculatedField(i) then

      ' computed column

      oParseMain.arSelList(i)=Fields(i)("Formula") & " as rico_col" & i

    elseif tabidx=MainTbl then

      ' column from main table - avoid subqueries to make it compatible with MS Access & MySQL < v4.1

      if mid(Fields(i)("EntryType"),2)="L" and Fields(i).exists("SelectSql") then
        alias="t" & CStr(i)
        s=replace(Fields(i)("SelectSql"),"%alias%",alias & ".")
        oParseLookup.ParseSelect s
        if ubound(oParseLookup.arSelList)=1 then
          codeField=oParseLookup.arSelList(0)
          descField=oParseLookup.arSelList(1)
          if IsFieldName(descField) then descField=alias & "." & descField
          oParseMain.AddJoin "left join " & oParseLookup.FromClause & " " & alias & _
            " on t." & Fields(i)("ColName") & "=" & alias & "." & codeField
          oParseMain.arSelList(i)=objDB.concat(Array(descField,"'<span class=""ricoLookup"">'",objDB.Convert2Char(Tables(MainTbl).alias & "." & Fields(i)("ColName")),"'</span>'"), false) & " as rico_col" & i
        else
          TableEditError "Invalid lookup query (" & Fields(i)("SelectSql") & ")"
          exit sub
        end if
      else
        oParseMain.arSelList(i)=Tables(MainTbl).alias & "." & Fields(i)("ColName")
      end if

    else

      ' column from alt table - no avoiding subqueries here

      s="(select " & Fields(i)("ColName") & " from " & Tables(tabidx).TblName & " a" & i & _
        " where " & AltTableJoinClause("t") & AltTableKeyWhereClause(tabidx) & ")"
      if mid(Fields(i)("EntryType"),2)="L" and Fields(i).exists("SelectSql") then
        oParseLookup.ParseSelect Fields(i)("SelectSql")
        if ubound(oParseLookup.arSelList)=1 then
          codeField=oParseLookup.arSelList(0)
          descField=oParseLookup.arSelList(1)
          descQuery="select " & descField & " from " & oParseLookup.FromClause & " where " & codeField & "=" & s
          if not IsEmpty(oParseLookup.WhereClause) then descQuery=descQuery & " and " & oParseLookup.WhereClause
          oParseMain.arSelList(i)="(" & objDB.concat(Array("(" & descQuery & ")","'<span class=""ricoLookup"">'",objDB.Convert2Char(s),"'</span>'"), false) & ") as rico_col" & i
        else
          TableEditError "Invalid lookup query (" & Fields(i)("SelectSql") & ")"
          exit sub
        end if
      else
        oParseMain.arSelList(i)=s & " as rico_col" & i
      end if

    end if
  next
  if IsEmpty(DefaultSort) then DefaultSort=objDB.PrimaryKey(Tables(MainTbl).TblName)
  oParseMain.AddSort DefaultSort
  session.contents(gridID)=oParseMain.UnparseSelect
  session.contents(gridID & ".db")=objDB.DefaultDB
  'response.write gridID & ": " & session.contents(gridID)

  response.write vbLf & "<p class='ricoBookmark'>"
  response.write vbLf & "<span id='" & gridID & "_timer' class='ricoSessionTimer'></span>"
  response.write "&nbsp;&nbsp;<span id='" & gridID & "_bookmark' class='ricoBookmark'></span>"
  response.write "&nbsp;&nbsp;<span id='" & gridID & "_savemsg' class='ricoSaveMsg'></span>"
  response.write vbLf & "</p>"
  response.write vbLf & "<div id='" & gridID & "'></div>"

  response.write vbLf & "<script type='text/javascript'>"
  response.write vbLf & "var " & gridID & " = {};"
  response.write vbLf & optionsVar & " = {"
  for each o in options
    if not IsObject(options(o)) and not SvrOnly.exists(o) then response.write vbLf & "  " & o & ": " & FormatOption(options(o)) & ","
  next
  if CurrentPanel>=0 then
    response.write vbLf & "  panels: ["
    for i=0 to CurrentPanel
      if i>0 then response.write ","
      response.write "'" & Panels(i) & "'"
    next
    response.write "],"
  end if
  response.write vbLf & "  columnSpecs : ["
  for i=0 to FieldCnt
    if i>0 then response.write ","
    response.write vbLf & "    {"
    response.write " FieldName:'" & ExtFieldId(i) & "'"
    for each o in Fields(i)
      if not IsObject(Fields(i)(o)) and not SvrOnly.exists(o) then response.write "," & vbLf & "      " & o & ": " & FormatOption(Fields(i)(o)) '& "  /* " & vartype(Fields(i)(o)) & " */"
    next
    if Fields(i).exists("ColInfo") then
      response.write "," & vbLf & "      isNullable:" & FormatOption(Fields(i)("ColInfo").Nullable)
      response.write "," & vbLf & "      Writeable:" & FormatOption(Fields(i)("ColInfo").Writeable)
      response.write "," & vbLf & "      isKey:" & FormatOption(Fields(i)("ColInfo").IsPKey)
      if Fields(i)("ColInfo").ColLength then response.write "," & vbLf & "      Length:" & FormatOption(Fields(i)("ColInfo").ColLength)
    end if
    response.write " }"
  next
  response.write vbLf & "  ]"
  response.write vbLf & "};"
  if AutoInit then
    response.write vbLf & "Rico.onLoad(function() {"
    'response.write vbLf & "  try {"
    response.write vbLf & "  if(typeof RicoUtil=='undefined') throw('LiveGridForms requires the RicoUtil Library');"
    response.write vbLf & "  if(typeof RicoTranslate=='undefined') throw('LiveGridForms requires the RicoTranslate Library');"
    response.write vbLf & "  if(typeof Rico.LiveGrid=='undefined') throw('LiveGridForms requires the Rico.LiveGrid Library');"
    response.write vbLf & "  if(typeof Rico.GridMenu=='undefined') throw('LiveGridForms requires the Rico.GridMenu Library');"
    response.write vbLf & "  if(typeof Rico.Buffer=='undefined') throw('LiveGridForms requires the Rico.Buffer Library');"
    response.write vbLf & "  if(typeof Rico.Buffer.AjaxSQL=='undefined') throw('LiveGridForms requires the Rico.Buffer.AjaxSQL Library');"
    response.write InitScript
    'response.write vbLf & "  } catch(e) { alert(e.message); };"
    response.write vbLf & "});"
  end if
  response.write vbLf & "</script>"
end sub


'********************************************************************************************************
' Pad a number to the specified length with leading zeroes
'********************************************************************************************************
Private Function PadNumber(number, length)
	dim strNumber

	if IsNull(number) or IsEmpty(number) then strNumber=String(length,"-") else strNumber = Cstr(number)
	do while len(strNumber) < length
		strNumber = "0" & strNumber
	loop

	PadNumber=strNumber
End Function

Private Function FormatOption(s)
  if IsArray(s) then
    FormatOption="{" & join(s,",") & "}"
  else
    select case vartype(s)
      case 8,129,130,200,202
        FormatOption="""" & replace(s,"""","\""") & """" ' string
      case 11
        FormatOption=lcase(s)      ' boolean
      case 7,133,134,135:
        FormatOption="'" & year(s) & "-" & PadNumber(month(s),2) & "-" & PadNumber(day(s),2) & "T" & PadNumber(hour(s),2) & ":" & PadNumber(minute(s),2) & ":" & PadNumber(second(s),2) & "'" ' date/time
      case else
        FormatOption=s
    end select
  end if
End Function


Public function InitScript()
  InitScript = vbLf & bufferVar & "=new Rico.Buffer.AjaxSQL('" & options("XMLprovider") & "', {TimeOut:" & Session.Timeout & "});" & _
               vbLf & "if(typeof " & gridID & "_GridInit=='function') " & gridID & "_GridInit();" & _
               vbLf & gridVar & "=new Rico.LiveGrid ('" & gridID & "'," & bufferVar & "," & optionsVar & ");" & _
               vbLf & gridVar & ".menu=new Rico.GridMenu();" & _
               vbLf & "if(typeof " & gridID & "_FormInit=='function') " & gridID & "_FormInit();" & _
               vbLf & formVar & "=new Rico.TableEdit(" & gridVar & ");" & _
               vbLf & "if(typeof " & gridID & "_InitComplete=='function') " & gridID & "_InitComplete();"
end function

end class
%>