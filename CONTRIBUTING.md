# Building and testing

> First, you'll need to have a reasonably modern version of `node` handy. This won't work with versions older than 9, for instance.

Install the dependencies  
```bash
$ yarn install
```

Build the typescript and package it for distribution
```bash
$ yarn run build && yarn run package
```

Run the tests 
```bash
$ yarn test
...
```

## Publishing to a distribution branch

Actions are run from GitHub repos so we will checkin the packed dist folder. 

Then run [ncc](https://github.com/zeit/ncc) and push the results:
```bash
$ yarn run package
$ git add dist
$ git commit -a -m "prod dependencies"
$ git push origin releases/v1
```

Note: GitHub recommends using the `--license` option for ncc, which will create a license file for all of the production node modules used in your project.

The action is now published! :rocket: 

Also see the [versioning documentation](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md).
