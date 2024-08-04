$("#logout").click(function () {
    window.location.replace("/login");
});
$("#searchBtn").click(function () {
    $("#tableManagement").empty();
    let sysName = $("#sysNameSearch").val().trim();
    let ip = $("#ipSearch").val().trim();
    let hostname = $("#hostnameSearch").val().trim();
    $.ajax({
        url: "/system/all",
        type: "get",
        data: {
            sysName: sysName,
            ip: ip,
            hostname: hostname
        },
    })
        .done(function (res, status, xhr) {
            $("#tableManagement").append(res);
            $("#btnUpdateUser").attr("data-dismiss", "modal");
        })
        .fail((err) => {
            let status = err.status;
        });
});

$("#btnOpenModalAdd").click(function () {
    $('#add-modal').modal('show');
});

$(".close-modal").click(function () {
    $('#add-modal').modal('hide');
    $('#details-modal').modal('hide');
});

$("#btnAddNew").click(function () {
    let newSystem = $("#newSystemName").val().trim();
    let newSystemCode = $("#newSystemCode").val().trim();
    let username = $("#username").val().trim();
    let description = $("#description").val().trim();
    $("#warningAddNewSystem").empty();
    $.ajax({
        url: "/system/add",
        type: "post",
        data: {
            name: newSystem,
            code: newSystemCode,
            username: username,
            description: description,
        },
        statusCode: {
            409: function () {
                errText = `Tên hệ thống đã tồn tại!`;
                $("#warningAddNewSystem").append(
                    '\
                    <div class="alert alert-danger" style="width: 100%; margin-top: 10px" role="alert">' +
                    errText +
                    "</div>"
                );
            },
            200: function () {
                text = `Thêm thành công`;
                $("#warningAddNewSystem").append(
                    '\
                    <div class="alert alert-success" style="width: 100%;" role="alert">' +
                    text +
                    "</div>"
                );
            }
        },
        success: function (res) {
            $("#warningAddNewSystem").append(
                '\
          <div class="alert alert-success" style="width: 100%; margin-top: 60px;" role="alert">\
              Add account successfully!\
          </div>'
            );
        },
    })
        .done(function (res, status, xhr) {

        })
        .fail((err) => {
        });
})

$("#tableManagement").on("click", ".delete-system", function () {
    $("#modalDeleteUser").empty();
    let currentRow = $(this).closest("tr");
    console.log('currentRow', currentRow)
    let id = currentRow.find("td:eq(8)").text();

    $("#delete-modal").modal('show');

    $("#btnDeleteUser").click(function () {
        $("#tableManagement").empty();
        $.ajax({
            url: "/system/delete",
            type: "post",
            data: {
                id: id,
            },
        })
            .done(function (res, status, xhr) {
                $("#tableManagement").append(res);
                $("#btnUpdateUser").attr("data-dismiss", "modal");
                $("#delete-modal").modal('hide');
            })
            .fail((err) => {
                let status = err.status;
                $("#delete-modal").modal('hide');
            });
    });
});

$("#tableManagement").on("click", ".edit-system", function () {
    $("#tableIpHostName").empty();
    let currentRow = $(this).closest("tr");
    let systemId = currentRow.find("td:eq(8)").text();

    $("#details-modal").modal('show');
    $("#warningAddNewIpHostname").empty();

    $.ajax({
        url: "/detail",
        type: "get",
        data: {
            systemId: systemId,
        },
    })
        .done(function (res, status, xhr) {
            $("#tableIpHostName").append(res);
        })
        .fail((err) => {
            let status = err.status;
        });

    $("#btn-add-new-ip-hostname").click(function () {
        $("#tableIpHostName").empty();
        let type = $('input[name="type"]:checked').val();
        let newIp = $("#newIp").val().trim();
        let newHostname = $("#newHostname").val().trim();
        let newNote = $("#newNote").val().trim();
        $.ajax({
            url: "/system/edit",
            type: "post",
            data: {
                systemId: systemId,
                ip: newIp,
                type: type,
                hostname: newHostname,
                note: newNote
            }
        })
            .done(function (res, status, xhr) {
                $("#warningAddNewIpHostname").empty();
                $("#tableIpHostName").append(res);
                $("#btnUpdateUser").attr("data-dismiss", "modal");
            })
            .fail((err) => {
                let status = err.status;
                if (status === 409) {
                    errText = `Thông tin đã tồn tại!`;
                    $("#warningAddNewIpHostname").append(
                        '\
                        <div class="alert alert-danger" style="width: 100%; margin-top: 10px" role="alert">' +
                        errText +
                        "</div>"
                    );
                }
            });
    });

    $("#tableIpHostName").on("click", ".delete-ip-hostname", function () {
        let currentRow = $(this).closest("tr");
        let id = currentRow.find("td:eq(7)").text();

        $("#tableIpHostName").empty();
        $.ajax({
            url: "/ip-hostname/delete",
            type: "post",
            data: {
                id: id,
                systemId: systemId,
            },
        })
            .done(function (res, status, xhr) {
                $("#tableIpHostName").append(res);
                $("#btnUpdateUser").attr("data-dismiss", "modal");
            })
            .fail((err) => {
                let status = err.status;
            });
    });

    $("#btnUploadFileServer").click(function () {
        let fileInput = document.getElementById('fileServer');
        let file = fileInput.files[0];
        if (file) {
            let formData = new FormData();
            formData.append('file', file);
            formData.append('systemId', systemId);

            $("#uploadFileServerDiv").empty();

            $.ajax({
                url: '/file-upload/upload',
                type: 'POST',
                data: formData,
                body: {
                    systemId: systemId
                },
                processData: false,
                contentType: false,
                success: function (data) {
                    $("#uploadFileServerDiv").append(data);
                },
                error: function (xhr, status, error) {
                    console.error(error);
                }
            });
        } else {
            console.error('No file selected');
        }
    });

    $("#btnDownloadFileServer").click(function () {
        $.ajax({
            xhrFields: {
                responseType: "arraybuffer",
            },
            url: "/file-upload/download",
            type: "GET",
            data: {
                systemId: systemId,
            },
        })
            .done(function (res, status, xhr) {
            })
            .fail((xhr, status, errorThrow) => {
            });
    });
});

$("#fileServer").change(function () {

})

$("#btnUploadFile").click(function () {
    let fileInput = document.getElementById('fileUpload');
    let file = fileInput.files[0];
    if (file) {
        let formData = new FormData();
        formData.append('file', file);

        $("#tableManagement").empty();

        $.ajax({
            url: '/upload',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (data) {
                $("#tableManagement").append(data);
                $("#btnUpdateUser").attr("data-dismiss", "modal");
            },
            error: function (xhr, status, error) {
                console.error(error);
            }
        });
    } else {
        console.error('No file selected');
    }
});

$("#btnDownloadFile").click(function () {
    let sysName = $("#sysNameSearch").val().trim();
    let ip = $("#ipSearch").val().trim();
    let hostname = $("#hostnameSearch").val().trim();
    console.log(sysName)
    $.ajax({
        url: "/system/download",
        type: "get",
        data: {
            sysName: sysName,
            ip: ip,
            hostname: hostname
        },
    })
        .done(function (res, status, xhr) {
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(res);
            XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
            const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'data.xlsx');
        })
        .fail((err) => {
            let status = err.status;
        });
});

$("#downloadTemplate").click(function () {
    const fileUrl = '/asset/Sample_template.xlsx';

    fetch(fileUrl)
        .then(response => response.blob())
        .then(blob => {
            // Ensure the correct MIME type is used for Excel files
            const file = new Blob(blob, { type: 'application/octet-stream' });
            // Use FileSaver.js to save the file
            saveAs(file, 'Sample_template.xlsx');
        })
        .catch(error => console.error('Error fetching the file:', error));
});
