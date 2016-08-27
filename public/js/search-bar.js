(function(config, app, ajaxify, $, templates) {
    'use strict';
    $(window).on('action:widgets.loaded',function(){
        var searchBarWidgetSuggestions;
        ajaxify.loadTemplate('search-bar', function(template) {
            searchBarWidgetSuggestions = templates.getBlock(
                template,
                'searchBarWidgetSuggestions'
            );
        });

        $('#searchBarWidget').submit(handleSearch);
        $('#searchBarWidget .search-button').click(handleSearch);
        $('#searchBarWidgetInput').on(
            'input propertychange paste',
            debounce(suggestResults, 200)
        );
        function handleSearch(event) {
            event.preventDefault();
            if (!config.loggedIn && !config.allowGuestSearching) {
                app.alert({
                    message:'Search Requires Login',
                    timeout: 3000
                });
            }
            var input = $('#searchBarWidgetInput');
            var query = input.val().replace(/^[ ?#]*/, '');
            if (!query) {
                return;
            }
            ajaxify.go('search/' + query);
        }
        function suggestResults(event) {
            var query = event.target.value.replace(/^[ ?#]*/, '');

            if (!query || query.length < 3) {
                var html = templates.parse(searchBarWidgetSuggestions);
                $('#searchBarWidget .search-bar-suggestions')
                    .hide()
                    .html(html);
                return;
            }

            $.getJSON('/api/search/' + query, function(results) {
                // Only show the first relevant post in each topic returned
                // and create a plaintext version of each post's content
                var posts = {};
                results.posts.some(function(post) {
                    if (Object.keys(posts).length >= 5) {
                        return true;
                    }
                    if (!(post.tid in posts) ||
                            post.timestamp < posts[post.tid].timestamp) {
                        // I am so sorry about this
                        // This strips HTML from text, even when there is
                        // HTML within an HTML tag (well, that mostly works)
                        post.contentText = $(
                            $.parseHTML(
                                $(
                                    $('<div>').html(
                                        decodeEntities(post.content)
                                    )
                                ).html()
                            )
                        ).text();
                        posts[post.tid] = post;
                    }
                });

                var html = templates.parse(searchBarWidgetSuggestions, {
                    searchBarWidgetSuggestions: posts
                });
                $('#searchBarWidget .search-bar-suggestions')
                    .show()
                    .html(html);
            });
        }
    });

    // Returns a function, that, as long as it continues to be invoked, will not
    // be triggered. The function will be called after it stops being called for
    // `wait` msec.
    //
    // This utility function was originally implemented at Underscore.js.
    var now = Date.now || function () { return new Date().getTime(); };

    function debounce(func, wait) {
        var timeout, args, context, timestamp, result;
        var later = function () {
            var last = now() - timestamp;
            if (last < wait) {
                timeout = setTimeout(later, wait - last);
            } else {
                timeout = null;
                result = func.apply(context, args);
                context = args = null;
            }
        };

        return function () {
            context = this;
            args = arguments;
            timestamp = now();
            if (!timeout) {
                timeout = setTimeout(later, wait);
            }
            return result;
        };
    }

    // Removes html encoded values such as &gt; and &lt; from a string
    function decodeEntities(encodedString) {
        var textArea = document.createElement('textarea');
        textArea.innerHTML = encodedString;
        return textArea.value;
    }
})(config, app, ajaxify, $, templates);
