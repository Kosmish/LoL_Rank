const http = require('http');
const path = require('path');
const fs = require('fs');
const url = require('url');
const request = require('request');

let championsAPI = 'http://ddragon.leagueoflegends.com/cdn/10.20.1/data/en_US/champion.json';
const serverList = ["br1", "eun1", "euw1", "jp1", "kr", "la1", "la2", "na1", "oc1", "ru", "tr1"];

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
    var d = new Date();
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
                        console.log("["+ d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() +"][Server] Champions API Call");
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(body));
                    }
                    else
                    {
                        return console.log("["+ d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() +"][Error] getChampions Failure: " + res.statusCode);
                    }
                });
            }
            else if (req.headers['query'] == 'getchampionid')
            {
                let endpoint = 'http://ddragon.leagueoflegends.com/cdn/10.21.1/data/en_US/champion/'+req.headers['champion']+'.json';
                request(endpoint, { json: true }, (err, res2, body) => {
                    if (err) {
                        return console.log(err);
                    }
                    if (res2.statusCode == 200)
                    {
                        console.log("["+ d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() +"][Server] Get Champion ID: " + req.headers['champion']);
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(body));
                    }
                    else
                    {
                        return console.log("["+ d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() +"][Error] getChampionId Failure: " + res2.statusCode);
                    }
                });
            }
            else if (req.headers['username']) {
                var serverId = req.headers['server'];
                var summoner_name = req.headers['username'];
                let endpoint = 'https://'+ serverList[serverId] +'.api.riotgames.com/lol/summoner/v4/summoners/by-name/' + summoner_name + '?api_key=' + apiKey;
            
                request(endpoint, { json: true }, (err, res2, body) => {
                    if (err) {
                        return console.log(err);
                    }
                    if (res2.statusCode == 200)
                    {
                        console.log("["+ d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() +"][Server] Username Check: " + body['name'] + " (" + serverList[serverId] + ")");
                        
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(body));
                    }
                    else
                    {
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({'id':''}));
                        return console.log("["+ d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() +"][Error] getName Failure: " + res2.statusCode);
                    }
                });
            }
            else if (req.headers['esid']) {
                var serverId = req.headers['server'];
                var encrypted_summoner_id = req.headers['esid'];
                let endpoint = 'https://'+ serverList[serverId] +'.api.riotgames.com/lol/league/v4/entries/by-summoner/' + encrypted_summoner_id + '?api_key=' + apiKey;
            
                request(endpoint, { json: true }, (err, res2, body) => {
                    if (err) {
                        return console.log(err);
                    }
                    if (res2.statusCode == 200)
                    {
                        if (body.length > 0)
                            console.log("["+ d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() +"][Server] User Stats Request: " + body[0]['summonerName'] + " (" + serverList[serverId] + ")");
                        else
                            console.log("["+ d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() +"][Server] User Stats Request: User has no ranked stats");
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(body));
                    }
                    else
                    {
                        return console.log("["+ d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() +"][Error] getID Failure: " + res2.statusCode);
                    }
                });
            }
            else if (req.headers['accid']) {
                var serverId = req.headers['server'];
                var encrypted_account_id = req.headers['accid'];
                let endpoint = 'https://'+ serverList[serverId] +'.api.riotgames.com/lol/match/v4/matchlists/by-account/' + encrypted_account_id + '?endIndex=' + req.headers['endindex'] + '&api_key=' + apiKey;
                if (req.headers['rankedonly'] == 'true')
                    endpoint = 'https://'+ serverList[serverId] +'.api.riotgames.com/lol/match/v4/matchlists/by-account/' + encrypted_account_id + '?queue=420' + '&endIndex=' + req.headers['endindex'] + '&api_key=' + apiKey;
                request(endpoint, { json: true }, (err, res2, body) => {
                    if (err) {
                        return console.log(err);
                    }
                    if (res2.statusCode == 200)
                    {
                        console.log("["+ d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() +"][Server] User Match History Request: " + req.headers['accid'] + " (" + serverList[serverId] + ")");
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(body));
                    }
                    else
                    {
                        return console.log("["+ d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() +"][Error] getAccID Failure: " + res2.statusCode);
                    }
                });
            }
            else if (req.headers['gameid'])
            {
                var serverId = req.headers['server'];
                var gameId = req.headers['gameid'];
                let endpoint = 'https://'+ serverList[serverId] +'.api.riotgames.com/lol/match/v4/matches/' + gameId + '?api_key=' + apiKey;
                request(endpoint, { json: true }, (err, res2, body) => {
                    if (err) {
                        return console.log(err);
                    }
                    if (res2.statusCode == 200)
                    {
                        console.log("["+ d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() +"][Server] User Match Request: " + req.headers['gameid'] + " (" + serverList[serverId] + ")");
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(body));
                    }
                    else
                    {
                        return console.log("["+ d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() +"][Error] getGameID Failure: " + res.statusCode);
                    }
                });
            }
            else if (req.headers['query'] == 'mastery')
            {
                var serverId = req.headers['server'];
                var summoner = req.headers['summonerid'];
                var champion = req.headers['championid'];
                let endpoint = 'https://'+ serverList[serverId] +'.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/' + summoner + '/by-champion/' + champion + '?api_key=' + apiKey;
                request(endpoint, { json: true }, (err, res2, body) => {
                    if (err) {
                        return console.log(err);
                    }
                    if (res2.statusCode == 200)
                    {
                        console.log("["+ d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() +"][Server] Champion Mastery Request: " + summoner + " - " + champion + " (" + serverList[serverId] + ")");
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(body));
                    }
                    else
                    {
                        console.log("["+ d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() +"][Error] getChampionMastery Failure: " + res.statusCode);
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({championPoints : 0}));
                    }
                });
            }
            else if (queryParams.username && req.headers['query'] == 'true')
            {
                res.writeHead(200, { 'Content-Type': 'application/json'});
                console.log("["+ d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() +"][Server] Rank Widget: " + queryParams.username + " (" + serverList[serverId] + ")");
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