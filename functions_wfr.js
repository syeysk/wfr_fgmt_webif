/*
Author: Polyakov Konstantin
Licence: Domain Public

You can use this code for everything! But be very carefull :)

P.S. This file is simple version for /core_client/functions.js from WBS Engine (http://github.com/wbstreet/wbs_core)
*/ 

/* from functions.js */


/* ------------------ for WI-FI Relay ------------------ */

function ei_calc_size(field) {
    field.parentElement.querySelector('.ei_size').textContent = field.value.length;
    field.parentElement.querySelector('.ei_free').textContent = parseInt(field.parentElement.querySelector('.ei_max').textContent) - field.value.length;
}

/* Действие при нажатии на кнопку изменения состояния канала */

function btn_click(e) {
    if (!e.target.classList.contains('btns_button')) return;
    if (e.target.classList.contains('btns_editing')) return;
    var input = e.target;
    sendform(input, input.dataset.name=='led'?'led':'gpio', {data:{
        value:input.dataset.value=='0'?'1':'0',
        channel:input.dataset.name,
        delay_press:input.dataset.delay_press == undefined ? "0" : input.dataset.delay_press,
        timer:input.dataset.timer == undefined ? "0" : input.dataset.timer,
    },func_success: function(res, input) {
        var btns = document.body.querySelectorAll('input[type="button"][data-name="'+input.dataset.name+'"]');
        for (btn of btns) btn.dataset.value=res.data.value
        input.dataset.value=res.data.value;
    }, arg_func_success:input});
}

/* Обновляет всю информацию на странице */
/* data_type - должна соответствовать идентификатору вкладки
 */
function update_data(data_type='all', build_btns=false, showing_message=true) {
    sendform(null, 'get_data', {answer_type: showing_message ? undefined : 'ButtonProgress', data: {data_type:data_type}, func_success: function(res, arg) {
        //alert(JSON.stringify(res));

        if (data_type === 'btn' || data_type === 'all') { // строим панель до обновления состояния кнопок
        
            bp.build_panel(JSON.parse(res.data.bt_panel));
            document.getElementById("ei_max").textContent = res.data.max_size;

        }
        if (data_type === 'std' || data_type === 'btn' || data_type === 'all') {

            if (build_btns) {
                var btns = document.getElementById("btns");
                for (var i=1; i < 17; i++) {
                    btns.innerHTML += "<input type='button' value='"+i+"' data-value='0' data-name='"+(i-1)+"' class='btns_button'>";
                    // выделяем розетки
                    if (i-1 < res.data.count_outlets) {
                        var btn = btns.lastElementChild;
                        btn.style.borderRadius = "32px";
                        if (i === res.data.count_outlets) btns.insertBefore(document.createElement('br'), btn.nextElementSibling);
                    }
                }
                
                /*// выделяем розетки
                for (var i = res.data.count_outlets-1; i >= 0 ; i--) {
                    var el = document.getElementById('btns').querySelector('input[data-name="'+i+'"]');
                    el.style.borderRadius = "32px";
                }
                if (res.data.count_outlets !== 0) document.getElementById('btns').insertBefore(document.createElement('br'), document.getElementById('btns').querySelector('input[data-name="'+(res.data.count_outlets-1)+'"]').nextElementSibling);
                */
            }
            
            for (let btn of document.body.querySelectorAll('.btns_button')) {
                if (btn.classList.contains('btns_editing')) continue;
             
             if (btn.dataset.name == 'led') btn.dataset.value = res.data.gpio_led;
             else btn.dataset.value = (res.data.gpio_std >> parseInt(btn.dataset.name)) & 1;
            }
        }
        if (data_type === 'std' || data_type === 'all') {
            document.getElementById('stat_vcc').textContent = res.data.stat.vcc;
            document.getElementById('stat_time').textContent = res.data.stat.time_h +":"+ res.data.stat.time_m +":"+ res.data.stat.time_s;
            
            document.getElementById('stat_rtc').textContent = res.data.stat.rtc_year +"-"+ res.data.stat.rtc_month +"-"+ res.data.stat.rtc_day +" "+ res.data.stat.rtc_h +":"+ res.data.stat.rtc_m +":"+ res.data.stat.rtc_s  +" "+ res.data.stat.rtc_is;
            let d = get_rtc_browser();
            document.getElementById('stat_rtc_browser').textContent = d.date +" "+ d.time;
        }
        if (data_type === 'set' || data_type === 'all') {

            document.getElementById('form_device_name').device_name.value = res.data.settings.device_name;
        
            document.getElementById('form_wifi_mode').wifi_mode.value = res.data.settings.wifi_mode;
        
            document.getElementById('form_wifi_wifi').password.value = res.data.settings.password;
            document.getElementById('form_wifi_wifi').ssid.value = res.data.settings.ssid;
            document.getElementById('form_wifi_wifi').passwordAP.value = res.data.settings.passwordAP;
            document.getElementById('form_wifi_wifi').ssidAP.value = res.data.settings.ssidAP;

            document.getElementById('form_rtc').date.value = res.data.stat.rtc_year +"-"+ res.data.stat.rtc_month +"-"+ res.data.stat.rtc_day;
            document.getElementById('form_rtc').time.value = res.data.stat.rtc_h +":"+ res.data.stat.rtc_m;

            document.getElementById('form_other').update_time.value = res.data.settings.update_time;
        }
        
        cs.updater_set_time(res.data.update_time);
    }});
}

function get_rtc_browser() {
    let d = new Date();
    return {
        date: d.getFullYear().toString().padStart(4, '0')+'-'+(d.getMonth()+1).toString().padStart(2, '0')+'-'+d.getDate().toString().padStart(2, '0'),
        time: d.getHours().toString().padStart(2, '0')+':'+d.getMinutes().toString().padStart(2, '0') +':'+ d.getSeconds().toString().padStart(2, '0')
    };
}
