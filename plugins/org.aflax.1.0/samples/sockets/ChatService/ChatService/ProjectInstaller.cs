using System;
using System.Collections.Generic;
using System.Text;
using System.ComponentModel;
using System.Configuration.Install;

namespace ChatService
{
    [RunInstaller(true)]  //**1**
    public class ProjectInstaller : System.Configuration.Install.Installer
    {  //**2**
        private System.ComponentModel.Container components;
        private System.ServiceProcess.ServiceInstaller serviceInstaller1; //**3**
        private System.ServiceProcess.ServiceProcessInstaller serviceProcessInstaller1; //**4**

        public ProjectInstaller()
        {
            InitializeComponent();
        }

        private void InitializeComponent()
        {
            this.serviceInstaller1 = new System.ServiceProcess.ServiceInstaller();
            this.serviceProcessInstaller1 = new System.ServiceProcess.ServiceProcessInstaller();

            this.serviceInstaller1.DisplayName = "ChatService";  //**5**
            this.serviceInstaller1.ServiceName = "ChatService";  //**6**

            this.serviceInstaller1.StartType = System.ServiceProcess.ServiceStartMode.Automatic;  //**7**

            this.serviceProcessInstaller1.Account = System.ServiceProcess.ServiceAccount.LocalSystem;  //**8**
            this.serviceProcessInstaller1.Password = null;  //**9**
            this.serviceProcessInstaller1.Username = null;

            //**10**
            this.Installers.AddRange(new System.Configuration.Install.Installer[] {
    	        this.serviceProcessInstaller1,
	            this.serviceInstaller1});
        }

    }
}

/*
#1. Taken right out of the VS .NET documentation: 
"Specifies whether an installer should be invoked during installation of an assembly." (ms-help://MS.VSCC/MS.MSDNVS/cpref/html/frlrfSystemComponentModelRunInstallerAttributeClassTopic.htm) 

#2. Notice that our ProjectInstaller class must be derived from the Framework-supplied "System.Configuration.Install.Installer" 

#3. The Install Utility needs a ServiceInstaller when it installs the Service application. It contains properties for such things as the Service Display Name, the Service name, Start Type, etc. 

#4. A ServiceProcessInstaller is the actual class that will install the ServiceInstaller and its executable into the system, typically through the use of a tool such as "InstallUtil.exe" (more on this later). 

If you would like to read more on these, please refer to the documentation (ms-help://MS.VSCC/MS.MSDNVS/cpref/html/frlrfSystemServiceProcessServiceInstallerClassTopic.htm). 

#5 and #6. Demonstrates how to use the ServiceInstaller to set the desired DisplayName and ServiceName of the Service that is going to be installed. 

#7. Demonstrates how to set the StartType of the Service. Your options include: 

Automatic 
Disabled 
Manual 
#8. Demonstrates how to use the ServiceProcessInstaller to specify the desired default user account this Service will use once installed. 
#9. Demonstrates how we could set the username and password if we were to choose the option, "System.ServiceProcess.ServiceAccount.User", for the desired user account. 

#10. This binds the ServiceProcessInstaller, along with our ServiceInstaller, into our Installers. Installers are inherited from our derived class. Again, if you want more information on this, please consult the documentation (ms-help://MS.VSCC/MS.MSDNVS/cpref/html/frlrfSystemConfigurationInstallInstallerClassInstallersTopic.htm). 
*/
