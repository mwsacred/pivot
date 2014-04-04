X.define('X.pivot.ViewModel', {
    initVM: function (resolutions, dataManager) {
        // 1. rowInfo, colInfo를 root로 부터 sort하면서 indexing
        var rootKey = 'total'; // TODO 설정으로...
        var rowInfoMap = dataManager.rowInfoMap;
        var fieldInfoMap = dataManager.fieldInfoMap;

        var rowRenderConfigs = [];
        var colRenderConfigs = [];

        var rowResolutions = [];
        var colResolutions = [];

        var dataIndex;

        function resolveReductions(reductions) {
            var ret = {
                before: [],
                after: []
            };
            var len = reductions.length;
            var afterFlag = false;
            for (var i = 0; i < len; i++) {
                var r = reductions[i];
                if ('->' === r) {
                    afterFlag = true;
                } else if (afterFlag) {
                    ret.after.push(r);
                } else {
                    ret.before.push(r);
                }
            }

            return ret;
        }

        for (var i = 0; i < resolutions.length; i++) {
            var resol = resolutions[i];
            if ('cell' === resol.type) {
                dataIndex = resol.keyIndex;
            } else {
                var renderConfigs;
                var tmpResolutions;
                if ('row' === resol.type) {
                    renderConfigs = rowRenderConfigs;
                    tmpResolutions = rowResolutions;
                } else if ('column' === resol.type) {
                    renderConfigs = colRenderConfigs;
                    tmpResolutions = colResolutions;
                } else {
                    continue;
                }

                var reductInfo = resolveReductions(resol.reductions || []);
                renderConfigs.push({
                    sortIndex: resol.sortIndex,
                    reductionBeforeChlidren: reductInfo.before,
                    reductionAfterChlidren: reductInfo.after
                });

                tmpResolutions.push(resol);
            }
        }

        var rowDimenLen = rowRenderConfigs.length;
        var colDimenLen = colRenderConfigs.length;

        function getSortFn(len) {
            return function (a, b) {
                for (var i = 0; i < len; i++) {
                    var aKey = a.keyset[i];
                    var bKey = b.keyset[i];
                    if (aKey > bKey) {
                        return 1;
                    } else if (aKey < bKey) {
                        return -1;
                    }
                }
                return 0;
            }
        }

        function createNonLeafContext(vm, info, contexts, renderConfigs, indexOrders, curDimen, maxDimen) {
            indexOrders = indexOrders || indexOrders;
            var rc = renderConfigs[curDimen];
            var beforeReductions = rc.reductionBeforeChlidren;
            var afterReductions = rc.reductionAfterChlidren;
            var reduceLen = beforeReductions.length;
            var reservedIndexOrders = [];

            var lastChildPosition = afterReductions.length ? 1
                : beforeReductions.length ? -1 : 0;

            for (var j = 0; j < reduceLen; j++) {
                reservedIndexOrders.push(contexts.length);
                var context = { info: info, reduction: beforeReductions[j], level: curDimen };
                var cal = context.reduction.cal;
                context.reduction.fn = cal instanceof Function ? cal
                    : vm.reductionFnMap[cal || 'sum'] || vm.reductionFnMap.sum;
                contexts.push(context);
            }
            if (-1 === lastChildPosition) {
                contexts[contexts.length - 1].isLastChild = true;
            }

            createContexts(vm, info, contexts, renderConfigs, indexOrders, curDimen + 1, maxDimen);
            [].push.apply(indexOrders, reservedIndexOrders);

            reduceLen = afterReductions.length;
            for (var j = 0; j < reduceLen; j++) {
                indexOrders.push(contexts.length);
                var context = { info: info, reduction: afterReductions[j], level: curDimen };
                var cal = context.reduction.cal;
                context.reduction.fn = cal instanceof Function ? cal
                    : vm.reductionFnMap[cal || 'sum'] || vm.reductionFnMap.sum;
                contexts.push(context);
            }

            if (1 === lastChildPosition) {
                contexts[contexts.length - 1].isLastChild = true;
            }
        }

        function createContexts(vm, info, contexts, renderConfigs, indexOrders, curDimen, maxDimen) {
            indexOrders = indexOrders || [];
            var children = info.children.slice(0).sort(getSortFn(curDimen + 1));
            var len = children.length;
            if (curDimen === maxDimen) {
                if (len) {
                    for (var i = 0; i < len; i++) {
                        var childInfo = children[i];
                        indexOrders.push(contexts.length);
                        contexts.push({ info: childInfo, isLeaf: true });
                    }
                }
            } else {
                for (var i = 0; i < len; i++) {
                    var childInfo = children[i];
                    createNonLeafContext(vm, childInfo, contexts, renderConfigs, indexOrders, curDimen, maxDimen);
                }
            }
        }

        var recordContexts = [];
        var columnContexts = [];

        var recordDeriveIndexOrders = [];
        var columnDeriveIndexOrders = [];

        /* TODO renderConfig를 더 구조화하거나 걷어내고 resolution자체를 쓰는 식으로...*/
        createNonLeafContext(this, rowInfoMap[rootKey], recordContexts, rowRenderConfigs, recordDeriveIndexOrders, 0, rowDimenLen);
        createNonLeafContext(this, fieldInfoMap[rootKey], columnContexts, colRenderConfigs, columnDeriveIndexOrders, 0, colDimenLen);

        this.recordContexts = recordContexts;
        this.columnContexts = columnContexts;

        this.rowResolutions = rowResolutions;
        this.colResolutions = colResolutions;

        this.rowRenderConfigs = rowRenderConfigs;
        this.colRenderConfigs = colRenderConfigs;

        var columnRecords = this.constructColumnRecords(colDimenLen, columnDeriveIndexOrders, columnContexts, colResolutions);
        this.columnRecords = columnRecords;

        var records = this.constructRecords(rowDimenLen, colDimenLen, recordDeriveIndexOrders, recordContexts, columnDeriveIndexOrders, columnContexts, dataManager, dataIndex);
        this.records = records;
    },

    constructColumnRecords: function (colDimenLen, columnDeriveIndexOrders, columnContexts, colResolutions) {
        var columnRecords = new Array(colDimenLen);
        for (var i = 0; i < colDimenLen - 1; i++) {
            columnRecords[i] = [];
        }
        var leafRecord = columnRecords[colDimenLen - 1] = new Array(columnDeriveIndexOrders.length);

        var curColDatasrcs = [];
        for (var i = 0; i < colDimenLen; i++) {
            curColDatasrcs.push([]);
        }

        for (var j = 0; j < columnDeriveIndexOrders.length; j++) {
            var colIdx = columnDeriveIndexOrders[j];
            var cc = columnContexts[colIdx];
            if (cc.isLeaf) {
                var value = colResolutions[colDimenLen - 1].column.textIndex(cc.info.src);
                leafRecord[colIdx] = { value: value };
                for (var k = 0; k < colDimenLen; k++) {
                    curColDatasrcs[k].push(value); // 현재는 span 계산 용
                }
            } else {
                // 전제: columnDeriveIndexOrders가 다소 순서가 바뀌어 있더라도 그룹별 순서는 차례로 유지되고 있다고 가정
                // afterRender, beforeRender 외에 유동적인 위치에 column이 들어가는 정의가 추가되면 코드를 더 정제해야 함
                var value = 'SUM'; //colResolutions[cc.level]
                for (var k = 0; k < colDimenLen; k++) {
                    curColDatasrcs[k].push(value); // 현재는 span 계산 용
                }
                leafRecord[colIdx] = { value: value };

                if (cc.isLastChild) {
                    var level = cc.level - 1;
                    var value = colResolutions[level].column.textIndex(cc.info.src);
                    columnRecords[level].push({ value: value, span: curColDatasrcs[level].length });
                    curColDatasrcs[level] = [];
                }
            }
        }
        return columnRecords;
    },

    constructRecords: function (rowDimenLen, colDimenLen, recordDeriveIndexOrders, recordContexts, columnDeriveIndexOrders, columnContexts, dataManager, dataIndex) {
        var curRecDatasrcs = [];
        for (var i = 0; i < rowDimenLen; i++) {
            curRecDatasrcs.push([]);
        }

        var curColDatasrcs = [];
        for (var i = 0; i < colDimenLen; i++) {
            curColDatasrcs.push([]);
        }


        var records = new Array(recordDeriveIndexOrders.length);
        for (var i = 0; i < recordDeriveIndexOrders.length; i++) {
            var rowIdx = recordDeriveIndexOrders[i];
            var rc = recordContexts[rowIdx];
            var record = records[rowIdx] = new Array(columnDeriveIndexOrders.length);
            if (rc.isLeaf) {
                for (var j = 0; j < columnDeriveIndexOrders.length; j++) {
                    var colIdx = columnDeriveIndexOrders[j];
                    var cc = columnContexts[colIdx];
                    if (cc.isLeaf) {
                        var value = dataManager.src(rc.info.keyset, cc.info.keyset)[0][dataIndex] || 0; // TODO fallback value 설정
                        record[colIdx] = value;
                        for (var k = 0; k < colDimenLen; k++) {
                            curColDatasrcs[k].push(value);
                        }
                    } else {
                        // clone curDatasrc
                        var curDatasrc = curColDatasrcs[cc.level];
                        var values = [];
                        for (var k = 0; k < curDatasrc.length; k++) {
                            values.push(curDatasrc[k]);
                        }
                        record[colIdx] = cc.reduction.fn(values);

                        if (cc.isLastChild) {
                            curColDatasrcs[cc.level] = [];
                        }
                    }
                }

                for (var j = 0; j < rowDimenLen; j++) {
                    curRecDatasrcs[j].push(record);
                }
            } else {
                var curDatasrc = curRecDatasrcs[rc.level];
                for (var j = 0; j < columnDeriveIndexOrders.length; j++) {
                    var values = [];
                    for (var k = 0; k < curDatasrc.length; k++) {
                        values.push(curDatasrc[k][j]); // TODO 다른 reduce fn 존재
                    }
                    record[j] = rc.reduction.fn(values);
                }

                if (rc.isLastChild) {
                    curRecDatasrcs[rc.level] = [];
                }
            }
        }
        return records;
    },

    reductionFnMap: {
        sum: function (values) {
            var ret = 0;
            for (var k = 0; k < values.length; k++) {
                ret += values[k];
            }
            return ret;
        },

        count: function (values) {
            return values.length;
        },

        avg: function (values) {
            var ret = 0;
            for (var k = 0; k < values.length; k++) {
                ret += values[k];
            }
            return ret / values.length;
        }
    }
}, function () {
    return {
        recordContexts: null,
        columnContexts: null,
        rowRenderConfigs: null,
        colRenderConfigs: null,

        rowResolutions: null,
        colResolutions: null,

        records: null
    }
})
;