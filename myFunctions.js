// ملف دوال موقع تأجير السيارات

var carsData = {
    "CR-001": { model: "Toyota Corolla", price: 250000 },
    "CR-002": { model: "Kia Sportage", price: 400000 },
    "CR-003": { model: "Hyundai Elantra", price: 300000 },
    "CR-004": { model: "Chevrolet Spark", price: 180000 },
    "CR-005": { model: "Ford Explorer", price: 550000 }
};

// حذف الفراغات من بداية النص ونهايته
function removeSpaces(value) {
    return value.replace(/^\s+|\s+$/g, "");
}

// التحقق من أن النص أرقام فقط
function isNumber(text) {
    var i;
    if (text.length == 0) {
        return false;
    }
    for (i = 0; i < text.length; i++) {
        if ("0123456789".indexOf(text.charAt(i)) == -1) {
            return false;
        }
    }
    return true;
}

// التحقق من أن النص أحرف عربية وفراغات
function isArabic(text) {
    if (text.length == 0) {
        return false;
    }
    return text.search(/^[\u0621-\u064A ]+$/) != -1;
}

// التحقق من التاريخ وإرجاع كائن Date
function checkDate(text) {
    var yearText;
    var monthText;
    var dayText;
    var year;
    var month;
    var day;
    var date;

    if (text.length != 10) {
        return null;
    }
    if (text.charAt(4) != "-" || text.charAt(7) != "-") {
        return null;
    }

    yearText = text.substring(0, 4);
    monthText = text.substring(5, 7);
    dayText = text.substring(8, 10);

    if (!isNumber(yearText) || !isNumber(monthText) || !isNumber(dayText)) {
        return null;
    }

    year = parseInt(yearText, 10);
    month = parseInt(monthText, 10);
    day = parseInt(dayText, 10);

    if (isNaN(year) || isNaN(month) || isNaN(day)) {
        return null;
    }

    date = new Date(year, month - 1, day);

    if (date.getFullYear() != year) {
        return null;
    }
    if (date.getMonth() != (month - 1)) {
        return null;
    }
    if (date.getDate() != day) {
        return null;
    }

    return date;
}

// إضافة الفواصل إلى الرقم
function addCommas(value) {
    var text = "" + value;
    var result = "";
    var count = 0;
    var i;

    for (i = text.length - 1; i >= 0; i--) {
        result = text.charAt(i) + result;
        count++;
        if (count % 3 == 0 && i > 0) {
            result = "," + result;
        }
    }
    return result;
}

// عدد السيارات المختارة
function countCars() {
    var boxes = document.getElementsByName("selected_cars");
    var count = 0;
    var i;

    for (i = 0; i < boxes.length; i++) {
        if (boxes[i].checked) {
            count++;
        }
    }
    return count;
}

// التحقق من بيانات الحجز وحساب المبلغ
function checkBooking() {
    var errors = "";
    var name;
    var id;
    var startText;
    var endText;
    var mobile;
    var email;
    var startDate = null;
    var endDate = null;
    var prefix;
    var third;
    var at;
    var dot;
    var space;
    var days;
    var total = 0;
    var discount = 0;
    var finalTotal = 0;
    var boxes;
    var code;
    var info;
    var carTotal;
    var rowClass;
    var rowCount = 0;
    var html = "";
    var i;

    if (countCars() == 0) {
        alert("يرجى اختيار سيارة واحدة على الأقل قبل إتمام الحجز.");
        return false;
    }

    name = removeSpaces(document.getElementById("fullName").value);
    id = removeSpaces(document.getElementById("nationalId").value);
    startText = removeSpaces(document.getElementById("startDate").value);
    endText = removeSpaces(document.getElementById("endDate").value);
    mobile = removeSpaces(document.getElementById("mobile").value);
    email = removeSpaces(document.getElementById("email").value);

    // الاسم اختياري، وإذا كتبه الزبون يجب أن يكون بالعربية
    if (name != "" && !isArabic(name)) {
        errors += "- الاسم الكامل يجب أن يتكون من أحرف عربية فقط دون أرقام أو رموز.\n";
    }

    // الرقم الوطني إلزامي
    if (id == "") {
        errors += "- الرقم الوطني حقل إلزامي.\n";
    } else if (id.length != 11 || !isNumber(id)) {
        errors += "- الرقم الوطني يجب أن يتكون من 11 خانة رقمية.\n";
    } else {
        prefix = parseInt(id.substring(0, 2), 10);
        if (prefix < 1 || prefix > 14) {
            errors += "- أول خانتين من الرقم الوطني يجب أن ترمزا إلى محافظة بين 01 و 14.\n";
        }
    }

    // تاريخ البداية
    if (startText == "") {
        errors += "- تاريخ بداية التأجير حقل إلزامي.\n";
    } else {
        startDate = checkDate(startText);
        if (startDate == null) {
            errors += "- تاريخ البداية يجب أن يكون بالصيغة yyyy-mm-dd وتاريخاً صحيحاً.\n";
        }
    }

    // تاريخ النهاية
    if (endText == "") {
        errors += "- تاريخ نهاية التأجير حقل إلزامي.\n";
    } else {
        endDate = checkDate(endText);
        if (endDate == null) {
            errors += "- تاريخ النهاية يجب أن يكون بالصيغة yyyy-mm-dd وتاريخاً صحيحاً.\n";
        }
    }

    if (startDate != null && endDate != null) {
        if (endDate.getTime() <= startDate.getTime()) {
            errors += "- تاريخ النهاية يجب أن يكون لاحقاً لتاريخ البداية.\n";
        }
    }

    // رقم الموبايل
    if (mobile != "") {
        if (mobile.length != 10 || !isNumber(mobile)) {
            errors += "- رقم الموبايل يجب أن يتكون من 10 أرقام ويبدأ بـ 09.\n";
        } else if (mobile.substring(0, 2) != "09") {
            errors += "- رقم الموبايل يجب أن يبدأ بـ 09.\n";
        } else {
            third = mobile.charAt(2);
            if (third < "3" || third > "9") {
                errors += "- رقم الموبايل يجب أن يطابق شبكتي سيريتل أو إم تي إن (093 - 099).\n";
            }
        }
    }

    // البريد الإلكتروني
    if (email != "") {
        at = email.indexOf("@");
        dot = email.indexOf(".", at + 1);
        space = email.indexOf(" ");
        if (at < 1) {
            errors += "- البريد الإلكتروني غير صحيح.\n";
        } else if (dot < at + 2) {
            errors += "- البريد الإلكتروني غير صحيح.\n";
        } else if (dot == email.length - 1) {
            errors += "- البريد الإلكتروني غير صحيح.\n";
        } else if (space != -1) {
            errors += "- البريد الإلكتروني غير صحيح.\n";
        }
    }

    if (errors != "") {
        alert("يرجى تصحيح الأخطاء التالية:\n" + errors);
        return false;
    }

    // حساب عدد أيام التأجير
    days = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    if (days < 1) {
        days = 1;
    }

    html += "<p><strong>اسم العميل:</strong> ";
    if (name == "") {
        html += "غير مسجل";
    } else {
        html += name;
    }
    html += "</p>";
    html += "<p><strong>الرقم الوطني:</strong> " + id + "</p>";
    html += "<p><strong>مدة التأجير:</strong> " + days + " يوم</p>";

    html += "<table cellspacing=\"0\" cellpadding=\"8\">";
    html += "<tr><th>الرمز</th><th>الموديل</th><th>السعر اليومي</th><th>عدد الأيام</th><th>المجموع الفرعي</th></tr>";

    boxes = document.getElementsByName("selected_cars");
    for (i = 0; i < boxes.length; i++) {
        if (boxes[i].checked) {
            code = boxes[i].value;
            info = carsData[code];
            carTotal = info.price * days;
            total = total + carTotal;

            rowClass = "car-row";
            if (rowCount % 2 == 1) {
                rowClass = "car-row row-alt";
            }
            rowCount++;

            html += "<tr class=\"" + rowClass + "\">";
            html += "<td>" + code + "</td>";
            html += "<td>" + info.model + "</td>";
            html += "<td>" + addCommas(info.price) + " ل.س</td>";
            html += "<td>" + days + "</td>";
            html += "<td>" + addCommas(carTotal) + " ل.س</td>";
            html += "</tr>";
        }
    }
    html += "</table>";

    html += "<p><strong>المبلغ الإجمالي قبل الخصم:</strong> " + addCommas(total) + " ل.س</p>";

    // خصم 10% إذا زادت المدة عن 7 أيام
    if (days > 7) {
        discount = Math.round(total * 10 / 100);
        html += "<p class=\"discount\">الخصم المطبق (10% لتجاوز مدة التأجير 7 أيام): -" + addCommas(discount) + " ل.س</p>";
    }

    finalTotal = total - discount;
    html += "<p class=\"final-total\">المبلغ الإجمالي النهائي: " + addCommas(finalTotal) + " ل.س</p>";

    document.getElementById("resultBody").innerHTML = html;
    $("#resultSection").slideDown("slow");

    return false;
}

$(document).ready(function () {
    $(".details-row").hide();
    $("#reservationSection").hide();
    $("#resultSection").hide();

    $(".details-toggle").click(function () {
        var detailsId = $(this).val();
        if (this.checked) {
            $("#" + detailsId).show();
        } else {
            $("#" + detailsId).hide();
        }
    });

    $("#continueBtn").click(function () {
        if (countCars() == 0) {
            alert("يرجى اختيار سيارة واحدة على الأقل قبل المتابعة.");
            return;
        }
        $("#reservationSection").slideDown("slow");
    });

    $("#closeResultBtn").click(function () {
        $("#resultSection").slideUp("slow");
    });
});
