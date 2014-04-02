var resolver = new X.pivot.Resolver();

var resolutions = [
    {
        type: 'row',
        keyIndex: 'level1Name',
        sortIndex: 'orderNum',

        columns: [{
            text: '레벨1',
            field: 'level1Name'
        }],

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
        sortIndex: 'orderNum'
    },
    {
        type: 'column',
        keyIndex: function (o) {
            return o.accountingDate.getFullYear();
        },
        column: {
            textIndex: 'dd'
        }
    },
    {
        type: 'column',
        keyIndex: function (o) {
            return o.accountingDate.getMonth() + 1;
        },
        reductions: [
            {
                cal: 'avg',
                data: { 'level2Name': '합계' },
                renderer: null
            }
        ]
    },
    {
        type: 'cell',
        keyIndex: 'amount'
    }
];

var cur = new Date().getTime();
var dm = resolver.resolve(resolutions, data);
console.log("resolve : " + -(cur - (cur = new Date().getTime())));

var vm = new X.pivot.ViewModel();
vm.initVM(resolutions, dm);
console.log("constructVM : " + -(cur - (cur = new Date().getTime())));


var r = new X.pivot.Renderer();
r.render(vm);

console.log("render : " + -(cur - (cur = new Date().getTime())));










