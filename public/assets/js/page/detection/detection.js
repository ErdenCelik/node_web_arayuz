"use strict";
var detectionDatatable = function () {
    var table;
    var dt;
    var tableDiv = "#datatableDetections";

    var initDatatable = function () {
        dt = $(tableDiv).DataTable({
            searchDelay: 500,
            responsive: true,
            processing: true,
            serverSide: true,
            order: [[6, 'desc']],
            stateSave: true,
            select: {
                style: 'multi',
                selector: 'td:first-child input[type="checkbox"]',
                className: 'row-selected'
            },
            ajax: {
                url: '/detection/list',
                type: "POST",
                data: function (d) {
                    d.filter = d.filter || {};
                    if (document.querySelector('[name="source"]').value) {
                        d.filter.source = document.querySelector('[name="source"]').value
                    }
                    if (document.querySelector('[name="sourceName"]').value) {
                        d.filter.sourceName = document.querySelector('[name="sourceName"]').value
                    }
                    if (document.querySelector('[name="filterDate"]').value) {
                        const dateRange = document.querySelector('[name="filterDate"]').value.split(' / ');
                        if (dateRange.length === 2) {
                            d.filter.filterStartDate = dateRange[0];
                            d.filter.filterEndDate = dateRange[1];
                        }
                    }
                    if (document.querySelector('[name="anomaly"]')) {
                        d.filter.anomaly = document.querySelector('[name="anomaly"]').checked;
                    }
                    const selectedObjects = Array.from(document.querySelector('[name="objects[]"]').selectedOptions)
                        .map(option => option.value);
                    if (selectedObjects.length > 0) {
                        d.filter.objects = selectedObjects;
                    }
                }
            },
            columns: [
                { data: 'id', name: 'id' },
                { data: 'source', name: 'source' },
                { data: 'source_name', name: 'source_name' },
                { data: 'detected_objects', name: 'detected_objects',  className: 'w-200px'  },
                { data: 'object_count', name: 'object_count' },
                { data: 'is_anomaly', name: 'is_anomaly' },
                { data: 'image_path', name: 'image_path', className: 'w-150px' },
                { data: 'created_at', name: 'created_at', className: 'w-200px' },
                { data: null, name: 'action', className: 'text-end w-100px' },
            ],
            columnDefs: [
                {
                    targets: 0,
                    orderable: false,
                    render: function (data) {
                        return `
                            <div class="form-check form-check-sm form-check-custom form-check-solid">
                                <input class="form-check-input" type="checkbox" value="${data}" />
                            </div>`;
                    }
                },
                {
                    targets: 3,
                    render: function (data, type, full, meta) {
                        let html = '';
                        data.forEach((item) => {
                            html += `<span class="badge badge-sm badge-success m-1">${item}</span>`;
                        });
                        return html;
                    }
                },
                {
                    targets: 5,
                    render: function (data, type, full, meta) {
                        return data ? '<span class="badge badge-light-success">Anormal</span>' : '<span class="badge badge-light-primary">Normal</span>';
                    }
                },
                {
                    targets: 6,
                    render: function (data, type, full, meta) {
                        return `<a class="d-block overlay" data-fslightbox="lightbox-${full.id}" href="http://${window.APP_CONFIG.pyHost}:${window.APP_CONFIG.apiPort}/api/detection/${full.uuid}" >
                                    <div class="card  overlay overflow-hidden">
                                        <div class="card-body p-0">
                                            <div class="overlay-wrapper">
                                                <img src="http://${window.APP_CONFIG.pyHost}:${window.APP_CONFIG.apiPort}/api/detection/${full.uuid}" alt="" class="w-100 rounded"/>
                                            </div>
                                            <div class="overlay-layer bg-dark bg-opacity-25">
                                                <i class="ki-duotone ki-eye fs-3x text-white">
                                                    <span class="path1"></span>
                                                    <span class="path2"></span>
                                                    <span class="path3"></span>
                                                </i>                    
                                            </div>
                                        </div>
                                    </div>
                                </a>`;
                    }
                },
                {
                    targets: 8,
                    render: function (data, type, full, meta) {
                        return `
                            <a href="javascript:;" class="btn btn-sm btn-light btn-active-light-primary" onclick="detectionDetail.show(${full.id})">Detay</a>`

                    }
                }
            ]
        });

        table = dt.$;

        dt.on('draw', function () {
            initToggleToolbar();
            toggleToolbars();
            KTMenu.createInstances();
            window.refreshFsLightbox();
        });
    }

    var handleFilterDatatable = () => {
        const filterButton = document.querySelector('[data-table-detection-filter="filter"]');

        filterButton.addEventListener('click', function () {
            dt.search('').draw();
        });
    }

    var initToggleToolbar = function () {
        const container = document.querySelector(tableDiv);
        const checkboxes = container.querySelectorAll('[type="checkbox"]');
        const deleteSelected = document.querySelector('[data-table-detection-select="delete_selected"]');

        checkboxes.forEach(c => {
            c.addEventListener('click', function () {
                setTimeout(function () {
                    toggleToolbars();
                }, 50);
            });
        });

        deleteSelected.addEventListener('click', function () {
            Swal.fire({
                text: "Seçilen tüm kayıtları silmek istediğinizden emin misiniz?",
                icon: "warning",
                showCancelButton: true,
                buttonsStyling: false,
                showLoaderOnConfirm: true,
                confirmButtonText: "Evet, sil!",
                cancelButtonText: "Hayır, iptal",
                customClass: {
                    confirmButton: "btn btn-sm fw-bold btn-danger",
                    cancelButton: "btn btn-sm fw-bold btn-active-light-primary"
                },
            }).then(function (result) {
                if (result.value) {

                    const selectedIds = [];
                    const selectedCheckboxes = container.querySelectorAll('tbody [type="checkbox"]:checked');
                    selectedCheckboxes.forEach(c => {
                        selectedIds.push(c.value);
                    });

                    const queryParams = selectedIds.map(id => `ids[]=${id}`).join('&');
                    return axios.delete(`/detection/delete?${queryParams}`)
                        .then(response => {
                            toastr.success(response.data.message);
                            const headerCheckbox = container.querySelectorAll('[type="checkbox"]')[0];
                            headerCheckbox.checked = false;
                            dt.draw();
                        })
                        .catch(error => {
                            toastr.error(error.response.data.message);
                        });
                } else if (result.dismiss === 'cancel') {
                    Swal.fire({
                        text: "Seçilen kayıtlar silinmedi.",
                        icon: "error",
                        buttonsStyling: false,
                        confirmButtonText: "Tamam",
                        customClass: {
                            confirmButton: "btn btn-sm fw-bold btn-primary",
                        }
                    });
                }
            });
        });
    }

    // Toggle toolbars
    var toggleToolbars = function () {
        // Define variables
        const container = document.querySelector(tableDiv);
        const toolbarBase = document.querySelector('[data-table-detection-toolbar="base"]');
        const toolbarSelected = document.querySelector('[data-table-detection-toolbar="selected"]');
        const selectedCount = document.querySelector('[data-table-detection-select="selected_count"]');

        // Select refreshed checkbox DOM elements
        const allCheckboxes = container.querySelectorAll('tbody [type="checkbox"]');

        // Detect checkboxes state & count
        let checkedState = false;
        let count = 0;

        // Count checked boxes
        allCheckboxes.forEach(c => {
            if (c.checked) {
                checkedState = true;
                count++;
            }
        });

        // Toggle toolbars
        if (checkedState) {
            selectedCount.innerHTML = count;
            toolbarBase.classList.add('d-none');
            toolbarSelected.classList.remove('d-none');
        } else {
            toolbarBase.classList.remove('d-none');
            toolbarSelected.classList.add('d-none');
        }
    }


    var refreshDatatable = function () {
        if (dt) {
            dt.ajax.reload();
        }
    }
    return {
        init: function () {
            initDatatable();
            initToggleToolbar();
            handleFilterDatatable();
        },
        refresh: function (){
            refreshDatatable();
        }
    }
}();

"use strict";
var detectionFilterMenu = function () {
    var dateStatus = false;
    var t = document.querySelector("#filterMenu");

    return {
        init: function () {
            if (!t){
                return
            }
            var menu = KTMenu.getInstance(t);
            if (menu) {
                menu.on("kt.menu.dropdown.hide", function(item) {
                    if (dateStatus){
                        dateStatus = false;
                        return false;
                    }
                });
            }
            $(t.querySelector('[name="filterDate"]')).daterangepicker({
                autoUpdateInput: false,
                startDate: moment(),
                endDate: moment(),
                ranges: {
                    "Boş": [null, null],
                    "Bugün": [moment(), moment()],
                    "Dün": [moment().subtract(1, "days"), moment().subtract(1, "days")],
                    "Son 7 Gün": [moment().subtract(6, "days"), moment()],
                    "Son 30 Gün": [moment().subtract(29, "days"), moment()],
                    "Bu Ay": [moment().startOf("month"), moment().endOf("month")],
                    "Geçen Ay": [moment().subtract(1, "month").startOf("month"), moment().subtract(1, "month").endOf("month")]
                },
                locale: {
                    format: 'DD-MM-YYYY',
                    separator: ' / ',
                    applyLabel: 'Tamam',
                    cancelLabel: 'Temizle',
                    fromLabel: 'Başlangıç',
                    toLabel: 'Bitiş',
                    customRangeLabel: 'Özel Aralık',
                    weekLabel: 'H',
                    daysOfWeek: ['Pz', 'Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct'],
                    monthNames: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', "Ağustos", 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
                    firstDay: 1
                }
            }, function (start, end) {
                if (start.isValid() && end.isValid()) {
                    $(t.querySelector('[name="filterDate"]')).val(start.format('YYYY-MM-DD') + ' / ' + end.format('YYYY-MM-DD'));
                } else {
                    $(t.querySelector('[name="filterDate"]')).val('');
                }

            });
            $(t.querySelector('[name="filterDate"]')).on('hide.daterangepicker', function(ev, picker) {
                ev.preventDefault();

            });
            $(t.querySelector('[name="filterDate"]')).on('show.daterangepicker', function(ev, picker) {
                dateStatus = true;
            });
        }
    }
}();

"use strict";
var detectionDetail = function (){
    var modalEl;
    var modal;
    var detailData

    var resetData = function () {
        detailData.innerHTML = '';
    }
    var showData = function (id) {
        if (!id){
            toastr.error('Geçersiz ID');
            return;
        }
        axios.get(`/detection/detail/${id}/objects`).then(response => {

            let objects = response.data.data.objects;
            objects = objects.map(object => {
                return `<div class="col-lg-6 mb-5" id="object_${object.id}">
                    <div class="card position-relative">
                        <div class="card-body  p-0">
                            <div class="overlay-wrapper">
                                <img src="http://${window.APP_CONFIG.pyHost}:${window.APP_CONFIG.apiPort}/api/detection-object/${object.uuid}" alt="" class="w-100 rounded"/>
                            </div>
                            <div class="overlay-layer bg-dark bg-opacity-25 d-flex flex-column justify-content-between">
                                <div class="text-white bg-success rounded position-absolute bottom-0 start-0 p-1 m-1">
                                    <span>${object.object_type}</span>
                                </div>
                                <div class="text-white bg-success rounded position-absolute bottom-0 end-0 p-1 m-1">
                                    <span>${object.confidence.toFixed(4)}</span>
                                </div>
                                <div class="position-absolute top-0 end-0 p-1">
                                    <button class="btn btn-sm btn-danger btn-sm" onclick="detectionDetail.deleteObject(${object.id})">
                                        <i class="fas fa-trash p-0"></i>
                                    </button>
                                </div>
                                <div class="position-absolute top-0 start-0 p-1">
                                    <a data-fslightbox="lightbox-object-${object.detection_id}" href="http://${window.APP_CONFIG.pyHost}:${window.APP_CONFIG.apiPort}/api/detection-object/${object.uuid}" >
                                        <button class="btn btn-sm btn-primary btn-sm">
                                            <i class="ki-duotone ki-eye text-white p-0">
                                                <span class="path1"></span>
                                                <span class="path2"></span>
                                                <span class="path3"></span>
                                            </i>   
                                        </button>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
            }).join('');

            detailData.innerHTML = objects;
            modal.show();
            window.refreshFsLightbox();
        }).catch(error => {
            toastr.error(error.response.data.message);
        });
    }
    var deleteObject = function (id) {
        if (!id){
            toastr.error('Geçersiz ID');
            return;
        }
        axios.delete(`/detection/detail/object/${id}/delete`).then(response => {
            toastr.success(response.data.message);
            $('#object_'+id).remove();
        }).catch(error => {
            toastr.error(error.response.data.message);
        });
    }

    return {
        init: function () {
            modalEl = document.querySelector('#detectionDetail')
            if (!modalEl){
                return;
            }
            modal = new bootstrap.Modal(modalEl);
            detailData = modalEl.querySelector('#detectionDetailData');
        },
        show: function (id){
            showData(id);
        },
        deleteObject: function (id) {
            deleteObject(id);
        }

    }
}();

KTUtil.onDOMContentLoaded(function () {
    detectionDatatable.init();
    detectionFilterMenu.init();
    detectionDetail.init();
});