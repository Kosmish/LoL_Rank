class Summoner
{
    constructor(name, tier, rank, leaguePoints, miniSeries)
    {
        this.summoner_name = name;
        this.tier = tier;
        this.rank = rank;
        this.leaguePoints = leaguePoints;
        this.miniSeries = miniSeries; 
    }

    displayRank()
    {
        $("#rankText").html(this.tier);
        $("#lpText").html(this.leaguePoints + " LP");

        var promoSeries = document.getElementById("promoSeries");
        if (this.leaguePoints == 100)
        {
            promoSeries.style.display = "flex";
            if (this.division == 1)
            {
                $("#promo1").html("<img src='img/promos1.png' alt=''>");
                $("#promo2").html("<img src='img/promos1.png' alt=''>");
                $("#promo3").html("<img src='img/promos1.png' alt=''>");
                $("#promo4").html("<img src='img/promos1.png' alt=''>");
                $("#promo5").html("<img src='img/promos1.png' alt=''>");
            }
            else
            {
                $("#promo1").html("<img src='img/promos1.png' alt=''>");
                $("#promo1").html("<img src='img/promos1.png' alt=''>");
                $("#promo1").html("<img src='img/promos1.png' alt=''>");
            }
        }
        else
        {
            promoSeries.style.display = "none";
        }
    }
}

function getRank()
{
    var summoner_name = "Lovelightz";
    var encrypted_summoner_id;

    let endpoint1 = 'https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/' + summoner_name;
    let apiKey = 'RGAPI-04a49ddf-30bc-4b25-a0e3-3a9fb9eec5c6';
    
    var tier;
    var rank;
    var leaguePoints;
    var miniSeries;

    $.ajax({
        url: endpoint1 + "?api_key=" + apiKey,
        contentType: "application/json",
        dataType: 'json',
        success: function(result){
            encrypted_summoner_id = result.id;
        }
    });

    let endpoint2 = 'https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/' + encrypted_summoner_id;

    $.ajax({
        url: endpoint2 + "?api_key=" + apiKey,
        contentType: "application/json",
        dataType: 'json',
        success: function(result){
            tier = result.tier;
            rank = result.rank;
            leaguePoints = result.leaguePoints;
            miniSeries = result.miniSeries;
        }
    });
    
    //var summoner = new Summoner(summoner_name, tier, rank, leaguePoints, miniSeries);
    var summoner = new Summoner(summoner_name, "Diamond", 1, 100, miniSeries);
    summoner.displayRank();
}

$(document).ready(getRank);