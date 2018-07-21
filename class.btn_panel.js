class BtnPanel {
    
    /* opts.btnpanel, opts.class_prefix
     */
    constructor(opts) {
        
        this.opts = opts;
        
        this.ev_click = this.ev_click.bind(this);
        this.ev_add = this.ev_add.bind(this);
        this.ev_window_click = this.ev_window_click.bind(this);
        this.ev_edit_blur = this.ev_edit_blur.bind(this);
        this.ev_btns_import = this.ev_btns_import.bind(this);
        this.opts.btnpanel.addEventListener('click', this.ev_click);
        //this.opts.btnpanel.addEventListener('dragover', this.ev_dnd_insert);
        
        this.opts.btn_mode_editing = this.opts.btnpanel.querySelector('.'+this.opts.class_prefix+'btn_mode_editing');
        this.opts.btn_mode_using =   this.opts.btnpanel.querySelector('.'+this.opts.class_prefix+'btn_mode_using');
        this.opts.btns = this.opts.btnpanel.querySelector('.'+this.opts.class_prefix+'btns'); 
        this.opts.cs = opts.cs ? opts.cs : null;
        
        this.build_panel(this.opts.initial_btns);
        this.set_mode('using');
        this.btn_for_replace = null;
        
        /*
         * e.clientX - позиция курсора относительно окна просмтра
         * e.pageX - позиция курсора относительно страницы (e.clientX + window.pageXOffset)
         * window.pageXOffset (window.scrollX) - смещение страницы относительно окна просмотра при пролистывании
         */
        
        /*DND(this.opts.btns, {
            moved: '.btns_button',
            down: function(e, opts) {
                if (opts.data.bp.opts.mode !== 'editing') return;

                e = opts.e_moved;
                if (e.touches) e = e.touches[0];
                let el = e.target;
                if (el.closest('.btns_editing')) {opts.up(e, opts); return;}
            
                //if (el.classList.contains('btns_button')) {
                
                    opts.data['shiftX'] = e.pageX - e.target.getBoundingClientRect().left;
                    opts.data['shiftY'] = e.pageY - e.target.getBoundingClientRect().top;
                
                    el.style.position = 'fixed';
                //}
            },
            move: function(e, opts) {
                if (opts.data.bp.opts.mode !== 'editing') return;
                
                var e_moved = opts.e_moved;
                if (e.changedTouches) e = e.changedTouches[0];
                if (e_moved.touches) e_moved = e_moved.touches[0];
                let el = e_moved.target;
            
                //if (el.classList.contains('btns_button')) {
                
                    var left = e.pageX - opts.data['shiftX'];
                    var top = e.pageY - opts.data['shiftY'];
                
                    el.style.left = left+'px';
                    el.style.top = top+'px';
                //}
                    
            },
            up: function(e, opts) {
                if (opts.data.bp.opts.mode !== 'editing') return;
            
                e = opts.e_moved;
                let el = e.target;//e.target;
            
                if (el.closest('.btns_editing')) return;
            
                console.log(el);
                //if (el.classList.contains('btns_button')) {
                 
                    el.style.position = 'static';
                    el.style.top = '';
                    el.style.left = '';
                //}
            },
            overenter: function(e, opts, over_el) {
                if (over_el === null) return;
                console.log(over_el === opts.e_moved.target);
                if (/*over_el === opts.prev_over_el || * /over_el === opts.e_moved.target) return;
                if (over_el.classList.contains('btns_button')) {
                    var left = parseInt(over_el.getBoundingClientRect().left);
                    var width = parseInt(getComputedStyle(over_el).width);
                    var moved_width = getComputedStyle(opts.e_moved.target).width;
                    console.log(over_el, e.pageX, left+width/2, left, width);
                    opts.data.bp.is_to_right = e.pageX > left+width/2;
                    if (opts.data.bp.is_to_right) over_el.style.marginRight = moved_width;
                    else over_el.style.marginLeft = moved_width;
                } else {opts.data.bp.is_to_right = null;}
            },
            overout: function(e, opts, over_el) {
                if (over_el === null) return;
                //if (over_el === opts.prev_over_el || over_el === opts.e_moved.target) return;
                if (over_el.classList.contains('btns_button')) {
                    over_el.style.marginLeft = '';
                    over_el.style.marginRight = '';
                }
            },
            drop: function(e, opts, overenter_el, overout_el) {
                if (e.changedTouches) e = e.changedTouches[0];
                let el = e.target;
            
                if (overout_el === null || opts.data.bp.is_to_right == null) return;
                if (overout_el.classList.contains('btns_button')) {
                    if (opts.data.bp.is_to_right) overout_el.parentNode.insertBefore(el, overout_el.nextElementSibling);
                    else overout_el.parentNode.insertBefore(el, overout_el);
                }
            },
            data: {bp:this}
        });*/
    }
    
    
    set_mode(mode) {
        this.opts.mode = mode;
        
        if (mode == 'using') {
            this.opts.btn_mode_editing.classList.remove('hidden');
            this.opts.btn_mode_using.classList.add('hidden');
            this.opts.btnpanel.querySelectorAll('.btns_editing').forEach(function(el, i, els) {el.classList.add('hidden')});
            this.opts.cs.updater_on();
        } else if (mode == 'editing') {
            this.opts.btn_mode_editing.classList.add('hidden');
            this.opts.btn_mode_using.classList.remove('hidden');
            this.opts.btnpanel.querySelectorAll('.btns_editing').forEach(function(el, i, els) {el.classList.remove('hidden')});
            this.opts.cs.updater_off();
        }
    }

    /* клик на кнопки в окне  */
    ev_window_click(e) {
        
        let c = e.target.classList;
        let el = e.target;
        
        if (c.contains('btn_edit_delete')) {
            let w = W.get_w(el);
            let btn = W.get_data(w);
            
            if (btn.classList.contains('btns_button'))  btn.remove();
            else if (btn.classList.contains('btns_group_name')) btn.parentElement.remove();
            else if (btn.classList.contains('btns_category_name')) btn.parentElement.remove();
            
            W.close(w);
            
        } else if (c.contains('btn_edit_replace')) {
            let w = W.get_w(el);
            let btn = W.get_data(w);
            
            this.btn_for_replace = btn;
            
            W.close(w);

        } else if (c.contains('btn_edit_insert_left')) {
            let w = W.get_w(el);
            let btn = W.get_data(w);
            
            btn.parentElement.insertBefore(this.btn_for_replace, btn);
            this.btn_for_replace = null;

            W.close(w);
            
        } else if (c.contains('btn_edit_insert_right')) {
            let w = W.get_w(el);
            let btn = W.get_data(w);
            
            btn.parentElement.insertBefore(this.btn_for_replace, btn.nextElementSibling);
            this.btn_for_replace = null;
            
            W.close(w);

        } else if (c.contains('btn_edit_insert_start')) {
            let w = W.get_w(el);
            let group_or_cat = W.get_data(w);
            if (!(group_or_cat.classList.contains('btns_group_name') || group_or_cat.classList.contains('btns_category_name'))) return;
            group_or_cat = group_or_cat.parentElement;
            
            group_or_cat.insertBefore(this.btn_for_replace, group_or_cat.firstChildElement);
            this.btn_for_replace = null;
            
            W.close(w);

        } else if (c.contains('btn_edit_insert_end')) {
            let w = W.get_w(el);
            let group_or_cat = W.get_data(w);
            if (!(group_or_cat.classList.contains('btns_group_name') || group_or_cat.classList.contains('btns_category_name'))) return;
            group_or_cat = group_or_cat.parentElement;
            
            group_or_cat.insertBefore(this.btn_for_replace, null);
            this.btn_for_replace = null;
            
            W.close(w);
            
        } /*else if (c.contains('btn_edit_')) {
    
        }*/
    }

    
    /* редактирование данных кнопки, группы или категории */
    ev_edit_blur(e) {
        
        if (!(e.keyCode === 13 || e.keyCode === undefined)) return;
        
        let c = e.target.classList;
        let el = e.target;
        
        if (!el.value.trim()) return;

        let w = W.get_w(el);
        let btn = W.get_data(w);
        
        if (c.contains('btn_edit_rename')) {

            if (btn.classList.contains('btns_button')) btn.value = el.value;
            else if (btn.classList.contains('btns_group_name')) btn.textContent = el.value;
            else if (btn.classList.contains('btns_category_name')) btn.textContent = el.value;

        } else if (c.contains('btn_edit_channel')) {
            
            if (btn.classList.contains('btns_button')) btn.dataset.name = parseInt(el.value)-1;

        } else if (c.contains('btn_edit_timer')) {
            
            if (btn.classList.contains('btns_button')) btn.dataset.timer = el.value;
            
        } else if (c.contains('btn_edit_delay_press')) {
            
            if (btn.classList.contains('btns_button')) btn.dataset.delay_press = el.value;
            
        }
    }
    
    /* клик на кнопку панели, группу или категории */
    ev_click(e) {
        
        let c = e.target.classList;
        let el = e.target;
        
        if (c.contains(this.opts.class_prefix+'btn_mode_editing')) {
            this.set_mode('editing');
        } else if (c.contains(this.opts.class_prefix+'btn_mode_using')) {
            this.set_mode('using');
            this.btn_for_replace = null;
            sendform(null, 'bt_panel_save', {data: {'bt_panel':JSON.stringify(this.btns_export())}});
            
        } else if (c.contains('btns_button')) {
            
            if (c.contains('btns_editing')) return;
            
            if (this.opts.mode == 'using') {
                //console.log('нажата кнопка "'+el.value+'"');
                btn_click(e);
            } else if (this.opts.mode == 'editing') {
                let w = W.open('btn_w_editbtn', {add_title:false,add_sheet:true,/*position:[e.clientX, e.clientY],*/max_count:1});
                if (!w) return;
                W.set_data(w, el);
                w.addEventListener('click', this.ev_window_click);
                if (this.btn_for_replace) w.querySelector('.btn_edit_replace_into_block').style.display="block";

                w.querySelector('.btn_edit_rename').value=el.value;
                w.querySelector('.btn_edit_rename').addEventListener('blur', this.ev_edit_blur);
                w.querySelector('.btn_edit_rename').addEventListener('keyup', this.ev_edit_blur);
                w.querySelector('.btn_edit_channel').value=parseInt(el.dataset.name)+1;
                w.querySelector('.btn_edit_channel').addEventListener('blur', this.ev_edit_blur);
                w.querySelector('.btn_edit_channel').addEventListener('keyup', this.ev_edit_blur);
                w.querySelector('.btn_edit_delay_press').value=el.dataset.delay_press;
                w.querySelector('.btn_edit_delay_press').addEventListener('blur', this.ev_edit_blur);
                w.querySelector('.btn_edit_delay_press').addEventListener('keyup', this.ev_edit_blur);
                w.querySelector('.btn_edit_timer').value=el.dataset.timer;
                w.querySelector('.btn_edit_timer').addEventListener('blur', this.ev_edit_blur);
                w.querySelector('.btn_edit_timer').addEventListener('keyup', this.ev_edit_blur);
            }
            
        } else if (c.contains('btns_group_name') && this.opts.mode == 'editing') {
            
            if (el.closest('.btns_editing')) return;
            
            let w = W.open('btn_w_editgroup', {add_title:false,add_sheet:true,/*position:[e.clientX, e.clientY],*/max_count:1});
            if (!w) return;
            W.set_data(w, el);
            w.addEventListener('click', this.ev_window_click);
            if (this.btn_for_replace) w.querySelector('.btn_edit_replace_into_block').style.display="block";

            w.querySelector('.btn_edit_rename').value=el.textContent;
            w.querySelector('.btn_edit_rename').addEventListener('blur', this.ev_edit_blur);
            
        } else if (c.contains('btns_category_name') && this.opts.mode == 'editing') {
            
            if (el.closest('.btns_editing')) return;
            
            let w = W.open('btn_w_editcategory', {add_title:false,add_sheet:true,/*position:[e.clientX, e.clientY],*/max_count:1});
            if (!w) return;
            W.set_data(w, el);
            w.addEventListener('click', this.ev_window_click);
            if (this.btn_for_replace) w.querySelector('.btn_edit_replace_into_block').style.display="block";

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
            ei_calc_size(w.querySelector('textarea'));
            if (c.contains(this.opts.class_prefix+'btn_import')) {
                w.querySelector('input').addEventListener('click', this.ev_btns_import);
            } else {
                w.querySelector('input').remove();
                //w.querySelector('input').value = 'Скопировать в буфер';
                //w.querySelector('input').addEventListener('click', function(e) {console.log(e.target.parentElement.querySelector('textarea').value);});
            }
        }
    }
    
    /* -----------------------------------
     * Построение панели.
     --------------------------------------- */
    
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
        
        //if (button) {
            
            button_el.type='button';
            button_el.value=button.name;
            button_el.className='btns_button';
            
            if (button.ch_name !== undefined) button_el.dataset.name = button.ch_name;
            if (button.delay_press !== undefined) button_el.dataset.delay_press= button.delay_press;
            if (button.timer !== undefined) button_el.dataset.timer = button.timer;
            button_el.dataset.value = 0; //if (button.ch_value !== undefined) button_el.dataset.value = button.ch_value;
            
        /*} else {
            
            let ph = 'новая кнопка...';
            
            button_el.type='text';
            button_el.placeholder=ph;
            button_el.className='btns_button btns_editing';
            button_el.size=ph.length-4;
            
            button_el.addEventListener('blur', this.ev_add);
            button_el.addEventListener('keyup', this.ev_add);
            
        }*/
        
        if (is_append) parent_el.appendChild(button_el);
        else parent_el.insertBefore(button_el, parent_el.lastChild.previousElementSibling);
        return button_el;
        
    }
    
    build_panel_group(group, parent_el, is_append=true) {
        
        let group_name_el, group_el = document.createElement('div');
        
        //if (group) {
            
            group_el.className='btns_group';
            
            group_name_el = document.createElement('span');
            group_name_el.textContent=group.name;
            group_name_el.className='btns_group_name';
            
        /*} else {
            
            let ph = 'новая группа...';
            
            group_el.className='btns_group btns_editing';
            
            group_name_el = document.createElement('input');
            group_name_el.placeholder=ph;
            group_name_el.size=ph.length-4
            group_name_el.className='btns_group_name';
            
            group_name_el.addEventListener('blur', this.ev_add);
            group_name_el.addEventListener('keyup', this.ev_add);
            
        }*/
        
        group_el.appendChild(group_name_el);
        if (is_append) parent_el.appendChild(group_el);
        else parent_el.insertBefore(group_el, parent_el.lastChild.previousElementSibling);
        
        return group_el;
        
    }
    
    build_panel_category(category, parent_el, is_append=true) {
        
        let category_name_el, category_el = document.createElement('div');
        
        //if (category) {
            
            category_el.className='btns_category';
            category_name_el = document.createElement('div'/*, {className:'btns_category_name'}*/);
            category_name_el.textContent = category.name;
            
        /*} else {
            
            category_el.className='btns_category btns_editing';
            category_name_el = document.createElement('input');
            category_name_el.type = 'text';
            category_name_el.placeholder = 'новая категория...';
            
            category_name_el.addEventListener('blur', this.ev_add);
            category_name_el.addEventListener('keyup', this.ev_add);
            
        }*/
        
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
            
            /*if (i === children.length-1) {
                this.build_panel_button(null, parent_el);
                this.build_panel_group(null, parent_el);
            }*/
            
        }, this);
    }
    
    build_panel(categories) {
        if (!categories) return;
        this.opts.btns.innerHTML = '';
        
        for (let category of categories) {
            let category_el = this.build_panel_category(category, this.opts.btns);
            this.build_panel_children(category.children, category_el);
        }
        
        //this.build_panel_category(null, this.opts.btns);
        
        this.set_mode(this.opts.mode);
    }
    
    
    /* -----------------------------------
     * Импорт/экспорт
     * --------------------------------------- */
    
    
    btns_import(data) {
        this.build_panel(data);
    }
    
    ev_btns_import(e) {
        let data = e.target.parentElement.querySelector('textarea').value;
        this.btns_import(JSON.parse(data));
    }
    
    el2obj(el, type) {
        if (el.classList.contains('btns_button')) { return {
            type:'button',
            name:el.value,
            ch_name:el.dataset.name/*,
            ch_value:el.dataset.value*/,
            delay_press: el.dataset.delay_press,
            timer: el.dataset.timer
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
