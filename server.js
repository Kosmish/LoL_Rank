const http = require('http');
const path = require('path');
const fs = require('fs');
const url = require('url');
const request = require('request');
const { query } = require('express');

var summoner_name = "";
var encrypted_summoner_id = "";
var apiKey = '';

//-----------------------------//

const requestListener = function (req, res) {
    let filePath = "";

    var queryParams = url.parse(req.url,true).query;

    if (req.headers['query'])
    {
        filePath = path.join(__dirname, 'public', '/index.html');
    }
    else
    {
        var a = url.parse(req.url).pathname;
        filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : a);

        if (queryParams.username)
        {
            filePath = path.join(__dirname, 'public', '/rank.html');
        }
    }
    fs.readFile(filePath, (err, content) => {
        if(err) {
            console.log(err);
            if(err.code == 'ENOENT') {
                //Page not found
                fs.readFile(path.join(__dirname, './public', '404.html'), (err, content) => {
                    res.writeHead(200, { 'Content-Type': 'text/html'});
                    res.end(content, 'utf8');
                });
            }
            else
            {
                //Some server error
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
        }
        else
        {
            if (req.headers['username']) {
                summoner_name = req.headers['username'];
                let endpoint = 'https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/' + summoner_name + '?api_key=' + apiKey;
            
                request(endpoint, { json: true }, (err, res2, body) => {
                    if (err) {
                        return console.log(err);
                    }
                    if (res2.statusCode == 200)
                    {
                        encrypted_summoner_id = body['id'];
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(body));
                    }
                    else
                    {
                        return console.log("getID Failure: " + res2.statusCode);
                    }
                });
            }
            else if (req.headers['esid']) {
                encrypted_summoner_id = req.headers['esid'];
                let endpoint = 'https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/' + encrypted_summoner_id + '?api_key=' + apiKey;
            
                request(endpoint, { json: true }, (err, res2, body) => {
                    if (err) {
                        return console.log(err);
                    }
                    if (res2.statusCode == 200)
                    {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(body));
                    }
                    else
                    {
                        return console.log("getID Failure: " + res2.statusCode);
                    }
                });
            }
            else if (queryParams.username)
            {
                res.writeHead(200, { 'Content-Type': 'text/json'});
                console.log(JSON.stringify(queryParams));
                res.end(JSON.stringify(queryParams), 'utf8');
            }
            else
            {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(content, 'utf8');
            }
        }
    });
}
const server = http.createServer(requestListener);
server.listen(5000);
console.log("Server listening on port 5000...");

//-----------------------------//