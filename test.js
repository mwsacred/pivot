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










