define(["injector", "HttpGateway","ApplicationModule"], function (injector) {
    function Core() {
        var self = this;
        self.Modules = {};
        self.Libraries = {};
        self.RegisterModule = function (moduleName, modulePath) {
            var path;
            var moduleInstance = eval(moduleName);
            if (modulePath === undefined) {
                path = moduleName;
            } else {
                path = modulePath;
            }
            for (properties in moduleInstance) {
                if (moduleInstance.hasOwnProperty(properties) && typeof moduleInstance[properties] === "function") {
                    self.injector.Register(properties.toUpperCase(), moduleName + "." + properties);
                    console.log(properties);
                } else {
                    self.RegisterModule(path.concat("." + properties), path);
                }
            }
        }
        self.Start = function () {
            
        }


        self.injector = {}
    }

    var core = new Core();
    core.injector = injector;
    core.injector.RegisterInstance('EventAgregator', new Infrastructure.Events.EventAgregator());
    core.EventAgregator = core.injector.instanceDictionay['EventAgregator'].Instance;
    //core.RegisterModule('Annonces');
    //core.RegisterModule('Application');
    //core.RegisterModule('Entreprises');
    //core.RegisterModule('Profiles');
    core.RegisterModule('GateWay');
    core.Start();

    return core;
})
