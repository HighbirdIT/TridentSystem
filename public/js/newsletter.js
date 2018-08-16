'use strict';

var Button = AMUITouch.Button;

ReactDOM.render(React.createElement(
    Button,
    null,
    'Hello World'
), document.getElementById('root'));

$('document').ready(function () {
    $('.newsletterForm').on('submit', function (evt) {
        evt.preventDefault();
        return;
        var action = $(this).attr('action');
        var $container = $(this).closest('.formContainer');
        $.ajax({
            url: action,
            type: 'POST',
            success: function success(data) {
                if (data.success) {
                    $container.html('<h2>Thank you!</h2>');
                } else {
                    $container.html('There was a problem.');
                }
            },
            err: function err() {
                $container.html('There was a problem.');
            }
        });
    });
});