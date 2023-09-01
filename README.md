# NDBSqlite    

## Description
The NDBSqlite is a library to quickly publish tables in SQLITE as a Rest API

The Components are:

* [NDBModel.ts](src%2FNDBModel.ts) Any model you define must extend from this model 
* [NDBRepository.ts](src%2FNDBRepository.ts) The repository provides access to the database
* [NDBController.ts](src%2FNDBController.ts) The controllers creates REST API entries using express router 
* [QueryResult.ts](src%2FQueryResult.ts) Provide some types for input output parametes
* [NDBSqLite.ts](src%2FNDBSqLite.ts) It provides a simplified creation and initialization of a Sqlite database, optional 

## To build
This is the source code of an npm package. To build install and build the library. This will create a lib folder with the transpiled library.
```
npm install
npm run build
```

## To test
Some test have been added that run in nodejs.
```
npm run test
```
Test use the sever-side implementation of OGC Open API Features at "https://demo.pygeoapi.io/master/"
The server is reliable ans stable,  but take in t account that changes at the server may brake some tests.

## To use

Simply import the NPM package in to your project

```
npm install ndbsqlite
``` 


## Requirements.
* Sqlite3 is used to provide the sqlite functionality
* Express is optional and only required if you need  create the REST API 
