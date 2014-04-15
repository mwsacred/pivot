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
            props.top += cur.offsetTop;
            props.left += cur.offsetLeft;
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
        var extendsLeft;
        target.addEventListener('mousedown', function (elem) {
            // 성능 문제..
            me.locate(elem.target, widthSelector = elem.target, heightSelector);
            oldLeft = me.dom.offsetLeft;
            oldWidth = me.dom.offsetWidth;
            if (elem.x - oldLeft < oldWidth / 2) {
                extendsLeft = true;
            } else {
                extendsLeft = false;
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
            if (extendsLeft) {
                me.dom.style.left = e.x;
                me.dom.style.width = oldWidth - diff;
            } else {
                me.dom.style.width = diff;
            }
        }
    },
    commit: function(target) {
        var cur = target;
        var i = 0;
        while( (cur = cur.previousSibling) != null )
            i++;

        var outer = X.getParentElementByTagName(target, 'table').parentNode.parentNode.parentNode;

        var colHeaderDom = outer.getElementsByTagName('div').item(2);
        var bodyDom = outer.getElementsByTagName('div').item(5);

        var width = this.dom.style.width;
//        var diff = width -
        colHeaderDom.getElementsByTagName('colgroup').item(0).childNodes.item(i).width = width;
        bodyDom.getElementsByTagName('colgroup').item(0).childNodes.item(i).width =width;
    }
}, function () {
    return {
        resizeBackgroundId: '__background__',
        enableZIndex: 999,
        disableZIndex: -999,
        dom: null
    }
});