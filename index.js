const rp = require('request-promise');
const xml2js = require('xml2js');
const express = require('express');
const app = express();

const RSS_URL = 'http://www.animenewsnetwork.com/all/rss.xml';

app.set('port', (process.env.PORT || 3000));

app.get('/', (appReq, appRes) => {
  rp(RSS_URL)
    .then(rssRes => xml2js.parseString(rssRes, (err, rssJSON) => {
      let alexaNewsItems = [];

      rssJSON.rss.channel[0].item.forEach(item => {
        alexaNewsItems.push({
          uid: item.guid[0]._,
          updateDate: item.pubDate[0],
          titleText: item.title[0],
          mainText: item.description[0],
          redirectionURL: item.link[0]
        });
      });

      appRes.json(alexaNewsItems);
    }))
    .catch(err => {
      console.error(err);

      appRes.json({
        err
      });
    });
});

app.listen(app.get('port'), function() {
  console.log('RSS proxy running on port', app.get('port'));
});
