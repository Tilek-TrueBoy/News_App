function customHttp() {
  return {
    get(url, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.addEventListener("load", () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error status Code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.response);
          cb(null, response);
        });

        xhr.addEventListener("error", () => {
          cb(`Error Status Code: ${xhr.status}`, xhr);
        });

        xhr.send();
      } catch (error) {
        cb(error);
      }
    },
    post(url, body, headers, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", url);

        xhr.addEventListener("load", () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error Status Code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.response);
          cb(null, response);
        });

        xhr.addEventListener("error", () => {
          cb(`Error Status Code: ${xhr.status}`, xhr);
        });

        if (headers) {
          Object.entries(headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value);
          });
        }

        xhr.send(JSON.stringify(body));
      } catch (error) {
        cb(error);
      }
    },
  };
}

// ! Elements UI

const form = document.forms["newsControls"];
const countrySelect = form.elements["country"];
const searchInput = form.elements["search"];

// ? Events

form.addEventListener("submit", (e) => {
  e.preventDefault();
  loadNews();
  form.reset();
});

// ? Init http module
const http = customHttp();

// ? service

const newsService = (function () {
  const apiKey = "91bd5dfb3c6043529270e07ebcff2172";
  const apiUrl = "https://news-api-v2.herokuapp.com";

  return {
    topHeadlines(country = "us", cb) {
      http.get(
        `${apiUrl}/top-headlines?country=${country}&category=technology&apiKey=${apiKey}`,
        cb
      );
    },
    everything(query, cb) {
      http.get(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`, cb);
    },
  };
})();

// ? Init select
document.addEventListener("DOMContentLoaded", () => {
  M.AutoInit();
  loadNews();
});

// ? load news function

function loadNews() {
  showLoader();

  const country = countrySelect.value;
  const searchText = searchInput.value;

  if (!searchText) {
    newsService.topHeadlines(country, onGetResponse);
  } else {
    newsService.everything(searchText, onGetResponse);
  }
}

// ? function on get response

function onGetResponse(err, news) {
  removeLoader();
  if (err) {
    showAlert(err, "error-msg");
    return;
  }

  if (!news.articles.length) {
    // show error
    return;
  }

  renderNews(news.articles);
}

// ? render news function

function renderNews(news) {
  const newsContainer = document.querySelector(".news-container .row");
  if (newsContainer.children.length) {
    clearContainer(newsContainer);
  }
  let fragment = "";

  news.forEach((newsItem) => {
    const el = newsTemplate(newsItem);
    fragment += el;
  });

  newsContainer.insertAdjacentHTML("afterbegin", fragment);
}

// ? function news template
function newsTemplate({ urlToImage, title, url, description } = {}) {
  return `
    <div class="col s12">
      <div class="card">
        <div class="card-image">
          <img src="${urlToImage}"/>
          <span class="card-title">${title}</span>
        </div>
        <div class="card-content">
          <p>${description}</p>
        </div>
        <div class="card-action">
            <a href="${url}">Read more</a>
        </div>
      </div>
    </div>
  `;
}

// ? function clear container

function clearContainer(container) {
  let child = container.lastElementChild;
  while (child) {
    container.removeChild(child);
    child = container.lastElementChild;
  }
}

// ? function show message
function showAlert(msg, type = "success") {
  M.toast({ html: msg, classes: type });
}

// ? function preloader
function showLoader() {
  document.body.insertAdjacentHTML(
    "afterbegin",
    `
  <div class="progress">
      <div class="indeterminate"></div>
  </div>
  `
  );
}

// ? function remove preloader
function removeLoader() {
  const loader = document.querySelector(".progress");
  if (loader) {
    loader.remove();
  }
}
