var el = document.getElementById("btns");
for (var i=1; i < 17; i++) {
    el.innerHTML += "<input type='button' value='"+i+"' data-value='0' data-name='"+(i-1)+"' class='btns_button'>";
}
document.getElementById('btns').addEventListener('click', btn_click);

var cs = new ContentShower({
    navpanel: document.querySelector('.navpanel'),
    content_prefix: 'content_',
    content_active: 'std',
    func_after_show: update_data
});

// [{"name":"Кабинет","children":[{"type":"button","name":"Главный свет","ch_name":"6"},{"type":"group","name":"Настольный свет","children":[{"type":"button","name":"1","ch_name":"0"},{"type":"button","name":"2","ch_name":"1"},{"type":"button","name":"3","ch_name":"2"},{"type":"button","name":"4","ch_name":"3"},{"type":"button","name":"нижний","ch_name":"4"}]}]},{"name":"Кухня","children":[{"type":"group","name":"Газовая плита","children":[{"type":"button","name":"1","ch_name":"7"},{"type":"button","name":"2","ch_name":"8"},{"type":"button","name":"3","ch_name":"9"},{"type":"button","name":"4","ch_name":"10"},{"type":"button","name":"Духовка","ch_name":"11"}]},{"type":"button","name":"Главный свет","ch_name":"12"},{"type":"button","name":"Вытяжка","ch_name":"13"}]}]

var bp = new BtnPanel({
    btnpanel: document.getElementById("content_btn"),
    class_prefix: 'btnpanel_'/*,
    initial_btns: [
        {name:'Кабинет', children: [
            {type:'button', name:'Главный свет', ch_name:6},
            {type:'group', name:'Настольный свет', children:[
                {type:'button', name:'1', ch_name:0},
                {type:'button', name:'2', ch_name:1},
                {type:'button', name:'3', ch_name:2},
                {type:'button', name:'4', ch_name:3},
                {type:'button', name:'нижний', ch_name:4}
            ]}
        ]},
        {name:"Кухня",children:[
            {type:"group",name:"Газовая плита",children:[
                {type:"button",name:"1", ch_name:7},
                {type:"button",name:"2", ch_name:8},
                {type:"button",name:"3", ch_name:9},
                {type:"button",name:"4", ch_name:10},
                {type:"button",name:"Духовка", ch_name:11}
            ]},
            {type:"button",name:"Главный свет", ch_name:12},
            {type:"button",name:"Вытяжка", ch_name:13}
        ]}
    ]*/
});


update_data();