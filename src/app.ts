import express from 'express';
import { TagEndpoint } from './endpoints/tag-endpoint';
import { Dependencies } from './dependencies';
import bodyParser from 'body-parser';
import { CreateReleaseEndpoint } from './endpoints/create-release-endpoint';

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

app.listen(port, (err) => {
  if (err) {
    return console.error(err);
  }
  return console.log(`server is listening on ${port}`);
});
