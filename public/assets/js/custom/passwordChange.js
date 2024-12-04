"use strict";
var PasswordChange = function () {
    var form;
    var submitButton;
    var validator;
    var modalElement;
    var modal;
    var listenerButton;

    var handleValidation = function (e) {
        validator = FormValidation.formValidation(
            form,
            {
                fields: {
                    'password': {
                        validators: {
                            notEmpty: {
                                message: 'Şifre gereklidir.'
                            }
                        }
                    },
                    'passwordConfirmation': {
                        validators: {
                            notEmpty: {
                                message: 'Şifre tekrarı gereklidir.'
                            },
                            identical: {
                                compare: function () {
                                    return form.querySelector('[name="password"]').value;
                                },
                                message: 'Şifreler eşleşmiyor.'
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

    var handleSubmit = function (e) {
        submitButton.addEventListener('click', function (e) {
            e.preventDefault();
            validator.validate().then(function (status) {
                if (status === 'Valid') {
                    submitButton.setAttribute('data-kt-indicator', 'on');
                    submitButton.disabled = true;

                    axios.put('/user/password/change', new FormData(form),
                        {
                            headers: {
                                'Content-Type': 'application/json',
                            }
                        }).then(function (response) {
                        if (response) {
                            form.reset();
                            toastr.success("Şifreniz başarıyla değiştirildi!");
                            modal.hide();
                        }
                    }).catch(function (error) {
                        if (error.response) {
                            toastr.error(error.response.data.message);
                        } else {
                            toastr.error("Bir hata oluştu.");
                        }
                    }).then(() => {
                        submitButton.removeAttribute('data-kt-indicator');
                        submitButton.disabled = false;
                    })
                }else{
                    toastr.error("Lütfen formu eksiksiz doldurunuz.");
                }
            });
        });
    }

    return {
        init: function () {
            modalElement = document.getElementById('passwordChangeModal');
            if (!modalElement) {
                return;
            }
            modal = new bootstrap.Modal(modalElement);
            form = document.getElementById('passwordChangeForm');
            submitButton = form.querySelector('#passwordChangeFormSubmit');
            handleValidation();
            listenerButton = document.getElementById('passwordChangeButton');
            listenerButton.addEventListener('click', function (e) {
                modal.show();
            });
            handleSubmit();
        }
    }
}();
KTUtil.onDOMContentLoaded(function () {
    PasswordChange.init();
});