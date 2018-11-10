const rp = require('request-promise');
const xml2js = require('xml2js');
const express = require('express');
const dateFormat = require('dateformat');
const app = express();

const RSS_URL = 'https://www.animenewsnetwork.com/news/rss.xml';
const RSS_POLL_TIMEOUT = 15 * 60 * 1000
let dataCache = {};

app.set('port', process.env.PORT || 3000);

app.get('/', (appReq, appRes) => {
  appRes.json(dataCache);
});

app.listen(app.get('port'), function() {
  console.log('RSS proxy running on port', app.get('port'));
});

function updateDataCache() {
  rp(RSS_URL)
    .then(rssRes =>
      xml2js.parseString(rssRes, (err, rssJSON) => {
        let alexaNewsItems = [];

        rssJSON.rss.channel[0].item.forEach(item => {
          const itemDate = new Date(item.pubDate[0]);

          alexaNewsItems.push({
            uid: item.guid[0]._,
            updateDate: dateFormat(itemDate, `UTC:yyyy-mm-dd'T'HH:MM:ss'.0Z'`),
            titleText: item.title[0],
            mainText: item.description[0],
            redirectionURL: item.link[0]
          });
        });
        dataCache = alexaNewsItems;
      })
    )
    .catch(err => {
      console.error(err);
    });
}

updateDataCache();
setInterval(updateDataCache, RSS_POLL_TIMEOUT);
