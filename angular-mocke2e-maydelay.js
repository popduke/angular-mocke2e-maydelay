/**
 * Enhance $httpBackend in ngMockE2E to support mock delayed http response by arbitrary time
 * @link https://github.com/popduke/angular-mocks-maydelay.git
 * @author Yonny Hao <popduke@gmail.com>
 * @license MIT License
 */
(function (angular, window, undefined) {
    'use strict';
    angular.module('mayDelay', ['ngMockE2E'])
        .config(function ($provide) {
            $provide.decorator('$httpBackend', function ($delegate, $timeout) {
                    var delegate = {"when": $delegate.when, "expect": $delegate.expect};
                    var pop = Array.prototype.pop;
                    var defs = [];
                    //same matching process as $httpBackend
                    var match = function (m, u, d, h) {
                        for (var i = -1; ++i < defs.length;) {
                            if (defs[i][0] == m && matchUrl(defs[i][1], u) && (!angular.isDefined(d) || matchData(defs[i][2], d)) && (!angular.isDefined(h) || matchHeaders(defs[i][3], h))) {
                                return {delay: defs[i][4], passThrough: defs[i][5]};
                            }
                        }
                    };
                    var matchUrl = function (url, u) {
                        if (!url) return true;
                        if (angular.isFunction(url.test))return url.test(u);
                        if (angular.isFunction(url))return url(u);
                        return url == u;
                    };
                    var matchHeaders = function (headers, h) {
                        if (angular.isUndefined(headers))return true;
                        if (angular.isFunction(headers)) return headers(h);
                        return angular.equals(headers, h);
                    }
                    var matchData = function (data, u) {
                        if (angular.isUndefined(data)) return true;
                        if (data && angular.isFunction(data.test)) return data.test(d);
                        if (data && angular.isFunction(data)) return data(d);
                        if (data && !angular.isString(data)) {
                            return angular.equals(angular.fromJson(angular.toJson(data)), angular.fromJson(d));
                        }
                        return data == d;
                    }
                    var proxy = function (method, url, data, callback, headers) {
                        var d = match(method, url, data, headers);
                        if (!d || d.passThrough || !d.delay) {
                            return $delegate.call(this, method, url, data, callback, headers);
                        }
                        if (d.delay > 0) {
                            var interceptor = function () {
                                var self = this,
                                    args = arguments;
                                $timeout(function () {
                                    callback.apply(self, args);
                                }, d.delay);
                            };
                            return $delegate.call(this, method, url, data, interceptor, headers);
                        }
                    };

                    for (var key in $delegate) {
                        if (key === 'when' || key === 'expect') {
                            proxy[key] = $delegate[key] = function (method, url, data, headers) {
                                var def = [method, url, data, headers, 0, undefined];
                                var chain = delegate[key].call($delegate, method, url, data, headers);
                                defs.push(def);
                                var ret = {
                                    respond: function () {
                                        if ((arguments.length > 2 || !angular.isNumber(arguments[0])) && angular.isNumber(arguments[arguments.length - 1])) {
                                            var delayMS = pop.call(arguments);
                                            if (delayMS > 0) {
                                                def[4] = delayMS;
                                                def[5] = undefined;
                                            }
                                        } else {
                                            def[4] = 0;
                                            def[5] = undefined;
                                        }
                                        chain.respond.apply(chain, arguments);
                                        return ret;
                                    },
                                    passThrough: function () {
                                        def[4] = 0;
                                        def[5] = true;
                                        chain.passThrough.apply(chain);
                                        return ret;
                                    }
                                }
                                return ret;
                            };
                        }
                        else {
                            proxy[key] = $delegate[key];
                        }
                    }
                    return proxy;
                }
            );
        });
})(window.angular, window, undefined);
