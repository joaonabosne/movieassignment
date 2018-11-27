
let tibu0004 = (function() {
/* globals APIKEY */


const movieDataBaseURL = "https://api.themoviedb.org/3/";
let imageURL = null;
let imageSizes = [];
let searchString = "";
let bck = 0;

let timeKey = "timeKey";
let staleDataTimeOut = 3600; // 30 seconds, good for testing


document.addEventListener("DOMContentLoaded", init);



function init() {
    //console.log(APIKEY);
    addEventListeners();
    getDataFromLocalStorage();

    ////make the modal window////
    document.querySelector("#modalButton").addEventListener("click", showOverlay);
    document.querySelector(".cancelButton").addEventListener("click", hideOverlay);

    document.querySelector(".saveButton").addEventListener("click", function (e) {
        let movieList = document.getElementsByName("movies");
        let movieType = null;
        for (let i = 0; i < movieList.length; i++) {
            if (movieList[i].checked) {
                movieType = movieList[i].value;
                break;
            }
        }
        alert(movieType);
        console.log("You picked " + movieType)
        hideOverlay(e);
    });
    ////make the modal window////
    
    let h1 = document.createElement("h1");
    h1.innerHTML = `Movie Recommendation`;
    document.querySelector("header").appendChild(h1);
}





function addEventListeners() {

    let searchButton = document.querySelector(".searchButtonDiv");
    searchButton.addEventListener("click", startSearch);

    let searchinput = document.getElementById("search-input");
    searchinput.addEventListener("keyup", function (event) {
        event.preventDefault();
        if (event.keyCode === 13) {
            startSearch();
        }
    });



}

let goBackBtn = document.querySelector(".backButton");
goBackBtn.addEventListener("click", function () {
    document.getElementById("recommend-results").classList.remove("show");
    console.log(bck);
    if (bck == 1) {
        bck = 0;
        document.getElementById("search-input").value = "";
        searchString = "";
        var searchResults = document.getElementById("search-results");
        while (searchResults.firstChild) {
            searchResults.removeChild(searchResults.firstChild);
        }
        location.reload();
    } else {
        getSearchResults();
        bck = 1;
    }
});

function getDataFromLocalStorage() {
    // check if image secure base url and sizes array are saved in Local Storage, if not call "getPosterURLAndSizes()"


    //if in Local Storage check if saved over 60 minutes ago, if true call "getPosterURLAndSizes()"

    //in Local Storage AND < 60 min old, load and use from local storage

    if (localStorage.getItem(timeKey)) {
        console.log("Retrieving Saved Date from Local Storage");
        let savedDate = localStorage.getItem(timeKey);
        savedDate = new Date(savedDate);
        console.log(savedDate);

        let seconds = calculateElapsedTime(savedDate);
        if (seconds > staleDataTimeOut) {
            console.log("Local Storage Data is stale");
            getPosterURLAndSizes();
        }
    } else {
        SaveDataToLocalStorage();
    }

    getPosterURLAndSizes();

}

function calculateElapsedTime(savedDate) {
    let now = new Date(); // get the current time
    console.log(now);

    // calculate elapsed time
    let elapsedTime = now.getTime() - savedDate.getTime(); // this in milliseconds

    let seconds = Math.ceil(elapsedTime / 1000);
    console.log("Elapsed Time: " + seconds + " seconds");
    return seconds;
}

function getPosterURLAndSizes() {
    //https://api.themoviedb.org/3/configuration?api_key=<<api_key>>

    let url = `${movieDataBaseURL}configuration?api_key=${APIKEY}`;


    fetch(url)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            console.log(data);
            imageURL = data.images.secure_base_url;
            imageSizes = data.images.poster_sizes;

            console.log(imageURL);
            console.log(imageSizes);
            SaveDataToLocalStorage(imageSizes);
        })
        .catch(function (error) {
            console.log(error);
        })

}

function SaveDataToLocalStorage(imageSizes) {
    let now = new Date();
    localStorage.setItem('timeKey', now);

    localStorage.setItem('baseURL', movieDataBaseURL);

    localStorage.setItem('imageSizes', imageSizes);
}

function startSearch() {
    console.log("start search");
    searchString = document.getElementById("search-input").value;
    if (!searchString) {
        alert("Please enter search data");
        document.getElementById("search-input").focus();
        return;
    }

    // this is a new search so you should reset any existing page data

    getSearchResults();
}



function getSearchResults() {
    let url = `${movieDataBaseURL}search/movie?api_key=${APIKEY}&query=${searchString}`;

    fetch(url)
        .then(response => response.json())
        .then((data) => {
            console.log(data);

            //create the page from data
            createPage(data);

        })
        .catch((error) => console.log(error));
}

function createPage(data) {
    let content = document.querySelector("#search-results>.content");
    let title = document.querySelector("#search-results>.title");

    let message = document.createElement("h2");
    content.innerHTML = "";
    title.innerHTML = "";

    if (data.total_results == 0) {
        message.innerHTML = `No results found for ${searchString}`;
    } else {
        message.innerHTML = `Total Results = ${data.total_results} for ${searchString}`;
    }

    title.appendChild(message);

    let documentFragment = new DocumentFragment();

    documentFragment.appendChild(createMovieCards(data.results));

    content.appendChild(documentFragment);

    let cardList = document.querySelectorAll(".content>div");

    cardList.forEach(function (item) {
        item.addEventListener("click", getRecommendations);
    });
}


//////modal window//////
function showOverlay(e) {
    e.preventDefault();
    let overlay = document.querySelector(".overlay");
    overlay.classList.remove("hide");
    overlay.classList.add("show");
    showModal(e);
}

function showModal(e) {
    e.preventDefault();
    let modal = document.querySelector(".modal");
    modal.classList.remove("off");
    modal.classList.add("on");
}

function hideOverlay(e) {
    e.preventDefault();
    e.stopPropagation(); // don't allow clicks to pass through
    let overlay = document.querySelector(".overlay");
    overlay.classList.remove("show");
    overlay.classList.add("hide");
    hideModal(e);
}

function hideModal(e) {
    e.preventDefault();
    let modal = document.querySelector(".modal");
    modal.classList.remove("on");
    modal.classList.add("off");
}

//////modal window////////


/////make the cards/////



function createMovieCards(results) {
    let documentFragment = new DocumentFragment(); // use a documentFragment for performance

    results.forEach(function (movie) {

        let movieCard = document.createElement("div");
        let section = document.createElement("section");
        let image = document.createElement("img");
        let videoTitle = document.createElement("p");
        let videoDate = document.createElement("p");
        let videoRating = document.createElement("p");
        let videoOverview = document.createElement("p");

        // set up the content
        videoTitle.textContent = movie.title;
        videoDate.textContent = movie.release_date;
        videoRating.textContent = movie.vote_average;
        videoOverview.textContent = movie.overview;

        // set up image source URL
        image.src = `${imageURL}${imageSizes[2]}${movie.poster_path}`;

        // set up movie data attributes
        movieCard.setAttribute("data-title", movie.title);
        movieCard.setAttribute("data-id", movie.id);

        // set up class names
        movieCard.className = "movieCard";
        section.className = "imageSection";

        // append elements
        section.appendChild(image);
        movieCard.appendChild(section);
        movieCard.appendChild(videoTitle);
        movieCard.appendChild(videoDate);
        movieCard.appendChild(videoRating);
        movieCard.appendChild(videoOverview);

        documentFragment.appendChild(movieCard);
    });

    return documentFragment;

}

function getRecommendations() {
    //console.log(this);
    let movieTitle = this.getAttribute("data-title");

    searchString = movieTitle;

    let movieID = this.getAttribute("data-id");
    console.log("you clicked: " + movieTitle + " " + movieID);

    let url = `${movieDataBaseURL}movie/${movieID}/recommendations?api_key=${APIKEY}`;

    fetch(url)
        .then(response => response.json())
        .then((data) => {
            console.log(data);

            //create the page from data
            createPage(data);

        })
        .catch((error) => console.log(error));


}
})();
