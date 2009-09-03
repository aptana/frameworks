<!-- #INCLUDE FILE = "../../plugins/asp/dbClass2.vbs" -->
<%

Dim oDB,oForm,accessRights,appDB
const appName="Northwind"
appDB="Northwind"

Function CreateDbClass()
  Set oDB = new dbClass
  'oDB.debug=true

  ' ***********************************************************
  ' UNCOMMENT THE APPROPRIATE LINE FOR YOUR DATABASE
  ' IF ALL ARE COMMENTED, SQL SERVER (TSQL) WILL BE THE DEFAULT
  '
  'oDB.SqlSvr="myserver"   ' put your server name here (if not localhost)
  oDB.Use_Access Server.Mappath("../data/northwind.mdb")
  'oDB.Use_Oracle "XE"
  'oDB.Use_MySQL
  ' ***********************************************************
end function

Function OpenDB()
  OpenDB=false
  CreateDbClass
  select case oDB.Dialect
    case "TSQL"  : OpenDB=oDB.SqlLogon(appDB, "userid", "password")
    case "Access": OpenDB=oDB.SqlLogon(empty, "Admin", "")
    case "Oracle": OpenDB=oDB.SqlLogon(empty, "NORTHWIND", "Password")
    case "MySQL" : OpenDB=oDB.SqlLogon(appDB, "UserID", "Password")
  end select
end function

function OpenApp(title)
  OpenApp=false
  if not OpenDB then exit function
  if not IsEmpty(title) then AppHeader appName & "-" & title
  accessRights="rw"  ' CHECK APPLICATION SECURITY HERE  (in this example, "r" gives read-only access and "rw" gives read/write access)
  if IsEmpty(accessRights) or IsNull(accessRights) or left(accessRights,1)<>"r" then
    response.write "<p class='error'>You do not have permission to access this application"
  else
    OpenApp=true
  end if
end function

function OpenGridForm(title,tabname)
  dim CanModify
  OpenGridForm=false
  if not OpenApp(title) then exit function
  set oForm=new TableEditClass
  oForm.SetTableName tabname
  oForm.options("XMLprovider")="ricoXMLquery.asp"
  CanModify=CBool(accessRights="rw")
  oForm.options("canAdd")=CanModify
  oForm.options("canEdit")=CanModify
  oForm.options("canDelete")=CanModify
  Session.Timeout=60
  OpenGridForm=true
end function

sub CloseApp()
  set oDB = Nothing
  set oForm = Nothing
end sub

Sub AppHeader(hdg)
  response.write "<h2 class='appHeader'>" & replace(hdg,"<dialect>",oDB.Dialect) & "</h2>"
end sub

%>
