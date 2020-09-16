class Summoner {
    constructor(summonerName) {
        this.summonerName = summonerName;
        this.summonerId = "";
        this.tier = "";
        this.rank = "";
        this.leaguePoints;
        this.wins = 0;
        this.losses = 0;
        this.miniSeries = false;
        this.target = 0;
        this.seriesWins = 0;
        this.seriesLosses = 0;
        this.progress = "NNN";
    }
    displayRank()
    {
        console.log(this.summonerName + " (" + this.summonerId + ")");
        console.log("Rank: " + this.tier + " " + this.rank + " - " + this.leaguePoints + "LP (" + this.wins + "W - " + this.losses + "L)");
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
            console.log("Mini Series: " + s);
        }
    }
}

module.exports = Summoner;