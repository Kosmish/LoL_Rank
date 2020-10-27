const ip = "localhost";

var selectedUsername = ""; //grab username from URL
var selectedQueue = ""; //ex: "solo"
var esid = "";
var currentLP;

const queues = [
    "RANKED_SOLO_5x5",
    "RANKED_FLEX_SR"
];

var selectedServer;

const serverList = [
    "BR", "EUNE", "EUW", "JP", "KR", "LAN", "LAS", "NA", "OCE", "TR", "RU"
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
        selectedServer = data['server'];
        if (data['rank']=='false')
            $("#profile_rank").hide();
        if (data['name']=='false')
            $("#profile_name").hide();
        if (data['tier']=='false')
            $("#profile_tier").hide();
        if (data['lp']=='false')
            $("#profile_lp").hide();
        if (data['winrate']=='false')
            $("#profile_winrate").hide();
        if (data['layout']=='true')
        {
            $("#rank_widget").css("flex-direction", "row");
            $("#rank_widget").css("font-size", "14pt");
        }
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
        url: ip,
        port: 5000,
        dataType: "json",
        contentType: 'application/json',
        headers: { username : selectedUsername, query : true, server : selectedServer }
    })
    .done(function (data) {
        if (data['id'] != "")
        {
            selectedUsername = data['name'];
            document.getElementById("page_title").innerHTML = selectedUsername + " | LoL Streamer";
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
    $.ajax({
        type: 'POST',
        url: ip,
        port: 5000,
        dataType: "json",
        contentType: 'application/json',
        headers: { esid : esid, query : true, server : selectedServer }
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

            if (!data[queueIndex]['miniSeries'])
            {
                if (currentLP)
                {
                    if (currentLP < data[queueIndex]['leaguePoints'])
                    {
                        incrementLp(data[queueIndex]['leaguePoints']);
                    }
                    else
                    {
                        decrementLp(data[queueIndex]['leaguePoints']);
                    }
                }
                else
                {
                    currentLP = data[queueIndex]['leaguePoints'];
                }
            }

            document.getElementById("profile_rank").innerHTML = "<img src='./img/" + data[queueIndex]['tier'] + ".png'>";
            document.getElementById("profile_name").innerHTML = selectedUsername;
            document.getElementById("profile_tier").innerHTML = data[queueIndex]['tier'] + " " + data[queueIndex]['rank'];
            if (!data[queueIndex]['miniSeries'])
            {
                document.getElementById("profile_lp").innerHTML = data[queueIndex]['leaguePoints'] + " LP";
            }
            else
            {
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
                document.getElementById("profile_lp").innerHTML = ms;
            }
            document.getElementById("profile_winrate").innerHTML = data[queueIndex]['wins'] + "W - " + data[queueIndex]['losses'] + "L";

        }
        setTimeout(retrieveStats, 60000);
    })
    .fail(function (xhr, status, error) {
        console.log('Error: ' + error.message);
    })
}

function incrementLp(num)
{
    document.getElementById("profile_lp").className = "greenText";
    if (currentLP < num)
    {
        currentLP++;
        $("#profile_lp").html(currentLP + " LP");
        setTimeout(function(){incrementLp(num)}, 40);
        document.getElementById("profile_lp").className = "whiteText";
    }
}

function decrementLp(num)
{
    document.getElementById("profile_lp").className = "redText";
    if (currentLP > num)
    {
        currentLP--;
        $("#profile_lp").html(currentLP + " LP");
        setTimeout(function(){decrementLp(num)}, 40);
        document.getElementById("profile_lp").className = "whiteText";
    }
}

$(document).ready(getParams);