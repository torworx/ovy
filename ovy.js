//noinspection ThisExpressionReferencesGlobalObjectJS
(function (context) {

    var Ovy = {};
    (function () {
        var AUTO_ID = 1000,
            objectPrototype = Object.prototype,
            toString = objectPrototype.toString,
            CLASS_RESERVED_KEYS = {$classname:1, mixinId:1, $mixinId:1, $super:1, $superclass:1},
            CONFIG_RESERVED_KEYS = {extend:1, constructor:1, singleton:1, statics:1, mixins:1, inherits:1},
            TemplateClass = function(){};

        function getAutoId(prefiex) {
            return (prefiex ? prefiex.toString() : '') + (++AUTO_ID);
        }

        Ovy.apply = function (object, config, filter) {
            if (object && config && typeof config === 'object') {
                var key;

                for (key in config) {
                    if (!filter || !filter[key]) {
                        object[key] = config[key];
                    }
                }
            }
            return object;
        };

        Ovy.apply(Ovy, {

            isEmpty:function (value, allowEmptyString) {
                return (value === null) || (value === undefined) || (!allowEmptyString ? value === '' : false) || (Ovy.isArray(value) && value.length === 0);
            },

            isArray:('isArray' in Array) ? Array.isArray : function (value) {
                return toString.call(value) === '[object Array]';
            },

            isFunction:function (value) {
                return value && typeof value === 'function';
            },

            isObject:function (value) {
                return value && typeof value === 'object';
            },

            isSimpleObject:function (value) {
                return value instanceof Object && value.constructor === Object;
            },

            isPrimitive:function (value) {
                var type = typeof value;

                return type === 'string' || type === 'number' || type === 'boolean';
            },

            isNumber:function (value) {
                return typeof value === 'number' && isFinite(value);
            },

            isNumeric:function (value) {
                return !isNaN(parseFloat(value)) && isFinite(value);
            },

            isString:function (value) {
                return typeof value === 'string';
            },

            isBoolean:function (value) {
                return typeof value === 'boolean';
            },

            isDefined:function (value) {
                return typeof value !== 'undefined';
            }
        });

        Ovy.apply(Ovy, {

            applyIf:function (object, config, filter) {
                var property;

                if (object) {
                    for (property in config) {
                        if (!filter || !filter.hasOwnProperty(property)) {
                            if (object[property] === undefined) {
                                object[property] = config[property];
                            }
                        }
                    }
                }

                return object;
            },

            merge:function (destination) {
                var i = 1,
                    ln = arguments.length,
                    mergeFn = Ovy.merge,
                    cloneFn = Ovy.clone,
                    object, key, value, sourceKey;

                for (; i < ln; i++) {
                    object = arguments[i];

                    for (key in object) {
                        value = object[key];
                        if (value && value.constructor === Object) {
                            sourceKey = destination[key];
                            if (sourceKey && sourceKey.constructor === Object) {
                                mergeFn(sourceKey, value);
                            }
                            else {
                                destination[key] = cloneFn(value);
                            }
                        }
                        else {
                            destination[key] = value;
                        }
                    }
                }

                return destination;
            },

            clone:function (item) {
                var type,
                    i,
                    clone,
                    key;

                if (item === null || item === undefined) {
                    return item;
                }

                type = toString.call(item);

                // Date
                if (type === '[object Date]') {
                    return new Date(item.getTime());
                }

                // Array
                if (type === '[object Array]') {
                    i = item.length;

                    clone = [];

                    while (i--) {
                        clone[i] = Ovy.clone(item[i]);
                    }
                }
                // Object
                else if (type === '[object Object]' && item.constructor === Object) {
                    clone = {};

                    for (key in item) {
                        clone[key] = Ovy.clone(item[key]);
                    }
                }

                return clone || item;
            },

            chain: function (object) {
                TemplateClass.prototype = object;
                var result = new TemplateClass();
                TemplateClass.prototype = null;
                return result;
            }
        });

//        var ALL_RESERVED_KEYS = Ovy.merge({}, CLASS_RESERVED_KEYS, CONFIG_RESERVED_KEYS);

        function Base() {
        }

        function define(className, data) {
            var hasClassName = Ovy.isString(className);
            if (!data) data = (hasClassName ? {} : className) || {};

            if (className) {
                data.$classname = className;
            } else {
                data.$classname = null;
            }

            var _extend = data.extend,
                Parent;
            if (_extend && !Ovy.isObject(_extend)) {
                Parent = _extend;
            } else {
                Parent = Base;
            }
            return extend(Parent, data);
        }

        function makeCtor(parent) {
            if (parent.constructor === Object) {
                return function(){};
            } else {
                return function() {
                    parent.constructor.apply(this, arguments);
                }
            }
        }

        function extend(parentClass, data) {
            var parent = parentClass.prototype,
                prototype = Ovy.chain(parent),
                body = (Ovy.isFunction(data) ? data.call(prototype, parentClass, parent) : data) || {},
                cls;

            if (Ovy.isFunction(body)) {
                cls = body;
            } else if (body.constructor !== Object) {
                cls = body.constructor;
            } else {
                cls = makeCtor(parent);
            }

            prototype.constructor = cls;
            cls.prototype = prototype;

            // the '$super' property of class refers to its super prototype
            cls.$super = parent;
            // the '$superclass' property of class refers to its super class
            cls.$superclass = parentClass;

            if (typeof body === 'object') {
                process(cls, body, prototype);
                if (body.singleton) {
                    cls = new cls();
                }
            }

            return cls;
        }

        function process(targetClass, data, targetPrototype) {
            var prototype = targetPrototype || targetClass.prototype,
                statics = data.statics,
                mixins = data.mixins,
                inherits = data.inherits,
                key;

            if (statics) {
                // copy static properties from statics to class
                Ovy.apply(targetClass, statics);
            }
            if (mixins) {
                processMixins(targetClass, mixins, targetPrototype)
            }
            if (inherits) {
                processInherits(targetClass, inherits, targetPrototype);
            }

            Ovy.apply(prototype, data, CONFIG_RESERVED_KEYS);

            if (data.toString !== Object.prototype.toString) {
                prototype.toString = data.toString;
            }
        }

        function processInherits(targetClass, inherits, targetPrototype) {
            var i, ln;

            if (!targetPrototype) {
                targetPrototype = targetClass.prototype;
            }

            if (inherits instanceof Array) {
                for (i = 0, ln = inherits.length; i < ln; i++) {
                    mixin(targetClass, null, inherits[i], targetPrototype);
                }
            }
            else {
                for (var mixinName in inherits) {
                    if (inherits.hasOwnProperty(mixinName)) {
                        mixin(targetClass, null, inherits[mixinName], targetPrototype);
                    }
                }
            }
        }

        function processMixins(targetClass, mixins, targetPrototype) {
            var name, item, i, ln;

            if (!targetPrototype) {
                targetPrototype = targetClass.prototype;
            }

            if (mixins instanceof Array) {
                for (i = 0, ln = mixins.length; i < ln; i++) {
                    item = mixins[i];
                    name = item.prototype.mixinId || item.$mixinId;
                    if (!name) {
                        name = item.$mixinId = getAutoId('mixin_');
                    }

                    mixin(targetClass, name, mixin, targetPrototype);
                }
            }
            else {
                for (var mixinName in mixins) {
                    if (mixins.hasOwnProperty(mixinName)) {
                        mixin(targetClass, mixinName, mixins[mixinName], targetPrototype);
                    }
                }
            }
        }

        function mixin(target, name, mixinClass, targetPrototype) {
            var mixin = mixinClass.prototype,
                prototype = targetPrototype || target.prototype,
                key;

            if (name) {
                if (!prototype.hasOwnProperty('mixins')) {
                    if ('mixins' in prototype) {
                        prototype.mixins = Ovy.chain(prototype.mixins);
                    }
                    else {
                        prototype.mixins = {};
                    }
                }
            }

            for (key in mixin) {
                if (name && (key === 'mixins')) {
                    Ovy.merge(prototype.mixins, mixin[key]);
                }
                else if (typeof prototype[key] == 'undefined' && key != 'mixinId') {
                    prototype[key] = mixin[key];
                }
            }
            if (name) {
                prototype.mixins[name] = mixin;
            }
        }

        // expose oop functions
        Ovy.apply(Ovy, {
            define:define,
            extend:extend,
            mixins:function(targetClass, mixins) {
                return processMixins(targetClass, mixins);
            },
            inherits:function(targetClass, inherits) {
                return processInherits(targetClass, inherits);
            }
        })

    }());

    if (typeof module !== "undefined" && module.exports) {              // NodeJS/CommonJS
        module.exports = Ovy;
    } else {
        var _Ovy = context.Ovy;                                         // save current Class namespace
        context.Ovy = Ovy;                                              // bind Class and Ovy to global scope
        Ovy.noConflict = function () {
            if (context.Ovy === Ovy) {
                context.Ovy = _Ovy;
            }
            return Ovy;
        }
    }

})(this);