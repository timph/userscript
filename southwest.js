// ==UserScript==
// @name           Auto Check-In to Southwest Flights
// @namespace      http://www.ryanizzo.com/southwest-auto-check-in/
// @version        1.7
// @author         Nicholas Buroojy (http://userscripts.org/users/83813)
// @contributor    Ryan Izzo (http://www.ryanizzo.com)
// @contributor    JR Hehnly (http://www.okstorms.com @stormchasing)
// @contributor    Trevor McClellan (github.com/trevormcclellan)
// @description    Automatically check in to Southwest Airline flights at the appropriate time.
// @include         https://www.southwest.com/air/check-in/index.html*
// @include        https://www.southwest.com/flight/selectCheckinDocDelivery.html*
// @include        https://www.southwest.com/air/check-in/confirmation.html*
// @copyright      2009+, Nicholas Buroojy (http://userscripts.org/users/83813)
// @license        GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @grant          GM_getValue
// @grant          GM_setValue
// ==/UserScript==

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.
/////////////  CHECK IN PAGE  ////////////////

var globalSubmitDate;
var allDone = false;

/**
 * @brief Submit the check in form on the Southwest Check In Online page.
 */
function submitNow()
{
    try{
        var submitButton = document.getElementById("form-mixin--submit-button");
        submitButton.click();
    }
    catch(e){
        alert('globalSubmitDate: An error has occurred: '+ e.message);
    }
}


/**
 * @brief Display the countdown.
 *
 * TODO: Some formatting is wrong eg ("1:0:12" means 1 hour and 12 seconds remain). Make sure everything is represented with 2 digits.
 */
function displayCountdown()
{
    try{
        var area = document.getElementById("countdown");
        var timeRemain = globalSubmitDate - new Date();
        var days = Math.floor(timeRemain / (1000 * 60 * 60 * 24));
        var hours = Math.floor(timeRemain / (1000 * 60 * 60)) % 24;
        var minutes = Math.floor(timeRemain / (1000 * 60)) % 60;
        //round to the nearest second
        var seconds = Math.round(timeRemain / 1000) % 60;
        //Don't print negative time.
        if (hours < 0 || minutes < 0 || seconds < 0)
        {
            area.innerHTML = "Checking In...";
            return;
        }
        area.innerHTML = "Time Remaining: <strong>";
        //If 0 days remain, omit them.
        if (days !== 0)
            area.innerHTML += days + "d ";
        //If 0 hours remain, omit them.
        if (hours !== 0)
            area.innerHTML += hours + "h ";
        //Add padding to minute
        if (minutes !==0 )
        //area.innerHTML += "0";
            area.innerHTML += minutes + "m ";
        //Add padding to second
        //if (seconds < 10)
        //area.innerHTML += "0";
        area.innerHTML += seconds;
        area.innerHTML += "s</strong>";
    }
    catch(e){
        // has the page changed?
        if(/review/.test(document.location.href))
        {
            autoPassengerPage();
            return;
        }
        else if(/confirmation/.test(document.location.href))
        {
            if (allDone === false)
            {
                // autoTextBoardingDocs();
            }
            return;
        }
        console.log('displayCountdown: An error has occurred: ' +e.message);
    }
}


/**
 * @brief Updates the countdown every second.
 */
function displayCountdownWrapper()
{
    try{
        window.setInterval(displayCountdown, 1000);
    }
    catch(e){
        console.log('displayCountdownWrapper:" An error has occurred: ' +e.message);
    }
}


/**
 * @brief Begins the delay at the next even second.
 */
function beginDelay()
{
    try{
        var confNumber = document.getElementById("confirmationNumber").value;
        var firstName = document.getElementById("passengerFirstName").value;
        var lastName = document.getElementById("passengerLastName").value;

        var month = document.getElementById("month-input").value;
        var day = document.getElementById("day-input").value;
        var year = document.getElementById("year-input").value;

        var hour = document.getElementById("hour-input").value;
        var minute = document.getElementById("minute-input").value;
        var second = document.getElementById("second-input").value;

//        var phoneArea = document.getElementById("phoneArea").value;
//        var phonePrefix = document.getElementById("phonePrefix").value;
//        var phoneNumber = document.getElementById("phoneNumber").value;

        if(confNumber === "" || firstName === "" || lastName === "" ){
            alert("Must fill out Confirmation Number and Name.");
        }
        else if(month === "" || month === "mm" || day === "" || day == "dd" || year === "" || year == "yyyy" || 
                hour === "" || hour == "hh" || minute === "" || minute == "mm" || second === "" ){
            alert("Must fill out Date and Time.");
        }
        else if(year.length < 4 ){
            alert("Year must be 4 characters.");
        }
//        else if (phoneArea.search(/\d\d\d/g) == -1 || phonePrefix.search(/\d\d\d/g) == -1 || phoneNumber.search(/\d\d\d\d/g) == -1) {
//            alert("Invalid phone number provided.");
//        }
        else{
//            //save the text number for later
//            GM_setValue("phoneArea", phoneArea);
//            GM_setValue("phonePrefix", phonePrefix);
//            GM_setValue("phoneNumber", phoneNumber);

            //Build a date
            var submitDate = new Date();
            //submitDate.setMonth(month - 1);
            //submitDate.setDate(day);
            submitDate.setFullYear(year, month - 1, day);
            submitDate.setHours(hour);
            submitDate.setMinutes(minute);
            submitDate.setSeconds(second);
            submitDate.setMilliseconds(0);

            var now = new Date();
            var msRemaining = submitDate - now;

            var maxDays = 14;
            if(msRemaining < 0)
                alert("Date/Time must be in the future.");
            else if(msRemaining > maxDays * 1000 * 60 * 60 * 24)
                alert("Date/Time cannot be more than " + maxDays + " days in the future." + msRemaining);
            else{
                //Install the timeout to submit the form.
                window.setTimeout(submitNow, msRemaining);

                globalSubmitDate = submitDate;

                //Install a short term timeout to call the countdown wrapper at the beginning of the next second.
                window.setTimeout(displayCountdownWrapper, msRemaining % 1000);
            }
        }
    }
    catch(e){
        console.log('beginDelay: An error has occurred: '+ e.message);
    }
}

/**
 * @brief Edits the check in page; Adds Date, time, and Auto Check In button
 *
 * TODO Error handling. (Auto notify the developer when southwest page changes)
 */
function checkInPageFormEdit()
{
    try{
        var leftPanel = document.getElementsByClassName("air-reservation-confirmation-number-search-form")[0];

        //All of our stuff will go in this div.

        var delayDiv = document.createElement("div");
        delayDiv.setAttribute('id','checkInDelay');
        var dateSelect = document.createElement("span");
        dateSelect.setAttribute('id','date-select');

        //The big label at the top of the menu

        var mainLabel = document.createElement("h4");
        mainLabel.setAttribute('class','swa_feature_checkInOnline_form_header');
        mainLabel.innerHTML = "Set Check In Date and Time";
        dateSelect.innerHTML += "<br/>";
        dateSelect.appendChild(mainLabel);

        //The date portion.

        var today = new Date();


        var dateLabel = document.createElement("label");
        dateLabel.innerHTML = "<span class=\"required\">*</span> Date:";

        var monthInput = document.createElement("input");
        monthInput.setAttribute('id','month-input');
        monthInput.setAttribute('type','text');
        monthInput.setAttribute('maxlength','2');
        monthInput.setAttribute('size','2');
        monthInput.setAttribute('value',today.getMonth()+1);
        monthInput.setAttribute('onfocus','if(this.value==\'mm\') this.value=\'\';');
        monthInput.setAttribute('style','margin-left:7em');
        monthInput.setAttribute('tabindex','5');

        var dayInput = document.createElement("input");
        dayInput.setAttribute('id','day-input');
        dayInput.setAttribute('type','text');
        dayInput.setAttribute('maxlength','2');
        dayInput.setAttribute('size','2');
        dayInput.setAttribute('value',today.getDate());
        dayInput.setAttribute('onfocus','if(this.value==\'dd\') this.value=\'\';');
        dayInput.setAttribute('tabindex','6');

        var yearInput = document.createElement("input");
        yearInput.setAttribute('id','year-input');
        yearInput.setAttribute('type','text');
        yearInput.setAttribute('maxlength','4');
        yearInput.setAttribute('size','4');
        yearInput.setAttribute('value',today.getFullYear());
        yearInput.setAttribute('onfocus','if(this.value==\'yyyy\') this.value=\'\';');
        yearInput.setAttribute('tabindex','7');

        dateSelect.appendChild(dateLabel);
        dateSelect.appendChild(monthInput);
        dateSelect.innerHTML += "/";
        dateSelect.appendChild(dayInput);
        dateSelect.innerHTML += "/";
        dateSelect.appendChild(yearInput);

        // The time portion.

        var timeLabel = document.createElement("label");
        timeLabel.innerHTML = "<span class=\"required\">*</span> Time: (24-hour format) ";

        var hourInput = document.createElement("input");
        hourInput.setAttribute('id','hour-input');
        hourInput.setAttribute('type','text');
        hourInput.setAttribute('maxlength','2');
        //hourInput.setAttribute('style','margin-left:10px');
        hourInput.setAttribute('size','2');
        hourInput.setAttribute('value',today.getHours());
        hourInput.setAttribute('onfocus','if(this.value==\'hh\') this.value=\'\';');
        hourInput.setAttribute('tabindex','8');

        var minuteInput = document.createElement("input");
        minuteInput.setAttribute('id','minute-input');
        minuteInput.setAttribute('type','text');
        minuteInput.setAttribute('maxlength','2');
        minuteInput.setAttribute('size','2');
        minuteInput.setAttribute('value',today.getMinutes());
        minuteInput.setAttribute('onfocus','if(this.value==\'mm\') this.value=\'\';');
        minuteInput.setAttribute('tabindex','9');

        var secondInput = document.createElement("input");
        secondInput.setAttribute('id','second-input');
        secondInput.setAttribute('type','text');
        secondInput.setAttribute('maxlength','2');
        secondInput.setAttribute('size','2');
        secondInput.setAttribute('value','04');
        secondInput.setAttribute('tabindex','10');

        dateSelect.innerHTML += "<br/><br/>";

        dateSelect.appendChild(timeLabel);
        dateSelect.appendChild(hourInput);
        dateSelect.innerHTML += ":";
        dateSelect.appendChild(minuteInput);
        dateSelect.innerHTML += ":";
        dateSelect.appendChild(secondInput);

        delayDiv.appendChild(dateSelect);

        //auto-text boarding pass section
//        var autoTextArea = document.createElement("div");
//        var textLabel = document.createElement("label");
//        textLabel.innerHTML = "<span class=\"required\">*</span> Boarding pass text number: ";
//
//        var phoneArea = document.createElement("input");
//        phoneArea.setAttribute('id','phoneArea');
//        phoneArea.setAttribute('type','text');
//        phoneArea.setAttribute('maxlength','3');
//        phoneArea.setAttribute('size','3');
//        phoneArea.setAttribute('value', GM_getValue("phoneArea") !== undefined ? GM_getValue("phoneArea") : '');
//        phoneArea.setAttribute('tabindex','12');
//
//        var phonePrefix = document.createElement("input");
//        phonePrefix.setAttribute('id','phonePrefix');
//        phonePrefix.setAttribute('type','text');
//        phonePrefix.setAttribute('maxlength','3');
//        phonePrefix.setAttribute('size','3');
//        phonePrefix.setAttribute('value', GM_getValue("phonePrefix") !== undefined ? GM_getValue("phonePrefix") : '');
//        phonePrefix.setAttribute('tabindex','13');
//
//        var phoneNumber = document.createElement("input");
//        phoneNumber.setAttribute('id','phoneNumber');
//        phoneNumber.setAttribute('type','text');
//        phoneNumber.setAttribute('maxlength','4');
//        phoneNumber.setAttribute('size','4');
//        phoneNumber.setAttribute('value', GM_getValue("phoneNumber") !== undefined ? GM_getValue("phoneNumber") : '');
//        phoneNumber.setAttribute('tabindex','14');
//
//        autoTextArea.innerHTML += "<br/>";
//
//        autoTextArea.appendChild(textLabel);
//        autoTextArea.innerHTML += "(";
//        autoTextArea.appendChild(phoneArea);
//        autoTextArea.innerHTML += ")";
//        autoTextArea.appendChild(phonePrefix);
//        autoTextArea.innerHTML += "-";
//        autoTextArea.appendChild(phoneNumber);
//
//        delayDiv.appendChild(autoTextArea);
//
        delayDiv.innerHTML += "<br/><br />";

        // The area that displays how much time remains before the form is submitted.

        var countdownArea = document.createElement("div");
        countdownArea.setAttribute('id','countdown');
        countdownArea.innerHTML = "Click to start countdown";

        delayDiv.appendChild(countdownArea);

        // Auto Check In button

        var delayButton = document.createElement("input");
        delayButton.setAttribute('id','delay-button');
        delayButton.setAttribute('type','button');
        delayButton.setAttribute('style','float: right; background-color: #FFBF27; color: #111B40: font: bold 17px/1 Arial');
        delayButton.setAttribute('value','Auto Check In');
        delayButton.addEventListener("click", beginDelay, true);
        delayButton.setAttribute('tabindex','11');

        delayDiv.appendChild(delayButton);

        leftPanel.appendChild(delayDiv);
    }
    catch(e){
        console.log('checkInPageFormEdit: An error has occurred: ' +e.message);
    }
}

/////////////  SELECT PASSENGER PAGE  ////////////////

//automatically select all passengers and submit the form
function autoPassengerPage()
{
    try{
        //find error notification
        if(document.title == "Error")
            return;

        // Check all the check boxes.
        var node_list = document.getElementsByTagName('input');
        for (var i = 0; i < node_list.length; i++) {
            var node = node_list[i];
            if (node.getAttribute('type') == 'checkbox') {
                node.checked = true;
            }
        }

        //Click the print button
        var button = document.getElementsByClassName("actionable actionable_button actionable_large-button actionable_no-outline actionable_primary button submit-button air-check-in-review-results--check-in-button")[0];
        button.click();
    }
    catch(e){
        console.log('autoPassengerPage: An error has occurred: '+ e.message);
    }

}


//case of the select boarding pass page (regex match the url)
if(/review/.test(document.location.href))
{
    autoPassengerPage();
}
else if(/index/.test(document.location.href))
{
    checkInPageFormEdit();
}
