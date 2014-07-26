Thinking
=====
>1.  superego, ego, ...
>2.  context, word: 순서가 있는 하나 이상의 word들이 context를 구성
>3.  laws: word와 설정될 properties의 집합 map
>4.  synonyms
>5.  subject, tag(word)
>6.  C.define - context 정의, C.create - define된 context 생성, C.create(...).on - anonymous context 생성

in Resizer:

    // subject: targetDom (default), main ctx: exeCtx, temp ctx: evt...
    // ctx들은 verb args
    on({ tag: 'mousedown' })

    // tag: right, verb: function...
    .on({'right': function(ctx, prevCtxs, evt) { // evt도 ctx 중 하나
        ctx.minWidth = target.offsetWidth;
    }})
    .on('mousemove': function(ctx, prevCtxs, evt) {
        ctx.guideDom.width = ....
    })
    ;


in laws:

    // subject: envCtx (default), tag: function(ctx) { return ctx.tag == 'mousedown'; }, main ctx: fnPlanner, envCtx
    var mousedown = on('mousedown', function(contextManager, planner, ctx) {
        var task = planner.appendTask();
        // TODO 텍스트 선택 방지용 layer 추가
        ctx.subject.addEventListener(ctx.tag, task.fn);
        task.appendContext(ctx);
        return task;
    });

    var findWrappingDiv = function(elem) {
        var ret = X.getParentElementByTagName(elem, 'div');
        if(!ret.__mousemoveHelper) {
            var props = {};
            ret.insertAdjacentHTML('beforeend',
                               X.applyTemplate('<div id={bgId} style="position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; z-index: -9999">' +
                                   '<div style="position: absolute; background-color: deepskyblue; opacity: 0.5; top: {top}; left: {left}; width: {width}; height: {height}" />' +
                                   '</div>', props));
        }
    };

    mousedown.on('right', function(contextManager, planner, ctx) {
        var task = planner.currentTask();
        var fn = task.createFn(ctx);

        task.appendFn(function(evt) {
            var elem = evt.target;
            var diff = elem.offsetWidth - e.x;
            if(10 >= diff) {
                fn(evt);
            }
        });
    })
    ;

