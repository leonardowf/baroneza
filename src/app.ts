import express from 'express';
import { TagEndpoint } from './endpoints/tag-endpoint';
import { Dependencies } from './dependencies';
import bodyParser from 'body-parser';
import { CreateReleaseEndpoint } from './endpoints/create-release-endpoint';
import { StartTrainEndpoint } from './endpoints/start-train-endpoint';
import swagger from 'swagger-ui-express';
import * as swaggerDocument from '../swagger.json';

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

app.get('/hello', (req, res) => {
  dependencies.updateReleaseUseCase.execute({
    channel: "automation",
    fromVersion: "1.0.1",
    toVersion: "1.15.101",
    jiraSuffix: "",
    repository: "baroneza-test",
    title: "updated title",
    project: "PSF",
    pullRequestNumber: 57
  }).subscribe(
    (x) => res.send(x),
    (error) => {
      console.log(error);
      res.send(error);
    }
  );
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
