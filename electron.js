const { app, BrowserWindow, TouchBar } = require('electron')
const { TouchBarLabel, TouchBarButton, TouchBarSpacer } = TouchBar
const path = require('path')
const url = require('url')
const settings = require('electron-settings')
const dateFns = require('date-fns')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

// whether beer time has been started
let beerOClock = false

// starting time for first time use
let defaultTime = {
  hour: 17,
  minute: 00,
  day: 5
}

const emptyButton = () =>
  new TouchBarButton({
    backgroundColor: '#000000'
  })

let buttons = [emptyButton(), emptyButton(), emptyButton(), emptyButton(), emptyButton(), emptyButton(), emptyButton()]

const green = '#007A33'

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({ width: 800, height: 600 })

  // get saved time or set default
  const beerTime = settings.get('time', defaultTime)

  // and load the index.html of the app.
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true
    })
  )

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
  const touchBar = new TouchBar(buttons)
  mainWindow.setTouchBar(touchBar)

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function() {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

const beerButton = new TouchBarButton({
  label: '🍻🍻🍻',
  backgroundColor: green,
  click: () => {
    console.log('click')
  }
})

const showBeer = button => {
  button.label = '🍻🍻🍻'
  button.backgroundColor = green
}

const hideBeer = button => {
  button.label = ''
  button.backgroundColor = '#000000'
}

const beerAnimationFlash = () => {
  const animationTime = 500
  let numCycles = 10
  let show = true

  const animationId = setInterval(() => {
    buttons.forEach(button => {
      if (show) {
        return showBeer(button)
      }

      hideBeer(button)
    })
    show = !show
    numCycles--

    if (!numCycles) clearInterval(animationId)
  }, animationTime)
}

const beerAnimationSlide = () => {
  const time = 100
  let numMoves = buttons.length - 1

  buttons.forEach(button => {
    hideBeer(button)
  })

  showBeer(buttons[numMoves])

  return new Promise((resolve, reject) => {
    const beerMove = setInterval(() => {
      hideBeer(buttons[numMoves])
      showBeer(buttons[numMoves - 1])
      numMoves--

      if (numMoves === 0) {
        clearInterval(beerMove)
        resolve()
      }
    }, time)
  })
}

const beerAnimationSlideReverse = () => {
  const time = 100
  let numMoves = 0

  buttons.forEach(button => {
    hideBeer(button)
  })

  showBeer(buttons[numMoves])

  return new Promise((resolve, reject) => {
    const beerMove = setInterval(() => {
      hideBeer(buttons[numMoves])
      showBeer(buttons[numMoves + 1])
      numMoves++

      if (numMoves === buttons.length - 1) {
        clearInterval(beerMove)
        resolve()
      }
    }, time)
  })
}

exports.setTime = (day, hour, minute) => {
  console.log(day, hour, minute)
  settings.set('time', { day, hour, minute })
}

exports.getTime = () => settings.get('time')

// check if the time saved is now
setInterval(async () => {
  const now = Date.now()
  const day = dateFns.getDay(now)
  const hour = dateFns.getHours(now)
  const minute = dateFns.getMinutes(now)
  const time = settings.get('time')

  console.log(time, 'now: ', day, hour, minute)

  if (day == time.day && hour == time.hour && minute == time.minute) {
    console.log('thats nowwwww')
    beerOClock = true
    mainWindow.show()
  } else {
    console.log('not now')
    beerOClock = false

    await beerAnimationSlide()
    await beerAnimationSlideReverse()
    beerAnimationFlash()
  }
}, 10000)
