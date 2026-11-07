// myFunctions.js
// جميع توابع JavaScript و jQuery المستخدمة في موقع تأجير السيارات

// بيانات السيارات: الموديل والسعر اليومي لكل رمز سيارة
var carsData = {
    "CR-001": { model: "Toyota Corolla", price: 250000 },
    "CR-002": { model: "Kia Sportage", price: 400000 },
    "CR-003": { model: "Hyundai Elantra", price: 300000 },
    "CR-004": { model: "Chevrolet Spark", price: 180000 },
    "CR-005": { model: "Ford Explorer", price: 550000 }
};

// إزالة الفراغات من بداية النص ونهايته
function trimText(value) {
    return value.replace(/^\s+|\s+$/g, "");
}

// التحقق من أن النص يتكون من أرقام فقط
function isAllDigits(text) {
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

// التحقق من أن النص يتكون من أحرف عربية وفراغات فقط
function isArabicName(text) {
    if (text.length == 0) {
        return false;
    }
    return text.search(/^[\u0621-\u064A ]+$/) != -1;
}

// تحويل نص تاريخ بالصيغة yyyy-mm-dd إلى كائن Date، وإرجاع null عند الخطأ
function parseDateValue(text) {
    var yearPart;
    var monthPart;
    var dayPart;
    var yearValue;
    var monthValue;
    var dayValue;
    var dateObject;

    if (text.length != 10) {
        return null;
    }
    if (text.charAt(4) != "-" || text.charAt(7) != "-") {
        return null;
    }

    yearPart = text.substring(0, 4);
    monthPart = text.substring(5, 7);
    dayPart = text.substring(8, 10);

    if (!isAllDigits(yearPart) || !isAllDigits(monthPart) || !isAllDigits(dayPart)) {
        return null;
    }

    yearValue = parseInt(yearPart, 10);
    monthValue = parseInt(monthPart, 10);
    dayValue = parseInt(dayPart, 10);

    if (isNaN(yearValue) || isNaN(monthValue) || isNaN(dayValue)) {
        return null;
    }

    dateObject = new Date(yearValue, monthValue - 1, dayValue);

    if (dateObject.getFullYear() != yearValue) {
        return null;
    }
    if (dateObject.getMonth() != (monthValue - 1)) {
        return null;
    }
    if (dateObject.getDate() != dayValue) {
        return null;
    }

    return dateObject;
}

// تنسيق الرقم بإضافة الفواصل بين كل ثلاث خانات
function formatNumber(value) {
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

// حساب عدد السيارات المختارة
function countSelectedCars() {
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

// التحقق من صحة بيانات الحجز وحساب النتيجة
function validateAndCalculate() {
    var errors = "";
    var fullName;
    var nationalId;
    var startText;
    var endText;
    var mobile;
    var email;
    var startDate = null;
    var endDate = null;
    var nationalPrefix;
    var thirdDigit;
    var atPosition;
    var dotPosition;
    var spacePosition;
    var rentalDays;
    var totalAmount = 0;
    var discount = 0;
    var finalAmount = 0;
    var boxes;
    var carCode;
    var carInfo;
    var carTotal;
    var rowClass;
    var rowCount = 0;
    var html = "";
    var i;

    if (countSelectedCars() == 0) {
        alert("يرجى اختيار سيارة واحدة على الأقل قبل إتمام الحجز.");
        return false;
    }

    fullName = trimText(document.getElementById("fullName").value);
    nationalId = trimText(document.getElementById("nationalId").value);
    startText = trimText(document.getElementById("startDate").value);
    endText = trimText(document.getElementById("endDate").value);
    mobile = trimText(document.getElementById("mobile").value);
    email = trimText(document.getElementById("email").value);

    // 1. الاسم الكامل: اختياري، وإذا أُدخل يجب أن يكون أحرفاً عربية فقط
    if (fullName != "" && !isArabicName(fullName)) {
        errors += "- الاسم الكامل يجب أن يتكون من أحرف عربية فقط دون أرقام أو رموز.\n";
    }

    // 2. الرقم الوطني: إلزامي، 11 خانة، أول خانتين بين 01 و 14
    if (nationalId == "") {
        errors += "- الرقم الوطني حقل إلزامي.\n";
    } else if (nationalId.length != 11 || !isAllDigits(nationalId)) {
        errors += "- الرقم الوطني يجب أن يتكون من 11 خانة رقمية.\n";
    } else {
        nationalPrefix = parseInt(nationalId.substring(0, 2), 10);
        if (nationalPrefix < 1 || nationalPrefix > 14) {
            errors += "- أول خانتين من الرقم الوطني يجب أن ترمزا إلى محافظة بين 01 و 14.\n";
        }
    }

    // 3. تاريخ البداية: إلزامي
    if (startText == "") {
        errors += "- تاريخ بداية التأجير حقل إلزامي.\n";
    } else {
        startDate = parseDateValue(startText);
        if (startDate == null) {
            errors += "- تاريخ البداية يجب أن يكون بالصيغة yyyy-mm-dd وتاريخاً صحيحاً.\n";
        }
    }

    // 4. تاريخ النهاية: إلزامي ويجب أن يكون لاحقاً لتاريخ البداية
    if (endText == "") {
        errors += "- تاريخ نهاية التأجير حقل إلزامي.\n";
    } else {
        endDate = parseDateValue(endText);
        if (endDate == null) {
            errors += "- تاريخ النهاية يجب أن يكون بالصيغة yyyy-mm-dd وتاريخاً صحيحاً.\n";
        }
    }

    if (startDate != null && endDate != null) {
        if (endDate.getTime() <= startDate.getTime()) {
            errors += "- تاريخ النهاية يجب أن يكون لاحقاً لتاريخ البداية.\n";
        }
    }

    // 5. رقم الموبايل: اختياري، يبدأ بـ 09 ويطابق شبكتي سيريتل وإم تي إن
    if (mobile != "") {
        if (mobile.length != 10 || !isAllDigits(mobile)) {
            errors += "- رقم الموبايل يجب أن يتكون من 10 أرقام ويبدأ بـ 09.\n";
        } else if (mobile.substring(0, 2) != "09") {
            errors += "- رقم الموبايل يجب أن يبدأ بـ 09.\n";
        } else {
            thirdDigit = mobile.charAt(2);
            if (thirdDigit < "3" || thirdDigit > "9") {
                errors += "- رقم الموبايل يجب أن يطابق شبكتي سيريتل أو إم تي إن (093 - 099).\n";
            }
        }
    }

    // 6. البريد الإلكتروني: اختياري، ويجب أن يحوي @ ونقطة بعدها
    if (email != "") {
        atPosition = email.indexOf("@");
        dotPosition = email.indexOf(".", atPosition + 1);
        spacePosition = email.indexOf(" ");
        if (atPosition < 1) {
            errors += "- البريد الإلكتروني غير صحيح.\n";
        } else if (dotPosition < atPosition + 2) {
            errors += "- البريد الإلكتروني غير صحيح.\n";
        } else if (dotPosition == email.length - 1) {
            errors += "- البريد الإلكتروني غير صحيح.\n";
        } else if (spacePosition != -1) {
            errors += "- البريد الإلكتروني غير صحيح.\n";
        }
    }

    if (errors != "") {
        alert("يرجى تصحيح الأخطاء التالية:\n" + errors);
        return false;
    }

    // حساب عدد أيام التأجير
    rentalDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    if (rentalDays < 1) {
        rentalDays = 1;
    }

    // بناء نص النتيجة
    html += "<p><strong>اسم العميل:</strong> ";
    if (fullName == "") {
        html += "غير مسجل";
    } else {
        html += fullName;
    }
    html += "</p>";
    html += "<p><strong>الرقم الوطني:</strong> " + nationalId + "</p>";
    html += "<p><strong>مدة التأجير:</strong> " + rentalDays + " يوم</p>";

    html += "<table cellspacing=\"0\" cellpadding=\"8\">";
    html += "<tr><th>الرمز</th><th>الموديل</th><th>السعر اليومي</th><th>عدد الأيام</th><th>المجموع الفرعي</th></tr>";

    boxes = document.getElementsByName("selected_cars");
    for (i = 0; i < boxes.length; i++) {
        if (boxes[i].checked) {
            carCode = boxes[i].value;
            carInfo = carsData[carCode];
            carTotal = carInfo.price * rentalDays;
            totalAmount = totalAmount + carTotal;

            rowClass = "car-row";
            if (rowCount % 2 == 1) {
                rowClass = "car-row row-alt";
            }
            rowCount++;

            html += "<tr class=\"" + rowClass + "\">";
            html += "<td>" + carCode + "</td>";
            html += "<td>" + carInfo.model + "</td>";
            html += "<td>" + formatNumber(carInfo.price) + " ل.س</td>";
            html += "<td>" + rentalDays + "</td>";
            html += "<td>" + formatNumber(carTotal) + " ل.س</td>";
            html += "</tr>";
        }
    }
    html += "</table>";

    html += "<p><strong>المبلغ الإجمالي قبل الخصم:</strong> " + formatNumber(totalAmount) + " ل.س</p>";

    if (rentalDays > 7) {
        discount = Math.round(totalAmount * 10 / 100);
        html += "<p class=\"discount\">الخصم المطبق (10% لتجاوز مدة التأجير 7 أيام): -" + formatNumber(discount) + " ل.س</p>";
    }

    finalAmount = totalAmount - discount;
    html += "<p class=\"final-total\">المبلغ الإجمالي النهائي: " + formatNumber(finalAmount) + " ل.س</p>";

    document.getElementById("resultBody").innerHTML = html;
    $("#resultSection").slideDown("slow");

    return false;
}

// تنفيذ الأحداث بعد تحميل عناصر الصفحة
$(document).ready(function () {
    // إخفاء صفوف التفاصيل وقسمي الحجز والنتيجة عند تحميل الصفحة
    $(".details-row").hide();
    $("#reservationSection").hide();
    $("#resultSection").hide();

    // إظهار وإخفاء تفاصيل السيارة عند النقر على مربع "إظهار التفاصيل"
    $(".details-toggle").click(function () {
        var detailsId = $(this).val();
        if (this.checked) {
            $("#" + detailsId).show();
        } else {
            $("#" + detailsId).hide();
        }
    });

    // إظهار نموذج الحجز عند النقر على زر "متابعة"
    $("#continueBtn").click(function () {
        if (countSelectedCars() == 0) {
            alert("يرجى اختيار سيارة واحدة على الأقل قبل المتابعة.");
            return;
        }
        $("#reservationSection").slideDown("slow");
    });

    // إخفاء قسم النتيجة عند النقر على زر "إغلاق النتيجة"
    $("#closeResultBtn").click(function () {
        $("#resultSection").slideUp("slow");
    });
});
