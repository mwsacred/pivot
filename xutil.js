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

    getConstantGetter: function (val) {
        return function () {
            return val;
        } // CHECK closure 생성.
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
    },

    getParentElementByTagName: function (elem, name) {
        var cur = elem.parentNode;
        while (cur.tagName.toUpperCase() !== name.toUpperCase()) {
            cur = cur.parentNode;
        }

        return cur;
    },

    getDragBackgroundHelper: function (elem, populating) {
        var body = document.getElementById('body');
        var bgHelper = body.__mousemoveHelper;
        if (!bgHelper) {
            var wrap = document.createElement('div');
            wrap.insertAdjacentHTML('beforeend',
                X.applyTemplate(
                    '<div id={bgId} style="position: fixed; top: 0px; left: 0px; width: 10000px; height: 10000px; z-index: {z_index}">' +
                        '</div>',
                    {
                        bgId: "__mousemoveHelper",
                        z_index: elem.style.zIndex || 0 // TODO elem의 z-index보다 크거나 같은?
                    }))
            var source = wrap.lastChild;
            bgHelper = body.__mousemoveHelper = source.cloneNode(true);
            if (populating) {
                body.appendChild(bgHelper);
            }
        } else {
            if (populating && bgHelper !== body.lastChild) {
                body.appendChild(bgHelper);
            }
        }
        return bgHelper;
    },

    // TODO self destroy 함수 있어야 함
    // TODO deltaLeft, deltaRight, deltaTop, deltaBottom 등 필요
    populateSizeIndicator: function (elem, topElem, rightElem, bottomElem, leftElem) {
        var bgHelper = X.getDragBackgroundHelper(elem, true);
        var topRect = topElem.getBoundingClientRect(),
            leftRect = leftElem.getBoundingClientRect(),
            rightRect = rightElem.getBoundingClientRect(),
            bottomRect = bottomElem.getBoundingClientRect();

        var props = {
            bgId: 'tt',
            top: topRect.top,
            left: leftRect.left,
            width: rightRect.right - leftRect.left,
            height: bottomRect.bottom - topRect.top
        };

        var helper = X.applyTemplate(
            '<div style="position: fixed; background-color: deepskyblue; opacity: 0.5; top: {top}px; left: {left}px; width: {width}px; height: {height}px; z-index: 1000" />', props);
        console.log('locate');

        bgHelper.insertAdjacentHTML('beforeend', helper);
        return bgHelper.lastChild;
    },

    EMPTY_FN: function () {
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

X.initPackage = function (className) {
    var pkgs = className.split('.');
    var simpleClassName = pkgs.pop();
    var pkgLen = pkgs.length;
    var ret = X.defaultScope[pkgs[0]];

    // package 존재하는 지 체크
    if (!ret) {
        // 존재하지 않음
        X.defaultScope[pkgs[0]] = ret = {};
    }

    for (var i = 1; i < pkgLen; i++) {
        ret[pkgs[i]] || (ret[pkgs[i]] = {});
        ret = ret[pkgs[i]];
    }

    return ret;
};

X.predefine = function (className, constructor) {
    var simpleClassName = className.split('.').pop();
    var pkg = X.initPackage(className);
    var construct;

    if (constructor) {
        construct = function () {
            var props = constructor.apply(this, arguments);
            for (var propName in props) {
                if (props.hasOwnProperty(propName)) {
                    var prop = props[propName];
                    this[propName] = prop;
                }
            }
        };
    } else {
        construct = function () {
        };
    }

    pkg[simpleClassName] = construct;
    return construct;
};

X.applyPrototype = function (construct, prototypeProps) {
    for (var propName in prototypeProps) {
        if (prototypeProps.hasOwnProperty(propName)) {
            var prop = prototypeProps[propName];
            construct.prototype[propName] = prop;
        }
    }
};

X.define = function (className, prototypeProps, constructor) {
    var construct = X.predefine(className, constructor);
    X.applyPrototype(construct, prototypeProps);
    return construct;
};

X.extend = function (className, superClass, prototypeProps, constructor) {
    'string' === typeof superClass && (superClass = eval(superClass));
    var construct = X.predefine(className, constructor);

    function createObject(proto) {
        function ctor() {
        }

        ctor.prototype = proto;
        return new ctor();
    }

    construct.prototype = createObject(superClass.prototype);
    X.applyPrototype(construct, prototypeProps);
    construct.prototype.constructor = construct;

    return construct;
};