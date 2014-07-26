var resolutions = [
    {
        type: 'row',
        keyIndex: 'level1Name',
        sortIndex: 'orderNum',

        columns: [
            {
                text: '레벨1',
                field: 'level1Name'
            }
        ],

        reductions: [
            {
                data: { 'level2Name': '합계' },
                renderer: null
            }
        ]
    },
    {
        type: 'row',
        keyIndex: 'level2Name',
        sortIndex: 'orderNum',

        columns: [
            {
                text: '레벨2',
                field: 'level2Name'
            }
        ]
    },
    {
        type: 'column',
        keyIndex: function (o) {
            return o.accountingDate.getFullYear();
        },
        column: {
            textIndex: function (arr) {
                return arr[0].accountingDate.getFullYear() + '년';
            }
        }
    },
    {
        type: 'column',
        keyIndex: function (o) {
            return o.accountingDate.getMonth() + 1;
        },

        column: {
            textIndex: function (arr) {
                return (arr[0].accountingDate.getMonth() + 1) + '월';
            }
        },

        reductions: [
            {
                cal: 'avg',
                column: {
                    text: '합계'
                },
                renderer: null
            }
        ]
    },
    {
        type: 'cell',
        keyIndex: 'amount'
    }
];

var tbl = new X.pivot.Pivot(document.getElementById('targetTbl'), resolutions);
tbl.setData(data);


//var dd, ee, ff;
//var ss = function (elem) {
//    var helem = document.getElementById('targetTbl');
//
//    var modifier = new X.WidthModifier();
//    modifier.children = function (elem) {
//        if ('th' === elem.tagName.toLowerCase()) {
//            if (elem.parentNode.parentNode.firstChild === elem.parentNode) {
//                return null;
//            } else {
//                var startIdx = 0;
//                var tmp = elem;
//                while (tmp.previousSibling) {
//                    startIdx += tmp.previousSibling.colSpan || 1;
//                    tmp = tmp.previousSibling;
//                }
//
//                var colThs = elem.parentNode.parentNode.firstChild.childNodes;
//                var ret = [];
//                var endLen = startIdx + (elem.colSpan || colThs.length - 1);
//                for (; startIdx < endLen; startIdx++) {
//                    ret.push(colThs[startIdx]);
//                }
//
//                return ret;
//            }
//        } else if ('div' === elem.tagName.toLowerCase()) {
//            return elem.getElementsByTagName('tr')[0].children;
//        }
//    };
//
//    modifier.prevSibling = function (elem) {
//        var ret;
//        if (elem.previousSibling) {
//            ret = elem.previousSibling;
//        } else {
//            var outerDiv = X.getParentElementByTagName(elem, 'div');
//            if (outerDiv.previousSibling) {
//                ret = outerDiv.previousSibling;
//            }
//        }
//
//        return ret;
//    };
//
//    var indicator;
//    var cm = new C.ContextManager();
//    var tmpLeft, tmpWidth;
//    ee = cm
//        .on({tag: ['mousedown', 'left'], subject: elem, verb: function (evt) {
//            var target = evt.target;
//            indicator = X.populateSizeIndicator(target, target, target, helem, target);
//            tmpLeft = indicator.offsetLeft;
//            tmpWidth = indicator.offsetWidth;
//        }})
//        .on({tag: 'mousemove', subject: elem, verb: function (evt) {
//            if(tmpWidth - evt.clientX >= 0) {
//                indicator.style.left = tmpLeft + evt.clientX + 'px';
//                indicator.style.width = tmpWidth - evt.clientX + 'px';
//            }
//        }})
//        .on({tag: 'mouseup', subject: elem, verb: function (evt) {
//            var target = evt.target;
//            X.getDragBackgroundHelper(target, false).removeChild(indicator);// TODO self destroy 함수 있어야 함
//            console.log(evt);
//            modifier.modifyLeftSide(target, target.offsetWidth - evt.clientX);
//        }});
//
//    new C.ContextManager().on({tag: ['mousedown', 'right'], subject: elem, verb: function (evt) {
//        var target = evt.target;
//        indicator = X.populateSizeIndicator(target, target, target, helem, target);
//    }})
//        .on({tag: 'mousemove', subject: elem, verb: function (evt) {
//            indicator.style.width = evt.clientX + 'px';
//        }})
//        .on({tag: 'mouseup', subject: elem, verb: function (evt) {
//            var target = evt.target;
//            X.getDragBackgroundHelper(target, false).removeChild(indicator);
//            console.log(evt);
//            var outerDiv = elem;
//            var scroll = 0;
//            while (outerDiv !== document) {
//                scroll += outerDiv.scrollLeft;
//                outerDiv = outerDiv.parentNode;
//            }
//
//            modifier.modifyRightSide(target, evt.clientX);
//        }});
//};
//ss(document.getElementsByTagName('div').item(3));
//ss(document.getElementsByTagName('th').item(17));







