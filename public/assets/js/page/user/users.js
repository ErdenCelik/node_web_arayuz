"use strict";
var userDatatable = function () {
    var table;
    var dt;
    var tableDiv = "#datatable_users";

    var initDatatable = function () {
        dt = $(tableDiv).DataTable({
            searchDelay: 500,
            responsive: true,
            processing: true,
            serverSide: true,
            order: [[0, 'desc']],
            ajax: {
                url: '/user/list',
                type: "POST"
            },
            columns: [
                { data: 'id', name: 'id' },
                { data: 'first_name', name: 'first_name' },
                { data: 'last_name', name: 'last_name' },
                { data: 'email', name: 'email' },
                { data: 'last_login', name: 'last_login' },
                { data: 'role.name', name: 'role.name', className: 'w-100px' },
                { data: 'is_active', name: 'is_active', className: 'text-end  w-100px' },
                { data: null, name: 'action', className: 'text-end w-100px' },
            ],
            columnDefs: [
                {
                    target: 6,
                    // isaActive toggle switch button
                    render: function (data, type, full, meta) {
                        const isChecked = data ? 'checked' : '';
                        return `<div class="d-flex justify-content-end"><div class="form-check form-check-success form-switch form-check-solid">
                            <input class="form-check-input form-check-success" type="checkbox" role="switch" onclick="User.statusChange(${full.id},${data})" ${isChecked} />
                            </div></div>`;
                    }
                },
                {
                    target: 5,
                    render: function (data, type, full, meta) {
                        return '<span class="badge badge-light-success fw-bold fs-8">' + data + '</span>';
                    }
                },
                {
                    target: 7,
                    render: function (data, type, full, meta) {
                        return `<a href="javascript:User.userInformation(${full.id});" class="btn btn-sm btn-icon btn-bg-light btn-active-color-primary w-30px h-30px">
                                                <i class="ki-duotone ki-black-right fs-2 text-gray-500"></i>
                        </a>`;
                    }
                }
            ]
        });

        table = dt.$;

        dt.on('draw', function () {
            KTMenu.createInstances();
        });
    }
    var refreshDatatable = function () {
        if (dt) {
            dt.ajax.reload();
        }
    }
    return {
        init: function () {
            initDatatable();
        },
        refresh: function (){
            refreshDatatable();
        }
    }
}();


var User = function () {
    var form;
    var submitButton;
    var validator;
    var modalElement;
    var modal;
    var listenerButton;
    var userPasswordRequired = true

    var handleValidation = function (e) {
        validator = FormValidation.formValidation(
            form,
            {
                fields: {
                    'firstName': {
                        validators: {
                            notEmpty: {
                                message: 'Adı Mecburi'
                            }
                        }
                    },
                    'lastName': {
                        validators: {
                            notEmpty: {
                                message: 'Soyadı Mecburi'
                            }
                        }
                    },
                    'email': {
                        validators: {
                            notEmpty: {
                                message: 'Email Mecburi'
                            },
                            emailAddress: {
                                message: 'Geçerli bir email adresi giriniz.'
                            }
                        }
                    },
                    'password': {
                        validators: {
                            callback: {
                                message: 'Şifre Mecburi.',
                                callback: function(value, validator, $field) {
                                    const idField = form.querySelector('[name="id"]');
                                    if ((!idField || !idField.value) && form.querySelector('[name="password"]').value === "") {
                                        return false;
                                    }
                                    return true;
                                }
                            }
                        }
                    },
                    'roleName': {
                        validators: {
                            notEmpty: {
                                message: 'Rol Mecburi'
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

                    axios.post('/user', new FormData(form),
                        {
                            headers: {
                                'Content-Type': 'application/json',
                            }
                        }).then(function (response) {
                        if (response) {
                            form.reset();
                            toastr.success(response.data.message);
                            modal.hide();
                            userDatatable.refresh();
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
    var statusChange = function (id, status) {
        const newStatus = !status;
        axios.put('/user/status', {
            id: id,
            status: newStatus
        }).then(response => {
            toastr.success(response.data.message);
        }).catch(error => {
            toastr.error(error.response.data.message);
        });
    }
    var formReset = function (){
        form.reset();
        form.querySelector('[name="id"]').value = "";
        userPasswordRequired=false;
    }

    var userInformation = function (userId){
        formReset();
        axios.get(`/user/${userId}`).then(response => {
            modal.show();
            form.querySelector('[name="id"]').value = response.data.data.id;
            form.querySelector('[name="firstName"]').value = response.data.data.firstName;
            form.querySelector('[name="lastName"]').value = response.data.data.lastName;
            form.querySelector('[name="email"]').value = response.data.data.email;
            form.querySelector('[name="roleName"]').value = response.data.data.role_name;
            form.querySelector('[name="status"]').checked = response.data.data.isActive;
            userPasswordRequired=true;
        }).catch(error => {
            toastr.error(error.response.data.message);
        });
    }

    return {
        init: function () {
            modalElement = document.getElementById('userEditCreateModal');
            if (!modalElement) {
                return;
            }
            modal = new bootstrap.Modal(modalElement);
            form = document.getElementById('userEditCreateForm');
            submitButton = form.querySelector('#userEditCreateFormSubmit');
            handleValidation();
            listenerButton = document.getElementById('createUser');
            listenerButton.addEventListener('click', function (e) {
                formReset();
                modal.show();
            });
            handleSubmit();
        },
        userInformation: function (userId){
            userInformation(userId);
        },
        statusChange: function (id, status) {
            statusChange(id, status);
        },
    }
}();

KTUtil.onDOMContentLoaded(function () {
    userDatatable.init();
    User.init();
});