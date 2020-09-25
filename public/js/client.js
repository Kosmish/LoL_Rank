var selectedUsername = "";
var esid = "";
var selectedQueue = -1;
var selectedWidget = -1;
var summoner;

const numOfQueueTypes = 2;
const queues = [
    "RANKED_SOLO_5x5",
    "RANKED_FLEX_SR"
];
const widgets = [
    "MASTERY",
    "RANK",
    "MATCH_HISTORY",
    "GHOST_SHIELD"
];

function init()
{
    $("#load_area").hide();
    $("#widgets_main").hide();
    $("#profile_display").hide();
    $("#confirm_btns").hide();
    $("#search_btn").click(function(){
        for (var i = 0; i < numOfQueueTypes; i++)
        {
            var str = "queue"+i;
            document.getElementById(str).className = "queueBtn";
        }
        $("#profile_display").hide();
        $("#profile").hide();
        $("#queue0").hide();
        $("#queue1").hide();
        $("#widgets_main").hide();
        $("#queue_selection").hide();
        $("#load_area").show();
        $("#confirm_btns").hide();
        selectedUsername = $("#username").val();
        checkName();
    });

    $(".queueBtn").click(function(){
        selectWidget(this);
    });

    $(".widget").click(function(){
        editWidgetSettings(this);
    });

    $("#cancelBtn").click(function(){
        $("#confirm_btns").hide();
        $("#profile_display").hide();
        $("#widgets_main").show();
        selectedWidget = -1;
    });

    $("#continueBtn").click(function(){
        $("#confirm_btns").hide();
        $("#profile_display").hide();
    });
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
        esid = data['id'];
        if (esid != "")
            retrieveStats();
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
            summoner = new Summoner(selectedUsername);
            summoner.summonerId = esid;
            for(var i = 0; i < data.length; i++)
            {
                var queue = new QueueType();
                queue.queueType = data[i]['queueType'];
                queue.tier = data[i]['tier'];
                queue.rank = data[i]['rank'];
                queue.leaguePoints = data[i]['leaguePoints'];
                queue.wins = data[i]['wins'];
                queue.losses = data[i]['losses'];
                if (data[i]['miniSeries'])
                {
                    queue.miniSeries = true;
                    queue.target = data[i]['miniSeries']['target'];
                    queue.seriesWins = data[i]['miniSeries']['wins'];
                    queue.seriesLosses = data[i]['miniSeries']['losses'];
                    queue.progress = data[i]['miniSeries']['progress'];
                }
                summoner.addQueue(queue);
            }
            summoner.displayRank();
            selectQueue();
        }
    })
    .fail(function (xhr, status, error) {
        console.log('Error: ' + error.message);
    })
}

function fetchWidget()
{
    switch(selectedWidget)
    {
        case 0:
            break;
        case 1:
            var a = document.getElementById("continue").href = "./rank.html?username="+selectedUsername+"&queue="+queues[selectedQueue];
            break;
        case 2:
            break;
        case 3:
            break;
    }
}

function selectQueue()
{
    $("#load_area").hide();
    $("#queue_selection").show();
}

function selectWidget(clickedButton)
{
    const s = $(clickedButton).attr('id');
    var matches = s.match(/(\d+)/);
    var btnNum = parseInt(matches[0]);
    for (var i = 0; i < numOfQueueTypes; i++)
    {
        var str = "queue"+i;
        document.getElementById(str).className = "queueBtn";
    }
    document.getElementById(s).className = "queueBtnSelected";
    selectedQueue = btnNum;

    $("#confirm_btns").hide();
    $("#profile_display").hide();

    var queueObj = summoner.getQueueObj();
    document.getElementById("profile_name").innerHTML = summoner.summonerName;
    document.getElementById("profile_tier").innerHTML = queueObj.tier + " " + queueObj.rank;
    document.getElementById("profile_lp").innerHTML = queueObj.leaguePoints + " LP";
    document.getElementById("profile_series").innerHTML = "";
    if (queueObj.miniSeries)
    {
        var ms = "";
        for (var i = 0; i < queueObj.target * 2 - 1; i++)
        {
            if (queueObj.progress.charAt(i) === 'L')
                ms += "<img src='./img/promos3.png'>";
            else if (queueObj.progress.charAt(i) === 'W')
                ms += "<img src='./img/promos2.png'>";
            else
                ms += "<img src='./img/promos1.png'>";
        }
        document.getElementById("profile_series").innerHTML = ms;
    }
    document.getElementById("profile_winrate").innerHTML = queueObj.wins + "W - " + queueObj.losses + "L";

    document.getElementById("profile_rank").innerHTML = "";
    
    switch(queueObj.tier)
    {
        case "CHALLENGER":
            document.getElementById("profile_rank").innerHTML = "<img src='./img/challenger.png'>";
            break;
        case "GRANDMASTER":
            document.getElementById("profile_rank").innerHTML = "<img src='./img/grandmaster.png'>";
            break;
        case "MASTER":
            document.getElementById("profile_rank").innerHTML = "<img src='./img/masters.png'>";
            break;
    }
    $("#widgets_main").show();
}

function editWidgetSettings(clickedButton)
{
    const s = $(clickedButton).attr('id');
    var matches = s.match(/(\d+)/);
    var btnNum = parseInt(matches[0]);

    selectedWidget = btnNum;

    $("#profile_display").show();
    $("#widgets_main").hide();
    $("#confirm_btns").show();

    fetchWidget();
}

class Summoner {
    constructor(summonerName) {
        this.summonerName = summonerName;
        this.summonerId = "";
        this.queueTypes = [];
    }
    addQueue(queue)
    {
        this.queueTypes.push(queue);
    }
    displayRank()
    {
        for (var i = 0; i < this.queueTypes.length; i++)
        {
            if (this.queueTypes[i].queueType == queues[0])
            {
                $("#queue0").show();
            }
            else if (this.queueTypes[i].queueType == queues[1])
            {
                $("#queue1").show();
            }
        }
    }
    getQueueObj()
    {
        for (var i = 0; i < numOfQueueTypes; i++)
        {
            if (queues[selectedQueue] == this.queueTypes[i].queueType)
            {
                return this.queueTypes[i];
            }
        }
    }
}

class QueueType {
    constructor()
    {
        this.queueType = "";
        this.tier = "";
        this.rank = "";
        this.leaguePoints = 0;
        this.wins = 0;
        this.losses = 0;
        this.miniSeries = false;
        this.target = 0;
        this.seriesWins = 0;
        this.seriesLosses = 0;
        this.progress = "NNN";
    }
    displayQueueType()
    {
        if (this.miniSeries)
        {
            var s = "";
            for (var i = 0; i < this.target * 2 - 1; i++)
            {
                if (this.progress.charAt(i) === 'L')
                    s += "X";
                else if (this.progress.charAt(i) === 'W')
                    s += "&#10004;";
                else
                    s += "-";
            }
            //console.log("Mini Series: " + s);
        }
    }
}

$(document).ready(init);