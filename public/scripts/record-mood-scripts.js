  // Attach an input event listener to update the value label dynamically for each emotion
  const enjoymentLevelInput = document.getElementById('enjoymentLevel');
  const enjoymentIntensityLabel = document.getElementById('enjoymentIntensityLabel');

  enjoymentLevelInput.addEventListener('input', function () {
      const value = enjoymentLevelInput.value;
      enjoymentIntensityLabel.textContent = `Emotion level: ${value}`;
  });

  const sadnessLevelInput = document.getElementById('sadnessLevel');
  const sadnessIntensityLabel = document.getElementById('sadnessIntensityLabel');

  sadnessLevelInput.addEventListener('input', function () {
      const value = sadnessLevelInput.value;
      sadnessIntensityLabel.textContent = `Emotion level: ${value}`;
  });

  const angerLevelInput = document.getElementById('angerLevel');
  const angerIntensityLabel= document.getElementById('angerIntensityLabel');

  angerLevelInput.addEventListener('input', function () {
      const value = angerLevelInput.value;
      angerIntensityLabel.textContent = `Emotion level: ${value}`;
  });

  const contemptLevelInput = document.getElementById('contemptLevel');
  const contemptIntensityLabel= document.getElementById('contemptIntensityLabel');

  contemptLevelInput.addEventListener('input', function () {
      const value = contemptLevelInput.value;
      contemptIntensityLabel.textContent = `Emotion level: ${value}`;
  });

  const disgustLevelInput = document.getElementById('disgustLevel');
  const disgustIntensityLabel= document.getElementById('disgustIntensityLabel');

  disgustLevelInput.addEventListener('input', function () {
      const value = disgustLevelInput.value;
      disgustIntensityLabel.textContent = `Emotion level: ${value}`;
  });

  const fearLevelInput = document.getElementById('fearLevel');
  const fearIntensityLabel= document.getElementById('fearIntensityLabel');

  fearLevelInput.addEventListener('input', function () {
      const value = fearLevelInput.value;
      fearIntensityLabel.textContent = `Emotion level: ${value}`;
  });

  const surpriseLevelInput = document.getElementById('surpriseLevel');
  const surpriseIntensityLabel= document.getElementById('surpriseIntensityLabel');

  surpriseLevelInput.addEventListener('input', function () {
      const value = surpriseLevelInput.value;
      surpriseIntensityLabel.textContent = `Emotion level: ${value}`;
  });

  const emotionLevelInput = document.getElementById('emotionLevel');
    const intensityLabel = document.getElementById('intensityLabel');

    //emotionLevelInput.addEventListener('input', updateLabel);

    function updateLabel() {
        const value = emotionLevelInput.value;
        intensityLabel.textContent = `Emotion level: ${value}`;
    }

    $(document).ready(function() {
        // Fetch predefined contextual triggers from the server and populate the dropdown
        fetch('/getcontextualtriggers') // Adjust the API endpoint accordingly
            .then(response => response.json())
            .then(data => {
                const dropdown = $('#contextualTriggerDropdown');
                data.forEach(trigger => {
                    dropdown.append($('<option>', { value: trigger, text: trigger }));
                });

                // Initialize Bootstrap Multi-Select
                dropdown.multiselect({
                    buttonContainer: '<div class="btn-group" />',
                    buttonText: function (options) {
                        if (options.length === 0) {
                            return 'None selected';
                        }
                        return options.length + ' selected';
                    },
                    buttonWidth: '400px',

                });

                // Add an event listener to the dropdown to handle selection changes
                dropdown.change(addSelectedTriggers);
            })
            .catch(error => console.error('Error fetching contextual triggers:', error));
    });