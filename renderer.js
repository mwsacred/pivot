X.define('X.pivot.Renderer', {
    render: function (vm) {
        var recordContexts = vm.recordContexts;
        var columnContexts = vm.columnContexts;

        var recLen = recordContexts.length;
        var colLen = columnContexts.length;

        var columnHeadersOfRecordHeaders, recordHeaders, recordHeader, colgroup, columnHeaders, columnHeader, tbody, records, cell;

        var rowResolutions = vm.rowResolutions;
        var colResolutions = vm.colResolutions;

        var rowHeaderLen = rowResolutions.length;
        var colHeaderLen = colResolutions.length;

        // TODO viewModel에서 제공해주는 data를 써야 함(현재는 column.text로...).
        columnHeadersOfRecordHeaders = function (unit, props) {
            unit.push("<table class='x-theader'>");
            unit.push('<tr>');

            for (var i = 0; i < rowHeaderLen; i++) {
                var rr = rowResolutions[i];
                var columns = rr.columns || [];
                var columnLen = columns.length;
                for (var j = 0; j < columnLen; j++) {
                    var column = columns[j];
                    unit.pushTemplate('<th style="height: {columnHeadersHeight}">', props);
                    unit.pushColumns(column.text);
                    unit.push('</th>');
                }
            }
            unit.push('</tr>');
            unit.push("</table>");
        };

        recordHeaders = function (unit) {
            unit.push("<table class='x-rec-theader'>");

            for (var i = 0; i < recLen; i++) {
                unit.push("<tr>");
                recordHeader(unit, vm.rowHeaderRecords[i], i % 2); // TODO
                unit.push("</tr>");
            }
            unit.push("</table>");
        };

        recordHeader = function (unit, record, altIdx) {
            for (var i = 0; i < record.length; i++) {
                var val = record[i];
                if (1 < val.span) {
                    unit.pushTemplate('<th' + (altIdx ? ' class="alt-' + altIdx + '"' : '') + ' rowspan="{span}">', { span: val.span });
                } else {
                    unit.push('<th' +
                        (altIdx ? ' class="alt-' + altIdx + '"' : '') + '>');
                }
                unit.push(val.value);
                unit.push('</th>');
            }
        };

        columnHeader = function (unit, val) {
            if (val.span) {
                unit.pushTemplate('<th colspan="{span}">', { span: val.span });
            } else {
                unit.push('<th class="leaf">');
            }
            unit.pushColumns(val.value);
            unit.push('</th>');
        };

        colgroup = function (unit) {
            var columnRecords = vm.columnRecords;
            var crsLen = columnRecords.length;
            unit.push('<colgroup>');
            var cr = columnRecords[crsLen - 1];
            var crLen = cr.length;
            for (var j = 0; j < crLen; j++) {
                unit.pushTemplate('<col width="{colWidth}" />', {colWidth: '100px'});
            }
            unit.push('</colgroup>');
        }

        columnHeaders = function (unit) {
            colgroup(unit);
            var columnRecords = vm.columnRecords;
            var crsLen = columnRecords.length;
            for (var i = 0; i < crsLen; i++) {
                var cr = columnRecords[i];
                var crLen = cr.length;
                unit.push('<tr>');
                for (var j = 0; j < crLen; j++) {
                    unit.push(columnHeader(unit, cr[j]));
                }
                unit.push('</tr>');
            }

        };

        tbody = function (unit) {
            colgroup(unit);
            for (var i = 0; i < recLen; i++) {
                unit.push(records(unit, recordContexts[i], vm.records[i], i % 2)); // TODO 2를 설정으로
            }
        };

        records = function (unit, recordContext, record, altIdx) {
            unit.push(altIdx ? '<tr class="alt-' + altIdx + '">' : "<tr>");
            for (var i = 0; i < colLen; i++) {
                unit.push(cell(unit, record[i]));
            }
            unit.push("</tr>");
        };

        cell = function (unit, val) {
            unit.push('<td>');
            unit.push(val);
            unit.push('</td>');
        };

        var unit1_1 = new X.pivot.RendererUnit();
        var unit2_1 = new X.pivot.RendererUnit();
        var unit1_2 = new X.pivot.RendererUnit();
        var unit2_2 = new X.pivot.RendererUnit();


        var dps = this.defaultProps;
        var props = {
            width: dps.width,
            height: dps.height,
            recordWidth: dps.recordWidth,
            recordHeight: dps.recordHeight,
            scrollHeight: dps.scrollHeight,
            columnHeadersHeight: dps.recordHeight.replace(/\D+/, '') * vm.columnRecords.length + 'px'
        };

        columnHeadersOfRecordHeaders(unit1_1, props);
        recordHeaders(unit2_1);
        columnHeaders(unit1_2);
        tbody(unit2_2);

        var recHeaderWidth = unit1_1.columnCount * 100 + 1;
        var colHeaderWidth = unit1_2.columnCount * 100;

        props.recHeaderWidth = recHeaderWidth + 'px';
        props.colHeaderWidth = vm.columnRecords[vm.columnRecords.length - 1].length + 'px'; // CHECK 현재는 trivial

        var resultUnit = new X.pivot.RendererUnit();
        resultUnit.pushTemplate("<div class='x-pivot x-outer-div' style='width: {width}; height: {height}'>", props);

        resultUnit.pushTemplate("<div class='x-left x-top' style='width: {recHeaderWidth}'>", props);
        resultUnit.pushUnit(unit1_1);
        resultUnit.push("</div>");

        resultUnit.pushTemplate("<div class='x-right x-top' style='width: calc(100% - {recHeaderWidth}); left: {recHeaderWidth}'>", props);
        resultUnit.push("<table class='x-col-theader'>");
        resultUnit.pushUnit(unit1_2);
        resultUnit.push("</table>");
        resultUnit.push("</div>");

        resultUnit.pushTemplate("<div class='x-bottom-div' style='height: calc(100% - {columnHeadersHeight} - {scrollHeight})'>", props);

        resultUnit.pushTemplate("<div class='x-left x-bottom' style='width: {recHeaderWidth}'>", props);
        resultUnit.pushUnit(unit2_1);
        resultUnit.push("</div>");

        resultUnit.pushTemplate("<div class='x-right x-bottom' style='width: calc(100% - {recHeaderWidth}); left: {recHeaderWidth}'>", props);
        resultUnit.push("<table class='x-tbody'");
        resultUnit.pushUnit(unit2_2);
        resultUnit.push("</table>");
        resultUnit.push("</div>");
        resultUnit.push("</div>");
        resultUnit.push("</div>");

        var target = this.target;
        target.innerHTML = resultUnit.toStr();
        this.addSyncScrollFn(target);


        var pivot = this.dom = target.firstChild;
        var resizer = new X.Resizer();
        resizer.renderer = this;

        var thList = target.getElementsByTagName('div').item(2).getElementsByTagName('th');
        for (var i = 0; i < thList.length; i++) {
            var th = thList.item(i);
            resizer.apply(th, pivot);
        }
    },

    addSyncScrollFn: function (target) {
        // add syncing column scroll fn
        // TODO index 기반의 위험한 dom query
        var colHeaderDom = target.getElementsByTagName('div').item(2);
        var bodyDom = target.getElementsByTagName('div').item(5);

        var syncScroll = function () {
            bodyDom.scrollLeft = colHeaderDom.scrollLeft;
        };

        // 성능에 문제가 있을 수 있으나 어쩔 수 없음
        colHeaderDom.addEventListener('scroll', syncScroll);
    },

    // util fn
    getColumnHeaderDom: function () {
        return this.target.getElementsByTagName('div').item(2);
    },

    getRecordHeaderDom: function () {
        return this.target.getElementsByTagName('div').item(4);
    },

    getBodyDom: function () {
        return this.target.getElementsByTagName('div').item(5);
    },

    th2colsInfo: function (th) {
        var ret = {
            headerCols: [],
            bodyCols: [],
            prevHeaderCols: [],
            prevBodyCols: []
        };

        function getColChildIdx(cur) {
//            var idx = cur.colSpan - 1 || 0;
            var idx = 0;
            while ((cur = cur.previousSibling) != null) {
                idx += cur.colSpan || 1;
            }
            return idx;
        }


        // TODO textNode는 제외해야 함
        function getChildIdx(cur) {
            var idx = 0;
            while ((cur = cur.previousSibling) != null) {
                idx++;
            }
            return idx;
        }

        function findPrevTh(div, th) {
            var ret = {
                idx: null,
                th: null,
                colDiv: null,
                bodyDiv: null
            };

            if(th.previousSibling) {
                ret.th = th.previousSibling;
                ret.idx = getColChildIdx(ret.th);
                ret.colDiv = div;

            } else {
                var tr = th.parentNode
                var trIdx = getColChildIdx(tr);

                var prevDiv = div.previousSibling;
                var prevDivTrs = prevDiv.getElementsByTagName('tr');
                var prevDivTr = prevDivTrs.item(trIdx < prevDivTrs.length ? trIdx : prevDivTrs.length - 1);
                var prevTh = prevDivTr.lastChild;

                ret.th = prevTh;
                ret.idx = getColChildIdx(prevTh);
                ret.colDiv = prevDiv;
            }

//            ret.bodyDiv = ret.colDiv.parentNode.nextSibling.childNodes[getChildIdx(ret.colDiv)];
            return ret;
        }

        var div = X.getParentElementByTagName(th, 'div');
        var tr = X.getParentElementByTagName(th, 'tr');

        var thIdx = getColChildIdx(th);
        var colDiv = div;
        var bodyDiv = this.getColumnHeaderDom() === colDiv ? this.getBodyDom() : this.getRecordHeaderDom();
        var prevInfo = findPrevTh(div, th);
        prevInfo.bodyDiv = this.getColumnHeaderDom() === prevInfo.colDiv ? this.getBodyDom() : this.getRecordHeaderDom();

        var colCols, bodyCols;
        var colIdxes = [thIdx, thIdx + (th.colSpan - 1 || 0)];
        var prevColIdxes = [prevInfo.idx , prevInfo.idx + (prevInfo.th.colSpan - 1 || 0)];

        function extractColsOrStyles(targetColDiv) {
            var colgroups = targetColDiv.getElementsByTagName('colgroup');
            var ret;
            if (colgroups.length) {
                ret = colgroups.item(0).childNodes;
            } else {
                var headerTrs = targetColDiv.getElementsByTagName('tr');
                var lastTr = headerTrs.item(0);
                ret = X.projectProp(lastTr.childNodes, 'style');
            }

            return ret;
        }

        if (div === colDiv) {
            colCols = colDiv.getElementsByTagName('colgroup').item(0).childNodes;
            bodyCols = bodyDiv.getElementsByTagName('colgroup').item(0).childNodes;
            for (var j = colIdxes[0]; j <= colIdxes[1]; j++) {
                ret.headerCols.push(colCols.item(j));
                ret.bodyCols.push(bodyCols.item(j));
            }

            colCols = extractColsOrStyles(prevInfo.colDiv);
            bodyCols = extractColsOrStyles(prevInfo.bodyDiv);
            for (var j = prevColIdxes[0]; j <= prevColIdxes[1]; j++) {
                ret.prevHeaderCols.push(colCols[j]); // FIXME NodeList와 array를 동시에 만족시키는 구문은 이것 밖에.. NodeList의 경우에 문제가 있을 수 있으니 수정 요망
                ret.prevBodyCols.push(bodyCols[j]);
            }
        } else {
            // TODO
        }

        return ret;
    }

}, function (target) {
    return {
        target: target,
        dom: null,
        defaultProps: {
            width: '100%',
            height: '100%',
            recordWidth: '100px',
            recordHeight: '22px',
            scrollHeight: '16px'
        }
    };
})
;

// TODO pushColumns가 없도록 refactoring 필요. pushColumns에 의존하던 기능들은 vm.* 기반으로 변경해야 함
X.define('X.pivot.RendererUnit', {
    push: function () {
        [].push.apply(this.buffer, arguments);
    },
    pushColumns: function () {
        [].push.apply(this.buffer, arguments);
        this.columnCount += arguments.length;
    },
    pushUnit: function (unit) {
        [].push.apply(this.buffer, unit.buffer);
    },
    pushTemplate: function (expr, props) {
        this.buffer.push(X.applyTemplate(expr, props));
    },
    toStr: function () {
        return this.buffer.join('');
    }
}, function () {
    return {
        buffer: [],
        columnCount: 0
    };
});