(function(config, app, ajaxify, $, templates) {
    'use strict';
    var useTemplates = !!templates;
    if (useTemplates) {
        var searchBarWidgetSuggestions;
        $(window.document).ready(function() {
            ajaxify.loadTemplate('search-bar', function(template) {
                searchBarWidgetSuggestions = templates.getBlock(
                    template,
                    'searchBarWidgetSuggestions'
                );
            });
        });
    } else {
        var benchpress;
        require(['benchpress'], function(bp) {
            benchpress = bp;
        });
    }
    $(window).on('action:widgets.loaded',function(){
        var searchBarWidgetSuggestionElements =
                $('#searchBarWidget .search-bar-suggestions li'),
            selected;

        $('#searchBarWidget').submit(handleSearch);
        $('#searchBarWidget .search-button').click(handleSearch);
        $('#searchBarWidgetInput').on(
            'input propertychange paste',
            debounce(suggestResults, 200)
        );
        $('#searchBarWidgetInput').keydown(navigateSuggestions);
        $('#searchBarWidget .search-bar-suggestions')
            .mouseover(clearSuggestionSelection);

        function handleSearch(event) {
            event.preventDefault();
            if (!config.loggedIn && !config.allowGuestSearching) {
                app.alert({
                    message:'Search Requires Login',
                    timeout: 3000
                });
            }
            // Do not search if someone has selected a suggestion
            // with arrow keys
            if (selected) {
                return;
            }
            var input = $('#searchBarWidgetInput');
            var query = input.val().replace(/^[ ?#]*/, '');
            if (!query) {
                return;
            }
            if (config.version < "1.2") {
                query = 'search/' + query + "?in=titlesposts";
            } else {
                query = 'search/?term=' + query + "&in=titlesposts";
            }
            ajaxify.go(query);
        }

        function suggestResults(event) {
            var query = event.target.value.replace(/^[ ?#]*/, '');

            if (!query || query.length < 3) {
                renderSuggestions([]);
            }
            if (config.version < "1.2") {
                query = '/api/search/' + query + "?in=titlesposts";
            } else {
                query = '/api/search/?term=' + query + "&in=titlesposts";
            }

            $.getJSON(query, function(results) {
                // Only show the first relevant post in each topic returned
                // and create a plaintext version of each post's content
                var postsDict = {};
                var posts = [];
                results.posts.some(function(post) {
                    if (posts.length >= 5) {
                        return true;
                    }
                    if (!(post.tid in postsDict)) {
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
                        postsDict[post.tid] = post;
                        posts.push(post);
                    }
                });
                renderSuggestions(posts);
            });
        }

        function navigateSuggestions(event) {
                var key = event.keyCode;

                if (key !== 40 && key !== 38  && key !== 13 && key !== 27) {
                    return;
                }

                searchBarWidgetSuggestionElements
                    .removeClass('search-bar-selected');

                if (key === 13) {
                    //Enter key
                    if (selected) {
                        var link = selected.find('a:first').attr('href');
                        ajaxify.go(link);
                    }
                    return;
                } else if (key === 27) {
                    $('#searchBarWidget .search-bar-suggestions').hide();
                    selected = null;
                    return;
                } else if (key === 40) {
                    // Down key
                    if (!selected || selected.is(':last-child')) {
                        selected = searchBarWidgetSuggestionElements.eq(0);
                    }
                    else {
                        selected = selected.next();
                    }
                } else if (key === 38) {
                    // Up key
                    if (!selected || selected.is(':first-child')) {
                        selected = searchBarWidgetSuggestionElements.last();
                    }
                    else {
                        selected = selected.prev();
                    }
                }

                selected.addClass('search-bar-selected');
        }

        function clearSuggestionSelection() {
                searchBarWidgetSuggestionElements
                    .removeClass('search-bar-selected');
                selected = null;
        }

        function renderSuggestions(suggestions) {
            if (useTemplates) {
                var html = templates.parse(searchBarWidgetSuggestions, {
                    searchBarWidgetSuggestions: suggestions
                });
                renderHTML(html);
            } else {
                benchpress.render(
                    'search-bar',
                    {searchBarWidgetSuggestions: suggestions},
                    'searchBarWidgetSuggestions'
                ).then(renderHTML);
            }

            function renderHTML(html) {
                var searchBarWidgetSuggestionElement =
                    $('#searchBarWidget .search-bar-suggestions');
                searchBarWidgetSuggestionElement.html(html);
                if ($.isEmptyObject(suggestions)) {
                    searchBarWidgetSuggestionElement.hide();
                } else {
                    searchBarWidgetSuggestionElement.show();
                }
                searchBarWidgetSuggestionElements =
                    $('#searchBarWidget .search-bar-suggestions li');
            }
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
})(config, app, ajaxify, $, window.templates || null);
