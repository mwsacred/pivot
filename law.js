/**
 * Created by user on 14. 5. 21.
 */
X.define('C.AbstractContext', {
    _on: function (cm, ruleSeed) {
        var ret;
        var ruleContext = this.ruleContext;
        if (ruleSeed.tag) {
            var tags = ruleSeed.tag instanceof Array ? ruleSeed.tag : [ruleSeed.tag];
            var subj = ruleSeed.subject || (ruleSeed.subject = this.subject);
            var len = tags.length - 1;
            var i = 0;
            for (; i < len; i++) {
                var tag = tags[i];
                var tmp = ruleContext.weave(cm, cm.taskPlanner, {tag: tag, subject: subj, verb: X.EMPTY_FN});
                ruleContext = tmp.ruleContext;
            }
            ret = ruleContext.weave(cm, cm.taskPlanner, {tag: tags[i], subject: subj, verb: ruleSeed.verb});
        } else if (ruleSeed.tagset) {
            var tags = ruleSeed.tagset instanceof Array ? ruleSeed.tagset : [ruleSeed.tagset];
            var subj = ruleSeed.subject || (ruleSeed.subject = this.subject);
            var len = tags.length;
            var i = 0;
            var contexts = [];
            var curRuleContext = this.ruleContext;
            for (; i < len; i++) {
                var tag = tags[i];
                var tmp = curRuleContext.weave(cm, cm.taskPlanner, {tag: tag, subject: subj, verb: ruleSeed.verb});
                contexts.push(tmp);
            }
            ret = new C.ContextGroup(cm, contexts);
        }
        return ret;
    }
}, function(ruleContext) {
    return {
      ruleContext: ruleContext
    };
});

X.extend('C.Context', C.AbstractContext, {
    on: function (ruleSeed) {
        return this._on(this.contextManager, ruleSeed);
    }
}, function (contextManager, ruleContext, seed) {
    C.AbstractContext.call(this, ruleContext);

    if (!seed.hasOwnProperty('tag')) {
        for (var prop in seed) {
            if (seed.hasOwnProperty(prop) && 'function' === typeof seed[prop]) {
                seed = { tag: prop, verb: seed[prop] };
                break;
            }
        }
    }

    return {
        contextManager: contextManager,
        subject: seed.subject,
        tag: seed.tag,
        verb: seed.verb
    };
});

X.extend('C.ContextGroup', 'C.AbstractContext', {
    on: function (ruleSeed) {
        var contexts = [];
        for (var i = 0; i < this.contexts.length; i++) {
            contexts.push(this.contexts[i]._on(this.contextManager, ruleSeed));
            // 위에서 ContextGroup이 리턴되면 다음에 이 ruleContext는 쓰이지 않음
        }
        return new C.ContextGroup(this.contextManager, contexts);
    }
}, function (contextManager, contexts) {

    return {
        contextManager: contextManager,
        contexts: contexts || []
    };
});

X.extend('C.ContextManager', C.AbstractContext, {
    on: function (ruleSeed) {
        return this._on(this, ruleSeed);
    }
}, function () {
    C.AbstractContext.call(this, C.Law);
    var contexts = [];
    return {
        contexts: contexts,
        currentRuleContext: C.Law,
        taskPlanner: new C.TaskPlanner()
    };
});

X.define('C.Task', {
    createFn: function (ctx) {
        return function () {
            ctx.verb.apply(ctx.subject, arguments);
        }
    },
    appendContext: function (ctx) {
        this.appendFn(this.createFn(ctx));
    },
    appendFn: function (fn) {
        this.stepFns.push(fn);
    }
}, function (prev) {
    var me = this;
    return {
        contextMap: {},
        stepFns: [],
        prev: prev,
        fn: function () {
            var steps = me.stepFns;
            for (var i = 0; i < steps.length; i++) {
                steps[i].apply(null, arguments);
            }
        }
    };
});

X.define('C.TaskPlanner', {
    appendTask: function (tag) {
        var task = new C.Task(this.getCurrentTask());
        this.stepTasks.unshift(task);
        if (tag) {
            var tagTasks = this.tagTaskMap[tag];
            if (!tagTasks) {
                this.tagTaskMap[tag] = [task];
            } else {
                tagTasks.push(task);
            }
        }
        return task;
    },

    getTaskAtTag: function (tag, idx) {
        idx || (idx = 0);
        var tasks = this.tagTaskMap[tag];
        return tasks ? tasks[idx] : null;
    },

    getTaskBeforeTag: function (tag, idx) {
        idx || (idx = 0);
        var tasks = this.tagTaskMap[tag];
        return tasks ? tasks[idx].prev : null;
    },

    getCurrentTask: function () {
        return this.stepTasks[0];
    }

}, function () {
    return {
        stepTasks: [],
        tagTaskMap: {}
    };
});

X.define('C.RuleContext', {
    on: function (ruleSeed) {
        var ret = new C.RuleContext(this, ruleSeed);
        var tag = ret.tag;
        this.rules[tag] = ret;
        return ret;
    },

    weave: function (contextManager, planner, envCtx) {
        var me = this;
        var tag = envCtx.tag
        var cur = me;
        var ruleCtx;

        while (!ruleCtx) {
            ruleCtx = cur.rules[tag];
            cur = cur.upperRule;
        }

        if (ruleCtx) {
            ruleCtx.verb(contextManager, planner, envCtx);
        }

        var nextRuleCtx = ruleCtx || me;
        return new C.Context(contextManager, nextRuleCtx, envCtx);
    }
}, function (upper, seed) {
    if (!seed.hasOwnProperty('tag')) {
        for (var prop in seed) {
            if (seed.hasOwnProperty(prop) && 'function' === typeof seed[prop]) {
                seed = { tag: prop, verb: seed[prop] };
                break;
            }
        }
    }

    return {
        upperRule: upper,
        rules: {},
        tag: seed.tag,
        verb: seed.verb
    };
});

X.define('C.Law', {
    on: function (ruleSeed) {
        var ret = new C.RuleContext(this, ruleSeed);
        var tag = ret.tag;
        this.rules[tag] = ret;
        ret.subject || (ret.subject = this.subject);
        return ret;
    },

    weave: function (contextManager, planner, envCtx) {
        var me = this;
        var tag = envCtx.tag
        var cur = me;
        var ruleCtx;

        while (!ruleCtx) {
            ruleCtx = cur.rules[tag];
            cur = cur.upperRule;
        }

        if (ruleCtx) {
            ruleCtx.verb(contextManager, planner, envCtx);
        }

        var nextRuleCtx = ruleCtx || me;
        return new C.Context(contextManager, nextRuleCtx, envCtx);
    }
}, function () {
    var rules = this.rules = {};
    var mousedown = this
        .on({'mousedown': function (contextManager, planner, ctx) {
            var task = planner.appendTask(ctx.tag);
            // TODO 텍스트 선택 방지용 layer 추가
            ctx.subject.addEventListener(ctx.tag, task.fn);
            task.appendContext(ctx);
        }});

    var findWrappingDiv = function (elem) {
        var ret = X.getParentElementByTagName(elem, 'body');
        if (!ret.__mousemoveHelper) {
            ret.insertAdjacentHTML('beforeend',
                X.applyTemplate(
                    '<div id={bgId} style="position: fixed; background-color: deepskyblue; opacity: 0; top: 0px; left: 0px; width: 10000px; height: 10000px; z-index: {z_index}">' +
                        '</div>',
                    {
                        bgId: "__mousemoveHelper",
                        z_index: elem.style.zIndex || 0 // TODO elem의 z-index보다 크거나 같은?
                    }));
            ret.__mousemoveHelper = ret.lastChild;
        } else {
            ret.appendChild(ret.__mousemoveHelper);
        }

        return ret;
    };

    mousedown
        .on({'left': function (contextManager, planner, ctx) {
            var task = planner.getCurrentTask();
            var newTask = planner.appendTask(ctx.tag);
            newTask.appendContext(ctx);

            task.appendFn(function (evt) {
                var elem = evt.target;
                var diff = evt.clientX - elem.getBoundingClientRect().left;
                if (10 >= diff) {
                    newTask.fn(evt);
                }
            });
        }});

    mousedown
        .on({'right': function (contextManager, planner, ctx) {
            var task = planner.getCurrentTask();
            var newTask = planner.appendTask(ctx.tag);
            newTask.appendContext(ctx);

            task.appendFn(function (evt) {
                var elem = evt.target;
                var diff = elem.getBoundingClientRect().right - evt.clientX;
                if (10 >= diff) {
                    newTask.fn(evt);
                }
            });
        }});

    mousedown
        .on({'mousemove': function (contextManager, planner, ctx) {
            var task = planner.getCurrentTask();
            var newTask = planner.appendTask(ctx.tag);
            newTask.appendContext(ctx);
            task.appendFn(function (evt) {
                var elem = evt.target;
                var div = findWrappingDiv(elem);
                var baseX = elem.getBoundingClientRect().left;
                var baseY = elem.getBoundingClientRect().top;
                var f = function (moveEvt) {
                    var adjustedEvt = { target: elem, clientX: moveEvt.clientX - baseX, clientY: moveEvt.clientY - baseY };
                    newTask.fn(adjustedEvt); // 호출할 때는 __mousemoveHelper 기준의 위치가 아니라 elem 기준
                };
                div.addEventListener(ctx.tag, f);
                div.addEventListener('mouseup', function () {
                    div.removeEventListener(ctx.tag, f);
                });
            });
        }})
        .on({'mouseup': function (contextManager, planner, ctx) {
            var task = planner.getTaskBeforeTag('mousemove');
            var newTask = planner.appendTask(ctx.tag);
            newTask.appendContext(ctx);
            task.appendFn(function (evt) {
                var elem = evt.target;
                var div = findWrappingDiv(elem);
                var baseX = elem.getBoundingClientRect().left;
                var baseY = elem.getBoundingClientRect().top;
                var f = function (moveEvt) {
                    var adjustedEvt = { target: elem, clientX: moveEvt.clientX - baseX, clientY: moveEvt.clientY - baseY };
                    div.removeEventListener(ctx.tag, f);
                    if (div.lastChild === div.__mousemoveHelper) {
                        div.removeChild(div.__mousemoveHelper);
                    }
                    newTask.fn(adjustedEvt); // 호출할 때는 __mousemoveHelper 기준의 위치가 아니라 elem 기준
                };
                div.addEventListener(ctx.tag, f);
            });
        }})
    ;

    return {
        rules: rules
    };
});

C.Law = new C.Law();