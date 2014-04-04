var resolver = new X.pivot.Resolver();

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
                    textIndex: '합계'
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

X.__intervalCheck();
var dm = resolver.resolve(resolutions, data);
console.log("resolve : " + X.__intervalCheck());

var vm = new X.pivot.ViewModel();
vm.initVM(resolutions, dm);
console.log("constructVM : " + X.__intervalCheck());


var r = new X.pivot.Renderer(document.getElementById('body'));
r.render(vm);

console.log("render : " + X.__intervalCheck());










