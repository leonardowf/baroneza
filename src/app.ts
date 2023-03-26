import express from 'express';
import { TagEndpoint } from './endpoints/tag-endpoint';
import { Dependencies } from './dependencies';
import bodyParser from 'body-parser';
import { CreateReleaseEndpoint } from './endpoints/create-release-endpoint';
import { StartTrainEndpoint } from './endpoints/start-train-endpoint';
import swagger from 'swagger-ui-express';
import * as swaggerDocument from '../swagger.json';
import { UpdateReleaseEndpoint } from './endpoints/update-release-endpoint';
import { ReleaseVersionEndpoint } from './endpoints/release-version-endpoint';
import { NotifyReleaseStatusEndpoint } from './endpoints/notify-release-status-endpoint';

const app = express();
app.use(bodyParser.json());

const port = 3000;
const dependencies = new Dependencies();

app.post('/tagRelease', (req, res) => {
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

app.post('/startTrain', (req, res) => {
  res.setTimeout(
    dependencies.config.secondsToConfirmationTimeout * 1000 + 10000
  );
  new StartTrainEndpoint(dependencies).execute(req.body).subscribe(
    (x) => res.send(x),
    (error) => {
      console.log(error);
      res.send(error);
    }
  );
});

app.post('/updateRelease', (req, res) => {
  new UpdateReleaseEndpoint(dependencies).execute(req.body).subscribe(
    (x) => res.send(x),
    (error) => {
      console.log(error);
      res.send(error);
    }
  );
});

app.post('/releaseVersion', (req, res) => {
  new ReleaseVersionEndpoint(dependencies).execute(req.body).subscribe(
    (x) => res.send(x),
    (error) => {
      console.log(error);
      res.send(error);
    }
  );
});

app.post('/notifyReleaseStatus', (req, res) => {
  new NotifyReleaseStatusEndpoint(dependencies).execute(req.body).subscribe(
    (x) => res.send(x),
    (error) => {
      console.log(error);
      res.send(error);
    }
  );
});

app.get('/health', (req, res) => {
  res.send('ok');
});

app.use('/swagger', swagger.serve, swagger.setup(swaggerDocument));

app.listen(port, (err) => {
  if (err) {
    return console.error(err);
  }
  return console.log(
    `
          . . . . o o o o o
                _____      o
       ____====  ]OO|_n_n__][.
      [________]_|__|________)<     choo choo on port ${port}
       oo    oo  'oo OOOO-| oo\\_
   +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
    `
  );
});
