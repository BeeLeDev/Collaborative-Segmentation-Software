/*!
*
* ColorPick jQuery plugin
* https://github.com/philzet/ColorPick.js
*
* Copyright (c) 2017 Phil Zet (a.k.a. Philipp Zakharchenko)
* Licensed under the MIT License
*
*/

(function ($) {
    $.isopen = false;
    $.fn.colorPick = function (config) {

        return this.each(function () {
            new $.colorPick(this, config || {});
        });

    };

    $.colorPick = function (element, options) {
        options = options || {};
        this.options = $.extend({}, $.fn.colorPick.defaults, options);
        if (options.str) {
            this.options.str = $.extend({}, $.fn.colorpickr.defaults.str, options.str);
        }
        this.color = this.options.initialColor;
        this.element = $(element);
        return this.element.hasClass(this.options.pickrclass) ? this : this.init();
    };

    $.fn.colorPick.defaults = {
        'initialColor': '#FF0000',
        'allowRecent': true,
        'recentMax': 5,
        'palette': ["#FF0000", "#00FF00", "#00FFFF", "#A020F0", "#0000FF", "#FFFF00"],
        'onColorSelected': function () {
            this.element.css({ 'backgroundColor': this.color, 'color': this.color });
        }
    };

    $.colorPick.prototype = {

        init: function () {
            var self = this;
            var o = this.options;
            $.proxy($.fn.colorPick.defaults.onColorSelected, this)();

            this.element.click(function (event) {
                event.preventDefault();
                if (!$.isopen) {
                    self.show(event.pageX, event.pageY - 180);
                } else {
                   self.hide()
                }


                $('.colorPickButton').click(function (event) {
                    self.color = $(event.target).attr('hexValue');
                    self.appendToStorage($(event.target).attr('hexValue'));
                    self.hide();
                    $.proxy(self.options.onColorSelected, self)();
                    return false;
                });

                return false;
            }).blur(function () {
                self.element.val(self.color);
                $.proxy(self.options.onColorSelected, self)();
                self.hide();
                return false;
            });

            $(document).click(function (event) {
                self.hide();
                return true;
            });

            return this;
        },

        appendToStorage: function (color) {
            if ($.fn.colorPick.defaults.allowRecent === true) {
                var storedColors = JSON.parse(localStorage.getItem("colorPickRecentItems"));
                if (storedColors == null) {
                    storedColors = [];
                }
                if ($.inArray(color, storedColors) == -1) {
                    storedColors.unshift(color);
                    storedColors = storedColors.slice(0, $.fn.colorPick.defaults.recentMax)
                    localStorage.setItem("colorPickRecentItems", JSON.stringify(storedColors));
                }
            }
        },

        show: function (left, top) {
            $.isopen = true
            $("body").append('<div id="colorPick" style="display:none;top:' + top + 'px;left:' + left + 'px"><span>Default palette:</span></div>');
            jQuery.each($.fn.colorPick.defaults.palette, (index, item) => {
                $("#colorPick").append('<div class="colorPickButton" hexValue="' + item + '" style="background:' + item + '"></div>');
            });
            if ($.fn.colorPick.defaults.allowRecent === true) {
                $("#colorPick").append('<span style="margin-top:5px">Recent:</span>');
                if (JSON.parse(localStorage.getItem("colorPickRecentItems")) == null || JSON.parse(localStorage.getItem("colorPickRecentItems")) == []) {
                    $("#colorPick").append('<div class="colorPickButton colorPickDummy"></div>');
                } else {
                    jQuery.each(JSON.parse(localStorage.getItem("colorPickRecentItems")), (index, item) => {
                        $("#colorPick").append('<div class="colorPickButton" hexValue="' + item + '" style="background:' + item + '"></div>');
                    });
                }
            }
            $("#colorPick").fadeIn(200);
        },

        hide: function () {
            $.isopen  = false;
            $("#colorPick").fadeOut(200, function () {
                $("#colorPick").remove();
                return this;
            });
        },

    };

}(jQuery));
