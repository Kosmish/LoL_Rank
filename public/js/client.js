const ip = "localhost";

var selectedUsername = "";
var esid = "";
var accid = "";
var matchesToDisplay = 4;
var selectedQueue = -1;
var selectedWidget = -1;
var selectedServer = 7;
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
const serverList = [
    "BR", "EUNE", "EUW", "JP", "KR", "LAN", "LAS", "NA", "OCE", "TR", "RU"
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
    loadServers();
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
        changeURLBox("");
    });

    $("#continueBtn").click(function(){
        $("#confirm_btns").hide();
        $("#profile_display").hide();
    });

    $("#copy_btn").click(function(){
        url = document.getElementById("url_bar");
        url.select();
        document.execCommand("copy");
    });

    $("#setting_test").click(function(){
        reloadMatchHistory();
    });
}

function loadChampions()
{
    $.ajax({
        type: 'POST',
        url: ip,
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

function loadServers()
{
    var dropdown = document.getElementById("serverDropdown");
    for (var i = 0; i < serverList.length; i++)
    {
        var option = document.createElement("option");
        option.text = serverList[i];
        option.className = "server_" + serverList[i];
        option.id = "server_" + serverList[i];
        option.value = serverList[i];
        dropdown.add(option);
        dropdown.value = serverList[selectedServer];
    }
    document.getElementById("serverDropdown").setAttribute('onchange','changeServer()');
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
        url: ip,
        port: 5000,
        dataType: "json",
        contentType: 'application/json',
        headers: { esid : esid, query : true, server : selectedServer }
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
            var data = [];
            for (var i in champions)
            {
                data.push(champions[i].name);
            }
            addSetting({type:'dropdown', data}, "Champion", "champion", false);
            document.getElementById("setting_champion").setAttribute('onchange','changeChampion();');
            changeURLBox("/mastery.html?username="+selectedUsername+"&server=" + selectedServer + "&champion="+champions[0].name);
            displayChampionMasteryWidget();
            break;
        case 1:
            changeURLBox("/rank.html?username="+selectedUsername+ "&server=" + selectedServer + "&queue="+queues[selectedQueue]);
            addSetting({type:'checkbox'}, "Show Rank Emblem", "rank", true);
            addSetting({type:'checkbox'}, "Show Username", "name", true);
            addSetting({type:'checkbox'}, "Show Tier", "tier", true);
            addSetting({type:'checkbox'}, "Show LP/Promos", "lp", true);
            addSetting({type:'checkbox'}, "Show Win/Loss", "winrate", true);
            addSetting({type:'checkbox'}, "Horizontal Display", "horizontal", false);
            displayRankWidget();
            break;
        case 2:
            var data = [1,2,3,4,5,6,7,8];
            addSetting({type:'checkbox'}, "Ranked Only", "rankedonly", true);
            addSetting({type:'dropdown', data}, "# of Matches", "nummatches", false);
            addSetting({type:'testBtn'}, "Test", "test", false);
            displayMatchHistoryWidget();
            break;
        case 3:

            displayGhostShieldWidget()
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

function displayChampionMasteryWidget()
{
    var selectedChampion = document.getElementById("setting_champion").value;
    var selectedChampionId;

    for (var i = 0; i < champions.length; i++)
    {
        if (champions[i].name == selectedChampion)
        {
            selectedChampionId = champions[i].key;
            break;
        }
    }

    $.ajax({
        type: 'POST',
        url: ip,
        port: 5000,
        dataType: "json",
        contentType: 'application/json',
        headers: { championid : selectedChampionId, summonerid : esid, query : 'mastery', server : selectedServer }
    })
    .done(function (data) {
        if (data.length == 0)
        {
            document.getElementById("profile").innerHTML = "Error: Summoner has no champion information";
        }
        else
        {
            document.getElementById("profile_rank").style.paddingBottom = '50px';
            document.getElementById("profile_rank").innerHTML = "<div style='position: relative;'><img src='./img/tiles/"+ selectedChampion +"_0.jpg' class='pic'><div style='position: absolute; top: -10; left: -14;'><img src='./img/mastery_full.png'></div></div><div style='position: relative; top: 50; background: linear-gradient(0deg, rgba(2,0,26,0.5) 0%, rgba(27,46,82,0.5) 100%); border-radius: 4px; padding: 5px; color: #ffffff; box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25); border: 1px #051326 solid;'>" + numberWithCommas(data['championPoints']) +"</div>";
        }
    })
    .fail(function (xhr, status, error) {
        document.getElementById("profile_rank").style.paddingBottom = '50px';
        document.getElementById("profile_rank").innerHTML = "<div style='position: relative;'><img src='./img/tiles/"+ selectedChampion +"_0.jpg' class='pic'><div style='position: absolute; top: -10; left: -14;'><img src='./img/mastery_full.png'></div></div><div style='position: relative; top: 50; background: linear-gradient(0deg, rgba(2,0,26,0.5) 0%, rgba(27,46,82,0.5) 100%); border-radius: 4px; padding: 5px; color: #ffffff; box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25); border: 1px #051326 solid;'>0</div>";
    })
}

function displayMatchHistoryWidget()
{
    $("#profile_rank").show();
    $("#setting_nummatches").val(4);
    $.ajax({
        type: 'POST',
        url: ip,
        port: 5000,
        dataType: "json",
        contentType: 'application/json',
        headers: { accid : accid, query : 'matchhistory', endIndex : matchesToDisplay, server : selectedServer }
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

        var nummatches = 4;
        var rankedonly = true;

        var updatedURL = "/matches.html?username="+selectedUsername+ "&server=" + selectedServer + "&nummatches="+nummatches+"&rankedonly=" + rankedonly;
        changeURLBox(updatedURL);

        $(".checkBox").click(function(){
            var settingId = $(this).attr('id');
            settingId = settingId.slice(8);
            var isChecked = document.getElementById("setting_"+settingId).checked;
            if (isChecked)
                $("#profile_"+settingId).show();
            else
                $("#profile_"+settingId).hide();
    
            if (!document.getElementById("setting_rankedonly").checked)
            {
                updatedURL = "/matches.html?username="+selectedUsername+ "&server=" + selectedServer + "&nummatches="+nummatches+"&rankedonly=false";
                changeURLBox(updatedURL);
                rankedonly = false;
            }
            else
            {
                updatedURL = "/matches.html?username="+selectedUsername+ "&server=" + selectedServer + "&nummatches="+nummatches+"&rankedonly=true";
                changeURLBox(updatedURL);
                rankedonly = true;
            }
            
            document.getElementById("continue").href = updatedURL;
            changeURLBox(updatedURL);
        });
        document.getElementById("setting_nummatches").onchange = function(){
            nummatches = document.getElementById("setting_nummatches").value;
            updatedURL = "/matches.html?username="+selectedUsername+ "&server=" + selectedServer + "&nummatches="+nummatches+"&rankedonly="+rankedonly;
            changeURLBox(updatedURL);
            document.getElementById("continue").href = updatedURL;
        }

        document.getElementById("continue").href = updatedURL;
        changeURLBox(updatedURL);

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
    $("#profile_rank").show();
    $("#profile_name").show();
    $("#profile_tier").show();
    $("#profile_lp").show();
    $("#profile_winrate").show();
    document.getElementById("profile_name").innerHTML = summoner.summonerName;
    document.getElementById("profile_tier").innerHTML = queueObj.tier + " " + queueObj.rank;
    document.getElementById("profile_lp").innerHTML = "";
    
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
        document.getElementById("profile_lp").innerHTML = ms;
    }
    else
    {
        document.getElementById("profile_lp").innerHTML = queueObj.leaguePoints + " LP";
    }
    document.getElementById("profile_winrate").innerHTML = queueObj.wins + "W - " + queueObj.losses + "L";

    document.getElementById("profile_rank").innerHTML = "";
    
    document.getElementById("profile_rank").innerHTML = "<img src='./img/" + queueObj.tier + ".png'>";

    $(".checkBox").click(function(){
        var settingId = $(this).attr('id');
        settingId = settingId.slice(8);
        var isChecked = document.getElementById("setting_"+settingId).checked;
        if (isChecked)
            $("#profile_"+settingId).show();
        else
            $("#profile_"+settingId).hide();

        var updatedURL = "/rank.html?username=" + selectedUsername + "&server=" + selectedServer + "&queue=" + queues[selectedQueue];
        if (!document.getElementById("setting_rank").checked)
            updatedURL += "&rank=false";
        if (!document.getElementById("setting_name").checked)
            updatedURL += "&name=false";
        if (!document.getElementById("setting_tier").checked)
            updatedURL += "&tier=false";
        if (!document.getElementById("setting_lp").checked)
            updatedURL += "&lp=false";
        if (!document.getElementById("setting_winrate").checked)
            updatedURL += "&winrate=false";
        if (!document.getElementById("setting_horizontal").checked)
        {
            $("#profile_box").css("flex-direction", "column");
            $("#profile_box").css("font-size", "12pt");
            $("#profile_info").css("margin-left", "0px");
            updatedURL += "&layout=false";
        }
        else
        {
            $("#profile_box").css("flex-direction", "row");
            $("#profile_box").css("font-size", "14pt");
            $("#profile_info").css("margin-left", "10px");
            updatedURL += "&layout=true";
        }
        
        document.getElementById("continue").href = updatedURL;
        changeURLBox(updatedURL);
    });
}

function displayGhostShieldWidget()
{
    $("#profile_rank").show();
    var updatedURL = "/shield.html?username=" + selectedUsername + "&server=" + selectedServer;
    changeURLBox(updatedURL);
    document.getElementById("profile_rank").innerHTML = '<img src="./img/summoners_rift.png">';
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
    document.getElementById("profile_rank").style.paddingBottom = '0px';
    document.getElementById("settings").innerHTML = '';
    $("#profile_name").hide();
    document.getElementById("profile_rank").innerHTML = '';
    document.getElementById("profile_name").innerHTML = '';
    document.getElementById("profile_tier").innerHTML = '';
    document.getElementById("profile_lp").innerHTML = '';
    document.getElementById("profile_winrate").innerHTML = '';
    $("#profile_box").css("flex-direction", "column");
    $("#profile_box").css("font-size", "12pt");
    $("#profile_info").css("margin-left", "0px");
    rot = 0;
    ys = [];
    ysr = [];
}

function numberWithCommas(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
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
                '<input type="checkbox" style="margin:2px" class="checkBox" name="setting_' + settingId + '" id="setting_' + settingId + '" ' + checked + '>' +
                '<label style="margin:2px" for="setting_'+settingId+'">' + label + '</label>' +
                '</div>'
            );
            break;
        case 'dropdown':
            $("#settings").append(
                '<div>' +
                '<label style="margin:2px 5px 2px 2px" for="setting_'+ settingId+'">' + label + '</label>' +
                '<select style="margin:2px" class="dropdownBox" name="setting_' + settingId + '" id="setting_' + settingId + '"></select>' +
                '</div>'
            );
            var dropdown = document.getElementById("setting_"+settingId);
            for (var i = 0; i < inputType.data.length; i++)
            {
                var option = document.createElement("option");
                option.text = inputType.data[i];
                option.className = "setting_" + settingId;
                option.id = "setting_" + settingId + inputType.data[i];
                option.value = inputType.data[i];
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

function changeChampion()
{
    var champion = document.getElementById("setting_champion").value;
    var url = "/mastery.html?username=" + selectedUsername + "&server=" + selectedServer + "&champion=" + champion;
    document.getElementById("continue").href = url;
    changeURLBox(url);
    displayChampionMasteryWidget();
}

function changeServer()
{
    dropdown = document.getElementById("serverDropdown");
    for (var i = 0; i < serverList.length; i++)
    {
        if (serverList[i] == dropdown.value)
        {
            selectedServer = i;
            break;
        }
    }
}

function loadStats(match)
{
    $.ajax({
        type: 'POST',
        url: ip,
        port: 5000,
        dataType: "json",
        contentType: 'application/json',
        headers: { gameid : match.gameId, query : 'matchstats', server : selectedServer }
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

function changeURLBox(url)
{
    document.getElementById("continue").href = url;
    document.getElementById("url_bar").value = "https://www.lolstreamer.com" + url;
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