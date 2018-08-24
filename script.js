"use strict";

// ******** Create doughnut chart object ******** //
let chrt = document.getElementById("mycanvas").getContext("2d");
let doughnutChart = new Chart(chrt, {
  type: 'doughnut',
  data: {
    datasets: [{
      data: [],
      backgroundColor: []
    }],
    labels: []
  },

  options: {
    responsive: true,
    cutoutPercentage: 80,
    tooltips: {enabled: false},
    hover: {mode: null}
  }
});
// ******** Create doughnut chart object ******** //



// ******** Time trackers ******** //
let trackers = [];

function createTrackerObject(name, colour) {
  let playPauseButton = document.createElement("button");
  playPauseButton.innerHTML = `<i class="fas fa-play"></i>`
  playPauseButton.className = "playPause";

  let nameSpan = document.createElement("span");
  nameSpan.innerHTML = name;

  let currentTotalDurationSpan = document.createElement("span");
  currentTotalDurationSpan.innerHTML = "00:00:00";

  let editButton = document.createElement("button");
  editButton.innerHTML = `<i class="far fa-edit"></i>`
  editButton.className = "edit";

  let deleteButton = document.createElement("button");
  deleteButton.innerHTML = `<i class="far fa-trash-alt"></i>`
  deleteButton.className = "delete";

  let trackerObject = {
    id: Symbol(),
    name,
    colour,
    previousTotalDuration: 0,
    currentTotalDuration: 0,
    startTime: undefined,
    stopped: true,
    playPauseButton,
    nameSpan, 
    currentTotalDurationSpan,
    deleteButton,
    editButton
  };

  trackerObject.playPauseButton.addEventListener("click", playPauseButtonClick.bind(trackerObject));
  trackerObject.editButton.addEventListener("click", editButtonClick.bind(trackerObject));
  trackerObject.deleteButton.addEventListener("click", deleteButtonClick.bind(trackerObject));

  return trackerObject;
}

// ****HELPER FUNCTIONS**** //
function playPauseButtonClick(event) {
  let button = event.target;
  if (this.stopped) {
    this.stopped = false;
    button.innerHTML = `<i class="fas fa-pause"></i>`
    startTimer.call(this);
  }
  else {
    this.stopped = true;
    pauseTimer.call(this);
    button.innerHTML = `<i class="fas fa-play"></i>`;
  }


  function startTimer() {
    this.startTime = Date.now();
    updateDisplayClock.call(this);
  

    function updateDisplayClock() {
      setTimeout(() => {
        if (!this.stopped) {  
          this.currentTotalDuration = this.previousTotalDuration + (Date.now() - this.startTime)/1000;
          this.currentTotalDurationSpan.innerHTML = formatTime(this.currentTotalDuration);
        
          updateDisplayClock.call(this);
        }
      }, 1000);
    }
  }
  
  function pauseTimer() {
    let currentTotalDuration = this.previousTotalDuration + (Date.now() - this.startTime)/1000;
    this.currentTotalDurationSpan.innerHTML = formatTime(this.currentTotalDuration);
    this.previousTotalDuration = currentTotalDuration;
    this.startTime = undefined;
  }

  function formatTime(totalSeconds) {
    let hours = Math.floor(totalSeconds / 60 / 60);
    let minutes = Math.floor((totalSeconds/60) - (hours*60));
    let seconds = Math.floor(totalSeconds - (hours*60*60) - (minutes*60));
    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    return `${hours}:${minutes}:${seconds}`;
  }
}

function deleteButtonClick(event) {
  if (confirm("Are you sure?")) {
    let trackerContainer = event.target.parentElement;
    trackerContainer.remove();
    trackers = trackers.filter((tracker) => tracker.id != this.id);
  }
}

function editButtonClick(event) {
  showForm.call(this, "edit");
}
// ****HELPER FUNCTIONS**** //
// ******** Time trackers ******** //



// ********ADD TRACKER******** //
addTracker.onclick = function(event) {
  showForm("add");
}
// ********ADD TRACKER******** //



// ********FORM******** //
function showForm(type) {
  createCover();
  if (type == "edit") {
    setDefaultValues.call(this, type);
    addForm.edit.onclick = editSubmitClick.bind(this); // Update the context
  } else {
    setDefaultValues(type);
  }
}

// **** Add event handlers to buttons **** //
addForm.submit.onclick = submitClick;
addForm.cancel.onclick = closeForm;
// **** Add event handlers to buttons **** //

// **** Create the colour picker **** //
const pickr = Pickr.create({
  el: '#colourPicker',
  comparison: false,
  default: "C4C4C4",
  components: {
    // Main components
    preview: true,
    hue: true,

    // Input / output Options
    interaction: {
        hex: true,
        input: true,
        save: true
    }
  }
});
// **** Create the colour picker **** //

// **** Helper Functions **** //
function setDefaultValues(type) {
  if (type == "add") {
    addForm.title.value = "";
    addForm.submit.style.display = "";
    addForm.edit.style.display = "none";
  } else {
    addForm.title.value = this.name;
    addForm.submit.style.display = "none";
    addForm.edit.style.display = "";
  }
  addForm.classList.remove("hidden");
}

function createCover() {
  let coverDiv = document.createElement("div");
  coverDiv.id = "coverDiv";
  document.body.style.overflowY = "hidden";
  document.body.append(coverDiv);
}

function submitClick(event) {
  let title = addForm.title.value;
  if (!title || title=="") return;
  let colour = pickr.getColor().toRGBA().toString();
  let trackerObject = createTrackerObject(title, colour);
  trackers.push(trackerObject);
  drawTracker(trackerObject);
  closeForm();


  function drawTracker(trackerObject) {
    let tracker = document.createElement("div");
    tracker.classList = "tracker";
    tracker.append(trackerObject.playPauseButton, trackerObject.nameSpan, 
                   trackerObject.currentTotalDurationSpan, trackerObject.editButton, trackerObject.deleteButton);
    addTracker.before(tracker);
  }
}

function editSubmitClick(event) {
  let title = addForm.title.value;
  if (!title || title=="") return;
  let colour = pickr.getColor().toRGBA().toString();
  console.log(this);
  this.name = title;
  this.nameSpan.innerHTML = title;
  this.colour = colour;
  closeForm();
}

function closeForm(event) {
  removeCover();
  addForm.classList.add("hidden");

  function removeCover() {
    document.body.style.overflowY = "";
    coverDiv.remove();
  }
}
// **** Helper Functions **** //
// ********FORM******** //




// ******** Update the values of the chart ******** //
function updateChart() {
  setTimeout(() => {
    // let aTrackerIsOn = trackers.length > 0 && trackers.reduce((trackerA, boolean) => trackerA.startTime || boolean);
    // if (aTrackerIsOn) {
      updateDatasetsAndLabels();
      doughnutChart.update();
    // }

    updateChart();
  }, 1000)


  function updateDatasetsAndLabels() {
    let updatedData = [];
    let updatedBackgroundColours = [];
    let updatedLabels = [];
    
    trackers.forEach((tracker) => {
      updatedData.push(tracker.currentTotalDuration);
      updatedBackgroundColours.push(tracker.colour);
      updatedLabels.push(tracker.name);
    });
    doughnutChart.data.datasets[0].data = updatedData;
    doughnutChart.data.datasets[0].backgroundColor = updatedBackgroundColours;
    doughnutChart.data.labels = updatedLabels;
  }
}

updateChart();
// ******** Update the values of the chart ******** //
