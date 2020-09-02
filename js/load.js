class Summoner
{
    constructor(name, tier, division, lp, promoGames)
    {
        this.summoner_name = name;
        this.tier = tier;
        this.division = division;
        this.lp = lp;
        this.promoGames = promoGames; 
    }

    displayRank()
    {
        $("#rankText").html(this.tier);
        $("#lpText").html(this.lp + " LP");

        var promoSeries = document.getElementById("promoSeries");
        if (this.lp == 100)
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
    //call api for streamer stats
    var summoner = new Summoner("Spokane", "Gold", 1, 99, [1,1,2,0,0]);
    summoner.displayRank();
}

$(document).ready(getRank);