/*日付型拡張*/
Date.prototype.yyyymmdd = function() {
    return this.getFullYear() + ('0' + (this.getMonth() + 1)).slice(-2) + ('0' + this.getDate()).slice(-2);
};
Date.prototype.yyyymmddhhiiss = function() {
    return this.yyyymmdd() + ('0' + this.getHours()).slice(-2) + ('0' + this.getMinutes()).slice(-2) + ('0' + this.getSeconds()).slice(-2);
};
Date.from = function(text) {
    if (text == null || text == '')
        return null;
    var y = text.substring(0, 4) || 0;
    var m = text.substring(4, 6) || 1;
    var d = text.substring(6, 8) || 1;
    var h = text.substring(8, 10) || 0;
    var i = text.substring(10, 12) || 0;
    var s = text.substring(12, 14) || 0;
    return new Date(y + '/' + m + '/' + d + ' ' + h + ':' + i + ':' + s);
};

/* セレクタ処理拡張 */
jQuery.fn.extend({

    /** 日付入力の種類を取得 */
    dateType : function() {
        var $this = this.eq(0);
        if ($this.hasClass('year') || $this.hasClass('y')) {
            return 'y';
        } else if ($this.hasClass('ym')) {
            return 'ym';
        } else if ($this.hasClass('date') || $this.hasClass('ymd')) {
            return 'ymd';
        } else if ($this.hasClass('datetime') || $this.hasClass('ymdh')) {
            return 'ymdh';
        } else if ($this.hasClass('timestamp') || $this.hasClass('ymdhi')) {
            return 'ymdhi';
        } else if ($this.hasClass('ymdhis')) {
            return 'ymdhis';
        }
    },

    /** submit前の準備 */
    prepare : function() {
        return this.each(function() {
            var set = function($this, suffixes) {
                var id = '#' + $this.attr('name');
                var year = $(id + '_year_').val();
                if ($.type(year) == 'string' && year.length > 0) {
                    year = (isNaN(year) ? year : Number(year) + Number($(id + '_era_').val()));
                } else {
                    var empty = true;
                    $.each(suffixes, function(i, suffix) {
                        var v = $(id + suffix).val();
                        if ($.type(v) == 'string' && v.length > 0) {
                            empty = false;
                            return false;
                        }
                    });
                    if (empty) {
                        return '';
                    }
                }
                year = ('0000' + year).substr(-4);
                $this.val(year + $.map(suffixes, function(suffix) {
                    return ('00' + $(id + suffix).val()).substr(-2);
                }).join(''));
            };
            $('input.year,input.y').each(function() {
                set($(this), []);
            });
            $('input.ym').each(function() {
                set($(this), [ '_month_' ]);
            });
            $('input.date,input.ymd').each(function() {
                set($(this), [ '_month_', '_day_' ]);
            });
            $('input.datetime,input.ymdh').each(function() {
                set($(this), [ '_month_', '_day_', '_hour_' ]);
            });
            $('input.timestamp,input.ymdhi').each(function() {
                set($(this), [ '_month_', '_day_', '_hour_', '_minute_' ]);
            });
            $('input.ymdhis').each(function() {
                set($(this), [ '_month_', '_day_', '_hour_', '_minute_', '_second_' ]);
            });
            $.clearError();
        });
    },

    /** スクロール可能テーブルの幅を調整(theadのtdにdata-size(半角文字単位)を指定可能) */
    adjustTableWidth : function() {
        return this.each(function() {
            var heads = $(this).find('thead tr:first th');
            var bodys = $(this).find('tbody tr:first td');
            $.each(heads, function(i, v) {
                var head = $(v);
                var body = bodys.eq(i);
                var width = (head.data('size') || 0) * 8;
                if (width <= 0) {
                    width = Math.max(body.width(), head.width());
                }
                head.width(width);
                body.width(width);
            });
        });
    },

    adjustInputWidth : function() {
        return this.css('width', function() {
            var max = $(this).attr('size') || $(this).data('size') || $(this).attr('maxlength');
            return (($(this).hasClass('zenkaku') || $(this).hasClass('ime-on')) && !$(this).hasClass('hankaku') ? 2 : 1) * max * 8 + 19
                    + ($(this).closest('.form-group').closest('.form-group-sm').length ? 0 : 8) + 'px';
        });
    }
});

/* jQuery拡張 */
jQuery.extend({

    /* コード一覧 */
    codeMap : {/* A.codeMapJson */},

    /* コード名称取得 */
    code : function(typeCode, code) {
        return $.map($.codeMap[typeCode] || [], function(v) {
            return v[0] == code ? v[1] : '';
        }).join('');
    },

    /* 和暦一覧 */
    eras : {/* A.erasJson */},

    /* 和暦インデックス一覧 */
    erasIndex : {/* A.erasIndexJson */},

    /** 西暦年から和暦レコード[年オフセット, 漢字名]を取得 */
    era : function(year) {
        if (!(year > 0)) {
            return $.eras[$.eras.length - 2];
        }
        for (var i = 0; i < $.erasIndex.length - 1; i++) {
            var v = $.erasIndex[i];
            if (year > v[0]) {
                return $.eras[v[1]];
            }
        }
        return $.eras[$.erasIndex[$.erasIndex.length - 1][1]];
    },
    /** パンくずリスト追加 */
    breadcrumb : function(pairList) {
        $('.breadcrumb li:first').after($.map(pairList, function(v) {
            return [ '\n', $('<li>').append($('<a>', {
                href : v[0],
                html : v[1]
            }))];
        }));
    },

    /** モーダルダイアログ表示 */
    dialog : function(message, done, title, buttons, init, width) {
        var modal = $('<div class="modal fade" id="_dialog_" tabindex="-1">' + '<div class="modal-dialog">' + '<div class="modal-content">'
                + '<div class="modal-header-sm">' + '<a class="close" data-dismiss="modal">&times;</a>' + (title || "{item.notice}") + '</div>'
                + '<div class="modal-body">' + '<p>' + message + '</p>' + '</div>' + '<div class="modal-footer">' + $.map(buttons || [], function(v) {
                    if (!$.isArray(v))
                        v = [ v ];
                    var color = v[1] || 'default';
                    return '<a class="btn btn-' + color + '" data-dismiss="modal">' + v[0] + '</a>';
                }).join('\n') + '</div>' + '</div>' + '</div>' + '</div>');
        if ($.isFunction(done)) {
            modal.on('hidden.bs.modal', function() {
                done.call(modal, $(this).data('id'));
            });
        }
        if ($.isFunction(init)) {
            modal.on('show.bs.modal', function() {
                init.call(modal);
            });
        }
        $('body').remove('#_dialog_').append(modal);
        modal.find('[data-dismiss=modal]').on('click', function() {
            $(this).closest('.modal').data('id', $(this).data('id') || $(this).text());
        });
        if (width) {
            modal.find('.modal-dialog').css('width', width + 'px');
        }
        modal.modal();
    },

    /** 確認ダイアログ表示 */
    alert : function(message, done, title) {
        $.dialog(message, done, title, [ "{item.close}" ]);
    },

    /** 確認ダイアログ表示 */
    confirm : function(message, done, title) {
        $.dialog(message, function(r) {
            if ($.isFunction(done))
                done(r == "{item.yes}");
        }, title, [ [ "{item.yes}", 'primary' ], "{item.no}" ]);
    },

    /** 入力チェック後のレスポンスを処理 */
    feedback : function(r, doIfNoError) {
        $.each(r, function(i, v) {
            if (i == 0)
                return;
            if (!$.isArray(v)) {
                v = [ v ];
            }
            $('[name=' + v.shift() + ']').each(function() {
                var $this = $(this);
                var id = '#' + $this.attr('name');
                switch ($this.dateType()) {
                case 'y':
                    $this = $this.add(id + '_era_,' + id + '_year_');
                    break;
                case 'ym':
                    $this = $this.add(id + '_era_,' + id + '_year_,' + id + '_month_');
                    break;
                case 'ymd':
                    $this = $this.add(id + '_era_,' + id + '_year_,' + id + '_month_,' + id + '_day_');
                    break;
                case 'ymdh':
                    $this = $this.add(id + '_era_,' + id + '_year_,' + id + '_month_,' + id + '_day_,' + id + '_hour_');
                    break;
                case 'ymdhi':
                    $this = $this.add(id + '_era_,' + id + '_year_,' + id + '_month_,' + id + '_day_,' + id + '_hour_,' + id + '_minute_');
                    break;
                case 'ymdhis':
                    $this = $this.add(id + '_era_,' + id + '_year_,' + id + '_month_,' + id + '_day_,' + id + '_hour_,' + id + '_minute_,' + id + '_second_');
                    break;
                }
                $this.closest('.form-group').addClass('has-error').attr('title', v.join('<br/>') || r[0]).tooltip({
                    html : true,
                    trigger : 'hover'
                }).tooltip('fixTitle');
            });
        });
        if (r.length <= 1) {
            if ($.isFunction(doIfNoError)) {
                doIfNoError(r[0]);
            } else if (r[0]) {
                $.alert(r[0]);
            }
        } else if (r[0]) {
            $.alert(r[0]);
        }
    },

    /** 確認メッセージで「はい」が選択されたときに処理を実行 */
    autoConfirm : function(confirm, action) {
        if (confirm) {
            $.confirm(confirm, function(yes) {
                if (yes) {
                    action();
                }
            });
        } else {
            action();
        }
    },

    /** 入力チェックエラーをクリア */
    clearError : function() {
        $('.form-group').removeClass('has-error').removeAttr('title');
    },

    /**
     * 日時選択ダイアログ
     * 
     * @param value 初期値
     * @param done 確定時処理(選択日付)
     * @param type 日時の種類(y, ym, ymd, ymdh, ymdhi, ymdhis)
     * @param wareki true: 和暦表示, false: 西暦表示
     */
    datepicker : function(value, done, type, wareki) {
        var format = false;
        var title = null;
        switch (type) {
        case 'y':
            format = 'YYYY';
            title = "{title.y}";
            break;
        case 'ym':
            format = 'YYYYMM';
            title = "{title.ym}";
            break;
        case 'ymd':
            format = 'YYYYMMDD';
            title = "{title.ymd}";
            break;
        case 'ymdh':
            format = 'YYYYMMDDHH';
            title = "{title.ymdh}";
            break;
        case 'ymdhi':
            format = 'YYYYMMDDHHmm';
            title = "{title.ymdhi}";
            break;
        case 'ymdhis':
            format = 'YYYYMMDDHHmmss';
            title = "{title.ymdhis}";
            break;
        }
        $.dialog('<div class="form-group"><div class="datepicker"></div></div>', function(r) {
            if (r == "{item.fix}" && $.isFunction(done)) {
                done(this.find('.datepicker').data('DateTimePicker').date());
            }
        }, title, [ [ "{item.fix}", 'primary' ], "{item.cancel}" ], function() {
            this.find('.datepicker').datetimepicker({
                inline : true,
                sideBySide : true,
                format : format,
                locale : moment.locale('ja'),
                dayViewHeaderFormat : wareki ? function(date) {
                    var year = date.year();
                    var era = $.era(year);
                    return "{format.java.ym}".replace('{0}', era[1] + (year - era[0])).replace('{1}', date.month() + 1);
                } : "{format.js.ym}",
                yearFormat : wareki ? function(date) {
                    var year = date.year();
                    var era = $.era(year);
                    return "{format.java.y}".replace('{0}', era[1] + (year - era[0])).replace('{1}');
                } : "{format.js.y}",
                rangeMark : "{item.tilde}"
            }).data('DateTimePicker').date(value || new Date());
        });
    },

    /**
     * 住所選択ダイアログ
     * 
     * @param value 初期値
     * @param done 確定時処理(選択したコード, 名称, 郵便番号)
     */
    addressDialog : function(code, done) {
        var items = [ 'todofuken', 'shikuchoson', 'ooaza_tsusho', 'aza_chome' ];
        var html = '<div class="form-inline">' + '<div class="form-group"><label>' + "{item.todofuken}"
                + '</label><div><select multiple="multiple" class="form-control" name="todofuken" style="width:9em"></select></div></div>'
                + '<div class="form-group"><label>' + "{item.shikuchoson}"
                + '</label><div><select multiple="multiple" class="form-control" name="shikuchoson" style="width:14em"></select></div></div>'
                + '<div class="form-group"><label>' + "{item.ooaza_tsusho}"
                + '</label><div><select multiple="multiple" class="form-control" name="ooaza_tsusho" style="width:14em"></select></div></div>'
                + '<div class="form-group"><label>' + "{item.aza_chome}"
                + '</label><div><select multiple="multiple" class="form-control" name="aza_chome" style="width:9em"></select></div></div>' + '</div>';
        $.dialog(html, function(r) {
            if (r == "{item.fix}" && $.isFunction(done)) {
                var code = '';
                var address = '';
                var postcode = '';
                var $this = this;
                $.each(items, function(i, v) {
                    var control = $this.find('[name=' + v + '] option:selected');
                    if (control.length > 0) {
                        code += control.val();
                        address += control.data('address') || '';
                        var p = control.data('postcode');
                        if (p) {
                            postcode = p;
                        }
                    } else {
                        code += i == 0 ? '00' : '000';
                    }
                });
                done(code, address, postcode);
            }
        }, "{title.address}", [ [ "{item.fix}", 'primary' ], "{item.cancel}" ], function() {
            var $this = this;
            var defaultMap = {
                todofuken : code.substring(0, 2) || 27,
                shikuchoson : code.substring(2, 5),
                ooaza_tsusho : code.substring(5, 8),
                aza_chome : code.substring(8, 11)
            }
            $this.find('select').css({
                height : '20em'
            }).on('change', function() {
                var value = $(this).val();
                var data = {};
                var action = null;
                switch ($(this).attr('name')) {
                case 'todofuken':
                    action = 'shikuchoson';
                    data['todofuken'] = value;
                    break;
                case 'shikuchoson':
                    action = 'ooaza_tsusho';
                    data['todofuken'] = $this.find('[name=todofuken]').val();
                    data['shikuchoson'] = value;
                    break;
                case 'ooaza_tsusho':
                    action = 'aza_chome';
                    data['todofuken'] = $this.find('[name=todofuken]').val();
                    data['shikuchoson'] = $this.find('[name=shikuchoson]').val();
                    data['ooaza_tsusho'] = value;
                    break;
                }
                if (action == null) {
                    return;
                }
                var defaultValue = defaultMap[action];
                defaultMap[action] = null;
                $.getJSON('search/' + action, $.param(data, true)).then(function(list) {
                    $this.find('[name=' + action + ']').empty().append($.map(list, function(a) {
                        return $('<option>', {
                            value : a[0],
                            text : a[0] + ' ' + (a[1] || ''),
                            'data-address' : a[1] || '',
                            'data-postcode' : a[3]
                        });
                    })).val(defaultValue).trigger('change');
                }, $.fatal);
            });
            $this.find('[name=todofuken]').append($.map({/* A.todofukenJson */}, function(a) {
                return $('<option>', {
                    value : a[0],
                    text : a[0] + ' ' + (a[1] || ''),
                    title : a[1] || '',
                    'data-postcode' : a[3]
                });
            })).val(defaultMap.todofuken).trigger('change');
            defaultMap.todofuken = null;
        }, 800);
    },

    /** システムエラーダイアログ表示 */
    fatal : function(response, error) {
        if (error == 'parsererror' && response.responseText.indexOf('data-status="403"') >= 0) {
            $.alert("{error.timeout}", function() {
                location.href = "${R.uri.baseUri}";
            });
        } else {
            $.alert("{error.system}");
        }
    },

    /** QueryParameterを処理 */
    queryParam : function(action) {
        $.each(location.search.substr(1).split('&'), function(i, v) {
            var pair = v.split('=');
            action(pair[0], pair[1]);
        });
    },

    /** 値にパラメータを追加 */
    addParam : function(key, value) {
        return function(i, v) {
            return v + (v.indexOf('?') < 0 ? '?' : '&') + key + '=' + value;
        };
    },

    /** サーバ通信 */
    autoSubmit : function(action, method, form, confirm, href) {
        $.autoConfirm(confirm, function() {
            $.ajax({
                url : action,
                type : method || 'post',
                data : form.prepare().serialize(),
                dataType : 'json'
            }).then(function(r) {
                $.feedback(r, href ? function(r) {
                    if (r) {
                        $.alert(r, function() {
                            location.href = href;
                        });
                    } else {
                        location.href = href;
                    }
                } : null);
            }, $.fatal);
        });
    },

    /** 値のセット */
    set : function(selector, value) {
        if (!selector) {
            return;
        }
        var element = (selector instanceof jQuery) ? selector : $(selector);
        element[element.attr('name') ? 'val' : 'text'](value);
    }
});

/* ページ読み込み後処理 */
jQuery(function($) {

    /* ロード開始 */
    $(document).ajaxStart(function() {
        if ($('#spinner').attr('data-count', function(i, v) {
            return v + 1;
        }).length > 0) {
            return;
        }
        $('body').append($('<div>', {
            id : 'spinner',
            'data-count' : 1
        }));
    });

    /* ロード終了 */
    $(document).ajaxStop(function() {
        setTimeout(function() {
            $('#spinner').attr('data-count', function(i, v) {
                v--;
                if (v <= 0) {
                    $(this).remove();
                }
                return v;
            })
        }, 100);
    });

    /* 終了 */
    $('#close').on('click', function() {
        $.autoConfirm("{confirm.quit}", function() {
            window.open('about:blank', '_self').close();
        });
    });

    /* 日時入力 */
    (function() {

        var y = function($this) {
            var name = $this.attr('name');
            var value = $this.val();
            var year = value.substring(0, 4);
            var era = $this.hasClass('no-era') ? $.eras[$.eras.length - 1] : year ? $.era(year) : $.eras[0];
            return $('<div>', {
                class : 'form-inline inline-block',
            }).append([ $('<button>', {
                text : "{item.calendar}",
                class : 'btn btn-default form-control',
                type : 'button'
            }).on('click', function() {
                var control = $(this).parent().prev();
                var type = control.dateType();
                $.datepicker(Date.from(control.val()), function(date) {
                    var date = date.toDate().yyyymmddhhiiss();
                    var year = date.substring(0, 4);
                    var era = control.hasClass('no-era') ? $.eras[$.eras.length - 1] : $.era(year);
                    control.val(date.substring(0, type.length * 2 + 2));
                    $('#' + name + '_era_').val(era[0]);
                    $('#' + name + '_year_').val(year > 0 ? year - era[0] : year);
                    $('#' + name + '_month_').val(date.substring(4, 6));
                    $('#' + name + '_day_').val(date.substring(6, 8));
                    $('#' + name + '_hour_').val(date.substring(8, 10));
                    $('#' + name + '_minute_').val(date.substring(10, 12));
                    $('#' + name + '_second_').val(date.substring(12, 14));
                }, type, $('#' + name + '_era_').val() > 0);
            }), $('<select>', {
                class : 'form-control',
                name : name + '_era_',
                id : name + '_era_',
                'data-disabled' : $this.hasClass('no-era')
            }).append($.map($.eras, function(v) {
                return $('<option>', {
                    value : v[0],
                    text : v[1]
                });
            })).val(era[0]), $('<input>', {
                maxlength : 4,
                'data-size' : era[0] <= 0 ? 4 : 2,
                class : 'form-control no-ime',
                name : name + '_year_',
                id : name + '_year_',
                type : 'text',
                value : era[0] > 0 && year > 0 ? year - era[0] : year
            }), $('<label>', {
                text : "{item.year}",
                'for' : name + '_year_'
            }) ]);
        };

        /* 年入力 */
        $('input.year,input.y').addClass('hidden').each(function() {
            $(this).after(y($(this)));
        });

        var ym = function($this) {
            var name = $this.attr('name');
            var value = $this.val();
            return y($this).append([ $('<input>', {
                maxlength : 2,
                class : 'form-control no-ime',
                name : name + '_month_',
                id : name + '_month_',
                type : 'text',
                value : value.substring(4, 6)
            }), $('<label>', {
                text : "{item.month}",
                'for' : name + '_month_'
            }) ]);
        };

        /* 年月入力 */
        $('input.ym').addClass('hidden').each(function() {
            $(this).after(ym($(this)));
        });

        var ymd = function($this) {
            var name = $this.attr('name');
            var value = $this.val();
            return ym($this).append([ $('<input>', {
                maxlength : 2,
                class : 'form-control no-ime',
                name : name + '_day_',
                id : name + '_day_',
                type : 'text',
                value : value.substring(6, 8)
            }), $('<label>', {
                text : "{item.day}",
                'for' : name + '_day_'
            }) ]);
        };

        /* 年月日入力 */
        $('input.date,input.ymd').addClass('hidden').each(function() {
            $(this).after(ymd($(this)));
        });

        var ymdh = function($this) {
            var name = $this.attr('name');
            var value = $this.val();
            return ymd($this).append([ $('<input>', {
                maxlength : 2,
                class : 'form-control no-ime',
                name : name + '_hour_',
                id : name + '_hour_',
                type : 'text',
                value : value.substring(8, 10)
            }), $('<label>', {
                text : "{item.hour}",
                'for' : name + '_hour_'
            }) ]);
        };

        /* 年月日時入力 */
        $('input.datetime,input.ymdh').addClass('hidden').each(function() {
            $(this).after(ymdh($(this)));
        });

        var ymdhi = function($this) {
            var name = $this.attr('name');
            var value = $this.val();
            return ymdh($this).append([ $('<input>', {
                maxlength : 2,
                class : 'form-control no-ime',
                name : name + '_minute_',
                id : name + '_minute_',
                type : 'text',
                value : value.substring(10, 12)
            }), $('<label>', {
                text : "{item.minute}",
                'for' : name + '_minute_'
            }) ]);
        };

        /* 年月日時分入力 */
        $('input.timestamp,input.ymdhi').addClass('hidden').each(function() {
            $(this).after(ymdhi($(this)));
        });

        /* 年月日時分秒入力 */
        $('input.ymdhis').addClass('hidden').each(function() {
            var $this = $(this);
            var name = $this.attr('name');
            var value = $this.val();
            $(this).after(ymdhi($this).append([ $('<input>', {
                maxlength : 2,
                class : 'form-control no-ime',
                name : name + '_second_',
                id : name + '_second_',
                type : 'text',
                value : value.substring(12, 14)
            }), $('<label>', {
                text : "{item.second}",
                'for' : name + '_second_'
            }) ]));
        });
    })();

    /* 町字コード */
    $('input.address').attr('maxlength', 11).addClass('no-ime').after($('<button>', {
        text : "{item.map}",
        class : 'form-control btn btn-default',
        type : 'button'
    }).on('click', function() {
        var control = $(this).prev();
        $.addressDialog(control.val(), function(code, address, postcode) {
            control.val(code);
            var formatted = "{item.postcode}" + postcode.substr(0, 3) + '-' + postcode.substr(3);
            $.set(control.data('address'), address);
            $.set(control.data('raw-postcode'), postcode);
            $.set(control.data('postcode'), formatted);
            $.set(control.data('full'), formatted + ' ' + address);
        });
    }));

    /* コード選択 */
    $('select[data-code]').each(function() {
        var value = $(this).data('value');
        $(this).append($.map($.codeMap[$(this).data('code')], function(v) {
            var map = {
                text : v[1],
                value : v[0]
            };
            if (value == v[0]) {
                map.selected = 'selected';
            }
            return $('<option>', map);
        }));
    });

    /* リンク */
    $(document).on('click', '[data-href]:not([data-action]):not([action])', function() {
        var href = $(this).data('href')
        $.autoConfirm($(this).data('confirm'), function() {
            location.href = href;
        });
    });

    /* サーバ通信 */
    $('form[action!=dump]').on('submit', function() {
        $.autoSubmit($(this).attr('action'), $(this).attr('method'), $(this), $(this).data('confirm'), $(this).data('href'));
        return false;
    });
    $('button[type=button][data-action],input[type=button],a[data-action]').on('click', function() {
        var href = $(this)[$(this).prop('tagName') == 'A' ? 'attr' : 'data']('href');
        $.autoSubmit($(this).data('action'), $(this).data('method'), $(this).closest('form'), $(this).data('confirm'), href);
        return false;
    });

    /* 戻るボタン */
    $(document).on('click', '.btn.back', function() {
        history.go(-1);
    });

    /* ポップアップ表示ボタン */
    $(document).on('click', 'a[target]', function() {
        var $this = $(this);
        var options = $.map([ [ 'width', 500 ], [ 'height', 500 ], [ 'scrollbars', 'yes' ], [ 'resizable', 'yes' ] ], function(v) {
            return v[0] + '=' + ($this.data(v[0]) || v[1]);
        }).join(',');
        window.open($(this).attr('href'), $(this).attr('target'), options);
        return false;
    });

    /* 入力幅調整 */
    $('input[maxlength]').adjustInputWidth();

    /* スクロール可能なテーブル */
    $('table.table-scroll').each(function() {
        $(this).find('tbody').height($(this).data('height')).closest('table').adjustTableWidth();
    });

    /* 検索パネル */
    $('.search-panel').append($('<div>', {
        class : 'pager'
    }));

    /* 検索ボタン */
    if ($('table[data-search-url]').length > 0) {
        (function() {
            var p = $('.command .pull-right');
            if (p.length <= 0) {
                p = $('<p>', {
                    class : 'pull-right'
                }).appendTo($('.command'));
            }
            p.append([ $('<button>', {
                type : 'button',
                class : 'btn btn-default search',
                text : "{item.search}"
            }), '\n', $('<button>', {
                type : 'reset',
                class : 'btn btn-default search-clear',
                text : "{item.clear}"
            }) ]);
        })();
    }

    /* ページャー */
    $('.pager').append([ $('<span>', {
        class : 'media-middle info form-group-sm form-inline'
    }), $('<div>', {
        class : 'btn-group btn-group-sm',
        role : 'group',
        style : 'padding-left:8px'
    }).append([ $('<button>', {
        type : 'button',
        class : 'btn btn-default',
        text : "{item.head}",
        disabled : 'disabled'
    }), $('<button>', {
        type : 'button',
        class : 'btn btn-default',
        text : "{item.prev}",
        disabled : 'disabled'
    }), $('<button>', {
        type : 'button',
        class : 'btn btn-default',
        text : "{item.next}",
        disabled : 'disabled'
    }), $('<button>', {
        type : 'button',
        class : 'btn btn-default',
        text : "{item.tail}",
        disabled : 'disabled'
    }) ]) ]).find('button').add('.search').on('click', function() {
        var $table = $('table[data-search-url]');
        var $button = $(this);
        var $pager = $('.pager');
        var offset = $table.data('offset') || 0;
        var pages = $table.data('pages') || 0;
        var limit = $table.data('rows') || 10;
        switch ($button.text()) {
        case "{item.head}":
            offset = 0;
            break;
        case "{item.prev}":
            offset -= limit;
            break;
        case "{item.next}":
            offset += limit;
            break;
        case "{item.tail}":
            offset = pages * limit - limit;
            break;
        }
        var data = 'offset=' + offset + '&limit=' + limit + '&sort=' + ($table.data('sort') || '') + '&' + $(this).closest('form').prepare().serialize();
        $.getJSON($table.data('search-url'), data).then(function(pair) {
            var max = pair[0];
            var rows = pair[1];
            pages = Math.floor((max + limit - 1) / limit);
            $table.data('offset', offset);
            $table.data('pages', pages);
            $pager.find('button').prop('disabled', function(i) {
                switch (i) {
                case 0:
                case 1:
                    return offset <= 0;
                case 2:
                case 3:
                    return offset >= pages * limit - limit;
                }
            });
            var page = Math.floor(offset / limit) + 1;
            var done = false;
            var go = function() {
                if (done) {
                    done = false;
                    return;
                }
                var value = $(this).val();
                if (0 < value && value <= pages) {
                    $table.data('offset', value * limit - limit);
                    $('.search:first').trigger('click');
                } else {
                    $.feedback([ "{org.hibernate.validator.constraints.Range.message}".replace('{min}', 1).replace('{max}', pages), 'page' ]);
                }
            };
            $pager.find('.info').empty().append([ $('<input>', {
                type : 'text',
                name : 'page',
                class : 'form-control',
                style : 'height:28px;margin-top:-2px',
                maxlength : String(pages).length,
                value : page
            }).on('change', go).on('keydown', function(e) {
                if (e.which == 13) {
                    go.call(this);
                    done = true;
                    return false;
                }
            }), $('<span>', {
                text : ' / ' + pages + "{item.page} {item.count}".replace('{0}', max)
            }) ]).find('input').adjustInputWidth();
            var fetch = $table.data('fetch');
            if (!$.isFunction(fetch)) {
                fetch = function(row) {
                    return $('<tr>').append($.map(row, function(column) {
                        return $('<td>', {
                            html : column || ''
                        });
                    }));
                };
            }
            $table.find('tbody').empty().append($.map(rows, fetch));
        }, $.fatal);
    });

    /* テーブルソート */
    $('th[data-sort]').on('click', function() {
        $table = $(this).closest('table');
        var sort = $(this).data('sort') || '';
        var mark = "{item.asc}";
        if (sort == $table.data('sort')) {
            sort += ' DESC';
            mark = "{item.desc}";
        }
        $table.data('sort', sort);
        $(this).closest('tr').find('th span').remove();
        $(this).append($('<span>', {
            text : mark
        }));
        $('.search:first').trigger('click');
    });

    /* 検索条件クリア */
    $('button[type=reset]').on('click', function() {
        var $table = $('table[data-search-url]').removeData('offset').removeData('sort');
        $table.find('thead th span').remove();
        $table.find('tbody').empty();
        $('.pager .info').empty();
        $('.pager button').prop('disabled', true);
    });

    /* 無効化 */
    $('a[data-disabled=true]').addClass('disabled');
    $('button[data-disabled=true],input[data-disabled=true],select[data-disabled=true],textarea[data-disabled=true]').attr('disabled', 'disabled');

    /* チェック済 */
    $('input[type=radio][data-checked=true],input[type=checkbox][data-checked=true]').attr('checked', 'checked');

    /* ツールチップ */
    $('body').tooltip({
        selector : '.has-error[title]',
        html : 'true',
        trigger : 'hover',
    });

    /* DOM操作が終わってから画面表示 */
    $('body').css('visibility', 'visible');
});
