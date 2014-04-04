var X = {
    defaultScope: this,

    isPrimitive: function (value) {
        var type = typeof value;

        return type === 'string' || type === 'number' || type === 'boolean';
    },

    getPropValue: function (o, getter) {
        return (getter instanceof Function) ? index(o) : !getter ? o : o ? o[getter] : o;
    },

    optPropValue: function (o, getter, fallback) {
        return (getter instanceof Function) ? index(o) : !getter ? o : o ? o[getter] : 0 === o ? 0 : fallback;
    },

    getPropGetter: function (getter) {
        return (getter instanceof Function) ? getter : !getter ? function (o) {
            return o;
        } : function (o) {
            return o[getter];
        };
    },

    getPropOptGetter: function (getter) {
        return (getter instanceof Function) ? getter : !getter ? function (o, fallback) {
            return 0 === o ? 0 : fallback;
        } : function (o, fallback) {
            return !o ? fallback : (o[getter] || fallback);
        };
    },

    projectProp: function (arr, getter, startIndex, lastIndex) {
        var fn = X.getPropGetter(getter);
        var len = lastIndex || arr.length;
        var ret = [];
        for (var i = startIndex || 0; i < len; i++)
            ret.push(fn(arr[i]));

        return ret;
    },

    applyTemplate: function (expr, props) {
        return new X.Template(expr).apply(props);
    }
};

(function () {
    var getCur = Date.now || function () {
            return new Date().getTime();
        },
        cur = getCur();
    X.__intervalCheck = function () {
        return -(cur - (cur = getCur()));
    };
})();

X.define = function (className, prototypeProps, constructor) {
    var pkgs = className.split('.');
    var simpleClassName = pkgs.pop();
    var pkgLen = pkgs.length;
    var tmp = X.defaultScope[pkgs[0]];

    // package 존재하는 지 체크
    if (!tmp) {
        // 존재하지 않음
        X.defaultScope[pkgs[0]] = tmp = {};
    }

    for (var i = 1; i < pkgLen; i++) {
        tmp[pkgs[i]] || (tmp[pkgs[i]] = {});
        tmp = tmp[pkgs[i]];
    }

    var construct = function () {
        var props = constructor.apply(this, arguments);
        for (var propName in props) {
            if (props.hasOwnProperty(propName)) {
                var prop = props[propName];
                this[propName] = prop;
            }
        }
    }

    tmp[simpleClassName] = construct;
    for (var propName in prototypeProps) {
        if (prototypeProps.hasOwnProperty(propName)) {
            var prop = prototypeProps[propName];
            construct.prototype[propName] = prop;
        }
    }
}