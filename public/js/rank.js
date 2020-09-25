var selectedUsername = ""; //grab username from URL
var selectedQueue = ""; //ex: "solo"

const queues = [
    "RANKED_SOLO_5x5",
    "RANKED_FLEX_SR"
];

function handleFileSelect(evt) {
    var file = evt.target.files[0]; // File inputs are an array - get the first element
    var reader = new FileReader();
  
    reader.onload = function(e) {
      // Render the supplied file
      document.getElementById('displayHtml').value = e.target.result
      document.getElementById('displayPage').innerHTML = e.target.result;
    };
  
    // Read in the HTML file.
    reader.readAsText(file);
  };
  
  document.getElementById('fileInput').addEventListener('change', handleFileSelect, false);

function getParams()
{
    $.ajax({
        type: 'POST',
    })
    .done(function (data) {
        console.log("Json call success");
        console.log(data);
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
            retrieveStats(data['id']);
        else
            console.log("Error: Summoner does not exist");
    })
    .fail(function (xhr, status, error) {
        console.log('Error: ' + error.message);
    })
}

function retrieveStats(esid)
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
            document.getElementById("profile_tier").innerHTML = data[i]['tier'] + " " + data[i]['rank'];
            document.getElementById("profile_lp").innerHTML = data[i]['leaguePoints'] + " LP";
            if (data[i]['miniSeries'])
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
            document.getElementById("profile_winrate").innerHTML = data[i]['wins'] + "W - " + data[i]['losses'] + "L";
        }
    })
    .fail(function (xhr, status, error) {
        console.log('Error: ' + error.message);
    })
}

$(document).ready(getParams);