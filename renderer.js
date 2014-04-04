X.define('X.pivot.Renderer', {
    render: function (vm) {
        var recordContexts = vm.recordContexts;
        var columnContexts = vm.columnContexts;

        var recLen = recordContexts.length;
        var colLen = columnContexts.length;

        var columnHeadersOfRecordHeaders, recordHeaders, recordHeader, columnHeaders, columnHeader, tbody, records, cell;

        var rowResolutions = vm.rowResolutions;
        var colResolutions = vm.colResolutions;

        var rowHeaderLen = rowResolutions.length;
        var colHeaderLen = colResolutions.length;

        columnHeadersOfRecordHeaders = function (unit) {
            unit.push("<table class='x-theader'>");
            unit.push('<tr>');
            for (var i = 0; i < rowHeaderLen; i++) {
                var rr = rowResolutions[i];
                var columns = rr.columns || [];
                var columnLen = columns.length;
                for (var j = 0; j < columnLen; j++) {
                    var column = columns[j];
                    unit.push('<th>');
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
                unit.push(recordHeader(unit, recordContexts[i]));
            }
            unit.push("</table>");
        };

        recordHeader = function (unit, recordContext) {
            unit.push('');
            var record = recordContext.info.src[0];
            unit.push("<tr>");
            for (var i = 0; i < rowHeaderLen; i++) {
                var rr = rowResolutions[i];
                var columns = rr.columns || [];
                var columnLen = columns.length;
                for (var j = 0; j < columnLen; j++) {
                    var column = columns[j];
                    unit.push('<th>');
                    unit.push(record[column.field]);
                    unit.push('</th>');
                }
            }

            unit.push("</tr>");
        };

        columnHeader = function (unit, val) {
            unit.push('<th>');
            unit.pushColumns(val);
            unit.push('</th>');
        };

        columnHeaders = function (unit) {
            unit.push('<tr>');
            for (var i = 0; i < colLen; i++) {
                var c = columnContexts[i];
                unit.push(columnHeader(unit, c.info.key));
            }
            unit.push('</tr>');
        };

        tbody = function (unit) {
            for (var i = 0; i < recLen; i++) {
                unit.push(records(unit, recordContexts[i], vm.records[i]));
            }
        };

        records = function (unit, recordContext, record) {
            unit.push("<tr>");
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

        columnHeadersOfRecordHeaders(unit1_1);
        recordHeaders(unit2_1);
        columnHeaders(unit1_2);
        tbody(unit2_2);

        var recHeaderWidth = unit1_1.columnCount * 100 + 1;
        var colHeaderWidth = unit1_2.columnCount * 100;


        var dps = this.defaultProps;
        var props = {
            width: dps.width,
            height: dps.height,
            scrollHeight: dps.scrollHeight,
            recHeaderWidth: recHeaderWidth,
            colHeaderWidth: colHeaderWidth
        };

        var resultUnit = new X.pivot.RendererUnit();
        resultUnit.pushTemplate("<div class='x-pivot x-outer-div' style='width: {width}; height: {height}'>", props);

        resultUnit.pushTemplate("<div class='x-left x-top' style='width: {recHeaderWidth}px'>", props);
        resultUnit.pushUnit(unit1_1);
        resultUnit.push("</div>");

        resultUnit.pushTemplate("<div class='x-right x-top' style='width: calc(100% - {recHeaderWidth}px); left: {recHeaderWidth}px'>", props);
        resultUnit.push("<table class='x-col-theader'>");
        resultUnit.pushUnit(unit1_2);
        resultUnit.push("</table>");
        resultUnit.push("</div>");

        resultUnit.pushTemplate("<div class='x-bottom-div' style='height: calc(100% - 22px - {scrollHeight})'>", props);

        resultUnit.pushTemplate("<div class='x-left x-bottom' style='width: {recHeaderWidth}px'>", props);
        resultUnit.pushUnit(unit2_1);
        resultUnit.push("</div>");

        resultUnit.pushTemplate("<div class='x-right x-bottom' style='width: calc(100% - {recHeaderWidth}px); left: {recHeaderWidth}px'>", props);
        resultUnit.push("<table class='x-tbody'");
        resultUnit.pushUnit(unit2_2);
        resultUnit.push("</table>");
        resultUnit.push("</div>");
        resultUnit.push("</div>");
        resultUnit.push("</div>");

        var target = this.target;
        target.innerHTML = resultUnit.toStr();
        this.addSyncScrollFn(target);
    },

    addSyncScrollFn: function (target) {
        // add syncing column scroll fn
        // TODO index 기반의 위험한 dom query
        var colHeaderDom = target.getElementsByTagName('div')[2];
        var bodyDom = target.getElementsByTagName('div')[5];

        var syncScroll = function () {
            bodyDom.scrollLeft = colHeaderDom.scrollLeft;
        };

        // 성능에 문제가 있을 수 있으나 어쩔 수 없음
        colHeaderDom.addEventListener('scroll', syncScroll);
    }
}, function (target) {
    return {
        target: target,

        defaultProps: {
            width: '100%',
            height: '100%',
            scrollHeight: '16px'
        }
    };
})
;

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