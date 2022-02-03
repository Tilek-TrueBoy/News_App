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
        xhr.open('POST', url);

        xhr.addEventListener('load', () => {
          if(Math.floor(xhr.status / 100) !== 2) {
            cb(`Error Status Code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.response);
          cb(null, response);
        });
        
        xhr.addEventListener('error', () => {
          cb(`Error Status Code: ${xhr.status}`, xhr);
        }); 

        if(headers) {
          Object.entries(headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value)
          });
        }

        xhr.send(JSON.stringify(body));
      } catch (error) {
        cb(error)
      }
    },
  };
}

// ? init http module

const http = customHttp();


const newsService = (function () {
  const apiKey = '91bd5dfb3c6043529270e07ebcff2172';
  const apiUrl = 'https://news-api-v2.herokuapp.com';

  return {
    topHeadlines(country = 'us', cb) {
      http.get(`${apiUrl}/top-headlines?country=${country}&category=technology&apiKey=${apiKey}`, cb)
    },
    everything(query, cb){
      http.get(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`, cb)
    },
  }

})();

// ? Init select

document.addEventListener('DOMContentLoaded', () => {
  M.AutoInit();
  loadNews();
});

// ? load news function

function loadNews() {
  newsService.topHeadlines('us', onGetResponse);
}

// ? on get response function

function onGetResponse(err,news) {
  renderNews(news.articles);
}

// ? function render news

function renderNews(news) {
  const container = document.querySelector('.news-container .row');
  let fragment = '';

  news.forEach(newsItem => {
    const el = newsTemplate(newsItem);
    fragment += el;
  });

  container.insertAdjacentHTML('afterbegin', fragment)
}

// ? news item template function 

function newsTemplate({ title, urlToImage, url, description} = {}){
  return `
    <div class="col s12">
      <div class="card">
        <div class="card-image">
          <img src="${urlToImage}">
          <span class="card-title">${title || ''}</span>
        </div>
        <div class="card-content">
          <p>${description || ''}</p>
        </div>
        <div class="card-action">
          <a href="${url}">Read More</a>
        </div>
      </div>
    </div>
  `;
}