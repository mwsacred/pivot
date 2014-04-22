X.define('X.Resizer', {
    locate: function (positionSelector, widthSelector, heightSelector) {
        var props = {
            bgId: this.resizeBackgroundId,
            top: positionSelector.offsetTop,
            left: positionSelector.offsetLeft,
            width: widthSelector.offsetWidth,
            height: heightSelector.offsetHeight
        };

        var cur = positionSelector.offsetParent;
        while (cur) {
            props.top += cur.offsetTop - cur.scrollTop;
            props.left += cur.offsetLeft - cur.scrollLeft;
            cur = cur.offsetParent;
        }

        cur = positionSelector;
        while (heightSelector !== cur) {
            props.height -= cur.offsetTop;
            cur = cur.offsetParent;
        }
        if (!this.dom) {
            var bodyDom = document.getElementsByTagName('body').item(0);
            bodyDom.insertAdjacentHTML('beforeend',
                X.applyTemplate('<div id={bgId} style="position: fixed; top: 0px; left: 0px; width: 100%; height: 100%; z-index: -9999">' +
                    '<div style="position: absolute; background-color: deepskyblue; opacity: 0.5; top: {top}; left: {left}; width: {width}; height: {height}" />' +
                    '</div>', props));
            this.dom = bodyDom.lastChild.firstChild;
        } else {
            this.dom.style.top = props.top;
            this.dom.style.left = props.left;
            this.dom.style.width = props.width;
            this.dom.style.height = props.height;
        }
        this.dom.style.display = 'inherit';
    },

    apply: function (target, heightSelector) {
        var me = this;
        var disable, resize;
        var oldLeft, oldWidth;
        var widthSelector;
        target.addEventListener('mousedown', function (elem) {
            // 성능 문제..
            me.locate(elem.target, widthSelector = elem.target, heightSelector);
            oldLeft = me.dom.offsetLeft;
            oldWidth = me.dom.offsetWidth;
            if (elem.x - oldLeft < oldWidth / 2) {
                me.extendsLeft = true;
            } else {
                me.extendsLeft = false;
            }
            document.addEventListener('mouseup', disable);
            document.addEventListener('mousemove', resize);
            // 텍스트 selection도 disable 시켜야 함

            document.getElementById(me.resizeBackgroundId).style.zIndex = me.enableZIndex;
        });

        disable = function () {
            me.dom.style.display = 'none';
            document.removeEventListener('mouseup', disable);
            document.removeEventListener('mousemove', resize);

            document.getElementById(me.resizeBackgroundId).style.zIndex = me.disableZIndex;
            me.commit(widthSelector)
        };

        resize = function (e) {
            var diff = e.x - oldLeft;
            if (me.extendsLeft) {
                me.dom.style.left = e.x;
                me.dom.style.width = oldWidth - diff;
                me.diff = -diff;
            } else {
                me.dom.style.width = diff;
                me.diff = diff - oldWidth;
            }
        }
    },
    commit: function (target) {
        function splitWidth(style) {
            return [ Number(style.width.replace(/\D+/, '')), style.width.replace(/\d+/, '') ];
        }

        var me = this;
        var info = me.renderer.th2colsInfo(target);

        function extracted(headerCols, diff) {
            var len = headerCols.length;
            var widthNums = [];
            var ret = [];
            var sum = 0;
            for (var i = 0; i < len; i++) {
                sum += widthNums[i] = splitWidth(headerCols[i])[0];
            }

            for (var i = 0; i < len; i++) {
                ret.push(widthNums[i] + diff * widthNums[i] / sum);
            }
            return ret;
        }

        var widthStrs = extracted(info.headerCols, me.diff);
        for (var i = 0; i < info.headerCols.length; i++) {
            info.headerCols[i].width = widthStrs[i];
            info.bodyCols[i].width = widthStrs[i];
        }

        if (me.extendsLeft) {
            widthStrs = extracted(info.prevHeaderCols, -me.diff);
            var prevLen = info.prevHeaderCols.length;
            for (var i = 0; i < prevLen; i++) {
                info.prevHeaderCols[i].width = widthStrs[i];
                info.prevBodyCols[i].width = widthStrs[i];
            }
        }
    }
}, function () {
    return {
        resizeBackgroundId: '__background__',
        enableZIndex: 999,
        disableZIndex: -999,
        dom: null,
        extendsLeft: false,
        diff: null
    }
});