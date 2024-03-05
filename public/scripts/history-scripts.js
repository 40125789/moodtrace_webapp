function selectRow(row) {
    // Get the contextual trigger value from the selected row
    const contextualTrigger = row.getAttribute('data-contextual-trigger');
    const moodId = row.getAttribute('data-mood-id'); // Assuming you have a 'data-mood-id' attribute on the row

    // Redirect to the edit and delete page with both trigger and moodId
    window.location.href = `/views/editdeletetrigger?trigger=${encodeURIComponent(contextualTrigger)}&moodId=${encodeURIComponent(moodId)}`;
}

function highlightRow(row) {
    row.style.backgroundColor = "#0dadde"; // Adjust the color to match the hover effect
}

function unhighlightRow(row) {
    row.style.backgroundColor = ""; // Reset the background color
}

function filterByDate() {
    // Get selected dates
    var dateFrom = document.getElementById("dateFrom").value;
    var dateTo = document.getElementById("dateTo").value;

    // Check if either date is empty
    if (dateFrom === "" || dateTo === "") {
        alert("Please select both a start and end date.");
        return; // Exit the function early
    }

    // Convert selected dates to Date objects
    var fromDate = new Date(dateFrom);
    var toDate = new Date(dateTo);

    // Iterate over table rows and hide/show based on date range
    var tableRows = document.querySelectorAll(".mood-log-row");
    for (var i = 0; i < tableRows.length; i++) {
        var dateString = tableRows[i].querySelector("td:first-child").innerText;
        var parts = dateString.split(" ");
        var datePart = parts[0];
        var timePart = parts[1];
        var [day, month, year] = datePart.split("/");
        var [hour, minute, second] = timePart.split(":");
        var rowDate = new Date(year, month - 1, day, hour, minute, second);

        if (rowDate >= fromDate && rowDate <= toDate) {
            tableRows[i].style.display = ""; // Show row
        } else {
            tableRows[i].style.display = "none"; // Hide row
        }
    }
}



