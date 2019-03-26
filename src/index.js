require('./app.scss')

function getEl(id) {
  return document.getElementById(id);
}

function attachEvent(sel, event, callback) {
  var elements = document.querySelectorAll(sel);
  for (var i = 0; i < elements.length; i++) {
    elements[i].addEventListener(event, callback);
  }
}

function parseQuery(queryString) {
  var query = {};
  var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i].split('=');
    query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
  }
  return query;
}

function initGoogleAnalytics(page) {
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

  if (typeof ga !== 'undefined') {
    ga('create', 'UA-123898108-12', 'auto');

    if (page) {
      ga('set', 'page', page);
    }

    ga('set', 'dimension0', JSON.stringify(document.body.dataset))
    ga('send', 'pageview');
  }
}

function addTrackingEvents() {
  attachEvent('.widget .close', 'click', () => trackEvent('widget_close_button', 'click'))
  attachEvent('.widget .btn', 'click', event => {
    trackEvent('widget_cta_button', 'click', event.currentTarget.innerHTML)
  })
}

// send event to Google Analytics
function trackEvent(category, action, label, value) {
  if (!window.ga) return

  const params = {
    hitType: 'event',
    eventCategory: category,
    eventAction: action
  }

  if (label) {
    params.eventLabel = label
  }

  if (value) {
    params.eventValue = value
  }

  window.ga('send', params)
}

function postMessage(action, data) {
  data || (data = {})
  data.action = action
  data.BFTN_WIDGET = true
  window.parent.postMessage(data, '*')
}

function closeWindow(event) {
  event.preventDefault()
  event.stopPropagation()
  postMessage('closeWindow')
}

function isTruthy(str) {
  return typeof(str) === 'undefined' || `${str}` === 'true' || `${str}` === '1'
}

function pingCounter(counter) {
  const xhr = new XMLHttpRequest()
  xhr.open('POST', `https://counter.battleforthenet.com/ping/${counter}`)
  xhr.send()
}

function isProbablyMobile() {
  return window.innerWidth <= 480
}

function init() {
  if (typeof(Raven) !== 'undefined') {
    Raven.config('https://8509ccd4f5554a6f97faff7cd2ee0861@sentry.io/1203579').install()
  }

  attachEvent('.close', 'click', closeWindow)
  attachEvent('.close', 'touchstart', e => e.stopPropagation())

  const query = parseQuery(location.search)

  const position = query.position === 'left' ? 'left' : 'right'
  document.body.setAttribute('data-position', position)

  const language = location.pathname.replace(/^(\/index-|\/)/, '').replace(/\.html$/, '') || 'en'
  document.body.setAttribute('data-language', language)

  if (isTruthy(query.ga) && !navigator.doNotTrack) {
    initGoogleAnalytics(`watch-widget`)
    addTrackingEvents()
  }

  if (!isTruthy(query.donations)) {
    document.body.setAttribute('data-donations', 'false')
  }

  document.querySelector('html').classList.remove('invisible')
}
document.addEventListener('DOMContentLoaded', init)

