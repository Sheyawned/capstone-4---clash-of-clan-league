// create a website get the current info of my current league of the player, info of that league during the season eg trophies, ranking, hit rate, defense rate

import "dotenv/config";
import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
const port = 3000;
// Tag: #QG9P2PLRR

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));

const yourBearerToken = process.env.COC_TOKEN;
const config = {
  headers: { Authorization: `Bearer ${yourBearerToken}` },
};

// render the page
app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.post("/player", async (req, res) => {
  // render a new page to display all the details
  try {
    // get player tag
    const playerTag = req.body.id.slice(1);
    //push playerTag to COC for the player's data
    const playerResult = await axios.get(
      "https://api.clashofclans.com/v1/players/%23" + playerTag,
      config,
    );

    //Get basic data from the API
    const username = playerResult.data.name;
    const currentGroupTag = playerResult.data.currentLeagueGroupTag;
    const currentSeason = playerResult.data.currentLeagueSeasonId;
    const trophies = playerResult.data.trophies;

    // get the league data from COC API
    const leagueResult = await axios.get(
      `https://api.clashofclans.com/v1/leaguegroup/%23${currentGroupTag.slice(1)}/${currentSeason}?playerTag=%23${playerTag}`,
      config,
    );

    // calculations current ranking and amount of attack left:
    let attackleft = 0;
    const currentLeague = playerResult.data.leagueTier.name;
    let currentRanking = 0;

    for (let i = 0; i < leagueResult.data.members.length; i++) {
      if (leagueResult.data.members[i].playerTag.slice(1) == playerTag) {
        currentRanking = i + 1;
        attackleft =
          18 -
          (leagueResult.data.members[i].attackWinCount +
            leagueResult.data.members[i].attackLoseCount); //update amount of attack base on the league
        break;
      }
    }

    // calculate potential ranking
    const potentialTrophies = attackleft * 40 + trophies;
    let potentialRanking = currentRanking;

    for (let i = 0; i < leagueResult.data.members.length; i++) {
      if (potentialTrophies > leagueResult.data.members[i].leagueTrophies) {
        potentialRanking = i + 1;
        break;
      }
    }

    res.render(`index.ejs`, {
      playerTag: playerTag,
      username: username,
      trophies: trophies,
      currentLeague: currentLeague,
      currentRanking: currentRanking,
      potentialRanking: potentialRanking,
      potentialTrophies: potentialTrophies,
    });
  } catch (error) {
    res.render("index.ejs", {
      error: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running at port ${port}`);
});
