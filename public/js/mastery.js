const ip = "localhost";

var selectedUsername = "";
var selectedChampion = "";
var selectedChampionId = "";
var esid = "";

var currentPoints;

function getParams()
{
    $.ajax({
        type: 'POST',
        headers: {query : true}
    })
    .done(function (data) {
        selectedUsername = data['username'];
        selectedChampion = data['champion'];
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
        headers: { username : selectedUsername, query : true }
    })
    .done(function (data) {
        if (data['id'] != "")
        {
            selectedUsername = data['name'];
            document.getElementById("page_title").innerHTML = selectedUsername + " | LoL Streamer";
            esid = data['id'];
            getChampId();
        }
        else
            console.log("Error: Summoner does not exist");
    })
    .fail(function (xhr, status, error) {
        console.log('Error [checkName]: ' + error.message);
    })
}

function getChampId()
{
    $.ajax({
        type: 'POST',
        url: ip,
        port: '5000',
        dataType: "json",
        contentType: 'application/json',
        headers: { champion : selectedChampion, query : 'getchampionid'}
    })
    .done(function (data) {
        selectedChampionId = data['data'][selectedChampion]['key'];
        retrieveStats();
    })
    .fail(function (xhr, status, error) {
        document.getElementById("profile").innerHTML = "Error: Invalid Champion Mastery Request";
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
        headers: { championid : selectedChampionId, summonerid : esid, query : 'mastery' }
    })
    .done(function (data) {
        if (data.length == 0)
        {
            document.getElementById("profile").innerHTML = "Error: Summoner has no champion information";
        }
        else
        {
            if (currentPoints)
            {
                incrementLp(data['championPoints']);
            }
            else
            {
                currentPoints = data['championPoints'];
            }
            document.getElementById("profile").innerHTML = "<div style='position: relative;'><img src='./img/tiles/"+selectedChampion+"_0.jpg' class='pic'><div style='position: absolute; top: -10; left: -14;'><img src='./img/mastery_full.png'></div></div><div id='points' class='whiteText' style='position: relative; top: 50;background-color: rgba(27, 46, 82, 0.5); border-radius: 4px; padding: 5px; color: #ffffff; box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);'>" + numberWithCommas(data['championPoints']) +"</div>";
        }
        setTimeout(retrieveStats, 300000);
    })
    .fail(function (xhr, status, error) {
        document.getElementById("profile").innerHTML = "Error: Invalid Champion Mastery Request";
    })
}
function test(x)
{
    incrementLp(currentPoints+x);
}
function incrementLp(num)
{
    document.getElementById("points").className = "greenText";
    if (currentPoints < num)
    {
        currentPoints++;
        $("#points").html(numberWithCommas(currentPoints));
        setTimeout(function(){incrementLp(num)}, 0);
        document.getElementById("points").className = "whiteText";
    }
}
function numberWithCommas(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

$(document).ready(getParams);