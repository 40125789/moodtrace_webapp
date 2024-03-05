let validData; // Declare validData in a higher scope
let myChart; // Declare myChart variable globally

document.addEventListener('DOMContentLoaded', async function () {
    try {
        const response = await fetch('/getemotionalvalues');
        const data = await response.json();

        // Log the response to inspect its structure
        console.log('Response from API:', data);

        // Check if response data is an array and not empty
        if (Array.isArray(data) && data.length > 0) {
            // Process the data and render the chart
            validData = processDataAndRenderChart(data); // Assign validData
        } else {
            // Handle case where response data is not an array or empty
            console.error("Invalid response format or no data available.");
            document.getElementById('no-data-message').style.display = 'block'; // Show the message
        }
        
    } catch (error) {
        console.error('Error fetching data:', error);
        // Display an error message to the user or take appropriate action
    }
});

function processDataAndRenderChart(data) {
    // Process the data here
    const processedData = data.map(entry => ({
        date_time: isValidDate(entry.date_time) ? new Date(entry.date_time) : null,
        ...entry,
    })).filter(entry => entry.date_time !== null);

    // Check if processedData has three or more elements
    if (processedData.length >= 3) {
        // Sort processedData array by date-time in ascending order
        processedData.sort((a, b) => a.date_time - b.date_time);

        // Extract emotions from the first entry
        const emotions = Object.keys(processedData[0]).filter(key => key !== 'date_time');
        const contextualTriggers = [];

        // Calculate the frequency of each contextual trigger
        processedData.forEach(entry => {
            if (entry.contextual_triggers) {
                entry.contextual_triggers.split(',').forEach(trigger => {
                    const trimmedTrigger = trigger.trim();
                    if (trimmedTrigger.length > 0) {
                        contextualTriggers.push(trimmedTrigger.toLowerCase());
                    }
                });
            }
        });

        // Count the occurrences of each trigger
        const triggerCounts = {};
        contextualTriggers.forEach(trigger => {
            triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
        });

        // Sort triggers by frequency
        const sortedTriggers = Object.keys(triggerCounts).sort((a, b) => triggerCounts[b] - triggerCounts[a]);

        // Identify the most common triggers 
        const mostCommonTriggers = sortedTriggers.slice(0, 5); // Display the top 5 triggers

        // Define predefined colors for each emotion
        const emotionColors = {
            anger: '#FF5733',      // Red
            contempt: '#6A5ACD',   // Slate Blue
            disgust: '#8FBC8F',    // Dark Sea Green
            enjoyment: '#FFD700',  // Gold
            fear: '#4B0082',       // Indigo
            sadness: '#87CEEB',    // Sky Blue
            surprise: '#00FFFF',   // Cyan
        };

        const emotionsWithoutTriggers = emotions.filter(emotion => emotion !== 'contextual_triggers');

        // Create datasets
        const datasets = emotionsWithoutTriggers.map(emotion => {
            const dataPoints = [];
            processedData.forEach(entry => {
                dataPoints.push({
                    x: entry.date_time,
                    y: entry[emotion]
                });
            });
            return {
                label: emotion,
                borderColor: emotionColors[emotion],
                borderWidth: 2,
                pointRadius: 4,
                fill: false,
                tension: 0.1,
                data: dataPoints
            };
        });

        // Find the minimum date in the dataset
        const minDate = processedData.reduce((min, entry) => !min || entry.date_time < min ? entry.date_time : min, null);

        // Create chart
        const ctx = document.getElementById('statistics-chart').getContext('2d');
        myChart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: datasets,
            },
            options: {
                animation: {
                    duration: 1000, // Animation duration in milliseconds
                    easing: 'easeInOutQuart', // Easing function for the animation
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'minute',
                            displayFormats: {
                                minute: 'DDD, HH:mm' // Format for the x-axis labels
                            },
                            tooltipFormat: 'DDD, HH:mm' // Format for the tooltip
                        },
                        title: {
                            display: true,
                            text: 'Date & Time',
                        },
                        min: processedData[0].date_time, // Set the minimum date
                        max: processedData[processedData.length - 1].date_time, // Set the maximum date
                        ticks: {
                            source: 'data' // Show only relevant dates
                        }
                    },
                    y: {
                        type: 'linear',
                        beginAtZero: true,
                        max: 10,
                        stepSize: 1,
                        title: {
                            display: true,
                            text: 'Emotional Level',
                        },
                    },
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const { datasetIndex, parsed } = context;

                                if (parsed && parsed.y !== undefined) {
                                    return `${emotions[datasetIndex]}: ${parsed.y}`;
                                }

                                return 'Invalid Data';
                            },
                            afterLabel: (context) => {
                                return `Contextual Triggers: ${processedData[context.dataIndex].contextual_triggers || 'None'}`;
                            },
                        },
                    },
                    legend: {
                        labels: {
                            boxWidth: 20,
                            fontColor: 'black',
                        },
                    },
                    elements: {
                        point: {
                            pointStyle: 'circle',
                            backgroundColor: 'white',
                            borderColor: 'black',
                            borderWidth: 1,
                            radius: 3,
                        },
                    },
                },
            },
        });

        // Display statistics and update chart rendering
        displayStatistics(processedData, mostCommonTriggers);

        return processedData; // Return processedData
    } else {
        // Hide the chart container and display the "no data available" message
        document.getElementById('statistics-chart').style.display = 'none';
        document.getElementById('no-data-message').style.display = 'block';
        return []; // Return an empty array
    }
}

function filterByDate() {
    const dateFromInput = document.getElementById('dateFrom').value;
    const dateToInput = document.getElementById('dateTo').value;

    const dateFrom = new Date(dateFromInput);
    const dateTo = new Date(dateToInput);

    const filteredData = validData.filter(entry => {
        const entryDateTime = new Date(entry.date_time);
        return entryDateTime >= dateFrom && entryDateTime <= dateTo;
    });

    if (filteredData.length >= 3) {
        updateChartAndTriggers(filteredData);
        document.getElementById('statistics-chart').style.display = 'block'; // Show the chart container
        document.getElementById('no-data-message').style.display = 'none'; // Hide the "no data available" message
    } else {
        document.getElementById('statistics-chart').style.display = 'none'; // Hide the chart container
        document.getElementById('no-data-message').style.display = 'block'; // Show the "no data available" message
        document.getElementById('common-triggers-container').style.display = 'none'; //Hide the contextual trigger container if no chart data
        clearStatisticsContainer(); // Clear statistics container
        clearCommonTriggersContainer(); // Clear common triggers container
    }
}

function clearStatisticsContainer() {
    const statisticsContainer = document.getElementById('statistics-container');
    statisticsContainer.innerHTML = ''; // Clear previous content
}

function clearCommonTriggersContainer() {
    const commonTriggersContainer = document.getElementById('common-triggers-container');
    commonTriggersContainer.innerHTML = ''; // Clear previous content
}


function updateChartAndTriggers(filteredData) {
    if (filteredData.length >= 3) {
        updateChart(filteredData);
        const mostCommonTriggers = findMostCommonTriggers(filteredData);
        displayCommonTriggers(mostCommonTriggers);
        document.getElementById('statistics-chart').style.display = 'block'; // Show the chart container
        document.getElementById('no-data-message').style.display = 'none'; // Hide the "no data available" message
        document.getElementById('common-triggers-container').style.display = 'block'; // Show the common triggers container
    } else {
        document.getElementById('statistics-chart').style.display = 'none'; // Hide the chart container
        document.getElementById('no-data-message').style.display = 'block'; // Show the "no data available" message
        document.getElementById('common-triggers-container').style.display = 'none'; // Hide the common triggers container
        clearCommonTriggers(); // Clear common triggers content
    }
}




function displayCommonTriggers(mostCommonTriggers) {
    const commonTriggersContainer = document.getElementById('common-triggers-container');
    commonTriggersContainer.innerHTML = ''; // Clear previous content

    if (mostCommonTriggers.length >= 3) {
        // Create a header for the top contextual triggers
        const header = document.createElement('h3');
        header.textContent = 'Top Contextual Triggers';
        commonTriggersContainer.appendChild(header);

        // Loop through each trigger and create containers if needed
        mostCommonTriggers.forEach(trigger => {
            // Create a container for each trigger
            const triggerContainer = document.createElement('div');
            triggerContainer.classList.add('trigger-container'); // Add a class for styling if needed

            // Set the content of the container
            triggerContainer.innerHTML = `
                <div class="panel-body">
                    <h5>${trigger}</h5>
                </div>
            `;

            // Append the container to the commonTriggersContainer
            commonTriggersContainer.appendChild(triggerContainer);
        });

        // Display the container since there is information to display
        commonTriggersContainer.style.display = 'block';
    } else {
        // Clear any previous content and display a message when there are no triggers to show
        commonTriggersContainer.innerHTML = '';
        commonTriggersContainer.style.display = 'none'; // Hide the container
    }
}

// Other functions remain unchanged...


function clearCommonTriggers() {
    const commonTriggersContainer = document.getElementById('common-triggers-container');
    commonTriggersContainer.innerHTML = ''; // Clear previous content
    commonTriggersContainer.style.display = 'none'; // Hide the container
}


function updateChart(filteredData) {
    // Update the chart only if it's initialized
    if (myChart) {
        // Update min and max values for the x-axis scale
        const minDate = filteredData[0].date_time;
        const maxDate = filteredData[filteredData.length - 1].date_time;
        myChart.options.scales.x.min = minDate;
        myChart.options.scales.x.max = maxDate;

        myChart.data.datasets.forEach((dataset, index) => {
            const emotion = dataset.label;
            const dataPoints = [];

            filteredData.forEach(entry => {
                dataPoints.push({
                    x: entry.date_time,
                    y: entry[emotion]
                });
            });

            myChart.data.datasets[index].data = dataPoints;
        });

        // Update tooltip after label callback
        myChart.options.plugins.tooltip.callbacks.afterLabel = (context) => {
            return `Contextual Triggers: ${filteredData[context.dataIndex].contextual_triggers || 'None'}`;
        };

        myChart.update();
        // Update statistics container
        updateStatisticsContainer(filteredData);

    } else {
        console.error('Chart instance not found.');
    }
}


function updateStatisticsContainer(filteredData) {
    const emotions = Object.keys(filteredData[0]).filter(key => key !== 'date_time' && key !== 'contextual_triggers');
    const statisticsContainer = document.getElementById('statistics-container');
    statisticsContainer.innerHTML = ''; // Clear previous content

    emotions.forEach(emotion => {
        const emotionData = filteredData.map(entry => entry[emotion]);
        const mean = calculateMean(emotionData);
        const trend = analyzeTrend(emotionData);
        const emotionColor = getEmotionColor(emotion); // Get color based on emotion

        // Create HTML elements to display statistics
        const statisticColumn = document.createElement('div');
        statisticColumn.classList.add('col-md-4');
        statisticColumn.innerHTML = `
            <div class="statistic-item" style="background-color: ${emotionColor};">
                <span class="emotion-emoji ${getEmotionEmojiClass(emotion)}"></span>
                <h4 style="color: white;">${emotion}</h4>
                <p style="color: white;">Trend: ${trend}</p> <!-- Update trend here -->
            </div>
        `;
        statisticsContainer.appendChild(statisticColumn);
    });
}

function findMostCommonTriggers(filteredData) {
    const contextualTriggers = [];

    // Iterate over the filtered data and extract contextual triggers
    filteredData.forEach(entry => {
        if (entry.contextual_triggers) {
            entry.contextual_triggers.split(',').forEach(trigger => {
                const trimmedTrigger = trigger.trim();
                if (trimmedTrigger.length > 0) {
                    contextualTriggers.push(trimmedTrigger.toLowerCase());
                }
            });
        }
    });

    // Count the occurrences of each trigger
    const triggerCounts = {};
    contextualTriggers.forEach(trigger => {
        triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
    });

    // Sort triggers by frequency
    const sortedTriggers = Object.keys(triggerCounts).sort((a, b) => triggerCounts[b] - triggerCounts[a]);

    // Identify the most common triggers 
    const mostCommonTriggers = sortedTriggers.slice(0, 5); // Display the top 5 triggers

    return mostCommonTriggers;
}
const mostCommonTriggers = findMostCommonTriggers(filteredData);

function displayStatistics(data, mostCommonTriggers) {
    const emotions = Object.keys(data[0]).filter(key => key !== 'date_time' && key !== 'contextual_triggers');
    const statisticsContainer = document.getElementById('statistics-container');

    emotions.forEach(emotion => {
        const emotionData = data.map(entry => entry[emotion]);
        const mean = calculateMean(emotionData);
        const trend = analyzeTrend(emotionData);
        const emotionColor = getEmotionColor(emotion); // Get color based on emotion

        // Create HTML elements to display statistics
        const statisticColumn = document.createElement('div');
        statisticColumn.classList.add('col-md-4');
        statisticColumn.innerHTML = `
            <div class="statistic-item" style="background-color: ${emotionColor};">
                <span class="emotion-emoji ${getEmotionEmojiClass(emotion)}"></span>
                <h4 style="color: white;">${emotion}</h4>
                <p style="color: white;">Trend: ${trend}</p>
            </div>
        `;
        statisticsContainer.appendChild(statisticColumn);
    });

    const commonTriggersContainer = document.getElementById('common-triggers-container');

   
    // Check if there are triggers to display
if (mostCommonTriggers.length >= 3) {
    // Create a header for the top contextual triggers
    const header = document.createElement('h3');
    header.textContent = 'Top Contextual Triggers';
    commonTriggersContainer.appendChild(header);

    // Loop through each trigger and create containers if needed
    mostCommonTriggers.forEach(trigger => {
        // Create a container for each trigger
        const triggerContainer = document.createElement('div');
        triggerContainer.classList.add('trigger-container'); // Add a class for styling if needed

        // Set the content of the container
        triggerContainer.innerHTML = `
            <div class="panel-body">
                <h5>${trigger}</h5>
            </div>
        `;

        // Append the container to the commonTriggersContainer
        commonTriggersContainer.appendChild(triggerContainer);
    });

    // Display the container since there is information to display
    commonTriggersContainer.style.display = 'block';
} else {
    // Hide the container and clear any previous content
    commonTriggersContainer.innerHTML = ''; // Clear previous content
    commonTriggersContainer.style.display = 'none'; // Hide the container
}
}

// Function to get emotion color
function getEmotionColor(emotion) {
    const emotionColors = {
        anger: '#FF5733',      // Red
        contempt: '#6A5ACD',   // Slate Blue
        disgust: '#8FBC8F',    // Dark Sea Green
        enjoyment: '#FFD700',  // Gold
        fear: '#4B0082',       // Indigo
        sadness: '#87CEEB',    // Sky Blue
        surprise: '#00FFFF',   // Cyan
    };
    return emotionColors[emotion];
}

// Function to calculate mean
function calculateMean(data) {
    const sum = data.reduce((acc, val) => acc + val, 0);
    return sum / data.length;
}

// Function to analyze trend
function analyzeTrend(data) {
    // Calculate the difference between each adjacent data point
    const differences = [];
    for (let i = 1; i < data.length; i++) {
        differences.push(data[i] - data[i - 1]);
    }

    // Calculate the overall trend based on the average difference
    const averageDifference = differences.reduce((acc, val) => acc + val, 0) / differences.length;

    if (averageDifference > 0) {
        return 'Increasing';
    } else if (averageDifference < 0) {
        return 'Decreasing';
    } else {
        return 'Stable';
    }
}

// Function to check if a date string is valid
function isValidDate(dateString) {
    return !!Date.parse(dateString);
}

// Function to get emotion emoji class
function getEmotionEmojiClass(emotion) {
    switch (emotion) {
        case 'anger':
            return 'emotion-emoji far fa-angry';
        case 'contempt':
            return 'emotion-emoji far fa-tired';
        case 'disgust':
            return 'emotion-emoji far fa-dizzy';
        case 'enjoyment':
            return 'emotion-emoji far fa-laugh-squint';
        case 'fear':
            return 'emotion-emoji far fa-flushed';
        case 'sadness':
            return 'emotion-emoji far fa-sad-tear';
        case 'surprise':
            return 'emotion-emoji far fa-surprise';
        default:
            return '';
    }
}