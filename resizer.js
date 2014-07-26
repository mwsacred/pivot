/* TODO grouping th 조절을 두 번 연속하면 오작동
 TODO px 기본으로만 동작하게끔 되어 있음.*/
X.define('X.Resizer', {
    locate: function (elem, topElem, rightElem, bottomElem, leftElem) {
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

        bgHelper.insertAdjacentHTML('beforeend', helper);
        this.indicator = bgHelper.lastChild;
        this.tmpLeft = this.indicator.offsetLeft;
        this.tmpWidth = this.indicator.offsetWidth

        return this.indicator;
    },

    apply: function () {
        var me = this;
        var elem = me.target;
        var cm = new C.ContextManager();
        var tmpLeft, tmpWidth;
        cm
            .on({tag: ['mousedown', 'left'], subject: elem, verb: function (evt) {
                var target = me.includesChildren ? evt.target : me.target;
                var alignObj = me.alignElemFn(evt.target);
                me.indicator = me.locate(target, alignObj.top, alignObj.right, alignObj.bottom, alignObj.left);
                tmpLeft = me.indicator.offsetLeft;
                tmpWidth = me.indicator.offsetWidth;
            }})
            .on({tag: 'mousemove', subject: elem, verb: function (evt) {
                if(tmpWidth - evt.clientX >= 0) {
                    me.indicator.style.left = tmpLeft + evt.clientX + 'px';
                    me.indicator.style.width = tmpWidth - evt.clientX + 'px';
                }
            }})
            .on({tag: 'mouseup', subject: elem, verb: function (evt) {
                var target = me.includesChildren ? evt.target : me.target;
                X.getDragBackgroundHelper(target, false).removeChild(me.indicator);// TODO self destroy 함수 있어야 함
                me.modifier.modifyLeftSide(target, target.offsetWidth - evt.clientX);
            }});

        new C.ContextManager().on({tag: ['mousedown', 'right'], subject: elem, verb: function (evt) {
            var target = me.includesChildren ? evt.target : me.target;
            var alignObj = me.alignElemFn(evt.target);
            me.indicator = me.locate(target, alignObj.top, alignObj.right, alignObj.bottom, alignObj.left);
        }})
            .on({tag: 'mousemove', subject: elem, verb: function (evt) {
                me.indicator.style.width = evt.clientX + 'px';
            }})
            .on({tag: 'mouseup', subject: elem, verb: function (evt) {
                var target = me.includesChildren ? evt.target : me.target;
                X.getDragBackgroundHelper(target, false).removeChild(me.indicator);
                var outerDiv = elem;
                var scroll = 0;
                while (outerDiv !== document) {
                    scroll += outerDiv.scrollLeft;
                    outerDiv = outerDiv.parentNode;
                }

                me.modifier.modifyRightSide(target, evt.clientX);
            }});
    }

}, function (elem, alignElemFn) {
    var modifier = new X.WidthModifier();
    modifier.children = function (elem) {
        if ('th' === elem.tagName.toLowerCase()) {
            if (elem.parentNode.parentNode.firstChild === elem.parentNode) {
                return null;
            } else {
                var startIdx = 0;
                var tmp = elem;
                while (tmp.previousSibling) {
                    startIdx += tmp.previousSibling.colSpan || 1;
                    tmp = tmp.previousSibling;
                }

                var colThs = elem.parentNode.parentNode.firstChild.childNodes;
                var ret = [];
                var endLen = startIdx + (elem.colSpan || colThs.length - 1);
                for (; startIdx < endLen; startIdx++) {
                    ret.push(colThs[startIdx]);
                }

                return ret;
            }
        } else if ('div' === elem.tagName.toLowerCase()) {
            return elem.getElementsByTagName('tr')[0].children;
        }
    };

    modifier.prevSibling = function (elem) {
        var ret;
        if (elem.previousSibling) {
            ret = elem.previousSibling;
        } else {
            var outerDiv = X.getParentElementByTagName(elem, 'div');
            if (outerDiv.previousSibling) {
                ret = outerDiv.previousSibling;
            }
        }

        return ret;
    };

    var includesChildren;
    if(!alignElemFn) {
        includesChildren = false;
        alignElemFn = function() {
            return {
                top: elem,
                bottom: elem,
                left: elem,
                right: elem
            };
        };
    } else {
        includesChildren = true;
    }

    return {
        modifier: modifier,
        indicator: null,
        alignElemFn: alignElemFn,
        target: elem,
        includesChildren: includesChildren
    };
});

X.define('X.WidthModifier', {
    modifyLeftSide: function (elem, width) {
        this._modifyLeftSide(elem, width);
    },

    correctOuterWidth: function (elem, prevSibling, width, prevWidth) {
        var curElem = elem;
        var curPrevElem = prevSibling;
        var targets = [];
        while (curElem !== curPrevElem && -1 === curElem.className.search(/(^| )x-outer-div($| )/)) {
            var style = window.getComputedStyle(curElem);
            if ('absolute' === style.position) {
                targets.push(curElem);
            } else if ('relative' === style.position) {
                targets.clear();
            }
            curElem = curElem.parentNode;  // XXX 공통 부모를 찾는 부분이 이렇게 구현되면 안됨
            curPrevElem = curPrevElem.parentNode;
        }

        for (var i = 0; i < targets.length; i++) {
            var target = targets[i];
            target.style.left = (target.offsetLeft - width + prevWidth) + 'px';
        }
    },

    _modifyLeftSide: function (elem, width) {
        var prevSibling;
        if (prevSibling = this.prevSibling(elem)) {
            var prevWidth = elem.offsetWidth;
            this.correctOuterWidth(elem, prevSibling, width, prevWidth);
            this._modifyRightSide(prevSibling, prevSibling.offsetWidth - width + prevWidth);
            this._modifyRightSide(elem, width);

        }
    },

    modifyRightSide: function (elem, width) {
        console.log(elem, width);
        this._modifyRightSide(elem, width);
    },

    _modifyRightSide: function (elem, width) {
        // width가 0보다 작으면 알아서 무시되기 때문에 상관없음
        var children = this.children(elem);
        if (children) {
            // %가 아닌 children을 추려 이전 prevWidth width의 비율만큼 분배.
            var prevWidth = elem.offsetWidth;
            this.shareWidthToDoms(children, width, prevWidth);
        }

        if (elem.style.width) {
            elem.style.width = width + 'px';
            // TODO 거꾸로 거슬러 올라가 outer div의 크기를 조정하는 부분도 넣어야 함
        }
    },

    shareWidthToDoms: function(elemsGroup, width, prevWidth) {
        var widths = [];
        var precisions = [];
        var testSum = 0;
        for (var i = 0; i < elemsGroup.length; i++) {
            var elems = elemsGroup[i];
            if('string' !== typeof elems && !elems.hasOwnProperty('length')) {
                elems = elemsGroup[i] = [elems];
            }
            var realWidth = elems[0].offsetWidth * width / prevWidth;
            var intWidth = Math.floor(realWidth);
            testSum += intWidth;
            precisions.push(realWidth - intWidth);
            widths.push(intWidth);
        }
        for (var i = 0; i < elemsGroup.length; i++) {
            var elems = elemsGroup[i];
            for (var j = 0; j < elems.length; j++) {
                this._modifyRightSide(elems[j], widths[i]);
            }
        }
    },

    addWidthLeftSide: function (elem, delta) {

    },
    addWidthRightSide: function (elem, delta) {
        var children = this.children();
        // %가 아닌 children을 추려 이전 total width의 비율만큼 delta를 분배.
        var total = elem.offsetWidth;
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            this.addWidthRightSide(child, child.offsetWidth * delta / total);
//            child.style.width = child.offsetWidth * (1 + delta / total) + 'px';
        }
    }
}, function () {
    return {
        children: function (elem) {
            return [];
        },
        parent: function (elem) {
            return null;
        },
        prevSibling: function (elem) {
            return null;
        }
    };
});