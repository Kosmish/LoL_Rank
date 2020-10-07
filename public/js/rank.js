var selectedUsername = ""; //grab username from URL
var selectedQueue = ""; //ex: "solo"
var esid = "";

const queues = [
    "RANKED_SOLO_5x5",
    "RANKED_FLEX_SR"
];

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
            esid = data['id'];
            retrieveStats();
        }
        else
            console.log("Error: Summoner does not exist");
    })
    .fail(function (xhr, status, error) {
        console.log('Error: ' + error.message);
    })
}

function retrieveStats()
{
    console.log("retrieving...");
    $.ajax({
        type: 'POST',
        url: 'localhost',
        port: 5000,
        dataType: "json",
        contentType: 'application/json',
        headers: { esid : esid, query : true }
    })
    .done(function (data) {
        if (data.length == 0)
        {
            console.log("Summoner has no ranked information");
        }
        else
        {
            var queueIndex = 0;
            for (var i = 0; i < data.length; i++)
            {
                if (data[i]['queueType'] == selectedQueue)
                {
                    queueIndex = i;
                }
            }
            document.getElementById("profile_rank").innerHTML = "<img src='./img/" + data[queueIndex]['tier'] + ".png'>";
            document.getElementById("profile_name").innerHTML = selectedUsername;
            document.getElementById("profile_tier").innerHTML = data[queueIndex]['tier'] + " " + data[queueIndex]['rank'];
            if (data[queueIndex]['leaguePoints'] != 100)
            {
                document.getElementById("profile_lp").innerHTML = data[queueIndex]['leaguePoints'] + " LP";
                document.getElementById("profile_series").innerHTML = "";
            }
            if (data[queueIndex]['miniSeries'])
            {
                document.getElementById("profile_lp").innerHTML = "";
                var ms = "";
                for (var i = 0; i < data[queueIndex]['miniSeries']['target'] * 2 - 1; i++)
                {
                    if (data[queueIndex]['miniSeries']['progress'].charAt(i) === 'L')
                        ms += "<img src='./img/promos3.png'>";
                    else if (data[queueIndex]['miniSeries']['progress'].charAt(i) === 'W')
                        ms += "<img src='./img/promos2.png'>";
                    else
                        ms += "<img src='./img/promos1.png'>";
                }
                document.getElementById("profile_series").innerHTML = ms;
            }
            document.getElementById("profile_winrate").innerHTML = data[queueIndex]['wins'] + "W - " + data[queueIndex]['losses'] + "L";
        }
        setTimeout(retrieveStats, 60000);
    })
    .fail(function (xhr, status, error) {
        console.log('Error: ' + error.message);
    })
}

$(document).ready(getParams);