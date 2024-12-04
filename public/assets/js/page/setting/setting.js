"use strict";
var setting = function () {
    var handlerSubmitForm = function (id){
        if (!id){
            toastr.error('Bir hata oluştu');
            return;
        }

        let form = document.getElementById('settingForm'+id);
        let submitButton = document.getElementById('settingFormSubmit'+id);
        submitButton.setAttribute('data-kt-indicator', 'on');
        submitButton.disabled = true;
        axios.put('/setting/update', new FormData(form),
            {
                headers: {
                    'Content-Type': 'application/json',
                }
        }).then(function (response) {
            toastr.success(response.data.message);
        }).catch(function (error) {
            toastr.error(error.response.data.message);
        }).then(() => {
            submitButton.removeAttribute('data-kt-indicator');
            submitButton.disabled = false;
        });
    }
    return {
        submitForm: function (id){
            handlerSubmitForm(id);
        }
    }
}();