$(function() {

    var getTemplate = function(url) {
        $.ajax({
            url        : url,
            type       : 'GET',
            dataType   : 'html',
            timeout    : 10000,
            beforeSend : function() {
                var loadingAnimation = $('<div id="loading-animation" />').append('<img src="images/loading-animation.gif" alt="Now Loading ..." width="50" height="50" />');
                $('#maincontents').empty().append(loadingAnimation);
            },
            success    : function(data, textStatus, xhr) {
                $('#maincontents').html(data);

                // CodeMirror
                $('.codemirror').each(function(index, element) {
                    // Execute Script
                    var script = new Function(element.value);
                    script();

                    var codemirror = CodeMirror.fromTextArea(element, {
                        mode        : 'javascript',
                        theme       : 'eclipse',
                        keyMap      : 'sublime',
                        lineNumbers : true,
                        indentUnit  : 4,
                        smartIndent : true
                    });
                });

                if (location.hash === '') {
                    $('[href="#index"]').addClass('selected');
                } else {
                    $('[href="' + location.hash + '"]').addClass('selected');
                }
            },
            error      : function(xhr, textStatus, errorThrown) {
            },
            complete   : function(xhr, textStatus) {
            }
        });
    };

    var route = function(hash) {
        var matches = hash.match(/^#!?([^-]*)?-(.*)$/);

        $('#' + matches[1] + '-api').addClass('selected');

        return 'templates/' + matches[1] + '/' + matches[2] + '.html';
    };

    if (location.hash === '') {
        getTemplate('templates/index.html');
    } else {
        getTemplate(route(location.hash));
    }

    window.onpopstate = function(event) {
        if (location.hash === '') {
            getTemplate('templates/index.html');
        } else {
            getTemplate(route(location.hash));
        }
    };

    // Transition
    $('#sidebar > section:first-child > h2 > a, #sidebar dl dd a').on('click', function(event) {
        event.preventDefault();

        var href = $(this).attr('href');

        if (href === '#index') {
            location.hash = '';
        } else {
            location.hash = href.slice(1);
        }

        location.reload();
    });

    // Accordion-Panel
    $('#sidebar > section > h2 > a:not(.selected)').parent('h2').next('dl').hide();
    $('#sidebar > section:not(:first-child) > h2 > a').on('click', function(event) {
        event.preventDefault();

        if ($(this).parent('h2').next('dl').is(':visible')) {
            $('#sidebar > section > dl').slideUp('fast', 'swing');
        } else {
            $('#sidebar > section > dl').slideUp('fast', 'swing');
            $(this).parent('h2').next('dl').slideDown('fast', 'swing');
        }
    });

    // Social Buttons
    $('#twitter').socialbutton('twitter', {lang : 'en_US'});
    $('#facebook').socialbutton('facebook_like', {button : 'button_count', locale : 'en_US'});
    $('#hatena').socialbutton('hatena');
    $('#google').socialbutton('google_plusone', {size : 'medium'}).width(72);
});
