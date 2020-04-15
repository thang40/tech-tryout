/* ------------------------------------------------------------------------------
 *
 *  # Custom JS code
 *
 *  Place here all your custom js. Make sure it's loaded after app.js
 *
 * ---------------------------------------------------------------------------- */

const setValidityValue = ({ is_junk, is_valid_code, is_valid_plate, is_valid_source }) => {
    const allOtherValid = is_valid_code && is_valid_plate && is_valid_source;
    return is_junk === false && allOtherValid ? true : false;
};

const getBase64FromImageUrl = (id) => {
    const img = document.getElementById(id);
    var canvas = document.createElement("canvas");
    canvas.width = img.clientWidth;
    canvas.height = img.clientHeight;

    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    var dataURL = canvas.toDataURL();

    return dataURL;
};

const pdfWithImages = {
    extend: "pdfHtml5",
    pageSize: { width: 1000, height: 1000 },
    customize: (doc, button, table) => {
        const tableBody = doc.content[1].table.body;

        const isJunkIdx = tableBody[0].findIndex((c) => c.text === "Is Junk?");
        const isValidCodeIdx = tableBody[0].findIndex((c) => c.text === "Is Valid Code?");
        const isValidPlateIdx = tableBody[0].findIndex((c) => c.text === "Is Valid Plate?");
        const IsValidSourceIdx = tableBody[0].findIndex((c) => c.text === "Is Valid Source?");
        const validityIdx = tableBody[0].findIndex((c) => c.text === "Validity?");
        const plateImgIdx = tableBody[0].findIndex((c) => c.text === "Plate Image");
        const vehicleImgIdx = tableBody[0].findIndex((c) => c.text === "Vehicle Image");

        tableBody.map((row) => {
            row.pop();
        });

        tableBody.forEach((row, idx) => {
            if (idx === 0) {
                return;
            }
            const rowData = table.rows().data()[idx - 1];
            if (rowData.plate_img) {
                row[plateImgIdx] = {
                    margin: [0, 0, 0, 0],
                    alignment: "center",
                    width: 105,
                    height: 61,
                    image: getBase64FromImageUrl(`plate_img-${rowData.id}`),
                };
            }
            if (rowData.vehicle_img) {
                row[vehicleImgIdx] = {
                    margin: [0, 0, 0, 0],
                    alignment: "center",
                    width: 105,
                    height: 61,
                    image: getBase64FromImageUrl(`vehicle_img-${rowData.id}`),
                };
            }
            if (rowData.is_junk !== undefined) {
                row[isJunkIdx] = {
                    ...row[isJunkIdx],
                    text: rowData.is_junk ? "yes" : "no",
                };
            }
            if (rowData.is_valid_code !== undefined) {
                row[isValidCodeIdx] = {
                    ...row[isValidCodeIdx],
                    text: rowData.is_valid_code ? "yes" : "no",
                };
            }
            if (rowData.is_valid_plate !== undefined) {
                row[isValidPlateIdx] = {
                    ...row[isValidPlateIdx],
                    text: rowData.is_valid_plate ? "yes" : "no",
                };
            }
            if (rowData.is_valid_source !== undefined) {
                row[IsValidSourceIdx] = {
                    ...row[IsValidSourceIdx],
                    text: rowData.is_valid_source ? "yes" : "no",
                };
            }
            const { is_junk, is_valid_code, is_valid_plate, is_valid_source } = rowData;
            row[validityIdx] = {
                ...row[validityIdx],
                text: setValidityValue({ is_junk, is_valid_code, is_valid_plate, is_valid_source }) ? "yes" : "no",
            };
        });

        return doc;
    },
};

var buttonCommon = {
    exportOptions: {
        format: {
            body: function (data, row, column, node) {
                if ([5, 6, 7, 8, 9].includes(column)) {
                    const checkbox = node.querySelector("input");
                    return checkbox.checked ? "yes" : "no";
                }
                if (column === 1) {
                    const aTag = node.querySelector("a");
                    return aTag.text;
                }
                return data;
            },
        },
    },
};

const renderValidationCheckbox = (field, value, recordId, disabled) => {
    const classNames = "form-check-input " + field + "-checkbox";
    const checkbox = $("<input>", {
        type: "checkbox",
        class: classNames,
        checked: value,
        "data-id": recordId,
        "data-field": field,
        disabled: disabled,
    });

    return checkbox[0].outerHTML + (value ? "Yes" : "No");
};

$(document).ready(function () {
    var t = $("#PlatesTable").DataTable({
        paging: true,
        processing: true,
        serverSide: true,
        responsive: true,
        scrollY: "67vh",
        pageLength: 10,
        scrollX: true,
        scroller: {
            loadingIndicator: true,
        },
        language: { search: "", searchPlaceholder: "Search..." },
        scrollCollapse: true,
        dom: '<"searchbar"f>Brt<"clear"lp>',
        buttons: [
            $.extend(true, {}, buttonCommon, {
                extend: "copy",
                exportOptions: {
                    stripHtml: false,
                    columns: [1, 2, 3, 4, 5, 8, 9, 10, 11, 12],
                },
            }),
            $.extend(true, {}, buttonCommon, {
                extend: "excel",
                exportOptions: {
                    stripHtml: false,
                    columns: [1, 2, 3, 4, 5, 8, 9, 10, 11, 12],
                },
            }),
            $.extend(true, {}, buttonCommon, {
                extend: "csv",
                exportOptions: {
                    stripHtml: false,
                    columns: [1, 2, 3, 4, 5, 8, 9, 10, 11, 12],
                },
            }),

            pdfWithImages,
            {
                extend: "print",
                exportOptions: {
                    stripHtml: false,
                    columns: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                },
            },
        ],
        searchDelay: 500,
        ajax: function (data, callback, settings) {
            console.log(`{
                plates(searchText: "${data.search.value}", pagination: {offset: ${data.start}, first: ${data.length}}) {
                  count
                  data {
                    id
                    event_time
                    plate_number
                    plate_code
                    state
                    country
                    plate_img
                    vehicle_img
                    is_junk
                    is_valid_code
                    is_valid_plate
                    is_valid_source
                  }
                }
              }
              `);
            fetch("/graphql", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    query: `{
                        plates(searchText: "${data.search.value}", pagination: {offset: ${data.start}, first: ${data.length}}) {
                          count
                          data {
                            id
                            event_time
                            plate_number
                            plate_code
                            state
                            country
                            plate_img
                            vehicle_img
                            is_junk
                            is_valid_code
                            is_valid_plate
                            is_valid_source
                          }
                        }
                      }
                      `,
                }),
            })
                .then((r) => r.json())
                .then((data) => {
                    callback({
                        data: data.data.plates.data.map((item) => ({ ...item, DT_RowId: item.id })),
                        recordsTotal: data.data.plates.count,
                        recordsFiltered: data.data.plates.count,
                    });
                });
        },
        exportOptions: { stripHtml: false },
        columns: [
            {
                defaultContent: "",
                targets: 0,
                searchable: false,
                orderable: false,
                className: "table-column-small",
                render: function (data, type, row) {
                    return `<div class="pretty p-svg p-curve" style="margin: 5px;">
                    <input type="checkbox" id="checkbox-${row.id}" name="table-checkbox" />
                    <div class="state p-info">
                        <!-- svg path -->
                        <svg class="svg svg-icon" viewBox="0 0 20 20">
                            <path d="M7.629,14.566c0.125,0.125,0.291,0.188,0.456,0.188c0.164,0,0.329-0.062,0.456-0.188l8.219-8.221c0.252-0.252,0.252-0.659,0-0.911c-0.252-0.252-0.659-0.252-0.911,0l-7.764,7.763L4.152,9.267c-0.252-0.251-0.66-0.251-0.911,0c-0.252,0.252-0.252,0.66,0,0.911L7.629,14.566z" style="stroke: white;fill:white;"></path>
                        </svg>
                        <label></label>
                    </div>
                </div>`;
                },
            },
            {
                data: "event_time",
                defaultContent: "",
                name: "Event Time",
                className: "table-column",
                render: function (data, type, row) {
                    var _d = new Date(1 * data);
                    return _d.toLocaleString();
                },
            },
            {
                data: "plate_number",
                className: "table-column",
                defaultContent: "",
                name: "Plate Number",
                render: function (data, type, row) {
                    return `<a href="${`/car-details/${row.id}`}">${data}</a>`;
                },
            },
            { data: "plate_code", className: "table-column", defaultContent: "", name: "Code" },
            {
                data: "state",
                defaultContent: "",
                name: "State",
                className: "table-column",
                render: function (data, type, row) {
                    if (data == "az") return "Abu Dhabi";
                    else if (data == "sh") return "Sharjah";
                    else if (data == "du") return "Dubai";
                    else if (data == "uq") return "Umm Al Quwain";
                    else if (data == "om") return "Oman";
                    else if (data == "qa") return "Qatar";
                    else if (data == "kw") return "Kuwait";
                    else if (data == "sa") return "Saudi Arabia";
                    else if (data == "rk") return "Ras Al Khaimah";
                    else if (data == "bh") return "Bahrain";
                    else if (data == "aj") return "Ajman";
                    else return data;
                },
            },
            {
                data: "country",
                defaultContent: "",
                name: "Country",
                className: "table-column",
                render: function (data, type, row) {
                    if (data == "ae") return "United Arab Emirates";
                    else if (data == "om") return "Oman";
                    else if (data == "qa") return "Qatar";
                    else if (data == "kw") return "Kuwait";
                    else if (data == "sa") return "Saudi Arabia";
                    else if (data == "bh") return "Bahrain";
                    else return data;
                },
            },
            {
                data: "plate_img",
                defaultContent: "N/A",
                name: "Plate",
                className: "table-column",
                render: function (data, type, row) {
                    return `<img src="${data}" id="plate_img-${row.id}" crossorigin="anonymous" />`;
                },
            },
            {
                data: "vehicle_img",
                defaultContent: "N/A",
                name: "Vehicle",
                className: "table-column",
                render: function (data, type, row) {
                    return `<img src="${data}" id="vehicle_img-${row.id}" crossorigin="anonymous" />`;
                },
            },
            {
                data: "is_junk",
                defaultContent: "N/A",
                name: "is_junk",
                className: "table-column-small",
                render: function (data, type, row) {
                    return `<div class="pretty p-svg p-curve" style="margin: 5px;">
                    <input type="checkbox" name="validation-checkbox" id="is_junk-checkbox-${row.id}" ${
                        row.is_junk ? "checked" : ""
                    }/>
                    <div class="state p-info">
                        <!-- svg path -->
                        <svg class="svg svg-icon" viewBox="0 0 20 20">
                            <path d="M7.629,14.566c0.125,0.125,0.291,0.188,0.456,0.188c0.164,0,0.329-0.062,0.456-0.188l8.219-8.221c0.252-0.252,0.252-0.659,0-0.911c-0.252-0.252-0.659-0.252-0.911,0l-7.764,7.763L4.152,9.267c-0.252-0.251-0.66-0.251-0.911,0c-0.252,0.252-0.252,0.66,0,0.911L7.629,14.566z" style="stroke: white;fill:white;"></path>
                        </svg>
                        <label></label>
                    </div>
                </div>`;
                },
            },
            {
                data: "is_valid_code",
                defaultContent: "N/A",
                name: "is_valid_code",
                className: "table-column-small",
                render: function (data, type, row) {
                    return `<div class="pretty p-svg p-curve" style="margin: 5px;">
                    <input type="checkbox" name="validation-checkbox" id="is_valid_code-checkbox-${row.id}"  ${
                        row.is_valid_code ? "checked" : ""
                    } />
                    <div class="state p-info">
                        <!-- svg path -->
                        <svg class="svg svg-icon" viewBox="0 0 20 20">
                            <path d="M7.629,14.566c0.125,0.125,0.291,0.188,0.456,0.188c0.164,0,0.329-0.062,0.456-0.188l8.219-8.221c0.252-0.252,0.252-0.659,0-0.911c-0.252-0.252-0.659-0.252-0.911,0l-7.764,7.763L4.152,9.267c-0.252-0.251-0.66-0.251-0.911,0c-0.252,0.252-0.252,0.66,0,0.911L7.629,14.566z" style="stroke: white;fill:white;"></path>
                        </svg>
                        <label></label>
                    </div>
                </div>`;
                },
            },
            {
                data: "is_valid_plate",
                defaultContent: "N/A",
                name: "is_valid_plate",
                className: "table-column-small",
                render: function (data, type, row) {
                    return `<div class="pretty p-svg p-curve" style="margin: 5px;">
                    <input type="checkbox" name="validation-checkbox" id="is_valid_plate-checkbox-${row.id}" ${
                        row.is_valid_plate ? "checked" : ""
                    }/>
                    <div class="state p-info">
                        <!-- svg path -->
                        <svg class="svg svg-icon" viewBox="0 0 20 20">
                            <path d="M7.629,14.566c0.125,0.125,0.291,0.188,0.456,0.188c0.164,0,0.329-0.062,0.456-0.188l8.219-8.221c0.252-0.252,0.252-0.659,0-0.911c-0.252-0.252-0.659-0.252-0.911,0l-7.764,7.763L4.152,9.267c-0.252-0.251-0.66-0.251-0.911,0c-0.252,0.252-0.252,0.66,0,0.911L7.629,14.566z" style="stroke: white;fill:white;"></path>
                        </svg>
                        <label></label>
                    </div>
                </div>`;
                },
            },
            {
                data: "is_valid_source",
                defaultContent: "N/A",
                name: "is_valid_source",
                className: "table-column-small",
                render: function (data, type, row) {
                    return `<div class="pretty p-svg p-curve" style="margin: 5px;">
                    <input type="checkbox" name="validation-checkbox" id="is_valid_source-checkbox-${row.id}" ${
                        row.is_valid_source ? "checked" : ""
                    }/>
                    <div class="state p-info">
                        <!-- svg path -->
                        <svg class="svg svg-icon" viewBox="0 0 20 20">
                            <path d="M7.629,14.566c0.125,0.125,0.291,0.188,0.456,0.188c0.164,0,0.329-0.062,0.456-0.188l8.219-8.221c0.252-0.252,0.252-0.659,0-0.911c-0.252-0.252-0.659-0.252-0.911,0l-7.764,7.763L4.152,9.267c-0.252-0.251-0.66-0.251-0.911,0c-0.252,0.252-0.252,0.66,0,0.911L7.629,14.566z" style="stroke: white;fill:white;"></path>
                        </svg>
                        <label></label>
                    </div>
                </div>`;
                },
            },
            {
                defaultContent: "N/A",
                name: "Validity",
                className: "table-column-small",
                render: function (data, type, row) {
                    const { is_junk, is_valid_code, is_valid_plate, is_valid_source } = row;
                    const checked = setValidityValue({ is_junk, is_valid_code, is_valid_plate, is_valid_source });
                    return `<div class="pretty p-svg p-curve" style="margin: 5px;">
                    <input type="checkbox"  id="Validity-checkbox-${row.id}" ${checked ? "checked" : ""}  disabled />
                    <div class="state p-info">
                        <!-- svg path -->
                        <svg class="svg svg-icon" viewBox="0 0 20 20">
                            <path d="M7.629,14.566c0.125,0.125,0.291,0.188,0.456,0.188c0.164,0,0.329-0.062,0.456-0.188l8.219-8.221c0.252-0.252,0.252-0.659,0-0.911c-0.252-0.252-0.659-0.252-0.911,0l-7.764,7.763L4.152,9.267c-0.252-0.251-0.66-0.251-0.911,0c-0.252,0.252-0.252,0.66,0,0.911L7.629,14.566z" style="stroke: white;fill:white;"></path>
                        </svg>
                        <label></label>
                    </div>
                </div>`;
                },
            },
            {
                data: "action",
                defaultContent: "",
                className: "table-column-small",
                name: "action",
                render: function (data, type, row) {
                    return `<div class="dropdown is-hoverable is-right">
                    <div class="dropdown-trigger">
                        <span class="icon is-small" aria-haspopup="true" aria-controls="dropdown-menu4">
                          <i class="fas fa-ellipsis-v" aria-hidden="true"></i>
                        </span>
                    </div>
                    <div class="dropdown-menu" id="dropdown-menu4" role="menu">
                      <div class="dropdown-content">
                        <div class="dropdown-item">
                          <p>You can insert <strong>any type of content</strong> within the dropdown menu.</p>
                        </div>
                      </div>
                    </div>
                  </div>`;
                },
            },
        ],
        select: {
            style: "os",
            style: "multi",
            selector: "td:first-child input",
        },
        drawCallback: function (settings) {
            $(".dataTables_paginate").addClass("pagination is-small");
            $(".paginate_button").addClass("pagination-link").css({ background: "white" });
            $(".ellipsis").addClass("pagination-ellipsis");
            $("[name='PlatesTable_length']").wrap(`<div class='select is-small'></div>`);
            $("#selectAllCkb").prop("checked", false);
            $("[name='validation-checkbox']").on("click", function () {
                const value = this.checked;
                const infoArr = this.id.split("-");
                const fieldName = infoArr[0];
                const id = infoArr[infoArr.length - 1];
                fetch("/graphql", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify({
                        query: `
                        mutation {
                            editPlate(id: "${id}", data: { ${fieldName}: ${value} })
                          }
                        `,
                    }),
                })
                    .then((r) => r.json())
                    .then((data) => {
                        const isJunkChbValue = $(`#is_junk-checkbox-${id}`).prop("checked");
                        const isValidCodeChbValue = $(`#is_valid_code-checkbox-${id}`).prop("checked");
                        const isValidPlateChbValue = $(`#is_valid_plate-checkbox-${id}`).prop("checked");
                        const isValidSourceChbValue = $(`#is_valid_source-checkbox-${id}`).prop("checked");
                        const validityValue = setValidityValue({
                            is_junk: isJunkChbValue,
                            is_valid_code: isValidCodeChbValue,
                            is_valid_plate: isValidPlateChbValue,
                            is_valid_source: isValidSourceChbValue,
                        });
                        $(`#Validity-checkbox-${id}`).attr("checked", validityValue ? true : false);
                    });
            });
        },
        lengthChange: true,
    });

    t.buttons().container().appendTo("#tableBtns");
    $(".searchbar").appendTo("#searchBarWrapper");
    $(".clear").appendTo(".container");
    $(".clear").css({ display: "flex", "justify-content": "space-between" });

    $(".dataTables_scrollHead").css({ "margin-bottom": "-1px", "border-top": "solid 1px #dbdbdb" });

    let interval;

    $("#refreshChbox").on("change", (e) => {
        const checked = e.target.checked;
        if (checked) {
            interval = setInterval(() => {
                t.ajax.reload();
            }, 2000);
        } else {
            clearInterval(interval);
        }
    });

    $("#PlatesTable_filter input").addClass("input is-small");
    $("#PlatesTable_filter label").addClass("control has-icons-right");
    $("#PlatesTable_filter label").append(`
        <span class="icon is-small is-right">
            <i class="fas fa-search"></i>
        </span>`);
    $("#tableBtns button").addClass("button is-small is-info");

    $("#tableBtns button.buttons-copy").prepend(`
    <span class="icon is-small">
        <i class="fas fa-copy"></i>
    </span>`);
    $("#tableBtns button.buttons-csv").prepend(`<span class="icon is-small">
        <i class="fas fa-file-csv"></i>
    </span>`);
    $("#tableBtns button.buttons-excel").prepend(`<span class="icon is-small">
        <i class="fas fa-file-excel"></i>
    </span>`);
    $("#tableBtns button.buttons-pdf").prepend(`<span class="icon is-small">
        <i class="fas fa-file-pdf"></i>
    </span>`);
    $("#tableBtns button.buttons-print").prepend(`<span class="icon is-small">
        <i class="fas fa-print"></i>
    </span>`);

    setInterval(function () {
        if ($("#reload").prop("checked") == true) {
            t.ajax.reload();
            window.scrollTo(0, document.body.scrollHeight);
        }
    }, 2000);

    $("#PlatesTable tbody").on("click", "tr", function () {
        var data = t.row(this).data();
        console.log("click");
        // window.location.href = `/car-details/${data.id}`;
    });

    $("#selectAllCkb").on("click", (e) => {
        if (e.target.checked) {
            t.rows().select();
            $("[name='table-checkbox']").prop("checked", true);
        } else {
            t.rows().deselect();
            $("[name='table-checkbox']").prop("checked", false);
        }
    });

    $("#PlatesTable").on(
        "click",
        ".is_junk-checkbox, .is_valid_code-checkbox, .is_valid_plate-checkbox, .is_valid_source-checkbox",
        (e) => {
            $.ajax({
                type: "POST",
                url: "/updatePlate",
                data: {
                    id: $(e.target).data("id"),
                    field: $(e.target).data("field"),
                    value: e.target.checked,
                },
            }).then(() => {
                t.ajax.reload();
            });
        }
    );

    /* t.on('draw', function () {
         //setting the next and prev buttons with active or disabled state

         //setting the index column with values.
         t.column(0, { search: 'applied', order: 'applied' }).nodes().each(
             function (cell, i) {
                 cell.innerHTML = i + 1;
             }
         );
     });
     */
    //paging
    /* $('#next').on('click', function () {
         t.page('next').draw('page');
     });

     $('#previous').on('click', function () {
         t.page('previous').draw('page');
     });
 */
    //$('#ZipcodesTable').DataTable();
});
