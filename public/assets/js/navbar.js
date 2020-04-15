$(document).ready(function () {
    const path = window.location.pathname;
    console.log(["car-list, car-details"].some((pathName) => path.includes(pathName)));
    console.log(path);
    if (["car-list", "car-details"].some((pathName) => path.includes(pathName))) {
        console.log("true");
        $("#navCarList").addClass("is-active");
        $("#navDashboard").removeClass("is-active");
    }
    if (path === "/") {
        $("#navCarList").removeClass("is-active");
        $("#navDashboard").addClass("is-active");
    }
});
