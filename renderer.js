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
                unit.push(recordHeader(unit, vm.rowHeaderRecords[i]));
                unit.push("</tr>");
            }
            unit.push("</table>");
        };

        recordHeader = function (unit, record) {
            for (var i = 0; i < record.length; i++) {
                var val = record[i];
                if (1 < val.span) {
                    unit.pushTemplate('<th rowspan="{span}">', { span: val.span });
                } else {
                    unit.push('<th class="leaf">');
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

        columnHeaders = function (unit) {
            var columnRecords = vm.columnRecords;
            var crsLen = columnRecords.length;
            unit.push('<colgroup>');
            var cr = columnRecords[crsLen - 1];
            var crLen = cr.length;
            for (var j = 0; j < crLen; j++) {
                unit.pushTemplate('<col width="{colWidth}" />', {colWidth: '100px'});
            }
            unit.push('</colgroup>');

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