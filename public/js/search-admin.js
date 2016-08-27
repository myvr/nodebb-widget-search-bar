require(['settings'], function(Settings) {
    Settings.load('search-bar', $('#search-bar-settings'));
    $('#save').on('click', function() {
        Settings.save('search-bar', $('#search-bar-settings'), function() {
            app.alert({
                type: 'success',
                alert_id: 'search-bar-saved',
                title: 'Settings Saved',
                message: 'Please reload your NodeBB to apply these settings',
                clickfn: function() {
                    socket.emit('admin.reload');
                }
            })
        });
    });
});
