Vue.config.devtools = true;
var app = new Vue(
  {
    el: '#app',
    data: {
      input: "",
      titleSearched: null,
      movies: [],
      series: [],
      genres: ["All"],
    },
    methods: {
      reset() {
        this.movies = [];
        this.series = [];
        this.genres = ["All"];
        this.titleSearched = this.input;
      },
      search() {
        this.reset();
        this.sendRequestToServer("movie");
        this.sendRequestToServer("tv");
        this.input = "";
      },
      sendRequestToServer(string) {
        var This = this;
        axios.get("https://api.themoviedb.org/3/search/" + string, {
          params: {
            api_key: "b1d8c49e5a444b10f55f930d8f4ed091",
            query: this.input,
            language: "it-IT"
          }
        })
        .then(function(response) {
          console.log(response.data.results);
          for (var i = 0; i < response.data.results.length; i++) {
            var newShow = {
              visible: true,
              title: response.data.results[i].title,
              originalTitle: response.data.results[i].original_title,
              originalName: response.data.results[i].original_name,
              releaseYear: moment(response.data.results[i].release_date, "YYYY-MM-DD").format("DD-MM-YYYY"),
              poster: response.data.results[i].poster_path,
              stars: This.printStars(response.data.results[i].vote_average),
              plot: response.data.results[i].overview,
              language: response.data.results[i].original_language,
              popularity: response.data.results[i].popularity,
              id: response.data.results[i].id,
            };
            if (newShow.releaseYear == "Invalid date") {
              newShow.releaseYear = "";
            }
            This.getCast(string, newShow);
            // This.getGenre(string, newShow.id);
          }
        })
        .catch(function(error) {
          console.log(error);
        })
      },
      getCast(string, newShow) {
        var This = this;
        var mainCast = "";
        axios.get("https://api.themoviedb.org/3/"+ string + "/" + newShow.id + "/credits", {
          params: {
            api_key: "b1d8c49e5a444b10f55f930d8f4ed091",
          }
        })
        .then(function(response) {
          if (response.data.cast != "") {
            for (var i = 0; i < 5; i++) {
              if (response.data.cast[i] != undefined) {
                mainCast += response.data.cast[i].name + ", ";
              }
            }
            newShow.cast = mainCast.slice(0, mainCast.length-2);
            This.getGenre(string, newShow)
          }
        })
      },
      getGenre(string, newShow) {
        var This = this;
        var generi = "";
        axios.get("https://api.themoviedb.org/3/"+ string + "/" + newShow.id, {
          params: {
            api_key: "b1d8c49e5a444b10f55f930d8f4ed091",
          }
        })
        .then(function(response) {
          if (response.data.genres != "") {
            for (var key in response.data.genres) {
              generi += response.data.genres[key].name + ", ";
              if (!This.genres.includes(response.data.genres[key].name)) {
                This.genres.push(response.data.genres[key].name);
              }
            }
            newShow.genres = generi.slice(0, generi.length-2);
          }
          This.sortShowsbyPopularity(string, newShow);
        })
      },
      sortShowsbyPopularity(string, newShow) {
        var i = 0;
        var trovato = false;
        if (string == "movie") {
          do {
            if (this.movies.length == 0 || newShow.popularity > this.movies[i].popularity) {
              this.movies.splice(i, 0, newShow);
              trovato = true;
            }
            i++;
          } while (i < this.movies.length && trovato == false);
          if (trovato == false) {
            this.movies.push(newShow);
          }
        } else {
          do {
            if (this.series.length == 0 || newShow.popularity > this.series[i].popularity) {
              this.series.splice(i, 0, newShow);
              trovato = true;
            }
            i++;
          } while (i < this.series.length && trovato == false);
          if (trovato == false) {
            this.series.push(newShow);
          }
        }
      },
      printStars(vote) {
        var starsNumber = Math.ceil(vote / 2);
        var stars = "";
        if (vote != 0) {
          for (var i = 1; i <= starsNumber; i++) {
            stars += '&#9733;'
          }
          for (var i = 5; i > starsNumber; i--) {
            stars += '&#9734;'
          }
        }
        return stars;
      },
      GenreFilter(event) {
        for (var i = 0; i < this.movies.length; i++) {
          if ((this.movies[i].genres && this.movies[i].genres.includes(event.target.value)) || event.target.value == "All") {
            this.movies[i].visible = true;
          } else {
            this.movies[i].visible = false;
          }
        }
        for (var i = 0; i < this.series.length; i++) {
          if ((this.series[i].genres && this.series[i].genres.includes(event.target.value)) || event.target.value == "All") {
            this.series[i].visible = true;
          } else {
            this.series[i].visible = false;
          }
        }
      },
    },
    mounted() {

    }
  })
