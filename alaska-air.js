// ==UserScript==
// @name           Auto Check-In to Alaska Air
// @namespace      https://m.alaskaair.com/checkin
// @match          https://m.alaskaair.com/checkin*
// @include        https://m.alaskaair.com/checkin*
// @description    Automatically check in to Southwest Airline flights at the appropriate time.
// @version 1.0
// ==/UserScript==

/////////////  CHECK IN PAGE  ////////////////

var globalSubmitDate;
var allDone = false;

/**
 * @brief Submit the check in form on the Southwest Check In Online page.
 */
function submitNow()
{
    try{
        var submitButton = document.querySelector("input.button.last");
        submitButton.click();
    }
    catch(e){
        alert('Submit Error: An error has occurred: '+ e.message);
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
        if (days !== 0) {
            area.innerHTML += days + "d ";
        }
        //If 0 hours remain, omit them.
        if (hours !== 0) {
            area.innerHTML += hours + "h ";
        }
        //Add padding to minute
        if (minutes !==0 ) {
            area.innerHTML += minutes + "m ";
        }
        //Add padding to second
        //if (seconds < 10)
        //area.innerHTML += "0";
        area.innerHTML += seconds;
        area.innerHTML += "s</strong>";
    }
    catch(e){
        // has the page changed?
        if(/start/.test(document.location.href))
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
        var confNumber = document.getElementById("ReservationLookup").value;
        var departureCity = document.getElementById("checkin-geo-from").value;

        var month = document.getElementById("month-input").value;
        var day = document.getElementById("day-input").value;
        var year = document.getElementById("year-input").value;

        var hour = document.getElementById("hour-input").value;
        var minute = document.getElementById("minute-input").value;
        var second = document.getElementById("second-input").value;

        if(confNumber === "" || departureCity === "" ){
            alert("Must fill out Confirmation Number and Departure City.");
        }
        else if(month === "" || month === "mm" || day === "" || day == "dd" || year === "" || year == "yyyy" ||
                hour === "" || hour == "hh" || minute === "" || minute == "mm" || second === "" ){
            alert("Must fill out Date and Time.");
        }
        else if(year.length < 4 ){
            alert("Year must be 4 characters.");
        } else {
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
            if(msRemaining < 0) {
                alert("Date/Time must be in the future.");
            } else if(msRemaining > maxDays * 1000 * 60 * 60 * 24) {
                alert("Date/Time cannot be more than " + maxDays + " days in the future." + msRemaining);
            } else {
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
        var leftPanel = document.querySelector("div.shaded");

        //All of our stuff will go in this div.

        var delayDiv = document.createElement("div");
        delayDiv.setAttribute('id','checkInDelay');
        var dateSelect = document.createElement("span");
        dateSelect.setAttribute('id','date-select');

        //The big label at the top of the menu

        var mainLabel = document.createElement("h3");
        mainLabel.setAttribute('class','swa_feature_checkInOnline_form_header');
        mainLabel.innerHTML = "Set Check In Date and Time<br/><br/>";
        dateSelect.innerHTML += "<hr/>";
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
        if(document.title == "Error") {
            return;
        }

        // Check all the check boxes.
        var node_list = document.getElementsByTagName('input');
        for (var i = 0; i < node_list.length; i++) {
            var node = node_list[i];
            if (node.getAttribute('type') == 'checkbox') {
                node.checked = true;
            }
        }

        //Click the checkin all
        var button = document.querySelector("input.button");
        button.click();
    }
    catch(e){
        console.log('autoPassengerPage: An error has occurred: '+ e.message);
    }

}


//case of the select boarding pass page (regex match the url)
if(/start/.test(document.location.href))
{
    autoPassengerPage();
}
else if(/checkin/.test(document.location.href))
{
    checkInPageFormEdit();
}

