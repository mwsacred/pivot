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