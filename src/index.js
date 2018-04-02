const remote = require('electron').remote
const { setTime, getTime } = remote.require('./electron.js')

const timeInput = document.querySelector('#timeInput')
const setTimeButton = document.querySelector('#setTimeButton')
const dayInput = document.querySelector('#day')

const timeChange = () => {
  const time = timeInput.value.split(':')
  const day = dayInput.value

  setTime(day, ...time)
}

const updateTime = time => {
  const { day, hour, minute } = getTime()
  dayInput.value = day
}

// timeInput.onchange = timeChange
setTimeButton.onclick = timeChange

// on load set the time
updateTime()
