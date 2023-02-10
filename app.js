const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movie_id: dbObject.movie_id,
    director_id: dbObject.director_id,
    movie_name: dbObject.movie_name,
    lead_actor: dbObject.lead_actor,
  };
};
const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT
      *
    FROM
      Movie
    ORDER BY
      movie_id;`;
  const moviesArray = await db.all(getMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => convertDbObjectToResponseObject(eachMovie))
  );
});
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT
      *
    FROM
      Movie
    WHERE
      movie_id = ${movieId};`;
  const movie = await db.get(getMovieQuery);
  response.send(movie);
});
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { director_id, movie_name, lead_actor } = movieDetails;
  const addMoviesQuery = `
    INSERT INTO
      Movie (director_id, movie_name, lead_actor)
    VALUES
      (
        ${director_id},
         '${movie_name}',
         '${lead_actor}'
      );`;

  const dbResponse = await db.run(addMoviesQuery);
  const movie_id = dbResponse.lastID;
  response.send("Movie Successfully Added");
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { director_id, movie_name, lead_actor } = movieDetails;
  const updateMovieQuery = `
    UPDATE
      movie
    SET
      director_id=${director_id},
      movie_name='${movie_name}',
      lead_actor='${lead_actor}'
    WHERE
      movie_id = ${movieId};`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM
      Movie
    WHERE
      movie_id = ${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT
      *
    FROM
      Director
    ORDER BY
      director_id;`;
  const DirectorArray = await db.all(getDirectorsQuery);
  response.send(DirectorArray);
});
app.get("/directors/:directorId/movies/", async (request, response) => {
  const getSpecificDirectorQuery = `
    SELECT
      *
    FROM
      Movie
    ORDER BY
      movie_id;`;
  const specificArray = await db.all(getSpecificDirectorQuery);
  response.send(specificArray);
});
module.exports = app;
