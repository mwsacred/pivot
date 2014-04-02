X.define('X.Template', {
    apply: function (props) {
        var constants = this.constants;
        var vars = this.vars;
        var len = constants.length;

        var ret = [];
        for (var i = 0; i < len; i++) {
            ret.push(constants[i] || props[vars[i]]);
        }

        return ret.join('');
    },

    eval: function (props) {

    }
}, function (expr) {
    var constants = [];
    var vars = [];
    var curVar;
    var oldIdx = 0;
    var curIdx = 0;
    var curFn = parse;

    function parseVar() {
        oldIdx = curIdx + 1;
        curIdx = expr.indexOf('}', curIdx);

        curVar = expr.substring(oldIdx, -1 != curIdx ? curIdx : undefined);
        constants.push(null);
        vars.push(curVar);

        curIdx++;
        curFn = parse;

        return -1 != curIdx;
    }

    function parse() {
        oldIdx = curIdx;
        curIdx = expr.indexOf('{', curIdx);

        var constant = expr.substring(oldIdx, -1 != curIdx ? curIdx : undefined);
        constants.push(constant);
        vars.push(null);

        curFn = parseVar;

        return -1 != curIdx;
    }

    while (curFn());

    return {
        constants: constants,
        vars: vars
    };
});