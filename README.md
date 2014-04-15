Pivot table
=====
javascript pivot table

>## Feature
>+  display fixed row/column header
>
>## TODO
>+  configuration of row/column header
>+  cell renderer/style
>+  resizing columns
>+  browser compatibility: ie8+, ff, safari
>+  Progress bar / loading mask

sample page: test.html

in test.js:

    var tbl = new X.pivot.Pivot(document.getElementById('targetTbl'), resolutions);
    tbl.setData(data);

resolutions in test.js:

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


XUtil
=====
class define helper, util, getter fn util

한글 제대로되나

ㅎㅎㅎㅎㅎㅎ