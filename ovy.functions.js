(function (context) {

    var ovy = context.ovy || require('./ovy'),
        arrays = ovy.arrays || require('./ovy.arrays');

    var functions;

    functions = ovy.functions = {

        /**
         * A very commonly used method throughout the framework. It acts as a wrapper around another method
         * which originally accepts 2 arguments for `name` and `value`.
         * The wrapped function then allows "flexible" value setting of either:
         *
         * - `name` and `value` as 2 arguments
         * - one single object argument with multiple key - value pairs
         *
         * For example:
         *
         *     var setValue = ovy.functions.flexSetter(function(name, value) {
         *         this[name] = value;
         *     });
         *
         *     // Afterwards
         *     // Setting a single name - value
         *     setValue('name1', 'value1');
         *
         *     // Settings multiple name - value pairs
         *     setValue({
         *         name1: 'value1',
         *         name2: 'value2',
         *         name3: 'value3'
         *     });
         *
         * @param {Function} fn
         * @returns {Function} flexSetter
         */
        flexSetter: function (fn) {
            return function (object, a, b) {
                var k;

                if (a === null) {
                    return this;
                }

                if (typeof a !== 'string') {
                    for (k in a) {
                        if (a.hasOwnProperty(k)) {
                            fn.call(object, k, a[k]);
                        }
                    }

                } else {
                    fn.call(object, a, b);
                }

                return this;
            };
        },
        /**
         * Create a new function from the provided `fn`, change `this` to the provided scope, optionally
         * overrides arguments for the call. (Defaults to the arguments passed by the caller)
         *
         * {@link ovy#bind ovy.bind} is alias for {@link ovy.functions#bind ovy.functions.bind}
         *
         * @param {Function} fn The function to delegate.
         * @param {Object} scope (optional) The scope (`this` reference) in which the function is executed.
         * **If omitted, defaults to the default global environment object (usually the browser window).**
         * @param {Array} args (optional) Overrides arguments for the call. (Defaults to the arguments passed by the caller)
         * @param {Boolean/Number} appendArgs (optional) if True args are appended to call args instead of overriding,
         * if a number the args are inserted at the specified position
         * @return {Function} The new function
         */
        bind: function(fn, scope, args, appendArgs) {
            if (arguments.length === 2) {
                return function() {
                    return fn.apply(scope, arguments);
                };
            }

            var method = fn,
                slice = Array.prototype.slice;

            return function() {
                var callArgs = args || arguments;

                if (appendArgs === true) {
                    callArgs = slice.call(arguments, 0);
                    callArgs = callArgs.concat(args);
                }
                else if (typeof appendArgs == 'number') {
                    callArgs = slice.call(arguments, 0); // copy arguments first
                    arrays.insert(callArgs, appendArgs, args);
                }

                return method.apply(scope || ovy.global, callArgs);
            };
        },
        /**
         * Create a new function from the provided `fn`, the arguments of which are pre-set to `args`.
         * New arguments passed to the newly created callback when it's invoked are appended after the pre-set ones.
         * This is especially useful when creating callbacks.
         *
         * For example:
         *
         *     var originalFunction = function(){
     *         alert(ovy.arrays.from(arguments).join(' '));
     *     };
         *
         *     var callback = ovy.functions.pass(originalFunction, ['Hello', 'World']);
         *
         *     callback(); // alerts 'Hello World'
         *     callback('by Me'); // alerts 'Hello World by Me'
         *
         * {@link ovy#pass ovy.pass} is alias for {@link ovy.functions#pass ovy.functions.pass}
         *
         * @param {Function} fn The original function
         * @param {Array} args The arguments to pass to new callback
         * @param {Object} scope (optional) The scope (`this` reference) in which the function is executed.
         * @return {Function} The new callback function
         */
        pass: function(fn, args, scope) {
            if (!ovy.isArray(args)) {
                if (ovy.isIterable(args)) {
                    args = arrays.clone(args);
                } else {
                    args = args !== undefined ? [args] : [];
                }
            }

            return function() {
                var fnArgs = [].concat(args);
                fnArgs.push.apply(fnArgs, arguments);
                return fn.apply(scope || this, fnArgs);
            };
        },
        /**
         * Create an alias to the provided method property with name `methodName` of `object`.
         * Note that the execution scope will still be bound to the provided `object` itself.
         *
         * @param {Object/Function} object
         * @param {String} methodName
         * @return {Function} aliasFn
         */
        alias: function (object, methodName) {
            return function () {
                return object[methodName].apply(object, arguments);
            };
        },

        /**
         * Create a "clone" of the provided method. The returned method will call the given
         * method passing along all arguments and the "this" pointer and return its result.
         *
         * @param {Function} method
         * @return {Function} cloneFn
         */
        clone: function(method) {
            return function() {
                return method.apply(this, arguments);
            };
        },

        /**
         * Calls this function after the number of millseconds specified, optionally in a specific scope. Example usage:
         *
         *     var sayHi = function(name){
     *         alert('Hi, ' + name);
     *     }
         *
         *     // executes immediately:
         *     sayHi('Fred');
         *
         *     // executes after 2 seconds:
         *     ovy.functions.defer(sayHi, 2000, this, ['Fred']);
         *
         *     // this syntax is sometimes useful for deferring
         *     // execution of an anonymous function:
         *     ovy.functions.defer(function(){
     *         alert('Anonymous');
     *     }, 100);
         *
         * {@link ovy#defer ovy.defer} is alias for {@link ovy.functions#defer ovy.functions.defer}
         *
         * @param {Function} fn The function to defer.
         * @param {Number} millis The number of milliseconds for the setTimeout call
         * (if less than or equal to 0 the function is executed immediately)
         * @param {Object} scope (optional) The scope (`this` reference) in which the function is executed.
         * **If omitted, defaults to the browser window.**
         * @param {Array} args (optional) Overrides arguments for the call. (Defaults to the arguments passed by the caller)
         * @param {Boolean/Number} appendArgs (optional) if True args are appended to call args instead of overriding,
         * if a number the args are inserted at the specified position
         * @return {Number} The timeout id that can be used with clearTimeout
         */
        defer: function(fn, millis, scope, args, appendArgs) {
            fn = functions.bind(fn, scope, args, appendArgs);
            if (millis > 0) {
                return setTimeout(fn, millis);
            }
            fn();
            return 0;
        }
    }

    ovy.apply(functions, {

        /**
         * Create aliases for existing prototype methods. Example:
         *
         *     var MyCoolClass = ovy.define('MyCoolClass', {
         *         method1: function() { ... },
         *         method2: function() { ... }
         *     });
         *
         *     var test = new MyCoolClass();
         *
         *     ovy.functions.createAlias(MyCoolClass, {
         *         method3: 'method1',
         *         method4: 'method2'
         *     });
         *
         *     test.method3(); // test.method1()
         *
         *     ovy.functions.createAlias(MyCoolClass, 'method5', 'method3');
         *
         *     test.method5(); // test.method3() -> test.method1()
         *
         * @param {String/Object} alias The new method name, or an object to set multiple aliases. See
         * {@link ovy.functions#flexSetter flexSetter}
         * @param {String/Object} origin The original method name
         * @static
         * @method
         */
        createAlias: functions.flexSetter(function(alias, origin) {
            this.prototype[alias] = function() {
                return this[origin].apply(this, arguments);
            };
        })
    });

    /**
     * @method
     * @member ovy
     * @inheritdoc ovy.functions#defer
     */
    ovy.defer = functions.alias(functions, 'defer');

    /**
     * @method
     * @member ovy
     * @inheritdoc ovy.functions#pass
     */
    ovy.pass = functions.alias(functions, 'pass');

    /**
     * @method
     * @member ovy
     * @inheritdoc ovy.functions#bind
     */
    ovy.bind = functions.alias(functions, 'bind');

    if (typeof module !== "undefined" && module.exports) {
        module.exports = functions;
    }

})(this)
