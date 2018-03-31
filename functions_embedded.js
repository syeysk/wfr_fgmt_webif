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
                  if (window.grecaptcha && data['grecaptcha_widget_id']) grecaptcha.reset(data['grecaptcha_widget_id']); // сбрасываем капчу гугла
                  if (options['wb_captcha_img']) wb_captcha_reload(options['wb_captcha_img']); // сбрасываем капчу websitebaker
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
    time = time || 7000;
    var notes = document.getElementById('notifications');
    if (!notes) {
        notes = document.createElement('div'); notes.id = 'notifications';
        notes.style.position = "fixed";
        notes.style.top = "15px";
        notes.style.right = "15px";
        document.body.appendChild(notes);
    }
    notification_colors = {'note': '#3f3', 'error':'#f55'};
    
    var note = document.createElement('div');
    note.style.color = notification_colors[_type];
    note.style.background = "#222";
    note.style.padding = "20px";
    note.style.marginBottom = "10px";
    note.className = 'notification';
    note.innerHTML = message;//note.appendChild(document.createTextNode(message));
    notes.appendChild(note);
    zi.add(notes, 'top');
    setTimeout(function(){zi.remove(note);note.remove();}, time);
}

function RA_Notification(action, data, func_success, options) {
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
        func_after: options['func_after'],
        wb_captcha_img: options['wb_captcha_img']
    })
}

// for checkboxes and [radio]
function set_checkbox(checkboxes, values) {
    // form = document.forms['имя формы']; checkboxes = form['имя флажков'];
    for (var i=0; i< checkboxes.length; i++ ) {
        var cb = checkboxes[i];
        if (values.indexOf(cb.value) == -1) continue;
        cb.checked = true;
    }
}

function get_checkbox(checkboxes) {
    var checkboxes_arr = [];
    for (var i=0; i< checkboxes.length; i++ ) {
        var cb = checkboxes[i];
        if (!cb.checked) continue;
        checkboxes_arr[checkboxes_arr.length] = cb.value;
    }
    return checkboxes_arr;
}


function proccess_value(value, name, form, direction) {
    var ret = [value, undefined];
    
    if (form.name === undefined) return ret;
    if (process_form_fields[form.name] === undefined) return ret;
    if (process_form_fields[form.name][name] === undefined) return ret;
    if (process_form_fields[form.name][name][direction] === undefined) return ret;
    var pff = process_form_fields[form.name][name][direction];
    
    var results = [];
    
    if (direction == 'fromForm') {
        
        if (pff['filterBeforeTransform'] !== undefined) {
            var result1 = pff['filterBeforeTransform'](value);
            if (result1 !== undefined || result1 !== true) return [value, result1];
        }
        if (pff['transformValue'] !== undefined) value = pff['transformValue'](value);
        if (pff['filterAfterTransform']  !== undefined) {
            var result2 = pff['filterAfterTransform'](value);
            if (result2 !== undefined || result2 !== true) return [value, result2];
        }
        
    }
    
    return [value, undefined];
    
}

// можно передавать массивы в качестве значения
function get_form_fields(form, ignore_fields, use_filter) {
    var el,
    value,
    data = {},
    ret;
    ignore_fields = ignore_fields || [];
    use_filter = use_filter || false;
    
    for (var i = 0; i< form.elements.length; i+=1) {
        el = form.elements[i];
        if (el.name === undefined || el.name === '' || ignore_fields.indexOf(el.name) != -1) continue;
        
        if (form[el.name].tagName !== undefined) { // если это элемент
            if (el.type == 'checkbox' || el.type == 'radio') value = el.checked;//if (el.hasOwnProperty('checked')) value = el.checked;
            else if (el.type == 'file') value = el.files;
            else value = el.value;
            
            // фильтрация и преобразования значения
            if (use_filter) {
                ret = proccess_value(value, el.name, form, 'fromForm')
                if (ret[1] == undefined || ret[1] == true) value = ret[0];
                else return {'data': data, 'is_error':true,  'error': ret[1]};
            }
            
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
    
    if (use_filter) return {'data': data, 'is_error':false};
    else return data;
}

// функци options['func_filter'] в случае верности возвращает true, иначе - текст ошибки.
function sendform(button, action, options) {
    if (options === undefined) options = {};
    
    options['func_success'] = options['func_success'] || options['func_after_success'];
    
    // получаем форму, если указана
    if (options['form'] === undefined) {
        if (button.form != null && button.form != undefined) options['form'] = button.form;
        else if (button.closest('form') != null && button.closest('form') != undefined) options['form'] = button.closest('form');
    }
    // значения по умолчанию
    if (options['func_transform_fields'] === undefined) { options['func_transform_fields'] = function(fields, form) {return fields;}; }
    if (options['func_filter'] === undefined) { options['func_filter'] = function(fields) {return true;}; }
    if (options['answer_type'] === undefined) { options['answer_type'] = 'ButtonProgress'; }
    
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
    function dnd(e) { // drag and drop
        e.currentTarget.ondragstart = function() {return false;};
        document.body.onmousedown = function() {return false;}; // выключаем  выделение текста
        options['data'] = options['data'] || {};
        options['data']['isSensorDisplay'] = e.touches === undefined ? false : true
        
        if (options['down']) options['down'](e, options['data']);
        
        function end(e) {
            document.removeEventListener('mousemove', move);
            document.removeEventListener('mouseup', end);
            document.removeEventListener('touchmove', move);
            document.removeEventListener('toucend', end);
            document.body.onmousedown = function() {return true;}; // включаем  выделение текста
            if (options['up']) options['up'](e, options['data']);
        }
        
        function move(e) {
            if (options['move']) options['move'](e, options['data']);
        }
        document.addEventListener('mousemove', move);
        document.addEventListener('mouseup',  end);
        document.addEventListener('touchmove', move);
        document.addEventListener('touchend', end);
    }
    
    var _dnd = dnd;
    element.addEventListener('mousedown', _dnd); // для мыши
    element.addEventListener('touchstart', _dnd, {passive:true}); // для сенсорного дисплея
}

/* ------------------ for WI-FI Relay ------------------ */

/*
 * Класс для панел навигацими по вкладкам
 */
class ContentShower {
    
    /* opts.navpanel, opts.content_prefix, opts.content_active
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
    }
}

class BtnPanel {

    /* opts.btnpanel, opts.class_prefix
     */
    constructor(opts) {
        
        this.opts = opts;
        
        this.ev_click = this.ev_click.bind(this);
        this.opts.btnpanel.addEventListener('click', this.ev_click);
        
        this.opts.btn_mode_editing = this.opts.btnpanel.querySelector('.'+this.opts.class_prefix+'btn_mode_editing');
        this.opts.btn_mode_using =   this.opts.btnpanel.querySelector('.'+this.opts.class_prefix+'btn_mode_using');
        this.opts.btns = this.opts.btnpanel.querySelector('.'+this.opts.class_prefix+'btns'); 
        
        this.build_panel(this.opts.initial_btns);
        this.set_mode('using');
    }
    
    set_mode(mode) {
        this.opts.mode = mode;
        
        if (mode == 'using') {
            this.opts.btn_mode_editing.classList.remove('hidden');
            this.opts.btn_mode_using.classList.add('hidden');
            this.opts.btns.querySelectorAll('.btns_fake').forEach(function(el, i, els) {el.classList.add('hidden')});
        } else if (mode == 'editing') {
            this.opts.btn_mode_editing.classList.add('hidden');
            this.opts.btn_mode_using.classList.remove('hidden');
            this.opts.btns.querySelectorAll('.btns_fake').forEach(function(el, i, els) {el.classList.remove('hidden')});
        }
    }
    
    ev_click(e) {
        
        let c = e.target.classList;
        let el = e.target;
        
        if (c.contains(this.opts.class_prefix+'btn_mode_editing')) {
            this.set_mode('editing');
        } else if (c.contains(this.opts.class_prefix+'btn_mode_using')) {
            this.set_mode('using');
        } else if (c.contains('btns_button')) {
            
            if (this.opts.mode == 'using') {
                console.log('нажата кнопка "'+el.value+'"');
            } else if (this.opts.mode == 'editing') {
                
            }
        }
    }
    
    build_panel_button(button, parent_el) {

        let button_el = document.createElement('input');
        
        if (button) {
        
            button_el.type='button';
            button_el.value=button.name;
            button_el.className='btns_button';
            
        } else {

            button_el.type='text';
            button_el.placeholder='новая кнопка';
            button_el.className='btns_button btns_fake';
            
        }
        
        parent_el.appendChild(button_el);
        return button_el;
        
    }
    
    build_panel_group(group, parent_el) {

        let group_el = document.createElement('div');
        group_el.className='btns_group';
        
        let group_name_el = document.createElement('span');
        group_name_el.textContent=group.name;
        group_name_el.className='btns_group_name';
        
        group_el.appendChild(group_name_el);
        parent_el.appendChild(group_el);
        return group_el;
        
    }

    build_panel_category(category, parent_el) {
        
        let category_name_el, category_el = document.createElement('div');

        if (category) {

            category_el.className='btns_category';
            category_name_el = document.createElement('div'/*, {className:'btns_category_name'}*/);
            category_name_el.textContent = category.name;

        } else {
 
            category_el.className='btns_category btns_fake';
            category_name_el = document.createElement('input');
            category_name_el.type = 'text';
            category_name_el.placeholder = 'новая категория...';

        }

        category_name_el.className='btns_category_name';
        category_el.appendChild(category_name_el);
        
        parent_el.appendChild(category_el);
        return category_el;

    }
    
    build_panel_children(children, parent_el) {
        if (!children) return;

        children.forEach(function(child, i, children) {
        //for (let child of children) {

            if (child.type == 'button') {
                
                this.build_panel_button(child, parent_el);

            } else if (child.type == 'group') {
                
                let group_el = this.build_panel_group(child, parent_el);
                this.build_panel_children(child.children, group_el)
            }
            
            if (i === children.length-1) this.build_panel_button(null, parent_el);
            
        }, this);
    }

    build_panel(categories) {

        for (let category of categories) {
            let category_el = this.build_panel_category(category, this.opts.btns);
            this.build_panel_children(category.children, category_el);
        }
        
        this.build_panel_category(null, this.opts.btns);
    }
    
    btns_import(data) {
        
    }
    
    btns_export() {
        let data = [];
        
        return data;
    }
    
}