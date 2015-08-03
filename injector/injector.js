define(["knockout","ko"], function (knoc, ko) {
    var utils;
    (function (utils) {
        var dependencyType = function (classType) {
            var type = classType.match(/Text+$/g);
            if (classType.match(/Text+$/g)) {
                return { Type: 'text', value: classType };
            } else {
                return { Type: 'function', value: classType };
            }
        };
        utils.dependencyType = dependencyType;
    })(utils || (utils = {}))

    function Injector() {
        console.log('Instance of Injector created');
        var self = this;
        self.depDictionary = new Array();
        self.instanceDictionay = new Array();
        self.Register = function (key, fullPath) {
            self.depDictionary[key] = { path: fullPath };
        }
        self.RegisterInstance = function (key, instance) {
            self.instanceDictionay[key] = { Instance: instance };
        }
        self.resolve = function (classType, overideParameter) {
            if (self.instanceDictionay[classType] !== undefined) {
                return function() {
                    return self.instanceDictionay[classType];
                }
            }

            var depInstance = {};
            var parameter = overideParameter !== undefined ? overideParameter : {};

            var dependencies = self.getDependencies(classType);

            for (var i = 0; i < dependencies.length; i++) {
                var dep = {};
                if (parameter[dependencies[i]] !== undefined) {
                    dep = parameter[dependencies[i]];
                }
                else {
                    var dependencyDetail;
                    dependencyDetail = utils.dependencyType(dependencies[i]);

                    switch (dependencyDetail.Type) {
                        case 'function':
                                dep = self.resolve(dependencies[i])();
                            break;
                        case 'text':
                            dep = self.getSource(dependencies[i]);
                            break;
                        case 'param':
                            dep = self.getSource(dependencies[i]);
                            break;
                    }
                }

                depInstance[i] = dep;
            }

            var fun = self.getSource(classType);

            return function () {
                var argumentsToInject = "";
                for (var property in depInstance) {
                    if (depInstance.hasOwnProperty(property)) {
                        if (argumentsToInject.length == 0) {
                            argumentsToInject = "depInstance[" + property + "]";
                        } else {
                            argumentsToInject = argumentsToInject.concat(",depInstance[" + property + "]");
                        }
                    }
                }
                var instanceOfObject = eval("new fun(" + argumentsToInject + ")");
                return instanceOfObject;
            };
        };

        self.getDependencies = function (classType) {
            var funct = self.getSource(classType);
            var dependencies = funct.toString().match(/^function\s*[^\(]*\(\s*([^\)]*)\)/m)[1].replace(/ /g, '').split(',');
            var stringify = dependencies.toString();
            if (stringify.length == 0) {
                return [];
            }
            return dependencies;
        }

        self.getSource = function (classType) {

            var typeNameSpace = self.getNameSpace(classType);
            var splitedNameSpace = typeNameSpace.split('.');
            var typePath = "";
            for (var j = 0; j < splitedNameSpace.length; j++) {
                if (j == 0) {
                    typePath = splitedNameSpace[j];
                } else {
                    typePath = typePath.concat("['" + splitedNameSpace[j] + "']");
                }
            }
            var source = eval(typePath);
            return source;
        };

        self.getNameSpace = function (classType) {
            var upperType = classType.toUpperCase();
            var stringDeps = self.depDictionary[upperType];
            if (typeof stringDeps === 'undefined') {
                throw "Type " + classType + " is not registered";
            }
            return stringDeps.path;
        }
    }

    return new Injector();

});

