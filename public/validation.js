$().ready(function() {
    $("#signup-form").validate({
        // in 'rules' user have to specify all the constraints for respective fields
        rules: {
            username: {
                required: true,
                minlength: 4 //for length of lastname
            },
            password: {
                required: true,
                minlength: 6
            },
            email: {
                required: true,
                email: true
            },
            agree: "required"
        },
        // in 'messages' user have to specify message as per rules
        messages: {
            username: {
                required: " Please enter a username",
            },
            password: {
                required: " passsword have must be 6 digit",
            },
            email: {
                required: "please enter valid email",
            },
            agree: "Please accept our policy"
        }
    });

    $("#login-form").validate({
        // in 'rules' user have to specify all the constraints for respective fields
        rules: {
            username: {
                required: true,
                minlength: 4 //for length of lastname
            },
            password: {
                required: true,
                minlength: 6
            },
            email: {
                required: true,
                email: true
            },
            agree: "required"
        },
        // in 'messages' user have to specify message as per rules
        messages: {
            username: {
                required: " Please enter a username",
            },
            password: {
                required: " passsword have must be 6 digit",
            },
            email: {
                required: "please enter valid email",
            },
            agree: "Please accept our policy"
        }
    });
});