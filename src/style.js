var currentTab = 0;
document.addEventListener("DOMContentLoaded", function(event) {
    showTab(currentTab);
});

function showTab(n) {
    var x = document.getElementsByClassName("tab");
    x[n].style.display = "block";
    for (let index = 0; index < 4; index++) {
        if (index != n){
            x[index].style.display = "none";
        }
        
    }
   
    fixStepIndicator(n)
}



// function validateForm() {
//     var x, y, i, valid = true;
//     x = document.getElementsByClassName("tab");
//     y = x[currentTab].getElementsByTagName("input");
//     for (i = 0; i < y.length; i++) {
//         if (y[i].value == "") {
//             y[i].className += " invalid";
//             valid = false;
//         }


//     }
//     if (valid) {
//         document.getElementsByClassName("step")[currentTab].className += " finish";
//     }
//     return valid;
// }

function fixStepIndicator(n) {
    var i, x = document.getElementsByClassName("step");
    for (i = 0; i < x.length; i++) {
        x[i].className = x[i].className.replace(" active", "");
    }
    x[n].className += " active";
}