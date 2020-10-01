var selectedUsername = "";
var esid = "";
var accid = "";
var matchesToDisplay = 4;
var selectedQueue = -1;
var selectedWidget = -1;
var summoner;
var matchList = [];

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

var champions = [];

//Used for Match History Widget Rotation
const matchSizePixels = 36;
var rot = 0;
var ys = [];
var ysr = [];
//--------------------------------------

function init()
{
    loadChampions();
    $("#load_area").hide();
    $("#widgets_main").hide();
    $("#profile_display").hide();
    $("#confirm_btns").hide();
    $("#search_btn").click(function(){
        if ($("#username").val().length >= 3 && $("#username").val().length <= 16)
        {
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
            document.getElementById("error_msg").innerHTML = "";
            selectedUsername = $("#username").val();
            checkName();
        }
        else
        {
            document.getElementById("error_msg").innerHTML = "Error: Invalid Summoner name";
            turnOff();
        }
        
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

    $("#setting_test").click(function(){
        reloadMatchHistory();
    });
}

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
    })
    .fail(function (xhr, status, error) {
        console.log("Error fetching champion data");
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
        esid = data['id'];
        accid = data['accountId']
        selectedUsername = data['name'];
        if (esid != "")
            retrieveStats();
    })
    .fail(function (xhr, status, error) {
        document.getElementById("error_msg").innerHTML = "Error: Summoner name does not exist";
        turnOff();
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
            turnOff();
            document.getElementById("error_msg").innerHTML = "Error: Summoner has no ranked information";
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
    clearPreview();
    switch(selectedWidget)
    {
        case 0:
            break;
        case 1:
            var a = document.getElementById("continue").href = "./rank.html?username="+selectedUsername+"&queue="+queues[selectedQueue];
            addSetting({type:'checkbox'}, "Show Username", "username", false);
            addSetting({type:'checkbox'}, "Show Tier", "tier", true);
            addSetting({type:'checkbox'}, "Show LP", "lp", true);
            addSetting({type:'checkbox'}, "Show Win/Loss", "winloss", true);
            displayRankWidget();
            break;
        case 2:
            var a = document.getElementById("continue").href = "./matches.html?username="+selectedUsername+"&queue="+queues[selectedQueue];
            var data = [1,2,3,4,5,6,7,8];
            addSetting({type:'checkbox'}, "Ranked Only", "rankedonly", false);
            addSetting({type:'dropdown', data}, "# of Matches", "username", false);
            addSetting({type:'testBtn'}, "Test", "test", false);
            displayMatchHistoryWidget();
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

function displayMatchHistoryWidget()
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
        document.getElementById("profile_rank").innerHTML = '<div style="position: relative; top:0px; left:0px"><img src="./img/match_history_border32.gif"><div>';
        $("#profile_rank").append("<div id='matches' class='profile_info' style='position: relative; top:-"+matchSizePixels+"px;'></div>");
        var matchesString = "";
        for (var i = 0; i < matchesToDisplay; i++)
        {
            matchesString += '<div id="match'+i+'" class="match_container"><img src="./img/match_history_loading32.gif"></div>';
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

    })
    .fail(function (xhr, status, error) {
        document.getElementById("error_msg").innerHTML = "Error: Summoner name does not exist";
        turnOff();
    })
}
function reloadMatchHistory()
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
                .to("#match"+i, {y: ysr[i], autoAlpha: 100, duration: 0});
                
        }
        else
        {
            gsap.to("#match"+i, {y: ys[i], duration: 1})
        }
        document.getElementById("match"+i).style.removeProperty("opacity");
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
    
    var dummyMatch = new Match(1234, 89, "DUO_SUPPORT", 0);
    matchList.pop();
    matchList.splice(0,0,dummyMatch);
}

function displayRankWidget()
{
    var queueObj = summoner.getQueueObj();
    $("#profile_name").show();
    document.getElementById("profile_name").innerHTML = summoner.summonerName;
    document.getElementById("profile_tier").innerHTML = queueObj.tier + " " + queueObj.rank;
    document.getElementById("profile_lp").innerHTML = "";
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
    else
    {
        document.getElementById("profile_lp").innerHTML = queueObj.leaguePoints + " LP";
    }
    document.getElementById("profile_winrate").innerHTML = queueObj.wins + "W - " + queueObj.losses + "L";

    document.getElementById("profile_rank").innerHTML = "";
    
    switch(queueObj.tier)
    {
        case "CHALLENGER":
            document.getElementById("profile_rank").innerHTML = "<img src='./img/CHALLENGER.png'>";
            break;
        case "GRANDMASTER":
            document.getElementById("profile_rank").innerHTML = "<img src='./img/GRANDMASTER.png'>";
            break;
        case "MASTER":
            document.getElementById("profile_rank").innerHTML = "<img src='./img/MASTER.png'>";
            break;
        case "DIAMOND":
            document.getElementById("profile_rank").innerHTML = "<img src='./img/DIAMOND.png'>";
            break;
    }
}

function turnOff()
{
    $("#profile_display").hide();
    $("#profile").hide();
    $("#queue0").hide();
    $("#queue1").hide();
    $("#widgets_main").hide();
    $("#queue_selection").hide();
    $("#load_area").hide();
    $("#confirm_btns").hide();
}

function clearPreview()
{
    document.getElementById("settings").innerHTML = '';
    $("#profile_name").hide();
    document.getElementById("profile_rank").innerHTML = '';
    document.getElementById("profile_name").innerHTML = '';
    document.getElementById("profile_tier").innerHTML = '';
    document.getElementById("profile_lp").innerHTML = '';
    document.getElementById("profile_series").innerHTML = '';
    document.getElementById("profile_winrate").innerHTML = '';
    
}

function addSetting(inputType, label, settingId, isChecked)
{
    switch(inputType.type)
    {
        case 'checkbox':
            var checked = "";
            if (isChecked)
                checked = "checked";
            $("#settings").append(
                '<div>' +
                '<input type="checkbox" style="margin:2px" name="setting_' + settingId + '" id="setting_' + settingId + '" ' + checked + '>' +
                '<label style="margin:2px" for="setting_'+settingId+'">' + label + '</label>' +
                '</div>'
            );
            break;
        case 'dropdown':
            $("#settings").append(
                '<div>' +
                '<select style="margin:2px" name="setting_' + settingId + '" id="setting_' + settingId + '"></select>' +
                '<label style="margin:2px" for="setting_'+ settingId+'">' + label + '</label>' +
                '</div>'
            );
            var dropdown = document.getElementById("setting_"+settingId);
            for (var i = 0; i < inputType.data.length; i++)
            {
                var option = document.createElement("option");
                option.text = inputType.data[i];
                option.id = "setting_" + settingId + inputType.data[i];
                dropdown.add(option);
            }
            break;
        case 'testBtn':
            $("#settings").append(
                '<div>' +
                '<div class="goBtn" id="setting_'+ settingId +'">'+ label +'</div>' +
                '</div>'
            );
            $("#setting_test").click(function(){
                reloadMatchHistory();
            });
            break;
    }
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
            document.getElementById("match"+match.localId).innerHTML = '<div class="match_pic"><img src="./img/match_history_win32.png"><div class="match_text">'+match.championName+'</div><div class="match_score">'+match.getScore()+'</div></div>';
        else
            document.getElementById("match"+match.localId).innerHTML = '<div class="match_pic"><img src="./img/match_history_loss32.png"><div class="match_text">'+match.championName+'</div><div class="match_score">'+match.getScore()+'</div></div>';
    })
    .fail(function (xhr, status, error) {
        document.getElementById("error_msg").innerHTML = "Error: Could not retrieve match statistics";
        turnOff();
    });
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

$(document).ready(init);