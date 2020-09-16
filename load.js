const http = require('http');
const path = require('path');
const fs = require('fs');

var Summoner = require("./summoner.js");
var summoner_name = "Lovelightz";
var summoner1 = new Summoner(summoner_name);
var apiKey = 'RGAPI-1ce1468b-a2d0-43e9-a3f9-e6bae773b110';

var encrypted_summoner_id = getSummonerID(summoner_name);

const server = http.createServer((req, res) => {
    let filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);
    let extname = path.extname(filePath);

    let contentType = 'text/html';

    switch(extname)
    {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.jpg':
            contentType = 'image/jpg';
            break;
    }

    //Read File
    fs.readFile(filePath, (err, content) => {
        if(err) {
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
            //Success
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf8');
        }
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

function getSummonerID()
{
    let endpoint = 'https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/' + summoner_name + '?api_key=' + apiKey;

    const request = require('request');
    
    request(endpoint, { json: true }, (err, res, body) => {
        if (err) {
            return console.log(err);
        }
        if (res.statusCode == 200)
        {
            encrypted_summoner_id = body['id'];
            getRank();
        }
        else
        {
            return console.log("getID Failure: " + res.statusCode);
        }
    });
}

function getRank()
{   
    let endpoint = 'https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/' + encrypted_summoner_id + '?api_key=' + apiKey;

    const request = require('request');
    
    request(endpoint, { json: true }, (err, res, body) => {
        if (err) {
            return console.log(err);
        }
        if (res.statusCode == 200)
        {
            summoner1.summonerId = body[0]['summonerId'];
            summoner1.tier = body[0]['tier'];
            summoner1.rank = body[0]['rank'];
            summoner1.leaguePoints = body[0]['leaguePoints'];
            summoner1.wins = body[0]['wins'];
            summoner1.losses = body[0]['losses'];
            if (body[0]['miniSeries'])
            {
                summoner1.miniSeries = true;
                summoner1.target = body[0]['miniSeries']['target'];
                summoner1.seriesWins = body[0]['miniSeries']['wins'];
                summoner1.seriesLosses = body[0]['miniSeries']['losses'];
                summoner1.progress = body[0]['miniSeries']['progress'];
            }
            console.log(summoner1.displayRank());
        }
        else
        {
            console.log("getRank Failure: " + res.statusCode);
        }
    });
}