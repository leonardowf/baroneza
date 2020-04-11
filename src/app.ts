import express from 'express';
import { TagEndpoint } from './endpoints/tag-endpoint';
import { Dependencies } from './dependencies';
import bodyParser from 'body-parser';
import { CreateReleaseEndpoint } from './endpoints/create-release-endpoint';

import { WebClient } from '@slack/web-api';
import { from, timer, of } from 'rxjs';
import { flatMap, mapTo, map } from 'rxjs/operators';
import { StartTrainEndpoint } from './endpoints/start-train-endpoint';

const app = express();
app.use(bodyParser.json());

const port = 3000;
const dependencies = new Dependencies();

app.post('/tagPullRequest', (req, res) => {
  new TagEndpoint(dependencies).execute(req.body).subscribe(
    (x) => res.send(x),
    (error) => {
      console.log(error);
      res.send(error);
    }
  );
});

app.post('/createRelease', (req, res) => {
  new CreateReleaseEndpoint(dependencies).execute(req.body).subscribe(
    (x) => res.send(x),
    (error) => {
      console.log(error);
      res.send(error);
    }
  );
});

class Wtf {
  value: string;
  channelId: string;
  constructor(value: string, channelId: string) {
    this.value = value;
    this.channelId = channelId;
  }
}

app.post('/sendMessage', (req, res) => {
  const web = new WebClient('');

  const sendMessageAndWait = from(
    web.chat.postMessage({
      channel: 'automation',
      text: 'oi'
    })
  )
    .pipe(
      map((x) => {
        console.log(x);
        return new Wtf(<string>x.ts, <string>x.channel);
      })
    )
    .pipe(flatMap((x) => timer(10000).pipe(mapTo(x))));

  const getReactions = sendMessageAndWait.pipe(
    flatMap((x) => {
      const l: string = x.value;
      return from(
        web.reactions.get({
          timestamp: l,
          channel: x.channelId,
          full: true
        })
      );
    })
  );

  getReactions.subscribe(
    (x) => {
      console.log(x);
      res.send(x);
    },
    (error) => {
      console.log(error);
    }
  );
});

app.post('/startTrain', (req, res) => {
  new StartTrainEndpoint(dependencies).execute(req.body).subscribe(
    (x) => res.send(x),
    (error) => {
      console.log(error);
      res.send(error);
    }
  );
});

app.listen(port, (err) => {
  if (err) {
    return console.error(err);
  }
  return console.log(`server is listening on ${port}`);
});
