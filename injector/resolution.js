var Annonces;
(function (Annonces) {
    (function (Model) {
        var Annonce = (function () {
            function Annonce(Id, Createur, DateCreation, Titre, Description, TypeContract) {
                this.Id = Id;
                this.Createur = Createur;
                this.DateCreation = DateCreation;
                this.Titre = Titre;
                this.Description = Description;
                this.TypeContract = TypeContract;
            }
            return Annonce;
        })();
        Model.Annonce = Annonce;
    })(Annonces.Model || (Annonces.Model = {}));
    var Model = Annonces.Model;
})(Annonces || (Annonces = {}));
var AuthenticationModule;
(function (AuthenticationModule) {
    //export function init(): AuthenticationService {
    //    return new AuthenticationService();
    //}
    var AuthenticationService = (function () {
        function AuthenticationService() {
			console.log("nouvelle instance de AuthenticationModule")
			this.TestValue = "instance of AuthenticationService";
			this.Name ="AuthenticationService";
            this.RedirecToLoginPage = function () {
                window.location.href = "authentication/google";
            };
        }
        return AuthenticationService;
    })();
    AuthenticationModule.AuthenticationService = AuthenticationService;
})(AuthenticationModule || (AuthenticationModule = {}));
/// <reference path="../../../OwinWebApp/Scripts/typings/jquery/jquery.d.ts" />
/// <reference path="AuthenticationModule.ts" />
var GateWay;
(function (GateWay) {
    var HttpGateway = (function () {
        function HttpGateway(authenticationService) {
            var _this = this;
			this.Name ="HttpGateway"
			console.log("nouvelle instance de HttpGateway")
			console.log(authenticationService);
            this.authenticationModule = authenticationService;
            this.Post = function (urlParameter, data, successFunction, failFunction) {
                $.ajax({
                    url: urlParameter,
                    statusCode: { 401: _this.authenticationModule.RedirecToLoginPage },
                    data: data,
                    type: "POST",
                    success: successFunction,
                    fail: failFunction
                });
            };
            this.Get = function (urlParameter, data, successFunction, failFunction) {
                $.ajax({
                    url: urlParameter,
                    statusCode: { 401: _this.authenticationModule.RedirecToLoginPage },
                    data: data,
                    type: "GET",
                    success: successFunction,
                    fail: failFunction
                });
            };
        }
        return HttpGateway;
    })();
    GateWay.HttpGateway = HttpGateway;
})(GateWay || (GateWay = {}));
/// <reference path="../HttpGateway.ts" />
var Annonces;
(function (Annonces) {
    (function (Repositories) {
        var EmploisRepository = (function () {
            function EmploisRepository(httpGateway,EmploisText) {
                var _this = this;
                this.httpGateway = httpGateway;
				console.log("nouvelle instance de EmploisRepository");
                this.GetAll = function (callback) {
                    _this.httpGateway.Get("http://localhost:61087/api/profile/", null, callback, function (data) {
                    });
                };
            }
            return EmploisRepository;
        })();
        Repositories.EmploisRepository = EmploisRepository;
    })(Annonces.Repositories || (Annonces.Repositories = {}));
    var Repositories = Annonces.Repositories;
})(Annonces || (Annonces = {}));
var Annonces;
(function (Annonces) {
    ///<reference path='EmploisRepository.ts'/>
    ///<reference path='EmploisModel.ts'/>
    ///<reference path='../../../../OwinWebApp/Scripts/typings/knockout/knockout.d.ts'/>
    (function (View) {
        var EmploisViewModel = (function () {
            function EmploisViewModel(annonce, emploisRepository) {
            }
            return EmploisViewModel;
        })();
        View.EmploisViewModel = EmploisViewModel;
    })(Annonces.View || (Annonces.View = {}));
    var View = Annonces.View;
})(Annonces || (Annonces = {}));

var utils ;
 (function(utils){
	var dependencyType = function(classType){
				var type = classType.match(/Text+$/g);
				if(classType.match(/Text+$/g))
				{
					 return { Type : 'text', value : classType};
				}
				else{
					return { Type : 'function', value : classType};
				}
	};
	utils.dependencyType = dependencyType;
})(utils || (utils = {}))

function Injector(){
	console.log('Instance of Injector created');
	var self=this; 
	self.depDictionary = new Array();
	self.RegisterDependency =function(key,fullPath){
		self.depDictionary[key]= { path : fullPath};
	}
	self.resolve =function(classType){
			var dependencies = new Array();
			var depInstance ={};
			
			var dependencies = self.getDependencies(classType);
			
			for (var i = 0; i < dependencies.length; i++) { 
				var dependencyDetail;
				var dep;
				dependencyDetail = utils.dependencyType(dependencies[i]);
				
				switch(dependencyDetail.Type)
				{
					case 'function':
						dep = self.resolve(dependencies[i])();
						break;
					case 'text':
						dep =self.getSource(dependencies[i]);
						break;
					case 'param':
						dep = self.getSource(dependencies[i]);
						break;
				}
				
				depInstance[i] = dep;
			}
			
			var fun = self.getSource(classType);
			
			return function(){ 
					var argumentsToInject = "";
					for (var property in depInstance) {
						if (depInstance.hasOwnProperty(property))
						{
							if(argumentsToInject.length==0)
							{
								argumentsToInject = "depInstance["+property+"]";
							}
							argumentsToInject = argumentsToInject.concat(",depInstance["+property+"]")
						}
					}
					var instanceOfObject = eval("new fun("+argumentsToInject+")");
					return instanceOfObject;						
			};
	};
	
	self.getDependencies = function(classType){
		var funct = self.getSource(classType);
		var dependencies = funct.toString().match(/^function\s*[^\(]*\(\s*([^\)]*)\)/m)[1].replace(/ /g, '').split(',');
		var stringify =dependencies.toString();
		if(stringify.length==0)
		{
			return [];
		}
		return dependencies
	}
	
	self.getSource = function(classType){
		
		if(classType.Type ==='function'){
			var typeNameSpace = self.getNameSpace(classType);
			var splitedNameSpace = typeNameSpace.split('.');
			var typePath="";
			for(var j = 0 ; j< splitedNameSpace.length;j++)
			{
				if(j==0)
				{
					typePath = splitedNameSpace[j];
				}
				else{
					typePath  =typePath.concat("['"+splitedNameSpace[j]+"']");
				}
			}
			var source = eval(typePath);
			return source;
		}
		if(classtype.Type==='text')
		{
			return require([classtype.classType], function(foo){ 
					return foo;
				});
		}
	};
	
	self.getNameSpace = function(classType){
		var upperType = classType.toUpperCase();
		var stringDeps = self.depDictionary[upperType];
		if(typeof stringDeps==='undefined')
		{
			throw "Type "+classType+" is not registered";
		}
		return stringDeps.path;
	}
}

var injector = new Injector();
injector.RegisterDependency('EMPLOISREPOSITORY','Annonces.Repositories.EmploisRepository');
injector.RegisterDependency('HTTPGATEWAY','GateWay.HttpGateway');
injector.RegisterDependency('AUTHENTICATIONSERVICE','AuthenticationModule.AuthenticationService');
var emploisRepo = injector.resolve('EmploisRepository')();
