/*
Author: Polyakov Konstantin
Licence: Domain Public

You can use this code for everything! But be very carefull :)

P.S. This file is simple version for /core_client/functions.js from WBS Engine (http://github.com/wbstreet/wbs_core)
*/ 

/* from functions.js */

function Request(method, url, post, async_func) {
    if (url === undefined) url = 'api.c'; 
    
    post = post || '';
    async_func = async_func || null;
    
    if (async_func === null) {var is_async = false;} else {var is_async = true;}
    
    var req = new XMLHttpRequest();
    req.open(method, url, is_async);
    req.send(post);
    
    if (is_async) {req.onreadystatechange = async_func;}
    return req;
}

function RequestAction(action_name, url, arr, async_func) {
    async_func = async_func || null;
    var form = new FormData();
    form.append('action', action_name);
    for (var name in arr) {
        if (!arr.hasOwnProperty(name)) {continue;}
        if (arr[name] instanceof FileList || arr[name] instanceof Array) {
            for(var i=0; i < arr[name].length; i++) form.append(name, arr[name][i]);
        }else {form.append(name, arr[name]);}
    }
    
    return Request('post', url, form, async_func)
}
function del_casper(text) {
    // удаляем касперского, а адекватное другое решение позже реализую
    return text.replace(/<script type="text\/javascript" src="http:\/\/gc\.kis\.v2\.scr\.kaspersky-labs\.com\/[-A-Z0-9]+\/main\.js" charset="UTF-8"><\/script>/, '');
}

function RA_raw(action, data, options) {
    options['func_after'] = options['func_after'] || options['func_after_load'];
    
    RequestAction(action, options['url'], data, function() {
        if (this.readyState != 4) return;
                  if (this.status==200) {
                      
                      
                      var res = del_casper(this.responseText);
                      if (options['not_json']) {
                          res = {success:1, message:res};
                      } else res = JSON.parse(res);
                  
                  if (options['func_after']) options['func_after'](res);
                  
                  if (res['success'] == 1) {
                      if (options['func_success']) options['func_success'](res, options['arg_func_success']);
                  } else {
                      if (options['func_error']) options['func_error'](res, options['arg_func_error']);
                  }
                  
                  if (res['location']) window.location = res['location'];
                  if (res['content']) options['content_tag'].innerHTML = res['content'];
                  
                  } else if (!navigator.onLine) {
                      if (options['func_fatal']) options['func_fatal']('Нет соединения с Интернет');
                  } else {
                      if (options['func_fatal']) options['func_fatal']('Неизветсная ошибка');
                  }
    });
}

function show_button_message(button, message, timeout) {
    var process;
    if (button.nextSibling === null || button.nextSibling.className != 'RA_ButtonProgress') {
        process = document.createElement('span');
        process.style.marginLeft = '10px';
        process.className = 'RA_ButtonProgress';
        button.parentElement.insertBefore(process, button.nextSibling);
    } else {process = button.nextSibling;}
    //process.textContent = message;
    process.innerHTML = message;
    if (timeout) setTimeout(function() {process.remove();}, timeout);
}

function animate_element(el, name) {
    el.classList.add(name);
    setTimeout(function() {el.classList.remove(name);}, 600);
}

function light_absent_fields(form, absent_fields) {
    var i, field;
    /*      for (i = 0; i<absent_fields.length; i++) {
     *               field = absent_fields[i];
     *               field = form.elements[field];
     *               if (field !== undefined) field.style.border = border;
}*/
    if (form === null || form === undefined) return;
    for (i = 0; i<form.elements.length; i++) {
        field = form.elements[i];
        if (field.type == 'button') continue;
        if (absent_fields.indexOf(field.name) != -1) {field.style.border = '1px solid red'; field.style.background = '#ffe6e6';}
        else {
            field.style.border = null; field.style.background = null;
            
            //field.style.border = '1px solid green'; field.style.background = '#e6ffe6';
        }
    }
}

function RA_ButtonProgress(action, data, button, sending_text, func_success, options) {
    sending_text = sending_text || "Отправляется...";
    show_button_message(button, sending_text)
    options = options || [];
    
    RA_raw(action, data, {
        func_success: function(res) {
            var timeout = res['timeout'] !== undefined ? res['timeout'] : 3000 ;
            show_button_message(button,  res['message'], timeout);
            light_absent_fields(button.form, []) // уберём красноту с полей, если они до этого были неверными.
            if (func_success) func_success(res, options['arg_func_success']);
        },
        func_error: function(res) {
            show_button_message(button, 'ошибка: '+res['message']);
            animate_element(button, 'btn-err')
            if (res['absent_fields'] !== undefined) light_absent_fields(button.form, res['absent_fields']);
           if (options['func_error']) options['func_error'](res, options['arg_func_error']);
        },
        func_fatal: function(res) {
            show_button_message(button, 'неизвестная ошибка(');
        },
        url: options['url'],
        func_after: options['func_after'],
        wb_captcha_img: options['wb_captcha_img']
    })
}

function showNotification(message, _type, time) {
    time = time || 8000;
    var notes = document.getElementById('notes');
    if (!notes) {
        notes = document.createElement('div'); notes.id = 'notes';
        document.body.appendChild(notes);
    }
    notification_colors = {'note': '#3f3', 'error':'#f55'};
    if (notes.children.length > 2) notes.lastChild.remove();
    
    var note = document.createElement('div');
    note.style.color = notification_colors[_type];
    note.className = 'note';
    note.innerHTML = message;
    notes.insertBefore(note, notes.firstChild);
    if (typeof zi !== 'undefined') zi.add(notes, 'top');
    setTimeout(function(){if (typeof zi !== 'undefined') zi.remove(note);note.remove();}, time);
}

function RA_Notification(action, data, func_success, options) {
    options.sending_text = options.sending_text || "Отправляется...";
    showNotification(options.sending_text, 'note', 2000);
    
    RA_raw(action, data, {
        func_success: function(res) {
            var timeout = res['timeout'] !== undefined ? res['timeout'] : 3000 ;
            showNotification(res['message'], 'note', timeout);
            if (func_success) func_success(res, options['arg_func_success']);
        },
        func_error: function(res) {
            var timeout = res['timeout'] !== undefined ? res['timeout'] : 7000 ;
            showNotification('ошибка сервера: '+res['message'], 'error', timeout);
        },
        func_fatal: function(res) {
            showNotification('неизвестная ошибка(', 'error');
        },
        url: options['url'],
        func_after: options['func_after']
    })
}

// можно передавать массивы в качестве значения
function get_form_fields(form, ignore_fields) {
    var el,
    value,
    data = {},
    ret;
    ignore_fields = ignore_fields || [];
    
    for (var i = 0; i< form.elements.length; i+=1) {
        el = form.elements[i];
        if (el.name === undefined || el.name === '' || ignore_fields.indexOf(el.name) != -1) continue;
        
        if (form[el.name].tagName !== undefined) { // если это элемент
            if (el.type == 'checkbox' || el.type == 'radio') value = el.checked;//if (el.hasOwnProperty('checked')) value = el.checked;
            else if (el.type == 'file') value = el.files;
            else value = el.value;
        } else { // если это коллекция элементов с одинаковым 'name'
            value = [];
            for (var j=0; j < form[el.name].length; j++ ) {
                var _el = form[el.name][j];
                if (el.type == 'checkbox' || el.type == 'radio') {
                    if (_el.checked) value[value.length] = _el.value;
                } else if (_el.type == 'file') {
                    value.concat(new Array(_el.files));
                } else{
                    value[value.length] = _el.value;
                }
            }
            ignore_fields.push(el.name);
        }
        data[el.name] = value;
    }
    
    return data;
}

// функци options['func_filter'] в случае верности возвращает true, иначе - текст ошибки.
function sendform(button, action, options) {
    if (options === undefined) options = {};
    
    options['func_success'] = options['func_success'] || options['func_after_success'];
    
    // получаем форму, если указана
    if (options['form'] === undefined && button) {
        if (button.form != null && button.form != undefined) options['form'] = button.form;
        else if (button.closest('form') != null && button.closest('form') != undefined) options['form'] = button.closest('form');
    }
    // значения по умолчанию
    if (options['func_transform_fields'] === undefined) { options['func_transform_fields'] = function(fields, form) {return fields;}; }
    if (options['func_filter'] === undefined) { options['func_filter'] = function(fields) {return true;}; }
    if (options['answer_type'] === undefined) { options['answer_type'] = 'Notification'; }
    
    // получаем данные с формы, модифицируем и фильтруем
    if (options['form'] !== undefined) { var fields = get_form_fields(options['form']); }
    else {var fields = {};}
    fields = options['func_transform_fields'](fields, options['form']);
    var is_true = options['func_filter'](fields); // is_true в случае ошибки должен возвратить массив ошибок
    
    if (options['data'] !== undefined) {
        for (var prop in options['data']) {
            if (options['data'].hasOwnProperty(prop)) fields[prop] = options['data'][prop];
        }
    }
    
    // отсылаем данные на сервер
    if (typeof is_true == 'string') is_true = [is_true];
    if (options['answer_type'] == 'ButtonProgress') {
        if (is_true === true) RA_ButtonProgress(action, fields, button, 'Отправляем...', options['func_success'], options);
        else show_button_message(button, is_true.join('<br>'));
    } else if (options['answer_type'] == 'Notification') {
        if (is_true === true) RA_Notification(action, fields, options['func_success'], options);
        else showNotification(is_true.join('<br>'), 'error');
    }
}

function ZIndex(start_index) {
    var self = this;
    start_index = start_index || 1;
    
    this.els = [];
    
    this.lift = function(el, level) {
        if (level == 'top') {
            self.remove(el);
            self._add(el, 'top');
        }
    };
    
    this._add = function(el, level) {
        if (level == 'top') {
            self.els[self.els.length] = el;
            el.style.zIndex = self.els.length-1+start_index;
        }
    };
    this.ev_to_top = function(e) {zi.lift(e.currentTarget, 'top');}
    this.add = function(el, level) {
        self._add(el, level);
        el.addEventListener('mousedown', self.ev_to_top);
        el.addEventListener('touchstart', self.ev_to_top, {passive:true});
    };
    this.remove = function(el, level) {
        self.els.splice(parseInt(el.style.zIndex), 1);
        self.indexate();
    };
    
    this.indexate = function() {
        for (var i=0; i<self.els.length; i++) self.els[i].style.zIndex = i+start_index;
    };
}

// start_index = 2, так как навигационная панель имеет значение z-index = 1
var zi = new ZIndex(2);

/**
 * Запускает скрипты в коде html, вставленнном в страницу.
 */
function run_inserted_scripts(tag) {
    var ss = tag.getElementsByTagName("SCRIPT")
    for (var i = 0; i < ss.length; i++) {
        var s = ss[i]
        var g = document.createElement("SCRIPT");
        if (s.src!='') { g.src = s.src; } // также подключает внешние скрипты
        else {
            blob = unescape( encodeURIComponent(s.text));
            g.src = "data:text/javascript;charset=utf-8;base64,"+btoa(blob)
        }
        g.async = false;
        s.parentElement.insertBefore(g, s)
        s.remove()
    }
}

function set_params(params, options) {
    if (options === undefined) options = [];
    if (options.reload === undefined) options.reload = true;
    if (options.search === undefined) options.search = location.search;
    if (options.url === undefined) options.url = location.protocol +'//'+ location.host + location.pathname;
        
        let search = new URLSearchParams(options.search);
    for (let param in params) {
        if (!params.hasOwnProperty(param)) continue;
        if (params[param] === null) search.delete(param);
        
        else search.set(param, params[param]);
    }
    
    if (options.reload) {
        //window.location.search = search.toString();
        window.location.href = options.url +'?'+ search.toString();
    } else {
        return search.toString();
    }
}

function DND(element, options) {
    function end(e) {
        console.log('Выход');
        document.removeEventListener('mousemove', move);
        document.removeEventListener('mouseup', end);
        document.removeEventListener('touchmove', move);
        document.removeEventListener('toucend', end);
        document.body.onmousedown = function() {return true;}; // включаем  выделение текста
        if (!options.first) {
            if (options['up']) options['up'](e, options);
            var over_el = get_over_el(e);
            if (options['drop']) options['drop'](e, options, over_el, options.prev_over_el);
            if (options['overout']) options['overout'](e, options, options.prev_over_el);
        }
    }
    
    function move(e) {
        if (options.first) {
            console.log('Первое передвижение. Определяем, клик это или движение');
            if (check_start(e)) {
                console.log('Передвижение подтверждено. Это движение');
                if (options['down']) options['down'](e, options);
                options.first = false;
            } else {console.log('Передвижение не подтвержденою Это клик'); end(e); return;}
        }
        var over_el = get_over_el(e); // координаты меняются во время движенеия
        options.el_over = over_el;

        if (options['move']) options['move'](e, options);

        //if (over_el !== options.prev_over_el && over_el.target !== options.e_moved.target) { // координаты не меняются. Фиксирутся только факт наведения/убирания.
            if (options['overenter']) options['overenter'](e, options, over_el);
            if (options['overout']) options['overout'](e, options, options.prev_over_el);
        //}
        options.prev_over_el = over_el;
    }
    
    function check_start(e) {
        //return true;
        var e = (e.changedTouches) ? e.changedTouches[0] : e;
        console.log('    ', Math.abs(options.downX - e.pageX), Math.abs(options.downY - e.pageY));
        return Math.abs(options.downX - e.pageX) >= 1 || Math.abs(options.downY - e.pageY) >= 1;
    }

    function init_start(e) { // drag and drop
        var _e = (e.touches) ? e.touches[0] : e;
        if (!_e.target.closest(options.moved)) return;
        console.log('Инициализация...');
        e.currentTarget.ondragstart = function() {return false;}; // выключаем стандартный drag-n-drop
        document.body.onmousedown = function() {return false;}; // выключаем  выделение текста
        options['data'] = options['data'] || {};
        options['data']['isSensorDisplay'] = e.touches === undefined ? false : true
        
        options.e_moved = _e;
        options.downX = _e.pageX; options.downY = _e.pageY;options.first = true;
        options.prev_over_el = null;
        
        document.addEventListener('mousemove', move);
        document.addEventListener('touchmove', move);
        document.addEventListener('mouseup',  end);
        document.addEventListener('touchend', end);
    }
    
    function get_over_el(e) {
        var e = (e.changedTouches) ? e.changedTouches[0] : e;;
        options.e_moved.target.hidden = true;
        var over_el = document.elementFromPoint(e.clientX, e.clientY);
        options.e_moved.target.hidden = false;
        return over_el;
        //if (over_el === null) return;
    }
    
    element.addEventListener('mousedown', init_start); // для мыши
    element.addEventListener('touchstart', init_start, {passive:true}); // для сенсорного дисплея
}

/* ------------------ for WI-FI Relay ------------------ */

function ei_calc_size(field) {
    field.parentElement.querySelector('.ei_size').textContent = field.value.length;
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
    },func_success: function(res, input) {input.dataset.value=res.data.value;}, arg_func_success:input});
}

/* Обновляет всю информацию на странице */

function update_data() {
    sendform(null, 'get_data', {func_success: function(res, arg) {
        //alert(JSON.stringify(res));

        bp.build_panel(JSON.parse(res.data.bt_panel)); // строим панель до обновления состояния кнопок

        for (let btn of document.body.querySelectorAll('.btns_button')) {
            if (btn.classList.contains('btns_editing')) continue;
             
             if (btn.dataset.name == 'led') btn.dataset.value = res.data.gpio_led;
             else btn.dataset.value = (res.data.gpio_std >> parseInt(btn.dataset.name)) & 1;
        }

        document.getElementById('stat_vcc').textContent = res.data.stat.vcc;
        document.getElementById('stat_time').textContent = res.data.stat.time_h +":"+ res.data.stat.time_m +":"+ res.data.stat.time_s;

        document.getElementById('stat_rtc').textContent = res.data.stat.rtc_year +"-"+ res.data.stat.rtc_month +"-"+ res.data.stat.rtc_day +" "+ res.data.stat.rtc_h +":"+ res.data.stat.rtc_m +":"+ res.data.stat.rtc_s  +" "+ res.data.stat.rtc_is;
        let d = get_rtc_browser();
        document.getElementById('stat_rtc_browser').textContent = d.date +" "+ d.time;

        document.getElementById('form_device_name').device_name.value = res.data.settings.device_name;
        
        document.getElementById('form_wifi_mode').wifi_mode.value = res.data.settings.wifi_mode;
        
        document.getElementById('form_wifi_wifi').password.value = res.data.settings.password;
        document.getElementById('form_wifi_wifi').ssid.value = res.data.settings.ssid;
        document.getElementById('form_wifi_wifi').passwordAP.value = res.data.settings.passwordAP;
        document.getElementById('form_wifi_wifi').ssidAP.value = res.data.settings.ssidAP;

        document.getElementById('form_rtc').date.value = res.data.stat.rtc_year +"-"+ res.data.stat.rtc_month +"-"+ res.data.stat.rtc_day;
        document.getElementById('form_rtc').time.value = res.data.stat.rtc_h +":"+ res.data.stat.rtc_m;
    }});
}

function get_rtc_browser() {
    let d = new Date();
    return {
        date: d.getFullYear().toString().padStart(4, '0')+'-'+(d.getMonth()+1).toString().padStart(2, '0')+'-'+d.getDate().toString().padStart(2, '0'),
        time: d.getHours().toString().padStart(2, '0')+':'+d.getMinutes().toString().padStart(2, '0') +':'+ d.getSeconds().toString().padStart(2, '0')
    };
}

/*
 * Класс для панел навигацими по вкладкам
 */
class ContentShower {
    
    /* opts.navpanel, opts.content_prefix, opts.content_active
     * opts.func_after_show
     */
    constructor(opts) {
        
        this.opts = opts;
        this.show(opts.content_active);
        
        this.ev_show = this.ev_show.bind(this);
        
        opts.navpanel.addEventListener('click', this.ev_show);
        
        
    }
    
    show(cname_new) {
        let cname_old = this.opts.content_active;
        this.opts.content_active = cname_new;
        
        document.getElementById(this.opts.content_prefix + cname_old).classList.remove('content_active');
        document.getElementById(this.opts.content_prefix + cname_new).classList.add('content_active');
        
        this.opts.navpanel.querySelector('[data-content='+cname_old+']').classList.remove('active');
        this.opts.navpanel.querySelector('[data-content='+cname_new+']').classList.add('active');
    }
    
    ev_show(e) {
        if (!e.target.dataset.content) return;
        this.show(e.target.dataset.content);
        if (this.opts.func_after_show) this.opts.func_after_show();
    }
}