using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Diagnostics;
using System.ServiceProcess;
using System.Text;

namespace ChatService
{
    public partial class Service1 : ServiceBase
    {
        ChatServer server;

        public Service1()
        {
            InitializeComponent();

            server = new ChatServer();
        }

        protected override void OnStart(string[] args)
        {
            server.start();
        }

        protected override void OnStop()
        {
            server.stop();
        }

        // The main entry point for the process
        static void Main()
        {
        #if (!DEBUG)
            System.ServiceProcess.ServiceBase[] ServicesToRun;
            ServicesToRun = new System.ServiceProcess.ServiceBase[] { new Service1() };
            System.ServiceProcess.ServiceBase.Run(ServicesToRun);
        #else
            // debug code: allows the process to run as a non-service
            // will kick off the service start point, but never kill it
            // shut down the debugger to exit
            Service1 service = new Service1();
            service.OnStart(null);
            System.Threading.Thread.Sleep(System.Threading.Timeout.Infinite);
        #endif 
        }
    }
}
