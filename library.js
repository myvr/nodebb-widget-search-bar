(function(module) {
    "use strict";

    var async = module.parent.require('async'),
        fs = require('fs'),
        path = require('path'),
        benchpress = null,
        templates = null;

    try {
        benchpress = module.parent.require('benchpressjs');
    } catch(error) {
        templates = module.parent.require('templates.js');
    }

    var Widget = {
        templates: {}
    };

    Widget.init = function(params, callback) {
        var app = params.app;

        var templatesToLoad = [
            "search-bar.tpl",
            "search-admin.tpl"
        ];

        function loadTemplate(template, next) {
            fs.readFile(path.resolve(__dirname, './public/templates/' + template), function (err, data) {
                if (err) {
                    console.log(err.message);
                    return next(err);
                }
                Widget.templates[template] = data.toString();
                next(null);
            });
        }

        async.each(templatesToLoad, loadTemplate);

        callback();
    };

    Widget.renderSearchBarWidget = function(widget, callback) {
        var widgetSettings = {
            hideOnUnread: widget.data.hideOnUnread ?
                'hide-on-unread' : '',
            hideOnTags: widget.data.hideOnTags ?
                'hide-on-tags' : '',
            hideOnTopic: widget.data.hideOnTopic ?
                'hide-on-topic' : '',
            hideOnHome: widget.data.hideOnHome ?
                'hide-on-home' : '',
            hideOnCategories: widget.data.hideOnCategories ?
                'hide-on-categories' : '',
            hideOnCategory: widget.data.hideOnCategory ?
                'hide-on-category' : '',
            hideOnRecent: widget.data.hideOnRecent ?
                'hide-on-recent' : '',
            hideOnPopular: widget.data.hideOnPopular ?
                'hide-on-popular' : '',
        };
        if (benchpress) {
            benchpress.compileRender(
                Widget.templates['search-bar.tpl'],
                widgetSettings
            ).then(function(html) {
                widget.html = html;
                callback(null, widget);
            });
        } else {
            var html = templates.parse(
                Widget.templates['search-bar.tpl'],
                widgetSettings
            );
            callback(null, html);
        }
    };

    Widget.defineWidget = function(widgets, callback) {
        widgets.push({
            widget: "search-bar",
            name: "Search Bar",
            description: "A search bar widget",
            content: Widget.templates["search-admin.tpl"]
        });

        callback(null, widgets);
    };

    module.exports = Widget;
}(module));
