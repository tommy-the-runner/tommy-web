/* eslint-disable */

function makeAnalyticsDriver(trackingId) {
  if (!trackingId) {
    return function() {}
  }

  window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;
  ga('create', trackingId, 'auto');
  ga('send', 'pageview');

  return function (events$) {
    events$.subscribe(function (eventData) {
      ga('send', eventData)
    })
  }
}

module.exports = {
  makeAnalyticsDriver
}
