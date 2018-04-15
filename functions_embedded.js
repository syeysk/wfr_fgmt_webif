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
    //setTimeout(function(){if (typeof zi !== 'undefined') zi.remove(note);note.remove();}, time);
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
    if (options['form'] === undefined) {
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
        document.removeEventListener('mousemove', move);
        document.removeEventListener('mouseup', end);
        document.removeEventListener('touchmove', move);
        document.removeEventListener('toucend', end);
        document.body.onmousedown = function() {return true;}; // включаем  выделение текста
        if (!options.first) {
            if (options['up']) options['up'](e, options['data']);
            var over_el = get_over_el(e);
            if (options['drop']) options['drop'](e, options['data'], over_el, options.prev_over_el);
            if (options['overout']) options['overout'](e, options['data'], options.prev_over_el);
        }
    }
    
    function move(e) {
        if (options.first) {
            if (check_start(e)) {
                if (options['down']) options['down'](e, options['data']);
                options.first = false;
            } else {end(e); return;}
        }
        if (options['move']) options['move'](e, options['data']);

        var over_el = get_over_el(e);
        if (over_el !== options.prev_over_el) {
            if (options['overenter']) options['overenter'](e, options['data'], over_el);
            if (options['overout']) options['overout'](e, options['data'], options.prev_over_el);
        }
        options.prev_over_el = over_el;
    }
    
    function check_start(e) {
        var e = (e.changedTouches) ? e.changedTouches[0] : e;
        return Math.abs(options.downX - e.pageX) > 2 && Math.abs(options.downY - e.pageY) > 2;
    }

    function init_start(e) { // drag and drop
        e.currentTarget.ondragstart = function() {return false;}; // выключаем стандартный drag-n-drop
        document.body.onmousedown = function() {return false;}; // выключаем  выделение текста
        options['data'] = options['data'] || {};
        options['data']['isSensorDisplay'] = e.touches === undefined ? false : true
        
        var _e = (e.touches) ? e.touches[0] : e;
        options.downX = _e.pageX; options.downY = _e.pageY;options.first = true;
        options.prev_over_el = null;
        
        document.addEventListener('mousemove', move);
        document.addEventListener('touchmove', move);
        document.addEventListener('mouseup',  end);
        document.addEventListener('touchend', end);
    }
    
    function get_over_el(e) {
        var e = (e.changedTouches) ? e.changedTouches[0] : e;;
        el.hidden = true;
        var over_el = document.elementFromPoint(e.clientX, e.clientY);
        el.hidden = false;
        return over_el;
        //if (over_el === null) return;
    }
    
    element.addEventListener('mousedown', init_start); // для мыши
    element.addEventListener('touchstart', init_start, {passive:true}); // для сенсорного дисплея
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
        this.ev_add = this.ev_add.bind(this);
        this.ev_edit_click = this.ev_edit_click.bind(this);
        this.ev_edit_blur = this.ev_edit_blur.bind(this);
        this.opts.btnpanel.addEventListener('click', this.ev_click);
        this.opts.btnpanel.addEventListener('dragover', this.ev_dnd_insert);
        
        this.opts.btn_mode_editing = this.opts.btnpanel.querySelector('.'+this.opts.class_prefix+'btn_mode_editing');
        this.opts.btn_mode_using =   this.opts.btnpanel.querySelector('.'+this.opts.class_prefix+'btn_mode_using');
        this.opts.btns = this.opts.btnpanel.querySelector('.'+this.opts.class_prefix+'btns'); 
        
        this.build_panel(this.opts.initial_btns);
        this.set_mode('using');
        
        /*
         * e.clientX - позиция курсора относительно окна просмтра
         * e.pageX - позиция курсора относительно страницы (e.clientX + window.pageXOffset)
         * window.pageXOffset (window.scrollX) - смещение страницы относительно окна просмотра при пролистывании
         */
        
        DND(this.opts.btns, {
            down: function(e, data) {
                if (e.touches) e = e.touches[0];
                let el = e.target;

                if (el.classList.contains('btns_edit')) return;

                if (el.classList.contains('btns_button')) {

                    data['shiftX'] = e.pageX - e.target.getBoundingClientRect().left;
                    data['shiftY'] = e.pageY - e.target.getBoundingClientRect().top;

                    el.style.position = 'fixed';
                    data.bp.d = true;
                }
            },
            move: function(e, data) {
                if (e.changedTouches) e = e.changedTouches[0];
                let el = e.target;
                
                if (el.classList.contains('btns_edit')) return;

                if (el.classList.contains('btns_button')) {
                
                    var left = e.pageX - data['shiftX'];
                    var top = e.pageY - data['shiftY'];

                    el.style.left = left+'px';
                    el.style.top = top+'px';
                }
            },
            up: function(e, data) {
                if (e.changedTouches) e = e.changedTouches[0];
                let el = e.target;
                
                if (el.classList.contains('btns_edit')) return;
                
                //el.hidden = true;
                //let under_el = document.elementFromPoint(e.clientX, e.clientY);
                //el.hidden = false;
                
                if (el.classList.contains('btns_button')) {

                    //if (under_el !== null && (under_el.classList.contains('btns_button') || under_el.classList.contains('btns_group'))) {
                    //    under_el.parentNode.insertBefore(el, under_el);
                    //}
                    
                    el.style.position = 'static';
                    el.style.top = '';
                    el.style.left = '';
                    data.bp.d = false;
                }
            },
            overenter: function(e, data, over_el) {
                if (over_el === null) return;
                if (over_el.classList.contains('btns_button')) {
                    over_el.style.marginLeft = '20px';
                }
            },
            overout: function(e, data, over_el) {
                if (over_el === null) return;
                if (over_el.classList.contains('btns_button')) {
                    over_el.style.marginLeft = '';
                }
            },
            drop: function(e, data, overenter_el, overout_el) {
                if (e.changedTouches) e = e.changedTouches[0];
                let el = e.target;

                if (overout_el === null) return;
                if (overout_el.classList.contains('btns_button')) {
                    overout_el.parentNode.insertBefore(el, overout_el);
                }
            },
            data: {bp:this}
        });
    }
    
   
    set_mode(mode) {
        this.opts.mode = mode;
        
        if (mode == 'using') {
            this.opts.btn_mode_editing.classList.remove('hidden');
            this.opts.btn_mode_using.classList.add('hidden');
            this.opts.btnpanel.querySelectorAll('.btns_editing').forEach(function(el, i, els) {el.classList.add('hidden')});
        } else if (mode == 'editing') {
            this.opts.btn_mode_editing.classList.add('hidden');
            this.opts.btn_mode_using.classList.remove('hidden');
            this.opts.btnpanel.querySelectorAll('.btns_editing').forEach(function(el, i, els) {el.classList.remove('hidden')});
        }
    }

    ev_edit_click(e) {

        let c = e.target.classList;
        let el = e.target;
        
        if (c.contains('btn_edit_delete')) {
            let w = W.get_w(el);
            let btn = W.get_data(w);

            if (btn.classList.contains('btns_button'))  btn.remove();
            else if (btn.classList.contains('btns_group_name')) btn.parentElement.remove();
            else if (btn.classList.contains('btns_category_name')) btn.parentElement.remove();
            
            W.close(w);
        } else if (c.contains('btn_edit_')) {
            
        }
    }

    ev_edit_blur(e) {
        
        if (!(e.keyCode === 13 || e.keyCode === undefined)) return;
        
        let c = e.target.classList;
        let el = e.target;
        
        if (!el.value.trim()) return;
        
        if (c.contains('btn_edit_rename')) {
            let w = W.get_w(el);
            let btn = W.get_data(w);
            
            if (btn.classList.contains('btns_button')) btn.value = el.value;
            else if (btn.classList.contains('btns_group_name')) btn.textContent = el.value;
            else if (btn.classList.contains('btns_category_name')) btn.textContent = el.value;
            
            W.close(w);
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
            
            if (c.contains('btns_editing')) return;
            
            if (this.opts.mode == 'using') {
                console.log('нажата кнопка "'+el.value+'"');
            } else if (this.opts.mode == 'editing') {
                let w = W.open('btn_w_editbtn', {add_title:false,add_sheet:true,position:[e.clientX, e.clientY],max_count:1});
                if (!w) return;
                W.set_data(w, el);
                w.addEventListener('click', this.ev_edit_click);
                w.querySelector('.btn_edit_rename').value=el.value;
                w.querySelector('.btn_edit_rename').addEventListener('blur', this.ev_edit_blur);
                w.querySelector('.btn_edit_rename').addEventListener('keyup', this.ev_edit_blur);
            }

        } else if (c.contains('btns_group_name') && this.opts.mode == 'editing') {

            if (el.closest('.btns_editing')) return;
            
            let w = W.open('btn_w_editbtn', {add_title:false,add_sheet:true,position:[e.clientX, e.clientY],max_count:1});
            if (!w) return;
            W.set_data(w, el);
            w.addEventListener('click', this.ev_edit_click);
            w.querySelector('.btn_edit_rename').value=el.textContent;
            w.querySelector('.btn_edit_rename').addEventListener('blur', this.ev_edit_blur);

        } else if (c.contains('btns_category_name') && this.opts.mode == 'editing') {
            
            if (el.closest('.btns_editing')) return;
            
            let w = W.open('btn_w_editbtn', {add_title:false,add_sheet:true,position:[e.clientX, e.clientY],max_count:1});
            if (!w) return;
            W.set_data(w, el);
            w.addEventListener('click', this.ev_edit_click);
            w.querySelector('.btn_edit_rename').value=el.textContent;
            w.querySelector('.btn_edit_rename').addEventListener('blur', this.ev_edit_blur);
            
            
        } else if (c.contains(this.opts.class_prefix+'btn_import') || c.contains(this.opts.class_prefix+'btn_export')) {
            let w = W.open('btn_w_ei', {text_title:el.value, max_count:1});
            if (!w) return;
            
            let data;
            if (c.contains(this.opts.class_prefix+'btn_import')) data = '';
            else if (c.contains(this.opts.class_prefix+'btn_export')) data = JSON.stringify(this.btns_export());
            
            w.querySelector('.btn_ei').value = el.value;
            w.querySelector('textarea').textContent = data;
            w.querySelector('textarea').focus();
            if (c.contains(this.opts.class_prefix+'btn_import')) {
                w.querySelector('input').addEventListener('click', this.ev_btns_import);
            } else {
                w.querySelector('input').remove();
                //w.querySelector('input').value = 'Скопировать в буфер';
                //w.querySelector('input').addEventListener('click', function(e) {console.log(e.target.parentElement.querySelector('textarea').value);});
            }
        }
    }

    
    ev_add(e) {
        
        if (!(e.keyCode === 13 || e.keyCode === undefined)) return;

        let _el = e.target;

        let data = { name: _el.value.trim() };
        if (data.name == '') return;
        _el.value='';

        if (_el.classList.contains('btns_category_name')) {
            let el = this.build_panel_category(data, this.opts.btns, false);
            this.build_panel_button(null, el);
            this.build_panel_group(null, el);
        } else if (_el.classList.contains('btns_button')) {
            this.build_panel_button(data, _el.parentElement, false);
        } else if (_el.classList.contains('btns_group_name')) {
            let el = this.build_panel_group(data, _el.closest('.btns_group').parentElement, false);
            this.build_panel_button(null, el);
            this.build_panel_group(null, el);
        }
        
    }

    build_panel_button(button, parent_el, is_append=true) {

        let button_el = document.createElement('input');
        
        if (button) {
        
            button_el.type='button';
            button_el.value=button.name;
            button_el.className='btns_button';
            
            if (button.ch_name !== undefined) button_el.dataset.name = button.ch_name;
            if (button.ch_value !== undefined) button_el.dataset.value = button.ch_value;
                
        } else {
            
            let ph = 'новая кнопка...';

            button_el.type='text';
            button_el.placeholder=ph;
            button_el.className='btns_button btns_editing';
            button_el.size=ph.length-4;
            
            button_el.addEventListener('blur', this.ev_add);
            button_el.addEventListener('keyup', this.ev_add);
            
        }
        
        if (is_append) parent_el.appendChild(button_el);
        else parent_el.insertBefore(button_el, parent_el.lastChild.previousElementSibling);
        return button_el;
        
    }
    
    build_panel_group(group, parent_el, is_append=true) {

        let group_name_el, group_el = document.createElement('div');
        
        if (group) {

            group_el.className='btns_group';
    
            group_name_el = document.createElement('span');
            group_name_el.textContent=group.name;
            group_name_el.className='btns_group_name';
        
        } else {
            
            let ph = 'новая группа...';
 
            group_el.className='btns_group btns_editing';

            group_name_el = document.createElement('input');
            group_name_el.placeholder=ph;
            group_name_el.size=ph.length-4
            group_name_el.className='btns_group_name';
            
            group_name_el.addEventListener('blur', this.ev_add);
            group_name_el.addEventListener('keyup', this.ev_add);
            
        }

        group_el.appendChild(group_name_el);
        if (is_append) parent_el.appendChild(group_el);
        else parent_el.insertBefore(group_el, parent_el.lastChild.previousElementSibling);
        
        return group_el;
        
    }

    build_panel_category(category, parent_el, is_append=true) {
        
        let category_name_el, category_el = document.createElement('div');

        if (category) {

            category_el.className='btns_category';
            category_name_el = document.createElement('div'/*, {className:'btns_category_name'}*/);
            category_name_el.textContent = category.name;

        } else {
 
            category_el.className='btns_category btns_editing';
            category_name_el = document.createElement('input');
            category_name_el.type = 'text';
            category_name_el.placeholder = 'новая категория...';
            
            category_name_el.addEventListener('blur', this.ev_add);
            category_name_el.addEventListener('keyup', this.ev_add);

        }

        category_name_el.className='btns_category_name';
        category_el.appendChild(category_name_el);
        
        if (is_append) parent_el.appendChild(category_el);
        else parent_el.insertBefore(category_el, parent_el.lastChild);
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
            
            if (i === children.length-1) {
                this.build_panel_button(null, parent_el);
                this.build_panel_group(null, parent_el);
            }
            
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
        this.opts.btns.innerHTML = '';
        this.build_panel(data);
        this.set_mode(this.opts.mode);
    }
    
    ev_btns_import(e) {
        let data = e.target.parentElement.querySelector('textarea').value;
        this.btns_import(JSON.parse(data));
    }
    
    el2obj(el, type) {
        if (el.classList.contains('btns_button')) { return {
            type:'button',
            name:el.value,
            ch_name:el.dataset.name,
            ch_value:el.dataset.value
        };} else if (el.classList.contains('btns_group')) { return {
            type:'group',
            name:el.firstChild.textContent,
            children:[]
        };} else if (el.classList.contains('btns_category')) { return {
            name:el.firstChild.textContent,
            children:[]
        };} else { return false; }
    }
    
    btns_export_children(parent_el, data) {
        
        let child;
        
        for (let child_el of parent_el.children) {
            if (child_el.classList.contains('btns_editing')) continue;

            child = this.el2obj(child_el);
            if (child === false) continue;
            data.push(child);

            if (child_el.classList.contains('btns_group') || child_el.classList.contains('btns_category')) this.btns_export_children(child_el, child.children);

        }
    }
    
    btns_export() {
        let data = [];
        this.btns_export_children(this.opts.btns, data);
        //let text = JSON.stringify(data) == JSON.stringify(this.opts.initial_btns) ? 'true' : 'false'; console.log(text);
        return data;
    }
    
}