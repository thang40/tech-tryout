$(document).ready(function () {
    const texts = document.querySelectorAll(".mdc-text-field");

    for (const text of texts) {
        mdc.textField.MDCTextField.attachTo(text);
    }

    const pathArr = window.location.pathname.split("/");
    const id = pathArr[pathArr.length - 1];

    fetch("/graphql", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({
            query: `{
            plate(id: "${id}") {
          
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
            `,
        }),
    })
        .then((r) => r.json())
        .then((data) => {
            const vehicleData = data.data.plate;
            $("#plateImg").attr("src", vehicleData.plate_img);
            $("#vehicleImg").attr("src", vehicleData.vehicle_img);

            $("#event_time").text(vehicleData.event_time);
            $("#plate_number").text(vehicleData.plate_number);
            $("#plate_code").text(vehicleData.plate_code);
            $("#state").text(vehicleData.state);
            $("#country").text(vehicleData.country);
        });
});
