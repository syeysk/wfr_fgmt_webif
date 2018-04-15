var el = document.getElementById("content_std");
for (var i=1; i < 17; i++) {
    el.innerHTML += "<input type='button' value='"+i+"' data-value='0'>";
}

document.getElementById('content_std').addEventListener('click', function(e) {
    if (e.target.tagName !== 'INPUT') return;
    var input = e.target;
    sendform(input, input.value=='LED'?'led':'gpio', {data:{value:input.dataset.value=='0'?'1':'0', channel:input.value},func_success: function(res, input) {input.dataset.value=res.data.value;}, arg_func_success:input});
});

document.getElementById('form_wifi_mode').wifi_mode.value = "{% ee_data.wifi_mode %}";

var cs = new ContentShower({
    navpanel: document.querySelector('.navpanel'),
                           content_prefix: 'content_',
                           content_active: 'std'
});

/*var bp = new BtnPanel({
    btnpanel: document.getElementById("content_btn"),
                      class_prefix: 'btnpanel_',
                      initial_btns: [
                      {name:'Кабинет', children: [
                          {type:'button', name:'Главный свет', ch_name:5, ch_value:0},
                      {type:'button', name:'Ночник', ch_name:6, ch_value:1},
                      {type:'group', name:'Настольный свет', children:[
                          {type:'button', name:'1', ch_name:1, ch_value:1},
                      {type:'button', name:'2', ch_name:2, ch_value:1},
                      {type:'button', name:'3', ch_name:3, ch_value:0},
                      {type:'button', name:'4', ch_name:4, ch_value:1}
                      ]}
                      ]},
                      {name:"Кухня",children:[
                          {type:"group",name:"Газовая плита",children:[
                              {type:"button",name:"1", ch_name:7, ch_value:1},
                      {type:"button",name:"2", ch_name:8, ch_value:0},
                      {type:"button",name:"3", ch_name:9, ch_value:0},
                      {type:"button",name:"4", ch_name:10, ch_value:1},
                      {type:"button",name:"Духовка", ch_name:11, ch_value:0}
                          ]},
                      {type:"button",name:"Главный свет", ch_name:12, ch_value:1},
                      {type:"button",name:"Вытяжка", ch_name:13, ch_value:0}
                      ]}
                      ]
});*/
