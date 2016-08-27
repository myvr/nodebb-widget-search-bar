<form id="searchBarWidget" class= "{hideOnTags} {hideOnUnread} {hideOnTopic} {hideOnHome} {hideOnCategories} {hideOnCategory} {hideOnRecent} {hideOnPopular}">
    <div class="form-group" id="search-widget-fields">
        <div class="input-group">
            <input id="searchBarWidgetInput" type="text" class="form-control" placeholder="Search" name="query" value="" autocomplete="off">
            <a class="input-group-addon search-button">
                <i class="fa fa-search fa-fw"></i>
            </a>
        </div>
    </div>
    <ul class='search-bar-suggestions' style="display: none;">
    <!-- BEGIN searchBarWidgetSuggestions -->
        <li>
            <a href='/topic/{searchBarWidgetSuggestions.topic.slug}'>
               <h5>
                    {searchBarWidgetSuggestions.topic.title}
                </h5>
                <p>
                    {searchBarWidgetSuggestions.contentText}
                </p>
            </a>
        </li>
    <!-- END searchBarWidgetSuggestions -->
    </ul>
</form>
