(function() {
  'use strict';

  var domId = 'BFTN_WIDGET';
  var animationDuration = 200;
  var closedCookie = '_BFTN_WIDGET_CLOSED_';

  // user-configurable options
  var opts = window.BFTN_WIDGET_OPTIONS || {};
  var cookieExpirationDays = parseFloat(opts.cookieExpirationDays || 1);
  var alwaysShow = !!(opts.alwaysShow || window.location.hash.indexOf('ALWAYS_SHOW_WIDGET') !== -1);
  var disableGoogleAnalytics = !!opts.disableGoogleAnalytics;
  var iframeHost = opts.iframeHost !== undefined ? opts.iframeHost : 'https://watch.battleforthenet.com';
  var position = opts.position || null;
  var language = 'en';

  // spanish is specified or no language is set and browser is set to spanish
  if (opts.language === 'es' || (!opts.language && navigator && navigator.language.match(/^es/))) {
    language = 'es';
  }

  var stylesToReset = {};

  function closeWindow() {
    document.body.style.overflow = stylesToReset.overflow;

    if (stylesToReset.position !== undefined) {
      document.body.style.position = stylesToReset.position;
    }

    if (stylesToReset.scrollTop !== undefined) {
      window.scrollTo(0, stylesToReset.scrollTop);
    }

    window.removeEventListener('message', receiveMessage);

    var el = document.getElementById(domId);
    el.classList.add('BFTN--closing')
    setTimeout(function(){
      el.parentNode.removeChild(el);
    }, animationDuration);

    setCookie(closedCookie, 'true', cookieExpirationDays);
  }

  function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    var c;

    for(var i = 0; i < ca.length; i++) {
      c = ca[i].trim();
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }

    return "";
  }

  function setCookie(name, val, exdays) {
    var d = new Date();
    d.setTime(d.getTime()+(exdays*24*60*60*1000));

    var expires = "expires="+d.toGMTString();
    document.cookie = name + "=" + val + "; " + expires + "; path=/";
  }

  function getIframeSrc() {
    var src = iframeHost;

    if (language === 'en') {
      src += '/?';
    }
    else {
      src += '/index-' + language + '.html?';
    }

    if (disableGoogleAnalytics) {
      src += 'ga=false&';
    }

    if (position) {
      src += 'position=' + encodeURIComponent(position) + '&';
    }

    return src.replace(/(\?|&)$/, '');
  }

  function createIframe() {
    var wrapper = document.createElement('div');
    wrapper.id = domId;
    var iframe = document.createElement('iframe');
    iframe.src = getIframeSrc();
    iframe.frameBorder = 0;
    iframe.allowTransparency = true;
    // iframe.style.display = 'none';
    wrapper.appendChild(iframe);
    document.body.appendChild(wrapper);
    return wrapper;
  }

  function injectCSS(id, css) {
    var style = document.createElement('style');
    style.type = 'text/css';
    style.id = id;
    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    }
    else {
      style.appendChild(document.createTextNode(css));
    }
    document.head.appendChild(style);
  }

  function receiveMessage(event) {
    if (!event.data.BFTN_WIDGET) return;

    switch (event.data.action) {
      case 'closeWindow':
        return closeWindow();
    }
  }

  function init() {
    if (alwaysShow || !getCookie(closedCookie)) {
      var left, right;
      var width = '450px';
      var height = '455px';
      var offset = '20px';
      var borderRadius = '10px';

      if (window.innerWidth < 500) {
        offset = '0';
        left = offset;
        right = offset;
        width = 'auto';
        height = '360px';
        borderRadius = '0';
      }
      else if (position === 'left') {
        left = offset;
        right = 'auto';
      }
      else {
        position = 'right';
        left = 'auto';
        right = offset;
      }

      injectCSS('BFTN_WIDGET_CSS',
        '#' + domId + ' { position: fixed; right: ' + right + '; left: ' + left + '; bottom: ' + offset + '; width: ' + width + '; height: ' + height + '; z-index: 20000; -webkit-overflow-scrolling: touch; overflow: hidden; transition: all ' + animationDuration + 'ms ease-in; border-radius: ' + borderRadius + '; box-shadow: 0 5px 35px rgba(0,0,0,0.5); } ' +
        '#' + domId + '.BFTN--closing { transform: scale(0); transform-origin: bottom ' + position + '; opacity: 0; transition: transform ' + animationDuration + 'ms ease-in, opacity ' + animationDuration + 'ms ease-in; } ' +
        '#' + domId + ' iframe { width: 100%; height: 100%; }'
      );

      createIframe();

      // listen for messages from iframe
      window.addEventListener('message', receiveMessage);
    }

    document.removeEventListener('DOMContentLoaded', init);
  }

  // Wait for DOM content to load.
  switch(document.readyState) {
    case 'complete':
    case 'loaded':
    case 'interactive':
      init();
      break;
    default:
      document.addEventListener('DOMContentLoaded', init);
  }
})();
