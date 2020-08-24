Vue.config.devtools = true;
var app = new Vue(
  {
    el: '#app',
    data: {
      input: "",
      searchDone: false,
      movies: [],
      series: []
    },
    methods: {
      search() {
        this.movies = [];
        this.series = [];
        this.searchDone = false;
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
          This.searchDone = true;
          for (var i = 0; i < response.data.results.length; i++) {
            var newShow = {
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
            This.sortShowsbyPopularity(string, newShow);
          }
        })
      },
      getGenre() {

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
      }
    },
    mounted() {

    }

  })


// $(document).ready(function() {
//   var movieContainer = $(".movie.container");
//   var seriesContainer = $(".tvseries.container");
//
//   $(document).on("click", "#search", function() {
//     var ricerca = $("#input").val();
//     sendRequestToServer(ricerca, movieContainer, "movie");
//     sendRequestToServer(ricerca, seriesContainer, "tv");
//     $("#input").val("");
//   });
//   $("#input").keyup(function(event) {
//     if (event.which == 13) {
//       var ricerca = $("#input").val();
//       sendRequestToServer(ricerca, movieContainer, "movie");
//       sendRequestToServer(ricerca, seriesContainer, "tv");
//       $("#input").val("");
//     }
//   });
//   $("#input").on("focus", function() {
//     $(this).attr("placeholder", "");
//   });
//   $("#input").on("blur", function() {
//     $(this).attr("placeholder", "Inserisci un titolo");
//   });
//   $("#movie-select").on("change", function() {
//     filtraPerGenere(".movie.container", "#movie-select");
//   })
//   $("#tv-select").on("change", function() {
//     filtraPerGenere(".tvseries.container", "#tv-select");
//   })
// });
//
// // CHIEDI ALL'API LA LISTA DEI FILM
// function sendRequestToServer(ricerca, container, string) {
//   if ($("#input").val() != "") {
//     container.html("");
//     $("#movie-select").html('<option value="">Tutti i generi</option>');
//     $("#tv-select").html('<option value="">Tutti i generi</option>');
//     generiFilm = [];
//     generiTv = [];
//     $("#cercato > span").text(ricerca);
//     $("#cercato").removeClass("hidden");
//     $.ajax({
//       url: "https://api.themoviedb.org/3/search/" + string,
//       method: "GET",
//       data: {
//         api_key: "b1d8c49e5a444b10f55f930d8f4ed091",
//         query: ricerca,
//         language: "it-IT"
//       },
//       success: function(risposta) {
//         $("h2.movie-title").removeClass("hidden");
//         $("h2.tvseries-title").removeClass("hidden");
//         if (risposta.total_results > 0) {
//           stampa(risposta.results, container, string);
//           $("#" + string + "-select").removeClass("hidden");
//         } else {
//           container.append("La ricerca non ha prodotto alcun risultato!");
//           $("#" + string + "-select").addClass("hidden");
//         }
//       },
//       error: function functionName() {
//       }
//     })
//   }
// }
//
// // STAMPA TRAMITE HANDLEBARS LA LISTA DI FILM
// function stampa(listaOggetti, container, string) {
//   var source = $("#entry-template").html();
//   var template = Handlebars.compile(source);
//   for (var key in listaOggetti) {
//     var context = {
//       id: listaOggetti[key].id,
//       poster: listaOggetti[key].poster_path,
//       title: listaOggetti[key].title,
//       name: listaOggetti[key].name,
//       originalTitle: listaOggetti[key].original_title,
//       originalName: listaOggetti[key].original_name,
//       language: listaOggetti[key].original_language,
//       stars: printStars(listaOggetti[key].vote_average),
//       trama: listaOggetti[key].overview,
//     };
//     if (string == "movie") {
//       context.releaseYear = moment(listaOggetti[key].release_date, "YYYY-MM-DD").format("YYYY");
//     } else {
//       context.releaseYear = moment(listaOggetti[key].first_air_date, "YYYY-MM-DD").format("YYYY");
//     }
//     if (context.trama == "") {
//       context.trama = "Non disponibile";
//     }
//     var html = template(context);
//     container.append(html);
//     getActors(listaOggetti[key].id, string);
//     getGenres(listaOggetti[key].id, string);
//   }
// }
//
// // TRASFORMA IL VOTO IN STELLE
// function printStars(voto) {
//   var starsNumber = Math.ceil(voto / 2);
//   var stars = "";
//   for (var i = 1; i <= starsNumber; i++) {
//     stars += '&#9733;'
//   }
//   for (var i = 5; i > starsNumber; i--) {
//     stars += '&#9734;'
//   }
//   return stars;
// }
//
// // PRENDI E STAMPA LA LISTA ATTORI DALL'API RELATIVA
// function getActors(id, string) {
//   var listaAttori = "";
//   $.ajax({
//     url: "https://api.themoviedb.org/3/"+ string + "/" + id + "/credits",
//     method: "GET",
//     data: {
//       api_key: "b1d8c49e5a444b10f55f930d8f4ed091"
//     },
//     success: function(risposta) {
//       if (risposta.cast != "") {
//         for (var i = 0; i < 5; i++) {
//           if (risposta.cast[i] != undefined) {
//             listaAttori += risposta.cast[i].name + ", ";
//           }
//         }
//         listaAttori = listaAttori.slice(0, listaAttori.length-2);
//       } else {
//         listaAttori = "Non disponibile";
//       }
//       $("#" + id).find(".cast").append(listaAttori);
//     },
//     error: function functionName() {
//     }
//   })
// }
//
// // PRENDI LA LISTA GENERI DALL'API RELATIVA
// function getGenres(id, string) {
//   var generi = "";
//   $.ajax({
//     url: "https://api.themoviedb.org/3/"+ string + "/" + id,
//     method: "GET",
//     data: {
//       api_key: "b1d8c49e5a444b10f55f930d8f4ed091"
//     },
//     success: function(risposta) {
//       if (risposta.genres != "") {
//         for (var key in risposta.genres) {
//           generi += risposta.genres[key].name + ", ";
//           if (string == "movie") {
//             if (!generiFilm.includes(risposta.genres[key].name)) {
//               generiFilm.push(risposta.genres[key].name);
//               printGenresinSelect("movie-select", risposta.genres[key].name);
//             }
//           } else {
//             if (!generiTv.includes(risposta.genres[key].name)) {
//               generiTv.push(risposta.genres[key].name);
//               printGenresinSelect("tv-select", risposta.genres[key].name);
//             }
//           }
//         }
//         generi = generi.slice(0, generi.length-2);
//       } else {
//         generi = "Non disponibile";
//       }
//       $("#" + id).find(".generi").append(generi);
//     },
//     error: function functionName() {
//     }
//   })
// }
//
// // AGGIUNGI UN NUOVO GENERE AL SELECT
// function printGenresinSelect(string, name) {
//   var source = $("#entry-template-2").html();
//   var template = Handlebars.compile(source);
//   var context = {
//       genere: name
//   };
//   var html = template(context);
//   $("#" + string).append(html);
// }
//
// // MOSTRA SOLO FILM CHE HANNO QUEL GENERE
// function filtraPerGenere(string, select) {
//   var choice = $(select).val();
//   $(string).children(".show").each(function() {
//     if ($(this).find(".generi").text().includes(choice)) {
//       $(this).show();
//     } else {
//       $(this).hide();
//     }
//   });
// }
