document.addEventListener('DOMContentLoaded', () => {

    document.querySelectorAll('.edit-system').forEach(button => {
        button.addEventListener('click', () => openDetailsModal(button.dataset.id));
    });
})

$("#btnOpenModalAdd").click(function () {
    $('#add-modal').modal('show');
});

$("#btnAddNew").click(function () {
    let newSystem = $("#newSystemName").val().trim();
    $.ajax({
        url: "/system/add",
        type: "post",
        data: {
            name: newSystem,
        },
        success: function (res) {
            $("#warningUser").append(
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
    $("#modalEditUser").empty();
    let currentRow = $(this).closest("tr");
    let systemId = currentRow.find("td:eq(5)").text();
    let name = currentRow.find("td:eq(1)").text();

    $("#details-modal").modal('show');

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
});

function openDetailsModal(id) {
    fetch(`/details/${id}`)
        .then(response => response.json())
        .then(data => {
            let detailsTableBody = document.getElementById('details-table-body');
            detailsTableBody.innerHTML = '';
            data.forEach(detail => {
                let tr = document.createElement('tr');
                tr.innerHTML = `
          <td>${detail.col1}</td>
          <td>${detail.col2}</td>
          <td>${detail.col3}</td>
          <td>${detail.col4}</td>
          <td>${detail.col5}</td>
          <td>${detail.col5}</td>
        `;
                detailsTableBody.appendChild(tr);
            });
            $('#details-modal').modal('show');
        })
        .catch(error => console.error('Error:', error));
}
