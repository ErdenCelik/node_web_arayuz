"use strict";

var LoginGeneral = function () {
    var form;
    var submitButton;
    var validator;

    var handleValidation = function (e) {
       validator = FormValidation.formValidation(
            form,
            {
                fields: {
                    'email': {
                        validators: {
                            regexp: {
                                regexp: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: 'Geçerli bir e-posta adresi giriniz.',
                            },
                            notEmpty: {
                                message: 'E-posta adresi gereklidir.'
                            }
                        }
                    },
                    'password': {
                        validators: {
                            notEmpty: {
                                message: 'Şifre gereklidir.'
                            }
                        }
                    }
                },
                plugins: {
                    trigger: new FormValidation.plugins.Trigger(),
                    bootstrap: new FormValidation.plugins.Bootstrap5({
                        rowSelector: '.fv-row',
                        eleInvalidClass: '',
                        eleValidClass: ''
                    })
                }
            }
        );
    }

    var handleSubmitAjax = function (e) {
        submitButton.addEventListener('click', function (e) {
            e.preventDefault();

            validator.validate().then(function (status) {
                if (status === 'Valid') {
                    submitButton.setAttribute('data-kt-indicator', 'on');
                    submitButton.disabled = true;
                    axios.post('/auth/api/login', new FormData(form),
                        {
                            headers: {
                                'Content-Type': 'application/json',
                            }
                        }).then(function (response) {
                        if (response) {
                            form.reset();
                            toastr.success("Başarıyla giriş yaptınız!");
                            setTimeout(() => {
                                window.location = "/dashboard";
                            }, 1000);
                        } else {
                            toastr.error(response.message.message);
                        }
                    }).catch(function (error) {
                        toastr.error(error.response.data.message);
                    }).then(() => {
                        submitButton.removeAttribute('data-kt-indicator');
                        submitButton.disabled = false;
                    });
                } else {
                    toastr.error("Lütfen formu eksiksiz doldurunuz.");
                }
            });
        });
    }

    return {
        init: function () {
            form = document.querySelector('#loginForm');
            submitButton = document.querySelector('#loginFormSubmit');

            handleValidation();
            handleSubmitAjax();
        }
    };
}();

KTUtil.onDOMContentLoaded(function () {
    LoginGeneral.init();
});