X.define('X.pivot.DataManager', {
    /*
     * dataMap에서 src 가져올 때 srcInfoMap에 lazy형식으로 put 해줌
     emptySrc를 리턴하면 gridview에서 caching 하고 있으므로 문제가 됨.
     따라서 caching하는 빈 array를 srcInfoMap도 가지고 있어야 나중에 문제가 생기지 않음
     */
    src: function (rowKeyset, colKeyset) {
        var me = this,
            key = me._mapkey(rowKeyset, colKeyset);
        me.srcInfoMap[key] || (me.srcInfoMap[key] = me.createSrcInfo(key, rowKeyset, colKeyset));

        return me.srcInfoMap[key].src;
    },

    keysets: function (map) {
        var ret = [];

        for (var i in map) {
            if(map.hasOwnProperty(i))
                ret.push(map[i].keyset);
        }
        return ret;
    },

    rowKeysets: function () {
        return this.keysets(this.rowInfoMap);
    },

    colKeysets: function () {
        return this.keysets(this.fieldInfoMap);
    },

    rowInfo: function (keyset) {
        var me = this,
            key = me._mapkey(keyset),
            info = me.rowInfoMap[key];
        return info;
    },

    row: function (keyset) {
        return this.rowInfo(this).row;
    },

    records: function (keyset) {
        return this.rowInfo(this).records;
    },

    record: function (tag, keyset) {
        var records = this.records(keyset);
        for (var i in records)
            if (tag === records[i].tag)
                return records[i];
    },

    fieldInfo: function (keyset) {
        var me = this,
            key = me._mapkey(keyset),
            info = me.fieldInfoMap[key];
        return info;
    },

    field: function (keyset) {
        return this.fieldInfo(keyset).field;
    },

    columns: function (keyset) {
        return this.fieldInfo(keyset).columns;
    },

    column: function (tag, keyset) {
        var columns = this.columns(keyset);
        for (var i in columns)
            if (tag === columns[i].tag)
                return columns[i];
    },

    mapTag: function (tag, info) {
        this.tagMap[tag] = info;
    },

    addSrc: function (_rowKeyset, _colKeyset, src, rowSrc, colSrc) {
        var me = this,
            keys = [],
            curRowKey = [],
            curColKey = [],
            srcInfoMap = me.srcInfoMap,
            rowInfoMap = me.rowInfoMap,
            fieldInfoMap = me.fieldInfoMap,
            key, rowKey, colKey;

        function cloneKey(targetKeys) {
            return targetKeys.slice(0);
        }

        function pushKeys() {
            var rowKeyset = cloneKey(curRowKey),
                colKeyset = cloneKey(curColKey),
                parent, child;

            rowKey = me._mapkey(rowKeyset);
            colKey = me._mapkey(colKeyset);
            key = me._mapkey(rowKey, colKey);

            if (!rowInfoMap.hasOwnProperty(rowKey)) {
                parent = me.rowInfo(rowKeyset.slice(0, rowKeyset.length - 1));
                child = rowInfoMap[rowKey] = {
                    key: rowKey,
                    keyset: rowKeyset,
                    parent: parent,
                    children: [],
                    src: rowSrc
                };
                parent && parent.children.push(child);
            }

            if (!fieldInfoMap.hasOwnProperty(colKey)) {
                parent = me.fieldInfo(colKeyset.slice(0, colKeyset.length - 1));
                child = fieldInfoMap[colKey] = {
                    key: colKey,
                    keyset: colKeyset,
                    parent: parent,
                    children: [],
                    src: colSrc
                };
                parent && parent.children.push(child);
            }

            if (!srcInfoMap.hasOwnProperty(key)) {
                srcInfoMap[key] = me.createSrcInfo(key, rowKeyset, colKeyset);
            }

            keys.push(key);
        }

        pushKeys();
        // TODO
        for (var j in _colKeyset) {
            curColKey.push(_colKeyset[j]);
            pushKeys();
        }

        for (var i in _rowKeyset) {
            curColKey = [];
            curRowKey.push(_rowKeyset[i]);
            pushKeys();
            for (var j in _colKeyset) {
                curColKey.push(_colKeyset[j]);
                pushKeys();
            }
        }

        if (src)
            for (var i in keys) { // TODO 이러면 너무 많다.
                srcInfoMap[keys[i]].src.push(src);
            }
    },

    createSrcInfo: function (key, rowKeyset, colKeyset) {
        return {
            key: key,
            rowKeyset: rowKeyset,
            colKeyset: colKeyset,
            src: [],
            curDatasource: [],
            tags: {}
        };
    },

    _mapkey: function () {
        var len = arguments.length,
            keys = [];

        function key(_arr) {
            return _arr.join('_') || 'total';
        }

        if (1 === len)
            if (arguments[0] instanceof Array)
                return key(arguments[0]);
            else
                return key([arguments[0]]);
        else {
            for (var i in arguments) {
                if (arguments[i] instanceof Array)
                    keys.push(key(arguments[i]));
                else
                    keys.push(key([arguments[i]]));
            }
        }

        return keys.join('_');
    }
}, function () {
    return {

        /**
         * key: _mapkey를 이용
         * value: {
     *  key,
     *  src,  // src or array
     *  tags, // key: tag, value: tagValue
     * }
         */
        srcInfoMap: {},

        /**
         * key: _mapkey를 이용
         * value: {
     *  key,
     *  row,
     * }
         */
        rowInfoMap: {},

        /**
         * key: _mapkey를 이용
         * value: {
     *  key,
     *  field,
     * }
         */
        fieldInfoMap: {},

        /**
         * key: string
         * value: rowInfo or fieldInfo
         */
        tagMap: {},

        hashKeyMap: {}
    };
});

X.define('X.pivot.Resolver', {
    resolve: function (resolutions, data) {
        var me = this,
            rowKS = [], // row key set
            colKS = [];

        var dataManager = new X.pivot.DataManager();

        function cloneArray(arr) {
            return arr.slice(0);
        }

        function applyKeySetModel(cur, resolutionIndex, rowContexts, colContexts) {
            var resolution = resolutions[resolutionIndex],
                keyGetter = X.getPropOptGetter(resolution.keyIndex || 'id'),
                nextFunc = resolution.next || function (o) {
                    return o;
                },
                type = resolution.type,
                ks, keyContexts, curContext;

            if ('row' === type) {
                ks = rowKS;
                keyContexts = rowContexts;
            } else if ('column' === type) {
                ks = colKS;
                keyContexts = colContexts;
            } else { // 'cell' TODO tmp도 추가해야 함
                ks = null;
                dataManager.addSrc(rowKS, colKS, cur, X.projectProp(rowContexts, 'record'), X.projectProp(colContexts, 'record'));
                return;
            }

            ks.push(keyGetter(cur, 0));
            curContext = {
                record: cur,
                resolution: resolution
            };
            keyContexts.push(curContext);
            var next = nextFunc(cur);
            if (cur !== next)
                me.isSameModelBetweenHeaderAndCell = false;

            if (next || next.count())
                applyKeySet(next, resolutionIndex + 1, rowContexts, colContexts);
            else
                dataManager.addSrc(rowKS, colKS, undefined, X.projectProp(rowContexts, 'record'), X.projectProp(colContexts, 'record'));
            keyContexts.pop();
            ks.pop();
        }

        function applyKeySet(curs, resolutionIndex, rowContexts, colContexts) {
            (curs instanceof Array) || (curs = [curs]);
            for (var j in curs) {
                var cur = curs[j];
                applyKeySetModel(cur, resolutionIndex, rowContexts, colContexts);
            }
        };

        for (var i = 0; i < data.length; i++) {
            applyKeySet(data[i], 0, [], []);
        }

        return dataManager;
    }
}, function () {
    return {
    }
});