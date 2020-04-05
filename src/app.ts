import express from 'express';
import { range, interval } from "rxjs";
import { map, filter, take, toArray } from "rxjs/operators";
import { TagEndpoint, TagEndpointDependencies } from './endpoints/tag-endpoint';
import { Dependencies } from './endpoints/dependencies';
import { Keychain } from './keys';

const app = express();
const port = 3000;
const dependencies = new Dependencies()

app.get('/', (req, res) => {
  new TagEndpoint(dependencies)
  .execute()
  .subscribe(
    x => res.send(x),
    error => {
      console.log(error)
      res.send(error)
    }
  );
});

app.listen(port, err => {
  if (err) {
    return console.error(err);
  }
  return console.log(`server is listening on ${port}`);
});