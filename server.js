const http = require('http');
const path = require('path');
const fs = require('fs');
const url = require('url');
const request = require('request');

var summoner_name = "";
var encrypted_summoner_id = "";
var encrypted_account_id = "";
var apiKey = '';

let championsAPI = 'http://ddragon.leagueoflegends.com/cdn/10.20.1/data/en_US/champion.json';

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
            if (req.headers['champions'])
            {
                request(championsAPI, { json: true }, (err, res2, body) => {
                    if (err) {
                        return console.log(err);
                    }
                    if (res2.statusCode == 200)
                    {
                        console.log("[Server] Champions API Call");
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(body));
                    }
                    else
                    {
                        return console.log("[Error] getChampions Failure: " + res.statusCode);
                    }
                });
            }
            else if (req.headers['username']) {
                summoner_name = req.headers['username'];
                let endpoint = 'https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/' + summoner_name + '?api_key=' + apiKey;
            
                request(endpoint, { json: true }, (err, res2, body) => {
                    if (err) {
                        return console.log(err);
                    }
                    if (res2.statusCode == 200)
                    {
                        console.log("[Server] Username Check: " + body['name']);
                        encrypted_summoner_id = body['id'];
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(body));
                    }
                    else
                    {
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({'id':''}));
                        return console.log("[Error] getName Failure: " + res2.statusCode);
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
                        if (body.length > 0)
                            console.log("[Server] User Stats Request: " + body[0]['summonerName']);
                        else
                            console.log("[Server] User Stats Request: User has no ranked stats");
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(body));
                    }
                    else
                    {
                        return console.log("[Error] getID Failure: " + res2.statusCode);
                    }
                });
            }
            else if (req.headers['accid']) {
                encrypted_account_id = req.headers['accid'];
                let endpoint = 'https://na1.api.riotgames.com/lol/match/v4/matchlists/by-account/' + encrypted_account_id + '?endIndex=' + req.headers['endindex'] + '&api_key=' + apiKey;
                request(endpoint, { json: true }, (err, res2, body) => {
                    if (err) {
                        return console.log(err);
                    }
                    if (res2.statusCode == 200)
                    {
                        console.log("[Server] User Match History Request: " + req.headers['accid']);
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(body));
                    }
                    else
                    {
                        return console.log("[Error] getAccID Failure: " + res2.statusCode);
                    }
                });
            }
            else if (req.headers['gameid'])
            {
                var gameId = req.headers['gameid'];
                let endpoint = 'https://na1.api.riotgames.com/lol/match/v4/matches/' + gameId + '?api_key=' + apiKey;
                request(endpoint, { json: true }, (err, res2, body) => {
                    if (err) {
                        return console.log(err);
                    }
                    if (res2.statusCode == 200)
                    {
                        console.log("[Server] User Match Request: " + req.headers['gameid']);
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(body));
                    }
                    else
                    {
                        return console.log("[Error] getGameID Failure: " + res.statusCode);
                    }
                });
            }
            
            else if (queryParams.username && req.headers['query'] == 'true')
            {
                res.writeHead(200, { 'Content-Type': 'application/json'});
                console.log("[Server] Rank Widget: " + queryParams.username + " - " + queryParams.queue);
                res.end(JSON.stringify(queryParams));
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