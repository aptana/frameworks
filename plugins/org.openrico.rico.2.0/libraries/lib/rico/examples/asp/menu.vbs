<%
ScriptName=trim(Request.ServerVariables("SCRIPT_NAME"))
i=InStrRev(ScriptName,"/")
if (i>0) then ScriptName=mid(ScriptName,i+1)
scripts=array("ex1.asp","ex2.asp","ex3.asp","ex4.asp","ex5.asp","ex6.asp","ex7.asp","ex8.asp","ex9.asp","ex10.asp")
response.write "<strong><a href='http://www.openrico.org'>Rico 2.0</a></strong>"
response.write "<table border='0' cellpadding='7'><tr>"
response.write "<td><a href='../'>Home</a></td>"
for k=0 to ubound(scripts)
  v=scripts(k)
  if (v=ScriptName) then
    response.write "<td><strong style='border:1px solid brown;color:brown;'>Ex " & CStr(k+1) & "</strong></td>"
  else
    response.write "<td><a href='" & v & "'>Ex " & CStr(k+1) & "</a></td>"
  end if
next
response.write "</tr></table>"
%>
