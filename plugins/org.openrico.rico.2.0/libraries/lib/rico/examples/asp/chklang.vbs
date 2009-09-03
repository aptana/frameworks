<%
' -------------------------------------------------------------
' Check languages accepted by browser
' and see if there is a match
' -------------------------------------------------------------

sub setLang()
  dim fso,lang,lang2,fname,i
  
  Set fso=Server.CreateObject("Scripting.FileSystemObject")
  lang=lcase(Request.ServerVariables("HTTP_ACCEPT_LANGUAGE"))
  arLang=split(lang,",")
  for i=0 to ubound(arLang)
    lang2=lcase(left(trim(arLang(i)),2))
    if lang2="en" then exit for
    fname="livegrid_" & lang2 & ".js"
    if fso.FileExists(Server.MapPath("../../src/translations/" & fname)) then  ' MAKE SURE THIS PATH IS CORRECT FOR YOUR APPLICATION!
      response.write "Rico.include('" & fname & "');"
      exit for
    end if
  next
  set fso=nothing
end sub
%>
