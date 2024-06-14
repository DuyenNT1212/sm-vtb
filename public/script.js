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
    $("#warningAddNewSystem").empty();
    $.ajax({
        url: "/system/add",
        type: "post",
        data: {
            name: newSystem,
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
                text = `Them thanh cong`;
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
    $("#modalEditUser").empty();
    let currentRow = $(this).closest("tr");
    let id = currentRow.find("td:eq(5)").text();
    let name = currentRow.find("td:eq(1)").text();

    $("#modalEditUser").append(showModalDeleteUser(name));

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
            })
            .fail((err) => {
                let status = err.status;
            });
    });
});

function showModalDeleteUser(name) {
    let html =
        '\
      <div class="modal-dialog">\
        <div class="modal-content">\
          <div class="modal-body">\
            <h4>Bạn có muốn xoá hệ thống <b>' +
        name +
        '</b> ?</h4>\
          </div>\
          <div class="modal-footer justify-content-center">\
            <button id="btnDeleteUser" type="button" class="btn btn-info" data-dismiss="modal">Yes</button>\
            <button type="button" class="btn btn-secondary" data-dismiss="modal">No</button>\
          </div>\
        </div>\
      </div>';
    return html;
}

$("#tableManagement").on("click", ".edit-system", function () {
    $("#tableIpHostName").empty();
    let currentRow = $(this).closest("tr");
    let systemId = currentRow.find("td:eq(5)").text();
    let name = currentRow.find("td:eq(1)").text();

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
        let newIp = $("#newIp").val().trim();
        let newHostname = $("#newHostname").val().trim();
        let newNote = $("#newNote").val().trim();
        $.ajax({
            url: "/system/edit",
            type: "post",
            data: {
                systemId: systemId,
                ip: newIp,
                hostname: newHostname,
                note: newNote
            }
        })
            .done(function (res, status, xhr) {
                $("#warningAddNewIpHostname").empty();
                console.log('res', res, status)
                $("#tableIpHostName").append(res);
                $("#btnUpdateUser").attr("data-dismiss", "modal");
            })
            .fail((err) => {
                let status = err.status;
                console.log(status)
                if (status === 409) {
                    errText = `Thong tin đã tồn tại!`;
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
        let id = currentRow.find("td:eq(6)").text();

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
            console.log(systemId)
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
                    console.log(data);
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
                console.log(data);
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

