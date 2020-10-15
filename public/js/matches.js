var selectedUsername = "";
var selectedQueue = "";
var accid = "";

var champions = [];

//Used for Match History Widget Rotation
var matchList = [];
var matchesToDisplay = 6;
const matchSizePixels = 72;
var rot = 0;
var ys = [];
var ysr = [];

const queues = [
    "RANKED_SOLO_5x5",
    "RANKED_FLEX_SR"
];

function loadChampions()
{
    $.ajax({
        type: 'POST',
        url: 'localhost',
        port: 5000,
        dataType: "json",
        contentType: 'application/json',
        headers: { champions : true, query : true }
    })
    .done(function (data) {
        let championList = data.data;
        
        for (var i in championList)
        {
            const key = championList[i].key;
            const name = championList[i].id;
            champions.push({key : key, name : name});
        }

        getParams();
    })
    .fail(function (xhr, status, error) {
        console.log("Error fetching champion data");
    })
}
function getParams()
{
    $.ajax({
        type: 'POST',
        headers: {query : true}
    })
    .done(function (data) {
        selectedUsername = data['username'];
        selectedQueue = data['queue'];
        checkName();
    })
    .fail(function (xhr, status, error) {
        console.log('Error: ' + error.message);
    })
}

function checkName()
{
    $.ajax({
        type: 'POST',
        url: 'localhost',
        port: 5000,
        dataType: "json",
        contentType: 'application/json',
        headers: { username : selectedUsername, query : true }
    })
    .done(function (data) {
        if (data['id'] != "")
        {
            selectedUsername = data['name'];
            document.getElementById("page_title").innerHTML = selectedUsername + " | LoL Streamer+";
            accid = data['accountId'];
            displayMatchHistoryWidget(accid);
        }
        else
            console.log("Error: Summoner does not exist");
    })
    .fail(function (xhr, status, error) {
        console.log('Error: ' + error.message);
    })
}

function displayMatchHistoryWidget(accid)
{
    $.ajax({
        type: 'POST',
        url: 'localhost',
        port: 5000,
        dataType: "json",
        contentType: 'application/json',
        headers: { accid : accid, query : 'matchhistory', endIndex : matchesToDisplay }
    })
    .done(function (data) {
        document.getElementById("profile_rank").innerHTML = '<div style="position: relative; top:0px; left:0px"><img src="./img/match_history_border.gif"><div>';
        $("#profile_rank").append("<div id='matches' class='profile_info' style='position: relative; top:-"+matchSizePixels+"px;'></div>");
        var matchesString = "";
        for (var i = 0; i < matchesToDisplay; i++)
        {
            matchesString += '<div id="match'+i+'" class="match_container"><img src="./img/match_history_loading.gif"></div>';
        }
        $("#matches").append(matchesString);

        for (var i = 0, j = matchesToDisplay; i < matchesToDisplay; i++, j--)
        {
            ys.push(matchSizePixels);
            ysr.push(matchSizePixels-(j*matchSizePixels));
        }
        for (var i = 0; i < data['matches'].length; i++)
        {
            var gameId = data['matches'][i]['gameId'];
            var champion = data['matches'][i]['champion'];
            var role = data['matches'][i]['role'];
            var match = new Match(gameId, champion, role, i);
            matchList.push(match);
            loadStats(match);
        }
        checkUpdate();
    })
    .fail(function (xhr, status, error) {
        loadStats(match);
        document.getElementById("error_msg").innerHTML = "Error: Summoner name does not exist";
    })
}

function loadStats(match)
{
    $.ajax({
        type: 'POST',
        url: 'localhost',
        port: 5000,
        dataType: "json",
        contentType: 'application/json',
        headers: { gameid : match.gameId, query : 'matchstats' }
    })
    .done(function (data) {
        for (var i = 0; i < 10; i++)
        {
            if (data['participantIdentities'][i]['player']['summonerName'] == selectedUsername)
            {
                match.kills = data['participants'][i]['stats']['kills'];
                match.deaths = data['participants'][i]['stats']['deaths'];
                match.assists = data['participants'][i]['stats']['assists'];
                match.win = data['participants'][i]['stats']['win'];
                for (var j = 0; j < champions.length; j++)
                {
                    if (data['participants'][i]['championId'] == champions[j].key)
                    {
                        match.championName = champions[j].name;
                        break;
                    }
                }
            }
        }
        if (match.win)
            document.getElementById("match"+match.localId).innerHTML = '<div class="match_pic"><img src="./img/match_history_win.png"><div class="match_text">'+match.championName+'</div><div class="match_score">'+match.getScore()+'</div></div>';
        else
            document.getElementById("match"+match.localId).innerHTML = '<div class="match_pic"><img src="./img/match_history_loss.png"><div class="match_text">'+match.championName+'</div><div class="match_score">'+match.getScore()+'</div></div>';
    })
    .fail(function (xhr, status, error) {
        document.getElementById("error_msg").innerHTML = "Error: Could not retrieve match statistics";
    });
}
function loadNewGame(newGameData)
{
    $.ajax({
        type: 'POST',
        url: 'localhost',
        port: 5000,
        dataType: "json",
        contentType: 'application/json',
        headers: { gameid : newGameData['matches'][0]['gameId'], query : 'matchstats' }
    })
    .done(function (data) {
        var update;
        
        for (var i = 0; i < 10; i++)
        {
            if (data['participantIdentities'][i]['player']['summonerName'] == selectedUsername)
            {
                update = new Match(data['gameId'], data['participants'][i]['championId'], newGameData['matches'][0]['role'], 0);
                
                update.kills = data['participants'][i]['stats']['kills'];
                update.deaths = data['participants'][i]['stats']['deaths'];
                update.assists = data['participants'][i]['stats']['assists'];
                update.win = data['participants'][i]['stats']['win'];
                for (var j = 0; j < champions.length; j++)
                {
                    if (data['participants'][i]['championId'] == champions[j].key)
                    {
                        update.championName = champions[j].name;
                        break;
                    }
                }
                //update.displayMatch();
                break;
            }
        }

        reloadMatchHistory(update);

        for (var i in matchList)
        {
            console.log(i + ".) " + matchList[i].championName + " - " + matchList[i].getScore() + " - localId: " + matchList[i].localId);
        }

    })
    .fail(function (xhr, status, error) {
        document.getElementById("error_msg").innerHTML = "Error: Could not retrieve match statistics";
    });
}
function checkUpdate()
{
    $.ajax({
        type: 'POST',
        url: 'localhost',
        port: 5000,
        dataType: "json",
        contentType: 'application/json',
        headers: { accid : accid, query : 'matchhistory', endIndex : 1 }
    })
    .done(function (data) {
        for (var i = 0; i < data['matches'].length; i++)
        {
            if (data['matches'][0].gameId != matchList[i].gameId)
            {
                console.log("Update!!!");
                loadNewGame(data);
                break;
            }
            else
            {
                console.log("No Update");
            }
        }
        setTimeout(checkUpdate, 60000);
    })
    .fail(function (xhr, status, error) {
        console.log("yo");
    })
}
function reloadMatchHistory(update)
{
    ys[rot] = (matchSizePixels-(matchesToDisplay*matchSizePixels))+(rot*matchSizePixels);
    for (var i = matchesToDisplay-1; i > -1; i--)
    {
        if (i >= matchesToDisplay-1)
            matchList[i].localId = matchList[i].localId+1;
        else
            matchList[i].localId++;
        $("#match"+i).attr("id", "match"+matchList[i].localId);
    }
    if (matchList[matchesToDisplay-1].localId >= matchesToDisplay){
        matchList[matchesToDisplay-1].localId = 0;
        $("#match"+matchesToDisplay).attr("id", "match0");
    }
    var tl = gsap.timeline();
    for (var i = 0; i < matchesToDisplay; i++)
    {
        if (i == 0)
        {
            tl.to("#match"+i, {y: matchSizePixels*(rot+1), autoAlpha: 0, duration: 1})
                .to("#match"+i, {y: ysr[i], autoAlpha: 100, duration: 0, onComplete:updateMatch });
                
        }
        else
        {
            gsap.to("#match"+i, {y: ys[i], duration: 1})
        }
        document.getElementById("match"+i).style.removeProperty("opacity");

        function updateMatch()
        {
            if (matchList[0].win)
            {
                $("#match0 .match_pic").html(
                    "<img src='./img/match_history_win.png'>"+
                    "<div class='match_text'>"+ matchList[0].championName +"</div>"+
                    "<div class='match_score'>"+ matchList[0].getScore() +"</div>"
                );
            }
            else
            {
                $("#match0 .match_pic").html(
                    "<img src='./img/match_history_loss.png'>"+
                    "<div class='match_text'>"+ matchList[0].championName +"</div>"+
                    "<div class='match_score'>"+ matchList[0].getScore() +"</div>"
                );
            }
        }
    }
    
    for (var i = 0; i < matchesToDisplay; i++)
    {
        ys[i] += matchSizePixels;
        if(ys[i] > matchSizePixels * matchesToDisplay)
            ys[i] = matchSizePixels;
        ysr[i] += matchSizePixels;
        if(ysr[i] > 0)
            ysr[i] = matchSizePixels-(matchesToDisplay*matchSizePixels);
    }
    
    rot++;
    if (rot >= matchesToDisplay)
    {
        for (var i = 0; i < matchesToDisplay; i++)
        {
            ys[i] = matchSizePixels;
        }
        rot = 0;
    }

    matchList.pop();
    matchList.splice(0,0,update);
}

class Match
{
    constructor(gameId, champion, role, localId)
    {
        this.gameId = gameId;
        this.champion = champion;
        this.championName = "";
        this.role = role;
        this.kills = 0;
        this.deaths = 0;
        this.assists = 0;
        this.win = false;
        this.localId = localId;
    }
    displayMatch()
    {
        console.log("Local ID: " + this.localId + " Game ID: " + this.gameId);
        console.log("Champion: " + this.champion + " | Role: " + this.role + " | Score: " + this.kills + "/" + this.deaths + "/" + this.assists);
    }
    getScore()
    {
        return this.kills + "/" + this.deaths + "/" + this.assists;
    }
}

$(document).ready(loadChampions);