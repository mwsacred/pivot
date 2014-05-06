Resizer
=====
아직 개발되지 않음. 갖춰야 할 기능을 정리해 본다.
>1.  기본적으로 mousedown/up으로 크기 조정이 시작되고 멈춘다.
>2.  함수를 호출하여 크기를 조정할 수 있어야 한다.
>3.  크기 조정이 시작되면 멈추기 전에 텍스트 선택이 되지 않아야 한다.
>4.  크기 조정이 시작되면 어떤 크기로 조정될 것인지 시각화되어야 한다.
>5.  크기 조정을 시작하는 element와 조정될 크기가 적용되는 element는 다를 수 있다.
>>+  예) th로 시작하고 끝내나 크기는 col이 조정될 수 있다.
>6.  크기 조정을 시작하는 element와 어떤 크기로 조정될 것인지 시각화하는 element 또는 그래픽은 크기가 다를 수 있다.
>>+  예) th로 시작하고 끝내나 현재 어떤 크기로 조정될 것인지 나타내주는 element의 height는 table의 height와 같을 수 있다.
>7.  width나 height 중 하나만 혹은 둘 다 조정될 수 있다.
>>+  6.과 양립할 수 없는 경우가 생길 수 있다.
>8.  크기 조정 시 다른 element의 크기가 또 다시 자동으로 조정될 수도 있다.
>>+  예) 어떤 ux에서는 th의 왼쪽으로 크기를 늘리면 th의 previousSibling의 크기는 줄어들 수 있다.
>>+  예) 어떤 ux에서는 th의 오른쪽으로 크기를 늘리면 th의 nextSibling의 크기는 줄어들지 않을 수 있다.
>>>+  이 경우 th들은 table의 %로 크기에 딱 맞게끔 구성되었을 수 있으나 크기 조정 후 스크롤 바가 생기고 조정된 th들은 %가 아닌 다른 형태로 크기가 조정되어야 한다.
>>+  예) 어떤 ux에서는 colspan된 th의 크기를 늘리면 다음 tr의 colspan에 해당하는 th들은 늘린 크기를 나누어 적용받을 수 있다.
>9.  크기가 조정되는 방향은 고정될 수 있다.
>>+  예) 어떤 ux에서는 div의 오른쪽 모서리 근처를 mousedown하여 크기 조정을 시작하면 왼쪽의 위치는 고정되면 오른쪽의 위치만 변동되면서 크기를 조정한다.
>10.  조정되는 크기는 min/max로 제한될 수 있다.
>11.  mousedown으로 크기 조정이 시작되는 영역은 제한될 수 있어야 한다.
>>+  예) div의 오른쪽 모서리 근처를 mousedown했을 때 크기 조정이 시작된다. 중앙을 mousedown하면 크기 조정이 시작되지 않는다.
>12.  8.과 관련하여 자동으로 조정될 element와 그 크기를 설정할 수 있어야 한다.


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